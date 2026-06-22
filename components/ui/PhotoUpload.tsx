'use client'

import React, { useState } from 'react'
import { Upload, X } from 'lucide-react'

interface PhotoUploadProps {
  onPhotosChange: (photos: string[]) => void
  maxPhotos?: number
}

export function PhotoUpload({ onPhotosChange, maxPhotos = 4 }: PhotoUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])

  const handleFiles = (files: FileList | null) => {
    if (!files) return

    const newPreviews: string[] = []

    Array.from(files).slice(0, maxPhotos - previews.length).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        if (result) {
          const updated = [...previews, result]
          setPreviews(updated)
          onPhotosChange(updated)
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    const updated = previews.filter((_, i) => i !== index)
    setPreviews(updated)
    onPhotosChange(updated)
  }

  return (
    <div>
      <div className="grid grid-cols-4 gap-2 mb-3">
        {previews.map((src, idx) => (
          <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-line">
            <img src={src} alt={`photo-${idx}`} className="object-cover w-full h-full" />
            <button 
              onClick={() => removePhoto(idx)}
              className="absolute top-1 right-1 bg-white/90 rounded-full p-0.5"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        {previews.length < maxPhotos && (
          <label className="aspect-square border-2 border-dashed border-accent/40 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-accent-soft/50 active:bg-accent-soft text-muted">
            <Upload className="h-6 w-6 mb-1" />
            <span className="text-xs font-medium">Pievienot foto</span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              className="hidden" 
              onChange={(e) => handleFiles(e.target.files)} 
            />
          </label>
        )}
      </div>
      <p className="text-[10px] text-muted/70">Līdz {maxPhotos} fotogrāfijām. Tiks saglabātas demo režīmā.</p>
    </div>
  )
}
