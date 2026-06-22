'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next/navigation'
import { Globe } from 'lucide-react'

const languages = [
  { code: 'lv', label: 'LV' },
  { code: 'ru', label: 'RU' },
  { code: 'en', label: 'EN' },
]

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(nextLocale: string) {
    // Replace current locale segment in path
    const segments = pathname.split('/')
    if (segments[1] && ['lv', 'ru', 'en'].includes(segments[1])) {
      segments[1] = nextLocale
    } else {
      segments.splice(1, 0, nextLocale)
    }
    const newPath = segments.join('/') || '/'

    // Persist preference
    document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`

    router.push(newPath)
    router.refresh()
  }

  return (
    <div className="relative group">
      <button
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-accent-soft transition"
        aria-label="Change language"
      >
        <Globe className="h-4 w-4" />
        <span className="uppercase font-semibold tracking-widest">{locale}</span>
      </button>

      <div className="absolute right-0 mt-1 hidden group-hover:block z-50 min-w-[110px] rounded-xl border border-line bg-white py-1 shadow-md">
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => switchLocale(lang.code)}
            className={`w-full px-4 py-2 text-left text-sm hover:bg-accent-soft flex justify-between items-center ${
              locale === lang.code ? 'font-semibold text-accent' : ''
            }`}
          >
            {lang.label}
            {locale === lang.code && <span className="text-xs">✓</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
