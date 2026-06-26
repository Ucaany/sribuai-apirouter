import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { verifyWebhookSignature } from '@/lib/klikqris'
import { activatePayment } from '@/lib/subscription'

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-klikqris-signature') || ''

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody)
  const supabase = await createServiceClient()

  const { data: webhookLog } = await supabase
    .from('webhook_logs')
    .insert({ source: 'klikqris', event_type: payload.event, payload, status: 'processing' })
    .select('id')
    .single()

  try {
    if (payload.event === 'payment.success') {
      const { ref_id, paid_at } = payload.data

      const { data: claimedTx } = await supabase
        .from('transactions')
        .update({ status: 'success', paid_at })
        .eq('id', ref_id)
        .eq('status', 'pending')
        .select('*')
        .single()

      if (!claimedTx) {
        await supabase.from('webhook_logs')
          .update({ status: 'success', processed_at: new Date().toISOString() })
          .eq('id', webhookLog?.id)
        return NextResponse.json({ ok: true })
      }

      await activatePayment(supabase, claimedTx, paid_at, { skipTransactionUpdate: true })

      await supabase.from('webhook_logs')
          .update({ status: 'success', transaction_id: claimedTx.id, processed_at: new Date().toISOString() })
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
