// Marginalia interactive terminal — always dark, in both themes.
// Commands: help, whoami, projects, stack, contact, perfil/profile,
// tema/theme, idioma/lang, clear, sudo, cv. Vanilla JS, no framework.
//
// The page locale is fixed (Astro i18n serves one locale per URL), so the
// `lang` command navigates to the same page in the other locale instead of
// swapping strings. Profile/theme commands still update the whole page.

import { setProfile, setTheme, onEvent, type Lang, type Profile } from "./store";

type TermProject = { title: string; year: string; metric: string; stack: string[] };
type TermGroup = { g: string; items: string[] };

export type TermData = {
  name: string;
  role: string;
  bio: string;
  projects: TermProject[];
  stack: TermGroup[];
  email: string;
  links: string[];
  profile: Profile;
  theme: string;
  lang: Lang;
  /** Same page in the other locale (used by the `lang` command). */
  langAltUrl: string;
};

declare global {
  interface Window {
    /** Per-profile terminal payloads, set by pages with switchable content. */
    __mgTermData?: Record<Profile, TermData>;
  }
}

type Line = { text: string; kind: "in" | "out" | "dim" | "acc" | "err" };

const COLORS: Record<Line["kind"], string> = {
  in: "var(--mg-term-ink)",
  out: "var(--mg-term-ink)",
  dim: "var(--mg-term-dim)",
  acc: "var(--mg-term-accent)",
  err: "oklch(0.74 0.15 25)",
};

function strings(lang: Lang) {
  return lang === "es"
    ? {
        boot1: "marginalia-sh v1.0 · sesión iniciada",
        boot2: "Escribe 'help' para ver los comandos.",
        hint: "escribe help",
        help: [
          ["help", "muestra esta ayuda"],
          ["whoami", "quién soy"],
          ["projects", "trabajo seleccionado"],
          ["stack", "herramientas"],
          ["contact", "cómo escribirme"],
          ["perfil <ingenieria|datos>", "cambia de perfil"],
          ["tema <claro|oscuro>", "cambia el tema"],
          ["idioma <es|en>", "cambia el idioma"],
          ["clear", "limpia la pantalla"],
        ] as [string, string][],
        nf: (c: string) => `comando no encontrado: ${c} — prueba 'help'`,
        prof: (v: string) => `perfil → ${v === "data" ? "datos" : "ingeniería"}`,
        theme: (v: string) => `tema → ${v}`,
        lang: (v: string) => `idioma → ${v} …`,
        sudo: "permiso denegado. buen intento.",
        cv: "descargando cv.pdf … (placeholder)",
        pw: "perfil",
        tw: "tema",
      }
    : {
        boot1: "marginalia-sh v1.0 · session started",
        boot2: "Type 'help' to list commands.",
        hint: "type help",
        help: [
          ["help", "show this help"],
          ["whoami", "who I am"],
          ["projects", "selected work"],
          ["stack", "toolkit"],
          ["contact", "how to reach me"],
          ["profile <engineering|data>", "switch profile"],
          ["theme <light|dark>", "switch theme"],
          ["lang <es|en>", "switch language"],
          ["clear", "clear the screen"],
        ] as [string, string][],
        nf: (c: string) => `command not found: ${c} — try 'help'`,
        prof: (v: string) => `profile → ${v === "data" ? "data" : "engineering"}`,
        theme: (v: string) => `theme → ${v}`,
        lang: (v: string) => `language → ${v} …`,
        sudo: "permission denied. nice try.",
        cv: "downloading cv.pdf … (placeholder)",
        pw: "profile",
        tw: "theme",
      };
}

function readConfig(root: HTMLElement): TermData {
  const el = root.querySelector(".term-config") as HTMLScriptElement | null;
  try {
    return JSON.parse(el?.textContent ?? "{}") as TermData;
  } catch {
    return {
      name: "", role: "", bio: "", projects: [], stack: [],
      email: "", links: [], profile: "fullstack", theme: "light",
      lang: "es", langAltUrl: "/en/",
    };
  }
}

