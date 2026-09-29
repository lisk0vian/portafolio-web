// Implementación live del puerto: wrapper fino sobre el cliente axios existente.
// No añade lógica: solo adapta firmas para que los componentes dependan del
// puerto, no del singleton. Facilita tests (mock inyectado) y cambio mock→live.
import {
  CERTS_FIELDS,
  PUBS_FIELDS,
  fetchCaseStudy,
  fetchCertificationGroups,
  fetchCertifications,
  fetchCertificationsByGroup,
  fetchEducation,
  fetchExperience,
  fetchHomeLive,
  fetchProfile,
  fetchProjects,
  fetchPublications,
  fetchSkills,
} from './api';
import type {
  CertificationsQuery,
  Lang,
  ProjectsQuery,
  PublicationsQuery,
} from './contracts';
import type { HomeLiveData, PortfolioSource } from './ports';

export class LivePortfolioSource implements PortfolioSource {
  readonly kind = 'live' as const;

  fetchProfile(lang: Lang) {
    return fetchProfile(lang);
  }
  fetchProjects(lang: Lang, query: ProjectsQuery = {}) {
    return fetchProjects(lang, query);
  }
  fetchExperience(lang: Lang) {
    return fetchExperience(lang);
  }
  fetchSkills(lang: Lang) {
    return fetchSkills(lang);
  }
  fetchCertificationGroups(lang: Lang) {
    return fetchCertificationGroups(lang);
  }
  fetchCertifications(lang: Lang, query: CertificationsQuery = {}) {
    return fetchCertifications(lang, query);
  }
  fetchCertificationsByGroup(lang: Lang, group: string, query: CertificationsQuery = {}) {
    return fetchCertificationsByGroup(lang, group, query);
  }
  fetchPublications(lang: Lang, query: PublicationsQuery = {}) {
    return fetchPublications(lang, query);
  }
  fetchEducation(lang: Lang) {
    return fetchEducation(lang);
  }
  fetchCaseStudy(lang: Lang, slug: string) {
    return fetchCaseStudy(lang, slug);
  }
  fetchHomeLive(lang: Lang): Promise<HomeLiveData> {
    return fetchHomeLive(lang);
  }
}

export { CERTS_FIELDS, PUBS_FIELDS };
