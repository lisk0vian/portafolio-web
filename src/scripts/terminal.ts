// Interactive terminal — dark by default; the case archive ([data-archive])
// re-themes it with the portfolio palette.
// Commands: help, whoami, projects, stack, contact, play, escalera, stackdle,
// score, share, perfil/profile, tema/theme, idioma/lang, clear, sudo, cv.
// Los juegos (term-games.ts) se alojan aquí: su frame() se pinta bajo el historial.
// Vanilla JS, no framework.
//
// The page locale is fixed (Astro i18n serves one locale per URL), so the
// `lang` command navigates to the same page in the other locale instead of
// swapping strings. Profile/theme commands still update the whole page.

import { getTheme, setProfile, setTheme, onEvent, type Lang, type Profile } from "./store";
import { switchLang } from "./lang-switch";
import { createEscalera, createStackdle, readStackdle, type GLine, type GameHost, type TermGame } from "./term-games";

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

type Line = GLine;

const COLORS: Record<Line["kind"], string> = {
  in: "var(--mg-term-ink)",
  out: "var(--mg-term-ink)",
  dim: "var(--mg-term-dim)",
  acc: "var(--mg-term-accent)",
  err: "oklch(0.74 0.15 25)",
  warn: "oklch(0.83 0.13 80)",
};

// Trofeos: comandos ocultos o de exploración que el visitante ya descubrió.
export const TROPHIES = ["whoami", "stack", "profile", "theme", "lang", "play", "sudo", "mascot", "escalera", "stackdle"] as const;
const TROPHY_ALIAS: Record<string, (typeof TROPHIES)[number]> = {
  whoami: "whoami", stack: "stack", perfil: "profile", profile: "profile", tema: "theme", theme: "theme",
  idioma: "lang", lang: "lang", play: "play", jugar: "play", juego: "play", game: "play", sudo: "sudo",
};

export function readTrophies(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem("mg-trophies") || "[]");
    return Array.isArray(v) ? v.filter((x) => (TROPHIES as readonly string[]).includes(x)) : [];
  } catch {
    return [];
  }
}

/** Trofeo por escribir un comando (alias → id). */
export function award(cmd: string) {
  const id = TROPHY_ALIAS[cmd];
  if (id) grant(id);
}

/** Trofeo ganado (juegos, mascota): solo por id, nunca por escribir su nombre. */
export function grant(id: (typeof TROPHIES)[number]) {
  const got = readTrophies();
  if (got.includes(id)) return;
  got.push(id);
  try {
    localStorage.setItem("mg-trophies", JSON.stringify(got));
  } catch {
    // Storage unavailable: the trophy lasts until reload.
  }
  window.dispatchEvent(new CustomEvent("mg:trophy", { detail: got.length }));
}

/** Pinta "n/total" en cada [data-trophies] y lo mantiene al día. */
export function initTrophies() {
  const paint = (n: number) =>
    document.querySelectorAll<HTMLElement>("[data-trophies]").forEach((el) => (el.textContent = `${n}/${TROPHIES.length}`));
  paint(readTrophies().length);
  window.addEventListener("mg:trophy", (e) => paint((e as CustomEvent<number>).detail));
}

