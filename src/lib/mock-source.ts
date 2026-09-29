// Implementación mock del puerto: replica el comportamiento de la API NestJS
// (filtros en memoria, `fields=` con allowlist + 400, slug 404, limit).
// Buena práctica: mismo contrato que live, sin red, para ver la plantilla
// idéntica a como llegará de la API real.
import { ApiError } from './api';
import type {
  CaseStudyDto,
  CertificationsQuery,
  Lang,
  ProjectsQuery,
  PublicationsQuery,
} from './contracts';
import {
  CASE_FIELD_ALLOWLIST,
  CERTS_FIELD_ALLOWLIST,
  PUBS_FIELD_ALLOWLIST,
} from './contracts';
import { mockData } from './mock-data';
import type { HomeLiveData, PortfolioSource } from './ports';

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

export class MockPortfolioSource implements PortfolioSource {
  readonly kind = 'mock' as const;

  async fetchProfile(lang: Lang) {
    return mockData[lang].profile;
  }

  async fetchProjects(lang: Lang, query: ProjectsQuery = {}) {
    let rows = [...mockData[lang].projects];
    if (query.featured !== undefined) rows = rows.filter((p) => p.featured === query.featured);
    if (query.stack) rows = rows.filter((p) => p.stack.includes(query.stack!));
    return rows.slice(0, query.limit ?? 20);
  }

  async fetchExperience(lang: Lang) {
    return mockData[lang].experience;
  }

  async fetchSkills(lang: Lang) {
    return mockData[lang].skills;
  }

  async fetchCertificationGroups(lang: Lang) {
    // Espejo de la API: count + última credencial + rango de años por grupo.
    const byGroup = new Map<string, typeof mockData[Lang]['certifications']>();
    for (const c of mockData[lang].certifications) {
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

  async fetchCertifications(lang: Lang, query: CertificationsQuery = {}) {
    let rows = [...mockData[lang].certifications];
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

  async fetchCertificationsByGroup(
    lang: Lang,
    group: string,
    query: CertificationsQuery = {},
  ) {
    return this.fetchCertifications(lang, { ...query, group });
  }

  async fetchPublications(lang: Lang, query: PublicationsQuery = {}) {
    let rows = [...mockData[lang].publications];
    if (query.type) rows = rows.filter((p) => p.type === query.type);
    if (query.year !== undefined) rows = rows.filter((p) => p.year === query.year);
    if (query.featured !== undefined) rows = rows.filter((p) => p.featured === query.featured);
    rows = rows.slice(0, query.limit ?? 50);
    return rows.map((r) => pickFields(r, query.fields));
  }

  async fetchEducation(lang: Lang) {
    return mockData[lang].education;
  }

  async fetchCaseStudy(lang: Lang, slug: string): Promise<Partial<CaseStudyDto>> {
    const found = mockData[lang].cases.find((c) => c.slug === slug);
    if (!found) throw new ApiError(`/case-studies/${slug}`, `Case ${slug} not found`, 404);
    return pickFields(found, 'slug,title,deck,quote,nextCaseSlug');
  }

  async fetchHomeLive(lang: Lang): Promise<HomeLiveData> {
    const [profile, projects, experience, skills, certificationGroups, certifications, publications, education] =
      await Promise.all([
        this.fetchProfile(lang),
        this.fetchProjects(lang, { limit: 20 }),
        this.fetchExperience(lang),
        this.fetchSkills(lang),
        this.fetchCertificationGroups(lang),
        this.fetchCertifications(lang, { limit: 50 }),
        this.fetchPublications(lang, { limit: 50 }),
        this.fetchEducation(lang),
      ]);
    return {
      profile,
      projects,
      experience,
      skills,
      certificationGroups,
      certifications,
      publications,
      education,
      errors: [],
    };
  }
}
