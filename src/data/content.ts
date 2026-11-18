/* Central content for the portfolio.
   Pairs of { es, en } strings plus profiles { fullstack (engineering), data (data science) }.
   Personal details (name, email, socials) live in site.ts instead.
   The Astro frontmatter resolves one locale at build time with pick(). */

export type Lang = "es" | "en";
export type Profile = "fullstack" | "data";
export type Pair = { es: string; en: string };
export const t = (es: string, en: string): Pair => ({ es, en });

export function pick<T>(node: T, lang: Lang): any {
  if (Array.isArray(node)) return node.map((x) => pick(x, lang));
  if (node && typeof node === "object") {
    const keys = Object.keys(node);
    if (keys.length === 2 && "es" in (node as any) && "en" in (node as any)) {
      return (node as any)[lang];
    }
    const out: any = {};
    for (const k of keys) out[k] = pick((node as any)[k], lang);
    return out;
  }
  return node;
}

/** Grupo de habilidades: `items` (nombres) + `meta` con uso diario y años (5.10). */
const sk = (g: string | Pair, rows: [string, 0 | 1, number][]) => ({
  g,
  items: rows.map(([name]) => name),
  meta: rows.map(([name, daily, years]) => ({ name, daily: daily === 1, years })),
});

export const NAME = "Nombre Apellido";
export const EMAIL = "hola@tudominio.com";

