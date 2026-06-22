import { spawnSync } from 'child_process'
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

const env = { ...process.env, ...loadEnvFile(path.join(root, '.env.local')) }

const result = spawnSync(
  'npx',
  ['supabase', 'config', 'push', '--project-ref', 'wiubflbypiisxkbuldct', '--yes'],
  { cwd: root, env, stdio: 'inherit', shell: true }
)

process.exit(result.status ?? 1)