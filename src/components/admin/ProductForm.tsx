'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { ImageUpload } from './ImageUpload'
import { Upload, FileText, X } from 'lucide-react'
import type { ProductWithImages, Category, ProductImage } from '@/types'

interface ProductFormProps {
  product?: ProductWithImages
  categories: Category[]
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function ProductForm({ product, categories }: ProductFormProps) {
  const router = useRouter()
  const isEdit = !!product

  const [form, setForm] = useState({
    name:              product?.name              ?? '',
    slug:              product?.slug              ?? '',
    description:       product?.description       ?? '',
    price:             product?.price?.toString() ?? '',
    compare_price:     product?.compare_price?.toString() ?? '',
    stock:             product?.stock?.toString() ?? '0',
    made_to_order:     product?.made_to_order     ?? false,
    is_digital:        product?.is_digital        ?? false,
    digital_file_name: product?.digital_file_name ?? '',
    category_id:       product?.category_id       ?? '',
    sku:               product?.sku               ?? '',
    is_featured:       product?.is_featured       ?? false,
    is_active:         product?.is_active         ?? true,
    meta_title:        product?.meta_title        ?? '',
    meta_description:  product?.meta_description  ?? '',
    video_url:         product?.video_url         ?? '',
  })

  const [images,           setImages]           = useState<ProductImage[]>(product?.product_images ?? [])
  const [saving,           setSaving]           = useState(false)
  const [uploadingFile,    setUploadingFile]    = useState(false)
  const [digitalFileName,  setDigitalFileName]  = useState<string>(product?.digital_file_name ?? '')
  const [digitalFilePath,  setDigitalFilePath]  = useState<string>(product?.digital_file_path ?? '')

  function update(field: string, value: string | boolean) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleDigitalFileUpload(file: File) {
    if (!isEdit) { toast.error('Guarda el producto primero antes de subir el archivo.'); return }
    setUploadingFile(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('productId', product!.id)
      const res = await fetch('/api/admin/digital-files', { method: 'POST', body: formData })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error ?? 'Error') }
      const { digital_file_name: fname, path } = await res.json()
      setDigitalFileName(fname)
      setDigitalFilePath(path)
      update('digital_file_name', fname)
      console.log('Digital file uploaded:', { fname, path })
      toast.success('Archivo digital subido - ahora guarda el producto')
    } catch (e: unknown) {
      console.error('Upload error:', e)
      toast.error(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploadingFile(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name || !form.price) { toast.error('Nombre y precio son requeridos'); return }
    setSaving(true)
    try {
      const url    = isEdit ? `/api/admin/productos/${product!.id}` : '/api/admin/productos'
      const method = isEdit ? 'PUT' : 'POST'
      const payload = {
        name:              form.name,
        slug:              form.slug || slugify(form.name),
        description:       form.description || null,
        price:             parseInt(form.price.replace(/\./g, '')),
        compare_price:     form.compare_price ? parseInt(form.compare_price.replace(/\./g, '')) : null,
        stock:             form.is_digital ? 0 : parseInt(form.stock) || 0,
        made_to_order:     form.is_digital ? false : form.made_to_order,
        is_digital:        form.is_digital,
        digital_file_name: form.is_digital ? (digitalFileName || null) : null,
        digital_file_path: form.is_digital ? (digitalFilePath || null) : null,
        category_id:       form.category_id || null,
        sku:               form.sku || null,
        is_featured:       form.is_featured,
        meta_title:        form.meta_title || null,
        meta_description:  form.meta_description || null,
        video_url:         form.video_url || null,
      }
      console.log('Sending payload:', {
        is_digital: payload.is_digital,
        digital_file_name: payload.digital_file_name,
        digital_file_path: payload.digital_file_path,
        digitalFileName,
        digitalFilePath,
      })
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) { const err = await res.json(); throw new Error(err.error ?? 'Error') }

      // Handle special fields with dedicated endpoints
      if (isEdit) {
        // Save is_active
        const activeRes = await fetch(`/api/admin/productos/${product!.id}/toggle-active`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_active: form.is_active }),
        })
        if (!activeRes.ok) { const err = await activeRes.json(); throw new Error(err.error ?? 'Error al cambiar estado') }

