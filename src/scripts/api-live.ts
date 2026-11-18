// Revalidación cliente de la home contra un `PortfolioSource` inyectado.
// Buena práctica DI: no importa el singleton axios directo; recibe el puerto
// desde `composition.ts`. Por defecto usa mock o live según PUBLIC_USE_MOCK.
import { getDataBaseUrl } from "../lib/live-source";
import { createPortfolioSource } from "../lib/composition";
import type { PortfolioSource } from "../lib/ports";
import { mergeHomeLive } from "../lib/adapters";
import { getProfile, type Lang } from "./store";
import type { PageData } from "./site";
import { apiStatusText } from "../utils/api-status";

const CACHE_PREFIX = "mg-api-home:";
const CACHE_TTL_MS = 10 * 60 * 1000;

type CacheEntry = { at: number; live: unknown };

function readCache(lang: string): CacheEntry | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(CACHE_PREFIX + lang);
    if (!raw) return null;
    return JSON.parse(raw) as CacheEntry;
  } catch {
    return null;
  }
}

function writeCache(lang: string, live: unknown) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(
      CACHE_PREFIX + lang,
      JSON.stringify({ at: Date.now(), live }),
    );
  } catch {
    // Sin storage: sigue sin caché.
  }
}

function setStatus(mode: "local" | "live" | "mock" | "cached" | "error", detail = "") {
  try {
    document.documentElement.dataset.api = mode;
    const el = document.getElementById("api-status");
    if (el) {
      el.dataset.state = mode;
      el.textContent = apiStatusText(mode, document.documentElement.lang, detail);
    }
  } catch {
    // DOM no listo: no bloquea el render.
  }
  if (mode === "error" && detail) console.warn(`[api] ${detail}`);
}

function render(page: PageData) {
  const profile = getProfile();
  const fns = window.__mgRender;
  if (Array.isArray(fns)) fns.forEach((fn) => fn(page, profile));
  else if (typeof fns === "function") fns(page, profile);
}

/** Aplica caché fresca si existe. Devuelve true si pintó desde caché. */
function applyFreshCache(page: PageData, lang: Lang): boolean {
  const cached = readCache(lang);
  if (!cached || Date.now() - cached.at > CACHE_TTL_MS) return false;
  try {
    const updated = mergeHomeLive(page, cached.live as never);
    if (updated.length > 0) {
      window.__mgPage = page;
      render(page);
      setStatus("cached");
      return true;
    }
  } catch (e) {
    console.warn("[api] caché inválida, se ignora", e);
  }
  return false;
}

export async function refreshHomeFromApi(
  page: PageData,
  source: PortfolioSource = createPortfolioSource(),
): Promise<string[]> {
  const lang = (page.meta?.lang === "en" ? "en" : "es") as Lang;
  window.__mgPage = page;

  const fromCache = source.kind === "live" ? applyFreshCache(page, lang) : false;

  try {
    const live = await source.fetchHomeLive(lang);
    if (import.meta.env.DEV) {
      console.groupCollapsed(`[api] live (${lang}): ${getDataBaseUrl()}`);
      console.log("profile:", live.profile);
      console.log("projects:", live.projects);
      console.log("experience:", live.experience);
      console.log("skills:", live.skills);
      console.log("certGroups:", live.certificationGroups);
      console.log("certs:", live.certifications);
      console.log("pubs:", live.publications);
      console.log("edu:", live.education);
      if (live.errors.length > 0) console.warn("errors:", live.errors);
      console.groupEnd();
    }
    if (
      live.profile !== undefined ||
      live.projects !== undefined ||
      live.experience !== undefined ||
      live.skills !== undefined ||
      live.certificationGroups !== undefined ||
      live.certifications !== undefined ||
      live.publications !== undefined ||
      live.education !== undefined
    ) {
      const updated = mergeHomeLive(page, live);
      window.__mgPage = page;
      render(page);
      writeCache(lang, {
        profile: live.profile,
        projects: live.projects,
        experience: live.experience,
        skills: live.skills,
        certificationGroups: live.certificationGroups,
        certifications: live.certifications,
        publications: live.publications,
        education: live.education,
      });
      setStatus(source.kind === "mock" ? "mock" : "live", updated.join(", "));
      if (live.errors.length > 0) {
        console.warn("[api] parcial:", live.errors);
      }
      return updated;
    }
    // Todo falló en red.
    setStatus(fromCache ? "cached" : "error", live.errors[0]?.message ?? "");
    return [];
  } catch (e) {
    setStatus(fromCache ? "cached" : "error", e instanceof Error ? e.message : String(e));
    return [];
  }
}
