// Texto del badge #api-status en el idioma de la página. Sin imports: lo usan el
// render del servidor (frontmatter) y los scripts de cliente de home y certificaciones.
const LABELS = {
  es: { live: "Datos de GitHub", mock: "Datos plantilla (mock)", cached: "Datos de GitHub (caché)", error: "GitHub no disponible · datos del build", local: "datos del build" },
  en: { live: "GitHub data", mock: "Sample data (mock)", cached: "GitHub data (cached)", error: "GitHub unavailable · build data", local: "build data" },
} as const;

export function apiStatusText(mode: string, lang: string, detail = ""): string {
  const L = lang.startsWith("en") ? LABELS.en : LABELS.es;
  const base = L[mode as keyof typeof L] ?? L.local;
  // El detalle (p. ej. "Network Error") solo acompaña a live, mock y error.
  return detail && (mode === "live" || mode === "mock" || mode === "error") ? `${base} · ${detail}` : base;
}
