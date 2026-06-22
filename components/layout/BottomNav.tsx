'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { Home, AlertTriangle, BarChart2, FileText, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', labelKey: 'home', icon: Home },
  { href: '/problems', labelKey: 'problems', icon: AlertTriangle },
  { href: '/polls', labelKey: 'polls', icon: BarChart2 },
  { href: '/protocols', labelKey: 'protocols', icon: FileText },
  { href: '/residents', labelKey: 'residents', icon: Users },
]

export function BottomNav() {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const locale = useLocale()

  const withLocale = (path: string) => `/${locale}${path === '/' ? '' : path}`
  const pathWithoutLocale = pathname.replace(/^\/(lv|ru|en)/, '') || '/'

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-line bg-white md:hidden">
      <div className="mx-auto max-w-[420px] flex items-center justify-around h-14 px-1">
        {links.map(({ href, labelKey, icon: Icon }) => {
          const isActive =
            (href === '/' && pathWithoutLocale === '/') ||
            (href !== '/' && pathWithoutLocale.startsWith(href))

          return (
            <Link
              key={href}
              href={withLocale(href)}
              className={cn(
                'flex flex-col items-center justify-center gap-0.5 px-2 py-1 text-[10px] font-semibold transition',
                isActive ? 'text-accent' : 'text-muted'
              )}
            >
              <Icon className={cn('h-[17px] w-[17px]', isActive && 'scale-110')} />
              <span>{t(labelKey)}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}