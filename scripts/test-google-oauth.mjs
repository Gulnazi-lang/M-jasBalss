/**
 * End-to-end Google OAuth readiness check (no browser needed).
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const env = {}
  for (const line of fs.readFileSync(filePath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim()
  }
  return env
}

const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env }
const url = env.NEXT_PUBLIC_SUPABASE_URL
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const site = env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

console.log('=== Google OAuth test ===\n')

const settingsRes = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
const settings = await settingsRes.json()
console.log('1. Supabase Google enabled:', settings.external?.google ? '✓ YES' : '✗ NO')

const supabase = createClient(url, key)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${site}/auth/callback?next=/lv`,
    skipBrowserRedirect: true,
  },
})

if (error) {
  console.log('2. OAuth URL error:', error.message)
  process.exit(1)
}

const res = await fetch(data.url, { redirect: 'manual' })
console.log('2. Authorize endpoint status:', res.status)

if (res.status === 302 || res.status === 303) {
  const loc = res.headers.get('location') || ''
  const ok = loc.includes('accounts.google.com')
  console.log('3. Redirects to Google:', ok ? '✓ YES' : '✗ NO')
  if (ok) console.log('\n✓ Google OAuth is ready! Test at http://localhost:3000/lv/auth/login')
  else console.log('   Location:', loc.slice(0, 120))
  process.exit(ok ? 0 : 1)
}

const body = await res.text()
console.log('3. Response:', body.slice(0, 200))
if (body.includes('provider is not enabled')) {
  console.log('\n✗ Enable Google in Supabase Dashboard → Authentication → Providers → Google')
}
process.exit(1)