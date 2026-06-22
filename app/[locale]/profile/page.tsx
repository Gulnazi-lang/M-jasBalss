'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import type { User } from '@supabase/supabase-js'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { createClient } from '@/lib/supabase/client'
import { getUserDisplayName } from '@/lib/auth-utils'
import Link from 'next/link'

export default function ProfilePage() {
  const t = useTranslations('nav')
  const tAuth = useTranslations('auth')
  const locale = useLocale()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = `/${locale}/auth/login`
  }

  if (loading) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center text-muted">
        {tAuth('loading')}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-10 text-center">
        <Card>
          <CardContent className="py-8 space-y-4">
            <p className="text-muted">{tAuth('loginRequired')}</p>
            <Link href={`/${locale}/auth/login`} className="btn btn-primary inline-flex">
              {t('login')}
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const apartment = user.user_metadata?.apartment as string | undefined

  return (
    <div className="max-w-md mx-auto px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{t('profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div>
            <div className="text-muted">{tAuth('fullName')}</div>
            <div className="font-medium">{getUserDisplayName(user)}</div>
          </div>
          <div>
            <div className="text-muted">{tAuth('email')}</div>
            <div className="font-medium">{user.email}</div>
          </div>
          {apartment && (
            <div>
              <div className="text-muted">{tAuth('apartment')}</div>
              <div className="font-medium">{apartment}</div>
            </div>
          )}

          <div className="pt-4 border-t">
            <Button variant="secondary" onClick={handleLogout} className="w-full">
              {t('logout')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}