# 001 — `GET /publications` (módulo nuevo)

Estado en web: mock implementado en `MockPortfolioSource.fetchPublications`
con `PublicationDto` de la plantilla (`immutable-ledgers`, `crdts-sin-miedo`).

## Por qué
`web` hoy usa mocks locales `pubs[]` porque la API no tiene `/publications`.
`fetchPublications` espera 404 y conserva mocks. Con este módulo el home
puede usar datos vivos en ambos perfiles.

## Contrato (ya en `src/lib/contracts.ts`)
`PublicationDto { slug, title, authors[], venue, type: journal|conference,
year, publishedAt, doi, pdfUrl, url?, abstract, keywords[], featured }`
`PublicationsQuery { search?, type?, tag?, year?, featured?, fields?, limit?=20 }`
`PUBS_FIELD_ALLOWLIST` con los 13 campos; `slug` siempre incluido; 400 en
`Unknown field(s)`.

## Pasos en `api/`
1. Crear `src/modules/publications/{publications.controller.ts,
   publications.service.ts, publications.dto.ts, publications.module.ts}`
   espejo de `certifications` (rutas `GET /`, `GET /:slug`, `fields=`).
2. `src/data/en/publications.ts` + `src/data/es/publications.ts` con los 2
   slugs de arriba (`satisfies PublicationDto[]`).
3. Registrar en `app.module.ts` + tag Swagger en `main.ts`.
4. Paridad: mismos `slugs.sort()` en ambos locales o falla
   `locales.parity.spec.ts`.

## Verificación
`pnpm run lint && pnpm run test && pnpm run test:e2e && pnpm run build`
+ `GET /api/publications?fields=slug,title` y `GET /api/publications/:slug`.
