# 005 — Ediciones Ingeniería / Datos

Estado en web: `contracts.ts` (`Edition`, `editions`, `ProfileEditionDto`),
`mock-data.ts` (derivado de las dos ediciones de `content.ts`) y
`adapters.ts` (`forEdition` + overrides de perfil) ya lo soportan.

## Por qué
El home tiene un conmutador Ingeniería / Datos. Cambian proyectos, habilidades,
experiencia, formación, titular, "Sobre mí", notas, cita, principios,
"Ahora mismo" y la carta. Las publicaciones son comunes.
Sin esto, al llegar datos de la API **ambas ediciones mostraban lo mismo**.

## Contrato
- `Edition = 'fullstack' | 'data'` (mismas claves que usa la web).
- `editions?: Edition[]` en `ProjectDto`, `ExperienceDto`, `SkillGroupDto` y
  `EducationDto`. Sin `editions` → el item aparece en ambas.
- `ProfileDto.editions?: { fullstack?: ProfileEditionDto; data?: ProfileEditionDto }`
  con cualquiera de: `role`, `bio`, `about`, `notes`, `letter`, `quote`,
  `quoteSource`, `principles`, `now` y `headline: { before, emphasis, after }`
  (titular del hero: "Construyo productos web *de punta a punta* — …").
  Gana sobre el campo base del perfil.
- Regla de la web: si una edición no recibe ningún item de un recurso, conserva
  su contenido local.

## Pasos en `api/`
1. `common/edition.ts`: `export const EDITIONS = ['fullstack', 'data'] as const`.
2. DTOs: `@ApiProperty({ required: false, enum: EDITIONS, isArray: true }) editions?`
   en projects, experience, skills (grupo) y education; `ProfileEditionDto`,
   `HeadlineDto` y `ProfileDto.editions?`.
3. Opcional: `?edition=fullstack|data` en `GET /projects|experience|skills|education`
   (filtro: `!x.editions || x.editions.includes(edition)`); la web no lo necesita
   porque pide todo una vez y reparte.
4. Datos `src/data/{en,es}/*.ts`: etiquetar cada item; mismas etiquetas en ambos
   idiomas (`locales.parity.spec.ts`).
5. `lint` → `test` → `test:e2e` → `build`.

## Verificación
Con `PUBLIC_USE_MOCK=false`, cambiar la edición en `/` cambia el proyecto
destacado, las habilidades, la experiencia, la cita y "Ahora mismo".
