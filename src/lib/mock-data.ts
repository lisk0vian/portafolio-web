// Mock bilingüe con la forma exacta de la API.
// Reglas de paridad espejo de la API (locales.parity.spec.ts):
// - slugs idénticos en es/en, solo los textos se traducen.
// - mismos counts por locale.
//
// Proyectos, perfil, experiencia, habilidades y formación se derivan de las
// dos ediciones de `content.ts` (Ingeniería / Datos) y se etiquetan con
// `editions`, igual que llegarán de la API (ficha 005). Así el mock ejercita
// el conmutador de edición sin duplicar los textos de la plantilla.
import { profiles, pick, ui, type Profile } from '../data/content';
import { fullName, site } from '../data/site';
import type {
  CertificationDto,
  EducationDto,
  Edition,
  ExperienceDto,
  Lang,
  ProfileDto,
  ProfileEditionDto,
  ProjectDto,
  PublicationDto,
  SkillGroupDto,
} from './contracts';

const EDITIONS: Edition[] = ['fullstack', 'data'];
const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const en = (x: unknown) => (x && typeof x === 'object' && 'en' in (x as object) ? (x as { en: string }).en : String(x));

function projectsFor(lang: Lang): ProjectDto[] {
  return EDITIONS.flatMap((ed) =>
    (profiles[ed as Profile].projects as any[]).map((raw, i) => {
      const r = pick(raw, lang);
      return {
        slug: slugify(en(raw.title)),
        title: r.title,
        description: r.sum,
        stack: r.stack,
        featured: i === 0,
        year: Number(r.year),
        links: {},
        metric: r.metric,
        role: r.role,
        problem: r.problem,
        approach: r.approach,
        result: r.result,
        ...(r.figures ? { results: r.figures.map((f: any) => ({ label: f.k, before: f.a, after: f.b })) } : {}),
        ...(r.cap ? { resultsCaption: r.cap } : {}),
        editions: [ed],
      };
    }),
  );
}

function experienceFor(lang: Lang): ExperienceDto[] {
  return EDITIONS.flatMap((ed) =>
    (pick(profiles[ed as Profile].exp, lang) as any[]).map((e) => {
      const [from, to] = String(e.y).match(/\d{4}/g) ?? [];
      const [company, location = ''] = String(e.c).split(' · ');
      return {
        company,
        role: e.r,
        location,
        startDate: `${from}-01`,
        endDate: e.current || !to ? null : `${to}-01`,
        current: !!e.current,
        description: e.d,
        wins: e.wins ?? [],
        stack: e.stack ?? [],
        editions: [ed],
      };
    }),
  );
}

function skillsFor(lang: Lang): SkillGroupDto[] {
  return EDITIONS.flatMap((ed) =>
    (pick(profiles[ed as Profile].stack, lang) as any[]).map((g) => ({ category: g.g, items: g.meta, editions: [ed] })),
  );
}

function educationFor(lang: Lang): EducationDto[] {
  return EDITIONS.flatMap((ed) =>
    (pick(profiles[ed as Profile].edu, lang) as any[]).map((e) => ({ school: e.s, degree: e.d, period: e.p, description: e.desc, editions: [ed] })),
  );
}

function editionFor(ed: Edition, lang: Lang): ProfileEditionDto {
  const r = pick(profiles[ed as Profile], lang);
  return {
    role: r.role,
    headline: { before: r.h1a, emphasis: r.h1em, after: r.h1b },
    bio: r.intro,
    about: r.about.map((a: any) => a.t),
    notes: r.notes.map((n: any) => ({ text: n.t })),
    letter: r.letter,
    quote: r.quote,
    quoteSource: r.quoteBy,
    principles: r.principles.map((x: any) => ({ title: x.t, text: x.d })),
    now: { updatedAt: r.nowD, items: r.now.map((x: any) => ({ label: x.k, value: x.v })) },
  };
}

function profileFor(lang: Lang): ProfileDto {
  const base = editionFor('fullstack', lang);
  const u = pick(ui, lang);
  return {
    name: fullName,
    role: base.role!,
    tagline: `${base.headline!.before} ${base.headline!.emphasis}`,
    bio: base.bio!,
    location: site.location[lang],
    availability: site.availability[lang],
    email: site.email,
    socials: Object.values(site.socials)
      .filter((x) => x.label !== 'CV (PDF)')
      .map((x) => ({ label: x.label, url: x.href, handle: x.handle, ...(x.note ? { note: x.note[lang] } : {}) })),
    cvUrl: `/${site.cvFile}`,
    facts: u.facts.map((f: any) => ({ label: f.k, value: f.v })),
    timezone: site.timezone,
    hoursNote: u.hoursNote,
    editions: { fullstack: base, data: editionFor('data', lang) },
  };
}

