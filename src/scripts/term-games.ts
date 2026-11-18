// Juegos de la terminal: Escalera (arcade) y Stackdle (Wordle técnico).
// Lógica sin DOM ni imports: la terminal (terminal.ts) los aloja, pinta su
// frame() debajo del historial y les pasa teclas (key) y texto (input).

export type Kind = "in" | "out" | "dim" | "acc" | "err" | "warn";
export type Seg = { text: string; kind: Kind };
export type GLine = { text: string; kind: Kind; parts?: Seg[] };
type Lang = "es" | "en";

export interface TermGame {
  /** Bloque vivo que la terminal pinta bajo el historial. */
  frame(): GLine[];
  /** Tecla en tiempo real; true = consumida (no llega al input). */
  key(key: string): boolean;
  /** Texto + Enter; true = consumido (no se ejecuta como comando). */
  input(raw: string): boolean;
  /** Controles táctiles: [etiqueta, tecla]. */
  chips(): [string, string][];
  stop(): void;
}

export type GameHost = {
  lang: Lang;
  redraw(): void;
  /** El juego termina: sus líneas pasan al historial; `share` queda para el comando share. */
  end(lines: GLine[], share?: string): void;
  emit(type: "start" | "record" | "win" | "lose"): void;
  award(id: string): void;
};

const line = (text: string, kind: Kind = "out"): GLine => ({ text, kind });
const segs = (parts: Seg[]): GLine => ({ text: parts.map((p) => p.text).join(""), kind: "out", parts });

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // sin almacenamiento: dura la sesión
  }
}

/* ======================= Escalera ======================= */

const LANES = 5;
const ROWS = 8;
const STAIRS = "▁▂▃▄▅▆▇█";
const MAX_LEVEL = 8;
const POINTS_PER_LEVEL = 15;
type Cell = "" | "bug" | "plus";

