'use client'

import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'

type AuthShellProps = {
  children: React.ReactNode
  footer?: React.ReactNode
}

export function AuthShell({ children, footer }: AuthShellProps) {
  const locale = useLocale()
  const t = useTranslations('auth')

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center bg-screen px-8 py-10 text-center">
      <Link href={`/${locale}`} className="group">
        <div className="font-display text-4xl font-bold text-accent transition group-hover:opacity-90">
          MājasBalss
        </div>
        <div className="mt-1.5 font-display text-sm font-semibold tracking-wide text-accent/80">
          .lv
        </div>
      </Link>

      <p className="mt-3 max-w-[280px] text-sm leading-relaxed text-muted">
        {t('tagline')}
      </p>

      <div className="mt-8 w-full">{children}</div>

      {footer}

      <p className="mt-8 max-w-[300px] text-[11px] leading-relaxed text-muted">
        {t('privacy')}
      </p>
    </div>
  )
}