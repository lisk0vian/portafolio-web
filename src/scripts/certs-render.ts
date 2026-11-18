// Render de la página de certificaciones, compartido por el build (HTML inicial, sin
// saltos de layout) y el cliente (cambio de grupo y revalidación de datos).
export type CertsState = { grupo: string; groups: { group: string; count: number }[]; certs: any[] };

const esc = (s: string) =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

const yearOf = (ym: string | null | undefined) => (ym ? String(ym).slice(0, 4) : "");

function statusOf(c: any, ui: any) {
  if (!c.expiry) return [`${ui.certNoExp || "Sin vencimiento"}`, ""];
  const y = Number(yearOf(c.expiry));
  const n = new Date().getFullYear();
  if (y < n) return [`${ui.certExpired2 || "Vencida"}`, ""];
  if (y === n) return [`${ui.certEnds || "Vence este año"}`, "text-accent"];
  return [`● ${ui.certValid || "Vigente"}`, "text-accent"];
}

function certCard(c: any, ui: any, i: number) {
  const [status, color] = statusOf(c, ui);
  const no = String(i + 1).padStart(2, "0");
  return `<article class="flex flex-col gap-4 py-7 border-b border-rule">`
    + `<div class="flex justify-between items-baseline gap-3 font-mono text-[11px] tracking-[0.08em] uppercase">`
    + `<span class="text-accent">${no}${c.category ? ` · ${esc(c.category)}` : ""}</span>`
    + `<span class="${color}">${esc(status)}</span></div>`
    + `<h2 class="font-display font-medium uppercase text-[clamp(20px,2vw,28px)] leading-[1.15] tracking-[-0.025em] m-0">${esc(c.title)}</h2>`
    + `<div class="grid grid-cols-3 border-t border-rule">`
    + `<div class="py-2.5 pr-3 flex flex-col gap-1"><span class="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">${esc(ui.certIssued || "Emitida")}</span><span class="font-mono text-[13px] tabular-nums">${yearOf(c.date)}</span></div>`
    + `<div class="py-2.5 px-3 border-l border-rule flex flex-col gap-1"><span class="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">${esc(ui.certExpiresLbl || "Vence")}</span><span class="font-mono text-[13px] tabular-nums">${c.expiry ? yearOf(c.expiry) : "—"}</span></div>`
    + `<div class="py-2.5 pl-3 border-l border-rule flex flex-col gap-1 min-w-0"><span class="font-mono text-[10px] tracking-[0.08em] uppercase text-ink-2">ID</span><span class="font-mono text-[12px] truncate">${esc(c.ref || "")}</span></div></div>`
    + `<div class="flex flex-wrap gap-x-3.5 gap-y-1 text-[16px] text-ink-2">${(c.skills || []).map((s: string) => `<span translate="no">${esc(s)}</span>`).join("")}</div>`
    + `<div class="flex flex-wrap items-baseline gap-x-6 gap-y-2 mt-auto pt-1">`
    + (c.url
      ? `<a href="${esc(c.url)}" target="_blank" rel="noreferrer" class="mg-btn-primary text-[19px]"><span>${esc(ui.certVerifyCred || "Verificar credencial")}</span><span class="font-mono text-[13px] text-accent">↗</span></a>`
      : "")
    + (c.pdf && c.pdf !== "#" ? `<a href="${esc(c.pdf)}" target="_blank" rel="noreferrer" class="mg-btn-secondary">${esc(ui.certPdf || "PDF")} ↓</a>` : "")
    + `</div></article>`;
}

const groupCerts = (state: CertsState, group: string) => {
  const g = String(group).toLowerCase();
  return state.certs.filter((c: any) => (c.tags || []).some((t: string) => String(t).trim().toLowerCase() === g));
};

