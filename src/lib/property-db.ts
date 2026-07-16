import type { Property } from '@/types'

function normalizeExternalUrl(value?: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  if (!trimmed) return null
  if (/^https?:\/\//i.test(trimmed)) return trimmed
  return `https://${trimmed}`
}

/** Máximo de inmuebles destacados en la página de inicio (home). */
export const MAX_FEATURED_ON_HOME = 3

/** Coherente con el filtro de la home ante valores raros desde DB. */
export function isFeaturedFlag(value: unknown): boolean {
  return value === true || value === 'true' || value === 't' || value === 1
}

/**
 * ¿Activar destacada superaría el cupo? Si esta fila ya es destacada, no ocupa “nuevo” cupo.
 */
export function wouldExceedFeaturedHomeLimit(
  rows: { id: string; featured: unknown }[],
  opts: { wantFeatured: boolean; editingPropertyId: string | null }
): boolean {
  if (!opts.wantFeatured) return false
  const featuredIds = rows.filter((r) => isFeaturedFlag(r.featured)).map((r) => r.id)
  if (opts.editingPropertyId && featuredIds.includes(opts.editingPropertyId)) return false
  return featuredIds.length >= MAX_FEATURED_ON_HOME
}

export type PropertyRow = {
  id: string
  title: string
  price: number
  location: string
  type: string
  operation: string | null
  status: string
  description: string
  images: string
  fotocasa_url: string | null
  bedrooms: number | null
  bathrooms: number | null
  sq_meters: number | null
  availability: string | null
  hot_water: string | null
  heating: string | null
  condition: string | null
  property_age: string | null
  floor: string | null
  garage: string | null
  elevator: string | null
  furnished: string | null
  energy_rating: string | null
  energy_value: number | null
  emissions_rating: string | null
  emissions_value: number | null
  featured: boolean
  created_at: string
  updated_at: string
}

export function rowToProperty(r: PropertyRow): Property {
  return {
    id: r.id,
    title: r.title,
    price: r.price,
    location: r.location,
    type: r.type,
    operation: r.operation || 'venta',
    status: r.status,
    description: r.description,
    images: r.images,
    fotocasaUrl: r.fotocasa_url,
    bedrooms: r.bedrooms,
    bathrooms: r.bathrooms,
    sqMeters: r.sq_meters,
    availability: r.availability,
    hotWater: r.hot_water,
    heating: r.heating,
    condition: r.condition,
    propertyAge: r.property_age,
    floor: r.floor,
    garage: r.garage,
    elevator: r.elevator,
    furnished: r.furnished,
    energyRating: r.energy_rating,
    energyValue: r.energy_value,
    emissionsRating: r.emissions_rating,
    emissionsValue: r.emissions_value,
    featured: r.featured,
    createdAt: new Date(r.created_at),
    updatedAt: new Date(r.updated_at),
  }
}

export function rowsToProperties(rows: PropertyRow[] | null): Property[] {
  if (!rows?.length) return []
  return rows.map(rowToProperty)
}

export type PropertyInsert = {
  title: string
  price: number
  location: string
  type: string
  operation: string
  status: string
  description: string
  images: string
  fotocasa_url: string | null
  bedrooms: number | null
  bathrooms: number | null
  sq_meters: number | null
  availability: string | null
  hot_water: string | null
  heating: string | null
  condition: string | null
  property_age: string | null
  floor: string | null
  garage: string | null
  elevator: string | null
  furnished: string | null
  energy_rating: string | null
  energy_value: number | null
  emissions_rating: string | null
  emissions_value: number | null
  featured: boolean
}

export function insertToProperty(id: string, body: PropertyInsert, existing?: Property): Property {
  const now = new Date()
  if (existing) {
    return {
      ...existing,
      title: body.title,
      price: body.price,
      location: body.location,
      type: body.type,
      operation: body.operation,
      status: body.status,
      description: body.description,
      images: body.images,
      fotocasaUrl: body.fotocasa_url,
      bedrooms: body.bedrooms,
      bathrooms: body.bathrooms,
      sqMeters: body.sq_meters,
      availability: body.availability,
      hotWater: body.hot_water,
      heating: body.heating,
      condition: body.condition,
      propertyAge: body.property_age,
      floor: body.floor,
      garage: body.garage,
      elevator: body.elevator,
      furnished: body.furnished,
      energyRating: body.energy_rating,
      energyValue: body.energy_value,
      emissionsRating: body.emissions_rating,
      emissionsValue: body.emissions_value,
      featured: body.featured,
      updatedAt: now,
    }
  }

  return {
    id,
    title: body.title,
    price: body.price,
    location: body.location,
    type: body.type,
    operation: body.operation,
    status: body.status,
    description: body.description,
    images: body.images,
    fotocasaUrl: body.fotocasa_url,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    sqMeters: body.sq_meters,
    availability: body.availability,
    hotWater: body.hot_water,
    heating: body.heating,
    condition: body.condition,
    propertyAge: body.property_age,
    floor: body.floor,
    garage: body.garage,
    elevator: body.elevator,
    furnished: body.furnished,
    energyRating: body.energy_rating,
    energyValue: body.energy_value,
    emissionsRating: body.emissions_rating,
    emissionsValue: body.emissions_value,
    featured: body.featured,
    createdAt: now,
    updatedAt: now,
  }
}

export function propertyInsertToRow(
  id: string,
  body: PropertyInsert,
  timestamps?: { created_at?: string; updated_at?: string }
): PropertyRow {
  const now = new Date().toISOString()
  return {
    id,
    title: body.title,
    price: body.price,
    location: body.location,
    type: body.type,
    operation: body.operation,
    status: body.status,
    description: body.description,
    images: body.images,
    fotocasa_url: body.fotocasa_url,
    bedrooms: body.bedrooms,
    bathrooms: body.bathrooms,
    sq_meters: body.sq_meters,
    availability: body.availability,
    hot_water: body.hot_water,
    heating: body.heating,
    condition: body.condition,
    property_age: body.property_age,
    floor: body.floor,
    garage: body.garage,
    elevator: body.elevator,
    furnished: body.furnished,
    energy_rating: body.energy_rating,
    energy_value: body.energy_value,
    emissions_rating: body.emissions_rating,
    emissions_value: body.emissions_value,
    featured: body.featured,
    created_at: timestamps?.created_at ?? now,
    updated_at: timestamps?.updated_at ?? now,
  }
}

export function bodyToInsert(body: {
  title: string
  price: string | number
  location: string
  type: string
  operation?: string
  status?: string
  description: string
  images: string | string[]
  fotocasaUrl?: string | null
  bedrooms?: string | number | null
  bathrooms?: string | number | null
  sqMeters?: string | number | null
  availability?: string | null
  hotWater?: string | null
  heating?: string | null
  condition?: string | null
  propertyAge?: string | null
  floor?: string | null
  garage?: string | null
  elevator?: string | null
  furnished?: string | null
  energyRating?: string | null
  energyValue?: string | number | null
  emissionsRating?: string | null
  emissionsValue?: string | number | null
  featured?: boolean
}): PropertyInsert {
  const imagesStr = Array.isArray(body.images) ? JSON.stringify(body.images) : String(body.images)
  return {
    title: body.title,
    price: typeof body.price === 'number' ? body.price : parseFloat(String(body.price)),
    location: body.location,
    type: body.type,
    operation: body.operation || 'venta',
    status: body.status || 'disponible',
    description: body.description,
    images: imagesStr,
    fotocasa_url: normalizeExternalUrl(body.fotocasaUrl),
    bedrooms: body.bedrooms !== undefined && body.bedrooms !== '' && body.bedrooms !== null
      ? parseInt(String(body.bedrooms), 10)
      : null,
    bathrooms: body.bathrooms !== undefined && body.bathrooms !== '' && body.bathrooms !== null
      ? parseInt(String(body.bathrooms), 10)
      : null,
    sq_meters: body.sqMeters !== undefined && body.sqMeters !== '' && body.sqMeters !== null
      ? parseFloat(String(body.sqMeters))
      : null,
    availability: body.availability || null,
    hot_water: body.hotWater || null,
    heating: body.heating || null,
    condition: body.condition || null,
    property_age: body.propertyAge || null,
    floor: body.floor || null,
    garage: body.garage || null,
    elevator: body.elevator || null,
    furnished: body.furnished || null,
    energy_rating: body.energyRating || null,
    energy_value: body.energyValue !== undefined && body.energyValue !== '' && body.energyValue !== null
      ? parseFloat(String(body.energyValue))
      : null,
    emissions_rating: body.emissionsRating || null,
    emissions_value: body.emissionsValue !== undefined && body.emissionsValue !== '' && body.emissionsValue !== null
      ? parseFloat(String(body.emissionsValue))
      : null,
    featured: Boolean(body.featured),
  }
}
