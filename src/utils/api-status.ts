// Texto del badge #api-status en el idioma de la página. Sin imports: lo usan el
// render del servidor (frontmatter) y los scripts de cliente de home y certificaciones.
const LABELS = {
  es: { live: "API en vivo", mock: "Mock API · datos plantilla", cached: "API (caché)", error: "API no disponible · datos locales", local: "datos locales" },
  en: { live: "Live API", mock: "Mock API · sample data", cached: "API (cached)", error: "API unavailable · local data", local: "local data" },
} as const;

export function apiStatusText(mode: string, lang: string, detail = ""): string {
  const L = lang.startsWith("en") ? LABELS.en : LABELS.es;
  const base = L[mode as keyof typeof L] ?? L.local;
  // El detalle (p. ej. "Network Error") solo acompaña a live, mock y error.
  return detail && (mode === "live" || mode === "mock" || mode === "error") ? `${base} · ${detail}` : base;
}