/* ---------- UI general (portafolio + caso) ---------- */
export const ui = {
  edition: t("Edición", "Edition"),
  eng: t("Ingeniería", "Engineering"),
  dat: t("Datos", "Data"),
  light: t("Claro", "Light"),
  dark: t("Oscuro", "Dark"),
  sum: t("§ 00 — Resumen", "§ 00 — Summary"),
  work: t("Ver trabajo", "See work"),
  cv: t("Descargar CV", "Download CV"),
  hire: t("Escríbeme", "Get in touch"),
  scroll: t("Desliza", "Scroll"),
  cmdHint: t("Pulsa : para abrir la terminal", "Press : to open the terminal"),
  trophies: t("Trofeos", "Trophies"),
  sections: t("Secciones", "Sections"),
  consT: t("Consola", "Console"),
  consM: t("Pulsa : para abrirla en cualquier parte", "Press : to open it anywhere"),
  consTitle: t("Explora el portafolio desde la línea de comandos.", "Explore the portfolio from the command line."),
  consNote: t(
    "Los comandos cambian el perfil, el tema y el idioma de toda la página. Pulsa uno para probarlo.",
    "Commands switch the profile, theme and language of the whole page. Click one to try it."
  ),
  consCmds: [
    { c: t("whoami", "whoami"), d: t("Quién soy, en una línea", "Who I am, in one line") },
    { c: t("projects", "projects"), d: t("Trabajo seleccionado", "Selected work") },
    { c: t("stack", "stack"), d: t("Herramientas por área", "Tools by area") },
    { c: t("perfil", "profile"), d: t("Alterna Ingeniería / Datos", "Toggle Engineering / Data") },
    { c: t("tema", "theme"), d: t("Alterna claro / oscuro", "Toggle light / dark") },
    { c: t("play", "play"), d: t("Escalera o Stackdle, con trofeos", "Stairs or Stackdle, with trophies") },
  ],
  fig0: t("Fig. 1 — Terminal interactiva. Haz clic y escribe.", "Fig. 1 — Interactive terminal. Click and type."),
  inIssue: t("En este número", "In this issue"),
  pages: t("06 secciones", "06 sections"),
  s1t: t("Notas de versión", "Release notes"),
  s1m: t("4 releases · 2023–2026", "4 releases · 2023–2026"),
  abT: t("Sobre mí", "About"),
  abM: t("Con notas al margen", "With margin notes"),
  notes: t("Notas", "Notes"),
  portrait: t("retrato", "portrait"),
  portraitCap: t("El autor. Pasa el cursor (o toca) para verla a color.", "The author. Hover (or tap) to see it in colour."),
  portraitAlt: t("Retrato de Jerremi Aron Chancan Labajos", "Portrait of Jerremi Aron Chancan Labajos"),
  s2t: t("Capacidades", "Capabilities"),
  s2m: t("Lo que uso, validado", "What I use, validated"),
  certAll: t("Todas", "All"),
  certMore: t("Ver más", "Show more"),
  certLess: t("Ver menos", "Show less"),
  certExpired: t("expirada", "expired"),
  certEmpty: t("Sin certificaciones en este grupo.", "No certifications in this group."),
  certIssued: t("Emitida", "Issued"),
  certExpiresLbl: t("Vence", "Expires"),
  certOne: t("credencial", "credential"),
  certMany: t("credenciales", "credentials"),
  certGroup: t("Grupo", "Group"),
  certsAllDeck: t("Todas las credenciales, agrupadas por área.", "All credentials, grouped by area."),
  certValid: t("Vigente", "Valid"),
  certEnds: t("Vence este año", "Expires this year"),
  certExpired2: t("Vencida", "Expired"),
  certNoExp: t("Sin vencimiento", "No expiry"),
  certVerifyCred: t("Verificar credencial", "Verify credential"),
  certPdf: t("PDF", "PDF"),
  certsT: t("Certificaciones", "Certifications"),
  certsSeeAll: t("Ver todas las credenciales", "See all credentials"),
  mapT: t("Mapa del stack", "Stack map"),
  mapHint: t("Pulsa un área para filtrar", "Click an area to filter"),
  mapDaily: t("Uso diario", "Daily use"),
  mapOcc: t("Ocasional", "Occasional"),
  mapTools: t("Herramientas", "Tools"),
  mapYears: t("Años máx.", "Max years"),
  certsGroups: t("grupos", "groups"),
  certsCount: t("certificaciones", "certifications"),
  certSearch: t("Buscar en el grupo…", "Search this group…"),
  skillT: t("Habilidades", "Skills"),
  skillArea: t("Área", "Area"),
  skillMore: t("más", "more"),
  skillLess: t("Mostrar menos", "Show less"),
  skillUnit: t("herramientas", "tools"),
  wrT: t("Investigación", "Research"),
  wrM: t("Artículos y ponencias", "Articles and talks"),
  pubAll: t("Todas", "All"),
  pubJournal: t("Revista", "Journal"),
  pubConf: t("Congreso", "Conference"),
  pubEmpty: t("Sin publicaciones con ese filtro.", "No publications match that filter."),
  pubType: t("Tipo", "Type"),
  pubYear: t("Año", "Year"),
  pubOne: t("publicación", "publication"),
  pubMany: t("publicaciones", "publications"),
  pubAbs: t("Resumen", "Abstract"),
  pubFeatured: t("Destacado", "Featured"),
  pubBib: t("BibTeX", "BibTeX"),
  pubCopied: t("Copiado", "Copied"),
  pubAllYears: t("Todos", "All"),
  pubPages: t("Publicación", "Published in"),
  pubLang: t("Idioma", "Language"),
  eduT: t("Formación", "Education"),
  expT: t("Experiencia", "Experience"),
  actT: t("Actual", "Now"),
  cvFull: t("CV completo", "Full CV"),
  s3t: t("Trayectoria", "Experience"),
  s3m: t("2020 — hoy", "2020 — present"),
  s4t: t("Correspondencia", "Correspondence"),
  s4m: t("Respuesta en 48 h", "Reply within 48 h"),
  salute: t("Estimada lectora, estimado lector:", "Dear reader,"),
  sign: t("Atentamente,", "Sincerely,"),
  psL: t("P. D.", "P.S."),
  ps: t(
    "Respondo todos los correos en menos de 48 horas, incluso si la respuesta es «ahora no».",
    "I answer every email within 48 hours, even when the answer is “not now”."
  ),
  dir: t("Directorio", "Directory"),
  write: t("Escribir un correo", "Write an email"),
  mail: t("Correo", "Email"),
  loc: t("Ubicación", "Location"),
  avK: t("Estado", "Status"),
  foot1: t("Compuesto en Sora y JetBrains Mono", "Set in Sora and JetBrains Mono"),
  ds: t("Sistema de diseño", "Design system"),
  cs: t("Caso de estudio", "Case study"),
  featured: t("Destacado", "Featured"),
  /* Etiqueta única para material demostrativo (proyectos y métricas de ejemplo). */
  demo: t("Muestra demostrativa", "Demonstration sample"),
  /* Aviso único de contenido de muestra (proyectos, empleadores, publicaciones…). */
  sampleNotice: t(
    "Los proyectos y sus métricas, los empleadores, las publicaciones, la formación y la trayectoria son contenido de muestra.",
    "Projects and their metrics, employers, publications, education and career history are sample content."
  ),
  nextCase: t("Siguiente caso", "Next case"),
  readCase: t("Leer el caso", "Read the case"),
  relCur: t("Versión actual · canal estable", "Current version · stable channel"),
  relOf: t("El release de una persona", "A person, released"),
  relList: t("Todos los releases", "All releases"),
  mascotLabel: t("Mascota: pulsa para saludar", "Mascot: click to say hi"),
  mascotMenuLabel: t("Mascota: abrir menú", "Mascot: open menu"),
  mascotRestore: t("Mostrar mascota", "Show mascot"),
  mascotFig: t("Fig. 0 — Compañero", "Fig. 0 — Companion"),
  mascotMood: t("Ánimo", "Mood"),
  actWave: t("Saludar", "Wave"),
  actThink: t("Pensar", "Think"),
  actSurprise: t("Sorprender", "Surprise"),
  actShy: t("Timidez", "Shy"),
  actSleep: t("Dormir", "Sleep"),
  mTop: t("Ir arriba", "Back to top"),
  mNext: t("Siguiente sección", "Next section"),
  mConsole: t("Abrir consola", "Open console"),
  mTheme: t("Cambiar tema", "Switch theme"),
  mMin: t("Minimizar", "Minimize"),
  relLatest: t("Último release", "Latest release"),
  relChannels: t("Canales", "Channels"),
  relArtifacts: t("Artefactos", "Artifacts"),
  relConsole: t("Consola", "Console"),
  relLive: t("viva", "live"),
  relStatus: t("Estado", "Status"),
  relContent: t("Contenido", "Content"),
  relSample: t("muestra", "sample"),
  relRead: t("Leer release", "Read release"),
  relAll: t("Ver releases", "See releases"),
  relPrevious: t("Releases anteriores", "Previous releases"),
  relReleases: t("releases", "releases"),
  relEmpty: t("Este canal aún no tiene releases anteriores.", "This channel has no previous releases yet."),
  relVersion: t("Versión", "Version"),
  code: t("Código", "Code"),
  metric: t("Métrica", "Metric"),
  before: t("Antes", "Before"),
  after: t("Después", "After"),
  tab: t("Tabla", "Table"),
  moreProjects: t("Más proyectos", "More projects"),
  colYear: t("Año", "Year"),
  colResult: t("Resultado", "Result"),
  roleL: t("Rol", "Role"),
  problem: t("Problema", "Problem"),
  approach: t("Enfoque", "Approach"),
  result: t("Resultado", "Result"),
  prinT: t("Cómo trabajo", "How I work"),
  nowT: t("Ahora mismo", "Right now"),
  updated: t("Actualizado", "Updated"),
  profilesT: t("Perfiles", "Profiles"),
  localTime: t("Hora local", "Local time"),
  hoursNote: t("Coincido de 9:00 a 14:00 con horarios de América y Europa.", "I overlap 9:00–14:00 with American and European hours."),
  copy: t("Copiar", "Copy"),
  copied: t("Copiado", "Copied"),
  facts: [
    { k: t("Base", "Based in"), v: t("Lima, Perú", "Lima, Peru") },
    { k: t("Zona", "Timezone"), v: t("UTC−5 · remoto", "UTC−5 · remote") },
    { k: t("Idiomas", "Languages"), v: t("Español, inglés", "Spanish, English") },
    { k: t("Experiencia", "Experience"), v: t("6 años", "6 years") },
  ],
  index: [
    { n: "01", l: t("Notas de versión", "Release notes"), h: "#trabajo" },
    { n: "02", l: t("Sobre mí", "About"), h: "#sobre-mi" },
    { n: "03", l: t("Capacidades", "Capabilities"), h: "#herramientas" },
    { n: "04", l: t("Investigación", "Research"), h: "#investigacion" },
    { n: "05", l: t("Trayectoria", "Experience"), h: "#trayectoria" },
    { n: "06", l: t("Correspondencia", "Correspondence"), h: "#contacto" },
  ],
};

