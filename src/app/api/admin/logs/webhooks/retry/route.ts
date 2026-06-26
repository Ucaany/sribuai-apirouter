import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { activatePayment } from '@/lib/subscription'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const { logId } = await request.json()
  if (!logId) return NextResponse.json({ error: 'logId required' }, { status: 400 })

  const db = createServiceClient()

  const { data: log, error: logError } = await db
    .from('webhook_logs')
    .select('*')
    .eq('id', logId)
    .single()

  if (logError || !log) return NextResponse.json({ error: 'Webhook log not found' }, { status: 404 })

  if (log.status === 'success') {
    return NextResponse.json({ error: 'Webhook sudah berhasil diproses' }, { status: 400 })
  }

  await db.from('webhook_logs')
    .update({ status: 'processing', error_message: null })
    .eq('id', logId)

  try {
    const payload = log.payload as Record<string, unknown>

    if (payload.event === 'payment.success') {
      const data = payload.data as Record<string, string>
      const { ref_id, paid_at } = data

      const { data: claimedTx } = await db
        .from('transactions')
        .update({ status: 'success', paid_at })
        .eq('id', ref_id)
        .eq('status', 'pending')
        .select('*')
        .single()

      if (claimedTx) {
        await activatePayment(db, claimedTx, paid_at, { skipTransactionUpdate: true })
        await db.from('webhook_logs')
          .update({ status: 'success', transaction_id: claimedTx.id, processed_at: new Date().toISOString() })
          .eq('id', logId)
      } else {
        await db.from('webhook_logs')
          .update({ status: 'success', processed_at: new Date().toISOString() })
          .eq('id', logId)
      }
    } else {
      await db.from('webhook_logs')
        .update({ status: 'success', processed_at: new Date().toISOString() })
        .eq('id', logId)
    }

    return NextResponse.json({ success: true, retried: logId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    await db.from('webhook_logs')
      .update({ status: 'failed', error_message: message, processed_at: new Date().toISOString() })
      .eq('id', logId)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
