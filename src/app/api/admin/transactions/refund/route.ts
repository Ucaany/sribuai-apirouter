import { adminGuard } from '@/lib/admin-guard'
import { createServiceClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const guard = await adminGuard()
  if (guard) return guard

  const db = createServiceClient()
  const { transactionId, reason } = await request.json()

  const { data: tx, error: txError } = await db
    .from('transactions')
    .select('*')
    .eq('id', transactionId)
    .single()

  if (txError || !tx) return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
  if (tx.status !== 'success') return NextResponse.json({ error: 'Only successful transactions can be refunded' }, { status: 400 })

  const { error } = await db
    .from('transactions')
    .update({ status: 'refund' as never, description: reason ?? 'Manual refund by admin' })
    .eq('id', transactionId)
    .eq('status', 'success')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ success: true })
}
