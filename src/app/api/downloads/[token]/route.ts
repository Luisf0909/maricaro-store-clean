import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(req: Request, { params }: { params: { token: string } }) {
  try {
    const admin = createAdminClient()

    // Validate token exists and is not expired/exceeded
    const { data: tokenRecord, error: tokenError } = await admin
      .from('order_download_tokens')
      .select('*, products(digital_file_path, digital_file_name)')
      .eq('token', params.token)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (tokenError || !tokenRecord) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 403 }
      )
    }

    // Check if download limit exceeded
    if (tokenRecord.download_count >= tokenRecord.max_downloads) {
      return NextResponse.json(
        { error: 'Límite de descargas alcanzado' },
        { status: 403 }
      )
    }

    const product = tokenRecord.products as any
    if (!product?.digital_file_path) {
      return NextResponse.json(
        { error: 'Archivo no disponible' },
        { status: 404 }
      )
    }

    // Download file from storage
    const { data, error: downloadError } = await admin.storage
      .from('digital-products')
      .download(product.digital_file_path)

    if (downloadError || !data) {
      console.error('Storage download error:', downloadError)
      return NextResponse.json(
        { error: 'Error descargando archivo' },
        { status: 500 }
      )
    }

    // Increment download counter
    await admin
      .from('order_download_tokens')
      .update({ download_count: tokenRecord.download_count + 1 })
      .eq('id', tokenRecord.id)

    return new NextResponse(data, {
      headers: {
        'Content-Disposition': `attachment; filename="${product.digital_file_name || 'archivo'}"`,
        'Content-Type': 'application/octet-stream',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (err) {
    console.error('Download error:', err)
    return NextResponse.json(
      { error: 'Error procesando descarga' },
      { status: 500 }
    )
  }
}
