// Fuente live: JSON del repo de datos servido por raw.githubusercontent.com
// (`${PUBLIC_DATA_URL}/{lang}/{recurso}.json`). Sin servidor propio: los filtros
// que hacía la API corren en memoria con las mismas funciones que el mock.
import type {
  CaseStudyDto,
  CaseStudySummaryDto,
  CertificationDto,
  CertificationsQuery,
  EducationDto,
  ExperienceDto,
  Lang,
  ProfileDto,
  ProjectDto,
  ProjectsQuery,
  PublicationDto,
  PublicationsQuery,
  SkillGroupDto,
} from './contracts';
import {
  filterCertifications,
  filterProjects,
  filterPublications,
  groupCertificationDtos,
  loadHomeLive,
} from './mock-source';
import { ApiError, type HomeLiveData, type PortfolioSource } from './ports';

export const DEFAULT_DATA_URL = 'https://raw.githubusercontent.com/lisk0vian/portafolio-api/main';
export const DATA_TIMEOUT_MS = 8000;

export function getDataBaseUrl(): string {
  const env = import.meta.env.PUBLIC_DATA_URL as string | undefined;
  return (env?.trim() || DEFAULT_DATA_URL).replace(/\/+$/, '');
}

export class GithubPortfolioSource implements PortfolioSource {
  readonly kind = 'live' as const;
  // Una descarga por archivo y por instancia: el home pide certificaciones dos veces.
  private cache = new Map<string, Promise<unknown>>();

  constructor(private readonly baseUrl = getDataBaseUrl()) {}

  private get<T>(lang: Lang, path: string): Promise<T> {
    const url = `${this.baseUrl}/${lang}/${path}.json`;
    let hit = this.cache.get(url);
    if (!hit) {
      hit = fetch(url, { signal: AbortSignal.timeout(DATA_TIMEOUT_MS) }).then(async (res) => {
        if (!res.ok) throw new ApiError(path, `${res.status} ${res.statusText} — ${url}`, res.status);
        return res.json();
      });
      hit.catch(() => this.cache.delete(url)); // un fallo no queda cacheado
      this.cache.set(url, hit);
    }
    return hit as Promise<T>;
  }

  fetchProfile(lang: Lang) {
    return this.get<ProfileDto>(lang, 'profile');
  }
  async fetchProjects(lang: Lang, query: ProjectsQuery = {}) {
    return filterProjects(await this.get<ProjectDto[]>(lang, 'projects'), query);
  }
  fetchExperience(lang: Lang) {
    return this.get<ExperienceDto[]>(lang, 'experience');
  }
  fetchSkills(lang: Lang) {
    return this.get<SkillGroupDto[]>(lang, 'skills');
  }
  async fetchCertificationGroups(lang: Lang) {
    return groupCertificationDtos(await this.get<CertificationDto[]>(lang, 'certifications'));
  }
  async fetchCertifications(lang: Lang, query: CertificationsQuery = {}) {
    return filterCertifications(await this.get<CertificationDto[]>(lang, 'certifications'), query);
  }
  fetchCertificationsByGroup(lang: Lang, group: string, query: CertificationsQuery = {}) {
    return this.fetchCertifications(lang, { ...query, group });
  }
  async fetchPublications(lang: Lang, query: PublicationsQuery = {}) {
    return filterPublications(await this.get<PublicationDto[]>(lang, 'publications'), query);
  }
  fetchEducation(lang: Lang) {
    return this.get<EducationDto[]>(lang, 'education');
  }
  fetchCaseStudy(lang: Lang, slug: string) {
    return this.get<CaseStudyDto>(lang, `case-studies/${encodeURIComponent(slug)}`);
  }
  fetchCaseIndex(lang: Lang) {
    return this.get<CaseStudySummaryDto[]>(lang, 'case-studies/index');
  }
  fetchHomeLive(lang: Lang): Promise<HomeLiveData> {
    return loadHomeLive(this, lang);
  }
}
