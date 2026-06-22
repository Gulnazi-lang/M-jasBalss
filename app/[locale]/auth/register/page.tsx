'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import { CheckCircle2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { resolveRedirectPath, buildOAuthCallbackUrl } from '@/lib/auth-utils'
import { AuthShell } from '@/components/auth/AuthShell'
import { GoogleButton } from '@/components/auth/GoogleButton'
import { AuthDivider } from '@/components/auth/AuthDivider'

function RegisterForm() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const searchParams = useSearchParams()

  const redirectPath = resolveRedirectPath(
    locale,
    searchParams.get('redirect') ?? searchParams.get('next')
  )

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [fullName, setFullName] = useState('')
  const [apartment, setApartment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    setInfo('')

    if (password.length < 6) {
      setError(t('errPassShort'))
      setLoading(false)
      return
    }
    if (password !== password2) {
      setError(t('errPassMatch'))
      setLoading(false)
      return
    }

    const supabase = createClient()

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: fullName.trim(),
          apartment: apartment.trim() || null,
        },
        emailRedirectTo: buildOAuthCallbackUrl(redirectPath),
      },
    })

    if (signUpError) {
      setError(friendlyError(signUpError.message, t))
      setLoading(false)
      return
    }

    if (data.session) {
      window.location.href = redirectPath
      return
    }

    setSuccess(true)
    setInfo(t('checkEmail'))
    setLoading(false)
  }

  if (success) {
    return (
      <AuthShell>
        <div className="py-4 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-soft">
            <CheckCircle2 className="h-7 w-7 text-green" />
          </div>
          <p className="text-base font-semibold text-ink">{t('welcome')}</p>
          {info && <p className="mt-2 text-sm text-green font-semibold">{info}</p>}
          <p className="mt-2 text-[12.5px] leading-relaxed text-muted">{t('afterRegisterHint')}</p>
          <Link
            href={redirectPath}
            className="mt-6 block w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white"
          >
            {t('goToMap')}
          </Link>
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      footer={
        <Link
          href={`/${locale}/auth/login?redirect=${encodeURIComponent(redirectPath)}`}
          className="mt-3 inline-block text-[12px] font-semibold text-accent"
        >
          {t('toSignIn')}
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
        {t('emailRegisterTitle')}
      </p>

      <form onSubmit={handleRegister} className="w-full space-y-2.5 text-left">
        <input
          className="input-field"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder={t('fullNamePlaceholder')}
          autoComplete="name"
          required
        />
        <input
          className="input-field"
          value={apartment}
          onChange={(e) => setApartment(e.target.value)}
          placeholder={t('apartmentPlaceholder')}
          autoComplete="off"
        />
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
          autoComplete="new-password"
          minLength={6}
          required
        />
        <input
          type="password"
          className="input-field"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          placeholder={t('passwordAgainPlaceholder')}
          autoComplete="new-password"
          minLength={6}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white disabled:opacity-60"
        >
          {loading ? t('loading') : t('registerButton')}
        </button>
      </form>

      {error && <p className="mt-3 text-xs font-medium text-accent">{error}</p>}
    </AuthShell>
  )
}

function friendlyError(msg: string, t: (key: string) => string): string {
  if (/already registered|already exists|user already/i.test(msg)) return t('errExists')
  return msg
}

export default function RegisterPage() {
  const t = useTranslations('auth')

  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          {t('loading')}
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}