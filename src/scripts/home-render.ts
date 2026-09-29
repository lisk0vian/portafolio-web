// Bloques del home con los componentes Marginalia 5.5, 5.13–5.16.
// Funciones puras (string → HTML) compartidas por el prerender de Astro
// (`set:html`) y el re-render en cliente (cambio de edición / datos vivos),
// para no mantener dos copias del mismo marcado.

type Any = Record<string, any>;

export const esc = (s: unknown) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

const kicker = "font-mono text-[11px] tracking-[0.08em] uppercase text-ink-2";
const secondary = "font-mono text-xs tracking-[0.08em] uppercase pb-1.25 border-b border-rule no-underline text-ink-2 whitespace-nowrap hover:text-ink hover:border-ink";

/* ---------- § 01 — Trabajo: destacado + filas desplegables (5.5) ---------- */

function codeLinks(pr: Any, ui: Any) {
  const links = pr.links || {};
  return (links.repo ? `<a href="${esc(links.repo)}" target="_blank" rel="noreferrer" class="${secondary}">${esc(ui.code)} ↗</a>` : "")
    + (links.demo ? `<a href="${esc(links.demo)}" target="_blank" rel="noreferrer" class="${secondary}">Demo ↗</a>` : "");
}

export function workHtml(projects: Any[], ui: Any, opts: { caseHref: string; open: number }) {
  if (!projects.length) return "";
  const [feat, ...rest] = projects;
  const figures: Any[] = feat.figures || [];
  const table = figures.length
    ? `<div class="flex-[1_1_320px] min-w-0 flex flex-col border-t border-ink">`
      + `<div class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 py-2.5 border-b border-rule ${kicker}"><span>${esc(ui.metric)}</span><span class="text-right">${esc(ui.before)}</span><span class="text-right">${esc(ui.after)}</span></div>`
      + figures.map((f) => `<div class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)] gap-3 py-[18px] border-b border-rule items-baseline">`
        + `<span class="text-[15px] leading-[1.4]">${esc(f.k)}</span>`
        + `<span class="font-mono text-sm text-ink-2 text-right line-through decoration-rule">${esc(f.a)}</span>`
        + `<span class="font-serif text-[clamp(22px,2vw,26px)] leading-none text-accent text-right tracking-[-0.01em]">${esc(f.b)}</span></div>`).join("")
      + (feat.cap ? `<p class="font-serif italic text-[15px] text-ink-2 mt-3 mb-0"><strong class="font-semibold not-italic text-ink">${esc(ui.tab)} 1 —</strong> ${esc(feat.cap)}</p>` : "")
      + `</div>`
    : "";
  const featured = `<article class="flex flex-wrap gap-y-10 gap-x-[clamp(32px,5vw,80px)] pt-[clamp(28px,3vw,40px)] pb-[clamp(36px,4vw,56px)] border-t border-ink">`
    + `<div class="flex-[1.4_1_460px] min-w-0 flex flex-col gap-5">`
    + `<div class="flex flex-wrap items-baseline gap-x-[18px] gap-y-1.5"><span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-paper bg-accent px-[7px] py-0.5">${esc(ui.featured)}</span>`
    + `<span class="${kicker}">${[feat.no, feat.year, feat.role].filter(Boolean).map(esc).join(" · ")}</span></div>`
    + `<h3 class="font-serif font-normal text-h2 m-0 text-balance">${esc(feat.title)}</h3>`
    + (feat.problem ? `<p class="font-serif italic font-light text-lead text-ink-2 m-0 max-w-[42ch] text-pretty">${esc(feat.problem)}</p>` : "")
    + `<p class="text-base leading-[1.65] m-0 max-w-[58ch] text-pretty">${esc(feat.approach || feat.sum)}</p>`
    + `<div class="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-ink-2">${(feat.stack || []).map((s: string) => `<span translate="no">${esc(s)}</span>`).join("")}</div>`
    + `<div class="flex flex-wrap items-baseline gap-x-7 gap-y-3 mt-1.5"><a href="${esc(opts.caseHref)}" class="mg-btn-primary text-[21px]">${esc(ui.readCase)}<span class="font-mono not-italic text-sm text-accent">→</span></a>${codeLinks(feat, ui)}</div>`
    + `</div>${table}</article>`;

  const cols = "grid grid-cols-[minmax(0,1fr)_52px_128px_20px] gap-4";
  const head = `<div class="flex flex-wrap gap-x-7 gap-y-2 pt-3 pb-2.5 border-b border-rule ${kicker}">`
    + `<span class="flex-[1_1_300px] pl-12">${esc(ui.moreProjects)}</span>`
    + `<span class="hidden sm:grid flex-[0_1_480px] ${cols}"><span>Stack</span><span>${esc(ui.colYear)}</span><span class="text-right">${esc(ui.colResult)}</span><span></span></span></div>`;
  const rows = rest.map((pr, j) => {
    const i = j + 1;
    const open = opts.open === i;
    const id = `work-row-${i}`;
    const detail = [{ k: ui.problem, v: pr.problem }, { k: ui.approach, v: pr.approach }, { k: ui.result, v: pr.result }].filter((c) => c.v);
    return `<div class="border-b border-rule">`
      + `<button type="button" data-work-row="${i}" aria-expanded="${open}" aria-controls="${id}" class="w-full flex flex-wrap gap-x-7 gap-y-2.5 items-baseline py-5 m-0 border-0 bg-transparent text-ink text-left cursor-pointer transition-colors hover:text-accent">`
      + `<span class="flex-[1_1_300px] min-w-0 grid grid-cols-[48px_minmax(0,1fr)] items-baseline"><span class="font-mono text-xs text-ink-2">${esc(pr.no)}</span>`
      + `<span class="flex flex-col gap-1 min-w-0"><span class="font-serif text-[clamp(22px,2vw,27px)] leading-[1.15] tracking-[-0.01em]">${esc(pr.title)}</span><span class="text-sm leading-[1.5] text-ink-2">${esc(pr.sum)}</span></span></span>`
      + `<span class="flex-[0_1_480px] min-w-0 ${cols} items-baseline font-mono text-xs pl-12 sm:pl-0">`
      + `<span translate="no" class="text-ink-2 whitespace-nowrap overflow-hidden text-ellipsis">${(pr.stack || []).map(esc).join(" · ")}</span>`
      + `<span class="text-ink">${esc(pr.year)}</span><span class="text-accent text-right whitespace-nowrap">${esc(pr.metric)}</span>`
      + `<span aria-hidden="true" class="mg-toggle-sign self-center text-ink ${open ? "border-accent" : ""}">${open ? "−" : "+"}</span></span></button>`
      + `<div id="${id}" ${open ? "" : "hidden"} class="pb-7 pl-12 flex flex-col gap-5">`
      + (detail.length ? `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,220px),1fr))] gap-y-5 gap-x-[clamp(20px,3vw,40px)]">`
        + detail.map((c) => `<div class="flex flex-col gap-1.5 pt-2.5 border-t border-rule"><span class="font-mono text-[11px] tracking-[0.08em] uppercase text-accent">${esc(c.k)}</span><p class="m-0 text-[15px] leading-[1.6] text-pretty">${esc(c.v)}</p></div>`).join("")
        + `</div>` : "")
      + `<div class="flex flex-wrap items-baseline gap-x-7 gap-y-3">`
      + (pr.role ? `<span class="${kicker}">${esc(ui.roleL)} · <span class="text-ink">${esc(pr.role)}</span></span>` : "")
      + `<a href="${esc(opts.caseHref)}" class="mg-btn-primary text-[19px]">${esc(ui.readCase)}<span class="font-mono not-italic text-[13px] text-accent">→</span></a>${codeLinks(pr, ui)}</div>`
      + `</div></div>`;
  }).join("");
  return featured + (rest.length ? `<div class="border-t border-ink">${head}${rows}</div>` : "");
}

