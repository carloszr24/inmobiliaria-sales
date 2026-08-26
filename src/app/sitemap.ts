import type { MetadataRoute } from 'next'
import { getAllProperties } from '@/lib/properties-store'
import { SITE_URL } from '@/lib/seo'

export const dynamic = 'force-dynamic'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/propiedades`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/sobre-nosotros`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contacto`, changeFrequency: 'monthly', priority: 0.5 },
  ]

  let propertyRoutes: MetadataRoute.Sitemap = []
  try {
    const properties = await getAllProperties()
    propertyRoutes = properties.map((property) => ({
      url: `${SITE_URL}/propiedades/${property.id}`,
      lastModified: property.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.7,
    }))
  } catch {
    propertyRoutes = []
  }

  return [...staticRoutes, ...propertyRoutes]
}
