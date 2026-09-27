/* Central content for the Marginalia portfolio.
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
  cons: t("§ 00.1 — Consola", "§ 00.1 — Console"),
  consTitle: t("Explora el portafolio desde la línea de comandos.", "Explore the portfolio from the command line."),
  consNote: t(
    "Prueba help, projects o perfil data. Los comandos cambian el perfil, el tema y el idioma de toda la página.",
    "Try help, projects or profile data. Commands switch the profile, theme and language of the whole page."
  ),
  fig0: t("Fig. 0 — Terminal interactiva. Haz clic y escribe.", "Fig. 0 — Interactive terminal. Click and type."),
  inIssue: t("En este número", "In this issue"),
  pages: t("06 secciones", "06 sections"),
  s1t: t("Trabajo seleccionado", "Selected work"),
  s1m: t("4 proyectos · 2023–2026", "4 projects · 2023–2026"),
  abT: t("Sobre mí", "About"),
  abM: t("Con notas al margen", "With margin notes"),
  notes: t("Notas", "Notes"),
  portrait: t("retrato", "portrait"),
  portraitCap: t("El autor, en su escritorio.", "The author, at his desk."),
  s2t: t("Herramientas", "Toolkit"),
  s2m: t("Lo que uso a diario", "What I use daily"),
  wrT: t("Escritos", "Writing"),
  wrM: t("Artículos, charlas y notebooks", "Articles, talks and notebooks"),
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
  foot1: t("Compuesto en Newsreader e IBM Plex", "Set in Newsreader & IBM Plex"),
  ds: t("Sistema de diseño", "Design system"),
  cs: t("Caso de estudio", "Case study"),
  index: [
    { n: "01", l: t("Trabajo seleccionado", "Selected work"), h: "#trabajo" },
    { n: "02", l: t("Sobre mí", "About"), h: "#sobre-mi" },
    { n: "03", l: t("Herramientas", "Toolkit"), h: "#herramientas" },
    { n: "04", l: t("Escritos", "Writing"), h: "#escritos" },
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
  writing: [
    { d: "03.2026", t: t("Libros contables inmutables, explicados para humanos", "Immutable ledgers, explained for humans"), k: t("Artículo", "Article") },
    { d: "10.2025", t: t("CRDTs sin miedo: colaboración en tiempo real", "CRDTs without fear: real-time collaboration"), k: t("Charla · Conf. JS", "Talk · JS Conf") },
    { d: "06.2024", t: t("Tipografía como sistema: tokens en producción", "Typography as a system: tokens in production"), k: t("Artículo", "Article") },
    { d: "01.2024", t: t("Go para quienes vienen de TypeScript", "Go for people coming from TypeScript"), k: t("Guide", "Guide") },
  ],
  projects: [
    { title: t("Plataforma de pagos", "Payments platform"), sum: t("API REST y panel de conciliación para comercios.", "REST API and reconciliation dashboard for merchants."), stack: ["Go", "PostgreSQL", "React"], year: "2026", metric: "p95 120 ms" },
    { title: t("Editor colaborativo", "Collaborative editor"), sum: t("Documentos en tiempo real con CRDTs y presencia.", "Real-time documents with CRDTs and presence."), stack: ["TypeScript", "WebSockets", "Redis"], year: "2025", metric: t("10k concurrentes", "10k concurrent") },
    { title: t("Sistema de diseño interno", "Internal design system"), sum: t("Biblioteca de componentes para cinco equipos de producto.", "Component library for five product teams."), stack: ["React", "Storybook", "Tokens"], year: "2024", metric: t("−40% tiempo UI", "−40% UI time") },
    { title: t("Marketplace de artesanía", "Crafts marketplace"), sum: t("Catálogo, pagos y logística para 300 vendedores.", "Catalog, payments and logistics for 300 sellers."), stack: ["Next.js", "Node.js", "Stripe"], year: "2023", metric: t("2.3× conversión", "2.3× conversion") },
  ],
  stack: [
    { g: "Frontend", items: ["TypeScript", "React / Next.js", t("CSS moderno", "Modern CSS"), t("Accesibilidad", "Accessibility")] },
    { g: "Backend", items: ["Node.js", "Go", "GraphQL / REST", t("Colas y eventos", "Queues & events")] },
    { g: t("Datos", "Data"), items: ["PostgreSQL", "Redis", "MongoDB", "Prisma"] },
    { g: "Infra", items: ["Docker", "AWS", "Terraform", "CI / CD"] },
  ],
  exp: [
    { y: t("2024 — hoy", "2024 — now"), r: "Senior Full Stack Engineer", c: t("Empresa A · Remoto", "Company A · Remote"), d: t("Lidero la plataforma de pagos: arquitectura, API y panel para comercios.", "I lead the payments platform: architecture, API and merchant dashboard.") },
    { y: "2022 — 2024", r: "Full Stack Developer", c: t("Empresa B · Ciudad", "Company B · City"), d: t("Construí el editor colaborativo y su infraestructura en tiempo real.", "Built the collaborative editor and its real-time infrastructure.") },
    { y: "2020 — 2022", r: "Frontend Developer", c: t("Estudio C · Ciudad", "Studio C · City"), d: t("Sitios y aplicaciones para clientes; inicié el sistema de diseño del estudio.", "Client sites and apps; started the studio design system.") },
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
  writing: [
    { d: "04.2026", t: t("Por qué a nadie le importa tu AUC", "Why nobody cares about your AUC"), k: t("Artículo", "Article") },
    { d: "11.2025", t: t("Validación temporal: las fugas que no ves", "Temporal validation: the leaks you don’t see"), k: "Notebook" },
    { d: "07.2025", t: t("Recomendadores de dos torres en la práctica", "Two-tower recommenders in practice"), k: t("Charla · Conf. datos", "Talk · Data conf") },
    { d: "02.2024", t: t("Pronósticos jerárquicos con LightGBM", "Hierarchical forecasting with LightGBM"), k: "Preprint" },
  ],
  projects: [
    { title: t("Predicción de abandono", "Churn prediction"), sum: t("Modelo de churn con explicaciones por cliente para el equipo comercial.", "Churn model with per-customer explanations for the sales team."), stack: ["XGBoost", "SHAP", "dbt"], year: "2026", metric: "AUC 0.91" },
    { title: t("Motor de recomendaciones", "Recommendation engine"), sum: t("Embeddings de dos torres para un catálogo de 2 M artículos.", "Two-tower embeddings for a 2M-item catalog."), stack: ["PyTorch", "FAISS", "Spark"], year: "2025", metric: "+18% CTR" },
    { title: t("Pronóstico de demanda", "Demand forecasting"), sum: t("Pronósticos jerárquicos semanales para 1.200 tiendas.", "Weekly hierarchical forecasts for 1,200 stores."), stack: ["LightGBM", "Prophet", "SQL"], year: "2024", metric: "MAPE 6.2%" },
    { title: t("Plataforma MLOps", "MLOps platform"), sum: t("Entrenamiento, registro y despliegue reproducibles.", "Reproducible training, registry and deployment."), stack: ["Airflow", "MLflow", "FastAPI"], year: "2023", metric: t("12 modelos en prod", "12 models in prod") },
  ],
  stack: [
    { g: t("Lenguajes", "Languages"), items: ["Python", "SQL", "R", "Bash"] },
    { g: t("Modelado", "Modeling"), items: ["scikit-learn", "PyTorch", "XGBoost / LightGBM", "Hugging Face"] },
    { g: t("Datos", "Data"), items: ["Pandas / Polars", "Spark", "dbt", "Airflow"] },
    { g: "MLOps", items: ["MLflow", "Docker", "FastAPI", "AWS SageMaker"] },
  ],
  exp: [
    { y: t("2024 — hoy", "2024 — now"), r: "Senior Data Scientist", c: t("Empresa A · Remoto", "Company A · Remote"), d: t("Modelos de retención y precios; mentor de dos analistas.", "Retention and pricing models; mentor to two analysts.") },
    { y: "2022 — 2024", r: "Machine Learning Engineer", c: t("Empresa B · Ciudad", "Company B · City"), d: t("Sistema de recomendaciones y su pipeline de entrenamiento continuo.", "Recommendation system and its continuous training pipeline.") },
    { y: "2020 — 2022", r: "Data Analyst", c: t("Empresa C · Ciudad", "Company C · City"), d: t("Tableros, pruebas A/B y los primeros modelos de pronóstico.", "Dashboards, A/B tests and the first forecasting models.") },
  ],
  links: ["github", "linkedin", "kaggle", "cv"],
};

export const profiles = { fullstack, data };

/* ---------- Caso de estudio ---------- */
export const caseUi = {
  back: t("Volver al índice", "Back to index"),
  kicker: t("Caso de estudio", "Case study"),
  toc: t("Contenido", "Contents"),
  metric: t("Métrica", "Metric"),
  before: t("Antes", "Before"),
  after: t("Después", "After"),
  next: t("Siguiente caso", "Next case"),
  ds: t("Sistema de diseño", "Design system"),
  light: t("Claro", "Light"),
  dark: t("Oscuro", "Dark"),
  edition: t("Edición", "Edition"),
  eng: t("Ingeniería", "Engineering"),
  dat: t("Datos", "Data"),
};

