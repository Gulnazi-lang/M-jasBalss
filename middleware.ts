import { type NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const locales = ['lv', 'ru', 'en'] as const
const defaultLocale = 'lv'

function getLocale(request: NextRequest): string {
  // 1. Check cookie
  const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value
  if (cookieLocale && locales.includes(cookieLocale as any)) return cookieLocale

  // 2. Check Accept-Language header (simplified)
  const acceptLang = request.headers.get('accept-language') || ''
  const preferred = acceptLang.split(',')[0]?.split('-')[0]
  if (locales.includes(preferred as any)) return preferred

  return defaultLocale
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static + api etc.
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') // files
  ) {
    return updateSession(request)
  }

  // OAuth callback — keep without locale prefix
  if (pathname.startsWith('/auth/callback')) {
    return await updateSession(request)
  }

  // Locale handling
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  if (!pathnameHasLocale) {
    const locale = getLocale(request)
    // Redirect e.g. / -> /lv
    request.nextUrl.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
    const response = NextResponse.redirect(request.nextUrl)
    // Keep session cookies handling too
    return response
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
