import Image from 'next/image'
import Link from 'next/link'
import {
  AGENT,
  CONTACT,
  emailHref,
  hasEmail,
  mapsHref,
  phoneHref,
  scheduleSummary,
  whatsappHref,
} from '@/lib/contact'

export function Footer() {

  return (
    <footer className="mt-24 border-t border-stone-200 bg-[#f3ede4] text-stone-600">
      <div className="max-w-7xl mx-auto px-6 md:px-10 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Image
              src="/images/inmobiliaria-sales.png"
              alt={`${AGENT.name} logo`}
              width={220}
              height={60}
              className="h-9 w-auto"
            />
            <p className="mt-4 text-sm leading-relaxed text-stone-600 max-w-sm">
              {AGENT.title} en {AGENT.city}. {AGENT.tagline}
            </p>
          </div>
          <div>
            <h4 className="text-stone-900 text-xs tracking-widest uppercase mb-4">Navegación</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/propiedades" className="transition-colors hover:text-brand-cyan-dark">Propiedades</Link></li>
              <li><Link href="/sobre-nosotros" className="transition-colors hover:text-brand-cyan-dark">Servicios</Link></li>
              <li><Link href="/contacto" className="transition-colors hover:text-brand-cyan-dark">Contacto</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-stone-900 text-xs tracking-widest uppercase mb-4">Contacto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-cyan-dark"
                >
                  {CONTACT.address.full}
                </a>
              </li>
              <li>
                <a href={phoneHref} className="transition-colors hover:text-brand-cyan-dark">{CONTACT.phone.display}</a>
              </li>
              {hasEmail && (
                <li>
                  <a href={emailHref} className="transition-colors hover:text-brand-cyan-dark">{CONTACT.email}</a>
                </li>
              )}
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors hover:text-brand-cyan-dark"
                >
                  WhatsApp: +34 {CONTACT.phone.display}
                </a>
              </li>
              <li className="text-stone-500">{scheduleSummary}</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-stone-300/80 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-500">
          <span>© {new Date().getFullYear()} {AGENT.name}. Todos los derechos reservados.</span>
          <Link href="/admin" className="transition-colors hover:text-brand-cyan-dark">Panel Admin</Link>
        </div>
      </div>
    </footer>
  )
}
