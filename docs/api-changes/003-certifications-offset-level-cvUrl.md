# 003 — `offset` en `GET /certifications` (+ `level`, `cvUrl`)

Estado en web: `CertsIndexPage` pagina en lotes de 10 en cliente pero la API
solo tiene `limit` (max 50); grupos >50 requieren `offset`. Mock documenta el
vacío. Además `CertificationDto.level` (`Associate`) y `ProfileDto.cvUrl`
(`/cv-*.pdf`) ya existen en contracts/mock.

## Por qué
1. Sin `offset` no se puede paginar el hub `?grupo=` más allá de 50.
2. `level` se muestra en tarjetas; hoy solo viaja si está en datos pero no en
   allowlist oficial de todos los despliegues.
3. `cvUrl` evita el `"#"` muerto: la web ya resuelve `/${cvFile}`.

## Pasos en `api/`
1. `certifications.dto.ts`: añadir `offset?: Type(Number)+IsInt+Min(0)=0`
   a `CertificationsQueryDto`; añadir `level?: IsString` a `CertificationDto`
   + entrada en `FIELD_ALLOWLIST`.
2. `certifications.service.ts`: `slice(offset, offset+limit)` en `findAll` y
   `groups/:group`; `expired` se computa de `expiryDate` como hoy.
3. `profile.dto.ts` + `data/en|es/profile.ts`: añadir `cvUrl?: IsUrl|IsString`
   apuntando a `/cv-*.pdf` en `public/`.
4. Mantener `whitelist/forbidNonWhitelisted`: todo query declarado o 400.

## Verificación
`GET /api/certifications?limit=10&offset=10` +
`GET /api/certifications?fields=slug,title,level` +
`GET /api/profile` con `cvUrl`.
