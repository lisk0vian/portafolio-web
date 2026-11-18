// Adaptadores API -> forma que espera la web (fase 1, sin tocar la API).
// La web hoy es dual `fullstack|data` con campos editoriales (h1a, about, notes...)
// en `src/data/content.ts`, mientras la API devuelve un modelo plano.
// Ediciones (ficha 005): cada item vivo puede traer `editions`; cada perfil de la
// web recibe solo los suyos. Items sin `editions` van a ambos. Si la API no manda
// nada para una edición, se conserva el contenido local de `content.ts`.
import type {
  CertificationDto,
  CertificationGroupDto,
  Edition,
  EducationDto,
  ExperienceDto,
  HomeLiveData,
  ProfileDto,
  ProjectDto,
  PublicationDto,
  SkillGroupDto,
} from "./contracts";
import type { PageData } from "../scripts/site";
import { certProfileFilter } from "../data/content";
import type { CertProfileFilter } from "../data/content";

export type WebProject = {
  no: string;
  title: string;
  sum: string;
  stack: string[];
  year: string;
  metric: string;
  slug?: string;
  role?: string;
  problem?: string;
  approach?: string;
  result?: string;
  figures?: { k: string; a: string; b: string }[];
  cap?: string;
  links?: { demo?: string; repo?: string };
};

export function withNumbers<T extends object>(items: T[]): (T & { no: string })[] {
  return items.map((x, i) => ({ ...x, no: "0" + (i + 1) }));
}

export function mapProjects(projects: ProjectDto[]): WebProject[] {
  return withNumbers(
    projects.map((p) => ({
      title: p.title,
      sum: p.description,
      stack: p.stack ?? [],
      year: String(p.year ?? ""),
      // La API ya expone `metric`: se prefiere; sin ella, marca de destacado.
      metric: p.metric ?? (p.featured ? "★ destacado" : ""),
      slug: p.slug,
      links: p.links ?? {},
      ...(p.case ? { case: p.case } : {}),
      // Ficha 004: detalle del destacado y de las filas desplegables.
      ...(p.role ? { role: p.role } : {}),
      ...(p.problem ? { problem: p.problem } : {}),
      ...(p.approach ? { approach: p.approach } : {}),
      ...(p.result ? { result: p.result } : {}),
      ...(p.results?.length ? { figures: p.results.map((r) => ({ k: r.label, a: r.before, b: r.after })) } : {}),
      ...(p.resultsCaption ? { cap: p.resultsCaption } : {}),
    })),
  );
}

function yearOf(date: string | null | undefined): string {
  if (!date) return "";
  const m = String(date).match(/^(\d{4})/);
  return m ? m[1] : String(date).slice(0, 4);
}

export function mapExperience(list: ExperienceDto[], lang: string = "es") {
  const es = lang !== "en";
  return list.map((e) => {
    const from = yearOf(e.startDate);
    const to = e.current || !e.endDate ? (es ? "hoy" : "now") : yearOf(e.endDate);
    const span = Math.max(1, (e.current || !e.endDate ? new Date().getFullYear() : Number(yearOf(e.endDate))) - Number(from));
    return {
      y: from && to ? `${from} — ${to}` : (from ?? ""),
      dur: from ? `${span} ${es ? (span === 1 ? "año" : "años") : span === 1 ? "year" : "years"}` : "",
      r: e.role,
      c: `${e.company} · ${e.location}`.replace(/ · $/, ""),
      d: e.description,
      current: e.current,
      stack: [...(e.stack ?? [])],
      ...(e.wins?.length ? { wins: [...e.wins] } : {}),
    };
  });
}

export type WebSkill = { name: string; years?: number; daily?: boolean };

/** Acepta `items` como SkillItemDto[] (API actual) o string[] (legado). */
export function normalizeSkillItems(items: unknown[] | undefined): WebSkill[] {
  return (items ?? []).map((it) =>
    typeof it === "string" ? { name: it } : { ...(it as WebSkill), name: String((it as WebSkill).name ?? "") },
  );
}

