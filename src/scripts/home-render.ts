// Bloques del home (trabajo, sobre mí, investigación, trayectoria, contacto).
// Funciones puras (string → HTML) compartidas por el prerender de Astro
// (`set:html`) y el re-render en cliente (cambio de edición / datos vivos),
// para no mantener dos copias del mismo marcado.

import { icon } from "../utils/icons";

type Any = Record<string, any>;

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const kicker = "font-mono text-[11px] tracking-[0.12em] uppercase text-ink-2";
const secondary = "inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase pb-1.25 border-b border-rule no-underline text-ink-2 whitespace-nowrap hover:text-ink hover:border-rule";
const ext = icon("arrow-up-right", "size-3.5");
const arrow = icon("arrow-right", "size-4 text-accent");

/** Fila de grupo de certificados (§ 03), compartida con el render en cliente. */
export const certRowClass = "grid grid-cols-[minmax(0,1fr)_auto] gap-x-5 gap-y-2 px-3 -mx-3 py-5 border-b border-rule no-underline min-h-11 transition-colors hover:bg-accent hover:text-paper [&:hover_*]:text-paper";

/* ---------- § 00 — Hero: encabezado de release + último release ---------- */

const releaseNo = (pr: Any) => String(pr?.no ?? "").replace(/^0+/, "");
const releaseVersion = (pr: Any) => `${pr?.year ?? ""}${releaseNo(pr) ? `.${releaseNo(pr)}` : ""}`;
const channelOf = (profile: string, ui: Any) => (profile === "data" ? ui.dat : ui.eng);

function releaseTags(pr: Any) {
  return (pr.stack || []).map((s: string) => `<span class="mg-tag" translate="no">${esc(s)}</span>`).join("");
}

/** Hero: identidad y acciones a la izquierda; a la derecha el escenario de la
 *  mascota ([data-mascot-slot]). La mascota vive fuera del hero (fija, mascot.ts)
 *  y se posa sobre este hueco hasta que el scroll la lleva a la esquina. */
