import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { activatePayment } from '@/lib/subscription'
import { verifyWebhookSignature } from '@/lib/klikqris'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  
  const signature = request.headers.get('x-signature') || request.headers.get('signature') || ''
  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }
  
  let payload: { order_id: string; status: string; paid_at?: string; signature?: string }

  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const supabase = await createServiceClient()

  const { data: webhookLog } = await supabase
    .from('webhook_logs')
    .insert({ source: 'klikqris', event_type: payload.status, payload, status: 'processing' })
    .select('id')
    .single()

  try {
    if (payload.status === 'PAID') {
      const { order_id, paid_at } = payload

      const { data: claimedTx } = await supabase
        .from('transactions')
        .update({ status: 'success', paid_at: paid_at ?? new Date().toISOString() })
        .eq('gateway_transaction_id', order_id)
        .eq('status', 'pending')
        .select('*')
        .single()

      if (!claimedTx) {
        await supabase.from('webhook_logs')
          .update({ status: 'success', processed_at: new Date().toISOString() })
          .eq('id', webhookLog?.id)
        return NextResponse.json({ ok: true })
      }

      await activatePayment(supabase, claimedTx, paid_at ?? new Date().toISOString(), { skipTransactionUpdate: true })

      await supabase.from('webhook_logs')
        .update({ status: 'success', transaction_id: claimedTx.id, processed_at: new Date().toISOString() })
        .eq('id', webhookLog?.id)
    }

    if (payload.status === 'EXPIRED') {
      await supabase
        .from('transactions')
        .update({ status: 'expired' })
        .eq('gateway_transaction_id', payload.order_id)
        .eq('status', 'pending')

      await supabase.from('webhook_logs')
        .update({ status: 'success', processed_at: new Date().toISOString() })
        .eq('id', webhookLog?.id)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await supabase.from('webhook_logs')
      .update({ status: 'failed', error_message: message, processed_at: new Date().toISOString() })
      .eq('id', webhookLog?.id)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
