import { adminGuard } from '@/lib/admin-guard'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const { router_model_id, prompt } = await request.json()
  if (!router_model_id) return NextResponse.json({ error: 'router_model_id required' }, { status: 400 })

  const baseUrl = process.env.NINEROUTER_BASE_URL
  const apiKey = process.env.NINEROUTER_API_KEY
  if (!baseUrl || !apiKey) return NextResponse.json({ error: 'Router not configured' }, { status: 500 })

  const start = Date.now()
  try {
    const res = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: router_model_id,
        messages: [{ role: 'user', content: prompt || 'Say "OK" in one word.' }],
        max_tokens: 50,
        stream: false,
      }),
    })

    const latency = Date.now() - start

    if (!res.ok) {
      const error = await res.text()
      return NextResponse.json({ success: false, error, latency }, { status: 200 })
    }

    const data = await res.json()
    const content = data.choices?.[0]?.message?.content ?? ''
    return NextResponse.json({ success: true, content, latency, model: data.model })
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err), latency: Date.now() - start }, { status: 200 })
  }
}
