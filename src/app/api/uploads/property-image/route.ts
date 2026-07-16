import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { createSupabaseAdmin, isSupabaseConfigured, PROPERTY_IMAGES_BUCKET } from '@/lib/supabase-server'

const MAX_BYTES = 5 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function getExt(file: File): string {
  const byType: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
  }
  return byType[file.type] || 'jpg'
}

function publicImagesDir(...segments: string[]) {
  return path.join(process.cwd(), 'public', 'images', ...segments)
}

async function uploadToSupabase(objectPath: string, file: File) {
  const supabase = createSupabaseAdmin()
  const buffer = Buffer.from(await file.arrayBuffer())
  const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).upload(objectPath, buffer, {
    contentType: file.type,
    upsert: false,
  })
  if (error) throw error
  const { data } = supabase.storage.from(PROPERTY_IMAGES_BUCKET).getPublicUrl(objectPath)
  return data.publicUrl
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  const propertyId = request.nextUrl.searchParams.get('propertyId')?.trim()
  if (!propertyId) return badRequest('Falta propertyId')

  const form = await request.formData()
  const file = form.get('file')
  if (!(file instanceof File)) return badRequest('Falta file')
  if (!ALLOWED_TYPES.has(file.type)) return badRequest('Tipo no permitido (jpg/png/webp)')
  if (file.size > MAX_BYTES) return badRequest('La imagen supera 5MB')

  const ext = getExt(file)
  const objectPath = `properties/${propertyId}/${crypto.randomUUID()}.${ext}`

  if (isSupabaseConfigured()) {
    try {
      const publicUrl = await uploadToSupabase(objectPath, file)
      return NextResponse.json({ url: publicUrl, path: objectPath })
    } catch (error) {
      console.error('Error subiendo imagen a Supabase:', error)
      return NextResponse.json({ error: 'No se pudo guardar la imagen' }, { status: 500 })
    }
  }

  const diskPath = publicImagesDir(objectPath)
  try {
    await mkdir(path.dirname(diskPath), { recursive: true })
    await writeFile(diskPath, Buffer.from(await file.arrayBuffer()))
  } catch {
    return NextResponse.json(
      { error: 'No se pudo guardar la imagen en el servidor. Añade las fotos en public/images/.' },
      { status: 500 }
    )
  }

  const publicUrl = `/images/${objectPath}`
  return NextResponse.json({ url: publicUrl, path: objectPath })
}

export async function DELETE(request: NextRequest) {
  if (!verifyAdminSessionToken(getAdminTokenFromRequest(request))) {
    return unauthorized()
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    body = null
  }

  const objectPath = (body as { path?: string } | null)?.path?.trim()
  if (!objectPath) return badRequest('Falta path')
  if (!objectPath.startsWith('properties/')) return badRequest('Ruta no valida')

  if (isSupabaseConfigured()) {
    try {
      const supabase = createSupabaseAdmin()
      const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).remove([objectPath])
      if (error) throw error
      return NextResponse.json({ ok: true })
    } catch (error) {
      console.error('Error eliminando imagen de Supabase:', error)
      return NextResponse.json({ error: 'No se pudo eliminar la imagen' }, { status: 500 })
    }
  }

  try {
    await unlink(publicImagesDir(objectPath))
  } catch {
    return NextResponse.json({ error: 'No se pudo eliminar la imagen' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
