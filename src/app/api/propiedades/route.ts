import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { readCatalog, slugifyId, writeCatalog } from '@/lib/catalog-store'
import { bodyToInsert, wouldExceedFeaturedHomeLimit } from '@/lib/property-db'
import { getAllProperties } from '@/lib/properties-store'
import type { Property } from '@/types'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function revalidatePropertyPages() {
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath('/propiedades/[id]', 'page')
}

function insertToProperty(id: string, body: ReturnType<typeof bodyToInsert>): Property {
  const now = new Date()
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

export async function GET() {
  return NextResponse.json(await getAllProperties())
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const body = await request.json()
  const insert = bodyToInsert(body)
  const catalog = await readCatalog()

  if (
    wouldExceedFeaturedHomeLimit(
      catalog.map((p) => ({ id: p.id, featured: p.featured })),
      { wantFeatured: insert.featured, editingPropertyId: null }
    )
  ) {
    return NextResponse.json({ error: 'Máximo de destacadas en la home alcanzado' }, { status: 400 })
  }

  const id = slugifyId(insert.title)
  const property = insertToProperty(id, insert)
  await writeCatalog([property, ...catalog])
  revalidatePropertyPages()

  return NextResponse.json(property, { status: 201 })
}
