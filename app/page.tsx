'use client'
import { useEffect } from 'react'

// Simple redirect to default locale (middleware should catch most cases)
export default function RootRedirect() {
  useEffect(() => {
    window.location.href = '/lv'
  }, [])
  return <div className="min-h-[60vh] flex items-center justify-center text-muted">Pāradresē...</div>
}
