'use client'

import { useState, useTransition } from 'react'
import { GripVertical, Eye, EyeOff, Settings, X, Save, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import type { HomepageSection } from '@/types'

const TYPE_LABELS: Record<string, { icon: string; label: string; configFields: ConfigField[] }> = {
  hero_banner: {
    icon: '🖼️', label: 'Hero Banner principal',
    configFields: [{ key: 'limit', label: 'Productos a mostrar', type: 'number', placeholder: '3' }],
  },
  category_grid: {
    icon: '📦', label: 'Cuadrícula de categorías',
    configFields: [
      { key: 'title',    label: 'Título',    type: 'text',  placeholder: 'Encuentra lo que tu alma necesita' },
      { key: 'subtitle', label: 'Subtítulo', type: 'text',  placeholder: '' },
    ],
  },
  featured_products: {
    icon: '⭐', label: 'Productos destacados',
    configFields: [
      { key: 'title',    label: 'Título',             type: 'text',   placeholder: 'Más amados' },
      { key: 'subtitle', label: 'Etiqueta superior',  type: 'text',   placeholder: 'Selección especial' },
      { key: 'limit',    label: 'Cantidad productos', type: 'number', placeholder: '8' },
    ],
  },
  new_arrivals: {
    icon: '🆕', label: 'Nuevos lanzamientos',
    configFields: [
      { key: 'title',    label: 'Título',          type: 'text', placeholder: 'Nuevos lanzamientos' },
      { key: 'subtitle', label: 'Etiqueta',        type: 'text', placeholder: 'Recién llegados' },
    ],
  },
  promo_banner: {
    icon: '📣', label: 'Banner / Versículo destacado',
    configFields: [
      { key: 'verse',     label: 'Versículo / frase',     type: 'textarea', placeholder: 'Escribe un versículo inspirador...' },
      { key: 'verse_ref', label: 'Referencia bíblica',    type: 'text',     placeholder: 'Ej: Filipenses 4:13' },
      { key: 'cta_text',  label: 'Texto del botón',       type: 'text',     placeholder: 'Explorar productos' },
      { key: 'cta_href',  label: 'Enlace del botón',      type: 'text',     placeholder: '/productos' },
    ],
  },
  inspiration: {
    icon: '✝️', label: 'Sección inspiración / Historia',
    configFields: [
      { key: 'title',     label: 'Título',        type: 'text',     placeholder: '¿Qué nos inspiró?' },
      { key: 'body',      label: 'Texto cuerpo',  type: 'textarea', placeholder: 'Cuéntanos tu historia...' },
      { key: 'verse',     label: 'Versículo',     type: 'textarea', placeholder: '' },
      { key: 'verse_ref', label: 'Referencia',    type: 'text',     placeholder: 'Colosenses 3:23' },
      { key: 'image_url', label: 'URL de imagen', type: 'text',     placeholder: 'https://...' },
    ],
  },
  newsletter: {
    icon: '📧', label: 'Suscripción newsletter',
    configFields: [
      { key: 'title',    label: 'Título',     type: 'text',     placeholder: 'Únete a nuestra familia' },
      { key: 'subtitle', label: 'Descripción', type: 'textarea', placeholder: 'Recibe novedades...' },
      { key: 'note',     label: 'Nota inferior', type: 'text',  placeholder: 'Sin spam. Solo contenido que edifica.' },
    ],
  },
  custom_html: {
    icon: '🧩', label: 'Bloque HTML personalizado',
    configFields: [
      { key: 'html', label: 'Código HTML', type: 'textarea', placeholder: '<div>Tu contenido aquí</div>' },
    ],
  },
}

interface ConfigField {
  key: string; label: string; type: 'text' | 'textarea' | 'number'; placeholder: string
}

interface Props { initialSections: HomepageSection[] }

export function HomepageSectionsEditor({ initialSections }: Props) {
  const [sections,   setSections]   = useState(initialSections)
  const [editingId,  setEditingId]  = useState<string | null>(null)
  const [dragging,   setDragging]   = useState<string | null>(null)
  const [isPending,  startTransition] = useTransition()
  const [savingId,   setSavingId]   = useState<string | null>(null)

  // Config editor state per section
  const [configEdits, setConfigEdits] = useState<Record<string, Record<string, string>>>({})

  function getConfigEdit(sectionId: string, key: string, section: HomepageSection) {
    return configEdits[sectionId]?.[key] ?? String((section.config as Record<string, unknown>)?.[key] ?? '')
  }

  function setConfigEdit(sectionId: string, key: string, value: string) {
    setConfigEdits(prev => ({
      ...prev,
      [sectionId]: { ...(prev[sectionId] ?? {}), [key]: value },
    }))
  }

  // Toggle active
  function toggleActive(id: string) {
    const updated = sections.map(s => s.id === id ? { ...s, is_active: !s.is_active } : s)
    setSections(updated)
    startTransition(async () => {
      const section = updated.find(s => s.id === id)!
      const res = await fetch(`/api/admin/cms/sections/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: section.is_active }),
      })
      if (!res.ok) {
        toast.error('Error al actualizar sección')
        setSections(initialSections) // revert
      } else {
        toast.success(`Sección ${section.is_active ? 'activada ✓' : 'desactivada'}`)
      }
    })
  }

  // Save config
  async function saveConfig(section: HomepageSection) {
    const edits = configEdits[section.id] ?? {}
    if (!Object.keys(edits).length) { toast.info('Sin cambios para guardar'); return }

    setSavingId(section.id)
    const currentConfig = (section.config as Record<string, unknown>) ?? {}
    const newConfig = { ...currentConfig }
    for (const [key, val] of Object.entries(edits)) {
      const trimmed = val.trim()
      if (trimmed === '') {
        delete newConfig[key]
      } else {
        // number fields
        const fieldDef = TYPE_LABELS[section.type]?.configFields.find(f => f.key === key)
        newConfig[key] = fieldDef?.type === 'number' ? parseInt(trimmed) || undefined : trimmed
      }
    }

    const res = await fetch(`/api/admin/cms/sections/${section.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ config: newConfig }),
    })

    if (res.ok) {
      setSections(prev => prev.map(s => s.id === section.id ? { ...s, config: newConfig } : s))
      setConfigEdits(prev => { const next = { ...prev }; delete next[section.id]; return next })
      toast.success('Cambios guardados ✓ — se reflejan en el home inmediatamente')
    } else {
      toast.error('Error al guardar cambios')
    }
    setSavingId(null)
  }

  // Drag & drop
  async function saveOrder(orderedSections: HomepageSection[]) {
    const payload = orderedSections.map((s, idx) => ({ id: s.id, sort_order: (idx + 1) * 10 }))
    const res = await fetch('/api/admin/cms/sections/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sections: payload }),
    })
    if (res.ok) toast.success('Orden guardado ✓')
    else toast.error('Error al guardar orden')
  }

  function handleDragStart(id: string) { setDragging(id) }
  function handleDragEnd() {
    setDragging(null)
    saveOrder(sections)
  }
  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!dragging || dragging === targetId) return
    const from = sections.findIndex(s => s.id === dragging)
    const to   = sections.findIndex(s => s.id === targetId)
    const next = [...sections]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setSections(next)
  }

  const hasEdits = (id: string) => Object.keys(configEdits[id] ?? {}).length > 0

  return (
    <div className="space-y-3">
      {sections.map(section => {
        const meta    = TYPE_LABELS[section.type]
        const isEditing = editingId === section.id
        const dirty   = hasEdits(section.id)

        return (
          <div key={section.id} className={cn(
            'bg-white rounded-2xl border transition-all',
            dragging === section.id ? 'opacity-40 border-rose-300 shadow-lg' : 'border-gray-100',
            !section.is_active && 'opacity-55'
          )}>
            {/* Row */}
            <div
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onDragEnd={handleDragEnd}
              onDragOver={e => handleDragOver(e, section.id)}
              className="flex items-center gap-3 p-4 cursor-grab active:cursor-grabbing select-none"
            >
              <GripVertical className="h-4 w-4 text-gray-300 flex-shrink-0" />

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800">
                  {meta?.icon} {meta?.label ?? section.type}
                  {dirty && <span className="ml-2 text-[10px] text-amber-500 font-bold">● sin guardar</span>}
                </p>
                {section.title && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{section.title}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Toggle active */}
                <button
                  onClick={() => toggleActive(section.id)}
                  disabled={isPending}
                  title={section.is_active ? 'Desactivar sección' : 'Activar sección'}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                    section.is_active
                      ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  )}
                >
                  {section.is_active
                    ? <><Eye className="h-3 w-3" /> Visible</>
                    : <><EyeOff className="h-3 w-3" /> Oculto</>}
                </button>

                {/* Edit config */}
                {meta?.configFields.length ? (
                  <button
                    onClick={() => setEditingId(isEditing ? null : section.id)}
                    title="Editar contenido"
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors',
                      isEditing ? 'bg-rose-50 text-rose-600' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                    )}
                  >
                    <Settings className="h-3 w-3" />
                    {isEditing ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                ) : null}
              </div>
            </div>

            {/* Config editor panel */}
            {isEditing && meta?.configFields.length && (
              <div className="border-t border-gray-50 px-4 pb-4 space-y-4">
                <div className="flex items-center justify-between pt-3">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Editar contenido de la sección
                  </p>
                  <div className="flex gap-2">
                    <a
                      href="/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                    >
                      <ExternalLink className="h-3 w-3" /> Ver home
                    </a>
                    <button onClick={() => setEditingId(null)} className="text-gray-300 hover:text-gray-500">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {meta.configFields.map(field => (
                    <div key={field.key} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-medium text-gray-500 mb-1">{field.label}</label>
                      {field.type === 'textarea' ? (
                        <textarea
                          rows={3}
                          value={getConfigEdit(section.id, field.key, section)}
                          onChange={e => setConfigEdit(section.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 resize-none bg-white"
                        />
                      ) : (
                        <input
                          type={field.type === 'number' ? 'number' : 'text'}
                          value={getConfigEdit(section.id, field.key, section)}
                          onChange={e => setConfigEdit(section.id, field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-rose-200 focus:border-rose-300 bg-white"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                  <button
                    onClick={() => saveConfig(section)}
                    disabled={savingId === section.id || !dirty}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white text-sm font-semibold rounded-xl hover:bg-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {savingId === section.id ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                  <button
                    onClick={() => {
                      setConfigEdits(prev => { const next = { ...prev }; delete next[section.id]; return next })
                    }}
                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    Descartar
                  </button>
                  {dirty && (
                    <p className="text-xs text-amber-500 ml-auto">
                      ⚡ Los cambios se reflejan en el home al guardar
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex items-center gap-3 pt-2">
        <p className="text-xs text-gray-400">
          💡 Arrastra para reordenar · Toggle para mostrar/ocultar · ⚙️ para editar contenido
        </p>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto inline-flex items-center gap-1 text-xs text-rose-500 hover:text-rose-700 font-medium"
        >
          <ExternalLink className="h-3 w-3" /> Previsualizar home
        </a>
      </div>
    </div>
  )
}
