export const SITE_URL = 'https://www.salesinmobiliaria.es'
export const SITE_NAME = 'Sales Inmobiliaria'

const KNOWN_LOCATIONS: Record<string, string> = {
  'fernan nunez': 'Fernán Núñez',
  'san sebastian de los ballesteros': 'San Sebastián de los Ballesteros',
  montilla: 'Montilla',
  cordoba: 'Córdoba',
  'la rambla': 'La Rambla',
  'la victoria': 'La Victoria',
  'la vivtoria': 'La Victoria',
  montemayor: 'Montemayor',
  'avda de cadiz': 'Avda. de Cádiz',
  'avenida de cadiz': 'Avenida de Cádiz',
}
const SMALL_WORDS = new Set(['de', 'del', 'la', 'las', 'los', 'el', 'y'])

function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

export function formatLocation(location: string): string {
  const clean = location.trim().replace(/\s+/g, ' ')
  const known = KNOWN_LOCATIONS[stripAccents(clean).toLowerCase()]
  if (known) return known
  return clean
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i > 0 && SMALL_WORDS.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(' ')
}

/** Palabras habituales en anuncios que se escriben sin tilde o con errata. Clave sin tilde y en minusculas. */
const WORD_FIXES: Record<string, string> = {
  cadiz: 'cádiz',
  rustica: 'rústica',
  rusticas: 'rústicas',
  rustico: 'rústico',
  rusticos: 'rústicos',
  caserio: 'caserío',
  atico: 'ático',
  duplex: 'dúplex',
  triplex: 'tríplex',
  jardin: 'jardín',
  sotano: 'sótano',
  salon: 'salón',
  ubicacion: 'ubicación',
  habitacion: 'habitación',
  economico: 'económico',
  economica: 'económica',
  unico: 'único',
  unica: 'única',
  magnifico: 'magnífico',
  magnifica: 'magnífica',
  ocasion: 'ocasión',
  inversion: 'inversión',
  construccion: 'construcción',
  urbanizacion: 'urbanización',
  calefaccion: 'calefacción',
  tranquilo: 'tranquilo',
  comodo: 'cómodo',
  comoda: 'cómoda',
  practico: 'práctico',
  practica: 'práctica',
  ultimo: 'último',
  ultima: 'última',
  fabrica: 'fábrica',
  oportnidad: 'oportunidad',
  oprtunidad: 'oportunidad',
  oportunidd: 'oportunidad',
  oportunidda: 'oportunidad',
  veta: 'venta',
  vnta: 'venta',
  vemta: 'venta',
  caa: 'casa',
  csa: 'casa',
  pisp: 'piso',
  alquilier: 'alquiler',
  alqiler: 'alquiler',
  chale: 'chalet',
  parcla: 'parcela',
  picina: 'piscina',
  pscina: 'piscina',
  garage: 'garaje',
  reformr: 'reformar',
}

const PLACE_FIXES: [RegExp, string][] = [
  [/fern[aá]n\s+n[uú][ñn]ez/gi, 'Fernán Núñez'],
  [/san\s+sebasti[aá]n\s+de\s+los\s+ballesteros/gi, 'San Sebastián de los Ballesteros'],
  [/c[oó]rdoba/gi, 'Córdoba'],
  [/montilla/gi, 'Montilla'],
  [/montemayor/gi, 'Montemayor'],
  [/la\s+rambla/gi, 'La Rambla'],
  [/la\s+vi[cv]toria/gi, 'La Victoria'],
  [/\bm2\b/gi, 'm²'],
  [/\ba\s+dem[aá]s\b/gi, 'además'],
  [/\bdemas\b(?=\s*[,.])/gi, 'demás'],
  [/\bademas\b/gi, 'además'],
  [/\btambien\b/gi, 'también'],
]

/** Corrige tildes y erratas frecuentes y escribe bien los nombres de lugar. Respeta la mayuscula inicial. */
export function fixSpanishText(text: string): string {
  let out = text
  for (const [pattern, replacement] of PLACE_FIXES) {
    out = out.replace(pattern, (match) =>
      match.length > 2 && match === match.toUpperCase() ? replacement.toUpperCase() : replacement
    )
  }
  // Se conserva el estilo de mayusculas de quien escribio: MAYUSCULAS, Capitalizada o minuscula.
  return out.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, (word) => {
    const fixed = WORD_FIXES[stripAccents(word).toLowerCase()]
    if (!fixed || fixed === word.toLowerCase()) return word
    if (word.length > 1 && word === word.toUpperCase()) return fixed.toUpperCase()
    const first = word.charAt(0)
    return first === first.toUpperCase() ? fixed.charAt(0).toUpperCase() + fixed.slice(1) : fixed
  })
}

export function toSentenceCase(text: string): string {
  const letters = text.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ]/g, '')
  if (!letters) return text
  const upper = letters.replace(/[^A-ZÁÉÍÓÚÜÑ]/g, '').length
  if (upper / letters.length < 0.6) return text
  const sentence = text
    .toLowerCase()
    .replace(/(^\s*|[.!?]\s+)([a-záéíóúüñ])/g, (_, sep: string, ch: string) => sep + ch.toUpperCase())
  return fixSpanishText(sentence).replace(/\bsales\b/gi, 'SALES')
}

export function truncateAtWord(text: string, max: number): string {
  const flat = text.replace(/\s+/g, ' ').trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:-]+$/, '')}…`
}
