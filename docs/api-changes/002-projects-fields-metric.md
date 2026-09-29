# 002 — `fields=` + `metric` en `GET /projects`

Estado en web: mock lo soporta vía `pickFields` + `ApiError 400`; `metric`
(`p95 120 ms`, `AUC 0.91`) ya es parte de `ProjectDto` en contracts.

## Por qué
`certifications/publications/case-studies` tienen `fields=` con allowlist;
`projects` no. La web pide sparse para el home y usa `metric` como columna
acento. Sin esto, el cliente recibe payload completo siempre.

## Contrato
`GET /projects?fields=slug,title,metric` → solo esos campos + `slug` primero.
Desconocido → `400 Unknown field(s)`.
`ProjectDto.metric?: string` ya existe en `api/src/data/en/projects.ts`
(`p95 840ms → 120ms`, `AUC 0.91`); solo falta exponerlo vía `fields`.

## Pasos en `api/`
1. `projects.dto.ts`: añadir `fields?: IsString` a `ProjectsQueryDto`.
2. `projects.service.ts`: implementar `pickFields` espejo de `certifications`
   con allowlist `slug,title,description,stack,featured,year,links,metric`.
3. `projects.controller.ts`: aceptar `?fields=` en `findAll` y `findOne`.
4. No romper `limit` default 20 ni filtros `featured/stack`.

## Verificación
`GET /api/projects?fields=slug,title,metric` + caso 400
`?fields=slug,inexistente`.