/* ---------- Perfil: ingeniería (fullstack) ---------- */
export const fullstack = {
  role: t("Ingeniero de software", "Software engineer"),
  h1a: t("Construyo productos web", "I build web products"),
  h1em: t("de punta a punta", "end to end"),
  h1b: t("— de la base de datos al último píxel.", "— from the database to the last pixel."),
  intro: t(
    "Diseño APIs, modelo datos y escribo interfaces rápidas y accesibles. Me importa tanto la latencia del servidor como el ritmo de una tipografía.",
    "I design APIs, model data and write fast, accessible interfaces. I care as much about server latency as about the rhythm of a typeface."
  ),
  letter: t(
    "Si tienes un producto por construir o un sistema que ya no aguanta más, me encantará escucharlo.",
    "If you have a product to build or a system that can’t take any more, I’d love to hear about it."
  ),
  about: [
    {
      t: t(
        "Empecé haciendo sitios para amigos y terminé diseñando sistemas que mueven dinero real. Me gusta estar en ambos extremos: el esquema de la base de datos y el detalle de la interfaz.",
        "I started building sites for friends and ended up designing systems that move real money. I like living at both ends: the database schema and the interface detail."
      ),
      n: "1",
    },
    {
      t: t(
        "Trabajo mejor en equipos pequeños, con problemas bien definidos y la libertad de borrar código. Escribo documentación como si fuera a leerla yo mismo dentro de un año.",
        "I work best in small teams, with well-defined problems and the freedom to delete code. I write documentation as if I will read it myself a year from now."
      ),
      n: "2",
    },
  ],
  notes: [
    { n: "1", t: t("Primer despliegue en producción: 2019, un viernes. No lo repitas.", "First production deploy: 2019, on a Friday. Don’t.") },
    { n: "2", t: t("PostgreSQL hasta que se demuestre lo contrario.", "PostgreSQL until proven otherwise.") },
    { n: "3", t: t("Leo sobre tipografía tanto como sobre sistemas distribuidos.", "I read about typography as much as distributed systems.") },
  ],
  pubs: [
    { slug: "immutable-ledgers", title: t("Libros contables inmutables, explicados para humanos", "Immutable ledgers, explained for humans"), authors: ["J. A. Chancan"], venue: t("Revista de Ingeniería de Software", "Journal of Software Engineering"), type: "journal", year: 2026, publishedAt: "2026-03", doi: "https://doi.org/10.0000/ledger.2026", pdfUrl: "#", abstract: t("Doble entrada inmutable para conciliación en tiempo casi real.", "Immutable double-entry for near real-time reconciliation."), keywords: ["ledger", "postgresql"], featured: true, pages: "Vol. 12 · pp. 45–67", language: t("Inglés", "English") },
    { slug: "crdts-sin-miedo", title: t("CRDTs sin miedo: colaboración en tiempo real", "CRDTs without fear: real-time collaboration"), authors: ["J. A. Chancan"], venue: "Conf. JS", type: "conference", year: 2025, publishedAt: "2025-10", doi: "https://doi.org/10.0000/crdt.2025", pdfUrl: "#", abstract: t("Presencia y resolución de conflictos con CRDTs en producción.", "Presence and conflict resolution with CRDTs in production."), keywords: ["crdt", "websockets"], featured: false, pages: t("Actas · pp. 101–110", "Proceedings · pp. 101–110"), language: t("Inglés", "English") },
    { slug: "tipografia-tokens", title: t("Tipografía como sistema: tokens en producción", "Typography as a system: tokens in production"), authors: ["J. A. Chancan"], venue: t("Revista de Diseño Técnico", "Technical Design Journal"), type: "journal", year: 2024, publishedAt: "2024-06", doi: "https://doi.org/10.0000/tokens.2024", pdfUrl: "#", abstract: t("Escala tipográfica y tokens de diseño auditables.", "Auditable type scale and design tokens."), keywords: ["tokens", "css"], featured: false, pages: "Vol. 12 · pp. 45–67", language: t("Inglés", "English") },
  ],
  projects: [
    { title: t("Plataforma de pagos", "Payments platform"), sum: t("API REST y panel de conciliación para comercios.", "REST API and reconciliation dashboard for merchants."), stack: ["Go", "PostgreSQL", "React"], year: "2026", metric: "p95 120 ms",
      role: t("Líder técnico", "Tech lead"), problem: t("La conciliación se hacía con scripts nocturnos; los errores tardaban días en aparecer.", "Reconciliation ran on nightly scripts; errors took days to surface."), approach: t("Libro contable inmutable de doble entrada, ingesta de eventos separada del cálculo de saldos y un panel en tiempo casi real para cada comercio.", "Immutable double-entry ledger, event ingestion split from balance computation, and a near real-time dashboard for every merchant."), result: t("Soporte pasó de 310 a 45 tickets semanales.", "Support went from 310 to 45 weekly tickets."),
      figures: [{ k: t("Latencia p95", "p95 latency"), a: "840 ms", b: "120 ms" }, { k: t("Tickets / semana", "Tickets / week"), a: "310", b: "45" }, { k: t("Conciliación", "Reconciliation"), a: "24 h", b: "5 min" }], cap: t("medido tras tres meses en producción.", "measured after three months in production.") },
    { title: t("Editor colaborativo", "Collaborative editor"), sum: t("Documentos en tiempo real con CRDTs y presencia.", "Real-time documents with CRDTs and presence."), stack: ["TypeScript", "WebSockets", "Redis"], year: "2025", metric: t("10k concurrentes", "10k concurrent"),
      role: "Full Stack", problem: t("Los equipos editaban documentos por turnos y perdían cambios.", "Teams edited documents in turns and lost changes."), approach: t("CRDTs sobre WebSockets con presencia y cursores; persistencia incremental en Redis.", "CRDTs over WebSockets with presence and cursors; incremental persistence in Redis."), result: t("10.000 usuarios concurrentes sin conflictos de edición.", "10,000 concurrent users with no edit conflicts.") },
    { title: t("Sistema de diseño interno", "Internal design system"), sum: t("Biblioteca de componentes para cinco equipos de producto.", "Component library for five product teams."), stack: ["React", "Storybook", "Tokens"], year: "2024", metric: t("−40% tiempo UI", "−40% UI time"),
      role: t("Autor principal", "Lead author"), problem: t("Cinco equipos reimplementaban los mismos componentes con estilos distintos.", "Five teams reimplemented the same components with different styles."), approach: t("Tokens de diseño, biblioteca de componentes accesibles y documentación viva en Storybook.", "Design tokens, an accessible component library and living docs in Storybook."), result: t("40% menos tiempo en interfaz por funcionalidad.", "40% less UI time per feature.") },
    { title: t("Marketplace de artesanía", "Crafts marketplace"), sum: t("Catálogo, pagos y logística para 300 vendedores.", "Catalog, payments and logistics for 300 sellers."), stack: ["Next.js", "Node.js", "Stripe"], year: "2023", metric: t("2.3× conversión", "2.3× conversion"),
      role: "Full Stack", problem: t("Los artesanos vendían solo por redes sociales, sin pagos ni inventario.", "Artisans sold only through social media, with no payments or inventory."), approach: t("Catálogo en Next.js, pagos con Stripe Connect y logística integrada.", "Next.js catalog, Stripe Connect payments and integrated logistics."), result: t("La conversión se multiplicó por 2,3 en el primer trimestre.", "Conversion grew 2.3× in the first quarter.") },
  ],
  quote: t("El mejor código es el que no tuviste que escribir; el segundo mejor, el que otro entiende a la primera.", "The best code is the code you didn’t have to write; the second best is code someone else understands at first read."),
  quoteBy: t("Nota personal, 2025", "Personal note, 2025"),
  principles: [
    { n: "I.", t: t("Primero el modelo de datos", "Data model first"), d: t("Un esquema correcto elimina más errores que cualquier capa de validación.", "A correct schema removes more bugs than any validation layer.") },
    { n: "II.", t: t("Rápido de verdad", "Actually fast"), d: t("Mido latencia y peso de página antes de optimizar lo que “se siente” lento.", "I measure latency and page weight before optimizing what “feels” slow.") },
    { n: "III.", t: t("Escribir para quien viene", "Write for whoever’s next"), d: t("Documentación, nombres claros y PRs pequeños que se revisan en diez minutos.", "Docs, clear names and small PRs reviewable in ten minutes.") },
  ],
  nowD: "2026-09",
  now: [
    { k: t("Construyendo", "Building"), v: t("Un motor de colas en Go", "A queue engine in Go") },
    { k: t("Aprendiendo", "Learning"), v: t("Rust y WebAssembly", "Rust and WebAssembly") },
    { k: t("Leyendo", "Reading"), v: "Designing Data-Intensive Applications" },
  ],
  stack: [
    sk("Backend", [["TypeScript", 1, 5], ["NestJS", 1, 3], ["Node.js", 1, 5], ["Fastify", 0, 2], ["Express", 0, 4], ["GraphQL", 0, 2], ["PostgreSQL", 1, 4], ["Redis", 0, 2], ["Prisma", 0, 2], ["RabbitMQ", 0, 1], ["Go", 0, 1], ["MongoDB", 0, 3]]),
    sk("Frontend", [["React", 1, 4], ["Tailwind", 1, 3], ["Next.js", 0, 3], ["Vite", 0, 2], ["Zustand", 0, 1]]),
    sk("DevOps", [["CI/CD", 1, 3], ["Docker", 1, 4], ["Kubernetes", 0, 1], ["Terraform", 0, 1], ["GitHub Actions", 0, 3], ["AWS", 0, 2], ["Nginx", 0, 2]]),
    sk(t("Pruebas", "Testing"), [["Jest", 1, 3], ["Vitest", 0, 1], ["Playwright", 0, 1], ["Supertest", 0, 2]]),
  ],
  edu: [
    { s: t("Universidad ejemplo", "Example University"), d: t("Ingeniería en Sistemas", "B.Sc. Computer Engineering"), p: "2016 — 2020", desc: t("Especialidad en sistemas distribuidos.", "Focus on distributed systems.") },
    { s: t("Institución ejemplo", "Example institution"), d: t("Arquitectura de software", "Software architecture"), p: "2023", desc: t("Curso de posgrado.", "Postgraduate course.") },
  ],
  exp: [
    { y: t("2024 — hoy", "2024 — now"), dur: t("2 años", "2 years"), current: true, r: "Senior Full Stack Engineer", c: t("Empresa A · Remoto", "Company A · Remote"), d: t("Lidero la plataforma de pagos: arquitectura, API y panel para comercios.", "I lead the payments platform: architecture, API and merchant dashboard."), wins: [t("p95 de 840 ms a 120 ms sin detener el servicio.", "p95 from 840 ms to 120 ms with no downtime."), t("310 tickets de soporte por semana reducidos a 45.", "310 support tickets a week cut to 45.")], stack: ["Go", "PostgreSQL", "React"] },
    { y: "2022 — 2024", dur: t("2 años", "2 years"), current: false, r: "Full Stack Developer", c: t("Empresa B · Ciudad", "Company B · City"), d: t("Construí el editor colaborativo y su infraestructura en tiempo real.", "Built the collaborative editor and its real-time infrastructure."), wins: [t("10 000 editores concurrentes sobre CRDTs.", "10,000 concurrent editors on CRDTs.")], stack: ["TypeScript", "WebSockets", "Redis"] },
    { y: "2020 — 2022", dur: t("2 años", "2 years"), current: false, r: "Frontend Developer", c: t("Estudio C · Ciudad", "Studio C · City"), d: t("Sitios y aplicaciones para clientes; inicié el sistema de diseño del estudio.", "Client sites and apps; started the studio design system."), wins: [t("−40 % de tiempo de UI en cinco equipos de producto.", "−40% UI time across five product teams.")], stack: ["React", "Storybook", "Tokens"] },
  ],
  links: ["github", "linkedin", "cv"],
};

