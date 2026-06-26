import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { validateApiKey } from '@/lib/api-key'
import { logUsage } from '@/lib/usage-logger'
import { checkRateLimit } from '@/lib/rate-limiter'

const NINEROUTER_BASE_URL = process.env.NINEROUTER_BASE_URL || 'http://localhost:20128'
const NINEROUTER_API_KEY = process.env.NINEROUTER_API_KEY
if (!NINEROUTER_API_KEY) {
  throw new Error('NINEROUTER_API_KEY environment variable is required')
}

async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const startTime = Date.now()
  const resolvedParams = await params
  const path = resolvedParams.path.join('/')
  const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'

  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json(
      { error: { message: 'Missing API key', type: 'authentication_error' } },
      { status: 401 }
    )
  }

  const apiKeyRaw = authHeader.substring(7)

  if (!(await checkRateLimit(clientIp)).allowed) {
    return NextResponse.json(
      { error: { message: 'Too many requests', type: 'rate_limit_error' } },
      { status: 429 }
    )
  }

  const supabase = await createServiceClient()
  const validation = await validateApiKey(apiKeyRaw, supabase)

  if (!validation.valid) {
    return NextResponse.json(
      { error: { message: validation.error, type: 'authentication_error' } },
      { status: 401 }
    )
  }

  const { userId, apiKeyId, profile } = validation

  if (profile.subscription_expires_at && new Date(profile.subscription_expires_at) < new Date()) {
    await supabase
      .from('profiles')
      .update({ subscription_status: 'expired', tier: 'none', token_pool_remaining: 0 })
      .eq('id', userId)
    return NextResponse.json(
      { error: { message: 'Paket 24 jam telah berakhir. Beli paket baru untuk lanjutkan.', type: 'subscription_expired' } },
      { status: 401 }
    )
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: { message: 'Invalid JSON body', type: 'invalid_request_error' } },
      { status: 400 }
    )
  }

  const estimatedTokens = typeof body.max_tokens === 'number' && body.max_tokens > 0
    ? body.max_tokens
    : 4096

  const { data: quotaResult } = await supabase.rpc('check_and_use_quota', {
    p_user_id: userId,
    p_tokens_requested: estimatedTokens,
  })

  const quota = quotaResult as { allowed: boolean; reason?: string; token_remaining?: number; tier?: string } | null

  if (!quota?.allowed) {
    return NextResponse.json(
      {
        error: {
          message: quota?.reason || 'Token pool habis. Beli paket baru.',
          type: 'token_pool_exhausted',
          token_remaining: quota?.token_remaining ?? 0,
          tier: quota?.tier,
        },
      },
      { status: 429 }
    )
  }

  const requestedModel = body.model as string
  const { data: modelConfig } = await supabase
    .from('model_configs')
    .select('router_model_id, is_active')
    .eq('model_id', requestedModel)
    .single()

  if (modelConfig?.is_active && modelConfig.router_model_id) {
    body = { ...body, model: modelConfig.router_model_id }
  }

  const isStreaming = body.stream === true
  let statusCode = 200
  let promptTokens = 0
  let completionTokens = 0
  let errorMessage: string | undefined

  try {
    const upstreamResponse = await fetch(`${NINEROUTER_BASE_URL}/v1/${path}`, {
      method: request.method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${NINEROUTER_API_KEY}`,
        'X-Request-ID': crypto.randomUUID(),
        'X-User-ID': userId,
      },
      body: JSON.stringify(body),
    })

    statusCode = upstreamResponse.status

    if (!upstreamResponse.ok) {
      const errorBody = await upstreamResponse.text()
      errorMessage = errorBody
      await logUsage(supabase, {
        userId, apiKeyId,
        model: requestedModel, provider: '9router', endpoint: `/${path}`,
        promptTokens: 0, completionTokens: 0, totalTokens: 0,
        statusCode, responseTimeMs: Date.now() - startTime,
        isStreaming, errorMessage, ipAddress: clientIp,
        userAgent: request.headers.get('user-agent') || undefined,
      })
      return new Response(errorBody, { status: statusCode, headers: { 'Content-Type': 'application/json' } })
    }

    if (isStreaming) {
      const { readable, writable } = new TransformStream()
      const writer = writable.getWriter()
      const encoder = new TextEncoder()

      ;(async () => {
        const reader = upstreamResponse.body!.getReader()
        const decoder = new TextDecoder()
        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            for (const line of chunk.split('\n')) {
              if (line.startsWith('data: ') && !line.includes('[DONE]')) {
                try {
                  const d = JSON.parse(line.substring(6))
                  if (d.usage) {
                    promptTokens = d.usage.prompt_tokens || 0
                    completionTokens = d.usage.completion_tokens || 0
                  }
                } catch { }
              }
            }
            await writer.write(encoder.encode(chunk))
          }
        } finally {
          await writer.close()
          await logUsage(supabase, {
            userId, apiKeyId,
            model: requestedModel, provider: '9router', endpoint: `/${path}`,
            promptTokens, completionTokens, totalTokens: promptTokens + completionTokens,
            statusCode, responseTimeMs: Date.now() - startTime,
            isStreaming: true, ipAddress: clientIp,
            userAgent: request.headers.get('user-agent') || undefined,
          })
        }
      })()

      return new Response(readable, {
        headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' },
      })
    }

    const responseData = await upstreamResponse.json()
    promptTokens = responseData.usage?.prompt_tokens || 0
    completionTokens = responseData.usage?.completion_tokens || 0

    await logUsage(supabase, {
      userId, apiKeyId,
      model: requestedModel, provider: '9router', endpoint: `/${path}`,
      promptTokens, completionTokens, totalTokens: promptTokens + completionTokens,
      statusCode, responseTimeMs: Date.now() - startTime,
      isStreaming: false, ipAddress: clientIp,
      userAgent: request.headers.get('user-agent') || undefined,
    })

    return NextResponse.json(responseData)

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Upstream error'
    await logUsage(supabase, {
      userId, apiKeyId,
      model: requestedModel, provider: '9router', endpoint: `/${path}`,
      promptTokens: 0, completionTokens: 0, totalTokens: 0,
      statusCode: 502, responseTimeMs: Date.now() - startTime,
      isStreaming, errorMessage: message, ipAddress: clientIp,
    })
    return NextResponse.json(
      { error: { message: 'Gateway error', type: 'server_error' } },
      { status: 502 }
    )
  }
}

export const GET = handler
export const POST = handler
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