export function releaseHeroHtml(projects: Any[], ui: Any, opts: {
  caseHref: string; cvUrl: string; name: string; role: string; availability: string; location: string; intro: string;
  profile: string; counts: Record<string, number>;
}) {
  const version = releaseVersion(projects?.[0] ?? {});
  const words = String(opts.name).trim().split(/\s+/);
  const cut = Math.ceil(words.length / 2);
  const nameLines = [words.slice(0, cut).join(" "), words.slice(cut).join(" ")].filter(Boolean);
  const tab = (key: "fullstack" | "data", label: string, n: number) =>
    `<button type="button" data-release-profile="${key}" aria-pressed="${opts.profile === key}" class="mg-release-tab">`
    + (opts.profile === key ? `<span aria-hidden="true" class="size-1.5 bg-signal"></span>` : "")
    + `${esc(label)}<span class="tabular-nums">${n}</span></button>`;
  // Todo el hero cabe en la primera pantalla (lg): tamaños atados también al alto (vh).
  const left = `<div class="flex min-h-0 flex-col py-[clamp(20px,3.5vh,40px)] lg:pr-[clamp(24px,3.5vw,56px)]">`
    + `<div class="flex flex-1 flex-col justify-center gap-[clamp(12px,2.2vh,24px)]">`
    + `<p class="font-mono text-[11px] tracking-[0.14em] uppercase text-accent m-0">${esc(ui.relOf)}</p>`
    + `<h1 data-rise class="font-display font-semibold text-[clamp(36px,min(4.6vw,9vh),72px)] leading-[0.92] tracking-[-0.045em] uppercase m-0">`
    + nameLines.map((line) => `<span class="block lg:whitespace-nowrap">${esc(line)}</span>`).join("")
    + `</h1>`
    + `<p class="font-mono text-[12px] leading-[1.6] tracking-[0.08em] uppercase text-ink-2 m-0">${esc(opts.role)} · ${esc(opts.location)}</p>`
    + `<p class="text-[clamp(16px,min(1.35vw,2.4vh),20px)] leading-[1.5] text-ink-2 m-0 max-w-[50ch] text-pretty">${esc(opts.intro)}</p>`
    + `<div class="flex flex-wrap gap-2.5 pt-1">`
    + `<a href="${esc(opts.caseHref)}" class="mg-btn-solid">${esc(ui.readCase)}${icon("arrow-right", "size-4")}</a>`
    + `<a id="hero-cv" href="${esc(opts.cvUrl)}" class="mg-btn-ghost">${esc(ui.cv)}${icon("arrow-down", "size-4")}</a>`
    + `</div></div>`
    + `<div class="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 pt-4 border-t border-rule">`
    + (version ? `<p class="m-0 font-mono text-[11px] tracking-[0.1em] uppercase text-ink-2">${esc(ui.relVersion)} <span class="text-accent tabular-nums">v${esc(version)}</span></p>` : "")
    + `<div class="flex flex-wrap gap-2" role="group" aria-label="${esc(ui.relChannels)}">${tab("fullstack", ui.eng, opts.counts.fullstack || 0)}${tab("data", ui.dat, opts.counts.data || 0)}</div>`
    + `</div></div>`;
  // Escenario de la mascota: el panel entero es el marco; el hueco cuadrado se
  // ajusta al alto disponible y abajo van las acciones (mascot.ts las escucha).
  const acts: [string, string][] = [["wave", ui.actWave], ["think", ui.actThink], ["surprise", ui.actSurprise], ["shy", ui.actShy], ["sleep", ui.actSleep]];
  const right = `<div class="flex min-h-0 flex-col border-t border-rule lg:border-t-0 lg:border-l">`
    + `<div class="flex items-center justify-between gap-4 px-[clamp(16px,2vw,28px)] pt-4 font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-2">`
    + `<span>${esc(ui.mascotFig)}</span>`
    + `<span>${esc(ui.mascotMood)} · <span data-mascot-mood class="text-accent"></span></span></div>`
    + `<div class="flex min-h-0 flex-1 items-center justify-center p-3">`
    + `<div data-mascot-slot aria-hidden="true" class="aspect-square w-[min(100%,calc(100svh-17rem),540px)]"></div>`
    + `</div>`
    + `<div class="flex flex-wrap justify-center gap-1.5 px-[clamp(16px,2vw,28px)] pb-4">`
    + acts.map(([k, l]) => `<button type="button" data-mascot-act="${k}" class="mg-chip">${esc(l)}</button>`).join("")
    + `</div></div>`;
  return `<div class="grid min-h-0 flex-1 grid-cols-1 lg:grid-cols-[1.3fr_1fr]">${left}${right}</div>`;
}

/* ---------- § 01 — Trabajo: destacado + filas desplegables (5.5) ---------- */

function codeLinks(pr: Any, ui: Any) {
  const links = pr.links || {};
  return (links.repo ? `<a href="${esc(links.repo)}" target="_blank" rel="noreferrer" class="${secondary}">${esc(ui.code)}${ext}</a>` : "")
    + (links.demo ? `<a href="${esc(links.demo)}" target="_blank" rel="noreferrer" class="${secondary}">Demo${ext}</a>` : "");
}

