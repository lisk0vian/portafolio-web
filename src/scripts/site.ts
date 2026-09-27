// Global Marginalia behavior: switchers, reveal-on-scroll, scrollspy.
// Vanilla JS, no framework. Each page embeds its own locale-resolved data
// (PageData) as JSON; profile switches re-render from it without reload.

import { getProfile, getTheme, setProfile, setTheme, onEvent, initProfile, type Profile } from "./store";

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
}

/** Reveal-on-scroll matching the reference: [data-reveal] delay in ms, 900ms editorial curve. */
function initReveal() {
  const els = [...document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-rv])")];
  if (!els.length) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const check = () => {
    const H = window.innerHeight;
    document.querySelectorAll<HTMLElement>('[data-rv="1"]').forEach((el) => {
      if (el.getBoundingClientRect().top < H - 30) {
        el.dataset.rv = "2";
        el.style.opacity = "1";
        el.style.transform = "none";
      }
    });
  };
  els.forEach((el) => {
    el.dataset.rv = "1";
    const d = Number(el.dataset.reveal || 0);
    el.style.opacity = "0";
    el.style.transform = "translateY(18px)";
    el.style.transition = `opacity .9s cubic-bezier(.2,.7,.2,1) ${d}ms, transform .9s cubic-bezier(.2,.7,.2,1) ${d}ms`;
  });
  requestAnimationFrame(() => requestAnimationFrame(check));
  window.addEventListener("scroll", check, { passive: true });
  window.addEventListener("resize", check);
  window.setTimeout(check, 1200);
}

/** Scrollspy: show the current section in the header running head. */
function initScrollSpy(ids: string[], fallback: string) {
  const numberEl = document.querySelector("[data-run-n]");
  const labelEl = document.querySelector("[data-run-l]");
  if (!numberEl || !labelEl) return;
  const sections = ids
    .map((id) => ({ id, el: document.getElementById(id) }))
    .filter((x) => x.el) as { id: string; el: HTMLElement }[];
  if (!sections.length) return;
  const onScroll = () => {
    let current: string | null = null;
    for (const section of sections) {
      if (section.el.getBoundingClientRect().top < 140) current = section.id;
    }
    const index: any[] = window.__mgPage?.ui?.index ?? [];
    const match = index.find((x: any) => x.h.replace("#", "") === current);
    if (match) {
      numberEl.textContent = "§ " + match.n;
      labelEl.textContent = match.l;
      return;
    }
    numberEl.textContent = "●";
    labelEl.textContent = fallback;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
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
  if (opts?.spy) initScrollSpy(opts.spy, opts.roleFallback ?? "");
}
