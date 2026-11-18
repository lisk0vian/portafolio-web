// Mascota (open-mascot): el círculo del símbolo de marca, con vida.
// Un solo elemento fijo ([data-mascot]) que se posa sobre el hueco del hero
// ([data-mascot-slot]) y, al bajar, viaja a la esquina inferior derecha y se queda
// ahí todo el recorrido. Habla con un globo, mira al cursor, cambia de ánimo por
// sección y de forma por edición, responde a las acciones del hero y, posada en
// la esquina, abre un menú (arriba, siguiente sección, consola, tema, minimizar).
import { createDefinition } from "open-mascot";
import { createMascot } from "open-mascot/web";
import { getProfile, getTheme, onEvent } from "./store";
import { grant } from "./terminal";

const SECTIONS = ["consola", "trabajo", "sobre-mi", "herramientas", "investigacion", "trayectoria", "contacto"];
/** Ánimo por sección (claves de animación del paquete). */
const MOOD: Record<string, string> = {
  hero: "idle",
  consola: "listening",
  trabajo: "thinking",
  "sobre-mi": "happy",
  herramientas: "stand-tall",
  investigacion: "curious",
  trayectoria: "listening",
  contacto: "happy",
};
/** Acciones del hero → [animación, duración ms]. */
const ACTS: Record<string, [string, number]> = {
  wave: ["victory-bounce", 1600],
  think: ["thinking", 2600],
  surprise: ["surprised", 1400],
  shy: ["shy", 2200],
};
const SLEEP_MS = 25_000;
const MIN_KEY = "mg-mascot-min";

const LINES = {
  es: {
    greet: (h: number) => `${h < 12 ? "¡Buenos días!" : h < 20 ? "¡Buenas tardes!" : "¡Buenas noches!"} Soy el punto del logo. Baja y te acompaño.`,
    section: {
      consola: "Pulsa un comando y mira qué pasa.",
      trabajo: "Los releases. Abre uno con +.",
      "sobre-mi": "La parte más personal.",
      herramientas: "Filtra por área, yo me quedo quieta.",
      investigacion: "Lectura ligera… o no tanto.",
      trayectoria: "Cada cuadrito es un capítulo.",
      contacto: "¿Escribimos? Responde en 48 h.",
    } as Record<string, string>,
    click: ["¡Hola!", "¡Eso hace cosquillas!", "¡Otra vez!", "Púlsame en la esquina: tengo menú."],
    act: { wave: "¡Hola, hola!", think: "Hmm… déjame pensar.", surprise: "¡Oh!", shy: "Me da vergüenza…", sleep: "Hora de una siesta." } as Record<string, string>,
    pet: "¡Ya, ya! Me mareo. (Trofeo desbloqueado)",
    sleep: "Zzz…",
    wake: "¡Ah! Estaba descansando.",
    dark: "Mejor así, menos brillo.",
    light: "¡Luz!",
    data: "Modo datos: me pongo en forma de gota.",
    fullstack: "Modo ingeniería: de vuelta al círculo.",
    top: "¡Arriba!",
    end: "No hay más secciones. ¡Escríbele!",
    record: "¡Nuevo récord!",
    win: "¡La adivinaste!",
    lose: "Casi. ¿Otra?",
    mood: { idle: "En calma", thinking: "Pensando", happy: "Contenta", "stand-tall": "Orgullosa", curious: "Curiosa", listening: "Escuchando", "victory-bounce": "Saludando", surprised: "Sorprendida", shy: "Tímida", sleeping: "Dormida", beaming: "Radiante", uneasy: "Mareada" } as Record<string, string>,
  },
  en: {
    greet: (h: number) => `${h < 12 ? "Good morning!" : h < 20 ? "Good afternoon!" : "Good evening!"} I'm the dot from the logo. Scroll and I'll tag along.`,
    section: {
      consola: "Click a command and see what happens.",
      trabajo: "The releases. Open one with +.",
      "sobre-mi": "The personal bit.",
      herramientas: "Filter by area, I'll stay still.",
      investigacion: "Light reading… or not.",
      trayectoria: "Each little square is a chapter.",
      contacto: "Shall we write? Replies within 48 h.",
    } as Record<string, string>,
    click: ["Hi!", "That tickles!", "Again!", "Click me in the corner: I have a menu."],
    act: { wave: "Hello, hello!", think: "Hmm… let me think.", surprise: "Oh!", shy: "How embarrassing…", sleep: "Nap time." } as Record<string, string>,
    pet: "Okay, okay! I'm dizzy. (Trophy unlocked)",
    sleep: "Zzz…",
    wake: "Oh! I was resting.",
    dark: "Better, less glare.",
    light: "Light!",
    data: "Data mode: I turn into a drop.",
    fullstack: "Engineering mode: back to a circle.",
    top: "Up we go!",
    end: "No more sections. Say hi!",
    record: "New record!",
    win: "You got it!",
    lose: "So close. Again?",
    mood: { idle: "Calm", thinking: "Thinking", happy: "Happy", "stand-tall": "Proud", curious: "Curious", listening: "Listening", "victory-bounce": "Waving", surprised: "Surprised", shy: "Shy", sleeping: "Asleep", beaming: "Beaming", uneasy: "Dizzy" } as Record<string, string>,
  },
};

