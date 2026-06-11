/**
 * setup-project.mjs
 * Creates admin user and loads product seed for a Supabase project
 * Usage: node scripts/setup-project.mjs <project-ref> <supabase-token> <admin-email> <admin-password>
 */

const [,, projectRef, sbToken, adminEmail, adminPassword] = process.argv

if (!projectRef || !sbToken || !adminEmail || !adminPassword) {
  console.error('Usage: node setup-project.mjs <ref> <token> <email> <password>')
  process.exit(1)
}

const BASE = `https://${projectRef}.supabase.co`
const MGMT = `https://api.supabase.com/v1/projects/${projectRef}`

const mgmtHeaders = {
  'Authorization': `Bearer ${sbToken}`,
  'Content-Type': 'application/json',
}

async function runSQL(sql) {
  const r = await fetch(`${MGMT}/database/query`, {
    method: 'POST',
    headers: mgmtHeaders,
    body: JSON.stringify({ query: sql }),
  })
  const text = await r.text()
  if (!r.ok) throw new Error(JSON.parse(text)?.message ?? text)
  return JSON.parse(text)
}

async function createAdminUser() {
  console.log(`\n👤  Creando usuario admin: ${adminEmail}`)

  // Create user via Auth Admin API
  const r = await fetch(`${BASE}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': sbToken, // will use service_role from env - for now use mgmt token
      'Authorization': `Bearer ${sbToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { full_name: 'Administrador' },
    }),
  })

  const data = await r.json()

  if (data.id) {
    console.log(`  ✅ Usuario creado: ${data.id}`)

    // Set role to admin in profiles table
    await runSQL(`UPDATE profiles SET role = 'admin', full_name = 'Administrador' WHERE id = '${data.id}';`)
    console.log(`  ✅ Rol admin asignado`)
    return data.id
  } else if (data.msg?.includes('already registered') || data.code === 'email_exists') {
    console.log(`  ℹ️  Usuario ya existe`)
    const users = await fetch(`${BASE}/auth/v1/admin/users`, {
      headers: { 'Authorization': `Bearer ${sbToken}`, 'apikey': sbToken }
    }).then(r => r.json())
    const existing = users.users?.find(u => u.email === adminEmail)
    if (existing) {
      await runSQL(`UPDATE profiles SET role = 'admin' WHERE id = '${existing.id}';`)
      console.log(`  ✅ Rol admin confirmado para usuario existente`)
    }
  } else {
    console.log(`  ⚠️  Respuesta auth: ${JSON.stringify(data).slice(0, 200)}`)
  }
}

// Product seed data (abbreviated from main seed script)
async function loadProducts() {
  console.log(`\n📦  Cargando productos seed...`)

  // We'll invoke the SQL from the migration 015_seed.sql directly
  // since it already handles categories and products with ON CONFLICT
  const { readFileSync } = await import('fs')
  const { join, dirname } = await import('path')
  const { fileURLToPath } = await import('url')
  const __dir = dirname(fileURLToPath(import.meta.url))

  const seedSQL = readFileSync(join(__dir, '../supabase/migrations/015_seed.sql'), 'utf-8')

  try {
    await runSQL(seedSQL)
    console.log(`  ✅ Productos seed cargados (015_seed.sql)`)
  } catch (err) {
    console.log(`  ⚠️  Seed ya aplicado o error: ${err.message?.slice(0, 100)}`)
  }
}

async function main() {
  console.log(`\n${'═'.repeat(60)}`)
  console.log(`   SETUP → ${projectRef}`)
  console.log(`   Admin: ${adminEmail}`)
  console.log(`${'═'.repeat(60)}`)

  await createAdminUser()
  await loadProducts()

  console.log(`\n${'═'.repeat(60)}`)
  console.log(`   ✅  Setup completado`)
  console.log(`   🌐  URL: https://${projectRef}.supabase.co`)
  console.log(`${'═'.repeat(60)}\n`)
}

main().catch(err => { console.error('Fatal:', err); process.exit(1) })
