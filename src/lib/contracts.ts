// Contratos canónicos espejo de la API (api/src/modules/*/*.dto.ts).
// Single source para el mock y el cliente live: si la API cambia un DTO,
// se actualiza aquí primero (mock-first) y luego se porta a NestJS.

export type Lang = 'es' | 'en';

/**
 * NUEVO (ficha 005): edición del portafolio (conmutador Ingeniería / Datos).
 * Un item con `editions` solo aparece en esas ediciones; sin `editions`, en ambas.
 */
export type Edition = 'fullstack' | 'data';

export type SocialDto = {
  label: string;
  url: string;
  handle?: string;
  /** NUEVO (ficha 004): línea descriptiva del directorio (5.15). */
  note?: string;
};

export type AboutNoteDto = { title?: string; text: string };

/** NUEVO (ficha 004): bloque "Ahora mismo" (5.16). */
export type NowDto = {
  /** YYYY-MM de la última actualización. */
  updatedAt: string;
  items: { label: string; value: string }[];
};

/** NUEVO (ficha 004): principio de "Cómo trabajo". */
export type PrincipleDto = { title: string; text: string };

/** NUEVO (ficha 004): par etiqueta/valor (ficha técnica de "Sobre mí"). */
export type FactDto = { label: string; value: string };

export type ProfileDto = {
  name: string;
  role: string;
  tagline: string;
  bio: string;
  location: string;
  availability: string;
  email: string;
  socials: SocialDto[];
  about?: string[];
  notes?: AboutNoteDto[];
  letter?: string;
  cvUrl?: string;
  /** NUEVO (ficha 004): cita destacada (5.14) y su atribución. */
  quote?: string;
  quoteSource?: string;
  /** NUEVO (ficha 004): ficha técnica de "Sobre mí" (Base, Zona, Idiomas...). */
  facts?: FactDto[];
  /** NUEVO (ficha 004): "Cómo trabajo". */
  principles?: PrincipleDto[];
  /** NUEVO (ficha 004): zona IANA para el reloj local del directorio, p. ej. "America/Lima". */
  timezone?: string;
  /** NUEVO (ficha 004): nota de horario bajo la ubicación. */
  hoursNote?: string;
  /** NUEVO (ficha 004): bloque "Ahora mismo" (5.16). */
  now?: NowDto;
  /** NUEVO (ficha 005): textos que cambian por edición; ganan sobre los campos base. */
  editions?: Partial<Record<Edition, ProfileEditionDto>>;
};

/** NUEVO (ficha 005): titular del hero en tres partes ("… *de punta a punta* …"). */
export type HeadlineDto = { before: string; emphasis: string; after: string };

/** NUEVO (ficha 005): lo que cambia del perfil entre Ingeniería y Datos. */
export type ProfileEditionDto = Partial<
  Pick<ProfileDto, 'role' | 'bio' | 'about' | 'notes' | 'letter' | 'quote' | 'quoteSource' | 'principles' | 'now'>
> & { headline?: HeadlineDto };

export type ProjectLinksDto = { demo?: string; repo?: string };

/** NUEVO (ficha 004): fila de la tabla antes/después (5.5, 5.7). */
export type ProjectResultDto = { label: string; before: string; after: string };

export type ProjectDto = {
  slug: string;
  title: string;
  description: string;
  stack: string[];
  featured: boolean;
  year: number;
  links: ProjectLinksDto;
  metric?: string;
  /** NUEVO (ficha 004): rol en el proyecto, p. ej. "Líder técnico". */
  role?: string;
  /** NUEVO (ficha 004): problema (cursiva del destacado), enfoque y resultado (fila desplegable). */
  problem?: string;
  approach?: string;
  result?: string;
  /** NUEVO (ficha 004): tabla antes/después. */
  results?: ProjectResultDto[];
  /** NUEVO (ficha 004): leyenda de la tabla, p. ej. "medido tras tres meses en producción." */
  resultsCaption?: string;
  /** NUEVO (ficha 005): ediciones donde aparece; sin valor, en ambas. */
  editions?: Edition[];
};

export type ProjectsQuery = {
  featured?: boolean;
  stack?: string;
  limit?: number;
};

export type ExperienceDto = {
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  /** Logros medibles para la línea de tiempo (ya existe en la API). */
  wins?: string[];
  stack: string[];
  /** NUEVO (ficha 005) */
  editions?: Edition[];
};

/** Espejo de api/src/modules/skills: `daily` = punto relleno, `years` = "5a". */
export type SkillItemDto = { name: string; years: number; daily: boolean };

export type SkillGroupDto = {
  category: string;
  items: SkillItemDto[];
  /** NUEVO (ficha 005) */
  editions?: Edition[];
};

export type CertificationDto = {
  slug: string;
  title: string;
  issuer: string;
  category: string;
  tags: string[];
  issueDate: string;
  expiryDate?: string | null;
  credentialId?: string;
  credentialUrl?: string;
  skills: string[];
  featured: boolean;
  level?: string;
};

/** Espejo de api/src/modules/certifications (GET /certifications/groups). */
export type CertificationGroupDto = {
  group: string;
  count: number;
  latest?: { title: string; level?: string; year: number };
  fromYear?: number;
  toYear?: number;
};

export type CertificationsQuery = {
  search?: string;
  issuer?: string;
  skill?: string;
  category?: string;
  tag?: string;
  group?: string;
  featured?: boolean;
  expired?: boolean;
  fields?: string;
  limit?: number;
};

export type PublicationDto = {
  slug: string;
  title: string;
  authors: string[];
  venue: string;
  type: 'journal' | 'conference';
  year: number;
  publishedAt: string;
  doi: string;
  pdfUrl: string;
  url?: string;
  abstract: string;
  keywords: string[];
  featured: boolean;
  /** NUEVO (ficha 006): ficha lateral de la entrada, p. ej. "Vol. 12 · pp. 45–67". */
  pages?: string;
  /** NUEVO (ficha 006): idioma del artículo, ya traducido: "Inglés" / "English". */
  language?: string;
};

export type PublicationsQuery = {
  search?: string;
  type?: string;
  tag?: string;
  year?: number;
  featured?: boolean;
  fields?: string;
  limit?: number;
};

export type EducationDto = {
  school: string;
  degree: string;
  period: string;
  description: string;
  /** NUEVO (ficha 005) */
  editions?: Edition[];
};

export type CaseStudyDto = {
  slug: string;
  projectSlug: string;
  title: string;
  deck: string;
  quote?: string;
  nextCaseSlug?: string;
};

export const API_VERSION = '1';

// Allowlist espejo de la API para `fields=` (certifications, publications, case-studies).
// La API lanza 400 con `Unknown field(s)` si llega otro campo; el mock replica eso.
export const CERTS_FIELD_ALLOWLIST = [
  'slug',
  'title',
  'issuer',
  'category',
  'tags',
  'issueDate',
  'expiryDate',
  'credentialId',
  'credentialUrl',
  'skills',
  'featured',
  'level',
] as const;

export const PUBS_FIELD_ALLOWLIST = [
  'slug',
  'title',
  'authors',
  'venue',
  'type',
  'year',
  'publishedAt',
  'doi',
  'pdfUrl',
  'url',
  'abstract',
  'keywords',
  'featured',
  'pages',
  'language',
] as const;

export const CASE_FIELD_ALLOWLIST = [
  'slug',
  'projectSlug',
  'title',
  'deck',
  'quote',
  'nextCaseSlug',
] as const;
