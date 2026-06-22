'use client'

import { useTranslations } from 'next-intl'

export function AuthDivider() {
  const t = useTranslations('auth')

  return (
    <div className="my-5 flex w-full items-center gap-3">
      <span className="h-px flex-1 bg-line" />
      <span className="text-[11px] uppercase tracking-wide text-muted">{t('orEmail')}</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  )
}