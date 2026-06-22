/**
 * Enable Google OAuth on Supabase project via Management API.
 *
 * Requires:
 *   SUPABASE_ACCESS_TOKEN — https://supabase.com/dashboard/account/tokens
 *   GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET in .env.local
 *
 * Also add to Google Cloud Console → OAuth client → Authorized redirect URIs:
 *   https://wiubflbypiisxkbuldct.supabase.co/auth/v1/callback
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const projectRef = 'wiubflbypiisxkbuldct'

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

const cliToken = process.argv.find((a) => a.startsWith('--token='))?.split('=')[1]
const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env }
const token = cliToken || env.SUPABASE_ACCESS_TOKEN
const clientId = env.GOOGLE_CLIENT_ID
const clientSecret = env.GOOGLE_CLIENT_SECRET

if (!token) {
  console.error('❌ SUPABASE_ACCESS_TOKEN missing.')
  console.error('   Create at: https://supabase.com/dashboard/account/tokens')
  console.error('   Add to .env.local → run: node scripts/enable-google-oauth.mjs')
  process.exit(1)
}

if (!clientId || !clientSecret) {
  console.error('❌ GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing in .env.local')
  process.exit(1)
}

const headers = {
  Authorization: `Bearer ${token}`,
  'Content-Type': 'application/json',
}

// 1. Auth URL config
const urlConfig = {
  site_url: env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  additional_redirect_urls: [
    'http://localhost:3000/auth/callback',
    'http://127.0.0.1:3000/auth/callback',
  ],
}

const authBody = {
  site_url: urlConfig.site_url,
  uri_allow_list: urlConfig.additional_redirect_urls.join('\n'),
  external_google_enabled: true,
  external_google_client_id: clientId,
  external_google_secret: clientSecret,
}

let res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
  method: 'PATCH',
  headers,
  body: JSON.stringify(authBody),
})

if (!res.ok && res.status === 404) {
  res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/config/auth`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(authBody),
  })
}

if (!res.ok) {
  const text = await res.text()
  console.error('❌ Auth config update failed:', res.status, text)
  process.exit(1)
}

console.log('✓ Google OAuth enabled in Supabase')
console.log('✓ Site URL:', urlConfig.site_url)
console.log('✓ Redirect URLs:', urlConfig.additional_redirect_urls.join(', '))
console.log('\nEnsure Google Cloud redirect URI:')
console.log(`  https://${projectRef}.supabase.co/auth/v1/callback`)