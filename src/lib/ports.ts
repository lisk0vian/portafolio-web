// Puertos (interfaces) del portafolio — base de la inyección de dependencias en Astro.
//
// Buena práctica aplicada: los componentes `.astro` nunca importan `axios` ni
// `fetch` directo. Reciben un `PortfolioSource` por props (inyectado desde la
// página vía `composition.ts`). En cliente, `api-live.ts` recibe el mismo
// puerto en vez de importar el singleton.
//
// Implementaciones:
// - `MockPortfolioSource` (src/lib/mock-source.ts): datos de la plantilla.
// - `GithubPortfolioSource` (src/lib/live-source.ts): JSON del repo de datos (raw de GitHub).
import type {
  CaseStudyDto,
  CaseStudySummaryDto,
  CertificationDto,
  CertificationGroupDto,
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

export type HomeLiveData = {
  profile?: ProfileDto;
  projects?: ProjectDto[];
  experience?: ExperienceDto[];
  skills?: SkillGroupDto[];
  certificationGroups?: CertificationGroupDto[];
  certifications?: Partial<CertificationDto>[];
  publications?: Partial<PublicationDto>[];
  education?: EducationDto[];
  errors: { path: string; message: string }[];
};

export interface PortfolioSource {
  readonly kind: 'mock' | 'live';
  fetchProfile(lang: Lang): Promise<ProfileDto>;
  fetchProjects(lang: Lang, query?: ProjectsQuery): Promise<ProjectDto[]>;
  fetchExperience(lang: Lang): Promise<ExperienceDto[]>;
  fetchSkills(lang: Lang): Promise<SkillGroupDto[]>;
  fetchCertificationGroups(lang: Lang): Promise<CertificationGroupDto[]>;
  fetchCertifications(
    lang: Lang,
    query?: CertificationsQuery,
  ): Promise<Partial<CertificationDto>[]>;
  fetchCertificationsByGroup(
    lang: Lang,
    group: string,
    query?: CertificationsQuery,
  ): Promise<Partial<CertificationDto>[]>;
  fetchPublications(
    lang: Lang,
    query?: PublicationsQuery,
  ): Promise<Partial<PublicationDto>[]>;
  fetchEducation(lang: Lang): Promise<EducationDto[]>;
  fetchCaseStudy(lang: Lang, slug: string): Promise<CaseStudyDto>;
  fetchCaseIndex(lang: Lang): Promise<CaseStudySummaryDto[]>;
  fetchHomeLive(lang: Lang): Promise<HomeLiveData>;
}

export class ApiError extends Error {
  status?: number;
  path: string;
  constructor(path: string, message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.path = path;
    this.status = status;
  }
}