export function workHtml(projects: Any[], ui: Any, opts: { caseHref: string; open: number; profile: string; counts: Record<string, number>; cvUrl: string }) {
  if (!projects.length) return "";
  const rest = projects;
  const channel = channelOf(opts.profile, ui);
  const sideLink = "flex items-center justify-between gap-3 py-3 border-b border-rule no-underline font-mono text-[11px] tracking-[0.08em] uppercase text-ink-2 hover:text-accent";
  const side = `<aside class="min-w-0 border-b border-rule pb-6 lg:border-b-0 lg:border-r lg:pr-8 lg:sticky lg:top-24 lg:self-start">`
    + `<h3 class="mg-label m-0 pb-3 border-b border-rule">${esc(ui.relChannels)}</h3>`
    + `<div class="flex flex-col">`
    + ([["fullstack", ui.eng], ["data", ui.dat]] as [string, string][]).map(([key, label]) =>
      `<button type="button" data-release-profile="${key}" aria-pressed="${opts.profile === key}" class="flex items-center justify-between gap-3 py-3.5 px-0 border-0 border-b border-rule bg-transparent font-mono text-[12px] tracking-[0.08em] uppercase text-ink cursor-pointer hover:text-accent aria-pressed:text-accent">`
      + `<span class="flex items-center gap-2">${opts.profile === key ? `<span aria-hidden="true" class="size-1.5 bg-signal"></span>` : ""}${esc(label)}</span><span class="tabular-nums">${opts.counts[key] || 0}</span></button>`).join("")
    + `</div>`
    + `<h3 class="mg-label m-0 mt-7 pb-3 border-b border-rule">${esc(ui.relArtifacts)}</h3>`
    + `<a id="work-cv" href="${esc(opts.cvUrl)}" class="${sideLink}"><span>${esc(ui.cvFull)}</span>${icon("arrow-down", "size-3.5")}</a>`
    + `<a href="#consola" class="${sideLink}"><span>${esc(ui.relConsole)}</span><span class="text-accent">${esc(ui.relLive)}</span></a>`
    + `<h3 class="mg-label m-0 mt-7 pb-3 border-b border-rule">${esc(ui.relStatus)}</h3>`
    + `<div class="flex items-center justify-between gap-3 py-3 border-b border-rule font-mono text-[11px] tracking-[0.08em] uppercase text-ink-2"><span>${esc(ui.relContent)}</span><span>${esc(ui.relSample)}</span></div>`
    + `</aside>`;
  const head = `<div class="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 pb-3 border-b border-rule ${kicker}">`
    + `<span>${esc(ui.relList)}</span><span>${rest.length} ${esc(ui.relReleases)}</span></div>`;
  const rows = rest.map((pr, i) => {
    const open = opts.open === i;
    const id = `work-row-${i}`;
    const detail = [{ k: ui.problem, v: pr.problem }, { k: ui.approach, v: pr.approach }, { k: ui.result, v: pr.result }].filter((c) => c.v);
    return `<div class="border-b border-rule">`
      + `<button type="button" data-work-row="${i}" aria-expanded="${open}" aria-controls="${id}" class="group w-full grid grid-cols-[minmax(0,1fr)_auto] md:grid-cols-[104px_minmax(0,1fr)_170px_24px] gap-x-5 gap-y-3 items-start text-left py-5 px-3 -mx-3 m-0 border-0 bg-transparent text-ink cursor-pointer transition-colors hover:bg-paper-2">`
      + `<span class="col-start-1 row-start-1 md:col-start-1 md:row-start-1 md:row-span-2 font-mono text-[12px] leading-tight text-accent">v${esc(releaseVersion(pr))}<span class="mt-1.5 block text-[10px] tracking-[0.08em] uppercase text-ink-2">${esc(pr.no)} · ${esc(channel)}</span></span>`
      + `<span class="col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1 md:row-span-2 min-w-0">`
      + `<span class="flex flex-wrap items-baseline gap-x-3 gap-y-1"><span data-row-title class="font-display font-medium text-[clamp(22px,2.2vw,32px)] leading-[1.05] tracking-[-0.03em] uppercase">${esc(pr.title)}</span><span data-demo class="mg-demo">${esc(ui.demo)}</span></span>`
      + `<span class="block mt-1 text-[14px] leading-[1.55] text-ink-2 max-w-[64ch]">${esc(pr.sum)}</span>`
      + `<span class="flex flex-wrap gap-1.5 mt-2.5">${releaseTags(pr)}</span>`
      + `</span>`
      + `<span class="col-span-2 row-start-3 md:col-span-1 md:col-start-3 md:row-start-1 md:row-span-2 md:self-center md:text-right font-mono text-[12px] text-accent">${esc(pr.metric || "")}</span>`
      + `<span aria-hidden="true" class="col-start-2 row-start-1 justify-self-end md:col-start-4 md:row-start-1 md:row-span-2 md:self-center mg-toggle-sign text-ink ${open ? "border-accent" : ""}">${icon(open ? "minus" : "plus", "size-3.5")}</span>`
      + `</button>`
      + `<div id="${id}" data-panel ${open ? "" : "hidden"} class="pb-7 md:pl-[124px] flex flex-col gap-5">`
      + (detail.length ? `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-y-5 gap-x-[clamp(20px,3vw,40px)]">`
        + detail.map((c) => `<div class="flex flex-col gap-1.5 pt-2.5 border-t border-rule"><span class="font-mono text-[11px] tracking-[0.08em] uppercase text-accent">${esc(c.k)}</span><p class="m-0 text-[15px] leading-[1.6] text-pretty">${esc(c.v)}</p></div>`).join("")
        + `</div>` : "")
      + `<div class="flex flex-wrap items-baseline gap-x-7 gap-y-3">`
      + (pr.role ? `<span class="${kicker}">${esc(ui.roleL)} · <span class="text-ink">${esc(pr.role)}</span></span>` : "")
      + `<a href="${esc(opts.caseHref)}" class="mg-btn-primary">${esc(ui.readCase)}${arrow}</a>${codeLinks(pr, ui)}</div>`
      + `</div></div>`;
  }).join("");
  const list = rest.length
    ? `${head}${rows}`
    : `<p class="m-0 py-5 border-b border-rule font-mono text-[12px] text-ink-2">${esc(ui.relEmpty)}</p>`;
  return `<div class="grid grid-cols-1 lg:grid-cols-[clamp(220px,22vw,300px)_minmax(0,1fr)] gap-x-[clamp(32px,5vw,72px)] gap-y-8 items-start">${side}<div class="min-w-0">${list}</div></div>`;
}

