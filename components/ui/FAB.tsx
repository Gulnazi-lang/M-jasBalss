'use client'

import React from 'react'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FABProps {
  onClick: () => void
  label?: string
  className?: string
}

export function FAB({ onClick, label, className }: FABProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-20 right-5 z-[60] md:hidden flex items-center gap-2 rounded-2xl bg-accent px-5 py-3.5 text-white shadow-lg active:scale-95 transition",
        className
      )}
    >
      <Plus className="h-5 w-5" />
      {label && <span className="text-sm font-semibold pr-1">{label}</span>}
    </button>
  )
}
