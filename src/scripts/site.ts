// Global site behavior: switchers, reveal-on-scroll, scrollspy.
// Vanilla JS, no framework. Each page embeds its own locale-resolved data
// (PageData) as JSON; profile switches re-render from it without reload.

import { getProfile, getTheme, setProfile, setTheme, onEvent, initProfile, type Profile } from "./store";
import { initLangLinks, restoreLangScroll } from "./lang-switch";

/** One locale, fully resolved at build time (no { es, en } pairs left). */
export type PageData = {
  ui: Record<string, any>;
  fullstack: Record<string, any>;
  data: Record<string, any>;
  personal: Record<string, any>;
  meta: { lang: string; homeUrl: string };
};

export type RenderFn = (page: PageData, profile: Profile) => void;

declare global {
  interface Window {
    __mgRender?: RenderFn | RenderFn[];
    __mgPage?: PageData;
  }
}

function lookup(root: any, path: string): any {
  let node = root;
  for (const part of path.split(".")) node = node?.[part];
  return node;
}

/** Update static copy marked with data-t (ui.*) or data-tp (profile.*). */
export function applyI18n(page: PageData) {
  const profile = getProfile();
  document.querySelectorAll<HTMLElement>("[data-t]").forEach((el) => {
    const value = lookup(page, el.dataset.t!);
    if (typeof value === "string") el.textContent = value;
  });
  document.querySelectorAll<HTMLElement>("[data-tp]").forEach((el) => {
    const value = lookup((page as any)[profile], el.dataset.tp!);
    if (typeof value === "string") el.textContent = value;
  });
}

function paintSwitchers() {
  const profile = getProfile();
  const theme = getTheme();
  document.querySelectorAll<HTMLElement>("[data-profile-btn]").forEach((button) => {
    const active = button.dataset.profileBtn === profile;
    button.setAttribute("aria-pressed", String(active));
    button.dataset.active = active ? "true" : "false";
  });
  document.querySelectorAll<HTMLElement>("[data-theme-label]").forEach((el) => {
    const labels = (el.dataset.themeLabel || "Claro|Oscuro").split("|");
    el.textContent = theme === "dark" ? labels[0] : labels[1] ?? "";
  });
}

function rerender(page: PageData) {
  const profile = getProfile();
  document.documentElement.dataset.profile = profile;
  applyI18n(page);
  const fns = window.__mgRender;
  if (Array.isArray(fns)) fns.forEach((fn) => fn(page, profile));
  else if (typeof fns === "function") fns(page, profile);
  paintSwitchers();
  riseAll();
}

/** Reveal-on-scroll matching the reference: [data-reveal] delay in ms, 900ms editorial curve. */
function initReveal() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])")];
  if (!els.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  // IntersectionObserver en vez de medir en cada scroll: sin layouts forzados.
  const show = (el: HTMLElement) => {
    el.dataset.rv = "2";
    el.style.opacity = "1";
    el.style.transform = "none";
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      io.unobserve(e.target);
      show(e.target as HTMLElement);
    }
  }, { rootMargin: "0px 0px -30px 0px" });
  els.forEach((el) => {
    el.dataset.rv = "1";
    const d = Number(el.dataset.reveal || 0);
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `opacity .9s cubic-bezier(.2,.7,.2,1) ${d}ms, transform .9s cubic-bezier(.2,.7,.2,1) ${d}ms`;
    io.observe(el);
  });
}

/**
 * Texto [data-rise]: cada palabra sube desde una máscara, en escalera, al entrar
 * en vista (una vez). Parte los nodos de texto en su sitio, así que respeta
 * spans y saltos de línea. Se vuelve a llamar tras cada re-render o cambio de
 * idioma: un bloque ya partido se salta, uno re-escrito se parte de nuevo.
 */
let riseIO: IntersectionObserver | null = null;
export function riseAll() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  riseIO ??= new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      riseIO!.unobserve(entry.target);
      const el = entry.target as HTMLElement;
      el.dataset.in = "";
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll<HTMLElement>("[data-rise]").forEach((el) => {
    if (el.querySelector(".rw")) return;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (walker.nextNode()) nodes.push(walker.currentNode as Text);
    let i = 0;
    for (const node of nodes) {
      const frag = document.createDocumentFragment();
      for (const part of (node.textContent ?? "").split(/(\s+)/)) {
        if (!part) continue;
        if (/^\s+$/.test(part)) { frag.append(part); continue; }
        const outer = document.createElement("span");
        outer.className = "rw";
        const inner = document.createElement("span");
        inner.textContent = part;
        inner.style.setProperty("--i", String(i++));
        outer.append(inner);
        frag.append(outer);
      }
      node.replaceWith(frag);
    }
    riseIO!.observe(el);
  });
}

