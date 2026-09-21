export const SITE_URL = 'https://www.salesinmobiliaria.es'
export const SITE_NAME = 'Sales Inmobiliaria'

const KNOWN_LOCATIONS: Record<string, string> = {
  'fernan nunez': 'Fernán Núñez',
  'san sebastian de los ballesteros': 'San Sebastián de los Ballesteros',
  montilla: 'Montilla',
  cordoba: 'Córdoba',
}

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function formatLocation(location: string): string {
  const clean = location.trim().replace(/\s+/g, ' ')
  const known = KNOWN_LOCATIONS[stripAccents(clean).toLowerCase()]
  if (known) return known
  return clean.toLowerCase().replace(/(^|\s)\S/g, (c) => c.toUpperCase())
}

export function toSentenceCase(text: string): string {
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  if (!letters) return text
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').length
  if (upper / letters.length < 0.6) return text
  return text
    .toLowerCase()
    .replace(/(^\s*|[.!?]\s+)([a-záéíóúüñ])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())
    .replace(/fern[aá]n n[uú][ñn]ez/gi, 'Fernán Núñez')
    .replace(/san sebasti[aá]n de los ballesteros/gi, 'San Sebastián de los Ballesteros')
    .replace(/c[oó]rdoba/gi, 'Córdoba')
    .replace(/montilla/gi, 'Montilla')
    .replace(/\bm2\b/gi, 'm²')
    .replace(/\bsales\b/gi, 'SALES')
}

export function truncateAtWord(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:-]+$/, '')}…`
}
