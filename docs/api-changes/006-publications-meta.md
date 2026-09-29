# 006 — Ficha lateral de publicaciones (`pages`, `language`)

Estado en web: `PublicationDto.pages?` y `language?` en `contracts.ts`, en la
allowlist `PUBS_FIELD_ALLOWLIST` y en el mock. `home-render.ts` pinta la ficha
(miniatura del PDF + Año / Publicación / Idioma); las filas vacías se omiten.

## Contrato
| Campo | Tipo | Ejemplo es | Ejemplo en |
| ----- | ---- | ---------- | ---------- |
| `pages?` | string | `Vol. 12 · pp. 45–67` / `Actas · pp. 101–110` | `Vol. 12 · pp. 45–67` / `Proceedings · pp. 101–110` |
| `language?` | string (ya traducido) | `Inglés` | `English` |

La miniatura enlaza a `pdfUrl` (o a `doi` si no hay PDF).

## Pasos en `api/`
1. `publications.dto.ts`: dos `@ApiProperty({ required: false })`.
2. Allowlist de `fields=` en `publications.service.ts`: añadir `pages`, `language`.
3. Datos `src/data/{en,es}/publications.ts`.
4. `lint` → `test` → `test:e2e` → `build`.
