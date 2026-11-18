// Global site state: profile and theme. Vanilla JS, no framework.
// The language lives in the URL (Astro i18n: "/" and "/en/"), so it is not
// stored here. Profile and theme persist across pages via localStorage.

export type Lang = "es" | "en";
export type Profile = "fullstack" | "data";
export type Theme = "light" | "dark";

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Storage unavailable: continue without persisting.
  }
}

export function getProfile(): Profile {
  return read("mg-profile") === "data" ? "data" : "fullstack";
}

export function getTheme(): Theme {
  const saved = read("mg-theme");
  if (saved === "light" || saved === "dark") return saved;
  try {
    const docTheme = document?.documentElement?.dataset?.theme;
    if (docTheme === "light" || docTheme === "dark") return docTheme;
  } catch {
    // document unavailable (e.g. SSR): fall through to light.
  }
  return "light";
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
}

function applyProfile(profile: Profile) {
  document.documentElement.dataset.profile = profile;
}

export function initProfile() {
  applyProfile(getProfile());
}

export function setProfile(profile: Profile) {
  write("mg-profile", profile);
  applyProfile(profile);
  window.dispatchEvent(new CustomEvent<Profile>("mg:profile", { detail: profile }));
}

export function setTheme(theme: Theme) {
  write("mg-theme", theme);
  applyTheme(theme);
  window.dispatchEvent(new CustomEvent<Theme>("mg:theme", { detail: theme }));
}

export function onEvent<T>(name: "mg:profile" | "mg:theme", fn: (value: T) => void) {
  const handler = (e: Event) => fn((e as CustomEvent<T>).detail);
  window.addEventListener(name, handler);
}
