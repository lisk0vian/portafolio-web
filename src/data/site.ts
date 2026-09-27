// Personal details for the portfolio.
//
// Edit the values below to make the site yours. This file holds personal
// information only (name, location, email, socials, availability).
// Projects and case studies are defined separately in content.ts.

export type LocaleText = { es: string; en: string };

export const site = {
  firstName: "Jerremi",
  lastName: "Chancan",
  email: "chancanjeremiaron@gmail.com",
  location: {
    es: "Lima, Perú · UTC-5",
    en: "Lima, Perú · UTC-5",
  } as LocaleText,
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
    github: { label: "GitHub", handle: "@usuario", href: "https://github.com/usuario" },
    linkedin: { label: "LinkedIn", handle: "@usuario", href: "https://linkedin.com/in/usuario" },
    kaggle: { label: "Kaggle", handle: "@usuario", href: "https://kaggle.com/usuario" },
    cv: { label: "CV (PDF)", handle: "cv-nombre-apellido.pdf", href: "#" },
  } as Record<string, { label: string; handle: string; href: string }>,
};

export const fullName = `${site.firstName} ${site.lastName}`;
