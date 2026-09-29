# Fichas mock-first → API NestJS

Flujo acordado: se prototipa en `web/src/lib/` (contracts + mock-data + mock-source)
y luego se porta a `api/` en este orden. Cada ficha es un cambio atómico.

## Cómo portar un cambio

1. DTO: `api/src/modules/<r>/ <r>.dto.ts` + `@ApiProperty()`.
2. Si el módulo tiene allowlist (`certifications, publications, case-studies`): añadir el campo.
3. Datos: `api/src/data/en/<r>.ts` + `api/src/data/es/<r>.ts` con `satisfies <Dto>[]`.
   Slugs/query params idénticos; solo traducir title/description/deck.
4. Si es filtrable: añadir a `<R>QueryDto` + `if (query.x)` en `service.findAll`.
   Todo query nuevo debe declararse o `ValidationPipe.forbidNonWhitelisted` devuelve 400.
5. Endpoint nuevo: método en Service + `@Get('ruta')` antes de `:slug` en Controller.
6. Módulo nuevo: crear `x.module/controller/service` + importar en `app.module.ts`
   + `DocumentBuilder.addTag()` en `main.ts`.
7. Tests: `pnpm run lint` → `test` → `test:e2e` → `build` (mismo orden que CI).

Idioma: `x-lang` gana sobre `Accept-Language` (`resolveLanguage`, fallback `en`).
Versión: `x-api-version` con fallback `'1'`; URLs sin idioma ni versión.
