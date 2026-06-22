'use client'

import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const demoProtocols = [
  {
    id: 'pr1',
    title: 'Protokols no 12.05.2026',
    meetingDate: '2026-05-12',
    content: '1. Apstiprināts 2026. gada budžets.\n2. Izvēlēta pārvaldnieka kompānija.\n3. Jumta remonts 3. ceturksnī.',
  },
  {
    id: 'pr2',
    title: 'Protokols no 03.03.2026',
    meetingDate: '2026-03-03',
    content: 'Kopīpašuma uzturēšanas kārtība un jaunu noteikumu apstiprināšana.',
  },
]

export default function ProtocolsPage() {
  const t = useTranslations('protocols')

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-6">{t('title')}</h1>

      <div className="space-y-4">
        {demoProtocols.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle>{p.title}</CardTitle>
              <div className="text-sm text-muted">{t('meetingDate')}: {p.meetingDate}</div>
            </CardHeader>
            <CardContent>
              <pre className="whitespace-pre-wrap text-sm bg-accent-soft p-4 rounded-xl mb-4">{p.content}</pre>
              <div className="flex gap-3">
                <Button variant="secondary" size="sm">Skatīt pilnu</Button>
                <Button variant="outline" size="sm">Lejupielādēt PDF</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {demoProtocols.length === 0 && <p>{t('empty')}</p>}
    </div>
  )
}
