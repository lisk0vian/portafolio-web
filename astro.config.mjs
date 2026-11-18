// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages (repo lisk0vian/portafolio-web) → https://lisk0vian.github.io/portafolio-web/
  site: 'https://lisk0vian.github.io',
  base: '/portafolio-web',
  // La foto viene del repo de marca (lisk0vian/me); Astro la optimiza en build (WebP, srcset).
  image: { domains: ['raw.githubusercontent.com'] },
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: {
      prefixDefaultLocale: false,
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
