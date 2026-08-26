import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Servicios',
  description: 'Conoce los servicios de Sales Inmobiliaria en Fernán Núñez: compra, venta, alquiler y asesoramiento personalizado con financiación a medida.',
  alternates: { canonical: '/sobre-nosotros' },
}

export default function SobreNosotrosLayout({ children }: { children: React.ReactNode }) {
  return children
}