export const caseFullstack = {
  title: t("Plataforma de pagos", "Payments platform"),
  deck: t(
    "Cómo rediseñamos la conciliación de pagos para 4.000 comercios sin detener el servicio.",
    "How we redesigned payment reconciliation for 4,000 merchants without stopping the service."
  ),
  meta: [
    { k: t("Rol", "Role"), v: t("Líder técnico · Ingeniería", "Tech lead · Engineering") },
    { k: t("Año", "Year"), v: "2026" },
    { k: t("Duración", "Duration"), v: t("7 meses", "7 months") },
    { k: "Stack", v: "Go · PostgreSQL · React · AWS" },
  ],
  figPh: t("captura del panel de conciliación", "reconciliation dashboard screenshot"),
  figCap: t("Panel de conciliación en tiempo casi real.", "Near real-time reconciliation dashboard."),
  heads: [t("Problema", "Problem"), t("Enfoque", "Approach"), t("Arquitectura", "Architecture"), t("Resultados", "Results"), t("Aprendizajes", "Lessons")],
  bodies: [
    t("La conciliación se hacía con scripts nocturnos y hojas de cálculo. Los errores tardaban días en detectarse y soporte recibía cientos de tickets por semana.", "Reconciliation ran on nightly scripts and spreadsheets. Errors took days to surface and support received hundreds of tickets a week."),
    t("Separamos la ingesta de eventos del cálculo de saldos, introdujimos un libro contable de doble entrada y construimos un panel donde cada comercio ve su dinero en tiempo casi real.", "We split event ingestion from balance computation, introduced a double-entry ledger and built a dashboard where every merchant sees their money in near real time."),
    t("Cada movimiento es un asiento inmutable. Los saldos se derivan, nunca se editan; eso hizo triviales las auditorías y eliminó una clase entera de errores.", "Every movement is an immutable entry. Balances are derived, never edited; that made audits trivial and removed a whole class of bugs."),
    t("Tras tres meses en producción, estos fueron los cambios medidos:", "After three months in production, these were the measured changes:"),
    t("Un modelo de datos correcto simplifica más código que cualquier framework. El panel fue la parte visible, pero el libro contable fue lo que eliminó los tickets.", "A correct data model simplifies more code than any framework. The dashboard was the visible part, but the ledger is what killed the tickets."),
  ],
  code: "// ledger/entry.go\ntype Entry struct {\n  ID       uuid.UUID\n  Account  string\n  Amount   decimal.Decimal // + débito / − crédito\n  PostedAt time.Time\n}",
  codeCap: t("Listado 1 — Estructura de un asiento contable.", "Listing 1 — Ledger entry structure."),
  rows: [
    { m: t("Latencia p95 de la API", "API p95 latency"), a: "840 ms", b: "120 ms" },
    { m: t("Tickets de soporte / semana", "Support tickets / week"), a: "310", b: "45" },
    { m: t("Tiempo de conciliación", "Reconciliation time"), a: "24 h", b: "5 min" },
  ],
  quote: t("El panel fue lo visible; el libro contable fue lo que resolvió el problema.", "The dashboard was what people saw; the ledger is what solved the problem."),
  next: t("Editor colaborativo", "Collaborative editor"),
};

