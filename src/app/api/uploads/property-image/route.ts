import { mkdir, unlink, writeFile } from 'fs/promises'
import path from 'path'
import sharp from 'sharp'
import { NextRequest, NextResponse } from 'next/server'
import { getAdminTokenFromRequest, verifyAdminSessionToken } from '@/lib/admin-session'
import { createSupabaseAdmin, isSupabaseConfigured, PROPERTY_IMAGES_BUCKET } from '@/lib/supabase-server'

const MAX_BYTES = 15 * 1024 * 1024
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])
const TARGET_BYTES = 200 * 1024
const MAX_DIMENSION = 1920
const QUALITY_STEPS = [82, 74, 66, 58, 50, 42, 34]

function unauthorized() {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 })
}

function publicImagesDir(...segments: string[]) {
  return path.join(process.cwd(), 'public', 'images', ...segments)
}

/** Redimensiona a un maximo de 1920px y comprime a ~200KB, probando calidades
 * decrecientes de JPEG. Siempre devuelve un resultado (usa la ultima calidad
 * probada si no llega al objetivo) para no bloquear la subida. */
async function compressImage(input: Buffer): Promise<Buffer> {
  const resized = sharp(input)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })

  let last: Buffer | null = null
  for (const quality of QUALITY_STEPS) {
    const out = await resized.clone().jpeg({ quality, mozjpeg: true }).toBuffer()
    last = out
    if (out.byteLength <= TARGET_BYTES) return out
  }
  return last as Buffer
}

async function uploadToSupabase(objectPath: string, buffer: Buffer, contentType: string) {
  const supabase = createSupabaseAdmin()
  const { error } = await supabase.storage.from(PROPERTY_IMAGES_BUCKET).upload(objectPath, buffer, {
    contentType,
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
  if (file.size > MAX_BYTES) return badRequest('La imagen supera 15MB')

  let compressed: Buffer
  try {
    compressed = await compressImage(Buffer.from(await file.arrayBuffer()))
  } catch (error) {
    console.error('Error comprimiendo imagen:', error)
    return badRequest('No se pudo procesar la imagen. Prueba con otro archivo.')
  }

  const objectPath = `properties/${propertyId}/${crypto.randomUUID()}.jpg`

  if (isSupabaseConfigured()) {
    try {
      const publicUrl = await uploadToSupabase(objectPath, compressed, 'image/jpeg')
      return NextResponse.json({ url: publicUrl, path: objectPath })
    } catch (error) {
      console.error('Error subiendo imagen a Supabase:', error)
      return NextResponse.json({ error: 'No se pudo guardar la imagen' }, { status: 500 })
    }
  }

  const diskPath = publicImagesDir(objectPath)
  try {
    await mkdir(path.dirname(diskPath), { recursive: true })
    await writeFile(diskPath, compressed)
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
