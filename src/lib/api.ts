// Cliente HTTP de la API del portafolio (NestJS + Fastify).
// Uso cliente (GitHub Pages = solo estáticos): todas las llamadas ocurren en browser.
// El build de Astro NO llama a la API: pre-renderiza con content.ts local y al montar
// revalida con axios y reemplaza el JSON embebido (stale-while-revalidate).
//
// Headers negociados por la API:
// - Idioma: `Accept-Language: es|en` + override `x-lang` (ver language.decorator.ts)
// - Versión: `x-api-version: 1` (ver api-version.const.ts)
// - Base: `${PUBLIC_API_URL}` + `/profile|projects|...` (API usa prefijo global `api`)
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { Lang } from "../scripts/store";

export const API_TIMEOUT_MS = 8000;
export const DEFAULT_LANG: Lang = "es";
export const FALLBACK_BASE_URL = "http://localhost:3000/api";

// DTOs: única fuente en contracts.ts (espejo de api/src/modules/*/*.dto.ts).
// Antes se duplicaban aquí y derivaron (p. ej. skills.items como string[]).
export { API_VERSION } from "./contracts";
export type {
  CaseStudyDto,
  CertificationDto,
  CertificationGroupDto,
  CertificationsQuery,
  EducationDto,
  ExperienceDto,
  ProfileDto,
  ProjectDto,
  ProjectsQuery,
  PublicationDto,
  PublicationsQuery,
  SkillGroupDto,
  SkillItemDto,
} from "./contracts";
import { API_VERSION } from "./contracts";
import type {
  CaseStudyDto,
  CertificationDto,
  CertificationGroupDto,
  CertificationsQuery,
  EducationDto,
  ExperienceDto,
  ProfileDto,
  ProjectDto,
  ProjectsQuery,
  PublicationDto,
  PublicationsQuery,
  SkillGroupDto,
} from "./contracts";

export class ApiError extends Error {
  status?: number;
  path: string;
  constructor(path: string, message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.path = path;
    this.status = status;
  }
}

export function getApiBaseUrl(): string {
  const raw =
    (import.meta.env.PUBLIC_API_URL as string | undefined) ??
    FALLBACK_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export function isApiConfigured(): boolean {
  return getApiBaseUrl().length > 0;
}

let client: AxiosInstance | null = null;
let activeLang: Lang = DEFAULT_LANG;

function normalizeLang(lang: unknown): Lang {
  return lang === "en" ? "en" : "es";
}

export function setApiLang(lang: Lang) {
  activeLang = normalizeLang(lang);
}

function createClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
    timeout: API_TIMEOUT_MS,
    headers: { "x-api-version": API_VERSION },
  });

  // Middleware: idioma + versión en cada request.
  instance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const lang = normalizeLang(
      (config.params as Record<string, unknown> | undefined)?.__lang ??
        (config.headers as Record<string, unknown>)?.["x-lang"] ??
        activeLang,
    );
    config.headers.set("Accept-Language", lang);
    config.headers.set("x-lang", lang);
    config.headers.set("x-api-version", API_VERSION);
    // __lang es solo interno para forzar idioma por llamada: no viaja como query.
    if (config.params && typeof config.params === "object" && "__lang" in config.params) {
      const { __lang, ...rest } = config.params as Record<string, unknown>;
      config.params = rest;
    }
    return config;
  });

  return instance;
}

export function apiClient(): AxiosInstance {
  if (!client) client = createClient();
  // Permite cambiar PUBLIC_API_URL sin recargar módulo en dev (HMR).
  client.defaults.baseURL = getApiBaseUrl();
  return client;
}

/** Forzar recreación del cliente (útil en tests o cambio de baseURL). */
export function resetApiClient() {
  client = null;
}

async function get<T>(
  path: string,
  lang: Lang,
  config?: AxiosRequestConfig,
  retry = true,
): Promise<T> {
  setApiLang(lang);
  try {
    const res = await apiClient().get<T>(path, {
      ...config,
      params: { ...(config?.params as object | undefined), __lang: lang },
    });
    return res.data;
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status : undefined;
    const networkError = axios.isAxiosError(err) && !err.response;
    // Reintento único en error de red o 5xx (acordado en plan).
    if (retry && (networkError || (status !== undefined && status >= 500))) {
      return get<T>(path, lang, config, false);
    }
    const message = axios.isAxiosError(err)
      ? (err.response?.data as { message?: string } | undefined)?.message ??
        err.message
      : "Unknown API error";
    throw new ApiError(path, message, status);
  }
}

export const fetchProfile = (lang: Lang) => get<ProfileDto>("/profile", lang);

export function fetchProjects(lang: Lang, query: ProjectsQuery = {}) {
  const params: Record<string, string | number> = {};
  if (query.featured !== undefined) params.featured = String(query.featured);
  if (query.stack) params.stack = query.stack;
  if (query.limit !== undefined) params.limit = query.limit;
  return get<ProjectDto[]>("/projects", lang, { params });
}

