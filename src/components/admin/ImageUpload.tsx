'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ProductImage } from '@/types'

interface ImageUploadProps {
  productId: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
}

export function ImageUpload({ productId, images, onImagesChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function uploadFile(file: File, isPrimary: boolean) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('productId', productId)
    fd.append('isPrimary', String(isPrimary))
    fd.append('altText', file.name.replace(/\.[^.]+$/, ''))

    const res = await fetch('/api/admin/imagenes', {
      method: 'POST',
      body: fd,
      credentials: 'include'
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error ?? 'Error al subir imagen')
    }
    return res.json() as Promise<ProductImage>
  }

  async function handleFiles(files: FileList) {
    setUploading(true)
    const newImages: ProductImage[] = []
    try {
      for (let i = 0; i < files.length; i++) {
        const isPrimary = images.length === 0 && i === 0
        const img = await uploadFile(files[i], isPrimary)
        newImages.push(img)
      }
      onImagesChange([...images, ...newImages])
      toast.success(`${newImages.length} imagen(es) subida(s)`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al subir')
    } finally {
      setUploading(false)
    }
  }

  async function handleZip(file: File) {
    setUploading(true)
    try {
      const JSZip = (await import('jszip')).default
      const zip = await JSZip.loadAsync(file)
      const imageFiles: File[] = []

      await Promise.all(
        Object.entries(zip.files).map(async ([name, zipEntry]) => {
          if (zipEntry.dir) return
          const ext = name.split('.').pop()?.toLowerCase()
          if (!['jpg', 'jpeg', 'png', 'webp', 'avif'].includes(ext ?? '')) return
          const blob = await zipEntry.async('blob')
          imageFiles.push(new File([blob], name.split('/').pop() ?? name, { type: `image/${ext === 'jpg' ? 'jpeg' : ext}` }))
        })
      )

      if (imageFiles.length === 0) { toast.error('El ZIP no contiene imágenes válidas'); return }

      const newImages: ProductImage[] = []
      for (let i = 0; i < imageFiles.length; i++) {
        const isPrimary = images.length === 0 && i === 0
        const img = await uploadFile(imageFiles[i], isPrimary)
        newImages.push(img)
      }
      onImagesChange([...images, ...newImages])
      toast.success(`${newImages.length} imagen(es) subida(s) desde ZIP`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error al procesar ZIP')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(imageId: string) {
    const res = await fetch('/api/admin/imagenes', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageId }),
      credentials: 'include'
    })
    if (res.ok) onImagesChange(images.filter((i) => i.id !== imageId))
    else toast.error('Error al eliminar imagen')
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (!files.length) return
    if (files.length === 1 && files[0].name.endsWith('.zip')) {
      handleZip(files[0])
    } else {
      handleFiles(files)
    }
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-warm-400 transition-colors cursor-pointer"
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-2 text-warm-600">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Subiendo imágenes...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-gray-400">
            <Upload className="h-8 w-8" />
            <p className="text-sm font-medium text-gray-600">Arrastra imágenes o un ZIP aquí</p>
            <p className="text-xs">JPG, PNG, WebP · o un .zip con imágenes</p>
            <p className="text-xs text-gray-400">Máx. 5 MB por imagen</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.zip"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = e.target.files
            if (!files) return
            if (files.length === 1 && files[0].name.endsWith('.zip')) {
              handleZip(files[0])
            } else {
              handleFiles(files)
            }
            e.target.value = ''
          }}
        />
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {images
            .sort((a, b) => a.sort_order - b.sort_order)
            .map((img) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                <Image src={img.url} alt={img.alt_text ?? ''} fill className="object-cover" sizes="120px" />
                {img.is_primary && (
                  <span className="absolute top-1 left-1 bg-warm-600 text-white p-0.5 rounded text-[10px] flex items-center gap-0.5">
                    <Star className="h-2.5 w-2.5 fill-current" /> Principal
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(img.id)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}
