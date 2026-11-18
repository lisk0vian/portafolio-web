# portafolio-web

Portafolio de Jerremi Aron Chancan Labajos ([lisk0vian](https://github.com/lisk0vian)), hecho con Astro y publicado en GitHub Pages:
**https://lisk0vian.github.io/portafolio-web/**

## De dónde salen los datos

Todo el contenido (perfil, proyectos, experiencia, certificaciones, publicaciones, casos de estudio y CV) vive en el repo [portafolio-api](https://github.com/lisk0vian/portafolio-api) como JSON por idioma. El sitio los lee de `raw.githubusercontent.com`:

- **En build:** el HTML se genera con los datos reales y una página por caso de estudio (`/casos/<slug>/`, `/en/cases/<slug>/`).
- **En el navegador:** el home vuelve a pedir los JSON, así un cambio en los datos se ve sin redesplegar.
- La marca (íconos, foto) viene de [lisk0vian/me](https://github.com/lisk0vian/me).

El workflow `deploy` publica en cada push a `main`, a diario (para recoger casos nuevos) y a mano.

## Comandos

| Comando | Acción |
|---|---|
| `pnpm install` | Instala dependencias |
| `pnpm dev` | Servidor local en `localhost:4321/portafolio-web/` |
| `pnpm build` | Genera `dist/` |
| `pnpm preview` | Sirve `dist/` |

Variables (`.env.development`): `PUBLIC_DATA_URL` (base de los JSON; por defecto el raw de GitHub) y `PUBLIC_USE_MOCK=true` para usar datos plantilla sin red. Para probar datos locales sin hacer push: `node ../api/scripts/serve.mjs` y `PUBLIC_DATA_URL=http://localhost:8787`.
