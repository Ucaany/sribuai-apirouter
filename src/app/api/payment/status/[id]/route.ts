import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { getTransactionStatus } from '@/lib/klikqris'
import { activatePayment } from '@/lib/subscription'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const serviceClient = await createServiceClient()

  const { data: tx } = await serviceClient
    .from('transactions')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })

  if (['success', 'failed', 'expired'].includes(tx.status)) {
    return NextResponse.json({ status: tx.status })
  }

  if (tx.gateway_transaction_id) {
    try {
      const gwStatus = await getTransactionStatus(tx.gateway_transaction_id)

      if (gwStatus.status === 'success') {
        // atomic claim — only activate if still pending to prevent double-activation
        const { data: claimedTx } = await serviceClient
          .from('transactions')
          .update({ status: 'success' })
          .eq('id', tx.id)
          .eq('status', 'pending')
          .select('*')
          .single()

        if (claimedTx) {
          await activatePayment(serviceClient, claimedTx, gwStatus.paid_at ?? new Date().toISOString(), { skipTransactionUpdate: true })
        }
        return NextResponse.json({ status: 'success' })
      }

      if (gwStatus.status === 'expired') {
        await serviceClient.from('transactions').update({ status: 'expired' }).eq('id', tx.id)
        return NextResponse.json({ status: 'expired' })
      }
    } catch {
      // KlikQRIS unreachable, return DB status
    }
  }

  return NextResponse.json({ status: tx.status })
}