/* ---------- § 02 — Sobre mí: capital, cita, principios, ahora mismo ---------- */

export function aboutHtml(about: Any[]) {
  return about.map((a, i) => {
    const text = String(a.t ?? "");
    const sup = `<sup class="font-mono text-[11px] text-accent ml-0.5">${esc(a.n)}</sup>`;
    if (i > 0 || !text) return `<p class="font-serif text-body-serif m-0 text-pretty">${esc(text)}${sup}</p>`;
    return `<p class="font-serif text-body-serif m-0 text-pretty"><span aria-hidden="true" class="float-left font-display text-[4.6em] leading-[0.8] mt-[0.06em] mr-[0.1em] -ml-[0.03em] text-accent">${esc(text.charAt(0))}</span><span class="sr-only">${esc(text.charAt(0))}</span>${esc(text.slice(1))}${sup}</p>`;
  }).join("");
}

export function factsHtml(facts: Any[]) {
  return facts.map((f) => `<div class="grid grid-cols-[110px_minmax(0,1fr)] gap-3 py-[11px] border-b border-rule items-baseline">`
    + `<dt class="${kicker}">${esc(f.k)}</dt><dd class="m-0 font-serif text-[17px]">${esc(f.v)}</dd></div>`).join("");
}

export function quoteHtml(p: Any) {
  if (!p.quote) return "";
  return `<span aria-hidden="true" class="font-serif text-[clamp(52px,5vw,76px)] leading-[0.7] text-accent">“</span>`
    + `<div class="flex flex-col gap-3.5"><p class="m-0 font-serif italic font-light text-quote tracking-[-0.01em] text-balance">${esc(p.quote)}</p>`
    + (p.quoteBy ? `<span class="${kicker}">— ${esc(p.quoteBy)}</span>` : "") + `</div>`;
}