// Certificaciones: `tags` = grupos (aws, cloud, devops, data), como en la API.
// Cubre todos los estados de la tarjeta: vigente, vence este año, vencida y sin vencimiento.
type CertSeed = Omit<CertificationDto, 'category'> & { category: { es: string; en: string } };
const certSeeds: CertSeed[] = [
  {
    slug: 'aws-solutions-architect-professional',
    title: 'AWS Certified Solutions Architect – Professional',
    issuer: 'Amazon Web Services',
    category: { es: 'Nube', en: 'Cloud' },
    tags: ['aws', 'cloud'],
    issueDate: '2025-02',
    expiryDate: '2028-02',
    credentialId: 'AWS-SAP-7731',
    credentialUrl: 'https://aws.amazon.com/verification',
    skills: ['AWS', 'Terraform', 'Arquitectura'],
    featured: true,
    level: 'Professional',
  },
  {
    slug: 'aws-developer-associate',
    title: 'AWS Certified Developer – Associate',
    issuer: 'Amazon Web Services',
    category: { es: 'Nube', en: 'Cloud' },
    tags: ['aws', 'cloud'],
    issueDate: '2024-06',
    expiryDate: '2027-06',
    credentialId: 'AWS-DEV-001',
    credentialUrl: 'https://aws.amazon.com/verification',
    skills: ['TypeScript', 'Node.js', 'AWS'],
    featured: false,
    level: 'Associate',
  },
  {
    slug: 'aws-solutions-architect-associate',
    title: 'AWS Certified Solutions Architect – Associate',
    issuer: 'Amazon Web Services',
    category: { es: 'Nube', en: 'Cloud' },
    tags: ['aws'],
    issueDate: '2023-03',
    expiryDate: '2026-03',
    credentialId: 'AWS-ARCH-002',
    credentialUrl: 'https://aws.amazon.com/verification',
    skills: ['Docker', 'AWS'],
    featured: false,
    level: 'Associate',
  },
  {
    slug: 'google-cloud-digital-leader',
    title: 'Google Cloud Digital Leader',
    issuer: 'Google Cloud',
    category: { es: 'Nube', en: 'Cloud' },
    tags: ['cloud'],
    issueDate: '2022-09',
    expiryDate: '2025-09',
    credentialId: 'GCP-CDL-4410',
    credentialUrl: 'https://www.credential.net',
    skills: ['GCP'],
    featured: false,
  },
  {
    slug: 'azure-fundamentals',
    title: 'Microsoft Certified: Azure Fundamentals',
    issuer: 'Microsoft',
    category: { es: 'Nube', en: 'Cloud' },
    tags: ['cloud'],
    issueDate: '2022-04',
    expiryDate: null,
    credentialId: 'AZ-900-2291',
    credentialUrl: 'https://learn.microsoft.com/credentials',
    skills: ['Azure'],
    featured: false,
    level: 'Fundamentals',
  },
  {
    slug: 'cka',
    title: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'The Linux Foundation',
    category: { es: 'DevOps', en: 'DevOps' },
    tags: ['devops'],
    issueDate: '2024-11',
    expiryDate: '2026-11',
    credentialId: 'LF-CKA-8820',
    credentialUrl: 'https://training.linuxfoundation.org/certification/verify',
    skills: ['Kubernetes', 'Docker'],
    featured: true,
  },
  {
    slug: 'terraform-associate',
    title: 'HashiCorp Certified: Terraform Associate',
    issuer: 'HashiCorp',
    category: { es: 'DevOps', en: 'DevOps' },
    tags: ['devops', 'cloud'],
    issueDate: '2023-08',
    expiryDate: '2025-08',
    credentialId: 'HC-TF-1187',
    credentialUrl: 'https://www.credly.com',
    skills: ['Terraform', 'CI / CD'],
    featured: false,
    level: 'Associate',
  },
  {
    slug: 'github-actions',
    title: 'GitHub Actions',
    issuer: 'GitHub',
    category: { es: 'DevOps', en: 'DevOps' },
    tags: ['devops'],
    issueDate: '2025-05',
    expiryDate: '2028-05',
    credentialId: 'GH-ACT-3052',
    credentialUrl: 'https://www.credly.com',
    skills: ['CI / CD'],
    featured: false,
  },
  {
    slug: 'tensorflow-developer',
    title: 'TensorFlow Developer Certificate',
    issuer: 'Google',
    category: { es: 'Datos', en: 'Data' },
    tags: ['data'],
    issueDate: '2024-02',
    expiryDate: '2027-02',
    credentialId: 'TF-DEV-5519',
    credentialUrl: 'https://www.credential.net',
    skills: ['Python', 'TensorFlow'],
    featured: false,
  },
  {
    slug: 'dbt-analytics-engineering',
    title: 'dbt Analytics Engineering',
    issuer: 'dbt Labs',
    category: { es: 'Datos', en: 'Data' },
    tags: ['data'],
    issueDate: '2023-10',
    expiryDate: '2025-10',
    credentialId: 'DBT-AE-0934',
    credentialUrl: 'https://www.credly.com',
    skills: ['dbt', 'SQL'],
    featured: false,
  },
];

