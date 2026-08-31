# Seguimiento SEO — Sales Inmobiliaria

Registro de trabajo para el mantenimiento SEO y tecnico mensual (29,90€/mes, sin permanencia).
Base para el informe trimestral al cliente (David).

## Contexto del contrato

- **Motivo**: al buscar "Sales Inmobiliaria" en Google/Bing, el primer resultado organico es
  `salesinmobiliaria.com` (inmobiliaria homonima en Valencia), no `salesinmobiliaria.es`.
  El dominio casi identico (mismo nombre, distinto TLD) dificulta que Google diferencie ambas empresas.
- **Objetivo del cliente**: aparecer en busquedas como "comprar vivienda en Fernan Nunez".
- **Alcance**: SEO tecnico y mantenimiento (indexacion, datos estructurados, posicionamiento local,
  seguridad/rendimiento, monitorizacion). No incluye subida de propiedades ni redes sociales.
- **Propuesta enviada**: `docs/Propuesta-SEO.pdf`

## Registro de trabajo

### 2026-08-26 — Implementacion tecnica inicial (Fase 1-2 del roadmap)

**Diagnostico previo**: la web no tenia sitemap.xml, robots.txt, datos estructurados ni metadata
diferenciada por pagina. Todas las paginas compartian el mismo titulo/descripcion generico.

**Cambios desplegados** (commit `83daa46`):
- `sitemap.xml` dinamico — incluye home, propiedades, contacto, sobre-nosotros y cada ficha de
  propiedad individual. Se regenera en cada peticion, asi que refleja el catalogo real sin caducar.
- `robots.txt` — permite rastreo general, bloquea `/admin` y `/api`.
- Datos estructurados **Schema.org `RealEstateAgent`** en todas las paginas (nombre, direccion,
  telefono, horario de apertura) — la senal que le falta a Google para identificar la empresa como
  negocio local de Fernan Nunez y no confundirla con la de Valencia.
- **Open Graph y Twitter Cards** — enlaces compartidos (WhatsApp, redes) ahora muestran titulo,
  descripcion e imagen correctos en vez de genericos.
- **Metadata dinamica por propiedad** — cada ficha tiene su propio `<title>`, descripcion e imagen
  basados en los datos reales de la propiedad (antes: mismo titulo en toda la web).
- **Metadata dedicada** para `/propiedades`, `/contacto` y `/sobre-nosotros`.
- `metadataBase` y URLs canonicas en todas las paginas.

**Pendiente / proximos pasos**:
- Dar de alta el dominio en Google Search Console y enviar el sitemap manualmente (acelera la
  indexacion en vez de esperar a que Google lo encuentre solo).
- Revisar Google Business Profile (senales NAP: nombre, direccion, telefono consistentes).
- Monitorizacion de posiciones para "comprar vivienda en Fernan Nunez" y variantes locales.

### 2026-08-26 — Alta en Google Search Console

**Que se hizo**:
- Verificacion del dominio `salesinmobiliaria.es` en Google Search Console mediante registro TXT
  (`google-site-verification=...`) anadido en Vercel DNS.
- Envio del sitemap.xml a Search Console para forzar el rastreo activo (en vez de esperar a que
  Google lo encuentre solo).
- Corregido `SITE_URL` en el codigo: apuntaba a `salesinmobiliaria.es` (sin www), pero el dominio
  redirige (308) a `www.salesinmobiliaria.es`. Ahora todas las URLs del sitemap, canonicals y
  Open Graph apuntan directamente al destino final, evitando que Google tenga que seguir una
  redireccion para llegar al contenido real.

**Por que**: Search Console es lo que le dice a Google "rastrea esto ya", en vez de depender del
rastreo pasivo normal (que puede tardar semanas). Es el paso que mas acelera que las paginas nuevas
(cada propiedad subida) aparezcan indexadas.

**Resultado / metricas**: sitemap enviado correctamente en `https://www.salesinmobiliaria.es/sitemap.xml`
— estado "Correcto", 22 paginas descubiertas (home + secciones + todas las propiedades activas).
Faltaba enviar la URL completa (con www) en vez de la ruta relativa `sitemap.xml`, coincidiendo con
la correccion de `SITE_URL` realizada en el mismo dia.

### 2026-08-26 — Fix de rendimiento: cuota de Vercel Image Optimization

**Que se hizo**: las fotos de propiedades (Supabase Storage) se sirven ahora sin pasar por el
optimizador de imagenes de Next.js/Vercel (`unoptimized`), en vez de generar una variante
optimizada por cada tamano de pantalla. Solo el logo/branding del sitio sigue optimizado.

**Por que**: con el catalogo creciendo rapido (23 propiedades y subiendo, varias fotos cada una), el
consumo de transformaciones de imagen del plan de Vercel estaba al 78% (3.9K/5K) en 30 dias. Cada
foto generaba varias transformaciones (tarjeta, visor, miniatura, ampliada x varios anchos de
pantalla). De haberse agotado la cuota, las fotos nuevas habrian dejado de cargar en produccion.

**Resultado / metricas**: consumo de transformaciones detenido para imagenes de propiedades.
Tambien se anadio una nota en el panel de subida recomendando fotos ya comprimidas (1-2 MB) en vez
de resolucion original de camara, para mantener la web rapida (relevante para Core Web Vitals).

---

## Formato para futuras entradas

```
### AAAA-MM-DD — Titulo breve

**Que se hizo**: ...
**Por que**: ...
**Resultado / metricas** (si aplica): ...
```