export function createEscalera(h: GameHost): TermGame {
  const es = h.lang === "es";
  const T = {
    title: "ESCALERA",
    level: es ? "nivel" : "level",
    pts: es ? "puntos" : "points",
    best: es ? "récord" : "best",
    help: es ? "←/→ moverse · espacio pausa · q salir" : "←/→ move · space pause · q quit",
    paused: es ? "‖ pausa · espacio para seguir" : "‖ paused · space to resume",
    over: (n: number, b: number, rec: boolean) =>
      es ? `fin · ${n} puntos · récord ${b}${rec ? " · ¡nuevo récord!" : ""}` : `game over · ${n} points · best ${b}${rec ? " · new best!" : ""}`,
    again: es ? "espacio: otra partida · q: salir" : "space: play again · q: quit",
    goal: es ? "esquiva × · recoge + (+5) · cada 15 puntos subes un peldaño" : "dodge × · grab + (+5) · every 15 points you climb a step",
  };
  let grid: Cell[][] = [];
  let x = 2;
  let score = 0;
  let level = 1;
  let state: "run" | "pause" | "over" = "run";
  let timer = 0;
  let best = load("mg-escalera-best", { best: 0 }).best;
  let record = false;

  const spawn = (): Cell[] => {
    const row: Cell[] = Array(LANES).fill("");
    const busy = Math.random() < 0.38 + level * 0.05;
    const bugs = busy ? (Math.random() < 0.2 + level * 0.06 ? 2 : 1) : 0; // máx. 2 de 5: siempre hay hueco
    const lanes = [...Array(LANES).keys()].sort(() => Math.random() - 0.5);
    lanes.slice(0, bugs).forEach((i) => (row[i] = "bug"));
    if (Math.random() < 0.09) row[lanes[bugs]] = "plus";
    return row;
  };
  const reset = () => {
    grid = Array.from({ length: ROWS }, () => Array(LANES).fill("") as Cell[]);
    x = 2;
    score = 0;
    level = 1;
    record = false;
    state = "run";
    h.emit("start");
    schedule();
  };
  const speed = () => Math.max(70, 170 - (level - 1) * 14);
  const schedule = () => {
    window.clearTimeout(timer);
    if (state === "run") timer = window.setTimeout(tick, speed());
  };
  const gameOver = () => {
    state = "over";
    window.clearTimeout(timer);
    record = score > best;
    if (record) {
      best = score;
      save("mg-escalera-best", { best });
    }
    h.emit(record ? "record" : "lose");
  };
  const land = () => {
    // La fila del jugador es la última: comprobar lo que hay en su carril.
    const cell = grid[ROWS - 1][x];
    if (cell === "bug") return gameOver();
    if (cell === "plus") {
      score += 5;
      grid[ROWS - 1][x] = "";
    }
  };
  const tick = () => {
    if (state !== "run") return;
    const leaving = grid[ROWS - 1];
    score += leaving.filter((c, i) => c === "bug" && i !== x).length; // bugs esquivados
    grid = [spawn(), ...grid.slice(0, ROWS - 1)];
    land();
    const next = Math.min(MAX_LEVEL, 1 + Math.floor(score / POINTS_PER_LEVEL));
    if (next !== level) {
      level = next;
      if (level >= 5) h.award("escalera");
    }
    h.redraw();
    schedule();
  };
  const onVisibility = () => {
    if (document.hidden && state === "run") {
      state = "pause";
      window.clearTimeout(timer);
      h.redraw();
    }
  };
  document.addEventListener("visibilitychange", onVisibility);

  const finish = () => {
    stop();
    h.end([line(`ESCALERA · ${T.pts} ${score} · ${T.best} ${best}`, "acc")]);
  };
  const stop = () => {
    window.clearTimeout(timer);
    document.removeEventListener("visibilitychange", onVisibility);
  };

  reset();

  return {
    frame() {
      const stair = STAIRS.slice(0, level);
      const out: GLine[] = [
        segs([
          { text: `${T.title}  `, kind: "acc" },
          { text: `${T.level} ${level} `, kind: "dim" },
          { text: stair.padEnd(MAX_LEVEL, " "), kind: "acc" },
          { text: `  ${T.pts} ${score}  ${T.best} ${best}`, kind: "dim" },
        ]),
        // ASCII: la fuente propia solo trae el subset latino; ┌─┐ caerían en otra fuente y no alinearían.
        line(`+${"-".repeat(LANES * 3)}+`, "dim"),
      ];
      grid.forEach((row, r) => {
        const parts: Seg[] = [{ text: "|", kind: "dim" }];
        row.forEach((c, i) => {
          if (r === ROWS - 1 && i === x) parts.push({ text: state === "over" ? " ✕ " : " ● ", kind: state === "over" ? "err" : "acc" });
          else if (c === "bug") parts.push({ text: " × ", kind: "err" });
          else if (c === "plus") parts.push({ text: " + ", kind: "acc" });
          else parts.push({ text: " · ", kind: "dim" });
        });
        parts.push({ text: "|", kind: "dim" });
        out.push(segs(parts));
      });
      out.push(line(`+${"-".repeat(LANES * 3)}+`, "dim"));
      if (state === "over") {
        out.push(line(T.over(score, best, record), record ? "acc" : "err"));
        out.push(line(T.again, "dim"));
      } else if (state === "pause") out.push(line(T.paused, "warn"));
      else out.push(line(score === 0 ? T.goal : T.help, "dim"));
      return out;
    },
    key(key) {
      const k = key.length === 1 ? key.toLowerCase() : key;
      if (k === "q" || k === "Escape") {
        finish();
        return true;
      }
      if (k === "Blur") {
        if (state === "run") {
          state = "pause";
          window.clearTimeout(timer);
          h.redraw();
        }
        return true;
      }
      if (k === " " || k === "Spacebar") {
        if (state === "over") reset();
        else if (state === "pause") (state = "run"), schedule();
        else (state = "pause"), window.clearTimeout(timer);
        h.redraw();
        return true;
      }
      const dir = k === "ArrowLeft" || k === "a" ? -1 : k === "ArrowRight" || k === "d" ? 1 : 0;
      if (!dir) return state === "run" || state === "pause"; // ninguna otra tecla escribe mientras juegas
      if (state === "over") return true;
      if (state === "pause") (state = "run"), schedule(); // moverse reanuda (p. ej. desde un chip)
      x = Math.max(0, Math.min(LANES - 1, x + dir));
      land();
      h.redraw();
      return true;
    },
    input() {
      return true;
    },
    chips() {
      return es
        ? [["←", "ArrowLeft"], ["→", "ArrowRight"], ["pausa", " "], ["salir", "q"]]
        : [["←", "ArrowLeft"], ["→", "ArrowRight"], ["pause", " "], ["quit", "q"]];
    },
    stop,
  };
}

