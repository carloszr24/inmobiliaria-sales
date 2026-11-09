import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function hasPrice(price: number): boolean {
  return price > 0
}

export function formatPrice(price: number, operation?: string): string {
  if (!hasPrice(price)) return ''
  const base = new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(price)
  return operation === 'alquiler' ? `${base}/mes` : base
}

export function parseImages(images: string): string[] {
  try {
    return JSON.parse(images)
  } catch {
    return []
  }
}

export const PROPERTY_TYPES = ['piso', 'atico', 'casa', 'chalet', 'local', 'terreno', 'garaje', 'oficina', 'otros'] as const
export const PROPERTY_OPERATIONS = ['venta', 'alquiler'] as const
export const PROPERTY_STATUSES = ['disponible', 'reservado', 'vendido'] as const

export const STATUS_LABELS: Record<string, string> = {
  disponible: 'Disponible',
  reservado: 'Reservado',
  vendido: 'Vendido',
}

export const TYPE_LABELS: Record<string, string> = {
  piso: 'Piso',
  atico: 'Ático',
  casa: 'Casa',
  chalet: 'Chalet adosado',
  local: 'Local',
  terreno: 'Terreno',
  garaje: 'Garaje',
  oficina: 'Oficina',
  otros: 'Otros',
}

/** Una propiedad puede tener varias categorias guardadas en `type` separadas por coma
 * (ej. "casa,terreno"). La primera es la principal. */
export function parseTypes(type: string | null | undefined): string[] {
  return (type ?? '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
}

export function serializeTypes(types: string[]): string {
  return Array.from(new Set(types)).join(',')
}

export function primaryType(type: string | null | undefined): string {
  return parseTypes(type)[0] ?? ''
}

export function typeLabelList(type: string | null | undefined): string[] {
  return parseTypes(type).map((t) => TYPE_LABELS[t] || t)
}

export function typesLabel(type: string | null | undefined, separator = ' · '): string {
  return typeLabelList(type).join(separator)
}

export const OPERATION_LABELS: Record<string, string> = {
  venta: 'Venta',
  alquiler: 'Alquiler',
}
