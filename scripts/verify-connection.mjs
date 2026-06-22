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
const supabase = createClient(url, key)

console.log('=== MājasBalss.lv — Connection verify ===\n')

const { data: houses, error: housesErr } = await supabase
  .from('houses')
  .select('slug, address, lat, lng')
  .not('lat', 'is', null)

console.log(housesErr ? `❌ houses: ${housesErr.message}` : `✓ houses: ${houses?.length ?? 0} with map coords`)
for (const h of houses ?? []) console.log(`    ${h.slug}: ${h.address}`)

const { error: profilesErr } = await supabase.from('profiles').select('id').limit(1)
console.log(profilesErr ? `❌ profiles: ${profilesErr.message}` : '✓ profiles table OK')

const { data: oauth, error: oauthErr } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback?next=/lv`,
    skipBrowserRedirect: true,
  },
})

if (oauthErr) {
  console.log(`❌ OAuth URL: ${oauthErr.message}`)
} else {
  console.log('✓ OAuth authorize URL generated')
  console.log(`  ${oauth.url?.slice(0, 80)}...`)
}

const settingsRes = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: key } })
const settings = await settingsRes.json()
console.log(settings.external?.google ? '✓ Google provider ENABLED' : '❌ Google provider DISABLED (needs enable)')
console.log(settings.external?.email ? '✓ Email provider enabled' : '❌ Email disabled')