import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contacto inmobiliaria en Fernán Núñez',
  description: 'Ponte en contacto con Sales Inmobiliaria en Fernán Núñez, Córdoba. Te ayudamos a comprar, vender o alquilar tu vivienda.',
  alternates: { canonical: '/contacto' },
}

export default function ContactoLayout({ children }: { children: React.ReactNode }) {
  return children
}
