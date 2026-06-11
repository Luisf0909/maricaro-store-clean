import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import { Download, Clock, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Mis descargas | Maria Caro Store' }

export default async function DescargasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/cuenta/login?redirect=/cuenta/descargas')

  const admin = createAdminClient()

  const { data: tokens } = await admin
    .from('order_download_tokens')
    .select(`
      *,
      products(name, digital_file_name),
      orders!inner(order_number, user_id)
    `)
    .eq('orders.user_id', user.id)
    .order('created_at', { ascending: false })

  const now = new Date()

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-8">
        <Download className="h-5 w-5 text-blue-500" />
        <div>
          <h1 className="font-cormorant font-light text-3xl text-gray-900">Mis descargas</h1>
          <p className="text-sm text-gray-500 mt-0.5">Accede a tus productos digitales comprados</p>
        </div>
      </div>

      {!tokens?.length ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Download className="h-12 w-12 text-gray-200 mb-4" />
          <h3 className="font-semibold text-gray-700 mb-2">Sin descargas disponibles</h3>
          <p className="text-sm text-gray-400 mb-6">
            Aquí aparecerán los productos digitales que hayas comprado.
          </p>
          <Link
            href="/productos?digital=true"
            className="px-5 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 transition-colors"
          >
            Ver productos digitales
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map(token => {
            const expired    = new Date(token.expires_at) < now
            const exhausted  = token.download_count >= token.max_downloads
            const available  = !expired && !exhausted

            return (
              <div
                key={token.id}
                className="bg-white rounded-xl border border-gray-100 p-5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`p-2.5 rounded-lg flex-shrink-0 ${available ? 'bg-blue-50' : 'bg-gray-50'}`}>
                    <Download className={`h-5 w-5 ${available ? 'text-blue-500' : 'text-gray-300'}`} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">
                      {token.products?.name ?? 'Producto digital'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Pedido {(token.orders as { order_number: string })?.order_number}
                      {' · '}
                      {token.download_count}/{token.max_downloads} descargas usadas
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      {available ? (
                        <>
                          <Clock className="h-3 w-3 text-amber-500" />
                          <span className="text-[10px] text-amber-600">
                            Vence {new Date(token.expires_at).toLocaleDateString('es-CL')}
                          </span>
                        </>
                      ) : expired ? (
                        <>
                          <XCircle className="h-3 w-3 text-red-400" />
                          <span className="text-[10px] text-red-500">Enlace vencido</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-gray-400" />
                          <span className="text-[10px] text-gray-400">Descargas agotadas</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {available ? (
                  <a
                    href={`/api/downloads/${token.token}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Descargar
                  </a>
                ) : (
                  <span className="flex-shrink-0 px-4 py-2 bg-gray-100 text-gray-400 text-sm rounded-lg">
                    No disponible
                  </span>
                )}
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-8 text-center">
        ¿Problemas con una descarga?{' '}
        <Link href="mailto:hola@mariacarostore.cl" className="underline hover:text-warm-600">
          Contáctanos
        </Link>
      </p>
    </div>
  )
}
