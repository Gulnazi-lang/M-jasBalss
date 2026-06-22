/**
 * Apply Supabase SQL migrations to the remote database.
 *
 * Requires one of:
 *   DATABASE_URL=postgresql://postgres:[PASSWORD]@db.wiubflbypiisxkbuldct.supabase.co:5432/postgres
 *   SUPABASE_DB_PASSWORD=[your database password]
 *
 * Usage: npm run db:migrate
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import pg from 'pg'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const migrationsDir = path.join(root, 'supabase', 'migrations')
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

function getDatabaseUrls(env) {
  if (env.DATABASE_URL) return [env.DATABASE_URL]

  const password = env.SUPABASE_DB_PASSWORD
  if (!password) return []

  const enc = encodeURIComponent(password)
  const region = env.SUPABASE_DB_REGION || 'eu-west-1'
  const user = `postgres.${projectRef}`

  return [
    `postgresql://${user}:${enc}@aws-0-${region}.pooler.supabase.com:6543/postgres`,
    `postgresql://${user}:${enc}@aws-0-${region}.pooler.supabase.com:5432/postgres`,
    `postgresql://postgres:${enc}@db.${projectRef}.supabase.co:5432/postgres`,
  ]
}

const env = { ...loadEnvFile(path.join(root, '.env.local')), ...process.env }
const databaseUrls = getDatabaseUrls(env)

if (!databaseUrls.length) {
  console.error(`
❌ Database password not found.

Add to .env.local (from Supabase Dashboard → Project Settings → Database):

  SUPABASE_DB_PASSWORD=your-database-password

Or full connection string:

  DATABASE_URL=postgresql://postgres:[PASSWORD]@db.${projectRef}.supabase.co:5432/postgres

Then run: npm run db:migrate
`)
  process.exit(1)
}

const files = fs
  .readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()

let lastError = null

for (const databaseUrl of databaseUrls) {
  const client = new pg.Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 15000,
  })

  try {
    await client.connect()
    console.log(`✓ Connected to ${projectRef}`)

    for (const file of files) {
      const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8')
      process.stdout.write(`→ ${file} ... `)
      await client.query(sql)
      console.log('OK')
    }

    const { rows } = await client.query(`
      select table_name
      from information_schema.tables
      where table_schema = 'public'
      order by table_name
    `)
    console.log('\n✓ Tables:', rows.map((r) => r.table_name).join(', '))
    await client.end()
    process.exit(0)
  } catch (err) {
    const safe = databaseUrl.replace(env.SUPABASE_DB_PASSWORD ?? '', '***')
    console.error(`  ✗ ${safe.split('@')[1] ?? safe} → ${err.message}`)
    lastError = err
    try { await client.end() } catch {}
  }
}

console.error('\n❌ Migration failed:', lastError?.message ?? 'Could not connect')
console.error('\nIf password is correct, run supabase/full_setup.sql in Dashboard → SQL Editor')
process.exit(1)