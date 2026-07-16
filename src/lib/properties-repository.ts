import { readCatalog, slugifyId, writeCatalog } from '@/lib/catalog-store'
import {
  bodyToInsert,
  insertToProperty,
  propertyInsertToRow,
  rowToProperty,
  rowsToProperties,
  type PropertyInsert,
  type PropertyRow,
} from '@/lib/property-db'
import { createSupabaseAdmin, assertPropertyStorageConfigured, isSupabaseConfigured } from '@/lib/supabase-server'
import type { Property } from '@/types'

export { slugifyId }

async function listFromSupabase(): Promise<Property[]> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return rowsToProperties((data ?? []) as PropertyRow[])
}

async function getFromSupabase(id: string): Promise<Property | undefined> {
  const supabase = createSupabaseAdmin()
  const { data, error } = await supabase.from('properties').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? rowToProperty(data as PropertyRow) : undefined
}

export async function listProperties(): Promise<Property[]> {
  if (isSupabaseConfigured()) return listFromSupabase()
  return readCatalog()
}

export async function getProperty(id: string): Promise<Property | undefined> {
  if (isSupabaseConfigured()) return getFromSupabase(id)
  const catalog = await readCatalog()
  return catalog.find((p) => p.id === id)
}

export async function createPropertyRecord(insert: PropertyInsert, id?: string): Promise<Property> {
  assertPropertyStorageConfigured()
  const propertyId = id ?? slugifyId(insert.title)
  const property = insertToProperty(propertyId, insert)

  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdmin()
    const row = propertyInsertToRow(propertyId, insert)
    const { data, error } = await supabase.from('properties').insert(row).select('*').single()
    if (error) throw error
    return rowToProperty(data as PropertyRow)
  }

  const catalog = await readCatalog()
  await writeCatalog([property, ...catalog])
  return property
}

export async function updatePropertyRecord(id: string, insert: PropertyInsert): Promise<Property | null> {
  assertPropertyStorageConfigured()
  if (isSupabaseConfigured()) {
    const existing = await getFromSupabase(id)
    if (!existing) return null

    const supabase = createSupabaseAdmin()
    const row = propertyInsertToRow(id, insert, { created_at: existing.createdAt.toISOString() })
    const { data, error } = await supabase.from('properties').update(row).eq('id', id).select('*').single()
    if (error) throw error
    return rowToProperty(data as PropertyRow)
  }

  const catalog = await readCatalog()
  const index = catalog.findIndex((p) => p.id === id)
  if (index === -1) return null

  const updated = insertToProperty(id, insert, catalog[index])
  const next = [...catalog]
  next[index] = updated
  await writeCatalog(next)
  return updated
}

export async function deletePropertyRecord(id: string): Promise<boolean> {
  assertPropertyStorageConfigured()
  if (isSupabaseConfigured()) {
    const supabase = createSupabaseAdmin()
    const { error, count } = await supabase.from('properties').delete({ count: 'exact' }).eq('id', id)
    if (error) throw error
    return (count ?? 0) > 0
  }

  const catalog = await readCatalog()
  const next = catalog.filter((p) => p.id !== id)
  if (next.length === catalog.length) return false
  await writeCatalog(next)
  return true
}

export function parsePropertyBody(body: unknown): PropertyInsert {
  return bodyToInsert(body as Parameters<typeof bodyToInsert>[0])
}