/* ---------- Perfil: datos (data) ---------- */
export const data = {
  role: t("Científico de datos", "Data scientist"),
  h1a: t("Convierto datos desordenados", "I turn messy data"),
  h1em: t("en modelos", "into models"),
  h1b: t("que toman decisiones en producción.", "that make decisions in production."),
  intro: t(
    "Del análisis exploratorio al despliegue: limpio datos, entreno modelos, mido su incertidumbre y los pongo a trabajar detrás de una API.",
    "From exploratory analysis to deployment: I clean data, train models, measure their uncertainty and put them to work behind an API."
  ),
  letter: t(
    "Si tienes datos que nadie ha sabido leer o un modelo que no sale del notebook, me encantará escucharlo.",
    "If you have data nobody has managed to read or a model stuck in a notebook, I’d love to hear about it."
  ),
  about: [
    {
      t: t(
        "Llegué a los datos desde la estadística y me quedé por la ingeniería. Un modelo solo me interesa cuando sale del notebook y alguien toma una decisión mejor gracias a él.",
        "I came to data from statistics and stayed for the engineering. A model only interests me once it leaves the notebook and someone makes a better decision because of it."
      ),
      n: "1",
    },
    {
      t: t(
        "Me importa tanto la incertidumbre como la predicción: prefiero un intervalo honesto a un número preciso y falso. Explico resultados sin jerga a quien tenga que usarlos.",
        "I care about uncertainty as much as prediction: I prefer an honest interval to a precise, false number. I explain results without jargon to whoever has to use them."
      ),
      n: "2",
    },
  ],
  notes: [
    { n: "1", t: t("Primer modelo en producción: 2021, un pronóstico que falló con elegancia.", "First model in production: 2021, a forecast that failed gracefully.") },
    { n: "2", t: t("Métrica favorita: la que el negocio entiende.", "Favorite metric: the one the business understands.") },
    { n: "3", t: t("Estadística bayesiana los fines de semana.", "Bayesian statistics on weekends.") },
  ],
  pubs: [
    { slug: "nadie-importa-auc", title: t("Por qué a nadie le importa tu AUC", "Why nobody cares about your AUC"), authors: ["J. A. Chancan"], venue: t("Revista de Ciencia de Datos", "Data Science Journal"), type: "journal", year: 2026, publishedAt: "2026-04", doi: "https://doi.org/10.0000/auc.2026", pdfUrl: "#", abstract: t("Precisión en el top operativo frente a métricas globales.", "Precision at the operating top versus global metrics."), keywords: ["auc", "retencion"], featured: true, pages: "Vol. 12 · pp. 45–67", language: t("Inglés", "English") },
    { slug: "validacion-temporal", title: t("Validación temporal: las fugas que no ves", "Temporal validation: the leaks you don't see"), authors: ["J. A. Chancan"], venue: t("Conf. Datos", "Data Conf"), type: "conference", year: 2025, publishedAt: "2025-11", doi: "https://doi.org/10.0000/temporal.2025", pdfUrl: "#", abstract: t("Ventanas de tiempo contra fuga de información futura.", "Time windows against future-information leakage."), keywords: ["validacion", "xgboost"], featured: false, pages: t("Actas · pp. 101–110", "Proceedings · pp. 101–110"), language: t("Inglés", "English") },
    { slug: "recomendadores-dos-torres", title: t("Recomendadores de dos torres en la práctica", "Two-tower recommenders in practice"), authors: ["J. A. Chancan"], venue: "RecSys Latam", type: "conference", year: 2025, publishedAt: "2025-07", doi: "https://doi.org/10.0000/twotower.2025", pdfUrl: "#", abstract: t("Embeddings de dos torres para catálogos millonarios.", "Two-tower embeddings for million-item catalogs."), keywords: ["embeddings", "pytorch"], featured: false, pages: t("Actas · pp. 101–110", "Proceedings · pp. 101–110"), language: t("Inglés", "English") },
  ],
  projects: [
    { title: t("Predicción de abandono", "Churn prediction"), sum: t("Modelo de churn con explicaciones por cliente para el equipo comercial.", "Churn model with per-customer explanations for the sales team."), stack: ["XGBoost", "SHAP", "dbt"], year: "2026", metric: "AUC 0.91",
      role: t("Científico de datos", "Data scientist"), problem: t("El 9% de los clientes cancelaba cada trimestre y ventas se enteraba demasiado tarde.", "9% of customers churned each quarter and sales found out too late."), approach: t("Variables de comportamiento con dbt, gradient boosting con validación temporal y explicaciones SHAP por cliente para priorizar llamadas.", "Behavioral features in dbt, gradient boosting with temporal validation and per-customer SHAP explanations to prioritize calls."), result: t("El churn trimestral bajó del 9% al 6,8%.", "Quarterly churn dropped from 9% to 6.8%."),
      figures: [{ k: "AUC-ROC", a: "0.74", b: "0.91" }, { k: t("Precisión @10%", "Precision @10%"), a: "0.31", b: "0.62" }, { k: t("Churn trimestral", "Quarterly churn"), a: "9.0%", b: "6.8%" }], cap: t("evaluado fuera de muestra, trimestre siguiente.", "evaluated out of sample, following quarter.") },
    { title: t("Motor de recomendaciones", "Recommendation engine"), sum: t("Embeddings de dos torres para un catálogo de 2 M artículos.", "Two-tower embeddings for a 2M-item catalog."), stack: ["PyTorch", "FAISS", "Spark"], year: "2025", metric: "+18% CTR",
      role: "ML Engineer", problem: t("Las recomendaciones eran reglas manuales para un catálogo de 2 M artículos.", "Recommendations were manual rules over a 2M-item catalog."), approach: t("Modelo de dos torres con embeddings, búsqueda aproximada en FAISS y reentrenamiento semanal.", "Two-tower embedding model, approximate search in FAISS and weekly retraining."), result: t("+18% de clics en recomendaciones.", "+18% click-through on recommendations.") },
    { title: t("Pronóstico de demanda", "Demand forecasting"), sum: t("Pronósticos jerárquicos semanales para 1.200 tiendas.", "Weekly hierarchical forecasts for 1,200 stores."), stack: ["LightGBM", "Prophet", "SQL"], year: "2024", metric: "MAPE 6.2%",
      role: t("Científico de datos", "Data scientist"), problem: t("Los pedidos a 1.200 tiendas se calculaban con promedios móviles.", "Orders to 1,200 stores were computed with moving averages."), approach: t("Pronóstico jerárquico con LightGBM y reconciliación entre tienda, región y total.", "Hierarchical forecasting with LightGBM and reconciliation across store, region and total."), result: t("MAPE de 6,2% y menos quiebres de inventario.", "6.2% MAPE and fewer stock-outs.") },
    { title: t("Plataforma MLOps", "MLOps platform"), sum: t("Entrenamiento, registro y despliegue reproducibles.", "Reproducible training, registry and deployment."), stack: ["Airflow", "MLflow", "FastAPI"], year: "2023", metric: t("12 modelos en prod", "12 models in prod"),
      role: "MLOps", problem: t("Cada modelo se desplegaba a mano y nadie sabía qué versión corría.", "Each model was deployed by hand and nobody knew which version was running."), approach: t("Orquestación en Airflow, registro en MLflow y servicio con FastAPI detrás de CI/CD.", "Airflow orchestration, MLflow registry and FastAPI serving behind CI/CD."), result: t("12 modelos en producción, reproducibles.", "12 models in production, reproducible.") },
  ],
  quote: t("Un modelo vale lo que vale la decisión que mejora. Todo lo demás es una buena gráfica.", "A model is worth what the decision it improves is worth. Everything else is a nice chart."),
  quoteBy: t("Nota personal, 2025", "Personal note, 2025"),
  principles: [
    { n: "I.", t: t("La pregunta antes que el modelo", "Question before model"), d: t("Defino qué decisión cambia con la respuesta antes de tocar un dato.", "I define which decision the answer changes before touching data.") },
    { n: "II.", t: t("Incertidumbre honesta", "Honest uncertainty"), d: t("Intervalos, calibración y validación temporal; nada de precisión falsa.", "Intervals, calibration and temporal validation; no false precision.") },
    { n: "III.", t: t("Hasta producción", "All the way to production"), d: t("Un notebook no es un entregable: pipelines reproducibles y monitoreo.", "A notebook is not a deliverable: reproducible pipelines and monitoring.") },
  ],
  nowD: "2026-09",
  now: [
    { k: t("Construyendo", "Building"), v: t("Un pipeline de features en tiempo real", "A real-time feature pipeline") },
    { k: t("Aprendiendo", "Learning"), v: t("Inferencia causal", "Causal inference") },
    { k: t("Leyendo", "Reading"), v: "Statistical Rethinking" },
  ],
  stack: [
    sk(t("Lenguajes", "Languages"), [["Python", 1, 6], ["SQL", 1, 6], ["R", 0, 3], ["Bash", 0, 4]]),
    sk(t("Modelado", "Modeling"), [["scikit-learn", 1, 5], ["XGBoost", 1, 4], ["LightGBM", 0, 3], ["PyTorch", 0, 3], ["Hugging Face", 0, 2], ["statsmodels", 0, 3], ["SHAP", 1, 3], ["Prophet", 0, 2], ["PyMC", 0, 1]]),
    sk(t("Datos", "Data"), [["Pandas", 1, 6], ["Polars", 0, 1], ["Spark", 0, 3], ["dbt", 1, 3], ["Airflow", 0, 3], ["BigQuery", 0, 2]]),
    sk("MLOps", [["MLflow", 1, 3], ["Docker", 0, 4], ["FastAPI", 0, 3], ["SageMaker", 0, 2], ["Evidently", 0, 1]]),
  ],
  edu: [
    { s: t("Universidad ejemplo", "Example University"), d: t("Maestría en Estadística", "M.Sc. Statistics"), p: "2018 — 2020", desc: t("Tesis sobre series de tiempo jerárquicas.", "Thesis on hierarchical time series.") },
    { s: t("Universidad ejemplo", "Example University"), d: t("Licenciatura en Matemáticas", "B.Sc. Mathematics"), p: "2013 — 2018", desc: t("Mención honorífica.", "Honors.") },
  ],
  exp: [
    { y: t("2024 — hoy", "2024 — now"), dur: t("2 años", "2 years"), current: true, r: "Senior Data Scientist", c: t("Empresa A · Remoto", "Company A · Remote"), d: t("Modelos de retención y precios; mentor de dos analistas.", "Retention and pricing models; mentor to two analysts."), wins: [t("Churn trimestral de 9,0 % a 6,8 % con validación temporal.", "Quarterly churn from 9.0% to 6.8% with temporal validation."), t("Explicaciones por cliente que el comercial sí usa.", "Per-customer explanations the sales team actually uses.")], stack: ["XGBoost", "SHAP", "dbt"] },
    { y: "2022 — 2024", dur: t("2 años", "2 years"), current: false, r: "Machine Learning Engineer", c: t("Empresa B · Ciudad", "Company B · City"), d: t("Sistema de recomendaciones y su pipeline de entrenamiento continuo.", "Recommendation system and its continuous training pipeline."), wins: [t("+18 % de CTR sobre el modelo anterior.", "+18% CTR over the previous model.")], stack: ["PyTorch", "FAISS", "Spark"] },
    { y: "2020 — 2022", dur: t("2 años", "2 years"), current: false, r: "Data Analyst", c: t("Empresa C · Ciudad", "Company C · City"), d: t("Tableros, pruebas A/B y los primeros modelos de pronóstico.", "Dashboards, A/B tests and the first forecasting models."), wins: [t("MAPE 6,2 % en 1 200 tiendas.", "MAPE 6.2% across 1,200 stores.")], stack: ["SQL", "dbt", "Airflow"] },
  ],
  links: ["github", "linkedin", "kaggle", "cv"],
};

