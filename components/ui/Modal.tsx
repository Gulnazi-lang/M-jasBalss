'use client'

import React from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Modal({ isOpen, onClose, title, children, className }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 p-0 md:p-4" onClick={onClose}>
      <div 
        className={cn(
          "w-full md:max-w-lg md:rounded-3xl bg-white rounded-t-3xl p-5 md:p-6 shadow-xl max-h-[92vh] overflow-auto",
          className
        )}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h2 className="text-xl font-semibold tracking-tight">{title}</h2>}
          <button onClick={onClose} className="p-2 -mr-2 text-muted hover:bg-accent-soft rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