/* ======================= Stackdle ======================= */

/** Respuestas: 5 letras del oficio (stack, datos, conceptos). */
export const WORDS = [
  "REACT", "REDIS", "NGINX", "MYSQL", "LINUX", "KAFKA", "SPARK", "CLOUD", "QUERY", "CACHE",
  "ASYNC", "MUTEX", "MERGE", "FETCH", "PROXY", "SHELL", "TOKEN", "ARRAY", "STACK", "QUEUE",
  "REGEX", "BUILD", "DEBUG", "INDEX", "MODEL", "NUMPY", "TORCH", "SCIPY", "SCALA", "JULIA",
  "PIXEL", "FLOAT", "TUPLE", "CLASS", "LOGIC", "PARSE", "ROUTE", "PATCH", "SHARD", "LAYER",
];

export type Mark = "hit" | "near" | "miss";

/** Puntúa un intento como Wordle: primero aciertos, luego presentes con recuento (letras repetidas). */
export function scoreGuess(guess: string, answer: string): Mark[] {
  const res: Mark[] = Array(5).fill("miss");
  const left: Record<string, number> = {};
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) res[i] = "hit";
    else left[answer[i]] = (left[answer[i]] ?? 0) + 1;
  }
  for (let i = 0; i < 5; i++) {
    if (res[i] === "hit") continue;
    if ((left[guess[i]] ?? 0) > 0) {
      res[i] = "near";
      left[guess[i]] -= 1;
    }
  }
  return res;
}

/** Día de juego (calendario local) contado desde el 1 de enero de 2026. */
export function dayNumber(d = new Date()): number {
  return Math.floor((Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) - Date.UTC(2026, 0, 1)) / 86_400_000);
}
/** Palabra del día: salto de 7 para que días seguidos no den palabras vecinas de la lista. */
export function wordOfDay(day: number): string {
  const n = WORDS.length;
  return WORDS[(((day * 7) % n) + n) % n];
}

const normalize = (raw: string) =>
  raw.normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z]/g, "");

type DailyState = { day: number; guesses: string[]; done: boolean; won: boolean; streak: number; best: number; lastWin: number };
const DAILY_KEY = "mg-stackdle";
const TRIES = 6;

export function readStackdle(): DailyState {
  return load<DailyState>(DAILY_KEY, { day: -1, guesses: [], done: false, won: false, streak: 0, best: 0, lastWin: -99 });
}

