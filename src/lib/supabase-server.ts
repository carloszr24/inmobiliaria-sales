import { createClient } from '@supabase/supabase-js'

export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() &&
      process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  )
}

export function isServerFilesystemWritable(): boolean {
  return !process.env.VERCEL
}

export function assertPropertyStorageConfigured(): void {
  if (isSupabaseConfigured()) return
  if (isServerFilesystemWritable()) return
  throw new Error(
    'Almacenamiento no configurado en producción. Añade NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY en Vercel.'
  )
}

export function createSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim()
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()
  if (!url || !key) {
    throw new Error('Supabase no configurado: faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export const PROPERTY_IMAGES_BUCKET = 'property-images'