export function initMascot() {
  const host = document.querySelector<HTMLButtonElement>("[data-mascot]");
  const art = host?.querySelector<HTMLElement>("[data-mascot-art]");
  const bubble = document.querySelector<HTMLElement>("[data-mascot-say]");
  const menu = document.querySelector<HTMLElement>("[data-mascot-menu]");
  if (!host || !art || !bubble || !menu) return;
  const L = () => (document.documentElement.lang.startsWith("en") ? LINES.en : LINES.es);

  // Colores de marca: Pervinca en el cuerpo; ojos en Pizarra (oscuro) o Hueso (claro).
  // Forma por edición: círculo (Ingeniería) o gota (Datos).
  const definition = () =>
    createDefinition({
      name: host.dataset.label ?? "",
      shape: getProfile() === "data" ? "drop" : "round",
      renderMode: "projected-3d",
      stageColor: "#12151A", // el escenario se pinta transparente en CSS
      ...(getTheme() === "dark" ? { color: "#949FD8", eyeColor: "#12151A" } : { color: "#55609C", eyeColor: "#F4F2EE" }),
    });
  const mascot = createMascot(art, { definition: definition(), animation: "idle" });
  // Sin animar en segundo plano: ahorra CPU y batería con la pestaña oculta.
  document.addEventListener("visibilitychange", () => (document.hidden ? mascot.pause() : mascot.resume()));

  /* ---------- globo de diálogo ---------- */
  let sayTimer = 0;
  const say = (text: string, ms = innerWidth < 768 ? 2600 : 3400) => {
    if (minimized) return;
    window.clearTimeout(sayTimer);
    bubble.textContent = text;
    bubble.hidden = false;
    place();
    if (ms) sayTimer = window.setTimeout(() => (bubble.hidden = true), ms);
  };
  const pick = <T,>(xs: T[]) => xs[Math.floor(Math.random() * xs.length)];

  /* ---------- ánimo ---------- */
  let mood = "idle";
  let busyUntil = 0;
  let asleep = false;
  let sleepTimer = 0;
  const showMood = (key: string) =>
    document.querySelectorAll<HTMLElement>("[data-mascot-mood]").forEach((el) => (el.textContent = L().mood[key] ?? key));
  const play = (anim: string) => {
    mascot.play(anim);
    showMood(anim);
  };
  const settle = () => {
    if (performance.now() >= busyUntil && !asleep) play(mood);
  };
  const react = (anim: string, ms: number) => {
    busyUntil = performance.now() + ms;
    play(anim);
    window.setTimeout(settle, ms);
  };
  const sleep = () => {
    asleep = true;
    play("sleeping");
    say(L().sleep, 0);
  };
  const wake = () => {
    window.clearTimeout(sleepTimer);
    sleepTimer = window.setTimeout(sleep, SLEEP_MS);
    if (!asleep) return;
    asleep = false;
    bubble.hidden = true;
    react("surprised", 900);
    say(L().wake, 2200);
  };

  /* ---------- posición: hueco del hero → esquina ---------- */
  let minimized = (() => {
    try {
      return localStorage.getItem(MIN_KEY) === "1";
    } catch {
      return false;
    }
  })();
  const seen = new Set<string>();
  let base = 0;
  let queued = false;
  let docked = false;
  function place() {
    const r = host!.getBoundingClientRect();
    if (!bubble!.hidden) {
      const bw = bubble!.offsetWidth;
      const bh = bubble!.offsetHeight;
      // En móvil, posada, el globo va encima de la mascota y pegado a su borde derecho:
      // a su izquierda taparía el contenido en mitad de la pantalla.
      const above = docked && innerWidth < 768;
      const left = above ? r.right - bw : docked ? r.left - bw - 12 : r.left + r.width / 2 - bw / 2;
      const top = above ? r.top - bh - 12 : docked ? r.top + r.height * 0.3 - bh / 2 : r.top + r.height * 0.06;
      bubble!.style.transform = `translate(${Math.max(8, left)}px, ${Math.max(64, top)}px)`;
      bubble!.dataset.tail = above ? "down-end" : docked ? "right" : "down";
    }
    if (!menu!.hidden) {
      menu!.style.transform = `translate(${r.right - menu!.offsetWidth}px, ${r.top - menu!.offsetHeight - 10}px)`;
    }
  }
  const frame = () => {
    queued = false;
    const slot = document.querySelector<HTMLElement>("[data-mascot-slot]");
    if (!slot) return;
    const r = slot.getBoundingClientRect();
    const narrow = innerWidth < 768;
    const size = minimized ? 44 : narrow ? 84 : 128;
    // En móvil el hero no muestra su escenario (ocupa toda la pantalla): la mascota va
    // directo a la esquina con su tamaño final.
    const inHero = r.width > 0;
    const want = inHero ? r.width : size;
    if (!base || Math.abs(base - want) > 1) {
      base = want;
      host.style.width = host.style.height = `${base}px`;
    }
    const cx = innerWidth - size - (narrow ? 16 : 28);
    const cy = innerHeight - size - (narrow ? 80 : 92); // por encima del dock
    // Sale cuando su propio escenario llega bajo el encabezado (56px), no por el alto
    // del hero: en móvil el escenario va al final del hero y saldría antes de verla.
    const raw = minimized || !inHero ? 1 : Math.min(1, Math.max(0, (56 - r.top) / (r.height * 0.8)));
    const p = raw * raw * (3 - 2 * raw); // smoothstep
    const x = r.left + (cx - r.left) * p;
    const y = r.top + (cy - r.top) * p;
    const s = (base + (size - base) * p) / base;
    host.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
    // Móvil: la esquina cae sobre los botones del hero; aparece cuando el hero ya se fue.
    if (!inHero) {
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      const away = !hero || hero.getBoundingClientRect().bottom < innerHeight * 0.6;
      host.style.opacity = away ? "1" : "0";
      host.style.pointerEvents = away ? "" : "none";
      host.tabIndex = away ? 0 : -1;
    } else {
      host.style.opacity = "";
      host.style.pointerEvents = "";
      host.tabIndex = 0;
    }
    const nowDocked = p > 0.98;
    if (nowDocked !== docked) {
      docked = nowDocked;
      if (!docked) closeMenu();
    }
    host.dataset.docked = String(docked);
    host.dataset.min = String(minimized);
    host.setAttribute("aria-label", (minimized ? host.dataset.labelRestore : docked ? host.dataset.labelMenu : host.dataset.label) ?? "");
    if (docked && !minimized) host.setAttribute("aria-expanded", String(!menu.hidden));
    else host.removeAttribute("aria-expanded");

    let next = "hero";
    for (const id of SECTIONS) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top < innerHeight * 0.5) next = id;
    }
    if (MOOD[next] !== mood) {
      mood = MOOD[next];
      settle();
    }
    if (next !== "hero" && !seen.has(next) && !asleep) {
      seen.add(next);
      say(L().section[next]);
    }
    place();
  };
  const queue = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(frame);
  };
  addEventListener("scroll", () => (queue(), wake()), { passive: true });
  addEventListener("resize", queue);

  /* ---------- menú (solo posada en la esquina) ---------- */
  function closeMenu() {
    menu!.hidden = true;
    host!.removeAttribute("aria-expanded");
  }
  const openMenu = () => {
    menu.hidden = false;
    place();
    host.setAttribute("aria-expanded", "true");
    menu.querySelector<HTMLElement>("button")?.focus();
  };
  const setMin = (v: boolean) => {
    minimized = v;
    try {
      localStorage.setItem(MIN_KEY, v ? "1" : "0");
    } catch {
      // sin almacenamiento: dura hasta recargar
    }
    if (v) bubble.hidden = true;
    queue();
  };
  menu.addEventListener("click", (e) => {
    const cmd = (e.target as HTMLElement).closest<HTMLElement>("[data-mascot-cmd]")?.dataset.mascotCmd;
    if (!cmd) return;
    closeMenu();
    if (cmd === "wave") {
      react("victory-bounce", 1600);
      say(L().act.wave);
    } else if (cmd === "top") {
      scrollTo({ top: 0, behavior: "smooth" });
      say(L().top, 1800);
    } else if (cmd === "next") {
      const target = SECTIONS.map((id) => document.getElementById(id)).find((el) => el && el.getBoundingClientRect().top > 80);
      if (target) target.scrollIntoView({ behavior: "smooth" });
      else say(L().end);
    } else if (cmd === "console") {
      document.querySelector<HTMLElement>("[data-open-term]")?.click();
    } else if (cmd === "theme") {
      document.querySelector<HTMLElement>("[data-toggle-theme]")?.click();
    } else if (cmd === "min") {
      setMin(true);
    }
  });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !menu.hidden) {
      closeMenu();
      host.focus();
    }
  });
  document.addEventListener("click", (e) => {
    const t = e.target as Node;
    if (!menu.hidden && !menu.contains(t) && !host.contains(t)) closeMenu();
  });

  /* ---------- interacción ---------- */
  addEventListener(
    "pointermove",
    (e) => {
      const b = host.getBoundingClientRect();
      mascot.setLookTarget({
        x: (e.clientX - (b.left + b.width / 2)) / (innerWidth / 2),
        y: (e.clientY - (b.top + b.height / 2)) / (innerHeight / 2),
      });
      wake();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => mascot.clearLookTarget());
  addEventListener("keydown", wake);
  host.addEventListener("pointerenter", () => {
    if (!asleep && performance.now() >= busyUntil) {
      mascot.setExpression("beaming");
      showMood("beaming");
    }
  });
  host.addEventListener("pointerleave", settle);

  // Clic: saludo; cinco seguidos la marean y dan un trofeo; en la esquina abre el menú.
  let taps: number[] = [];
  host.addEventListener("click", () => {
    if (minimized) return setMin(false);
    asleep = false;
    wake();
    const now = performance.now();
    taps = [...taps.filter((t) => now - t < 1500), now];
    if (taps.length >= 5) {
      taps = [];
      busyUntil = now + 1800;
      mascot.setExpression("uneasy");
      showMood("uneasy");
      window.setTimeout(settle, 1800);
      say(L().pet);
      grant("mascot");
      return;
    }
    react("victory-bounce", 1600);
    if (docked) {
      if (menu.hidden) openMenu();
      else closeMenu();
    } else say(pick(L().click), 2200);
  });

  // Acciones del hero (se re-renderiza: delegación).
  document.addEventListener("click", (e) => {
    const key = (e.target as HTMLElement).closest<HTMLElement>("[data-mascot-act]")?.dataset.mascotAct;
    if (!key) return;
    asleep = false;
    wake();
    if (key === "sleep") {
      sleep();
      say(L().act.sleep, 2000);
      window.setTimeout(() => asleep && say(L().sleep, 0), 2000);
      return;
    }
    const [anim, ms] = ACTS[key];
    react(anim, ms);
    say(L().act[key], ms);
  });

  // Juegos de la terminal (term-games.ts): celebra récords y aciertos, consuela al perder.
  addEventListener("mg:game", (e) => {
    const type = (e as CustomEvent<{ type: string }>).detail?.type;
    asleep = false;
    wake();
    if (type === "record" || type === "win") {
      react("victory-bounce", 1800);
      say(type === "record" ? L().record : L().win, 2600);
    } else if (type === "lose") {
      react("sad", 1600);
      say(L().lose, 2200);
    } else react("curious", 1000);
  });

  // Tema y edición: nuevos colores/forma y un comentario.
  onEvent("mg:theme", () => {
    mascot.setDefinition(definition());
    react("surprised", 900);
    say(getTheme() === "dark" ? L().dark : L().light, 2200);
  });
  onEvent("mg:profile", () => {
    mascot.setDefinition(definition());
    react("curious", 1400);
    say(getProfile() === "data" ? L().data : L().fullstack, 2600);
    requestAnimationFrame(() => {
      frame();
      showMood(mood);
    }); // el hero se re-renderiza: hueco y etiqueta nuevos
  });

  frame();
  showMood(mood);
  host.hidden = false;
  wake();
  // En móvil el saludo tapaba el texto y los botones del hero: solo en escritorio.
  if (innerWidth >= 768) window.setTimeout(() => scrollY < 40 && say(L().greet(new Date().getHours()), 4200), 900);
}
