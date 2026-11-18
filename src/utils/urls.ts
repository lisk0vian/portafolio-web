// Locale-aware URLs built with Astro's i18n helpers.
// Spanish (default locale) has no URL prefix; English lives under /en/.
import { getRelativeLocaleUrl } from "astro:i18n";
import type { Lang } from "../scripts/store";

export type SitePage = "home" | "case" | "system" | "certs";

const slugs: Record<Exclude<SitePage, "home">, Record<Lang, string>> = {
  case: { es: "casos", en: "cases" },
  system: { es: "sistema-diseno", en: "design-system" },
  certs: { es: "certificaciones", en: "certifications" },
};

/** Relative URL of a page in the given locale (e.g. "/en/certifications"). */
export function pageUrl(lang: Lang, page: SitePage): string {
  if (page === "home") return getRelativeLocaleUrl(lang);
  return getRelativeLocaleUrl(lang, slugs[page][lang]);
}

/** URL of one case study, e.g. "/casos/chatcrm/" or "/en/cases/chatcrm/". */
export function caseUrl(lang: Lang, slug: string): string {
  return getRelativeLocaleUrl(lang, `${slugs.case[lang]}/${slug}`);
}

export function altLang(lang: Lang): Lang {
  return lang === "es" ? "en" : "es";
}

/** Relative URL of the same page in the other locale (language switcher target). */
export function altPageUrl(lang: Lang, page: SitePage): string {
  return pageUrl(altLang(lang), page);
}
