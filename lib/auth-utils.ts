const LOCALES = ['lv', 'ru', 'en'] as const

export function resolveRedirectPath(
  locale: string,
  param?: string | null
): string {
  if (!param) return `/${locale}`

  try {
    const decoded = decodeURIComponent(param)
    if (!decoded.startsWith('/')) return `/${locale}`
    if (decoded.startsWith('//')) return `/${locale}`

    const firstSegment = decoded.split('/').filter(Boolean)[0]
    if (firstSegment && !LOCALES.includes(firstSegment as (typeof LOCALES)[number])) {
      return `/${locale}${decoded.startsWith('/') ? decoded : `/${decoded}`}`
    }

    return decoded
  } catch {
    return `/${locale}`
  }
}

export function getSiteOrigin(): string {
  if (typeof window !== 'undefined') return window.location.origin
  return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
}

export function buildOAuthCallbackUrl(redirectPath: string): string {
  return `${getSiteOrigin()}/auth/callback?next=${encodeURIComponent(redirectPath)}`
}

export function getUserDisplayName(user: {
  email?: string | null
  user_metadata?: Record<string, unknown>
}): string {
  const meta = user.user_metadata ?? {}
  const fullName = meta.full_name ?? meta.name
  if (typeof fullName === 'string' && fullName.trim()) return fullName.trim()
  if (user.email) return user.email.split('@')[0]
  return 'Lietotājs'
}