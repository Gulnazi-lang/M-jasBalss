import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { resolveRedirectPath } from '@/lib/auth-utils'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')

  const localeFromNext = next?.match(/^\/(lv|ru|en)/)?.[1] ?? 'lv'
  const loginUrl = new URL(`/${localeFromNext}/auth/login`, origin)
  if (next) loginUrl.searchParams.set('redirect', next)

  if (error) {
    loginUrl.searchParams.set('error', errorDescription || error)
    return NextResponse.redirect(loginUrl)
  }

  if (!code) {
    loginUrl.searchParams.set('error', 'missing_code')
    return NextResponse.redirect(loginUrl)
  }

  const supabase = await createClient()
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeError) {
    loginUrl.searchParams.set('error', exchangeError.message)
    return NextResponse.redirect(loginUrl)
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const meta = user.user_metadata ?? {}
    const fullName =
      (typeof meta.full_name === 'string' && meta.full_name) ||
      (typeof meta.name === 'string' && meta.name) ||
      null
    const avatarUrl = typeof meta.avatar_url === 'string' ? meta.avatar_url : null

    await supabase.from('profiles').upsert(
      {
        id: user.id,
        full_name: fullName,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    )
  }

  const redirectPath = resolveRedirectPath(localeFromNext, next)
  return NextResponse.redirect(`${origin}${redirectPath}`)
}