export const caseData = {
  title: t("Predicción de abandono", "Churn prediction"),
  deck: t("Un modelo de churn que el equipo comercial entiende, usa y en el que confía.", "A churn model the sales team understands, uses and trusts."),
  meta: [
    { k: t("Rol", "Role"), v: t("Científico de datos", "Data scientist") },
    { k: t("Año", "Year"), v: "2026" },
    { k: t("Duración", "Duration"), v: t("4 meses", "4 months") },
    { k: "Stack", v: "Python · XGBoost · SHAP · dbt" },
  ],
  figPh: t("curva ROC / gráfico SHAP", "ROC curve / SHAP plot"),
  figCap: t("Importancia de variables (SHAP) sobre el conjunto de validación.", "Feature importance (SHAP) on the validation set."),
  heads: [t("Problema", "Problem"), t("Enfoque", "Approach"), t("Modelo", "Model"), t("Resultados", "Results"), t("Aprendizajes", "Lessons")],
  bodies: [
    t("El 9% de los clientes cancelaba cada trimestre y el equipo comercial solo se enteraba cuando ya era tarde para actuar.", "9% of customers churned every quarter and the sales team only found out when it was too late to act."),
    t("Construimos variables de comportamiento con dbt, entrenamos un modelo de gradient boosting con validación temporal y generamos explicaciones SHAP por cliente para priorizar llamadas.", "We built behavioral features with dbt, trained a gradient boosting model with temporal validation and generated per-customer SHAP explanations to prioritize calls."),
    t("Validación por ventanas de tiempo para evitar fuga de información, calibración de probabilidades y un umbral elegido según la capacidad real del equipo comercial.", "Time-window validation to avoid leakage, probability calibration and a threshold chosen from the real capacity of the sales team."),
    t("Evaluado sobre el trimestre siguiente, fuera de muestra:", "Evaluated on the following quarter, out of sample:"),
    t("La métrica que importó no fue el AUC, sino cuántas llamadas terminaron en retención. Diseñar la explicación fue tan importante como entrenar el modelo.", "The metric that mattered was not AUC, but how many calls ended in retention. Designing the explanation mattered as much as training the model."),
  ],
  code: "model = xgb.XGBClassifier(\n    n_estimators=600, max_depth=5,\n    learning_rate=0.03, subsample=0.8,\n)\nmodel.fit(X_train, y_train,\n          eval_set=[(X_val, y_val)])\nexplainer = shap.TreeExplainer(model)",
  codeCap: t("Listado 1 — Entrenamiento y explicador.", "Listing 1 — Training and explainer."),
  rows: [
    { m: "AUC-ROC", a: "0.74", b: "0.91" },
    { m: t("Precisión @ top 10%", "Precision @ top 10%"), a: "0.31", b: "0.62" },
    { m: t("Churn trimestral", "Quarterly churn"), a: "9.0%", b: "6.8%" },
  ],
  quote: t("Un modelo que nadie entiende es un modelo que nadie usa.", "A model nobody understands is a model nobody uses."),
  next: t("Motor de recomendaciones", "Recommendation engine"),
};

export const caseProfiles = { fullstack: caseFullstack, data: caseData };

export const siteContent = { ui, fullstack, data, caseUi, caseFullstack, caseData };
export type SiteContent = typeof siteContent;
