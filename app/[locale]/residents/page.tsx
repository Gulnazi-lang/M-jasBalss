'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { isVerified } from '@/lib/demo-store'

const demoResidents = [
  { id: 1, name: 'Anna Kalniņa', apartment: '12', role: 'owner', verified: true },
  { id: 2, name: 'Jānis Ozoliņš', apartment: '5', role: 'owner', verified: true },
  { id: 3, name: 'Olga Petrova', apartment: '27A', role: 'tenant', verified: false },
  { id: 4, name: 'Mārtiņš Bērziņš', apartment: '3', role: 'admin', verified: true },
]

export default function ResidentsPage() {
  const t = useTranslations('residents')
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    setVerified(isVerified())
  }, [])

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">{t('title')}</h1>
        <div className="text-xs text-muted">{demoResidents.length} cilvēki</div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {demoResidents.map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <div>
              <div className="font-semibold">{r.name}</div>
              <div className="text-sm text-muted">{t('apartment')} {r.apartment}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-xs font-semibold uppercase tracking-wider bg-accent-soft px-3 py-1 rounded-full text-muted">
                {t(`role.${r.role}`)}
              </div>
              <div className={`text-[10px] px-2 py-px rounded ${r.verified || (r.id === 3 && verified) ? 'bg-green-soft text-green' : 'bg-accent-soft text-accent'}`}>
                {r.verified || (r.id === 3 && verified) ? 'Verificēts' : 'Gaida verifikāciju'}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <p className="text-center text-xs mt-8 text-muted/70">Verificēti iedzīvotāji var pilnvērtīgi piedalīties balsojumos un ziņot par problēmām.</p>
    </div>
  )
}
