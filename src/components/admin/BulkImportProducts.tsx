'use client'

import { useState, useRef } from 'react'
import { FileSpreadsheet, Download, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImportRow {
  name: string
  slug?: string
  description?: string
  price: number
  compare_price?: number
  stock?: number
  made_to_order?: boolean
  sku?: string
  category_name?: string
  is_featured?: boolean
  meta_title?: string
  meta_description?: string
}

interface ImportResult {
  row: number
  name: string
  status: 'ok' | 'error'
  message?: string
}

interface BulkImportProductsProps {
  categories: { id: string; name: string }[]
  onComplete: () => void
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function BulkImportProducts({ categories, onComplete }: BulkImportProductsProps) {
  const [rows, setRows] = useState<ImportRow[]>([])
  const [results, setResults] = useState<ImportResult[]>([])
  const [importing, setImporting] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function parseFile(file: File) {
    if (file.name.endsWith('.csv')) {
      const Papa = (await import('papaparse')).default
      const text = await file.text()
      const { data } = Papa.parse(text, { header: true, skipEmptyLines: true })
      return data as Record<string, string>[]
    } else {
      const XLSX = await import('xlsx')
      const buffer = await file.arrayBuffer()
      const wb = XLSX.read(buffer)
      const ws = wb.Sheets[wb.SheetNames[0]]
      return XLSX.utils.sheet_to_json(ws) as Record<string, string>[]
    }
  }

  async function handleFile(file: File) {
    try {
      const raw = await parseFile(file)
      const parsed: ImportRow[] = raw.map((r) => ({
        name: String(r['nombre'] ?? r['name'] ?? '').trim(),
        slug: r['slug'] ? String(r['slug']).trim() : undefined,
        description: r['descripcion'] ?? r['description'] ? String(r['descripcion'] ?? r['description']).trim() : undefined,
        price: Math.round(parseFloat(String(r['precio'] ?? r['price'] ?? '0').replace(/\./g, '').replace(',', '.')) || 0),
        compare_price: r['precio_comparacion'] ?? r['compare_price'] ? Math.round(parseFloat(String(r['precio_comparacion'] ?? r['compare_price']).replace(/\./g, '')) || 0) || undefined : undefined,
        stock: parseInt(String(r['stock'] ?? '0'), 10) || 0,
        made_to_order: ['1', 'true', 'sí', 'si', 'yes'].includes(String(r['a_pedido'] ?? r['made_to_order'] ?? '').toLowerCase()),
        sku: r['sku'] ? String(r['sku']).trim() : undefined,
        category_name: r['categoria'] ?? r['category'] ? String(r['categoria'] ?? r['category']).trim() : undefined,
        is_featured: ['1', 'true', 'sí', 'si', 'yes'].includes(String(r['destacado'] ?? r['featured'] ?? '').toLowerCase()),
        meta_title: r['meta_titulo'] ?? r['meta_title'] ? String(r['meta_titulo'] ?? r['meta_title']).trim() : undefined,
        meta_description: r['meta_descripcion'] ?? r['meta_description'] ? String(r['meta_descripcion'] ?? r['meta_description']).trim() : undefined,
      })).filter((r) => r.name && r.price > 0)

      setRows(parsed)
      setResults([])
      toast.success(`${parsed.length} productos cargados desde el archivo`)
    } catch {
      toast.error('Error al leer el archivo')
    }
  }

  async function handleImport() {
    if (!rows.length) return
    setImporting(true)
    const newResults: ImportResult[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        const categoryId = row.category_name
          ? categories.find((c) => c.name.toLowerCase() === row.category_name!.toLowerCase())?.id
          : undefined

        const res = await fetch('/api/admin/productos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...row,
            slug: row.slug || slugify(row.name),
            category_id: categoryId,
          }),
          credentials: 'include'
        })

        if (res.ok) {
          newResults.push({ row: i + 1, name: row.name, status: 'ok' })
        } else {
          const err = await res.json()
          newResults.push({ row: i + 1, name: row.name, status: 'error', message: err.error })
        }
      } catch {
        newResults.push({ row: i + 1, name: row.name, status: 'error', message: 'Error de red' })
      }
    }

    setResults(newResults)
    setImporting(false)
    const ok = newResults.filter((r) => r.status === 'ok').length
    if (ok > 0) {
      toast.success(`${ok} productos importados correctamente`)
      onComplete()
    }
  }

  function downloadTemplate() {
    const headers = 'nombre,slug,descripcion,precio,precio_comparacion,stock,a_pedido,sku,categoria,destacado,meta_titulo,meta_descripcion'
    const example = 'Cuaderno Devocional Amanecer,cuaderno-devocional-amanecer,Cuaderno para reflexiones matutinas,12990,,50,,CDV-001,Devocionales,sí,,'
    const blob = new Blob([`${headers}\n${example}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'plantilla_productos.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Importar productos masivamente</h2>
          <p className="text-sm text-gray-500 mt-0.5">Sube un archivo CSV o XLSX con tus productos</p>
        </div>
        <button
          type="button"
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 text-sm text-warm-700 hover:underline"
        >
          <Download className="h-4 w-4" />
          Descargar plantilla CSV
        </button>
      </div>

      {/* Upload zone */}
      <div
        className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-warm-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f) }}
        onDragOver={(e) => e.preventDefault()}
      >
        <FileSpreadsheet className="h-10 w-10 text-gray-300 mx-auto mb-3" />
        <p className="text-sm font-medium text-gray-600">Arrastra tu archivo CSV o XLSX aquí</p>
        <p className="text-xs text-gray-400 mt-1">o haz clic para seleccionar</p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.xlsx,.xls"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = '' }}
        />
      </div>

      {rows.length > 0 && results.length === 0 && (
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm font-medium text-gray-700">{rows.length} productos listos para importar:</p>
          <div className="max-h-48 overflow-y-auto space-y-1">
            {rows.map((r, i) => (
              <div key={i} className="flex justify-between text-sm text-gray-600 py-1 border-b border-gray-100 last:border-0">
                <span>{r.name}</span>
                <span className="text-gray-400">${r.price.toLocaleString('es-CL')}</span>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={handleImport}
            disabled={importing}
            className="w-full bg-warm-700 hover:bg-warm-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
          >
            {importing ? <><Loader2 className="h-4 w-4 animate-spin" /> Importando...</> : `Importar ${rows.length} productos`}
          </button>
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Resultados:</p>
          <div className="max-h-64 overflow-y-auto space-y-1">
            {results.map((r) => (
              <div key={r.row} className={`flex items-center gap-2 text-sm p-2 rounded-lg ${r.status === 'ok' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {r.status === 'ok' ? <CheckCircle className="h-4 w-4 flex-shrink-0" /> : <XCircle className="h-4 w-4 flex-shrink-0" />}
                <span className="font-medium">Fila {r.row}: {r.name}</span>
                {r.message && <span className="text-xs opacity-75">— {r.message}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