export function principlesHtml(p: Any, ui: Any) {
  const list: Any[] = p.principles || [];
  if (!list.length) return "";
  const last = list[list.length - 1]?.n?.replace(".", "") ?? "";
  return `<div class="flex justify-between gap-3 pb-3 border-b border-ink ${kicker}"><span>${esc(ui.prinT)}</span><span>I — ${esc(last)}</span></div>`
    + `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,240px),1fr))] gap-x-8">`
    + list.map((x) => `<div class="flex flex-col gap-2.5 py-[22px] border-b border-rule"><span class="font-serif text-[15px] text-accent">${esc(x.n)}</span>`
      + `<span class="font-serif text-[21px] leading-[1.2] tracking-[-0.005em]">${esc(x.t)}</span><span class="text-[15px] leading-[1.55] text-ink-2">${esc(x.d)}</span></div>`).join("")
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
    + `<span class="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.08em] uppercase"><span aria-hidden="true" class="w-2 h-2 rounded-full bg-accent"></span>${esc(ui.nowT)}</span>`
    + (p.nowD ? `<span class="${kicker}">${esc(ui.updated)} ${esc(monthLabel(p.nowD, lang))}</span>` : "") + `</div>`
    + `<div class="grid grid-cols-[repeat(auto-fit,minmax(min(100%,200px),1fr))] gap-x-7">`
    + items.map((x) => `<div class="flex flex-col gap-1.5 pt-4 pb-1"><span class="${kicker}">${esc(x.k)}</span><span class="font-serif text-lg leading-[1.35]">${esc(x.v)}</span></div>`).join("")
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
    `<span class="flex items-baseline ${serif ? "gap-2.5" : "gap-2"}">${i ? `<span class="${serif ? "font-serif" : ""} text-ink-2" aria-hidden="true">/</span>` : ""}`
    + `<button type="button" ${attr}="${esc(value)}" aria-pressed="${active}" class="${serif ? "font-serif italic text-[18px]" : "font-mono text-xs"} py-0.5 px-0 border-0 bg-transparent cursor-pointer whitespace-nowrap ${active ? "text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px]" : "text-ink-2 hover:text-ink"}">${esc(label)}${count !== null ? `<sup class="font-mono not-italic text-[10px] ml-0.5">${count}</sup>` : ""}</button></span>`;
  const label = (s: string) => `<span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-2 mr-1">${esc(s)}</span>`;
  const types: [string, string, number][] = [["all", ui.pubAll, byYear.length], ["journal", ui.pubJournal, n("journal")], ["conference", ui.pubConf, n("conference")]];
  const yearOpts: [string, string][] = [["all", ui.pubAllYears || ui.pubAll], ...years.map((y) => [y, y] as [string, string])];
  return `<div class="flex flex-wrap items-baseline gap-x-2.5 gap-y-1.5">${label(ui.pubType)}`
    + types.map(([v, l, c], i) => opt("data-pub-type", v, st.type === v, l, c, true, i)).join("") + `</div>`
    + `<span aria-hidden="true" class="w-px h-4 bg-rule"></span>`
    + `<div class="flex flex-wrap items-baseline gap-x-2 gap-y-1.5">${label(ui.pubYear)}`
    + yearOpts.map(([v, l], i) => opt("data-pub-year", v, st.year === v, l, null, false, i)).join("") + `</div>`
    + `<span class="ml-auto font-serif italic text-[15px] text-ink-2">${shown.length} ${shown.length === 1 ? esc(ui.pubOne) : esc(ui.pubMany)}</span>`;
}