export const profiles = { fullstack, data };

/* Filtro de certificaciones por perfil (Q9): skills/category como regla,
   onlySlugs/excludeSlugs como override. Vacío = pasa todo. */
export type CertProfileFilter = {
  skills: string[];
  categories: string[];
  onlySlugs: string[];
  excludeSlugs: string[];
};
export const certProfileFilter: Record<Profile, CertProfileFilter> = {
  fullstack: { skills: [], categories: [], onlySlugs: [], excludeSlugs: [] },
  data: { skills: [], categories: [], onlySlugs: [], excludeSlugs: [] },
};

/* Fallback local de formación (GET /education lo reemplaza en vivo). */
export const education = [
  { school: "UNI", degree: t("Ingeniería de Software", "Software Engineering"), period: "2020 — 2024", description: t("Formación en sistemas, datos y diseño de interfaces.", "Training in systems, data and interface design.") },
  { school: "Platzi / Coursera", degree: t("Especialización en ML", "ML Specialization"), period: "2024 — 2025", description: t("Modelos en producción, validación y MLOps.", "Models in production, validation and MLOps.") },
];

/* Respaldo de slugs para getStaticPaths si la API no responde en build.
   Editar con los grupos reales; la plantilla no depende de los valores. */
export const certGroupFallback = ["aws", "datos", "ia", "sql", "web"];

