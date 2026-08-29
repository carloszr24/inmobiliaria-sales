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

export const PROPERTY_TYPES = ['piso', 'atico', 'casa', 'chalet', 'local', 'terreno', 'garaje', 'oficina'] as const
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
}

export const OPERATION_LABELS: Record<string, string> = {
  venta: 'Venta',
  alquiler: 'Alquiler',
}
