import type { Metadata } from 'next'
import { DM_Sans, Montserrat } from 'next/font/google'
import './globals.css'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { StructuredData } from '@/components/seo/StructuredData'
import { SITE_URL } from '@/lib/seo'

const sans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-body',
  weight: ['400', '500', '700'],
})

const display = DM_Sans({
  subsets: ['latin'],
  variable: '--font-display',
  weight: ['500', '600', '700'],
})

const logo = Montserrat({
  subsets: ['latin'],
  variable: '--font-logo',
  weight: ['700', '800', '900'],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Sales Inmobiliaria | Inmobiliaria en Fernán Núñez, Córdoba',
    template: '%s | Sales Inmobiliaria',
  },
  description: 'Compra, venta y alquiler de propiedades en Fernán Núñez y la provincia de Córdoba con asesoramiento cercano y profesional.',
  keywords: 'sales inmobiliaria, inmobiliaria fernan nunez, agencia inmobiliaria cordoba, comprar vivienda fernan nunez, vender piso cordoba, alquiler fernan nunez',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'Sales Inmobiliaria',
    title: 'Sales Inmobiliaria | Inmobiliaria en Fernán Núñez, Córdoba',
    description: 'Compra, venta y alquiler de propiedades en Fernán Núñez y la provincia de Córdoba con asesoramiento cercano y profesional.',
    url: SITE_URL,
    images: [{ url: '/images/inmobiliaria-sales.png' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sales Inmobiliaria | Inmobiliaria en Fernán Núñez, Córdoba',
    description: 'Compra, venta y alquiler de propiedades en Fernán Núñez y la provincia de Córdoba con asesoramiento cercano y profesional.',
    images: ['/images/inmobiliaria-sales.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${sans.variable} ${display.variable} ${logo.variable}`}>
      <body className="bg-white text-stone-900 antialiased">
        <StructuredData />
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