/* ---------- Caso de estudio ---------- */
export const caseUi = {
  back: t("Volver al índice", "Back to index"),
  kicker: t("Caso de estudio", "Case study"),
  indexTitle: t("Casos de estudio", "Case studies"),
  indexDeck: t("Cómo diseñé, construí y llevé a producción cada proyecto: arquitectura, decisiones, código y resultados.", "How I designed, built and shipped each project: architecture, decisions, code and results."),
  read: t("Leer caso", "Read case"),
  toc: t("Contenido", "Contents"),
  metric: t("Métrica", "Metric"),
  before: t("Antes", "Before"),
  after: t("Después", "After"),
  next: t("Siguiente caso", "Next case"),
  stack: t("Stack", "Stack"),
  links: t("Enlaces", "Links"),
  linksTitle: t("Dónde verlo", "Where to see it"),
  openDemo: t("Abrir en una pestaña", "Open in a new tab"),
  source: t("Ver archivo original", "View original file"),
  ds: t("Sistema de diseño", "Design system"),
  light: t("Claro", "Light"),
  dark: t("Oscuro", "Dark"),
  edition: t("Edición", "Edition"),
  eng: t("Ingeniería", "Engineering"),
  dat: t("Datos", "Data"),
};


export const siteContent = { ui, fullstack, data, caseUi };
export type SiteContent = typeof siteContent;
