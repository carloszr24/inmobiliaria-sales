import Image from 'next/image'

const EVEREST_WEBSITE = 'https://everestfinancial.es/'

const highlights = [
  'Estudio gratuito',
  'Hipoteca 100% + gastos',
  'Trato personalizado',
  'Une tus préstamos en uno solo',
]

const financialServices = [
  {
    title: 'Hipotecas',
    desc: 'Tipo fijo, mixto o variable, según tu perfil y situación.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7" aria-hidden="true">
        <path d="M3 11.25 12 4l9 7.25" />
        <path d="M5.25 10.5V20h13.5v-9.5" />
        <path d="M9.75 20v-5.5h4.5V20" />
      </svg>
    ),
  },
  {
    title: 'Rehipotecas',
    desc: 'Reformas en tu vivienda, compra de segunda vivienda y más opciones.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
      </svg>
    ),
  },
  {
    title: 'Reunificar deudas',
    desc: 'Unifica préstamos personales, hipotecarios y líneas de crédito en una cuota más baja.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-7 w-7" aria-hidden="true">
        <circle cx="8" cy="8" r="3" />
        <circle cx="16" cy="8" r="3" />
        <circle cx="12" cy="16" r="3" />
        <path d="M10.2 10.2 11.8 14M13.8 14l1.6-3.8M9.4 9.4 7.8 10.6M14.6 9.4l1.6 1.2" />
      </svg>
    ),
  },
]

export function FinancialPartnerSection() {
  return (
    <section className="relative overflow-hidden bg-[#0c1828] py-24 px-6 md:px-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(56,189,248,0.12),_transparent_55%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(224,8,128,0.08),_transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-sky-300/90 text-xs tracking-[0.3em] uppercase mb-4">Colaborador financiero</p>
          <h2 className="font-display text-4xl md:text-5xl font-light text-white mb-4">
            Financiación para tu operación
          </h2>
          <p className="text-slate-400 text-lg font-light max-w-2xl mx-auto">
            En Sales trabajamos con un equipo especializado para ayudarte con hipotecas, rehipotecas y reunificación de deudas.
          </p>
        </div>

        <div className="flex justify-center mb-14">
          <a
            href={EVEREST_WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full max-w-md transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0c1828]"
            aria-label="Visitar la web de Everest Financial"
          >
            <Image
              src="/images/everest.png"
              alt="Everest Financial — Soluciones financieras"
              width={640}
              height={200}
              className="h-auto w-full"
              priority={false}
            />
          </a>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {highlights.map((item, index) => (
            <div
              key={item}
              className="inline-flex items-center gap-3 rounded-full border border-sky-400/25 bg-sky-950/40 px-5 py-2.5 text-sm text-sky-50"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sky-500/20 text-xs font-semibold text-sky-200">
                {index + 1}
              </span>
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {financialServices.map((service) => (
            <article
              key={service.title}
              className="group rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm transition-colors hover:border-sky-400/30 hover:bg-white/[0.07]"
            >
              <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full border border-sky-400/20 bg-sky-500/10 text-sky-200 transition-colors group-hover:border-sky-300/40 group-hover:text-white">
                {service.icon}
              </div>
              <h3 className="font-display text-2xl font-light text-white mb-3">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{service.desc}</p>
            </article>
          ))}
        </div>

        <div className="text-center">
          <p className="text-slate-400 mb-6 max-w-lg mx-auto text-sm md:text-base">
            Cuéntanos tu caso y te ponemos en contacto con nuestro colaborador para un estudio sin compromiso.
          </p>
          <a
            href={EVEREST_WEBSITE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full bg-sky-500 px-10 py-4 text-sm font-medium tracking-wide text-white transition-colors hover:bg-sky-400"
          >
            Solicitar estudio gratuito
          </a>
        </div>
      </div>
    </section>
  )
}