/* ---------- § 02 — Sobre mí: capital, cita, principios, ahora mismo ---------- */

export function aboutHtml(about: Any[]) {
  return about.map((a, i) => {
    const text = String(a.t ?? "");
    const sup = `<sup class="font-mono text-[11px] text-accent ml-0.5">${esc(a.n)}</sup>`;
    if (i > 0 || !text) return `<p class="text-body-serif text-ink-2 m-0 text-pretty">${esc(text)}${sup}</p>`;
    return `<p class="text-lead font-medium m-0 text-pretty">${esc(text)}${sup}</p>`;
  }).join("");
}

export function factsHtml(facts: Any[]) {
  return facts.map((f) => `<div class="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-[11px] border-b border-rule items-baseline">`
    + `<dt class="${kicker}">${esc(f.k)}</dt><dd class="m-0 text-[15px]">${esc(f.v)}</dd></div>`).join("");
}

export function quoteHtml(p: Any) {
  if (!p.quote) return "";
  return `<span aria-hidden="true" class="font-display font-semibold text-[clamp(44px,4.4vw,68px)] leading-[0.8] text-accent">“</span>`
    + `<div class="flex flex-col gap-4"><p data-rise class="m-0 font-sans font-medium text-quote tracking-[-0.02em] text-balance">${esc(p.quote)}</p>`
    + (p.quoteBy ? `<span class="${kicker}">— ${esc(p.quoteBy)}</span>` : "") + `</div>`;
}

export function principlesHtml(p: Any, ui: Any) {
  const list: Any[] = p.principles || [];
  if (!list.length) return "";
  const last = list[list.length - 1]?.n?.replace(".", "") ?? "";
  return `<div class="flex justify-between gap-3 pb-3 border-b border-rule ${kicker}"><span>${esc(ui.prinT)}</span><span>I — ${esc(last)}</span></div>`
    + `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-8">`
    + list.map((x) => `<div class="flex flex-col gap-2.5 py-[22px] border-b border-rule"><span class="font-mono text-[12px] text-accent">${esc(x.n)}</span>`
      + `<span class="font-display font-medium text-[17px] leading-[1.25] tracking-[-0.015em] uppercase">${esc(x.t)}</span><span class="text-[15px] leading-[1.55] text-ink-2">${esc(x.d)}</span></div>`).join("")
    + `</div>`;
}