/** `items` sigue siendo string[] (terminal y filtros); `meta` lleva años y uso diario. */
export function mapSkills(groups: SkillGroupDto[]) {
  return groups.map((g) => {
    const meta = normalizeSkillItems(g.items as unknown[]);
    return { g: g.category, items: meta.map((m) => m.name), meta };
  });
}

export type WebCert = {
  slug: string;
  title: string;
  issuer: string;
  category: string;
  tags: string[];
  date: string;
  expiry: string | null;
  expired: boolean;
  featured: boolean;
  url: string | null;
  ref: string;
  skills: string[];
};

function isExpired(date: string | null | undefined, now = new Date()): boolean {
  if (!date) return false;
  return new Date(`${date}-01T00:00:00`) < now;
}

/** Orden featured primero, luego más reciente. Expiradas al final de su bloque. */
export function mapCertifications(
  list: Partial<CertificationDto>[],
): WebCert[] {
  const rows = (list ?? []).map((c) => ({
    slug: String(c.slug ?? ""),
    title: String(c.title ?? c.slug ?? ""),
    issuer: String(c.issuer ?? ""),
    category: String(c.category ?? ""),
    tags: [...(c.tags ?? [])],
    date: String(c.issueDate ?? ""),
    expiry: (c.expiryDate as string | null | undefined) ?? null,
    expired: isExpired(c.expiryDate as string | null | undefined),
    featured: c.featured === true,
    url: (c.credentialUrl as string | undefined) ?? null,
    ref: String(
      (c.credentialId as string | undefined) ?? c.slug ?? "",
    ),
    skills: [...(c.skills ?? [])],
  }));
  const rank = (c: WebCert) => [
    c.featured ? 0 : 1,
    c.expired ? 1 : 0,
    c.date,
  ];
  return rows.sort((a, b) => {
    const ra = rank(a);
    const rb = rank(b);
    if (ra[0] !== rb[0]) return (ra[0] as number) - (rb[0] as number);
    if (ra[1] !== rb[1]) return (ra[1] as number) - (rb[1] as number);
    return String(rb[2]).localeCompare(String(ra[2]));
  });
}

/** Agrupa por tag normalizado (igual que `GET /certifications/groups`). */
export function groupCertifications(certs: WebCert[]) {
  const counts = new Map<string, WebCert[]>();
  for (const c of certs) {
    const tags = c.tags.length > 0 ? c.tags : ["otros"];
    for (const raw of tags) {
      const g = String(raw).trim().toLowerCase();
      if (!g) continue;
      if (!counts.has(g)) counts.set(g, []);
      counts.get(g)!.push(c);
    }
  }
  return [...counts.entries()]
    .map(([group, items]) => ({ group, count: items.length, items }))
    .sort((a, b) => a.group.localeCompare(b.group));
}

/** Regla Q9: skills/category como filtro + only/exclude por slug. Vacío = pasa. */
export function filterCertificationsByProfile(
  certs: WebCert[],
  filter: CertProfileFilter,
): WebCert[] {
  const skills = (filter.skills ?? []).map((s) => s.toLowerCase());
  const cats = (filter.categories ?? []).map((s) => s.toLowerCase());
  const only = new Set((filter.onlySlugs ?? []).map((s) => s.toLowerCase()));
  const excl = new Set((filter.excludeSlugs ?? []).map((s) => s.toLowerCase()));
  return certs.filter((c) => {
    const slug = c.slug.toLowerCase();
    if (excl.has(slug)) return false;
    if (only.size > 0) return only.has(slug);
    const skillOk =
      skills.length === 0 ||
      c.skills.some((s) => skills.includes(String(s).toLowerCase()));
    const catOk =
      cats.length === 0 || cats.includes(c.category.toLowerCase());
    return skillOk && catOk;
  });
}

export type WebPub = {
  slug: string;
  title: string;
  authors: string[];
  venue: string;
  type: string;
  typeLabel: string;
  year: string;
  doi: string;
  pdf: string | null;
  url: string | null;
  abstract: string;
  tags: string[];
  featured: boolean;
  pages: string;
  language: string;
};