export function pubsHtml(pubs: Any[], ui: Any, st: PubState, me: string) {
  const { all, shown } = pubsView(pubs, st);
  if (!shown.length) return `<p class="font-serif italic text-[19px] text-ink-2 py-8 m-0 border-b border-rule">${esc(ui.pubEmpty)}</p>`;
  const action = "font-mono text-xs tracking-[0.08em] uppercase pb-1.25 px-0 border-0 border-b border-rule bg-transparent cursor-pointer whitespace-nowrap no-underline hover:border-ink";
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
      + (w.featured ? `<span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-paper bg-accent px-[7px] py-0.5">${esc(ui.pubFeatured)}</span>` : "")
      + `<span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-accent">${esc(w.type === "conference" ? ui.pubConf : ui.pubJournal)}</span></div>`
      + `<h3 class="font-serif font-normal text-[clamp(22px,2vw,28px)] leading-[1.18] tracking-[-0.01em] m-0 max-w-[40ch] text-balance">${esc(w.title)}</h3>`
      + `<p class="font-serif text-[17px] leading-[1.5] m-0 text-ink-2">`
      + w.authors.map((a: string, j: number) => `<span class="${a === me ? "font-semibold text-ink" : ""}">${esc(a)}</span>${j < w.authors.length - 1 ? ", " : ""}`).join("")
      + ` — <em>${esc(w.venue)}</em>, ${esc(w.year)}.</p>`
      + (open ? `<p class="text-[15px] leading-[1.65] mt-1 mb-0 max-w-[68ch] pl-4 border-l border-accent text-pretty">${esc(w.abstract)}</p>` : "")
      + (bib ? `<pre class="mt-1 mb-0 px-4 py-3.5 bg-paper-2 font-mono text-xs leading-[1.6] overflow-x-auto max-w-[680px]">${esc(bibtexOf(w))}</pre>` : "")
      + `<div class="flex flex-wrap items-baseline gap-x-6 gap-y-2.5 mt-1">`
      + `<button type="button" data-pub-toggle="${esc(key)}" aria-expanded="${open}" class="${action} text-ink">${esc(ui.pubAbs)} ${open ? "−" : "+"}</button>`
      + (w.doi ? `<a href="${esc(w.doi)}" target="_blank" rel="noreferrer" class="${action} text-ink-2 hover:text-ink">DOI ↗</a>` : "")
      + (w.pdf && w.pdf !== "#" ? `<a href="${esc(w.pdf)}" target="_blank" rel="noreferrer" class="${action} text-ink-2 hover:text-ink">PDF ↓</a>` : "")
      + `<button type="button" data-pub-bib="${esc(key)}" aria-expanded="${bib}" class="${action} text-ink-2 hover:text-ink">BibTeX${bib ? " −" : ""}</button>`
      + `<span class="flex flex-wrap gap-x-3 gap-y-1 font-serif italic text-[15px] text-ink-2">${w.tags.map((t: string) => `<span>#${esc(t)}</span>`).join("")}</span>`
      + `</div></div>`
      + `<aside class="flex-[0_1_300px] min-w-[240px] grid grid-cols-[110px_minmax(0,1fr)] gap-[18px] items-start">`
      + (pdfHref
        ? `<a href="${esc(pdfHref)}" target="_blank" rel="noreferrer" aria-label="PDF — ${esc(w.title)}" class="aspect-[3/4] border border-rule bg-paper-2 flex flex-col gap-[5px] px-2.5 py-3 no-underline hover:border-ink">${thumb}</a>`
        : `<span aria-hidden="true" class="aspect-[3/4] border border-rule bg-paper-2 flex flex-col gap-[5px] px-2.5 py-3">${thumb}</span>`)
      + `<dl class="m-0 flex flex-col">`
      + meta.map((m) => `<div class="flex flex-col gap-0.5 py-2 border-t border-rule"><dt class="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">${esc(m.k)}</dt><dd class="m-0 font-serif text-base leading-[1.3]">${esc(m.v)}</dd></div>`).join("")
      + `</dl></aside></article>`;
  }).join("");
}

