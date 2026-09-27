// Helpers that resolve personal details (src/data/site.ts) for one locale
// and compose the contact directory rows. Shared by server-rendered markup
// (Astro frontmatter) and client-side re-renders (bundled page scripts).
import { site, type LocaleText } from "../data/site";
import type { Lang } from "../scripts/store";

export type PersonalInfo = {
  name: string;
  email: string;
  location: string;
  availability: string;
  availabilityLong: string;
  cvFile: string;
  socials: Record<string, { label: string; handle: string; href: string }>;
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
    socials: site.socials,
  };
}

export type ContactRow = { key: string; value: string; icon: string; href: string };

/** Build the contact directory rows for a profile from its social id list. */
export function buildContactRows(opts: {
  lang: Lang;
  linkIds: string[];
  mailLabel: string;
  locationLabel: string;
  statusLabel: string;
}): ContactRow[] {
  const personal = resolvePersonal(opts.lang);
  const rows: ContactRow[] = [
    { key: opts.mailLabel, value: personal.email, icon: "↗", href: `mailto:${personal.email}` },
  ];
  for (const id of opts.linkIds) {
    if (id === "cv") {
      rows.push({
        key: site.socials.cv.label.replace(" (PDF)", ""),
        value: personal.cvFile,
        icon: "↓",
        href: "#",
      });
      continue;
    }
    const social = personal.socials[id];
    if (!social) continue;
    rows.push({ key: social.label, value: social.handle, icon: "↗", href: social.href });
  }
  rows.push({ key: opts.locationLabel, value: personal.location, icon: "", href: "#contacto" });
  rows.push({ key: opts.statusLabel, value: personal.availability, icon: "●", href: "#contacto" });
  return rows;
}