/** HTML de cada zona dinámica de la página para un estado dado. */
export function certsHtml(state: CertsState, ui: any) {
  const all = state.grupo === "todas";
  const groups = state.groups.length > 0
    ? state.groups
    : [...new Set(state.certs.flatMap((c: any) => c.tags || []).map((t: string) => String(t).toLowerCase()))]
        .map((g) => ({ group: g, count: groupCerts(state, g).length }));
  const total = state.certs.length;
  const n = groupCerts(state, state.grupo).length;
  const plural = (k: number) => (k === 1 ? (ui.certOne || "credencial") : (ui.certMany || "credenciales"));
  const opts = [{ group: "todas", count: total }, ...groups];
  const nav = `<span class="font-mono text-[10.5px] tracking-[0.1em] uppercase text-ink-2 mr-1">${esc(ui.certGroup || "Grupo")}</span>`
    + opts.map((o, i) => {
      const active = state.grupo === o.group;
      return `<span class="flex items-baseline gap-2.5">`
        + (i > 0 ? `<span class="font-serif text-ink-2" aria-hidden="true">/</span>` : "")
        + `<button type="button" data-grupo="${esc(o.group)}" aria-current="${active ? "true" : "false"}" class="text-[19px] leading-none py-0.5 px-0 border-0 bg-transparent cursor-pointer whitespace-nowrap ${active ? "text-ink underline decoration-accent decoration-[1.5px] underline-offset-[5px]" : "text-ink-2 hover:text-ink"}">${esc(o.group)}<sup class="font-mono text-[10px] ml-0.5">${o.count}</sup></button></span>`;
    }).join("");
  const list = all
    ? groups.map((g: any) => ({ group: g.group, certs: groupCerts(state, g.group) })).filter((s: any) => s.certs.length > 0)
    : [{ group: state.grupo, certs: groupCerts(state, state.grupo) }];
  const sections = list.length === 0
    ? `<p class="text-[19px] text-ink-2 py-8">${esc(ui.certEmpty || "")}</p>`
    : list.map((s: any) => {
      const head = all
        ? `<div class="flex items-baseline gap-3 mt-[clamp(40px,5vw,64px)] pb-2.5 border-b border-rule">`
          + `<span class="font-display font-medium uppercase text-[clamp(22px,2.4vw,32px)] tracking-[-0.025em]">${esc(s.group)}</span>`
          + `<span class="font-mono text-[11px] text-accent">${s.certs.length}</span></div>`
        : "";
      return `<section>${head}<div class="grid grid-cols-[repeat(auto-fill,minmax(min(100%,380px),1fr))] gap-x-[clamp(24px,3vw,48px)] mt-2">`
        + s.certs.map((c: any, i: number) => certCard(c, ui, i)).join("")
        + `</div></section>`;
    }).join("");
  return {
    total: `${total} ${plural(total)}`,
    deck: all ? (ui.certsAllDeck || "Todas las credenciales, agrupadas por área.") : `${n} ${plural(n)} · ${state.grupo}`,
    nav,
    sections,
  };
}

/* ---------- Página de un grupo (/certificaciones/<grupo>/) ---------- */

const matches = (c: any, q: string) => {
  if (!q) return true;
  const hay = `${c.title} ${c.issuer} ${(c.skills || []).join(" ")} ${(c.tags || []).join(" ")}`.toLowerCase();
  return q.toLowerCase().split(/\s+/).every((w) => hay.includes(w));
};

function groupRow(c: any, ui: any) {
  const inner = `<span class="font-mono text-[12px] text-ink-2 flex-[0_0_64px]">${esc(c.date || "")}</span>`
    + `<div class="flex-1 basis-[220px] min-w-0"><div class="font-serif text-[19px] leading-[1.25]">${esc(c.title)}${c.featured ? ` <span class="font-mono text-[11px] text-accent">★</span>` : ""}</div>`
    + `<div class="text-[13px] text-ink-2 mt-0.5">${esc(c.issuer)}${c.category ? ` · <span class="font-mono text-[11px] uppercase tracking-[0.06em]">${esc(c.category)}</span>` : ""}${c.expired ? ` · <span class="font-mono text-[11px] uppercase tracking-[0.06em]">${esc(ui.certExpired || "expirada")}</span>` : ""}</div></div>`
    + `<div class="flex-[0_1_180px] flex flex-wrap gap-1.5">${(c.tags || []).map((s: string) => `<span class="mg-tag">${esc(s)}</span>`).join("")}</div>`
    + (c.url
      ? `<a href="${esc(c.url)}" target="_blank" rel="noreferrer" class="font-serif text-[20px] leading-none no-underline" aria-label="${esc(c.title)}">↗</a>`
      : `<span class="font-mono text-[11px] text-ink-2">${esc(c.ref || "")}</span>`);
  return `<div class="flex flex-wrap gap-x-6 gap-y-2 items-baseline py-4 border-t border-rule ${c.expired ? "opacity-70" : ""}">${inner}</div>`;
}

/** HTML de la lista de un grupo para una búsqueda y un número de filas visibles. */
export function groupListHtml(certs: any[], q: string, shown: number, ui: any) {
  const hits = certs.filter((c) => matches(c, q));
  const rest = hits.length - shown;
  return {
    meta: `${certs.length} ${ui.certsCount || ""}`,
    list: hits.length === 0
      ? `<p class="text-[15px] text-ink-2 py-4 border-t border-rule">${esc(ui.certEmpty || "")}</p>`
      : hits.slice(0, shown).map((c) => groupRow(c, ui)).join(""),
    more: rest > 0 ? `<button type="button" id="group-more-btn" class="mg-btn-secondary">${esc(ui.certMore || "Ver más")} (${rest}) ↓</button>` : "",
  };
}
