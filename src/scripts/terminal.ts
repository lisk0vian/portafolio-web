// Marginalia interactive terminal — always dark, in both themes.
// Commands: help, whoami, projects, stack, contact, play, quest, score,
// perfil/profile, tema/theme, idioma/lang, clear, sudo, cv.
// Vanilla JS, no framework.
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

type QuestOpt = [string, string, string];
export type QuestQ = { q: string; opts: QuestOpt; ok: 0 | 1 | 2; why: string };
export type Quest = { title: string; intro: string; done: string; qs: QuestQ[] };

function readScore(): { played: number; correct: number } {
  try {
    const raw = localStorage.getItem("mg-score");
    if (!raw) return { played: 0, correct: 0 };
    const v = JSON.parse(raw);
    return { played: Number(v.played) || 0, correct: Number(v.correct) || 0 };
  } catch {
    return { played: 0, correct: 0 };
  }
}

function writeScore(v: { played: number; correct: number }) {
  try {
    localStorage.setItem("mg-score", JSON.stringify(v));
  } catch {
    // Storage unavailable: score stays in session only.
  }
}

function resolveQuestId(a?: string): "ledger" | "churn" | null {
  if (!a) return null;
  if (["ledger", "led", "ingenieria", "ingeniería", "engineering", "fullstack"].includes(a)) return "ledger";
  if (["churn", "datos", "data", "ml"].includes(a)) return "churn";
  return null;
}