/** Destacadas primero, luego año descendente. Forma espejo de PublicationDto. */
export function mapPublications(list: Partial<PublicationDto>[]): WebPub[] {
  return [...(list ?? [])]
    .map((p) => ({
      slug: String(p.slug ?? ""),
      title: String(p.title ?? p.slug ?? ""),
      authors: [...(p.authors ?? [])],
      venue: String(p.venue ?? ""),
      type: String(p.type ?? "journal"),
      typeLabel: String(p.type ?? "journal"),
      year: String(p.year ?? ""),
      doi: String(p.doi ?? ""),
      pdf: (p.pdfUrl as string | undefined) ?? null,
      url: (p.url as string | undefined) ?? null,
      abstract: String(p.abstract ?? ""),
      tags: [...(p.keywords ?? [])],
      featured: p.featured === true,
      pages: String(p.pages ?? ""),
      language: String(p.language ?? ""),
    }))
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      return String(b.year).localeCompare(String(a.year));
    });
}

/** Items de una edición: los etiquetados con ella y los que no traen `editions`. */
export function forEdition<T extends { editions?: Edition[] }>(list: T[] | undefined, edition: Edition): T[] {
  return (list ?? []).filter((x) => !x.editions?.length || x.editions.includes(edition));
}

export function mapEducation(list: EducationDto[]) {
  return (list ?? []).map((e) => ({
    p: String(e.period ?? ""),
    d: String(e.degree ?? ""),
    s: String(e.school ?? ""),
    desc: String(e.description ?? ""),
  }));
}

export function mergeCertGroups(
  groups: CertificationGroupDto[] | undefined,
  certs: WebCert[],
) {
  const byGroup = new Map(groupCertifications(certs).map((g) => [g.group, g]));
  const base = (groups ?? []).map((g) => {
    const key = String(g.group).trim().toLowerCase();
    const found = byGroup.get(key);
    return { group: key, count: found?.count ?? g.count ?? 0 };
  });
  // Grupos solo locales (p. ej. "otros") que la API aún no conoce.
  for (const [key, g] of byGroup) {
    if (!base.some((b) => b.group === key)) base.push({ group: key, count: g.count });
  }
  return base.sort((a, b) => a.group.localeCompare(b.group));
}

