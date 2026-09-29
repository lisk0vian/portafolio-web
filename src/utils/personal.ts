// Helpers that resolve personal details (src/data/site.ts) for one locale.
// Shared by server-rendered markup (Astro frontmatter) and client re-renders.
import { site, type LocaleText } from "../data/site";
import type { Lang } from "../scripts/store";

export type PersonalInfo = {
  name: string;
  email: string;
  location: string;
  availability: string;
  availabilityLong: string;
  cvFile: string;
  cvUrl: string;
  timezone: string;
  socials: Record<string, { label: string; handle: string; href: string; note?: string }>;
};

export function resolvePersonal(lang: Lang): PersonalInfo {
  const text = (t: LocaleText): string => t[lang];
  return {
    name: `${site.firstName} ${site.lastName}`,
    email: site.email,
    location: text(site.location),
    availability: text(site.availability),
    availabilityLong: text(site.availabilityLong),
    cvFile: site.cvFile,
    // Buena práctica: nunca "#" en prod; el PDF vive en `public/`.
    // Si falta el archivo, el link 404ea en vez de parecer roto en silencio.
    cvUrl: `/${site.cvFile}`,
    timezone: site.timezone,
    socials: Object.fromEntries(
      Object.entries(site.socials).map(([id, x]) => [id, { label: x.label, handle: x.handle, href: x.href, ...(x.note ? { note: text(x.note) } : {}) }]),
    ),
  };
}
