'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { resolveRedirectPath } from '@/lib/auth-utils'
import { AuthShell } from '@/components/auth/AuthShell'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthDivider } from '@/components/auth/AuthDivider'

function LoginForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const redirectPath = resolveRedirectPath(
    locale,
    searchParams.get('redirect') ?? searchParams.get('next')
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(searchParams.get('error') ?? '')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(friendlyError(signInError.message, t))
      setLoading(false)
      return
    }

    window.location.href = redirectPath
  }

  return (
    <AuthShell
      footer={
        <Link
          href={`/${locale}/auth/register?redirect=${encodeURIComponent(redirectPath)}`}
          className="mt-3 inline-block text-[12px] font-semibold text-accent"
        >
          {t('toSignUp')}
        </Link>
      }
    >
      <GoogleButton
        label={t('continueWithGoogle')}
        loadingLabel={t('loading')}
        redirectPath={redirectPath}
        onError={(msg) => setError(msg)}
      />

      <AuthDivider />

      <p className="mb-2.5 text-left text-[12.5px] font-semibold text-ink">
        {t('emailSignInTitle')}
      </p>

      <form onSubmit={handleLogin} className="w-full space-y-2.5 text-left">
        <input
          type="email"
          className="input-field"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          autoComplete="email"
          required
        />
        <input
          type="password"
          className="input-field"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('passwordPlaceholder')}
          autoComplete="current-password"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? t('loading') : t('loginButton')}
        </button>
      </form>

      {error && <p className="mt-3 text-xs font-medium text-accent">{error}</p>}
    </AuthShell>
  )
}

function friendlyError(msg: string, t: (key: string) => string): string {
  if (/invalid login credentials/i.test(msg)) return t('errInvalid')
  return msg
}

export default function LoginPage() {
  const t = useTranslations('auth')

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          {t('loading')}
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  )
}