/** Repite la entrada en cascada de los hijos de una lista recién filtrada. */
export function stagger(el: HTMLElement | null) {
  if (!el) return;
  el.classList.remove("mg-stagger");
  void el.offsetWidth; // reinicia la animación aunque la clase ya estuviera
  el.classList.add("mg-stagger");
}

/** Reloj de hora local en cada [data-clock] (zona IANA en el atributo). */
function initClock() {
  const tick = () =>
    document.querySelectorAll<HTMLElement>("[data-clock]").forEach((el) => {
      try {
        el.textContent = new Intl.DateTimeFormat(document.documentElement.lang || "es", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: el.dataset.clock || undefined }).format(new Date());
      } catch {
        el.textContent = "--:--";
      }
    });
  tick();
  window.setInterval(tick, 30_000);
}

/** Atajo ":" o "/" (fuera de campos de texto) y botón del dock: llevan a la terminal. */
function initTermShortcut() {
  const open = () => {
    const term = document.getElementById("consola");
    if (!term) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    term.scrollIntoView({ behavior: smooth ? "smooth" : "auto", block: "center" });
    term.querySelector<HTMLInputElement>("[data-term-input]")?.focus({ preventScroll: true });
  };
  document.addEventListener("keydown", (e) => {
    if (e.key !== ":" && e.key !== "/") return;
    const t = e.target as HTMLElement;
    if (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
    e.preventDefault();
    open();
  });
  document.querySelectorAll("[data-open-term]").forEach((b) => b.addEventListener("click", open));
}

/** Scrollspy: show the current section in the header running head and the dock. */
function initScrollSpy(ids: string[], fallback: string) {
  const numberEl = document.querySelector("[data-run-n]");
  const labelEl = document.querySelector("[data-run-l]");
  const dock = document.querySelector<HTMLElement>("[data-dock]");
  const hero = document.querySelector<HTMLElement>("[data-hero]");
  if (!numberEl || !labelEl) return;
  const sections = ids
    .map((id) => ({ id, el: document.getElementById(id) }))
    .filter((x) => x.el) as { id: string; el: HTMLElement }[];
  if (!sections.length) return;
  // Sección actual = la que cruza una franja de 1 px a 140 px del borde superior (bajo
  // el encabezado). IntersectionObserver evita medir todas las secciones en cada scroll.
  const inBand = new Set<string>();
  const update = () => {
    const current = sections.find((x) => inBand.has(x.id))?.id ?? null;
    document.querySelectorAll<HTMLElement>("[data-dock-link]").forEach((a) => a.setAttribute("aria-current", String(a.dataset.dockLink === current)));
    const index: any[] = window.__mgPage?.ui?.index ?? [];
    const match = index.find((x: any) => x.h.replace("#", "") === current);
    numberEl.textContent = match ? "§ " + match.n : "●";
    labelEl.textContent = match ? match.l : fallback;
  };
  let spy: IntersectionObserver | null = null;
  const observe = () => {
    spy?.disconnect();
    inBand.clear();
    spy = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const id = (e.target as HTMLElement).id;
        if (e.isIntersecting) inBand.add(id);
        else inBand.delete(id);
      }
      update();
    }, { rootMargin: `-140px 0px -${Math.max(0, window.innerHeight - 141)}px 0px` });
    sections.forEach((x) => spy!.observe(x.el));
  };
  observe();
  let rz = 0;
  window.addEventListener("resize", () => { window.clearTimeout(rz); rz = window.setTimeout(observe, 200); });
  // El dock aparece cuando el hero sale (menos de 55% visible por abajo).
  if (dock && hero) {
    new IntersectionObserver(([e]) => {
      dock.dataset.hidden = String(e.boundingClientRect.bottom > window.innerHeight * 0.55);
    }, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) }).observe(hero);
  }
}

/** Theme toggle + reveal. Used by pages without switchable content. */
export function initChrome() {
  initProfile();
  document.querySelectorAll("[data-toggle-theme]").forEach((button) =>
    button.addEventListener("click", () => setTheme(getTheme() === "dark" ? "light" : "dark"))
  );
  onEvent("mg:theme", () => paintSwitchers());
  paintSwitchers();
  initReveal();
  initClock();
  initTermShortcut();
  riseAll();
  initLangLinks();
  restoreLangScroll();
}

/** Full init for pages with profile-switchable content. */
export function initSite(page: PageData, opts?: { spy?: string[]; roleFallback?: string }) {
  window.__mgPage = page;
  initProfile();

  document.querySelectorAll("[data-set-profile]").forEach((button) =>
    button.addEventListener("click", () => setProfile((button as HTMLElement).dataset.setProfile as Profile))
  );

  onEvent("mg:profile", () => rerender(page));

  initChrome();
  applyI18n(page);
  riseAll();
  if (opts?.spy) initScrollSpy(opts.spy, opts.roleFallback ?? "");
}
