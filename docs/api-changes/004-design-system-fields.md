# 004 — Campos para los componentes Marginalia (home + sistema de diseño)

Estado en web: `contracts.ts` + `mock-data.ts` ya los tienen (mock-first).
`adapters.ts` los fusiona en el home; si faltan, se usa el texto local de
`content.ts`. Todos son **opcionales**: la API actual sigue siendo compatible.

## Ya existe en la API (solo se sincronizó la web)
- `GET /skills` → `items: { name, years, daily }[]`. La web tenía `items: string[]`
  y en modo live pintaba `[object Object]`. `mapSkills` ahora acepta ambas formas.
- `GET /certifications/groups` → `latest`, `fromYear`, `toYear`.
- `ExperienceDto.wins`, `SocialDto.handle`, `ProfileDto.notes`.

## Nuevo — `ProjectDto` (§01 destacado + filas desplegables, 5.5 / 5.7)
| Campo | Tipo | Dónde se ve | Ejemplo |
| ----- | ---- | ----------- | ------- |
| `role?` | string | kicker del destacado, "Rol · …" en la fila | `Líder técnico` |
| `problem?` | string | cursiva del destacado, columna Problema | `La conciliación se hacía con scripts nocturnos…` |
| `approach?` | string | cuerpo del destacado, columna Enfoque | `Libro contable inmutable de doble entrada…` |
| `result?` | string | columna Resultado | `Soporte pasó de 310 a 45 tickets semanales.` |
| `results?` | `{ label, before, after }[]` | tabla Antes/Después | `{ label: 'Latencia p95', before: '840 ms', after: '120 ms' }` |
| `resultsCaption?` | string | "Tabla 1 — …" | `medido tras tres meses en producción.` |

El primer proyecto de la lista es el destacado: ordenar con `featured` primero.
`links.repo` / `links.demo` (ya existen) pintan "Código ↗" y "Demo ↗".

## Nuevo — `ProfileDto` (§02 Sobre mí, §06 Correspondencia)
| Campo | Tipo | Dónde se ve |
| ----- | ---- | ----------- |
| `quote?`, `quoteSource?` | string | cita destacada + "— Nota personal, 2025" |
| `facts?` | `{ label, value }[]` | ficha bajo el retrato (Base, Zona, Idiomas, Experiencia) |
| `principles?` | `{ title, text }[]` | "Cómo trabajo" (la web numera I., II., III.) |
| `now?` | `{ updatedAt: 'YYYY-MM', items: { label, value }[] }` | bloque "Ahora mismo" |
| `socials[].note?` | string | línea bajo cada perfil del directorio B (se empareja por `label`) |
| `timezone?` | string IANA | reloj "Hora local" del directorio C, p. ej. `America/Lima` |
| `hoursNote?` | string | nota de horario del directorio C |

Neutros al idioma: `now.updatedAt`, `timezone`. El resto se traduce.

## Ediciones
Lo que cambia entre Ingeniería y Datos está en la ficha 005.

## Pasos en `api/`
1. `projects.dto.ts`: `ProjectResultDto { label; before; after }` + los campos
   opcionales con `@ApiProperty({ required: false })`.
2. `profile.dto.ts`: `SocialDto.note?`, `FactDto`, `PrincipleDto`, `NowItemDto`,
   `NowDto` y los campos opcionales de la tabla.
3. Datos `src/data/{en,es}/projects.ts` y `profile.ts` (`satisfies`), mismo número
   de `results`, `facts`, `principles` y `now.items` en ambos idiomas para
   `locales.parity.spec.ts`.
4. `lint` → `test` → `test:e2e` → `build`.

## Verificación
`GET /api/projects` con `x-lang: es` devuelve `results` en el destacado;
`GET /api/profile` devuelve `now.items`, `principles` y `quote`.
Con `PUBLIC_USE_MOCK=false`, `/` y `/sistema-diseno` muestran lo mismo que en mock.
