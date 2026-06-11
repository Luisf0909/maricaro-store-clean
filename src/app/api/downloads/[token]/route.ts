import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface Props {
  params: { token: string }
}

export async function GET(_req: Request, { params }: Props) {
  const admin = createAdminClient()

  // Fetch token
  const { data: tokenRow } = await admin
    .from('order_download_tokens')
    .select('*, products(name, digital_file_path, digital_file_name), orders(payment_status)')
    .eq('token', params.token)
    .single()

  if (!tokenRow) {
    return new NextResponse('Enlace de descarga no válido.', { status: 404 })
  }

  // Verify order is paid
  const order = tokenRow.orders as { payment_status: string } | null
  if (order?.payment_status !== 'paid') {
    return new NextResponse('El pago de este pedido aún no ha sido confirmado.', { status: 402 })
  }

  // Check expiry
  if (new Date(tokenRow.expires_at) < new Date()) {
    return new NextResponse('Este enlace de descarga ha expirado. Contacta a soporte.', { status: 410 })
  }

  // Check download count
  if (tokenRow.download_count >= tokenRow.max_downloads) {
    return new NextResponse('Has alcanzado el límite de descargas para este enlace.', { status: 429 })
  }

  const product = tokenRow.products as { digital_file_path: string | null; digital_file_name: string | null } | null

  if (!product?.digital_file_path) {
    return new NextResponse('El archivo de descarga no está disponible.', { status: 404 })
  }

  // Generate a short-lived signed URL (1 hour)
  const { data: signedData, error: signedError } = await admin.storage
    .from('digital-products')
    .createSignedUrl(product.digital_file_path, 3600)

  if (signedError || !signedData?.signedUrl) {
    return new NextResponse('Error al generar el enlace de descarga.', { status: 500 })
  }

  // Increment download count
  await admin
    .from('order_download_tokens')
    .update({ download_count: tokenRow.download_count + 1 })
    .eq('id', tokenRow.id)

  return NextResponse.redirect(signedData.signedUrl)
}
