'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocale, useTranslations } from 'next-intl'
import type { User } from '@supabase/supabase-js'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'
import { getUserDisplayName } from '@/lib/auth-utils'

export function Header() {
  const t = useTranslations('nav')
  const locale = useLocale()
  const [user, setUser] = useState<User | null>(null)

  const withLocale = (path: string) => `/${locale}${path === '/' ? '' : path}`

  useEffect(() => {
    const supabase = createClient()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-line">
      <div className="max-w-[420px] md:max-w-5xl mx-auto flex items-center justify-between px-4 h-14">
        <Link href={withLocale('/')} className="flex items-center gap-2">
          <span className="font-display text-base font-bold text-accent">MājasBalss</span>
          <span className="text-[10px] font-semibold text-muted -ml-1">.lv</span>
        </Link>

        <div className="flex items-center gap-2 md:gap-3">
          <LanguageSwitcher />

          {user ? (
            <Link
              href={withLocale('/profile')}
              className="flex items-center gap-2 rounded-full pl-0.5 pr-2.5 py-0.5 text-sm hover:bg-accent-soft transition"
            >
              <div className="h-[34px] w-[34px] flex-shrink-0 rounded-full bg-gradient-to-br from-[#7ED4DF] to-accent flex items-center justify-center text-xs font-bold text-white">
                {getUserDisplayName(user).charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline font-semibold text-ink max-w-[100px] truncate text-[13px]">
                {getUserDisplayName(user)}
              </span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href={withLocale('/auth/login')}
                className="hidden sm:inline-flex text-[13px] font-semibold text-accent px-3 py-1.5"
              >
                {t('login')}
              </Link>
              <Link
                href={withLocale('/auth/register')}
                className="rounded-xl bg-accent text-white text-[13px] font-semibold px-3.5 py-1.5"
              >
                {t('register')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}