require('dotenv').config({ path: '.env.local' })

const baseUrl = 'http://localhost:3001'
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const { createClient } = require('@supabase/supabase-js')

const admin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testFlow() {
  try {
    // 1. Get a test product
    console.log('\n=== STEP 1: Getting test product ===')
    const { data: products, error: fetchError } = await admin
      .from('products')
      .select('id, name, is_digital, digital_file_name, digital_file_path')
      .limit(1)

    if (fetchError || !products?.length) {
      console.error('Error fetching product:', fetchError)
      return
    }

    const product = products[0]
    console.log(`Product: ${product.name} (${product.id})`)
    console.log(`  Current is_digital: ${product.is_digital}`)
    console.log(`  Current digital_file_name: ${product.digital_file_name}`)
    console.log(`  Current digital_file_path: ${product.digital_file_path}`)

    // 2. Simulate form submission with digital file data
    console.log('\n=== STEP 2: Simulating form submission (PUT request) ===')

    const payload = {
      name: product.name,
      slug: 'test-slug',
      description: 'Test description',
      price: 5000,
      compare_price: null,
      stock: 0,
      made_to_order: false,
      is_digital: true,
      digital_file_name: 'test-file.pdf',
      digital_file_path: `${product.id}/file.pdf`,
      category_id: null,
      sku: null,
      is_featured: false,
      is_active: true,
      meta_title: null,
      meta_description: null,
      video_url: null,
    }

    console.log('Sending payload:', {
      is_digital: payload.is_digital,
      digital_file_name: payload.digital_file_name,
      digital_file_path: payload.digital_file_path,
    })

    // Try to make the PUT request
    const response = await fetch(`${baseUrl}/api/admin/productos/${product.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    console.log(`Response status: ${response.status}`)

    if (!response.ok) {
      const error = await response.json()
      console.error('Error from API:', error)
      return
    }

    const result = await response.json()
    console.log('API response:', {
      is_digital: result.is_digital,
      digital_file_name: result.digital_file_name,
      digital_file_path: result.digital_file_path,
    })

    // 3. Verify the data in DB
    console.log('\n=== STEP 3: Verifying data in DB ===')

    const { data: updated, error: verifyError } = await admin
      .from('products')
      .select('id, is_digital, digital_file_name, digital_file_path')
      .eq('id', product.id)
      .single()

    if (verifyError) {
      console.error('Verification error:', verifyError)
      return
    }

    console.log('Data in DB:')
    console.log(`  is_digital: ${updated.is_digital}`)
    console.log(`  digital_file_name: ${updated.digital_file_name}`)
    console.log(`  digital_file_path: ${updated.digital_file_path}`)

    if (updated.is_digital && updated.digital_file_name && updated.digital_file_path) {
      console.log('\n✅ SUCCESS: All data was saved correctly!')
    } else {
      console.log('\n❌ FAILURE: Some data was not saved')
    }

  } catch (err) {
    console.error('Test failed:', err)
  }
}

testFlow()
