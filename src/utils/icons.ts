// Iconos de trazo (geometría de Lucide, 24×24, trazo 1.75) como cadenas SVG,
// para usarlos igual desde Astro (`set:html`) y desde el render en cliente.

const paths = {
  "arrow-right": `<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>`,
  "arrow-down": `<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>`,
  "arrow-up-right": `<path d="M7 17 17 7"/><path d="M7 7h10v10"/>`,
  plus: `<path d="M5 12h14"/><path d="M12 5v14"/>`,
  minus: `<path d="M5 12h14"/>`,
  contrast: `<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor"/>`,
  terminal: `<path d="m5 7 5 5-5 5"/><path d="M12 19h7"/>`,
  copy: `<rect x="9" y="9" width="12" height="12" rx="1"/><path d="M5 15H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1"/>`,
} as const;

export type IconName = keyof typeof paths;

export function icon(name: IconName, cls = "size-[1em]"): string {
  return `<svg data-icon="${name}" class="${cls} shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="square" stroke-linejoin="miter" aria-hidden="true">${paths[name]}</svg>`;
}
