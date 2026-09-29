// Cambio de idioma sin perder el lugar de lectura.
// Cada idioma es otra URL ("/" y "/en/"), así que cambiarlo recarga la página.
// Antes de navegar se guarda la sección visible (los ids son iguales en ES/EN)
// y cuánto se había avanzado dentro de ella; al cargar el otro idioma se restaura.

const KEY = "mg-lang-scroll";
const HEADER = 96; // alto aproximado de la cabecera fija

type Saved = { path: string; id: string | null; offset: number; y: number; at: number };

const norm = (p: string) => p.replace(/\/+$/, "") || "/";

function currentAnchor(): { id: string | null; offset: number } {
  const sections = [...document.querySelectorAll<HTMLElement>("main [id]")].filter((el) => el.offsetParent !== null);
  let best: HTMLElement | null = null;
  for (const el of sections) {
    if (el.getBoundingClientRect().top <= HEADER) best = el;
  }
  if (!best) return { id: null, offset: 0 };
  return { id: best.id, offset: HEADER - best.getBoundingClientRect().top };
}

/** Navega al mismo lugar en el otro idioma (conserva ?query, p. ej. ?grupo=). */
export function switchLang(url: string) {
  const target = new URL(url, window.location.href);
  if (!target.search && window.location.search) target.search = window.location.search;
  try {
    const saved: Saved = { path: norm(target.pathname), ...currentAnchor(), y: window.scrollY, at: Date.now() };
    sessionStorage.setItem(KEY, JSON.stringify(saved));
  } catch {
    // Sin storage: se navega igual, sin restaurar.
  }
  window.location.href = target.toString();
}

function apply(saved: Saved) {
  const el = saved.id ? document.getElementById(saved.id) : null;
  const top = el ? el.getBoundingClientRect().top + window.scrollY - HEADER + saved.offset : saved.y;
  window.scrollTo({ top: Math.max(0, top), behavior: "instant" as ScrollBehavior });
}

/** Restaura la posición guardada por `switchLang` (y la reajusta mientras cargan los datos). */
export function restoreLangScroll() {
  let saved: Saved | null = null;
  try {
    saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    sessionStorage.removeItem(KEY);
  } catch {
    return;
  }
  if (!saved || norm(window.location.pathname) !== saved.path || Date.now() - saved.at > 30_000) return;
  const s = saved;
  // El contenido puede cambiar de alto al llegar los datos de la API: se reajusta
  // unas veces hasta que la persona haga scroll por su cuenta.
  let userMoved = false;
  const stop = () => { userMoved = true; };
  for (const ev of ["wheel", "touchstart", "keydown", "mousedown"]) window.addEventListener(ev, stop, { once: true, passive: true });
  apply(s);
  for (const ms of [150, 500, 1200]) window.setTimeout(() => { if (!userMoved) apply(s); }, ms);
}

/** Intercepta los enlaces de idioma (`data-lang-link`). */
export function initLangLinks() {
  document.addEventListener("click", (e) => {
    const a = (e.target as HTMLElement).closest<HTMLAnchorElement>("a[data-lang-link]");
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.getAttribute("aria-current") === "page") return;
    e.preventDefault();
    switchLang(a.href);
  });
}