const certsFor = (lang: Lang): CertificationDto[] =>
  certSeeds.map((c) => ({ ...c, category: c.category[lang] }));
const certificationsEs = certsFor('es');
const certificationsEn = certsFor('en');

const publicationsEs: PublicationDto[] = [
  {
    slug: 'immutable-ledgers',
    title: 'Libros contables inmutables, explicados para humanos',
    authors: [fullName],
    venue: 'Revista de Ingeniería de Software',
    type: 'journal',
    year: 2026,
    publishedAt: '2026-03',
    doi: 'https://doi.org/10.0000/ledger.2026',
    pdfUrl: '#',
    abstract: 'Doble entrada inmutable para conciliación en tiempo casi real.',
    keywords: ['ledger', 'postgresql'],
    featured: true,
    pages: 'Vol. 12 · pp. 45–67',
    language: 'Inglés',
  },
  {
    slug: 'crdts-sin-miedo',
    title: 'CRDTs sin miedo: colaboración en tiempo real',
    authors: [fullName],
    venue: 'Conf. JS',
    type: 'conference',
    year: 2025,
    publishedAt: '2025-10',
    doi: 'https://doi.org/10.0000/crdt.2025',
    pdfUrl: '#',
    abstract: 'Presencia y resolución de conflictos con CRDTs en producción.',
    keywords: ['crdt', 'websockets'],
    featured: false,
    pages: 'Actas · pp. 101–110',
    language: 'Inglés',
  },
];

const publicationsEn: PublicationDto[] = [
  {
    slug: 'immutable-ledgers',
    title: 'Immutable ledgers, explained for humans',
    authors: [fullName],
    venue: 'Journal of Software Engineering',
    type: 'journal',
    year: 2026,
    publishedAt: '2026-03',
    doi: 'https://doi.org/10.0000/ledger.2026',
    pdfUrl: '#',
    abstract: 'Immutable double-entry for near real-time reconciliation.',
    keywords: ['ledger', 'postgresql'],
    featured: true,
    pages: 'Vol. 12 · pp. 45–67',
    language: 'English',
  },
  {
    slug: 'crdts-sin-miedo',
    title: 'CRDTs without fear: real-time collaboration',
    authors: [fullName],
    venue: 'JS Conf',
    type: 'conference',
    year: 2025,
    publishedAt: '2025-10',
    doi: 'https://doi.org/10.0000/crdt.2025',
    pdfUrl: '#',
    abstract: 'Presence and conflict resolution with CRDTs in production.',
    keywords: ['crdt', 'websockets'],
    featured: false,
    pages: 'Proceedings · pp. 101–110',
    language: 'English',
  },
];

export const mockData: Record<
  Lang,
  {
    profile: ProfileDto;
    projects: ProjectDto[];
    experience: ExperienceDto[];
    skills: SkillGroupDto[];
    certifications: CertificationDto[];
    publications: PublicationDto[];
    education: EducationDto[];
  }
> = {
  es: {
    profile: profileFor('es'),
    projects: projectsFor('es'),
    experience: experienceFor('es'),
    skills: skillsFor('es'),
    certifications: certificationsEs,
    publications: publicationsEs,
    education: educationFor('es'),
  },
  en: {
    profile: profileFor('en'),
    projects: projectsFor('en'),
    experience: experienceFor('en'),
    skills: skillsFor('en'),
    certifications: certificationsEn,
    publications: publicationsEn,
    education: educationFor('en'),
  },
};
