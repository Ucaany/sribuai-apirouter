import { createHmac, timingSafeEqual } from 'crypto'

const BASE_URL = process.env.KLIKQRIS_BASE_URL || 'https://klikqris.com/api/sandbox'

function getApiKey(): string {
  const key = process.env.KLIKQRIS_API_KEY
  if (!key) throw new Error('KLIKQRIS_API_KEY env var is not set')
  return key
}

export interface CreateTransactionParams {
  nominal: number
  keterangan: string
  refId: string
}

export interface TransactionResult {
  gatewayId: string
  qrString: string
  qrUrl: string
  expiredAt: string
}

export async function createQrisTransaction(
  params: CreateTransactionParams
): Promise<TransactionResult> {
  const response = await fetch(`${BASE_URL}/transaksi/buat`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      nominal: params.nominal,
      keterangan: params.keterangan,
      ref_id: params.refId,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`KlikQRIS error: ${error}`)
  }

  const data = await response.json()
  return {
    gatewayId: data.data.id,
    qrString: data.data.qr_string,
    qrUrl: data.data.qr_url,
    expiredAt: data.data.expired_at,
  }
}

export async function getTransactionStatus(gatewayId: string) {
  const response = await fetch(
    `${BASE_URL}/transaksi/status/${gatewayId}`,
    {
      headers: { Authorization: `Bearer ${getApiKey()}` },
    }
  )
  if (!response.ok) throw new Error('KlikQRIS status check failed')
  const data = await response.json()
  return data.data as {
    id: string
    status: 'pending' | 'success' | 'expired' | 'failed'
    paid_at?: string
    nominal: number
  }
}

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.KLIKQRIS_WEBHOOK_SECRET
  if (!secret) {
    console.error('[klikqris] KLIKQRIS_WEBHOOK_SECRET env var is not set — rejecting all webhooks')
    return false
  }

  const expected = createHmac('sha256', secret)
    .update(payload)
    .digest()

  const signatureBuf = Buffer.from(signature, 'hex')
  if (expected.length !== signatureBuf.length) return false

  return timingSafeEqual(expected, signatureBuf)
}
