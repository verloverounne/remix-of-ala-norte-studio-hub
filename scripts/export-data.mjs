/**
 * export-data.mjs
 * Exporta todas las tablas con datos de Supabase a archivos JSON
 * y descarga los archivos del bucket 'assets' de Storage.
 *
 * USO:
 *   1. Cloná el repo y corré: bun install
 *   2. Creá un archivo .env.local con las variables de Supabase (ver abajo)
 *   3. Corré: bun run scripts/export-data.mjs
 *   4. Los archivos quedan en la carpeta: exports/
 *
 * Variables necesarias en .env.local:
 *   VITE_SUPABASE_URL=https://svpfonykqarvvghanoaa.supabase.co
 *   VITE_SUPABASE_PUBLISHABLE_KEY=<tu-anon-key>
 */

import { createClient } from '@supabase/supabase-js'
import { writeFileSync, mkdirSync, existsSync } from 'fs'
import { join } from 'path'

// --- CONFIG ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('ERROR: Faltan variables de entorno VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_KEY')
  console.error('Crea un archivo .env.local con esas variables antes de correr este script.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Tablas con datos a exportar (en orden para respetar foreign keys)
const TABLES_WITH_DATA = [
  'categories',
  'subcategories',
  'equipment',
  'equipment_images',
  'gallery_images',
  'home_services',
  'service_sections',
  'contact_info',
  'equipos_hero_config',
  'services_hero',
  'spaces',
  'user_roles',
]

// Tablas sin datos (solo exportar schema via migraciones, no hay rows)
const EMPTY_TABLES = [
  'blog_articles', 'blog_categories', 'design_tokens',
  'equipment_availability', 'equipment_recommendations',
  'equipment_unavailability', 'profiles', 'quote_items',
  'quotes', 'reservations', 'space_unavailability',
]

// Bucket de Storage con archivos
const STORAGE_BUCKET = 'assets'

// --- SETUP OUTPUT DIR ---
const OUTPUT_DIR = join(process.cwd(), 'exports')
if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true })

console.log('\n=== EXPORTACION DE DATOS ALA NORTE ===')
console.log(`Destino: ${OUTPUT_DIR}\n`)

// --- EXPORTAR TABLAS ---
console.log('--- TABLAS ---')
for (const table of TABLES_WITH_DATA) {
  try {
    let allRows = []
    let from = 0
    const PAGE_SIZE = 1000

    // Paginacion para tablas grandes (equipment tiene 1107 rows)
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .range(from, from + PAGE_SIZE - 1)

      if (error) throw error
      if (!data || data.length === 0) break

      allRows = allRows.concat(data)
      if (data.length < PAGE_SIZE) break
      from += PAGE_SIZE
    }

    const outputPath = join(OUTPUT_DIR, `${table}.json`)
    writeFileSync(outputPath, JSON.stringify(allRows, null, 2), 'utf-8')
    console.log(`  [OK] ${table}: ${allRows.length} rows → ${table}.json`)
  } catch (err) {
    console.error(`  [ERROR] ${table}: ${err.message}`)
  }
}

// --- EXPORTAR STORAGE ---
console.log('\n--- STORAGE ---')
try {
  const { data: files, error: listError } = await supabase
    .storage
    .from(STORAGE_BUCKET)
    .list()

  if (listError) throw listError

  const storageDir = join(OUTPUT_DIR, 'storage', STORAGE_BUCKET)
  if (!existsSync(storageDir)) mkdirSync(storageDir, { recursive: true })

  for (const file of files) {
    if (file.name === '.emptyFolderPlaceholder') continue

    const { data: blob, error: dlError } = await supabase
      .storage
      .from(STORAGE_BUCKET)
      .download(file.name)

    if (dlError) {
      console.error(`  [ERROR] ${file.name}: ${dlError.message}`)
      continue
    }

    const buffer = Buffer.from(await blob.arrayBuffer())
    const filePath = join(storageDir, file.name)
    writeFileSync(filePath, buffer)
    console.log(`  [OK] assets/${file.name} (${Math.round(file.metadata?.size / 1024)} KB)`)
  }
} catch (err) {
  console.error(`  [ERROR] Storage: ${err.message}`)
}

// --- RESUMEN ---
console.log('\n=== EXPORTACION COMPLETA ===')
console.log(`Archivos en: ${OUTPUT_DIR}/`)
console.log('Tablas exportadas:', TABLES_WITH_DATA.length)
console.log('Tablas vacias (solo schema):', EMPTY_TABLES.length)
console.log('Storage bucket descargado: assets/')
console.log('\nProximo paso: importar al Cloud Server DonWeb.')
