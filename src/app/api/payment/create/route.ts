import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createQrisTransaction } from '@/lib/klikqris'

const PACKAGES: Record<string, { price: number; tokens: number; label: string }> = {
  starter: { price: 10000, tokens: 40_000_000, label: 'Starter - 40M Token (24 Jam)' },
  pro: { price: 15900, tokens: 80_000_000, label: 'Pro - 80M Token (24 Jam)' },
  ultra: { price: 20000, tokens: 150_000_000, label: 'Ultra - 150M Token (24 Jam)' },
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { tier } = await request.json()
  const pkg = PACKAGES[tier]
  if (!pkg) return NextResponse.json({ error: 'Invalid package' }, { status: 400 })

  const serviceClient = await createServiceClient()

  const { data: tx, error: txError } = await serviceClient
    .from('transactions')
    .insert({
      user_id: user.id,
      type: 'subscription',
      status: 'pending',
      amount_idr: pkg.price,
      description: pkg.label,
      metadata: { tier },
      expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    })
    .select('id')
    .single()

  if (txError || !tx) {
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }

  try {
    const qris = await createQrisTransaction({
      nominal: pkg.price,
      keterangan: pkg.label,
      refId: tx.id,
    })

    await serviceClient
      .from('transactions')
      .update({
        gateway_transaction_id: qris.gatewayId,
        gateway_qr_string: qris.qrString,
        gateway_payment_url: qris.qrUrl,
      })
      .eq('id', tx.id)

    return NextResponse.json({
      transaction_id: tx.id,
      qr_string: qris.qrString,
      qr_url: qris.qrUrl,
      amount_idr: pkg.price,
      description: pkg.label,
      expires_at: qris.expiredAt,
    })
  } catch {
    await serviceClient.from('transactions').update({ status: 'failed' }).eq('id', tx.id)
    return NextResponse.json({ error: 'Payment gateway error. Coba lagi.' }, { status: 503 })
  }
}
