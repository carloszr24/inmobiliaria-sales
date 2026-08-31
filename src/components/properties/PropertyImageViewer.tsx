'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

interface PropertyImageViewerProps {
  images: string[]
  title: string
}

export function PropertyImageViewer({ images, title }: PropertyImageViewerProps) {
  const safeImages = images.length > 0 ? images : ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200']
  const [index, setIndex] = useState(0)
  const [touchStartX, setTouchStartX] = useState<number | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [zoom, setZoom] = useState(1)

  const goPrev = () => {
    setIndex((prev) => (prev - 1 + safeImages.length) % safeImages.length)
  }

  const goNext = () => {
    setIndex((prev) => (prev + 1) % safeImages.length)
  }

  const onTouchStart = (clientX: number) => setTouchStartX(clientX)
  const onTouchEnd = (clientX: number) => {
    if (touchStartX == null) return
    const dx = clientX - touchStartX
    if (dx > 50) goPrev()
    if (dx < -50) goNext()
    setTouchStartX(null)
  }

  useEffect(() => {
    if (!lightboxOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'Escape') setLightboxOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [lightboxOpen])

  useEffect(() => {
    setZoom(1)
  }, [index, lightboxOpen])

  return (
    <>
      <div
        className="relative aspect-[16/10] overflow-hidden bg-stone-100 mb-3"
        onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
      >
        <Image
          src={safeImages[index]}
          alt={`${title} ${index + 1}`}
          fill
          unoptimized
          className="object-cover"
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
        />
        <button
          type="button"
          onClick={() => setLightboxOpen(true)}
          className="absolute inset-0 z-10 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/80"
          aria-label="Ver imagen ampliada"
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setLightboxOpen(true)
          }}
          className="absolute top-3 right-3 z-20 bg-black/55 text-white text-xs px-2.5 py-1.5 backdrop-blur-sm hover:bg-black/65"
        >
          Ampliar
        </button>
        {safeImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goPrev()
              }}
              className="hidden md:flex absolute left-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center bg-black/45 text-white text-xl"
              aria-label="Imagen anterior"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                goNext()
              }}
              className="hidden md:flex absolute right-3 top-1/2 -translate-y-1/2 z-20 h-10 w-10 items-center justify-center bg-black/45 text-white text-xl"
              aria-label="Imagen siguiente"
            >
              ›
            </button>
          </>
        )}
      </div>

      {safeImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mb-10">
          {safeImages.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-square overflow-hidden bg-stone-100 border ${index === i ? 'border-stone-900' : 'border-transparent'}`}
              aria-label={`Ver imagen ${i + 1}`}
            >
              <Image
                src={img}
                alt={`${title} miniatura ${i + 1}`}
                fill
                unoptimized
                className="object-cover"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 p-4 md:p-8"
          onClick={() => setLightboxOpen(false)}
        >
          <div
            className="relative h-full w-full"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
            onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-2 right-2 z-30 h-10 w-10 bg-white/10 text-white text-2xl"
              aria-label="Cerrar"
            >
              ×
            </button>
            <div className="absolute top-2 left-2 z-30 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
                className="h-10 w-10 bg-white/10 text-white text-xl"
                aria-label="Alejar"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
                className="h-10 w-10 bg-white/10 text-white text-xl"
                aria-label="Acercar"
              >
                +
              </button>
            </div>

            <div className="relative h-full w-full overflow-auto flex items-center justify-center">
              <div
                className="relative w-full h-full max-w-[1400px] max-h-[90vh]"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 150ms ease' }}
              >
                <Image
                  src={safeImages[index]}
                  alt={`${title} ampliada ${index + 1}`}
                  fill
                  unoptimized
                  className="object-contain"
                  sizes="100vw"
                />
              </div>
            </div>

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 bg-white/10 text-white text-3xl"
                  aria-label="Imagen anterior"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 h-12 w-12 bg-white/10 text-white text-3xl"
                  aria-label="Imagen siguiente"
                >
                  ›
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