function strings(lang: Lang) {
  const ledger: Quest = lang === "es"
    ? {
        title: "quest → ledger · plataforma de pagos",
        intro: "p95 en 840 ms y 310 tickets/semana. 3 decisiones, responde a/b/c.",
        done: "quest ledger completa.",
        qs: [
          { q: "Q1 · p95 en 840 ms, ¿qué atacas primero?", opts: ["a) índice en merchant_id", "b) caché en Redis", "c) batch nocturno más grande"], ok: 0, why: "El índice ataca la causa: conciliación por comercio sin barrido completo." },
          { q: "Q2 · 310 tickets/semana, ¿qué elimina más ruido?", opts: ["a) panel en tiempo casi real", "b) más logs", "c) más soporte"], ok: 0, why: "El panel expone el saldo derivado y mata la clase entera de tickets." },
          { q: "Q3 · los saldos se editan a mano, ¿qué modelo?", opts: ["a) doble entrada inmutable", "b) update in place", "c) hoja de cálculo"], ok: 0, why: "Asientos inmutables: los saldos se derivan, nunca se editan." },
        ],
      }
    : {
        title: "quest → ledger · payments platform",
        intro: "p95 at 840 ms and 310 tickets/week. 3 decisions, answer a/b/c.",
        done: "ledger quest complete.",
        qs: [
          { q: "Q1 · p95 at 840 ms, what first?", opts: ["a) index on merchant_id", "b) Redis cache", "c) bigger nightly batch"], ok: 0, why: "The index attacks the cause: per-merchant reconciliation without full scans." },
          { q: "Q2 · 310 tickets/week, what kills the noise?", opts: ["a) near real-time dashboard", "b) more logs", "c) more support"], ok: 0, why: "The dashboard exposes derived balances and kills the whole ticket class." },
          { q: "Q3 · balances edited by hand, which model?", opts: ["a) immutable double-entry", "b) update in place", "c) spreadsheet"], ok: 0, why: "Immutable entries: balances are derived, never edited." },
        ],
      };
  const churn: Quest = lang === "es"
    ? {
        title: "quest → churn · predicción de abandono",
        intro: "AUC 0.74 y comercial al límite. 3 decisiones, responde a/b/c.",
        done: "quest churn completa.",
        qs: [
          { q: "Q1 · AUC 0.74, ¿qué mejora generalización?", opts: ["a) validación temporal", "b) más features", "c) bajar el umbral"], ok: 0, why: "Ventanas de tiempo evitan fuga de información futura." },
          { q: "Q2 · solo llaman al top 10%, ¿qué optimizas?", opts: ["a) precisión@10%", "b) AUC global", "c) recall global"], ok: 0, why: "La capacidad manda: importa acertar en las llamadas que sí se hacen." },
          { q: "Q3 · nadie usa el modelo, ¿qué falta?", opts: ["a) explicación SHAP por cliente", "b) más AUC", "c) más datos"], ok: 0, why: "Un modelo que nadie entiende es un modelo que nadie usa." },
        ],
      }
    : {
        title: "quest → churn · churn prediction",
        intro: "AUC 0.74 and sales at capacity. 3 decisions, answer a/b/c.",
        done: "churn quest complete.",
        qs: [
          { q: "Q1 · AUC 0.74, what generalizes?", opts: ["a) temporal validation", "b) more features", "c) lower threshold"], ok: 0, why: "Time windows prevent leaking future information." },
          { q: "Q2 · only top 10% gets called, what to optimize?", opts: ["a) precision@10%", "b) global AUC", "c) global recall"], ok: 0, why: "Capacity rules: hits count where calls actually happen." },
          { q: "Q3 · nobody uses the model, what's missing?", opts: ["a) per-customer SHAP explanation", "b) more AUC", "c) more data"], ok: 0, why: "A model nobody understands is a model nobody uses." },
        ],
      };
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
          ["play", "jugar: ledger o churn"],
          ["quest <ledger|churn>", "empieza una quest"],
          ["score", "tu marcador"],
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
        playTitle: "elige quest:",
        playLedger: "  quest ledger   plataforma de pagos · p95 840 ms",
        playChurn: "  quest churn    predicción de abandono · AUC 0.74",
        playHint: "responde a/b/c. 'score' para tu marcador.",
        questUnknown: "quest desconocida. prueba 'quest ledger' o 'quest churn'.",
        answerHint: "responde a, b o c. 'quest exit' para salir.",
        okLine: "✓ correcto.",
        badLine: (o: string) => `✗ era ${o}.`,
        abort: "quest abortada.",
        noQuest: "no hay quest activa. prueba 'play'.",
        finish: (ok: number, n: number) => `★ ${ok}/${n} · Fig. ★ quest completa.`,
        scoreLine: (p: number, c: number) => `score → ${c} aciertos en ${p} quests.`,
        quests: { ledger, churn },
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
          ["play", "play: ledger or churn"],
          ["quest <ledger|churn>", "start a quest"],
          ["score", "your score"],
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
        playTitle: "pick a quest:",
        playLedger: "  quest ledger   payments platform · p95 840 ms",
        playChurn: "  quest churn    churn prediction · AUC 0.74",
        playHint: "answer a/b/c. 'score' for your score.",
        questUnknown: "unknown quest. try 'quest ledger' or 'quest churn'.",
        answerHint: "answer a, b or c. 'quest exit' to quit.",
        okLine: "✓ correct.",
        badLine: (o: string) => `✗ it was ${o}.`,
        abort: "quest aborted.",
        noQuest: "no active quest. try 'play'.",
        finish: (ok: number, n: number) => `★ ${ok}/${n} · Fig. ★ quest complete.`,
        scoreLine: (p: number, c: number) => `score → ${c} hits in ${p} quests.`,
        quests: { ledger, churn },
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
  let quest: { id: "ledger" | "churn"; i: number; ok: number } | null = null;

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

  const showMenu = (push: (text: string, kind?: Line["kind"]) => void) => {
    const s = t();
    push(s.playTitle, "acc");
    push(s.playLedger);
    push(s.playChurn);
    push(s.playHint, "dim");
  };

  const showQuestion = (push: (text: string, kind?: Line["kind"]) => void) => {
    const s = t();
    if (!quest) return;
    const q = s.quests[quest.id].qs[quest.i];
    push(q.q, "acc");
    q.opts.forEach((o) => push(`  ${o}`));
  };

  const answerQuest = (
    letter: string,
    push: (text: string, kind?: Line["kind"]) => void
  ) => {
    const s = t();
    if (!quest) {
      push(s.noQuest, "err");
      return;
    }
    const idx = ["a", "b", "c"].indexOf(letter);
    if (idx < 0) {
      push(s.answerHint, "err");
      return;
    }
    const q = s.quests[quest.id].qs[quest.i];
    if (idx === q.ok) {
      quest.ok += 1;
      push(s.okLine, "acc");
    } else {
      push(s.badLine("abc"[q.ok]), "err");
    }
    push(q.why, "dim");
    quest.i += 1;
    if (quest.i < s.quests[quest.id].qs.length) {
      showQuestion(push);
    } else {
      const total = readScore();
      const next = { played: total.played + 1, correct: total.correct + quest.ok };
      writeScore(next);
      push(s.quests[quest.id].done, "acc");
      push(s.finish(quest.ok, s.quests[quest.id].qs.length), "acc");
      quest = null;
    }
  };

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
      case "play":
      case "jugar":
      case "juego":
      case "game":
        showMenu(push);
        break;
      case "quest": {
        if (a === "exit" || a === "salir" || a === "quit") {
          if (quest) {
            quest = null;
            push(s.abort, "dim");
          } else {
            push(s.noQuest, "err");
          }
          break;
        }
        const id = resolveQuestId(a);
        if (!id) {
          if (!a) showMenu(push);
          else push(s.questUnknown, "err");
          break;
        }
        quest = { id, i: 0, ok: 0 };
        push(s.quests[id].title, "acc");
        push(s.quests[id].intro, "dim");
        showQuestion(push);
        break;
      }
      case "score":
      case "puntos":
      case "puntuacion":
      case "puntuación": {
        const v = readScore();
        push(s.scoreLine(v.played, v.correct), "acc");
        break;
      }
      case "answer":
      case "responder":
      case "responde":
        answerQuest(a ?? "", push);
        break;
      case "a":
      case "b":
      case "c":
        if (quest) answerQuest(c0, push);
        else push(s.nf(c0 || ""), "err");
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
