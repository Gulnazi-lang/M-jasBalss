'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { buildOAuthCallbackUrl } from '@/lib/auth-utils'
import { cn } from '@/lib/utils'

type GoogleButtonProps = {
  label: string
  loadingLabel?: string
  redirectPath: string
  className?: string
  onError?: (message: string) => void
}

export function GoogleButton({
  label,
  loadingLabel,
  redirectPath,
  className,
  onError,
}: GoogleButtonProps) {
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    setLoading(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: buildOAuthCallbackUrl(redirectPath),
        scopes: 'email profile',
        queryParams: {
          access_type: 'online',
          prompt: 'select_account',
        },
      },
    })

    if (error) {
      onError?.(friendlyOAuthError(error.message))
      setLoading(false)
      return
    }

    if (data?.url) {
      window.location.href = data.url
      return
    }

    onError?.('Google sign-in is not configured')
    setLoading(false)
  }

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={loading}
      className={cn(
        'flex w-full items-center justify-center gap-3 rounded-xl border border-line bg-white py-3.5 text-sm font-semibold text-ink shadow-sm transition hover:bg-card disabled:opacity-60',
        className
      )}
    >
      <GoogleIcon />
      <span>{loading && loadingLabel ? loadingLabel : label}</span>
    </button>
  )
}

function friendlyOAuthError(msg: string): string {
  if (/provider is not enabled/i.test(msg)) {
    return 'Google ienākšana vēl nav ieslēgta Supabase projektā.'
  }
  return msg
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.88 2.68-6.62z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z"
      />
    </svg>
  )
}