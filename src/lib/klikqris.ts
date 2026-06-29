const BASE_URL = process.env.KLIKQRIS_BASE_URL || 'https://klikqris.com/api'

function getCredentials(): { apiKey: string; merchantId: string } {
  const apiKey = process.env.KLIKQRIS_API_KEY
  const merchantId = process.env.KLIKQRIS_MERCHANT_ID
  if (!apiKey) throw new Error('KLIKQRIS_API_KEY env var is not set')
  if (!merchantId) throw new Error('KLIKQRIS_MERCHANT_ID env var is not set')
  return { apiKey, merchantId }
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
  const { apiKey, merchantId } = getCredentials()

  const response = await fetch(`${BASE_URL}/qris/create`, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'id_merchant': merchantId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      order_id: params.refId,
      amount: params.nominal,
      id_merchant: merchantId,
      keterangan: params.keterangan,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`KlikQRIS error: ${error}`)
  }

  const data = await response.json()
  if (!data.status) throw new Error(`KlikQRIS error: ${data.message}`)

  return {
    gatewayId: data.data.order_id,
    qrString: data.data.signature,
    qrUrl: data.data.qris_url,
    expiredAt: data.data.expired_at,
  }
}

export async function getTransactionStatus(orderId: string) {
  const { apiKey, merchantId } = getCredentials()

  const response = await fetch(`${BASE_URL}/qris/status/${orderId}`, {
    headers: {
      'x-api-key': apiKey,
      'id_merchant': merchantId,
    },
  })
  if (!response.ok) throw new Error('KlikQRIS status check failed')
  const data = await response.json()
  return data.data as {
    order_id: string
    status: 'PENDING' | 'SUCCESS' | 'EXPIRED'
    paid_at?: string
    total_amount: number
  }
}

import { createHmac } from 'crypto'

export function verifyWebhookSignature(payload: string, signature: string): boolean {
  const webhookSecret = process.env.KLIKQRIS_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.warn('[klikqris] KLIKQRIS_WEBHOOK_SECRET not set, skipping signature verification')
    return true
  }
  
  const expectedSignature = createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}
