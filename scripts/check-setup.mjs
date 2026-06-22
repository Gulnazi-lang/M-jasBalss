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

console.log('MājasBalss.lv — Supabase setup check\n')

if (!url || !key || url.includes('your-project')) {
  console.log('❌ .env.local: missing Supabase URL or anon key')
  process.exit(1)
}
console.log('✓ .env.local configured')
console.log(`  URL: ${url}`)

const supabase = createClient(url, key)

const tables = ['houses', 'residents', 'problems', 'polls', 'votes', 'protocols', 'profiles']
let tablesOk = true
let rlsRecursion = false
for (const table of tables) {
  const { error } = await supabase.from(table).select('id').limit(1)
  if (error) {
    console.log(`❌ Table "${table}": ${error.message}`)
    if (error.message.includes('infinite recursion')) rlsRecursion = true
    tablesOk = false
  } else {
    console.log(`✓ Table "${table}" exists`)
  }
}

const settingsRes = await fetch(`${url}/auth/v1/settings`, {
  headers: { apikey: key },
})
const settings = await settingsRes.json()
const googleEnabled = settings?.external?.google === true
const emailEnabled = settings?.external?.email === true

console.log(`\nAuth providers:`)
console.log(googleEnabled ? '✓ Google OAuth enabled' : '❌ Google OAuth disabled — enable in Supabase Dashboard')
console.log(emailEnabled ? '✓ Email auth enabled' : '❌ Email auth disabled')

if (!googleEnabled) {
  console.log(`
Google OAuth setup (Supabase Dashboard → Authentication → Providers → Google):
  1. Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client
  2. Authorized redirect URI:
     ${url}/auth/v1/callback
  3. Paste Client ID + Secret into Supabase Google provider → Enable

Supabase Dashboard → Authentication → URL Configuration:
  Site URL: http://localhost:3000
  Redirect URLs:
    http://localhost:3000/auth/callback
    http://127.0.0.1:3000/auth/callback
`)
}

if (rlsRecursion) {
  console.log(`
⚠ RLS recursion detected — run supabase/fix_rls.sql in SQL Editor
`)
}

if (!tablesOk && !rlsRecursion) {
  console.log(`
Tables missing — run supabase/full_setup.sql in SQL Editor
`)
  process.exit(1)
}

console.log('\n✓ Setup looks good!')
if (googleEnabled) console.log('Run: npm run google:test')