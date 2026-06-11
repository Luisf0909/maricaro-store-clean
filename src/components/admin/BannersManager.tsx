'use client'

import { useState, useTransition } from 'react'
import { Plus, Pencil, Trash2, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { Banner } from '@/types'

interface Props {
  initialBanners: Banner[]
}

const POSITION_LABELS: Record<string, string> = {
  hero:    'Hero principal',
  strip:   'Tira de información',
  promo:   'Banner promocional',
  sidebar: 'Lateral',
}

export function BannersManager({ initialBanners }: Props) {
  const [banners, setBanners] = useState(initialBanners)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()

  const emptyForm: Partial<Banner> & { title: string } = {
    title:        '',
    subtitle:     '',
    cta_text:     '',
    cta_url:      '',
    image_url:    '',
    bg_color:     '#FAF7F2',
    text_color:   '#2C2C2C',
    position:     'hero',
    is_active:    true,
    sort_order:   0,
  }
  const [form, setForm] = useState(emptyForm)

  const set = (k: string, v: string | boolean | number) => setForm(f => ({ ...f, [k]: v }))

  function startEdit(banner: Banner) {
    setEditingId(banner.id)
    setForm({
      title:      banner.title,
      subtitle:   banner.subtitle ?? '',
      cta_text:   banner.cta_text ?? '',
      cta_url:    banner.cta_url ?? '',
      image_url:  banner.image_url ?? '',
      bg_color:   banner.bg_color,
      text_color: banner.text_color,
      position:   banner.position,
      is_active:  banner.is_active,
      sort_order: banner.sort_order,
    })
    setShowForm(true)
  }

  async function save() {
    if (!form.title) { toast.error('El título es requerido'); return }
    startTransition(async () => {
      const method = editingId ? 'PATCH' : 'POST'
      const url    = editingId ? `/api/admin/cms/banners/${editingId}` : '/api/admin/cms/banners'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) { toast.error('Error al guardar banner'); return }

      const saved = await res.json()
      if (editingId) {
        setBanners(bs => bs.map(b => b.id === editingId ? saved : b))
        toast.success('Banner actualizado')
      } else {
        setBanners(bs => [...bs, saved])
        toast.success('Banner creado')
      }
      setShowForm(false)
      setEditingId(null)
      setForm(emptyForm)
    })
  }

  function toggleActive(id: string) {
    const banner = banners.find(b => b.id === id)!
    setBanners(bs => bs.map(b => b.id === id ? { ...b, is_active: !b.is_active } : b))
    startTransition(async () => {
      await fetch(`/api/admin/cms/banners/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !banner.is_active }),
      })
    })
  }

  async function deleteBanner(id: string) {
    if (!confirm('¿Eliminar este banner?')) return
    const res = await fetch(`/api/admin/cms/banners/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setBanners(bs => bs.filter(b => b.id !== id))
      toast.success('Banner eliminado')
    } else {
      toast.error('Error al eliminar')
    }
  }

  return (
    <div className="space-y-4">
      {/* Banner list */}
      {banners.length === 0 && !showForm ? (
        <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-gray-100">
          <ImageIcon className="h-8 w-8 text-gray-200 mb-2" />
          <p className="text-sm text-gray-400 mb-3">No hay banners creados</p>
        </div>
      ) : (
        <div className="space-y-2">
          {banners.map(banner => (
            <div key={banner.id}
              className={cn('flex items-center gap-3 bg-white rounded-xl border p-4', !banner.is_active && 'opacity-60')}
            >
              {banner.image_url ? (
                <div className="relative w-16 h-10 rounded-lg overflow-hidden bg-gray-50 flex-shrink-0">
                  <Image src={banner.image_url} alt={banner.title} fill className="object-cover" sizes="64px" />
                </div>
              ) : (
                <div className="w-16 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: banner.bg_color }}>
                  <span className="text-[10px] font-bold" style={{ color: banner.text_color }}>IMG</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{banner.title}</p>
                <p className="text-xs text-gray-400">
                  {POSITION_LABELS[banner.position] ?? banner.position}
                  {banner.cta_text && ` · CTA: ${banner.cta_text}`}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button onClick={() => toggleActive(banner.id)} title={banner.is_active ? 'Desactivar' : 'Activar'}
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {banner.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                </button>
                <button onClick={() => startEdit(banner)} title="Editar"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-warm-600 transition-colors"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button onClick={() => deleteBanner(banner.id)} title="Eliminar"
                  className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/edit form */}
      {showForm ? (
        <div className="bg-white rounded-xl border border-warm-200 p-5 space-y-4">
          <h3 className="font-semibold text-sm text-gray-900">
            {editingId ? 'Editar banner' : 'Nuevo banner'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Título *</label>
              <input type="text" value={form.title} onChange={e => set('title', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Subtítulo</label>
              <input type="text" value={form.subtitle ?? ''} onChange={e => set('subtitle', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Texto del botón (CTA)</label>
              <input type="text" value={form.cta_text ?? ''} onChange={e => set('cta_text', e.target.value)}
                placeholder="Ver productos"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">URL del botón</label>
              <input type="text" value={form.cta_url ?? ''} onChange={e => set('cta_url', e.target.value)}
                placeholder="/productos"
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">URL de imagen</label>
              <input type="text" value={form.image_url ?? ''} onChange={e => set('image_url', e.target.value)}
                placeholder="https://..."
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Posición</label>
              <select value={form.position ?? 'hero'} onChange={e => set('position', e.target.value)}
                className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-warm-400 bg-white">
                {Object.entries(POSITION_LABELS).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Color de fondo</label>
              <div className="flex gap-2 items-center">
                <input type="color" value={form.bg_color ?? '#FAF7F2'} onChange={e => set('bg_color', e.target.value)}
                  className="h-9 w-12 rounded border border-gray-200 cursor-pointer p-0.5" />
                <input type="text" value={form.bg_color ?? ''} onChange={e => set('bg_color', e.target.value)}
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 font-mono focus:outline-none focus:ring-1 focus:ring-warm-400" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button onClick={save} disabled={isPending}
              className="px-5 py-2 bg-warm-700 text-white text-sm font-medium rounded-lg hover:bg-warm-800 disabled:opacity-60 transition-colors">
              {isPending ? 'Guardando…' : editingId ? 'Actualizar' : 'Crear banner'}
            </button>
            <button onClick={() => { setShowForm(false); setEditingId(null); setForm(emptyForm) }}
              className="px-5 py-2 border border-gray-200 text-sm text-gray-600 rounded-lg hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => { setShowForm(true); setEditingId(null); setForm(emptyForm) }}
          className="flex items-center gap-2 px-4 py-2.5 border-2 border-dashed border-gray-200 rounded-xl text-sm text-gray-500 hover:border-warm-300 hover:text-warm-600 transition-colors w-full justify-center"
        >
          <Plus className="h-4 w-4" /> Agregar banner
        </button>
      )}
    </div>
  )
}