/** Mezcla perfil API en `personal` + rol/intro de cada perfil dual. */
export function applyProfile(
  page: PageData,
  profile: ProfileDto,
): { personalChanged: boolean; roleChanged: boolean } {
  const base = profile;
  let personalChanged = false;
  let roleChanged = false;
  const personal = page.personal as Record<string, any>;
  if (personal) {
    if (profile.name) {
      personal.name = profile.name;
      personalChanged = true;
    }
    if (profile.email) {
      personal.email = profile.email;
      personalChanged = true;
    }
    if (profile.location) {
      personal.location = profile.location;
      personalChanged = true;
    }
    if (profile.availability) {
      personal.availability = profile.availability;
      personal.availabilityLong = profile.availability;
      personalChanged = true;
    }
    if (profile.cvUrl) {
      personal.cvUrl = profile.cvUrl;
      personalChanged = true;
    }
    if (profile.timezone) {
      personal.timezone = profile.timezone;
      personalChanged = true;
    }
    if (profile.hoursNote) {
      personal.hoursNote = profile.hoursNote;
      personalChanged = true;
    }
    if (profile.facts?.length) {
      personal.facts = profile.facts.map((f) => ({ k: f.label, v: f.value }));
      personalChanged = true;
    }
    // Directorio B: nota por red (ficha 004), emparejada por etiqueta.
    const notes = (profile.socials ?? []).filter((x) => x.note);
    if (notes.length && personal.socials) {
      for (const soc of Object.values(personal.socials as Record<string, any>)) {
        const hit = notes.find((x) => x.label.toLowerCase() === String(soc.label).toLowerCase());
        if (hit) soc.note = hit.note;
      }
      personalChanged = true;
    }
  }
  for (const key of ["fullstack", "data"] as const) {
    const p = (page as Record<string, any>)[key];
    if (!p) continue;
    // Campos base + los de la edición (ganan los de la edición).
    const ed = profile.editions?.[key] ?? {};
    profile = { ...base, ...ed } as ProfileDto;
    if (ed.headline) {
      p.h1a = ed.headline.before;
      p.h1em = ed.headline.emphasis;
      p.h1b = ed.headline.after;
      roleChanged = true;
    }
    if (profile.notes?.length) {
      p.notes = profile.notes.map((x, i) => ({ n: String(i + 1), t: x.text }));
      roleChanged = true;
    }
    if (profile.role) {
      p.role = profile.role;
      roleChanged = true;
    }
    if (profile.bio) {
      p.intro = profile.bio;
      roleChanged = true;
    }
    if (profile.letter) {
      p.letter = profile.letter;
      roleChanged = true;
    }
    // Ficha 004: un solo perfil en la API → aplica a ambas ediciones.
    if (profile.quote) {
      p.quote = profile.quote;
      if (profile.quoteSource) p.quoteBy = profile.quoteSource;
      roleChanged = true;
    }
    if (profile.principles?.length) {
      const roman = ["I.", "II.", "III.", "IV.", "V.", "VI."];
      p.principles = profile.principles.map((x, i) => ({ n: roman[i] ?? `${i + 1}.`, t: x.title, d: x.text }));
      roleChanged = true;
    }
    if (profile.now?.items?.length) {
      p.now = profile.now.items.map((x) => ({ k: x.label, v: x.value }));
      p.nowD = profile.now.updatedAt;
      roleChanged = true;
    }
    if (Array.isArray(profile.about) && profile.about.length > 0) {
      p.about = profile.about.map((text: string, i: number) => ({
        t: text,
        n: String(i + 1),
      }));
      roleChanged = true;
    }
  }
  return { personalChanged, roleChanged };
}

/**
 * Fusiona datos vivos en el PageData embebido. Mutado in-place para que los
 * closures de `initSite(page)` sigan apuntando al mismo objeto.
 * Devuelve lista de secciones actualizadas para logs/badge.
 */
export function mergeHomeLive(page: PageData, live: HomeLiveData): string[] {
  const updated: string[] = [];
  if (live.profile) {
    applyProfile(page, live.profile);
    updated.push("profile");
  }
  const lang = String((page.meta as any)?.lang ?? "es");
  const mark = (k: string) => { if (!updated.includes(k)) updated.push(k); };
  for (const key of ["fullstack", "data"] as const) {
    const p = (page as Record<string, any>)[key];
    if (!p) continue;
    const projects = forEdition(live.projects, key);
    if (projects.length) {
      p.projects = mapProjects(projects);
      mark("projects");
    }
    const experience = forEdition(live.experience, key);
    if (experience.length) {
      p.exp = mapExperience(experience, lang);
      mark("experience");
    }
    const skills = forEdition(live.skills, key);
    if (skills.length) {
      p.stack = mapSkills(skills);
      mark("skills");
    }
    const education = forEdition(live.education, key);
    if (education.length) {
      p.edu = mapEducation(education);
      mark("education");
    }
    if (live.certifications || live.certificationGroups) {
      const mapped = mapCertifications(live.certifications ?? []);
      const filter: CertProfileFilter =
        certProfileFilter[key] ?? { skills: [], categories: [], onlySlugs: [], excludeSlugs: [] };
      const scoped = filterCertificationsByProfile(mapped, filter);
      p.certs = scoped;
      p.certGroups = mergeCertGroups(live.certificationGroups, scoped);
      if (!updated.includes("certs")) updated.push("certs");
    }
    if (live.publications) {
      p.pubs = mapPublications(live.publications);
      if (!updated.includes("pubs")) updated.push("pubs");
    }
  }
  return updated;
}