function strings(lang: Lang) {
  return lang === "es"
    ? {
        boot1: "jerremi-sh v2.0 · sesión iniciada",
        boot2: "Escribe 'help' para ver los comandos.",
        hint: "escribe help",
        help: [
          ["help", "muestra esta ayuda"],
          ["whoami", "quién soy"],
          ["projects", "trabajo seleccionado"],
          ["stack", "herramientas"],
          ["contact", "cómo escribirme"],
          ["play", "juegos: escalera o stackdle"],
          ["escalera", "arcade: esquiva bugs, sube peldaños"],
          ["stackdle [libre]", "adivina la palabra técnica del día"],
          ["score", "tus récords"],
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
        playTitle: "elige juego:",
        playStairs: "  escalera        arcade · ←/→ para esquivar bugs, + suma 5",
        playWordle: "  stackdle        palabra técnica del día · 6 intentos",
        playHint: "'stackdle libre' para practicar · 'score' para tus récords.",
        scoreLine: (b: number, s: number, m: number) => `escalera → récord ${b} · stackdle → racha ${s} (mejor ${m})`,
        shareOk: "resultado copiado.",
        shareNone: "aún no hay resultado. juega 'stackdle'.",
      }
    : {
        boot1: "jerremi-sh v2.0 · session started",
        boot2: "Type 'help' to list commands.",
        hint: "type help",
        help: [
          ["help", "show this help"],
          ["whoami", "who I am"],
          ["projects", "selected work"],
          ["stack", "toolkit"],
          ["contact", "how to reach me"],
          ["play", "games: stairs or stackdle"],
          ["stairs", "arcade: dodge bugs, climb steps"],
          ["stackdle [free]", "guess the daily tech word"],
          ["score", "your records"],
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
        playTitle: "pick a game:",
        playStairs: "  stairs          arcade · ←/→ to dodge bugs, + adds 5",
        playWordle: "  stackdle        daily tech word · 6 tries",
        playHint: "'stackdle free' to practice · 'score' for your records.",
        scoreLine: (b: number, s: number, m: number) => `stairs → best ${b} · stackdle → streak ${s} (best ${m})`,
        shareOk: "result copied.",
        shareNone: "no result yet. play 'stackdle'.",
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
      lang: "es", langAltUrl: `${import.meta.env.BASE_URL.replace(/\/?$/, "/")}en/`,
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
  let game: TermGame | null = null;
  let lastShare = "";

  const paintLine = (line: Line) => {
    const div = document.createElement("div");
    div.style.whiteSpace = "pre-wrap";
    div.style.wordBreak = "break-word";
    div.style.color = COLORS[line.kind];
    if (line.parts) {
      for (const part of line.parts) {
        const span = document.createElement("span");
        span.textContent = part.text;
        span.style.color = COLORS[part.kind];
        div.appendChild(span);
      }
    } else div.textContent = line.text;
    linesBox.appendChild(div);
  };
  const render = () => {
    linesBox.innerHTML = "";
    lines.forEach(paintLine);
    game?.frame().forEach(paintLine);
    body.scrollTop = body.scrollHeight;
  };

  const t = () => strings(lang);

  const showMenu = (push: (text: string, kind?: Line["kind"]) => void) => {
    const s = t();
    push(s.playTitle, "acc");
    push(s.playStairs);
    push(s.playWordle);
    push(s.playHint, "dim");
  };

  // Anfitrión: el juego repinta, termina (sus líneas pasan al historial) y avisa a la página.
  const host: GameHost = {
    lang,
    redraw: () => render(),
    end: (out, share) => {
      game?.stop();
      game = null;
      if (share) lastShare = share;
      lines = [...lines, ...out];
      paintChips();
      render();
    },
    emit: (type) => window.dispatchEvent(new CustomEvent("mg:game", { detail: { type } })),
    award: (id) => grant(id as (typeof TROPHIES)[number]),
  };
  const startGame = (make: () => TermGame | null) => {
    game?.stop();
    game = make();
    paintChips();
  };

  const paintChips = () => {
    const s = t();
    const toggleProfile = `${s.pw} ${data.profile === "data" ? (lang === "es" ? "ingenieria" : "engineering") : lang === "es" ? "datos" : "data"}`;
    const toggleTheme = `${s.tw} ${lang === "es" ? (data.theme === "dark" ? "claro" : "oscuro") : data.theme === "dark" ? "light" : "dark"}`;
    chipsBox.innerHTML = "";
    // Con un juego activo, los chips son sus controles (juego táctil sin teclado).
    const items: [string, () => void][] = game
      ? game.chips().map(([label, key]) => [label, () => game?.key(key)])
      : ["help", "whoami", "projects", "stack", toggleProfile, toggleTheme].map((cmd) => [cmd, () => run(cmd)]);
    for (const [label, act] of items) {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.style.fontFamily = "inherit";
      button.style.fontSize = "11.5px";
      button.style.minHeight = "28px";
      button.style.color = "var(--mg-term-ink)";
      button.style.background = "oklch(1 0 0 / 0.06)";
      button.style.border = "1px solid oklch(1 0 0 / 0.12)";
      button.style.borderRadius = "0";
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
        act();
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
    if (game) {
      input.value = "";
      if (game.input(cmd)) return render();
    }
    const [c0, ...args] = cmd.toLowerCase().split(/\s+/);
    const a = args[0];
    const out: Line[] = [{ text: "❯ " + cmd, kind: "in" }];
    const push = (text: string, kind: Line["kind"] = "out") => out.push({ text, kind });
    award(c0);

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
            switchLang(data.langAltUrl);
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
      case "play":
      case "jugar":
      case "juego":
      case "game":
      case "juegos":
      case "games":
        showMenu(push);
        break;
      case "escalera":
      case "stairs":
        lines = [...lines, ...out.splice(0)]; // el eco va antes del juego
        startGame(() => createEscalera(host));
        break;
      case "stackdle":
      case "wordle":
        lines = [...lines, ...out.splice(0)];
        startGame(() => createStackdle(host, { practice: ["libre", "free", "practica", "práctica", "practice"].includes(a ?? "") }));
        break;
      case "score":
      case "puntos":
      case "puntuacion":
      case "puntuación": {
        let best = 0;
        try {
          best = Number(JSON.parse(localStorage.getItem("mg-escalera-best") || "{}").best) || 0;
        } catch {
          // sin almacenamiento
        }
        const w = readStackdle();
        push(s.scoreLine(best, w.streak, w.best), "acc");
        break;
      }
      case "share":
      case "compartir":
        if (!lastShare) push(s.shareNone, "err");
        else {
          navigator.clipboard?.writeText(lastShare).catch(() => {});
          lastShare.split("\n").forEach((l) => push(`  ${l}`));
          push(s.shareOk, "acc");
        }
        break;
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
    if (game && e.key !== "Enter" && game.key(e.key)) {
      e.preventDefault();
      return;
    }
    if (e.key === "Enter") run(input.value);
    else if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const n = Math.max(-1, Math.min(hist.length - 1, hi + (e.key === "ArrowUp" ? 1 : -1)));
      input.value = n < 0 ? "" : hist[n];
      hi = n;
    }
  });

  root.addEventListener("click", () => input.focus({ preventScroll: true }));
  // Perder el foco pausa el arcade (las teclas ya no llegarían).
  input.addEventListener("blur", () => game?.key("Blur"));

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

  // El tema guardado se aplica antes de pintar, sin evento: se lee aquí para que
  // "tema" sin argumento y el chip de tema alternen desde el estado real.
  data = { ...data, theme: getTheme() };
  boot();
}

export function initTerminals(scope: ParentNode = document) {
  scope.querySelectorAll<HTMLElement>("[data-terminal-root]").forEach(initOne);
}
