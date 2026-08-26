import { CONTACT, OPENING_HOURS } from '@/lib/contact'
import { SITE_URL } from '@/lib/seo'

const DAY_MAP: Record<string, string> = {
  Lunes: 'Monday',
  Martes: 'Tuesday',
  Miércoles: 'Wednesday',
  Jueves: 'Thursday',
  Viernes: 'Friday',
  Sábado: 'Saturday',
  Domingo: 'Sunday',
}

function openingHoursSpecification() {
  return OPENING_HOURS.filter((entry) => entry.hours !== 'Cerrado').map((entry) => {
    const [morning, afternoon] = entry.hours.split('·').map((s) => s.trim())
    const ranges = [morning, afternoon].filter(Boolean).map((range) => {
      const [opens, closes] = range.split('–').map((s) => s.trim())
      return { opens, closes }
    })
    return ranges.map((range) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: DAY_MAP[entry.day],
      opens: range.opens,
      closes: range.closes,
    }))
  }).flat()
}

export function StructuredData() {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    name: 'Sales Inmobiliaria',
    alternateName: 'Sales Soluciones Inmobiliarias',
    description: 'Agencia inmobiliaria en Fernán Núñez, Córdoba. Compra, venta y alquiler de propiedades con asesoramiento personalizado.',
    url: SITE_URL,
    logo: `${SITE_URL}/images/inmobiliaria-sales.png`,
    image: `${SITE_URL}/images/inmobiliaria-sales.png`,
    telephone: CONTACT.phone.e164,
    address: {
      '@type': 'PostalAddress',
      streetAddress: CONTACT.address.line1,
      addressLocality: 'Fernán Núñez',
      addressRegion: 'Córdoba',
      postalCode: '14520',
      addressCountry: 'ES',
    },
    areaServed: {
      '@type': 'City',
      name: 'Fernán Núñez',
    },
    openingHoursSpecification: openingHoursSpecification(),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