        // Save digital file if is_digital
        if (form.is_digital) {
          console.log('Saving digital file separately:', { digitalFileName, digitalFilePath })
          const fileRes = await fetch(`/api/admin/productos/${product!.id}/save-digital-file`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              digital_file_name: digitalFileName || null,
              digital_file_path: digitalFilePath || null,
            }),
          })
          if (!fileRes.ok) { const err = await fileRes.json(); throw new Error(err.error ?? 'Error al guardar archivo') }
        }
      }

      toast.success(isEdit ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/productos')
      router.refresh()
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!confirm('¿Eliminar este producto? Esta acción no se puede deshacer.')) return
    const res = await fetch(`/api/admin/productos/${product!.id}`, { method: 'DELETE' })
    if (res.ok) { toast.success('Eliminado'); router.push('/admin/productos'); router.refresh() }
    else toast.error('Error al eliminar')
  }

  const fi = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-400 bg-white'
  const lb = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Main column */}
        <div className="lg:col-span-2 space-y-5">

          {/* Tipo */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-900 text-sm">Tipo de producto</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { digital: false, label: 'Físico', sub: 'con envío' },
                { digital: true,  label: 'Digital', sub: 'descargable' },
              ].map(({ digital, label, sub }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => update('is_digital', digital)}
                  className={`flex items-center gap-2.5 p-3.5 rounded-lg border text-sm font-medium transition-all ${
                    form.is_digital === digital
                      ? digital
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-rose-500 bg-rose-50 text-rose-800'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    form.is_digital === digital
                      ? digital ? 'bg-blue-500' : 'bg-rose-500'
                      : 'bg-gray-300'
                  }`} />
                  {label}
                  <span className="text-xs text-gray-400 font-normal">({sub})</span>
                </button>
              ))}
            </div>
            {form.is_digital && (
              <p className="text-xs text-blue-600 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                Los productos digitales no cobran envío. El cliente recibe un enlace de descarga tras el pago exitoso.
              </p>
            )}
          </div>

          {/* Info básica */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-900 text-sm">Información básica</h2>
            <div>
              <label className={lb}>Nombre *</label>
              <input required value={form.name} onChange={(e) => { update('name', e.target.value); if (!isEdit) update('slug', slugify(e.target.value)) }} className={fi} />
            </div>
            <div>
              <label className={lb}>Slug (URL)</label>
              <input value={form.slug} onChange={(e) => update('slug', e.target.value.toLowerCase().replace(/\s/g, '-'))} className={fi} />
            </div>
            <div>
              <label className={lb}>Descripción</label>
              <textarea rows={4} value={form.description} onChange={(e) => update('description', e.target.value)} className={fi} />
            </div>
          </div>

          {/* Precios */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-900 text-sm">Precios (CLP)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={lb}>Precio * (IVA incluido)</label>
                <input required type="number" min="0" step="1" value={form.price} onChange={(e) => update('price', e.target.value)} className={fi} placeholder="4990" />
              </div>
              <div>
                <label className={lb}>Precio antes (tachado)</label>
                <input type="number" min="0" step="1" value={form.compare_price} onChange={(e) => update('compare_price', e.target.value)} className={fi} />
              </div>
            </div>
          </div>

          {/* Inventario — solo físicos */}
          {!form.is_digital && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-medium text-gray-900 text-sm">Inventario</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={lb}>Stock disponible</label>
                  <input type="number" min="0" step="1" value={form.stock} onChange={(e) => update('stock', e.target.value)} className={fi} />
                </div>
                <div>
                  <label className={lb}>SKU (opcional)</label>
                  <input value={form.sku} onChange={(e) => update('sku', e.target.value)} className={fi} placeholder="CDV-001" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.made_to_order} onChange={(e) => update('made_to_order', e.target.checked)} className="accent-rose-600" />
                <span className="text-sm text-gray-700">A pedido — mostrar &ldquo;48-72 hrs&rdquo; cuando stock = 0</span>
              </label>
            </div>
          )}

          {/* Archivo digital */}
          {form.is_digital && (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-medium text-gray-900 text-sm">Archivo digital (PDF / ZIP)</h2>
              {digitalFileName ? (
                <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-green-700 truncate">{digitalFileName}</p>
                    <p className="text-xs text-green-500">Listo para descarga</p>
                  </div>
                  <button type="button" onClick={() => { setDigitalFileName(''); update('digital_file_name', '') }} className="text-green-500 hover:text-red-500 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <label className={`flex flex-col items-center gap-3 p-6 border-2 border-dashed rounded-xl transition-colors ${isEdit ? 'cursor-pointer border-gray-200 hover:border-blue-300 hover:bg-blue-50/30' : 'border-gray-100 bg-gray-50 opacity-50'}`}>
                  {isEdit && <input type="file" className="hidden" accept=".pdf,.zip,.png,.jpg,.jpeg" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleDigitalFileUpload(f) }} disabled={uploadingFile} />}
                  <Upload className={`h-8 w-8 ${uploadingFile ? 'text-blue-400 animate-pulse' : 'text-gray-300'}`} />
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-600">
                      {uploadingFile ? 'Subiendo...' : isEdit ? 'Haz clic para subir archivo' : 'Guarda el producto primero'}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">PDF, ZIP · Máx 100 MB</p>
                  </div>
                </label>
              )}
            </div>
          )}

          {/* Imágenes */}
          {isEdit ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              <h2 className="font-medium text-gray-900 text-sm">Imágenes del producto</h2>
              <ImageUpload productId={product!.id} images={images} onImagesChange={setImages} />
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              Guarda el producto primero para poder subir imágenes.
            </div>
          )}

          {/* SEO */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-900 text-sm">SEO (opcional)</h2>
            <div>
              <label className={lb}>Meta título</label>
              <input value={form.meta_title} onChange={(e) => update('meta_title', e.target.value)} className={fi} />
            </div>
            <div>
              <label className={lb}>Meta descripción</label>
              <textarea rows={2} value={form.meta_description} onChange={(e) => update('meta_description', e.target.value)} className={fi} />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
            <h2 className="font-medium text-gray-900 text-sm">Organización</h2>
            <div>
              <label className={lb}>Categoría</label>
              <select value={form.category_id} onChange={(e) => update('category_id', e.target.value)} className={fi}>
                <option value="">Sin categoría</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_featured} onChange={(e) => update('is_featured', e.target.checked)} className="accent-rose-600" />
              <span className="text-sm text-gray-700">Destacado en la home</span>
            </label>
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
            <h2 className="font-medium text-gray-900 text-sm">Visibilidad</h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="accent-rose-600" />
              <span className="text-sm text-gray-700">Activo (visible en tienda)</span>
            </label>
          </div>

          <button type="submit" disabled={saving} className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors">
            {saving ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Crear producto'}
          </button>

          {isEdit && (
            <button type="button" onClick={handleDelete} className="w-full border border-red-300 text-red-600 hover:bg-red-50 font-medium py-2.5 rounded-lg text-sm transition-colors">
              Eliminar producto
            </button>
          )}
        </div>
      </div>
    </form>
  )
}
