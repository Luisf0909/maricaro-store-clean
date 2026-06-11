'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Save, RefreshCw } from 'lucide-react'
import type { SiteConfig } from '@/types'

interface Props {
  initialConfig: SiteConfig[]
}

const SECTION_LABELS: Record<string, string> = {
  hero:        'Sección Hero (cabecera principal)',
  inspiration: 'Sección Inspiración y Fe',
  general:     'General',
}

export function SiteConfigEditor({ initialConfig }: Props) {
  const [values, setValues]   = useState<Record<string, string>>(
    Object.fromEntries(initialConfig.map((c) => [c.key, c.value]))
  )
  const [saving, setSaving]   = useState(false)
  const [dirty,  setDirty]    = useState(false)

  function update(key: string, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
    setDirty(true)
  }

  async function handleSave() {
    setSaving(true)
    try {
      const updates = Object.entries(values).map(([key, value]) => ({ key, value }))
      const res = await fetch('/api/admin/site-config', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(updates),
      })
      if (!res.ok) {
        const e = await res.json()
        throw new Error(e.error ?? 'Error al guardar')
      }
      toast.success('Contenido actualizado en la tienda')
      setDirty(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  // Group by section
  const bySection = initialConfig.reduce<Record<string, SiteConfig[]>>((acc, c) => {
    ;(acc[c.section] ??= []).push(c)
    return acc
  }, {})

  const fi = 'w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-warm-400 bg-white'
  const lb = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Sticky save bar */}
      <div className="sticky top-0 z-10 -mx-8 px-8 py-4 bg-gray-50/95 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Editor de contenido</h1>
          <p className="text-xs text-gray-400 mt-0.5">Los cambios se reflejan en la tienda al guardar.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="inline-flex items-center gap-2 bg-warm-700 hover:bg-warm-800 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saving ? 'Guardando...' : 'Guardar cambios'}
        </button>
      </div>

      {Object.entries(bySection).map(([section, items]) => (
        <div key={section} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
            <h2 className="font-semibold text-gray-800 text-sm">
              {SECTION_LABELS[section] ?? section}
            </h2>
          </div>
          <div className="p-6 space-y-5">
            {items.map((cfg) => (
              <div key={cfg.key}>
                <label className={lb}>{cfg.label}</label>
                {cfg.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={values[cfg.key] ?? ''}
                    onChange={(e) => update(cfg.key, e.target.value)}
                    className={fi}
                  />
                ) : (
                  <input
                    type="text"
                    value={values[cfg.key] ?? ''}
                    onChange={(e) => update(cfg.key, e.target.value)}
                    className={fi}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {dirty && (
        <div className="text-center text-xs text-warm-600">
          Tienes cambios sin guardar
        </div>
      )}
    </div>
  )
}
