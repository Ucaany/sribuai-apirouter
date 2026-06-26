import { useState, useEffect } from 'react'

export type PaymentStatus = 'pending' | 'success' | 'expired' | 'failed'

export function usePaymentStatus(transactionId: string | null) {
  const [status, setStatus] = useState<PaymentStatus>('pending')

  useEffect(() => {
    if (!transactionId) return
    if (status !== 'pending') return

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/payment/status/${transactionId}`)
        const data = await res.json()

        if (data.status !== 'pending') {
          setStatus(data.status as PaymentStatus)
          clearInterval(interval)
        }
      } catch {
        // network error, keep polling
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [transactionId, status])

  return status
}
