import { promises as fs } from 'fs'
import path from 'path'
import type { Property } from '@/types'

const CATALOG_FILE = path.join(process.cwd(), 'data', 'catalog.json')
const BLOB_KEY = 'inmobiliaria-sales-catalog.json'

type StoredProperty = Omit<Property, 'createdAt' | 'updatedAt'> & {
  createdAt: string
  updatedAt: string
}

function toStored(property: Property): StoredProperty {
  return {
    ...property,
    createdAt: property.createdAt.toISOString(),
    updatedAt: property.updatedAt.toISOString(),
  }
}

function fromStored(row: StoredProperty): Property {
  return {
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }
}

async function readFromBlob(): Promise<Property[] | null> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return null
  try {
    const { list } = await import('@vercel/blob')
    const { blobs } = await list({ prefix: BLOB_KEY, limit: 1 })
    if (!blobs.length) return null
    const res = await fetch(blobs[0].url, { cache: 'no-store' })
    if (!res.ok) return null
    const rows = (await res.json()) as StoredProperty[]
    return rows.map(fromStored)
  } catch {
    return null
  }
}

async function writeToBlob(properties: Property[]): Promise<boolean> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return false
  try {
    const { put } = await import('@vercel/blob')
    const body = JSON.stringify(properties.map(toStored), null, 2)
    await put(BLOB_KEY, body, { access: 'public', addRandomSuffix: false })
    return true
  } catch {
    return false
  }
}

async function readFromFile(): Promise<Property[]> {
  try {
    const raw = await fs.readFile(CATALOG_FILE, 'utf8')
    const rows = JSON.parse(raw) as StoredProperty[]
    return rows.map(fromStored)
  } catch {
    return []
  }
}

async function writeToFile(properties: Property[]): Promise<void> {
  await fs.mkdir(path.dirname(CATALOG_FILE), { recursive: true })
  await fs.writeFile(CATALOG_FILE, JSON.stringify(properties.map(toStored), null, 2), 'utf8')
}

export async function readCatalog(): Promise<Property[]> {
  const fromBlob = await readFromBlob()
  if (fromBlob) return fromBlob
  return readFromFile()
}

export async function writeCatalog(properties: Property[]): Promise<void> {
  const blobOk = await writeToBlob(properties)
  if (blobOk) {
    try {
      await writeToFile(properties)
    } catch {
      // En Vercel el disco es de solo lectura; el blob ya guardó el catálogo.
    }
    return
  }
  await writeToFile(properties)
}

export function slugifyId(title: string): string {
  const base = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
  const suffix = Date.now().toString(36).slice(-4)
  return `${base || 'propiedad'}-${suffix}`
}