function initOne(root: HTMLElement) {
  if (root.dataset.termInit === "1") return;
  root.dataset.termInit = "1";

  const body = root.querySelector<HTMLElement>("[data-term-body]")!;
  const linesBox = root.querySelector<HTMLElement>("[data-term-lines]")!;
  const input = root.querySelector<HTMLInputElement>("[data-term-input]")!;
  const chipsBox = root.querySelector<HTMLElement>("[data-term-chips]")!;
  const hint = root.querySelector<HTMLElement>("[data-term-hint]")!;
  let data = readConfig(root);
  const lang: Lang = data.lang ?? "es";
  let lines: Line[] = [];
  let hist: string[] = [];
  let hi = -1;

  const render = () => {
    linesBox.innerHTML = "";
    for (const line of lines) {
      const div = document.createElement("div");
      div.textContent = line.text;
      div.style.whiteSpace = "pre-wrap";
      div.style.wordBreak = "break-word";
      div.style.color = COLORS[line.kind];
      linesBox.appendChild(div);
    }
    body.scrollTop = body.scrollHeight;
  };

  const t = () => strings(lang);

  const paintChips = () => {
    const s = t();
    const toggleProfile = `${s.pw} ${data.profile === "data" ? (lang === "es" ? "ingenieria" : "engineering") : lang === "es" ? "datos" : "data"}`;
    const toggleTheme = `${s.tw} ${lang === "es" ? (data.theme === "dark" ? "claro" : "oscuro") : data.theme === "dark" ? "light" : "dark"}`;
    chipsBox.innerHTML = "";
    for (const cmd of ["help", "whoami", "projects", "stack", toggleProfile, toggleTheme]) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = cmd;
      button.style.fontFamily = "inherit";
      button.style.fontSize = "11.5px";
      button.style.color = "var(--mg-term-ink)";
      button.style.background = "oklch(1 0 0 / 0.06)";
      button.style.border = "1px solid oklch(1 0 0 / 0.12)";
      button.style.borderRadius = "999px";
      button.style.padding = "4px 10px";
      button.style.cursor = "pointer";
      button.addEventListener("mouseenter", () => {
        button.style.borderColor = "var(--mg-term-accent)";
        button.style.color = "var(--mg-term-accent)";
      });
      button.addEventListener("mouseleave", () => {
        button.style.borderColor = "oklch(1 0 0 / 0.12)";
        button.style.color = "var(--mg-term-ink)";
      });
      button.addEventListener("click", (e) => {
        e.stopPropagation();
        run(cmd);
        input.focus({ preventScroll: true });
      });
      chipsBox.appendChild(button);
    }
  };

  const boot = () => {
    const s = t();
    lines = [
      { text: s.boot1, kind: "dim" },
      { text: s.boot2, kind: "out" },
    ];
    hint.textContent = s.hint;
    paintChips();
    render();
  };

  function run(raw: string) {
    const s = t();
    const cmd = raw.trim();
    const [c0, ...args] = cmd.toLowerCase().split(/\s+/);
    const a = args[0];
    const out: Line[] = [{ text: "❯ " + cmd, kind: "in" }];
    const push = (text: string, kind: Line["kind"] = "out") => out.push({ text, kind });

    switch (c0) {
      case "":
        break;
      case "help":
      case "ayuda":
        s.help.forEach(([c, x]) => push(`  ${c.padEnd(26)}${x}`));
        break;
      case "about":
      case "sobre":
        push(data.bio || "");
        break;
      case "whoami":
        push(`${data.name} — ${data.role}`, "acc");
        push(data.bio || "");
        break;
      case "projects":
      case "proyectos":
      case "ls":
        data.projects.forEach((p, i) => {
          push(`  0${i + 1}  ${p.title.padEnd(28)} ${p.year}   ${p.metric}`);
          push(`      ${p.stack.join(" · ")}`, "dim");
        });
        break;
      case "stack":
        data.stack.forEach((g) => push(`  ${g.g.padEnd(12)}${g.items.join(" · ")}`));
        break;
      case "contact":
      case "contacto":
        push(`  ${data.email}`, "acc");
        data.links.forEach((l) => push(`  ${l}`));
        break;
      case "perfil":
      case "profile": {
        const v: Profile = a ? (a.startsWith("d") || a === "ml" ? "data" : "fullstack") : data.profile === "data" ? "fullstack" : "data";
        data = { ...data, profile: v };
        setProfile(v);
        push(s.prof(v), "acc");
        break;
      }
      case "tema":
      case "theme": {
        const v = a ? (["oscuro", "dark"].includes(a) ? "dark" : "light") : data.theme === "dark" ? "light" : "dark";
        data = { ...data, theme: v };
        setTheme(v as "light" | "dark");
        push(s.theme(v), "acc");
        break;
      }
      case "idioma":
      case "lang": {
        // The locale lives in the URL: navigate to the same page in English.
        const target: Lang = a ? (a.startsWith("en") ? "en" : "es") : lang === "es" ? "en" : "es";
        push(s.lang(target), "acc");
        if (target !== lang) {
          window.setTimeout(() => {
            window.location.href = data.langAltUrl;
          }, 600);
        }
        break;
      }
      case "clear":
      case "limpiar":
        input.value = "";
        lines = [];
        render();
        return;
      case "sudo":
        push(s.sudo, "err");
        break;
      case "cv":
        push(s.cv, "dim");
        break;
      default:
        push(s.nf(c0 || ""), "err");
    }

    input.value = "";
    lines = [...lines, ...out];
    if (cmd) hist = [cmd, ...hist];
    hi = -1;
    render();
  }

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") run(input.value);
    else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(-1, Math.min(hist.length - 1, hi + (e.key === "ArrowUp" ? 1 : -1)));
      input.value = n < 0 ? "" : hist[n];
      hi = n;
    }
  });

  root.addEventListener("click", () => input.focus({ preventScroll: true }));

  // Keep the terminal payload in sync when the page profile changes elsewhere.
  onEvent<Profile>("mg:profile", (v) => {
    const next = window.__mgTermData?.[v];
    data = { ...(next ?? data), profile: v, theme: data.theme, lang, langAltUrl: data.langAltUrl };
    paintChips();
  });
  onEvent("mg:theme", (v: string) => {
    data = { ...data, theme: v };
    paintChips();
  });

  boot();
}

export function initTerminals(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>("[data-terminal-root]").forEach(initOne);
}
