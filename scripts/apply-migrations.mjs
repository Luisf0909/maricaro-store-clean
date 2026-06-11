/**
 * apply-migrations.mjs
 * Applies all SQL migrations to a Supabase project via Management API
 * Usage: node scripts/apply-migrations.mjs <project-ref> <supabase-token>
 */

import { readFileSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const migrationsDir = join(__dirname, '../supabase/migrations')

const [,, projectRef, sbToken] = process.argv

if (!projectRef || !sbToken) {
  console.error('Usage: node scripts/apply-migrations.mjs <project-ref> <supabase-token>')
  process.exit(1)
}

async function runSQL(sql, label) {
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sbToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: sql }),
    }
  )

  const text = await response.text()

  if (!response.ok) {
    let errMsg = text
    try { errMsg = JSON.parse(text)?.message ?? text } catch {}
    console.log(`  ❌ ${label}: ${errMsg?.slice(0, 120)}`)
    return false
  }

  console.log(`  ✅ ${label}`)
  return true
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`   MIGRACIONES → ${projectRef}`)
  console.log(`${'═'.repeat(60)}\n`)

  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort()

  let ok = 0, fail = 0

  for (const file of files) {
    const sql = readFileSync(join(migrationsDir, file), 'utf-8').trim()
    if (sql.length < 5) { console.log(`  ⏭  ${file} (vacío)`); continue }

    const success = await runSQL(sql, file)
    if (success) ok++; else fail++

    // Small delay between migrations
    await new Promise(r => setTimeout(r, 400))
  }

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`   ✅ OK: ${ok}  ❌ Errores: ${fail}`)
  console.log(`${'═'.repeat(60)}\n`)

  if (fail > 0) process.exit(1)
}

main().catch(err => { console.error(err); process.exit(1) })