export function createStackdle(h: GameHost, opts: { practice?: boolean } = {}): TermGame | null {
  const es = h.lang === "es";
  const today = dayNumber();
  const practice = !!opts.practice;
  const answer = practice ? WORDS[Math.floor(Math.random() * WORDS.length)] : wordOfDay(today);
  const T = {
    title: practice ? (es ? "STACKDLE · práctica" : "STACKDLE · practice") : `STACKDLE #${today + 1}`,
    help: es ? "escribe una palabra de 5 letras y pulsa enter · q salir" : "type a 5-letter word and press enter · q quit",
    five: es ? "tienen que ser 5 letras." : "it has to be 5 letters.",
    win: (n: number) => (es ? `¡bien! en ${n}/${TRIES}.` : `nice! in ${n}/${TRIES}.`),
    lose: (w: string) => (es ? `era ${w}.` : `it was ${w}.`),
    streak: (s: number, b: number) => (es ? `racha ${s} · mejor ${b}` : `streak ${s} · best ${b}`),
    share: es ? "escribe 'share' para copiar el resultado · 'stackdle libre' para practicar" : "type 'share' to copy the result · 'stackdle free' to practice",
    played: es ? "ya jugaste la de hoy. vuelve mañana." : "you already played today's. come back tomorrow.",
    legend: es ? "[A] en su sitio · (A) está en otro sitio · a no está" : "[A] right spot · (A) elsewhere · a not in word",
  };

  let st = readStackdle();
  if (st.day !== today) st = { ...st, day: today, guesses: [], done: false, won: false };
  // Racha efectiva: se rompe si ayer no se ganó.
  if (st.lastWin < today - 1) st.streak = 0;
  let guesses: string[] = practice ? [] : [...st.guesses];
  let msg: GLine | null = null;

  const markKind: Record<Mark, Kind> = { hit: "acc", near: "warn", miss: "dim" };
  const cell = (ch: string, m: Mark | null): Seg =>
    m === "hit" ? { text: `[${ch}]`, kind: "acc" }
      : m === "near" ? { text: `(${ch})`, kind: "warn" }
        : m === "miss" ? { text: ` ${ch.toLowerCase()} `, kind: "dim" }
          : { text: " · ", kind: "dim" };
  const board = (): GLine[] => {
    const rows: GLine[] = [];
    for (let r = 0; r < TRIES; r++) {
      const g = guesses[r];
      const marks = g ? scoreGuess(g, answer) : null;
      const parts: Seg[] = [{ text: "  ", kind: "dim" }];
      for (let i = 0; i < 5; i++) {
        parts.push(cell(g ? g[i] : "", marks ? marks[i] : null));
        parts.push({ text: " ", kind: "dim" });
      }
      rows.push(segs(parts));
    }
    return rows;
  };
  const keyboard = (): GLine[] => {
    const state: Record<string, Mark> = {};
    const rank: Record<Mark, number> = { hit: 3, near: 2, miss: 1 };
    guesses.forEach((g) => scoreGuess(g, answer).forEach((m, i) => {
      if (!state[g[i]] || rank[m] > rank[state[g[i]]]) state[g[i]] = m;
    }));
    return ["ABCDEFGHIJKLM", "NOPQRSTUVWXYZ"].map((row) =>
      segs([{ text: "  ", kind: "dim" }, ...[...row].map((ch) => ({ text: `${state[ch] === "miss" ? "·" : ch} `, kind: state[ch] ? markKind[state[ch]] : ("out" as Kind) }))]),
    );
  };
  const shareText = () =>
    `${T.title} ${st.won || guesses.at(-1) === answer ? guesses.length : "X"}/${TRIES}\n`
    + guesses.map((g) => scoreGuess(g, answer).map((m) => (m === "hit" ? "■" : m === "near" ? "▣" : "□")).join("")).join("\n");
  const summary = (won: boolean): GLine[] => [
    line(T.title, "acc"),
    ...board(),
    line(won ? T.win(guesses.length) : T.lose(answer), won ? "acc" : "err"),
    ...(practice ? [] : [line(T.streak(st.streak, st.best), "dim")]),
    line(T.share, "dim"),
  ];

  // La diaria ya está hecha: se muestra el resultado y no queda juego activo.
  if (!practice && st.done) {
    h.end([...summary(st.won), line(T.played, "dim")], shareText());
    return null;
  }

  const finish = (won: boolean) => {
    if (!practice) {
      st.done = true;
      st.won = won;
      st.guesses = guesses;
      if (won) {
        st.streak = st.lastWin === today - 1 ? st.streak + 1 : 1;
        st.best = Math.max(st.best, st.streak);
        st.lastWin = today;
        h.award("stackdle");
      } else st.streak = 0;
      save(DAILY_KEY, st);
    }
    h.emit(won ? "win" : "lose");
    h.end(summary(won), shareText());
  };

  h.emit("start");
  return {
    frame() {
      return [
        line(T.title, "acc"),
        ...board(),
        ...keyboard(),
        msg ?? line(guesses.length ? T.help : T.legend, "dim"),
      ];
    },
    key(key) {
      if (key === "Escape") {
        h.end([line(`${T.title} · ${es ? "pausada" : "paused"}`, "dim")]);
        return true;
      }
      return false; // las letras se escriben en el input
    },
    input(raw) {
      const word = normalize(raw);
      if (["Q", "SALIR", "EXIT", "QUIT"].includes(word)) {
        h.end([line(`${T.title} · ${es ? "pausada" : "paused"}`, "dim")]);
        return true;
      }
      if (word.length !== 5) {
        msg = line(T.five, "err");
        h.redraw();
        return true;
      }
      msg = null;
      guesses = [...guesses, word];
      if (!practice) {
        st.guesses = guesses;
        save(DAILY_KEY, st);
      }
      if (word === answer) finish(true);
      else if (guesses.length >= TRIES) finish(false);
      else h.redraw();
      return true;
    },
    chips() {
      return [[es ? "salir" : "quit", "Escape"]];
    },
    stop() {},
  };
}
