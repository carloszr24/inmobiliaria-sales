import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import {
  createPropertyRecord,
  listProperties,
  parsePropertyBody,
  slugifyId,
} from '@/lib/properties-repository'
import { wouldExceedFeaturedHomeLimit } from '@/lib/property-db'
import { getAllProperties } from '@/lib/properties-store'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function revalidatePropertyPages() {
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath('/propiedades/[id]', 'page')
}

export async function GET() {
  return NextResponse.json(await getAllProperties())
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const body = await request.json()
  const insert = parsePropertyBody(body)
  const catalog = await listProperties()

  if (
    wouldExceedFeaturedHomeLimit(
      catalog.map((p) => ({ id: p.id, featured: p.featured })),
      { wantFeatured: insert.featured, editingPropertyId: null }
    )
  ) {
    return NextResponse.json({ error: 'Máximo de destacadas en la home alcanzado' }, { status: 400 })
  }

  try {
    const property = await createPropertyRecord(insert, slugifyId(insert.title))
    revalidatePropertyPages()
    return NextResponse.json(property, { status: 201 })
  } catch (error) {
    console.error('Error al crear propiedad:', error)
    return NextResponse.json({ error: 'No se pudo guardar la propiedad' }, { status: 500 })
  }
}
