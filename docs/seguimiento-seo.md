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

### 2026-09-15 — Correccion de categoria en Google Business Profile

**Que se hizo**: cambiada la categoria principal de la ficha de Google Business Profile de
"Oficinas de empresas" a **"Agencia inmobiliaria"**.

**Por que**: la categoria es una de las senales mas directas que usa Google para decidir en que
busquedas mostrar el negocio (Fase 3 del roadmap: posicionamiento local). Con "Oficinas de
empresas" la ficha no competia en busquedas como "inmobiliaria Fernan Nunez" o "comprar vivienda
Fernan Nunez", que es justo el objetivo del cliente.

**Resultado / metricas**: pendiente — los cambios de categoria en Google Business Profile suelen
tardar unos dias en reflejarse en el posicionamiento local.

### 2026-09-17 — Descripcion de la ficha de Google Business Profile

**Que se hizo**: redactada una descripcion para la ficha (limite 750 caracteres) incluyendo de forma
natural las palabras clave objetivo — "Fernan Nunez", "Cordoba", "comprar vivienda", "vender piso",
"alquiler" — sin caer en keyword stuffing ni incluir telefono/web/promociones (Google puede rechazar
o penalizar descripciones que lo hagan). Cierra con llamada a la accion (valoracion gratuita).

**Por que**: la descripcion es otra senal de relevancia local que usa Google (Fase 3 del roadmap),
complementaria a la categoria corregida el 2026-09-15.

**Resultado / metricas**: pendiente de que David la publique en la ficha.

### 2026-09-21 — Auditoria con Screaming Frog y correcciones