/* ---------- § 06 — Directorio A / B / C (5.15) ---------- */

export function directoryHtml(personal: Any, linkIds: string[], ui: Any) {
  const email = String(personal.email || "");
  const socials: Any = personal.socials || {};
  const profiles = linkIds.filter((id) => id !== "cv" && socials[id]).map((id) => socials[id]);
  const head = (l: string, r = "") => `<div class="flex justify-between gap-3 pb-3 border-b border-ink ${kicker}"><span>${l}</span>${r ? `<span>${r}</span>` : ""}</div>`;
  const a = `<div class="flex flex-col">${head(esc(ui.dir), `A — ${esc(ui.mail)}`)}`
    + `<a href="mailto:${esc(email)}" class="block pt-5 pb-3.5 font-serif font-display text-[clamp(26px,2.6vw,36px)] leading-[1.1] tracking-[-0.015em] no-underline [overflow-wrap:anywhere]">${esc(email)}</a>`
    + `<div class="flex flex-wrap items-baseline gap-x-6 gap-y-2.5 pb-[18px] border-b border-rule">`
    + `<a href="mailto:${esc(email)}" class="mg-btn-primary text-[19px]">${esc(ui.write)}<span class="font-mono not-italic text-[13px] text-accent">→</span></a>`
    + `<button type="button" data-copy="${esc(email)}" data-copied="${esc(ui.copied)}" class="font-mono text-xs tracking-[0.08em] uppercase pb-1.25 px-0 border-0 border-b border-rule bg-transparent text-ink-2 cursor-pointer whitespace-nowrap hover:text-ink hover:border-ink">${esc(ui.copy)}</button></div></div>`;
  const b = `<div class="flex flex-col">${head(`B — ${esc(ui.profilesT)}`, String(profiles.length).padStart(2, "0"))}`
    + profiles.map((s) => `<a href="${esc(s.href)}" target="_blank" rel="noreferrer" class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b border-rule no-underline">`
      + `<span class="font-serif text-xl leading-[1.2]">${esc(s.label)}</span>`
      + `<span class="font-mono text-xs text-ink-2 whitespace-nowrap">${esc(s.handle)} <span class="text-accent">↗</span></span>`
      + (s.note ? `<span class="col-span-full text-[13px] leading-[1.5] text-ink-2">${esc(s.note)}</span>` : "") + `</a>`).join("")
    + (personal.cvUrl ? `<a id="cv-link" href="${esc(personal.cvUrl)}" class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 items-baseline py-3.5 border-b border-rule no-underline"><span class="font-serif text-xl leading-[1.2]">CV</span><span class="font-mono text-xs text-ink-2">PDF <span class="text-accent">↓</span></span></a>` : "")
    + `</div>`;
  const c = `<div class="flex flex-col">${head(`C — ${esc(ui.loc)}`)}`
    + `<div class="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-1 items-baseline py-3.5 border-b border-rule">`
    + `<span class="font-serif text-xl leading-[1.2]">${esc(personal.location)}</span>`
    + `<span class="flex items-baseline gap-2 font-mono text-xs whitespace-nowrap"><span class="text-ink-2">${esc(ui.localTime)}</span><span data-clock="${esc(personal.timezone || "")}" class="tabular-nums">--:--</span></span>`
    + `<span class="col-span-full text-[13px] leading-[1.5] text-ink-2">${esc(personal.hoursNote || ui.hoursNote)}</span></div></div>`;
  return a + b + c;
}
