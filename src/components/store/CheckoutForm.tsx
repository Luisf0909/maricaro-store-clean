'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useCartStore } from '@/lib/store/cart'
import { formatCLP, getShippingCost } from '@/lib/utils'
import { validateRUT, formatRUT, normalizeRUT } from '@/lib/rut'
import { toast } from 'sonner'
import { CouponInput } from '@/components/store/CouponInput'
import {
  ChevronDown, ChevronUp, ShoppingBag, Lock,
  Truck, BadgeCheck, CreditCard, Download,
} from 'lucide-react'
import type { ChileRegion, Coupon } from '@/types'

interface CheckoutFormProps {
  regions: ChileRegion[]
  isGuest?: boolean
  userEmail?: string | null
}

function SectionHeader({ n, title }: { n: number; title: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <span className="flex-shrink-0 w-7 h-7 rounded-full bg-warm-800 text-cream-50 text-xs font-semibold flex items-center justify-center">
        {n}
      </span>
      <h2 className="font-semibold text-gray-800">{title}</h2>
    </div>
  )
}

function FieldError({ msg }: { msg: string }) {
  return <p className="text-xs text-red-500 mt-1">{msg}</p>
}

export function CheckoutForm({ regions, isGuest = false, userEmail }: CheckoutFormProps) {
  const { items, getTotal, clearCart } = useCartStore()

  const [mode,          setMode]          = useState<'account' | 'guest'>(isGuest ? 'guest' : 'account')
  const [paymentMethod, setPaymentMethod] = useState<'flow_webpay' | 'mercadopago'>('flow_webpay')
  const [coupon,        setCoupon]        = useState<{ coupon: Coupon; discountAmount: number } | null>(null)
  const [loading,       setLoading]       = useState(false)
  const [summaryOpen,   setSummaryOpen]   = useState(false)
  const [acceptsMkt,    setAcceptsMkt]    = useState(false)
  const [errors,        setErrors]        = useState<Record<string, string>>({})

  const [form, setForm] = useState({
    email:     userEmail ?? '',
    rut:       '',
    phone:     '',
    full_name: '',
    address:   '',
    apartment: '',
    city:      '',
    region:    '',
    zip_code:  '',
    notes:     '',
  })

  const upd = useCallback((k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }))
    setErrors((e) => { const n = { ...e }; delete n[k]; return n })
  }, [])

  function handleRutChange(raw: string) {
    const clean = raw.replace(/[^0-9kK]/g, '').slice(0, 9)
    upd('rut', clean)
  }
  function handleRutBlur() {
    if (!form.rut) return
    if (!validateRUT(form.rut)) {
      setErrors((e) => ({ ...e, rut: 'RUT inválido. Ej: 12.345.678-9' }))
    } else {
      setErrors((e) => { const n = { ...e }; delete n.rut; return n })
      upd('rut', formatRUT(form.rut))
    }
  }

  function handlePhoneChange(raw: string) {
    upd('phone', raw.replace(/\D/g, '').slice(0, 11))
  }
  function displayPhone(v: string) {
    if (!v) return ''
    if (v.startsWith('569')) return `+56 9 ${v.slice(3, 7)} ${v.slice(7)}`
    if (v.startsWith('9'))   return `+56 9 ${v.slice(1, 5)} ${v.slice(5)}`
    return v
  }

  const subtotal   = getTotal()
  const allDigital = items.every((i) => i.isDigital)
  const shipping   = allDigital ? 0 : getShippingCost(subtotal)
  const discount   = coupon?.discountAmount ?? 0
  const total      = subtotal + shipping - discount

  function validate(): boolean {
    const e: Record<string, string> = {}
    if (mode === 'guest' && !form.email)                        e.email     = 'Correo requerido'
    if (mode === 'guest' && !form.rut)                          e.rut       = 'RUT requerido'
    if (mode === 'guest' && form.rut && !validateRUT(form.rut)) e.rut       = 'RUT inválido'
    if (!form.full_name)                                        e.full_name = 'Nombre requerido'
    if (!form.phone)                                            e.phone     = 'Teléfono requerido'
    if (!allDigital) {
      if (!form.address) e.address = 'Dirección requerida'
      if (!form.city)    e.city    = 'Ciudad requerida'
      if (!form.region)  e.region  = 'Región requerida'
    }
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) { toast.error('Completa los campos requeridos'); return }
    setLoading(true)
    try {
      const regionName = regions.find((r) => r.id.toString() === form.region)?.name ?? form.region

      const payload: Record<string, unknown> = {
        items,
        shipping: {
          full_name: form.full_name,
          phone:     form.phone,
          address:   form.address   || 'Producto digital',
          apartment: form.apartment || undefined,
          city:      form.city      || 'N/A',
          region:    regionName     || 'Digital',
          zip_code:  form.zip_code  || undefined,
        },
        payment_method:    paymentMethod,
        customer_notes:    form.notes || undefined,
        accepts_marketing: acceptsMkt,
      }

      if (mode === 'guest') {
        payload.is_guest       = true
        payload.customer_email = form.email.toLowerCase()
        payload.customer_rut   = normalizeRUT(form.rut)
      }

      if (coupon) {
        payload.coupon_code     = coupon.coupon.code
        payload.coupon_id       = coupon.coupon.id
        payload.coupon_discount = coupon.discountAmount
        if (!payload.customer_email) payload.customer_email = form.email.toLowerCase()
        if (!payload.customer_rut)   payload.customer_rut   = normalizeRUT(form.rut)
      }

      const orderRes = await fetch('/api/pedidos', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      })
      if (!orderRes.ok) { const err = await orderRes.json(); throw new Error(err.error ?? 'Error al crear el pedido') }
      const { orderId } = await orderRes.json()

      const payRes = await fetch(
        `/api/pagos/${paymentMethod === 'mercadopago' ? 'mercadopago' : 'flow'}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ orderId }) }
      )
      if (!payRes.ok) throw new Error('Error al iniciar el pago')

      const { redirectUrl } = await payRes.json()
      clearCart()
      window.location.href = redirectUrl
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Error al procesar')
      setLoading(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center py-24 gap-4 text-center">
        <ShoppingBag className="h-14 w-14 text-cream-300" />
        <p className="text-muted-foreground">Tu carrito está vacío.</p>
        <Link href="/productos" className="text-warm-700 underline text-sm">Ver productos</Link>
      </div>
    )
  }

  const fi = (extra = '') =>
    `w-full px-3.5 py-2.5 rounded-lg border text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white ${extra}`
  const lb = 'block text-xs font-medium text-gray-600 mb-1.5'

  const OrderSummary = () => (
    <div className="space-y-5">
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={`${item.productId}-${item.variantId}`} className="flex gap-3 items-start">
            <div className="relative w-14 h-14 flex-shrink-0 rounded-lg overflow-hidden bg-cream-100 border border-cream-200">
              {item.imageUrl ? (
                <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {item.isDigital
                    ? <Download className="h-5 w-5 text-blue-300" />
                    : <ShoppingBag className="h-5 w-5 text-warm-200" />}
                </div>
              )}
              <span className="absolute -top-1.5 -right-1.5 bg-warm-700 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 leading-snug truncate">{item.name}</p>
              {item.variantName && <p className="text-xs text-gray-400">{item.variantName}</p>}
              {item.isDigital && (
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-0.5">
                  <Download className="h-2.5 w-2.5" /> Digital
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-700 flex-shrink-0">{formatCLP(item.price * item.quantity)}</p>
          </li>
        ))}
      </ul>

      <div className="border-t border-gray-100 pt-4">
        <CouponInput
          email={form.email} rut={form.rut} subtotal={subtotal}
          appliedCoupon={coupon}
          onApply={(c, d) => setCoupon({ coupon: c, discountAmount: d })}
          onRemove={() => setCoupon(null)}
        />
      </div>

      <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span><span>{formatCLP(subtotal)}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Envío</span>
          <span className={shipping === 0 ? 'text-green-600 font-medium' : ''}>
            {shipping === 0 ? (allDigital ? 'Descarga · Gratis' : 'Gratis') : formatCLP(shipping)}
          </span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Descuento ({coupon!.coupon.code})</span>
            <span>−{formatCLP(discount)}</span>
          </div>
        )}
        <div className="flex justify-between font-bold text-base pt-2 border-t border-gray-100">
          <span className="text-gray-800">Total</span>
          <span className="text-warm-800 text-lg">{formatCLP(total)}</span>
        </div>
        <p className="text-[10px] text-gray-400">Precios con IVA incluido</p>
      </div>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>

      {/* Mobile collapsible summary */}
      <div className="lg:hidden mb-6 border border-gray-200 rounded-xl overflow-hidden bg-white">
        <button
          type="button"
          onClick={() => setSummaryOpen((o) => !o)}
          className="flex items-center justify-between w-full px-4 py-3.5 text-sm"
        >
          <span className="flex items-center gap-2 text-warm-700 font-medium">
            <ShoppingBag className="h-4 w-4" />
            {summaryOpen ? 'Ocultar resumen' : 'Ver resumen del pedido'}
          </span>
          <span className="flex items-center gap-2">
            <span className="font-bold text-gray-800">{formatCLP(total)}</span>
            {summaryOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
          </span>
        </button>
        {summaryOpen && <div className="px-4 pb-5 border-t border-gray-100"><OrderSummary /></div>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0">

        {/* ─── LEFT: Form ─── */}
        <div className="lg:pr-10 space-y-6 pb-12">

          {/* Progress */}
          <div className="hidden md:flex items-center text-xs gap-0">
            {[{ n: 1, l: 'Contacto' }, { n: 2, l: allDigital ? 'Pago' : 'Envío' }, { n: 3, l: 'Pago' }]
              .slice(0, allDigital ? 2 : 3)
              .map((s, i, arr) => (
                <div key={s.n} className="flex items-center">
                  <span className="flex items-center gap-1.5 text-warm-700 font-medium">
                    <span className="w-5 h-5 rounded-full bg-warm-700 text-white text-[10px] flex items-center justify-center">{s.n}</span>
                    {s.l}
                  </span>
                  {i < arr.length - 1 && <div className="h-px w-8 bg-gray-200 mx-2" />}
                </div>
              ))}
          </div>

          {/* Guest/account toggle */}
          {isGuest && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-1 flex">
              {[
                { id: 'guest', label: 'Continuar como invitado' },
                { id: 'account', label: 'Iniciar sesión' },
              ].map((opt) => (
                <button
                  key={opt.id} type="button"
                  onClick={() => setMode(opt.id as 'account' | 'guest')}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    mode === opt.id ? 'bg-white shadow-sm text-warm-800' : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Login redirect */}
          {isGuest && mode === 'account' && (
            <div className="bg-cream-50 border border-cream-200 rounded-xl p-8 text-center">
              <p className="text-sm text-gray-600 mb-4">Inicia sesión para continuar</p>
              <a href="/cuenta/login?redirect=/checkout" className="inline-block bg-warm-700 hover:bg-warm-800 text-cream-50 font-semibold px-7 py-2.5 rounded-full text-sm transition-colors">
                Iniciar sesión
              </a>
              <p className="text-xs text-gray-400 mt-3">
                ¿Sin cuenta? <a href="/cuenta/registro" className="text-warm-700 underline">Regístrate gratis</a>
              </p>
            </div>
          )}

          {(mode === 'guest' || !isGuest) && (
            <>
              {/* ── 1. CONTACTO ── */}
              <section className="bg-white border border-gray-200 rounded-2xl p-6">
                <SectionHeader n={1} title="Información de contacto" />
                <div className="space-y-4">
                  {mode === 'guest' ? (
                    <div>
                      <label className={lb}>Correo electrónico *</label>
                      <input type="email" autoComplete="email" value={form.email} onChange={(e) => upd('email', e.target.value)}
                        placeholder="tu@correo.cl" className={fi(errors.email ? 'border-red-400' : 'border-gray-200')} />
                      {errors.email && <FieldError msg={errors.email} />}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-gray-50 border border-gray-200 text-sm">
                      <BadgeCheck className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-gray-700 font-medium truncate">{userEmail ?? 'Sesión iniciada'}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {mode === 'guest' && (
                      <div>
                        <label className={lb}>RUT *</label>
                        <input value={form.rut} onChange={(e) => handleRutChange(e.target.value)} onBlur={handleRutBlur}
                          placeholder="12345678K" autoComplete="off"
                          className={fi(errors.rut ? 'border-red-400' : 'border-gray-200')} />
                        {errors.rut && <FieldError msg={errors.rut} />}
                      </div>
                    )}
                    <div className={mode === 'guest' ? '' : 'col-span-2'}>
                      <label className={lb}>Teléfono *</label>
                      <input type="tel" autoComplete="tel" value={displayPhone(form.phone)}
                        onChange={(e) => handlePhoneChange(e.target.value)} placeholder="+56 9 1234 5678"
                        className={fi(errors.phone ? 'border-red-400' : 'border-gray-200')} />
                      {errors.phone && <FieldError msg={errors.phone} />}
                    </div>
                  </div>

                  <div>
                    <label className={lb}>Nombre completo *</label>
                    <input autoComplete="name" value={form.full_name} onChange={(e) => upd('full_name', e.target.value)}
                      placeholder="María González" className={fi(errors.full_name ? 'border-red-400' : 'border-gray-200')} />
                    {errors.full_name && <FieldError msg={errors.full_name} />}
                  </div>
                </div>
              </section>

              {/* ── 2. ENVÍO ── */}
              {!allDigital ? (
                <section className="bg-white border border-gray-200 rounded-2xl p-6">
                  <SectionHeader n={2} title="Dirección de envío" />
                  <div className="space-y-4">
                    <div>
                      <label className={lb}>Calle y número *</label>
                      <input autoComplete="street-address" value={form.address} onChange={(e) => upd('address', e.target.value)}
                        placeholder="Av. Providencia 1234" className={fi(errors.address ? 'border-red-400' : 'border-gray-200')} />
                      {errors.address && <FieldError msg={errors.address} />}
                    </div>

                    <div>
                      <label className={lb}>Depto / Casa / Oficina</label>
                      <input value={form.apartment} onChange={(e) => upd('apartment', e.target.value)}
                        placeholder="Apto 4B" className={fi('border-gray-200')} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={lb}>Ciudad / Comuna *</label>
                        <input autoComplete="address-level2" value={form.city} onChange={(e) => upd('city', e.target.value)}
                          placeholder="Santiago" className={fi(errors.city ? 'border-red-400' : 'border-gray-200')} />
                        {errors.city && <FieldError msg={errors.city} />}
                      </div>
                      <div>
                        <label className={lb}>Código postal</label>
                        <input autoComplete="postal-code" value={form.zip_code} onChange={(e) => upd('zip_code', e.target.value)}
                          placeholder="7500000" className={fi('border-gray-200')} />
                      </div>
                    </div>

                    <div>
                      <label className={lb}>Región *</label>
                      <select value={form.region} onChange={(e) => upd('region', e.target.value)}
                        className={fi(errors.region ? 'border-red-400' : 'border-gray-200')}>
                        <option value="">Selecciona tu región...</option>
                        {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                      {errors.region && <FieldError msg={errors.region} />}
                    </div>

                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100 text-sm text-green-700">
                      <Truck className="h-4 w-4 flex-shrink-0" />
                      {shipping === 0
                        ? <span>¡Envío gratis! (compras sobre {formatCLP(50000)})</span>
                        : <span>Costo de envío: <strong>{formatCLP(shipping)}</strong></span>}
                    </div>

                    <div>
                      <label className={lb}>Instrucciones de entrega (opcional)</label>
                      <textarea rows={2} value={form.notes} onChange={(e) => upd('notes', e.target.value)}
                        placeholder="Horario, timbre, referencias..." className={fi('border-gray-200 resize-none')} />
                    </div>
                  </div>
                </section>
              ) : (
                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <Download className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-blue-800 text-sm">Pedido 100% digital — sin envío físico</p>
                    <p className="text-xs text-blue-500 mt-0.5">Recibirás el enlace de descarga en la página de confirmación.</p>
                  </div>
                </div>
              )}

              {/* ── 3. PAGO ── */}
              <section className="bg-white border border-gray-200 rounded-2xl p-6">
                <SectionHeader n={allDigital ? 2 : 3} title="Método de pago" />
                <div className="space-y-3">
                  {[
                    { id: 'flow_webpay', name: 'Webpay (Transbank)',  desc: 'Tarjetas débito y crédito — todos los bancos chilenos' },
                    { id: 'mercadopago', name: 'Mercado Pago',         desc: 'Tarjeta, transferencia bancaria, cuotas y más' },
                  ].map((m) => (
                    <label key={m.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === m.id
                          ? 'border-warm-500 bg-warm-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input type="radio" name="payment" value={m.id}
                        checked={paymentMethod === m.id as typeof paymentMethod}
                        onChange={() => setPaymentMethod(m.id as typeof paymentMethod)}
                        className="accent-warm-700 flex-shrink-0" />
                      <div className={`p-2 rounded-lg flex-shrink-0 ${paymentMethod === m.id ? 'bg-warm-100' : 'bg-gray-100'}`}>
                        <CreditCard className={`h-4 w-4 ${paymentMethod === m.id ? 'text-warm-700' : 'text-gray-400'}`} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{m.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{m.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </section>

              {/* Marketing opt-in */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-0.5 flex-shrink-0">
                  <input type="checkbox" checked={acceptsMkt} onChange={(e) => setAcceptsMkt(e.target.checked)} className="sr-only" />
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                    acceptsMkt ? 'bg-warm-700 border-warm-700' : 'border-gray-300 group-hover:border-warm-400'
                  }`}>
                    {acceptsMkt && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-700 font-medium">Quiero recibir novedades y ofertas exclusivas</p>
                  <p className="text-xs text-gray-400 mt-0.5">Devocionales, lanzamientos y descuentos para la comunidad. Sin spam.</p>
                </div>
              </label>

              {/* CTA */}
              <button
                type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 bg-warm-800 hover:bg-warm-900 disabled:opacity-60 text-cream-50 font-semibold py-4 rounded-xl text-base transition-all shadow-lg shadow-warm-900/20 hover:-translate-y-0.5"
              >
                <Lock className="h-4 w-4" />
                {loading ? 'Procesando...' : `Confirmar pedido — ${formatCLP(total)}`}
              </button>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-gray-400 pt-1">
                <span className="flex items-center gap-1.5"><Lock className="h-3 w-3" /> Pago seguro SSL</span>
                <span className="flex items-center gap-1.5"><BadgeCheck className="h-3 w-3" /> Compra garantizada</span>
                <span className="flex items-center gap-1.5"><Truck className="h-3 w-3" /> Despacho a todo Chile</span>
              </div>
            </>
          )}
        </div>

        {/* ─── RIGHT: Sticky summary ─── */}
        <div className="hidden lg:block">
          <div className="sticky top-20 bg-gray-50/80 border-l border-gray-200 px-8 py-8 min-h-full">
            <h2 className="font-semibold text-gray-800 mb-6 flex items-center gap-2 text-sm">
              <ShoppingBag className="h-4 w-4 text-warm-600" />
              Tu pedido
              <span className="ml-auto text-xs text-gray-400 font-normal">
                {items.reduce((s, i) => s + i.quantity, 0)} {items.length === 1 ? 'artículo' : 'artículos'}
              </span>
            </h2>
            <OrderSummary />
          </div>
        </div>
      </div>
    </form>
  )
}
