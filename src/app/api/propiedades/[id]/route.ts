import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import {
  deletePropertyRecord,
  getProperty,
  listProperties,
  parsePropertyBody,
  updatePropertyRecord,
} from '@/lib/properties-repository'
import { wouldExceedFeaturedHomeLimit } from '@/lib/property-db'

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function revalidatePropertyPages(id?: string) {
  revalidatePath('/')
  revalidatePath('/propiedades')
  revalidatePath('/propiedades/[id]', 'page')
  if (id) revalidatePath(`/propiedades/${id}`)
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const property = await getProperty(params.id)
  if (!property) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  return NextResponse.json(property)
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const catalog = await listProperties()
  if (!catalog.some((p) => p.id === params.id)) {
    return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
  }

  const body = await request.json()
  const insert = parsePropertyBody(body)

  if (
    wouldExceedFeaturedHomeLimit(
      catalog.map((p) => ({ id: p.id, featured: p.featured })),
      { wantFeatured: insert.featured, editingPropertyId: params.id }
    )
  ) {
    return NextResponse.json({ error: 'Máximo de destacadas en la home alcanzado' }, { status: 400 })
  }

  try {
    const updated = await updatePropertyRecord(params.id, insert)
    if (!updated) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    revalidatePropertyPages(params.id)
    return NextResponse.json(updated)
  } catch (error) {
    console.error('Error al actualizar propiedad:', error)
    return NextResponse.json({ error: 'No se pudo actualizar la propiedad' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  try {
    const deleted = await deletePropertyRecord(params.id)
    if (!deleted) return NextResponse.json({ error: 'No encontrada' }, { status: 404 })
    revalidatePropertyPages(params.id)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Error al eliminar propiedad:', error)
    return NextResponse.json({ error: 'No se pudo eliminar la propiedad' }, { status: 500 })
  }
}
