import Image from 'next/image'
import { cn } from '@/lib/utils'

type BrandLogoProps = {
  variant?: 'dark' | 'light'
  className?: string
  priority?: boolean
}

export function BrandLogo({ variant = 'light', className, priority = false }: BrandLogoProps) {
  if (variant === 'dark') {
    return (
      <Image
        src="/images/inmobiliaria-sales.png"
        alt="Sales Soluciones Inmobiliarias"
        width={260}
        height={70}
        priority={priority}
        className={cn('h-8 w-auto md:h-9', className)}
      />
    )
  }

  return (
    <div className={cn('flex items-center gap-2.5 md:gap-3', className)}>
      <Image
        src="/images/inmobiliaria-sales-icon.png"
        alt=""
        aria-hidden
        width={72}
        height={56}
        priority={priority}
        className="h-8 w-auto md:h-9 shrink-0"
      />
      <div className="leading-none">
        <p className="font-logo text-[1.35rem] md:text-[1.5rem] font-extrabold tracking-[-0.03em]">
          <span className="text-brand-cyan">SAL</span>
          <span className="text-stone-950">ES</span>
        </p>
        <p className="mt-1 text-[0.48rem] md:text-[0.52rem] font-medium uppercase tracking-[0.24em] text-stone-950">
          Soluciones Inmobiliarias
        </p>
      </div>
    </div>
  )
}