export const fetchExperience = (lang: Lang) =>
  get<ExperienceDto[]>("/experience", lang);

export const fetchSkills = (lang: Lang) =>
  get<SkillGroupDto[]>("/skills", lang);

export const CERTS_FIELDS =
  "slug,title,issuer,category,tags,issueDate,expiryDate,credentialId,credentialUrl,skills,featured,level";

function certParams(query: CertificationsQuery = {}): Record<string, string | number> {
  const params: Record<string, string | number> = {};
  if (query.search) params.search = query.search;
  if (query.issuer) params.issuer = query.issuer;
  if (query.skill) params.skill = query.skill;
  if (query.category) params.category = query.category;
  if (query.tag) params.tag = query.tag;
  if (query.group) params.group = query.group;
  if (query.featured !== undefined) params.featured = String(query.featured);
  if (query.expired !== undefined) params.expired = String(query.expired);
  if (query.fields) params.fields = query.fields;
  if (query.limit !== undefined) params.limit = query.limit;
  return params;
}

export function fetchCertifications(lang: Lang, query: CertificationsQuery = {}) {
  return get<Partial<CertificationDto>[]>("/certifications", lang, {
    params: certParams(query),
  });
}

export const fetchCertificationGroups = (lang: Lang) =>
  get<CertificationGroupDto[]>("/certifications/groups", lang);

export function fetchCertificationsByGroup(
  lang: Lang,
  group: string,
  query: CertificationsQuery = {},
) {
  // El backend rechaza `?group=` cuando el grupo ya va en el path.
  const { group: _omit, ...rest } = query;
  return get<Partial<CertificationDto>[]>(
    `/certifications/groups/${encodeURIComponent(group)}`,
    lang,
    { params: certParams(rest) },
  );
}

export const PUBS_FIELDS =
  "slug,title,authors,venue,type,year,publishedAt,doi,pdfUrl,url,abstract,keywords,featured";

export function fetchPublications(lang: Lang, query: PublicationsQuery = {}) {
  const params: Record<string, string | number> = {};
  if (query.search) params.search = query.search;
  if (query.type) params.type = query.type;
  if (query.tag) params.tag = query.tag;
  if (query.year !== undefined) params.year = query.year;
  if (query.featured !== undefined) params.featured = String(query.featured);
  if (query.fields) params.fields = query.fields;
  if (query.limit !== undefined) params.limit = query.limit;
  // Sin módulo /publications en la API: 404 → ApiError sin reintento,
  // el home conserva los mocks locales de content.ts.
  return get<Partial<PublicationDto>[]>("/publications", lang, { params });
}

export function fetchPublication(lang: Lang, slug: string) {
  return get<Partial<PublicationDto>>(
    `/publications/${encodeURIComponent(slug)}`,
    lang,
  );
}

export const fetchEducation = (lang: Lang) =>
  get<EducationDto[]>("/education", lang);

export function fetchCaseStudy(lang: Lang, slug: string) {
  return get<Partial<CaseStudyDto>>(
    `/case-studies/${encodeURIComponent(slug)}`,
    lang,
    { params: { fields: "slug,title,deck,quote,nextCaseSlug" } },
  );
}

export const fetchHealth = () =>
  get<{ status: string; timestamp: string }>("/health", activeLang);

// Carga tolerante a fallos para el home: cada sección puede fallar sin tumbar las demás.
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

export async function fetchHomeLive(lang: Lang): Promise<HomeLiveData> {
  const settled = await Promise.allSettled([
    fetchProfile(lang),
    fetchProjects(lang, { limit: 20 }),
    fetchExperience(lang),
    fetchSkills(lang),
    fetchCertificationGroups(lang),
    fetchCertifications(lang, { limit: 50, fields: CERTS_FIELDS }),
    fetchPublications(lang, { limit: 50, fields: PUBS_FIELDS }),
    fetchEducation(lang),
  ]);
  const [profile, projects, experience, skills, certGroups, certs, pubs, edu] = settled;
  const errors: HomeLiveData["errors"] = [];
  const pick = <T>(r: PromiseSettledResult<T>, path: string): T | undefined => {
    if (r.status === "fulfilled") return r.value;
    errors.push({
      path,
      message: r.reason instanceof Error ? r.reason.message : String(r.reason),
    });
    return undefined;
  };
  return {
    profile: pick(profile, "/profile"),
    projects: pick(projects, "/projects"),
    experience: pick(experience, "/experience"),
    skills: pick(skills, "/skills"),
    certificationGroups: pick(certGroups, "/certifications/groups"),
    certifications: pick(certs, "/certifications"),
    publications: pick(pubs, "/publications"),
    education: pick(edu, "/education"),
    errors,
  };
}