/** "2026-09" → "sept 2026" / "Sep 2026". */
export function monthLabel(ym: string, lang: string) {
  if (!/^\d{4}-\d{2}/.test(ym || "")) return ym || "";
  return new Intl.DateTimeFormat(lang, { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${ym.slice(0, 7)}-15T00:00:00Z`));
}

export function nowHtml(p: Any, ui: Any, lang: string) {
  const items: Any[] = p.now || [];
  if (!items.length) return "";
  return `<div class="flex flex-wrap justify-between gap-x-4 gap-y-2 pb-3.5 border-b border-rule">`
    + `<span class="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.12em] uppercase"><span aria-hidden="true" class="w-2 h-2 bg-accent motion-safe:animate-pulse"></span>${esc(ui.nowT)}</span>`
    + (p.nowD ? `<span class="${kicker}">${esc(ui.updated)} ${esc(monthLabel(p.nowD, lang))}</span>` : "") + `</div>`
    + `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-7">`
    + items.map((x) => `<div class="flex flex-col gap-1.5 pt-4 pb-1"><span class="${kicker}">${esc(x.k)}</span><span class="text-[16px] leading-[1.4]">${esc(x.v)}</span></div>`).join("")
    + `</div>`;
}

/* ---------- § 04 — Investigación: filtros + entradas con ficha lateral (5.9 / 5.12) ---------- */

export type PubState = { type: string; year: string; open: string[]; bib: string[] };

/** Acepta la forma local (content.ts) y la mapeada desde la API. */
function normPub(w: Any) {
  return {
    ...w,
    authors: Array.isArray(w.authors) ? w.authors : String(w.authors || "").split(/,\s*/).filter(Boolean),
    pdf: w.pdf ?? w.pdfUrl ?? "",
    tags: w.tags ?? w.keywords ?? [],
    year: String(w.year ?? ""),
  };
}

function bibtexOf(w: Any) {
  const last = String(w.authors[0] || "ref").split(" ").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "");
  const journal = w.type !== "conference";
  return `@${journal ? "article" : "inproceedings"}{${last}${w.year},\n  title  = {${w.title}},\n  author = {${w.authors.join(" and ")}},\n  ${journal ? "journal" : "booktitle"} = {${w.venue}},\n  year   = {${w.year}}${w.doi ? `,\n  doi    = {${String(w.doi).replace(/^https?:\/\/doi\.org\//, "")}}` : ""}\n}`;
}

export function pubsView(pubs: Any[], st: PubState) {
  const all = pubs.map(normPub);
  const byYear = all.filter((w) => st.year === "all" || w.year === st.year);
  const shown = byYear.filter((w) => st.type === "all" || w.type === st.type);
  const years = [...new Set(all.map((w) => w.year))].filter(Boolean).sort().reverse();
  return { all, byYear, shown, years };
}

export function pubFiltersHtml(pubs: Any[], ui: Any, st: PubState) {
  const { byYear, shown, years } = pubsView(pubs, st);
  const n = (t: string) => byYear.filter((w) => w.type === t).length;
  const opt = (attr: string, value: string, active: boolean, label: string, count: number | null, serif: boolean, i: number) =>
    `<button type="button" ${attr}="${esc(value)}" aria-pressed="${active}" data-i="${i}" class="flex items-center gap-1.5 h-8 px-2.5 border font-mono ${serif ? "text-[11px] tracking-[0.08em] uppercase" : "text-[12px]"} cursor-pointer whitespace-nowrap transition-colors ${active ? "bg-accent border-accent text-paper" : "bg-transparent border-rule text-ink-2 hover:text-ink hover:border-rule"}">${esc(label)}${count !== null ? `<span class="tabular-nums opacity-70">${count}</span>` : ""}</button>`;
  const label = (s: string) => `<span class="font-mono text-label uppercase text-ink-2 mr-2">${esc(s)}</span>`;
  const types: [string, string, number][] = [["all", ui.pubAll, byYear.length], ["journal", ui.pubJournal, n("journal")], ["conference", ui.pubConf, n("conference")]];
  const yearOpts: [string, string][] = [["all", ui.pubAllYears || ui.pubAll], ...years.map((y) => [y, y] as [string, string])];
  return `<div class="flex flex-wrap items-center gap-1">${label(ui.pubType)}`
    + types.map(([v, l, c], i) => opt("data-pub-type", v, st.type === v, l, c, true, i)).join("") + `</div>`
    + `<span aria-hidden="true" class="w-px h-4 bg-rule"></span>`
    + `<div class="flex flex-wrap items-center gap-1">${label(ui.pubYear)}`
    + yearOpts.map(([v, l], i) => opt("data-pub-year", v, st.year === v, l, null, false, i)).join("") + `</div>`
    + `<span class="ml-auto font-mono text-[11px] tracking-[0.1em] uppercase text-ink-2">${shown.length} ${shown.length === 1 ? esc(ui.pubOne) : esc(ui.pubMany)}</span>`;
}

export function pubsHtml(pubs: Any[], ui: Any, st: PubState, me: string) {
  const { all, shown } = pubsView(pubs, st);
  if (!shown.length) return `<p class="text-[16px] text-ink-2 py-8 m-0 border-b border-rule">${esc(ui.pubEmpty)}</p>`;
  const action = "inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[0.12em] uppercase pb-1.25 px-0 border-0 border-b border-rule bg-transparent cursor-pointer whitespace-nowrap no-underline hover:border-rule";
  return shown.map((w) => {
    const key = String(w.slug || w.title);
    const open = st.open.includes(key);
    const bib = st.bib.includes(key);
    const no = all.indexOf(w) + 1;
    const meta = [
      { k: ui.pubYear, v: w.year },
      { k: ui.pubPages, v: w.pages },
      { k: ui.pubLang, v: w.language },
    ].filter((m) => m.v);
    const pdfHref = w.pdf && w.pdf !== "#" ? w.pdf : w.doi || "";
    const thumb = `<span class="h-[5px] w-4/5 bg-ink-2 opacity-55"></span><span class="h-[3px] w-[55%] bg-ink-2 opacity-35 mb-1.5"></span>`
      + [100, 100, 90, 100, 70].map((x) => `<span class="h-[2px] bg-rule" style="width:${x}%"></span>`).join("")
      + `<span class="mt-auto font-mono text-[9px] tracking-[0.08em] uppercase text-ink-2">p. 1 · PDF</span>`;
    return `<article class="flex flex-wrap gap-y-5 gap-x-[clamp(20px,3vw,48px)] py-[clamp(24px,3vw,36px)] border-b border-rule">`
      + `<span class="flex-[0_0_36px] font-mono text-[13px] text-accent pt-1">[${no}]</span>`
      + `<div class="flex-[1_1_440px] min-w-0 flex flex-col gap-3">`
      + `<div class="flex flex-wrap items-baseline gap-x-3.5 gap-y-1.5">`
      + (w.featured ? `<span class="font-mono text-[10.5px] tracking-[0.12em] uppercase text-paper bg-accent px-2 py-1">${esc(ui.pubFeatured)}</span>` : "")
      + `<span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-accent">${esc(w.type === "conference" ? ui.pubConf : ui.pubJournal)}</span></div>`
      + `<h3 class="font-display font-medium text-[clamp(18px,1.7vw,24px)] leading-[1.2] tracking-[-0.02em] uppercase m-0 max-w-[40ch] text-balance">${esc(w.title)}</h3>`
      + `<p class="text-[15px] leading-[1.55] m-0 text-ink-2">`
      + w.authors.map((a: string, j: number) => `<span class="${a === me ? "font-semibold text-ink" : ""}">${esc(a)}</span>${j < w.authors.length - 1 ? ", " : ""}`).join("")
      + ` — <span class="text-ink">${esc(w.venue)}</span>, ${esc(w.year)}.</p>`
      + (open ? `<p data-unfold="${esc(key)}" class="text-[15px] leading-[1.65] mt-1 mb-0 max-w-[68ch] pl-4 border-l border-accent text-pretty">${esc(w.abstract)}</p>` : "")
      + (bib ? `<pre data-unfold="${esc(key)}" class="mt-1 mb-0 px-4 py-3.5 bg-paper-2 font-mono text-xs leading-[1.6] overflow-x-auto max-w-[680px]">${esc(bibtexOf(w))}</pre>` : "")
      + `<div class="flex flex-wrap items-baseline gap-x-6 gap-y-2.5 mt-1">`
      + `<button type="button" data-pub-toggle="${esc(key)}" aria-expanded="${open}" class="${action} text-ink">${esc(ui.pubAbs)}${icon(open ? "minus" : "plus", "size-3.5")}</button>`
      + (w.doi ? `<a href="${esc(w.doi)}" target="_blank" rel="noreferrer" class="${action} text-ink-2 hover:text-ink">DOI${ext}</a>` : "")
      + (w.pdf && w.pdf !== "#" ? `<a href="${esc(w.pdf)}" target="_blank" rel="noreferrer" class="${action} text-ink-2 hover:text-ink">PDF${icon("arrow-down", "size-3.5")}</a>` : "")
      + `<button type="button" data-pub-bib="${esc(key)}" aria-expanded="${bib}" class="${action} text-ink-2 hover:text-ink">BibTeX${bib ? " −" : ""}</button>`
      + `<span class="flex flex-wrap gap-x-3 gap-y-1 font-mono text-[11px] text-ink-2">${w.tags.map((t: string) => `<span>#${esc(t)}</span>`).join("")}</span>`
      + `</div></div>`
      + `<aside class="flex-[0_1_300px] min-w-[240px] grid grid-cols-[110px_minmax(0,1fr)] gap-[18px] items-start">`
      + (pdfHref
        ? `<a href="${esc(pdfHref)}" target="_blank" rel="noreferrer" aria-label="PDF — ${esc(w.title)}" data-sheet class="aspect-[3/4] border border-rule bg-paper-2 flex flex-col gap-[5px] px-2.5 py-3 no-underline">${thumb}</a>`
        : `<span aria-hidden="true" class="aspect-[3/4] border border-rule bg-paper-2 flex flex-col gap-[5px] px-2.5 py-3">${thumb}</span>`)
      + `<dl class="m-0 flex flex-col">`
      + meta.map((m) => `<div class="flex flex-col gap-0.5 py-2 border-t border-rule"><dt class="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">${esc(m.k)}</dt><dd class="m-0 text-[14px] leading-[1.35]">${esc(m.v)}</dd></div>`).join("")
      + `</dl></aside></article>`;
  }).join("");
}

/* ---------- § 06 — Directorio A / B / C (5.15) ---------- */

export function directoryHtml(personal: Any, linkIds: string[], ui: Any) {
  const email = String(personal.email || "");
  const socials: Any = personal.socials || {};
  const profiles = linkIds.filter((id) => id !== "cv" && socials[id]).map((id) => socials[id]);
  const head = (l: string, r = "") => `<div class="flex justify-between gap-3 pb-3 border-b border-rule ${kicker}"><span>${l}</span>${r ? `<span>${r}</span>` : ""}</div>`;
  const a = `<div class="flex flex-col">${head(esc(ui.dir), `A — ${esc(ui.mail)}`)}`
    + `<a href="mailto:${esc(email)}" data-mail class="block pt-5 pb-4 font-display font-medium text-[clamp(18px,1.65vw,24px)] leading-[1.15] tracking-[-0.03em] no-underline [overflow-wrap:anywhere] hover:text-accent">${esc(email).replace("@", "@<wbr>")}</a>`
    + `<div class="flex flex-wrap items-baseline gap-x-6 gap-y-2.5 pb-[18px] border-b border-rule">`
    + `<a href="mailto:${esc(email)}" class="mg-btn-primary">${esc(ui.write)}${arrow}</a>`
    + `<button type="button" data-copy="${esc(email)}" data-copied="${esc(ui.copied)}" class="font-mono text-[11px] tracking-[0.12em] uppercase pb-1.25 px-0 border-0 border-b border-rule bg-transparent text-ink-2 cursor-pointer whitespace-nowrap hover:text-ink hover:border-rule">${esc(ui.copy)}</button></div></div>`;
  const b = `<div class="flex flex-col">${head(`B — ${esc(ui.profilesT)}`, String(profiles.length).padStart(2, "0"))}`
    + profiles.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noreferrer" data-dir-row class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b border-rule no-underline">`
      + `<span class="font-display font-medium text-[17px] uppercase leading-[1.2]">${esc(s.label)}</span>`
      + `<span class="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2 whitespace-nowrap">${esc(s.handle)} <span class="text-accent">${ext}</span></span>`
      + (s.note ? `<span class="col-span-full text-[13px] leading-[1.5] text-ink-2">${esc(s.note)}</span>` : "") + `</a>`).join("")
    + (personal.cvUrl ? `<a id="cv-link" href="${esc(personal.cvUrl)}" data-dir-row class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 items-baseline py-3.5 border-b border-rule no-underline"><span class="font-display font-medium text-[17px] uppercase leading-[1.2]">CV</span><span class="inline-flex items-center gap-1.5 font-mono text-xs text-ink-2">PDF <span class="text-accent">${icon("arrow-down", "size-3.5")}</span></span></a>` : "")
    + `</div>`;
  const c = `<div class="flex flex-col">${head(`C — ${esc(ui.loc)}`)}`
    + `<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b border-rule">`
    + `<span class="font-display font-medium text-[17px] uppercase leading-[1.2]">${esc(personal.location)}</span>`
    + `<span class="flex items-baseline gap-2 font-mono text-xs whitespace-nowrap"><span class="text-ink-2">${esc(ui.localTime)}</span><span data-clock="${esc(personal.timezone || "")}" class="tabular-nums">--:--</span></span>`
    + `<span class="col-span-full text-[13px] leading-[1.5] text-ink-2">${esc(personal.hoursNote || ui.hoursNote)}</span></div></div>`;
  return a + b + c;
}

/* ---------- § 05 — Trayectoria: línea de tiempo + formación ---------- */

export function expHtml(exp: Any[], ui: Any) {
  return exp.map((e) => `<div data-tl class="grid grid-cols-[24px_minmax(0,1fr)] gap-x-5">`
    + `<div class="flex flex-col items-center" aria-hidden="true">`
    + `<span class="w-px h-[30px] bg-rule"></span>`
    + `<span data-tl-mark class="w-[11px] h-[11px] border-[1.5px] border-accent flex-none ${e.current ? "bg-accent" : "bg-paper"}"></span>`
    + `<span data-tl-line class="w-px flex-1 bg-rule"></span></div>`
    + `<div class="py-[22px] pb-[34px] flex flex-col gap-2.5">`
    + `<div class="flex flex-wrap items-baseline gap-x-3.5 gap-y-1 font-mono text-[12px]">`
    + `<span class="tabular-nums">${esc(e.y)}</span>`
    + (e.current ? `<span class="text-[10.5px] tracking-[0.12em] uppercase text-accent">● ${esc(ui.actT || "Now")}</span>` : "")
    + (e.dur ? `<span class="text-ink-2">${esc(e.dur)}</span>` : "")
    + `</div>`
    + `<h3 class="font-display font-medium text-[clamp(20px,2vw,28px)] leading-[1.1] tracking-[-0.025em] uppercase mt-1.5 mb-0">${esc(e.r)}</h3>`
    + `<span class="font-mono text-[12px] tracking-[0.06em] text-ink-2">${esc(e.c)}</span>`
    + `<p class="text-[16px] leading-[1.6] mt-1.5 mb-0 max-w-[60ch] text-pretty">${esc(e.d)}</p>`
    + (e.wins || []).map((w: string) =>
      `<p class="grid grid-cols-[22px_minmax(0,1fr)] items-start text-[15px] leading-[1.5] text-ink-2 mt-1 mb-0 max-w-[60ch]"><span class="text-accent pt-[3px]">${icon("arrow-right", "size-3.5")}</span><span>${esc(w)}</span></p>`).join("")
    + ((e.stack || []).length > 0
      ? `<div class="flex flex-wrap gap-1.5 mt-2">${e.stack.map((x: string) => `<span translate="no" class="mg-tag text-ink-2">${esc(x)}</span>`).join("")}</div>`
      : "")
    + `</div></div>`).join("");
}

export function eduHtml(edu: Any[]) {
  return edu.map((e) => `<div class="pb-8 mb-8 border-b border-rule last:border-b-0 last:mb-0">`
    + `<div class="font-mono text-[12px] text-ink-2 tabular-nums">${esc(e.p)}</div>`
    + `<div class="font-display font-medium text-[19px] leading-[1.2] tracking-[-0.02em] uppercase mt-2">${esc(e.d)}</div>`
    + `<div class="text-[15px] text-ink mt-1.5">${esc(e.s)}</div>`
    + `<p class="text-[14px] leading-[1.55] text-ink-2 mt-2.5 mb-0 max-w-[46ch]">${esc(e.desc)}</p></div>`).join("");
}
