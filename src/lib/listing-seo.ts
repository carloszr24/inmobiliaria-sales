import type { Property } from '../types'
import { fixSpanishText, formatLocation, toSentenceCase, truncateAtWord } from './seo'
import { formatPrice, hasPrice, primaryType, TYPE_LABELS } from './utils'

const HEADLINE_TYPES: Record<string, string> = { ...TYPE_LABELS, chalet: 'Chalet', otros: 'Inmueble' }

const TYPE_SLUGS: Record<string, string> = {
  piso: 'piso',
  atico: 'atico',
  casa: 'casa',
  chalet: 'chalet',
  local: 'local',
  terreno: 'terreno',
  garaje: 'garaje',
  oficina: 'oficina',
  otros: 'inmueble',
}

function norm(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}

export function slugify(text: string): string {
  return norm(text).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

/** Precios claramente inventados o de relleno (0, 1, 8 EUR...) no deben salir en titulos ni meta. */
function plausiblePrice(p: Pick<Property, 'price' | 'operation'>): boolean {
  return p.operation === 'alquiler' ? p.price >= 50 : p.price >= 1000
}

/** Superficies imposibles para el tipo (ej. una casa de 15 m2) son errores de carga: no se publican en titulos ni meta. */
function plausibleArea(p: Pick<Property, 'sqMeters' | 'type'>): boolean {
  if (!p.sqMeters) return false
  const min = primaryType(p.type) === 'garaje' ? 5 : primaryType(p.type) === 'terreno' ? 20 : 25
  return p.sqMeters >= min
}

function isYes(value?: string | null): boolean {
  const v = (value ?? '').trim().toLowerCase()
  return v === 'sí' || v === 'si' || v === 'true' || v.startsWith('con ') || v.startsWith('semi')
}

// ---------- Slugs ----------

/** Los ids actuales terminan en un codigo de 4 caracteres (-r37w) que identifica la ficha. */
export function codeFromId(id: string): string {
  const match = id.match(/-([a-z0-9]{4})$/)
  return match ? match[1] : slugify(id)
}

export function propertySlug(p: Pick<Property, 'id' | 'type' | 'operation' | 'location'>): string {
  const type = TYPE_SLUGS[primaryType(p.type)] ?? 'inmueble'
  const operation = p.operation === 'alquiler' ? 'alquiler' : 'venta'
  const location = slugify(formatLocation(p.location || '')).slice(0, 40).replace(/-+$/, '')
  return [type, 'en', operation, location, codeFromId(p.id)].filter(Boolean).join('-')
}

export function propertyPath(p: Pick<Property, 'id' | 'type' | 'operation' | 'location'>): string {
  return `/propiedades/${propertySlug(p)}`
}

/** Resuelve la URL recibida: id antiguo, slug actual o slug desactualizado (por el codigo final). */
export function findPropertyByParam<T extends Pick<Property, 'id' | 'type' | 'operation' | 'location'>>(
  list: T[],
  param: string
): T | undefined {
  const exact = list.find((p) => p.id === param)
  if (exact) return exact
  const bySlug = list.find((p) => propertySlug(p) === param)
  if (bySlug) return bySlug
  const code = param.match(/-([a-z0-9]{4})$/)?.[1]
  if (!code) return undefined
  const matches = list.filter((p) => codeFromId(p.id) === code)
  return matches.length === 1 ? matches[0] : undefined
}

// ---------- H1 / titulo visible ----------

function generatedHeadline(p: Property, used: Set<string>): string {
  const type = HEADLINE_TYPES[primaryType(p.type)] ?? 'Inmueble'
  const operation = p.operation === 'alquiler' ? 'alquiler' : 'venta'
  const base = `${type} en ${operation} en ${formatLocation(p.location)}`
  const m2 = plausibleArea(p) ? `${p.sqMeters} m²` : null
  const rooms = p.bedrooms ? `${p.bedrooms} hab.` : null
  const price = plausiblePrice(p) ? formatPrice(p.price, p.operation) : null
  const ref = `Ref. ${codeFromId(p.id).toUpperCase()}`
  const tiers: (string | null)[][] = [[m2, rooms], [m2, rooms, price], [m2, rooms, price, ref]]
  for (const tier of tiers) {
    const candidate = [base, ...tier.filter(Boolean)].join(' · ')
    if (!used.has(norm(candidate))) return candidate
  }
  return `${base} · ${ref}`
}

/** Titulo de David con lo minimo: tildes y erratas corregidas y mayuscula inicial. Nada mas: se respeta su
 * redaccion y si lo escribio en mayusculas se queda en mayusculas. */
export function tidyTitle(title: string): string {
  const out = fixSpanishText(title.replace(/\s+/g, ' ').trim())
  return out.charAt(0).toUpperCase() + out.slice(1)
}

/** Titulo que se muestra (H1, tarjetas): el de David con correcciones minimas. Solo si la ficha no tiene
 * titulo se genera uno a partir de los datos. */
export function decorateProperties<T extends Property>(list: T[]): (T & { displayTitle: string })[] {
  const used = new Set<string>()
  return list.map((p) => {
    const tidy = tidyTitle(p.title || '')
    const displayTitle = tidy.length >= 3 ? tidy : generatedHeadline(p, used)
    used.add(norm(displayTitle))
    return { ...p, displayTitle }
  })
}

// ---------- <title> de la ficha ----------

export function buildSeoTitle(p: Property): string {
  const type = HEADLINE_TYPES[primaryType(p.type)] ?? 'Inmueble'
  const operation = p.operation === 'alquiler' ? 'alquiler' : 'venta'
  const location = formatLocation(p.location)
  const m2 = plausibleArea(p) ? `${p.sqMeters} m²` : null
  const price = plausiblePrice(p) ? formatPrice(p.price, p.operation) : null
  const join = (...parts: (string | null)[]) => parts.filter(Boolean).join(' · ')
  const full = join(`${type} en ${operation}`, location, m2, price)
  return full.length > 60 ? join(`${type} en ${operation}`, location, price) : full
}

// ---------- Meta description ----------

function cleanSnippet(description: string, avoid: string[] = []): string | null {
  const text = fixSpanishText(toSentenceCase(description || ''))
    .replace(/\b(?!SALES\b)[A-ZÁÉÍÓÚÑ]{4,}\b/g, (w) => w.toLowerCase())
    .replace(/[¡¿]/g, '')
    .replace(/[!?]+/g, '.')
    .replace(/\.{2,}/g, '.')
    .replace(/\.(?=[A-Za-zÁÉÍÓÚÑáéíóúñ])/g, '. ')
    .replace(/\s+([,.;:])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
  // Se omiten las frases de ficha tecnica (m2, dormitorios...) porque la meta ya las lleva.
  const techSheet = /\d[\d.]*\s*(m²|m2|metros)|\b\d+\s+(dormitorios|habitaciones|baños)/i
  for (const sentence of text.split(/(?<=\.)\s/)) {
    const words = sentence.split(' ').length
    const lower = norm(sentence)
    if (words < 5 || words > 20 || sentence.length > 110 || techSheet.test(sentence)) continue
    if (avoid.some((a) => lower.includes(a))) continue
    const clean = sentence.endsWith('.') ? sentence : `${sentence}.`
    return clean.charAt(0).toUpperCase() + clean.slice(1)
  }
  return null
}

/** Meta description generada a partir de los datos de la ficha (tipo, zona, m2, habitaciones, extras,
 * precio), con una frase limpia de la descripcion o una llamada a la accion si cabe. */
export function buildMetaDescription(p: Property): string {
  const type = HEADLINE_TYPES[primaryType(p.type)] ?? 'Inmueble'
  const operation = p.operation === 'alquiler' ? 'alquiler' : 'venta'
  const head = `${type} en ${operation} en ${formatLocation(p.location)}`
  const specs: string[] = []
  if (plausibleArea(p)) specs.push(`${p.sqMeters} m²`)
  if (p.bedrooms) specs.push(`${p.bedrooms} ${p.bedrooms === 1 ? 'habitación' : 'habitaciones'}`)
  if (p.bathrooms) specs.push(`${p.bathrooms} ${p.bathrooms === 1 ? 'baño' : 'baños'}`)
  const extras: string[] = []
  if (isYes(p.garage)) extras.push('garaje')
  if (isYes(p.elevator)) extras.push('ascensor')
  if (isYes(p.heating)) extras.push('calefacción')
  if (isYes(p.furnished)) extras.push('mobiliario')

  let text = specs.length ? `${head}: ${specs.join(', ')}` : head
  if (extras.length) {
    const list = extras.length > 1 ? `${extras.slice(0, -1).join(', ')} y ${extras[extras.length - 1]}` : extras[0]
    text += `, con ${list}`
  }
  text += '.'
  if (plausiblePrice(p)) text += ` ${formatPrice(p.price, p.operation)}.`

  // Evita repetir en la frase lo que la meta ya dice (extras: garaje, ascensor, calefaccion, mobiliario/amueblado...)
  const avoid = extras.map((e) => (e === 'mobiliario' ? 'amueblad' : norm(e)))
  const snippet = cleanSnippet(p.description, avoid)
  if (snippet && `${text} ${snippet}`.length <= 158) return `${text} ${snippet}`
  const cta = ' Solicita información y visita con Sales Inmobiliaria.'
  if (`${text}${cta}`.length <= 158) return `${text}${cta}`
  return truncateAtWord(text, 158)
}
