import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { readCatalog, writeCatalog } from '@/lib/catalog-store'
import { bodyToInsert, wouldExceedFeaturedHomeLimit } from '@/lib/property-db'
import { getPropertyById } from '@/lib/properties-store'
import type { Property } from '@/types'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function revalidatePropertyPages(id?: string) {
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath('/propiedades/[id]', 'page')
  if (id) revalidatePath(`/propiedades/${id}`)
}

function applyInsertToProperty(existing: Property, body: ReturnType<typeof bodyToInsert>): Property {
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
    updatedAt: new Date(),
  }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const property = await getPropertyById(params.id)
  if (!property) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(property)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const catalog = await readCatalog()
  const index = catalog.findIndex((p) => p.id === params.id)
  if (index === -1) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }

  const body = await request.json()
  const insert = bodyToInsert(body)

  if (
    wouldExceedFeaturedHomeLimit(
      catalog.map((p) => ({ id: p.id, featured: p.featured })),
      { wantFeatured: insert.featured, editingPropertyId: params.id }
    )
  ) {
    return NextResponse.json({ error: 'Máximo de destacadas en la home alcanzado' }, { status: 400 })
  }

  const updated = applyInsertToProperty(catalog[index], insert)
  const next = [...catalog]
  next[index] = updated
  await writeCatalog(next)
  revalidatePropertyPages(params.id)

  return NextResponse.json(updated)
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const catalog = await readCatalog()
  const next = catalog.filter((p) => p.id !== params.id)
  if (next.length === catalog.length) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }

  await writeCatalog(next)
  revalidatePropertyPages(params.id)

  return NextResponse.json({ ok: true })
}
