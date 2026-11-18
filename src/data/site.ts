// Personal details for the portfolio.
//
// Edit the values below to make the site yours. This file holds personal
// information only (name, location, email, socials, availability).
// Projects and case studies are defined separately in content.ts.

export type LocaleText = { es: string; en: string };

export const site = {
  firstName: "Jerremi Aron",
  lastName: "Chancan Labajos",
  email: "chancanjeremiaron@gmail.com",
  location: {
    es: "Lima, Perú · UTC-5",
    en: "Lima, Peru · UTC-5",
  } as LocaleText,
  // Zona IANA para el reloj del directorio (C — Ubicación).
  timezone: "America/Lima",
  availability: {
    es: "Disponible · Q1 2026",
    en: "Available · Q1 2026",
  } as LocaleText,
  availabilityLong: {
    es: "Disponible para nuevos proyectos · Q1 2026",
    en: "Available for new projects · Q1 2026",
  } as LocaleText,
  cvFile: "cv-jerremi-chancan.pdf",
  socials: {
    github: { label: "GitHub", handle: "@lisk0vian", href: "https://github.com/lisk0vian", note: { es: "Código abierto, experimentos y notebooks.", en: "Open source, experiments and notebooks." } },
    linkedin: { label: "LinkedIn", handle: "@jeremi-aron", href: "https://www.linkedin.com/in/jeremi-aron", note: { es: "Trayectoria y recomendaciones.", en: "Career history and recommendations." } },
    kaggle: { label: "Orcid", handle: "@0009-0005-6789-076X", href: "https://orcid.org/0009-0005-6789-076X", note: { es: "Publicaciones y registro de investigador.", en: "Publications and researcher record." } },
    cv: { label: "CV (PDF)", handle: "cv-jerremi-chancan.pdf", href: "/cv-jerremi-chancan.pdf" },
  } as Record<string, { label: string; handle: string; href: string; note?: LocaleText }>,
};

export const fullName = `${site.firstName} ${site.lastName}`;