**Que se hizo**: rastreo completo de `www.salesinmobiliaria.es` con Screaming Frog (39 URLs,
informe en `sales_issues.xlsx`) y correccion de los problemas atacables desde el codigo:
- **Titulos**: 27 paginas superaban 60 caracteres (69%) y 36 los 561 px; 5 estaban duplicados.
  Fichas de propiedad ahora con titulo unico y corto ("Piso en venta · Fernan Nunez · 100 m² ·
  129.000 €", 47-51 caracteres); titulos de home, propiedades, contacto y servicios ajustados a
  30-60 caracteres.
- **Meta descriptions**: 18 paginas superaban los 985 px (textos del cliente en MAYUSCULAS, mas
  anchas en pixeles). Ahora se normalizan a minusculas con nombres propios y se cortan a ~150
  caracteres por palabra completa.
- **Encabezados**: la ficha renderizaba su bloque de datos dos veces (version movil y escritorio),
  generando dos `<h1>` (35 paginas). Refactorizado a un unico bloque con reordenacion por CSS;
  ahora 1 `<h1>` por pagina y sin botones/precio duplicados en el DOM.
- **Seguridad**: anadidas cabeceras `X-Content-Type-Options: nosniff`, `X-Frame-Options:
  SAMEORIGIN` y `Referrer-Policy: strict-origin-when-cross-origin` (faltaban en el 98% de URLs).

**No corregido (y por que)**:
- `Content-Security-Policy`: una politica mal ajustada puede romper la web (scripts de Next,
  Google Maps, imagenes de Supabase). Se plantea como mejora aparte, primero en modo report-only.
- URL bloqueada por robots.txt (1, prioridad "Alta" en la herramienta): es `/admin`, bloqueada a
  proposito.
- "Lectura dificil": la formula Flesch de Screaming Frog esta calibrada para ingles; no aplica.
- H2 duplicados/multiples ("Descripcion", "Caracteristicas" en cada ficha): estructura normal.
- Contenido escaso (36 paginas < 200 palabras): depende de las descripciones que redacta el
  cliente; recomendable alargarlas.
- Imagenes > 100 KB (269) y sin atributos de tamano (284): pendiente compresion en la subida
  (sharp) para las fotos de propiedades.

**Resultado / metricas** (segundo rastreo, 40 URLs, mismo dia):
| Problema | Antes | Despues |
|---|---|---|
| Titulos > 60 caracteres | 27 (69%) | 2 (5%) |
| Titulos > 561 px | 36 (92%) | 2 (5%) |
| Titulos duplicados | 5 | 0 |
| Meta descriptions > 985 px | 18 (46%) | 0 |
| H1 multiple (2 por pagina) | 35 (90%) | 0 |
| Sin cabeceras X-Content-Type / X-Frame / Referrer-Policy | 58 (98%) | 0 |
Pendiente tras el segundo rastreo: 2 titulos largos (ubicaciones largas) y 1 meta description corta,
corregidos en el commit siguiente; 9 H1 duplicados (fichas con el mismo titulo escrito por el
cliente, p. ej. "CASA EN VENTA" x4); imagenes pesadas (275) sin comprimir.

### 2026-09-21 — CSP en modo informe y guia de longitud de descripciones

**Que se hizo**:
- Anadida `Content-Security-Policy-Report-Only` (solo en produccion) con una politica ajustada a los
  recursos reales de la web (propios, fotos de Supabase, imagen de reserva de Unsplash, sin
  iframes). No bloquea nada: el navegador solo informa a `/api/csp-report`, que lo registra en los
  logs de Vercel. Tras unas semanas sin infracciones se podra pasar a `Content-Security-Policy`.
- Panel admin: contador de palabras bajo la descripcion de cada propiedad, con recomendacion de
  120 o mas (se pone en verde al llegar). Ataca el aviso "Contenido: paginas con poco contenido"
  (37 de 40 paginas, todas fichas de propiedad).

**Por que**: la CSP es el ultimo aviso de seguridad del rastreo; el modo informe evita romper la
web mientras se comprueba. El contenido escaso solo mejora si las descripciones son mas largas.

**Resultado / metricas**: pendiente. Nota: Screaming Frog puede seguir marcando la falta de CSP,
porque busca la cabecera `Content-Security-Policy` y esta es la variante `-Report-Only`.

### 2026-09-28 — Correcciones de accesibilidad (Core Web Vitals)

**Que se hizo**: tres avisos de accesibilidad reportados en la auditoria de Core Web Vitals:
- **ARIA prohibido**: el bloque de estrellas de valoracion (`ReviewsCarousel.tsx`) tenia
  `aria-label` en un `<div>` generico, donde ese atributo no esta permitido segun la especificacion
  ARIA. Anadido `role="img"` al mismo div, que si admite `aria-label`.
- **Contraste insuficiente**: el pie de pagina (fondo `#f3ede4`) usaba `text-stone-500` (ratio 4.12:1,
  no llega al minimo 4.5:1 de WCAG AA) y `text-stone-600` (6.56:1, se mantiene) para varios textos.
  Subido a `text-stone-600`/`text-stone-700` segun el caso (6.56:1 y 8.83:1).
- **Orden de encabezados**: los rotulos "Navegacion" y "Contacto" del pie de pagina eran `<h4>`
  sin que existiera un `<h3>` antes en la pagina (salto de nivel). No son parte de la estructura
  real de la pagina, asi que se cambiaron a `<p>` con el mismo estilo visual.

**Por que**: son fallos de accesibilidad (WCAG) que tambien puntuan en el apartado de Accesibilidad
de Lighthouse/Core Web Vitals, relevante para SEO tecnico ademas de para usuarios con lectores de
pantalla o baja vision.

**Resultado / metricas**: verificado en el HTML servido (dev): `role="img"` presente, 0 `<h4>` en
la pagina, pie de pagina en `text-stone-600`/`text-stone-700`. Pendiente de repetir la auditoria de
accesibilidad en produccion tras el despliegue.

### 2026-09-28 — Compresion automatica de fotos y guias de titulo/descripcion en el admin

**Que se hizo**:
- **Compresion automatica de imagenes**: el endpoint de subida (`/api/uploads/property-image`) ahora
  usa `sharp` para redimensionar (maximo 1920px) y comprimir cada foto a ~200KB antes de guardarla
  en Supabase Storage, probando calidades JPEG decrecientes hasta llegar al objetivo. David puede
  subir la foto tal cual sale del movil (hasta 15MB) sin preocuparse del peso. Probado con una foto
  sintetica de 8,8MB muy ruidosa (peor caso real) -> 145KB finales en Storage.
  Ataca directamente el aviso "Imagenes: Mas de 100 KB" (275 URLs en el ultimo rastreo).
- **Guia de titulo**: aviso en vivo si el titulo esta en MAYUSCULAS SOSTENIDAS, aviso si coincide
  exactamente con el titulo de otra propiedad ya existente (el rastreo de Screaming Frog encontro
  9 H1 duplicados, la mayoria por titulos genericos tipo "CASA EN VENTA" repetido), y un consejo
  fijo con formula (tipo + zona/calle + detalle distintivo) y ejemplo.
- **Guia de descripcion**: ademas del contador de palabras (120+ recomendado, ya existente), aviso
  si esta en mayusculas sostenidas y un ejemplo completo de descripcion bien escrita con la lista
  de datos que deberia incluir (zona exacta, estado, distribucion, extras, que hay cerca).

**Por que**: los tres problemas mas repetidos en las auditorias (imagenes pesadas, H1 duplicados,
contenido escaso) vienen de como se cargan las fichas, no se pueden arreglar solo con codigo en las
paginas ya publicadas — hacia falta evitar que el problema se siga generando en cada propiedad
nueva. Con esto el propio panel guia a David hacia fichas mejor optimizadas sin que tenga que
acordarse de reglas de SEO.

**Resultado / metricas**: verificado en local (subida real de una foto de 8,8MB -> 145KB en
Supabase; avisos de titulo probados con "CASA EN VENTA", detecto tanto mayusculas como duplicado).
Pendiente: las 275 fotos ya subidas siguen pesando lo mismo, esto solo afecta a fotos nuevas —
recomprimir el catalogo existente seria un paso aparte (sobrescribe originales, requiere confirmacion).

### 2026-09-28 (2) — Revertida la compresion automatica, guia manual con TinyPNG

**Que se hizo**: Carlos decidio no usar procesamiento automatico de imagenes en el servidor (para
no arriesgarse a repetir el problema de cuota de Vercel de antes, aunque tecnicamente la compresion
con `sharp` no consumia esa cuota — es una precaucion, no un fallo tecnico). Se revirtio por
completo lo hecho horas antes:
- Quitada la dependencia `sharp` y la compresion en `/api/uploads/property-image` — vuelve a
  guardar la imagen tal cual la sube David, con el limite original de 5MB.
- En su lugar, el panel ahora **enlaza directamente a tinypng.com** y pide comprimir ahi antes de
  subir (objetivo: menos de 200KB por foto).
- Cada foto recien seleccionada muestra su peso en una etiqueta de color (verde si <=200KB, ambar
  si pesa mas), para que sea evidente cual hace falta comprimir.
- **Recomendador de titulo**: contador de caracteres (recomendado <=60, coincide con el limite que
  marca Screaming Frog), avisa si esta en mayusculas o duplicado con otra propiedad — pero deja
  publicar igual, explicando que perjudica el posicionamiento.
- **Recomendador de descripcion**: el contador de palabras ya existente ahora dice explicitamente
  que las descripciones cortas perjudican el posicionamiento (antes solo lo insinuaba con el color).

**Por que**: mismo objetivo que antes (evitar que sigan entrando fotos pesadas, titulos duplicados
y descripciones vacias), pero sin que el servidor toque ni procese nada — la decision y el trabajo
de ajustar las fotos es manual, de David, con una herramienta externa gratuita.

**Resultado / metricas**: verificado en local — subida de una foto sin comprimir mantiene el mismo
peso exacto en Supabase Storage (no se altera), subida de una foto >5MB se rechaza con mensaje que
redirige a TinyPNG, badges de peso y avisos de titulo/descripcion probados y funcionando.

---

## Formato para futuras entradas

```
### AAAA-MM-DD — Titulo breve

**Que se hizo**: ...
**Por que**: ...
**Resultado / metricas** (si aplica): ...
```
