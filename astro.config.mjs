// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub Pages (repo lisk0vian/portafolio-web) → https://lisk0vian.github.io/portafolio-web/
  site: 'https://lisk0vian.github.io',
  base: '/portafolio-web',
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
