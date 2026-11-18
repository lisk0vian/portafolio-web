// Filtros en memoria del puerto (`fields=` con allowlist, búsqueda, grupos, limit),
// compartidos por la fuente mock (datos plantilla) y la de GitHub (JSON raw).
import type {
  CaseStudyDto,
  CertificationDto,
  CertificationsQuery,
  Lang,
  ProjectDto,
  ProjectsQuery,
  PublicationDto,
  PublicationsQuery,
} from './contracts';
import {
  CASE_FIELD_ALLOWLIST,
  CERTS_FIELD_ALLOWLIST,
  PUBS_FIELD_ALLOWLIST,
} from './contracts';
import { mockData } from './mock-data';
import { ApiError, type HomeLiveData, type PortfolioSource } from './ports';

function pickFields<T extends object>(row: T, fields?: string): Partial<T> {
  if (!fields) return { ...row };
  const allow = new Set<string>([
    ...CERTS_FIELD_ALLOWLIST,
    ...PUBS_FIELD_ALLOWLIST,
    ...CASE_FIELD_ALLOWLIST,
  ]);
  const asked = fields
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  const unknown = asked.filter((f) => !allow.has(f));
  if (unknown.length > 0) {
    throw new ApiError(
      'mock',
      `Unknown field(s): ${unknown.join(', ')}`,
      400,
    );
  }
  const out: Record<string, unknown> = { slug: (row as { slug?: unknown }).slug };
  for (const f of asked) {
    if (f === 'slug') continue;
    out[f] = (row as Record<string, unknown>)[f];
  }
  return out as Partial<T>;
}

function isExpired(ym?: string | null): boolean {
  if (!ym) return false;
  return ym.slice(0, 4) < String(new Date().getFullYear());
}

export function filterProjects(all: ProjectDto[], query: ProjectsQuery = {}) {
  let rows = [...all];
  if (query.featured !== undefined) rows = rows.filter((p) => p.featured === query.featured);
  if (query.stack) rows = rows.filter((p) => p.stack.includes(query.stack!));
  return rows.slice(0, query.limit ?? 20);
}

export function groupCertificationDtos(all: CertificationDto[]) {
  // Espejo de la API: count + última credencial + rango de años por grupo.
  const byGroup = new Map<string, CertificationDto[]>();
  for (const c of all) {
    for (const t of c.tags) byGroup.set(t, [...(byGroup.get(t) ?? []), c]);
  }
  return [...byGroup.entries()]
    .map(([group, items]) => {
      const years = items.map((c) => Number(c.issueDate.slice(0, 4))).sort((a, b) => a - b);
      const top = [...items].sort((a, b) => b.issueDate.localeCompare(a.issueDate))[0];
      return {
        group,
        count: items.length,
        latest: { title: top.title, level: top.level, year: Number(top.issueDate.slice(0, 4)) },
        fromYear: years[0],
        toYear: years[years.length - 1],
      };
    })
    .sort((a, b) => a.group.localeCompare(b.group));
}

export function filterCertifications(all: CertificationDto[], query: CertificationsQuery = {}) {
  let rows = [...all];
  if (query.search) {
    const q = query.search.toLowerCase();
    rows = rows.filter((c) =>
      `${c.title} ${c.issuer} ${c.slug}`.toLowerCase().includes(q),
    );
  }
  if (query.issuer) rows = rows.filter((c) => c.issuer === query.issuer);
  if (query.skill) rows = rows.filter((c) => c.skills.includes(query.skill!));
  if (query.category) rows = rows.filter((c) => c.category === query.category);
  if (query.tag) rows = rows.filter((c) => c.tags.includes(query.tag!));
  if (query.group) rows = rows.filter((c) => c.tags.includes(query.group!));
  if (query.featured !== undefined) rows = rows.filter((c) => c.featured === query.featured);
  if (query.expired !== undefined)
    rows = rows.filter((c) => isExpired(c.expiryDate) === query.expired);
  rows = rows.slice(0, query.limit ?? 50);
  return rows.map((r) => pickFields(r, query.fields));
}

export function filterPublications(all: PublicationDto[], query: PublicationsQuery = {}) {
  let rows = [...all];
  if (query.type) rows = rows.filter((p) => p.type === query.type);
  if (query.year !== undefined) rows = rows.filter((p) => p.year === query.year);
  if (query.featured !== undefined) rows = rows.filter((p) => p.featured === query.featured);
  rows = rows.slice(0, query.limit ?? 50);
  return rows.map((r) => pickFields(r, query.fields));
}

/** Carga tolerante a fallos para el home: cada sección puede fallar sin tumbar las demás. */
export async function loadHomeLive(src: PortfolioSource, lang: Lang): Promise<HomeLiveData> {
  const settled = await Promise.allSettled([
    src.fetchProfile(lang),
    src.fetchProjects(lang, { limit: 20 }),
    src.fetchExperience(lang),
    src.fetchSkills(lang),
    src.fetchCertificationGroups(lang),
    src.fetchCertifications(lang, { limit: 50 }),
    src.fetchPublications(lang, { limit: 50 }),
    src.fetchEducation(lang),
  ]);
  const errors: HomeLiveData['errors'] = [];
  const paths = ['profile', 'projects', 'experience', 'skills', 'certification-groups', 'certifications', 'publications', 'education'];
  const val = <T>(i: number): T | undefined => {
    const r = settled[i];
    if (r.status === 'fulfilled') return r.value as T;
    errors.push({ path: paths[i], message: r.reason instanceof Error ? r.reason.message : String(r.reason) });
    return undefined;
  };
  return {
    profile: val(0),
    projects: val(1),
    experience: val(2),
    skills: val(3),
    certificationGroups: val(4),
    certifications: val(5),
    publications: val(6),
    education: val(7),
    errors,
  };
}

export class MockPortfolioSource implements PortfolioSource {
  readonly kind = 'mock' as const;

  async fetchProfile(lang: Lang) {
    return mockData[lang].profile;
  }
  async fetchProjects(lang: Lang, query: ProjectsQuery = {}) {
    return filterProjects(mockData[lang].projects, query);
  }
  async fetchExperience(lang: Lang) {
    return mockData[lang].experience;
  }
  async fetchSkills(lang: Lang) {
    return mockData[lang].skills;
  }
  async fetchCertificationGroups(lang: Lang) {
    return groupCertificationDtos(mockData[lang].certifications);
  }
  async fetchCertifications(lang: Lang, query: CertificationsQuery = {}) {
    return filterCertifications(mockData[lang].certifications, query);
  }
  async fetchCertificationsByGroup(lang: Lang, group: string, query: CertificationsQuery = {}) {
    return this.fetchCertifications(lang, { ...query, group });
  }
  async fetchPublications(lang: Lang, query: PublicationsQuery = {}) {
    return filterPublications(mockData[lang].publications, query);
  }
  async fetchEducation(lang: Lang) {
    return mockData[lang].education;
  }
  async fetchCaseStudy(lang: Lang, slug: string): Promise<CaseStudyDto> {
    // Los casos solo existen en el repo de datos; la plantilla no los trae.
    throw new ApiError(`case-studies/${slug}`, `Case ${slug} not available in mock mode (${lang})`, 404);
  }
  async fetchCaseIndex() {
    return [];
  }
  fetchHomeLive(lang: Lang): Promise<HomeLiveData> {
    return loadHomeLive(this, lang);
  }
}
