import { createHmac } from 'crypto'

const FLOW_API_KEY = process.env.FLOW_API_KEY!
const FLOW_SECRET = process.env.FLOW_SECRET_KEY!

function signParams(params: Record<string, string>): string {
  const sorted = Object.keys(params).sort()
  const toSign = sorted.map((k) => k + params[k]).join('')
  return createHmac('sha256', FLOW_SECRET).update(toSign).digest('hex')
}

export async function createFlowPayment(params: {
  orderId: string
  amount: number
  subject: string
  email: string
  urlReturn: string
  urlConfirmation: string
}): Promise<{ url: string; token: string }> {
  const flowParams: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    commerceOrder: params.orderId.slice(0, 32),
    subject: params.subject.slice(0, 255),
    currency: 'CLP',
    amount: String(Math.round(params.amount)),
    email: params.email,
    urlConfirmation: params.urlConfirmation,
    urlReturn: params.urlReturn,
    paymentMethod: '9', // Todos los medios
  }

  flowParams.s = signParams(flowParams)

  const formData = new URLSearchParams(flowParams)
  const res = await fetch('https://sandbox.flow.cl/api/payment/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  })

  const data = await res.json()
  if (data.code !== 0) {
    throw new Error(`Flow error ${data.code}: ${data.message}`)
  }

  return {
    url: `${data.url}?token=${data.token}`,
    token: data.token,
  }
}

export async function getFlowPaymentStatus(token: string) {
  const params: Record<string, string> = {
    apiKey: FLOW_API_KEY,
    token,
  }
  params.s = signParams(params)

  const res = await fetch(
    `https://sandbox.flow.cl/api/payment/getStatus?${new URLSearchParams(params)}`
  )
  if (!res.ok) throw new Error(`Flow getStatus HTTP ${res.status}`)
  return res.json()
}
