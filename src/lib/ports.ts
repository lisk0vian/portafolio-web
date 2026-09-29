// Puertos (interfaces) del portafolio — base de la inyección de dependencias en Astro.
//
// Buena práctica aplicada: los componentes `.astro` nunca importan `axios` ni
// `fetch` directo. Reciben un `PortfolioSource` por props (inyectado desde la
// página vía `composition.ts`). En cliente, `api-live.ts` recibe el mismo
// puerto en vez de importar el singleton.
//
// Implementaciones:
// - `MockPortfolioSource` (src/lib/mock-source.ts): datos de la plantilla.
// - `LivePortfolioSource` (src/lib/live-source.ts): wrapper fino sobre api.ts.
import type {
  CaseStudyDto,
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
  fetchCaseStudy(lang: Lang, slug: string): Promise<Partial<CaseStudyDto>>;
  fetchHomeLive(lang: Lang): Promise<HomeLiveData>;
}
