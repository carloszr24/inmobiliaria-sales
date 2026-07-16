import { listProperties } from '@/lib/properties-repository'
import { isFeaturedFlag, MAX_FEATURED_ON_HOME } from '@/lib/property-db'
import type { Property } from '@/types'
import type { PropertyFilters } from '@/types'

function hasExtra(value?: string | null): boolean {
  if (!value) return false
  const normalized = value.trim().toLowerCase()
  if (!normalized) return false
  return normalized === 'si' || normalized === 'sí' || normalized === 'true' || normalized.startsWith('con ')
}

function sortByDate(properties: Property[]): Property[] {
  return [...properties].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
}

export async function getAllProperties(): Promise<Property[]> {
  return sortByDate(await listProperties())
}

export async function getPropertyById(id: string): Promise<Property | undefined> {
  const properties = await listProperties()
  return properties.find((p) => p.id === id)
}

export function filterProperties(
  properties: Property[],
  searchParams: {
    type?: string
    operation?: string
    status?: string
    minPrice?: string
    maxPrice?: string
    extra?: string
  }
): Property[] {
  let list = [...properties]

  if (searchParams.type) list = list.filter((p) => p.type === searchParams.type)
  if (searchParams.operation) list = list.filter((p) => p.operation === searchParams.operation)
  if (searchParams.status) list = list.filter((p) => p.status === searchParams.status)
  if (searchParams.minPrice) {
    const min = parseFloat(searchParams.minPrice)
    if (!Number.isNaN(min)) list = list.filter((p) => p.price >= min)
  }
  if (searchParams.maxPrice) {
    const max = parseFloat(searchParams.maxPrice)
    if (!Number.isNaN(max)) list = list.filter((p) => p.price > 0 && p.price <= max)
  }

  if (searchParams.extra) {
    list = list.filter((property) => {
      switch (searchParams.extra) {
        case 'garage':
          return hasExtra(property.garage)
        case 'elevator':
          return hasExtra(property.elevator)
        case 'furnished':
          return hasExtra(property.furnished)
        case 'heating':
          return hasExtra(property.heating)
        default:
          return true
      }
    })
  }

  return list
}

export async function getFeaturedPropertiesForHome(): Promise<Property[]> {
  const catalog = await listProperties()
  const featured = catalog.filter((p) => isFeaturedFlag(p.featured))
  if (featured.length >= MAX_FEATURED_ON_HOME) {
    return featured.slice(0, MAX_FEATURED_ON_HOME)
  }
  const fill = [...featured]
  for (const p of catalog) {
    if (fill.length >= MAX_FEATURED_ON_HOME) break
    if (!fill.some((x) => x.id === p.id)) fill.push(p)
  }
  return fill
}

export function applyPropertyFilters(properties: Property[], filters: PropertyFilters): Property[] {
  let list = [...properties]
  if (filters.type) list = list.filter((p) => p.type === filters.type)
  if (filters.operation) list = list.filter((p) => p.operation === filters.operation)
  if (filters.status) list = list.filter((p) => p.status === filters.status)
  if (filters.minPrice != null) list = list.filter((p) => p.price >= filters.minPrice!)
  if (filters.maxPrice != null) list = list.filter((p) => p.price > 0 && p.price <= filters.maxPrice!)
  return list
}
