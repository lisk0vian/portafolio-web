# DESIGN.md — Sistema personal

Use this document as the single visual and behavioral reference for the portfolio.
If something is not here, it does not exist in the design.

## 1. What the system is

A screen-native system whose only subject is the owner and his work. The screen
itself is the material: a dot-grid ground, a wide display face for names and
chapter titles, data and code in mono, and **one accent that follows the
edition** (lime for Ingeniería, cyan for Datos). It replaces the former
"Marginalia" editorial look (cream paper, serif, vermilion), which read as a
generic AI-portfolio default.

References the owner chose and what each one gives: benxrun.com (numbered
chapters), brilean.com (huge display type, light/dark block contrast,
lime-yellow accent, text that ignites on scroll), curtisdesignr.me (HUD frame,
metadata bar, dithered portrait, giant name, % loader), digitalmeadow.studio
(editor/file-tree feel, generative ASCII, hidden trophies), nahiyan.codes
(dot grid, wide display name, floating pill nav).

Hard constraints: professional and personal — **no city, country or cultural
theming**; location appears only as plain metadata (local time).

| Page | ES / EN route |
| ---- | ------------- |
| Portfolio | `/` , `/en/` |
| Case study | `/caso-de-estudio` , `/en/case-study` |
| Design system | `/sistema-diseno` , `/en/design-system` |
| Certifications | `/certificaciones` , `/en/certifications` (+ `/:grupo`) |

## 2. Color

Brand palette from `github.com/lisk0vian/me` (`branding/`), as hex tokens in
`src/styles/global.css`, mapped to Tailwind with `@theme inline`
(`bg-paper`, `text-ink`, `border-rule`, `bg-accent`…). One accent, Pervinca,
for both editions. Every text pair is ≥ 4.5:1 (`tests/release-contrast.test.mjs`).

| Token | Dark (default) | Light | Use |
| ----- | -------------- | ----- | --- |
| `--mg-paper` | `#12151A` Pizarra | `#F4F2EE` | Ground |
| `--mg-paper-2` | `#1D222A` Superficie | `#E8E4DC` Hueso | Raised surfaces, section dock |
| `--mg-ink` | `#E8E4DC` Hueso | `#12151A` Pizarra | Text |
| `--mg-ink-2` | `#9AA0A8` Niebla | `#565C66` | Secondary text, metadata |
| `--mg-rule` | Hueso at 16% | Pizarra at 16% | Hairlines |
| `--mg-accent` | `#949FD8` Pervinca | `#55609C` Pervinca oscuro | Buttons, numbers, active states, logo circle |
| `--mg-term*` | always dark | always dark | Terminal |

- Text on an accent fill is always `text-paper`.
- No inverted blocks: every section, including contact, follows the page
  theme. The section dock is `bg-paper-2` with a hairline, so it stays visible
  on any section; its active item is `bg-accent text-paper`.
- Logo: the "Escalera SOLID" symbol sits inline in the header (steps in
  `currentColor`, circle in the accent); favicons come from `branding/logo/web-icons`.

## 3. Typography

Self-hosted with Fontsource (`@fontsource-variable/*`, imported in
`Layout.astro`); no external font requests.

| Role | Face | Size token | Notes |
| ---- | ---- | ---------- | ----- |
| Name (hero only) | Sora 600 | `text-name` 52–168px | uppercase, lh .86, −3.5% |
| Chapter title | Sora 600 | `text-h1` 24–60px | uppercase, number in accent beside it |
| Featured / items | Sora 600 | `text-h2` 24–38, `text-h3` 18–26 | uppercase |
| Statement, quote, letter | Sora 500 | `text-h2`, `text-quote` | sentence case |
| Body | Sora 400 | `text-body-serif` 16–18, `text-body` 15 | `font-serif` is an alias of Sora |
| Labels, data, code | JetBrains Mono 400/500 | `text-label` 11px | uppercase, +14% tracking |

No italics anywhere. Emphasis is weight, size or the accent.

## 4. Layout, frame and spacing

- `max-w-page` 1440px; side gutter `clamp(16px, 3vw, 40px)`.
- No cards with shadows. Structure comes from hairlines (`border-rule`) and
  the **HUD cross** (`mg-cross`: `+` marks on two opposite corners) on chapter
  heads, the terminal, the portrait and the "Now" box.
- Corners are square (terminal `rounded-term` = 2px). Pills are not used.
- Section rhythm: `pt-[clamp(64px,8vw,128px)]` between chapters.

## 5. Motion

One orchestrated set, all disabled by `prefers-reduced-motion`:

- **Boot loader** (`[data-boot]` in `HomePage.astro`): 0→100% in 0.9s, first
  visit per session only (`sessionStorage mg-boot`), click to skip, then
  slides up. Hidden by default, so no-JS visitors never see it.
- **Reveal** (`data-reveal="<delay ms>"`): fade + 18px rise, 0.9s
  `cubic-bezier(.16,1,.3,1)`.
- **Rise** (`data-rise` on chapter titles, the hero name, the quote and the
  letter): every word climbs out of a mask, staggered 38ms like steps
  (capped at 24 words), once, when the block enters the viewport. Re-split
  after every profile or language re-render (`riseAll()`). Replaces the
  former scramble and ignite effects.
- **Scroll journey** (CSS scroll-driven animations, only under
  `@supports (animation-timeline: view())`, static elsewhere): accent
  progress bar under the header; each chapter hairline draws left→right as
  it enters; the chapter number rises in four steps (the brand symbol's
  stairs); the hero recedes (scale .97, fades) as it leaves. Written in
  longhands because the minifier would fold `animation-timeline` into the
  shorthand.
- **Interaction per section** (CSS in `global.css`, block "Interacción por
  sección"; state colors always, motion only without reduced-motion):
  arrows move toward where they lead (`svg[data-icon]`), buttons give 3%
  on press, HUD crosses open on hover. § 00 version number follows the
  cursor (`--mx/--my`, `initHeroTilt`), previous releases slide. § 01 the
  `+` turns 90°, title advances, the opened panel cascades in. § 02 facts,
  notes and principles answer the cursor (accent rule draws under a
  principle). § 03/§ 04 filtered lists re-enter in cascade (`stagger()`),
  skill dot lights, the PDF thumb lifts like a sheet, only the abstract
  just opened unfolds (`.mg-unfold`). § 05 the timeline line fills with
  accent and markers light up on scroll; hover turns a marker into a
  diamond. § 06 the email underlines itself, "Copiar" pulses, profile rows
  advance.
- **Cursor**: a "+" (same sign as the HUD crosses), SVG data URIs per
  theme in `global.css`, only under `pointer: fine`. Default: ink with a
  halo of the ground colour; over anything clickable: larger, in Pervinca.
  Text fields keep the text cursor; falls back to `crosshair` / `pointer`.
- **Hero**: fills exactly the first screen on lg (`h-[calc(100svh-3.5rem)]`,
  min 560px); sizes are tied to both vw and vh (name `min(4.6vw, 9vh)`,
  two lines, no wrap on lg). Left: identity, intro, CTAs, version +
  channels pinned at the bottom. Right: the mascot stage — header
  (`Fig. 0 — Compañero`, live mood `[data-mascot-mood]`), square slot sized
  to the remaining height, action chips (`mg-chip`, `[data-mascot-act]`).
- **§ 00 Console**: a regular chapter (`SectionHead num="00"`, chapter
  spacing, page ground) — no full-bleed dark slab. Left: lead, note and a
  clickable command list (`#cons-cmds`, `[data-term-run]`, strings in
  `ui.consCmds`) that types and runs the command in `#term-main`; `perfil` /
  `tema` are bare so they always toggle. Right: the terminal stays a dark
  window, captioned "Fig. 1" (the mascot is Fig. 0).
- **§ 03 right column**: certifications + "Ver todas las credenciales",
  then the **stack map** (`#skill-map`): one bar per area, width = tools vs
  the largest area, fill = daily-use share (same rule as the list's
  squares: API `meta.daily`, else certificates); clicking a bar filters the
  list (again → all). Legend ■ daily / □ occasional and totals
  (`#skill-stats`: tools, daily, max years). Column is `lg:sticky`.
  Daily items carry an sr-only "(Uso diario)".
- **Terminal games** (`scripts/term-games.ts`, hosted by `terminal.ts`):
  the game's `frame()` is drawn live under the history (lines may carry
  coloured `parts`); keys go to `key()`, Enter text to `input()`; while a
  game runs the chips become its touch controls. **Escalera**: 5 lanes ×
  8 rows, ←/→ dodge `×`, `+` gives 5, every 15 points climbs a step
  (`▁▂▃…`, speed 170→70 ms), pauses on blur/hidden tab, best in
  `mg-escalera-best`. **Stackdle**: daily 5-letter tech word (`wordOfDay`),
  6 tries, `[A]` hit / `(A)` elsewhere / `a` absent (shape + colour),
  streak in `mg-stackdle`, `stackdle libre` practice, `share` copies the
  grid. Earned trophies use `grant()` (level 5, daily solved), never
  typing; total 10. Games emit `mg:game` (start/record/win/lose) and the
  mascot reacts.
- **Mascot** (`scripts/mascot.ts`, package `open-mascot` from
  `github:0oooh/open-mascot-studio` subfolder `packages/open-mascot`, pinned
  commit, MIT): the brand symbol's circle brought to life — Pervinca body,
  eyes Pizarra (dark) / Hueso (light), transparent stage; `round` in
  Ingeniería, `drop` in Datos. One fixed `<button data-mascot>` sits over
  `[data-mascot-slot]` and travels to the bottom-right corner (above the
  dock) once its own stage reaches the header (progress = stage top past
  56px over 80% of its height, so on mobile it leaves only after you saw it), staying there on a paper-2 disc. Speech bubble
  (`.mg-say`, ES/EN): greeting by local hour, one line per section (first
  visit), reactions to theme/edition/actions. Eyes follow the cursor; hover
  → beaming; click → wave; 5 quick clicks → dizzy + trophy `mascot` (8
  trophies now); 25s idle → sleeps. Docked click opens `#mascot-menu`
  (wave, top, next section, console, theme, minimize; Escape/outside
  closes). Minimized = 44px dot, remembered in `mg-mascot-min`. The hero no
  longer carries the latest release; § 01 lists every release, newest open.
- **Work field** morph on edition change (see §6).

## 6. Signature: the work field (`scripts/work-field.ts`)

A 2D canvas behind the hero that draws **the visitor's chosen edition's real
stack** (from `stack` groups in `content.ts` / the API):

- **Ingeniería** — an architecture diagram: one column per stack area, four
  named nodes per column (three on mobile), dotted wires between columns and
  accent packets travelling along them.
- **Datos** — the same 260 particles regroup into one cluster per area; the
  area's first tool is the filled "lead" node, labels sit at fixed offsets so
  they never collide.
- Switching edition sends every particle to its new target (spring + damping,
  ~1s). The cursor repels particles within 120px and highlights the nearest
  node label.
- Drawn on the right 52% of the hero on desktop and in the band between the
  copy and the name on mobile. Paused off-screen and in hidden tabs; static
  single frame under reduced motion. Colors are read from the CSS tokens on
  every edition/theme change.

## 7. Components (`@utility` in `global.css`)

| Utility | Recipe |
| ------- | ------ |
| `mg-btn-solid` | `h-12 px-5 bg-accent text-paper` mono 12px uppercase; hover `bg-ink` — primary CTA |
| `mg-btn-ghost` | `h-12 px-5 border border-rule` mono 12px uppercase — secondary CTA |
| `mg-btn-primary` | mono 12px uppercase over a 2px accent underline + arrow icon — inline actions |
| `mg-btn-secondary` | mono label over a 1px rule |
| `mg-cross` | HUD corner crosses |
| `mg-tag` | mono 11px, 1px rule border, square |
| `mg-label`, `mg-figcaption` | mono metadata |
| `mg-toggle-sign` | 24px square, plus/minus icon |

Filters (skills area, publication type/year) are square mono chips: `h-8
border border-rule`, pressed = `bg-accent text-paper`.

Work rows invert on hover (`bg-accent`, all text `text-paper`). Certification
group rows do the same.

Icons are stroke SVGs (Lucide geometry, 1.75 stroke, square caps) from
`src/utils/icons.ts` — `arrow-right`, `arrow-down`, `arrow-up-right`, `plus`,
`minus`, `contrast`, `terminal`, `copy`. Unicode glyphs are not used as icons.

## 8. Header, dock and portfolio sections

**Header** (`SiteHeader.astro`, sticky, 56px): name (`JC.` on mobile),
running section name (scroll-spy) + live local time, the edition as a
segmented control (active = accent fill), `ES / EN`, theme toggle with the
contrast icon.

**Dock** (`SectionDock.astro`): fixed pill at the bottom center, ink
background. Shows `01–06` (+ labels from `lg`), the current section in accent
(`aria-current`), and a terminal button. Hidden while the hero is on screen.
Pressing `:` or `/` anywhere outside a field jumps to the terminal and focuses
it.

**Home** (`HomePage.astro`), same information architecture as before:

1. **Hero** — release header on cool paper: giant `2026.1`, channel tabs and a
   previous-release index on the left; name (the page `h1`), role, location,
   intro, availability chip and `Leer el caso` / `Descargar CV` on the right.
   Below, the latest release feature carries the title, one-line outcome, tags,
   metric, `Leer release` and a problem/approach/result row. The section keeps
   a full viewport height; the release feature absorbs the remaining space.
2. **Console** — compact dark strip: `§ 00.1` label, title, note, `:` hint,
   terminal.
3. **§01 Release notes** — channel rail (tabs, CV, console, content status) plus
   the previous releases as expandable rows; the first row is open.
4. **§02 About** — dithered portrait (`scripts/dither.ts` reads
   `/retrato.jpg`; until it exists the frame shows a `retrato` marker),
   facts, first paragraph as lead, margin notes, igniting quote, principles,
   "Now" box.
5. **§03 Capabilities** — skill tree (`/backend`, `/frontend`…) with daily-use
   squares and years, certification group rows.
6. **§04 Research** — filters + publication entries with PDF thumb and meta.
7. **§05 Trajectory** — square-marker timeline + education aside + CV button.
8. **§06 Correspondence** — inverted block: igniting letter, signature,
   directory (email, profiles, CV, location + local clock).

Sections `01–06` keep `min-h: calc(100svh - 3.5rem)` so each one fills the
viewport; content that already exceeds it simply grows the section.

Footer: copyright, API status, trophies `n/7`, type credit, links to the
design system and case study.

Chapter heads (`SectionHead.astro`): accent number + uppercase display title
+ right-aligned mono meta over a guide line with HUD crosses.

## 9. Assets still owed by the owner

- `public/retrato.jpg` — portrait for the dithered frame (any aspect; it is
  cropped to 4:5).
- `public/cv-jerremi-chancan.pdf` — every CV button links here.
- Real projects, employers and publications to replace the template content
  in `content.ts` / the API.

## 10. Certifications page (single page, group state in `?grupo=`)

`CertsIndexPage.astro` (`certificaciones.astro`, `en/certifications.astro`):
`§ 03.2` mono rule + total, uppercase display title, deck, then a `GRUPO` nav of
options with counts (state lives in `?grupo=`, so any view is
shareable; `todas` renders one section per group). Credential cards in a
 `repeat(auto-fill, minmax(380px, 1fr))` grid: `no · category` + status
 (`● Vigente` / `Vence este año` / `Vencida` / `Sin vencimiento` from
 `expiryDate`), title, three-cell meta row (`Emitida` / `Vence` / `ID`),
 mono skills, and `Verificar credencial ↗` + `PDF ↓` actions.
`CertsGroupPage.astro` (`certificaciones/[grupo].astro`,
`en/certifications/[group].astro`) stays as the per-group deep link with
 `?q=` search and batches of 10. `getStaticPaths` reads
`/certifications/groups` at build with `certGroupFallback`
(`aws, cloud, devops` — edit with real slugs) when the API is down.
Home §03 links each group to `/certificaciones?grupo=<slug>`. Groups over 50 need an `offset` param in
the API.

## 11. Interactive terminal

Always dark in both themes, square with HUD crosses. Header reads
`jerremi@portafolio ~ sh`, a hint (`escribe help` / `type help`) and the
trophy counter `[n/7]`. Body is 13px mono at lh 1.65 with scroll; accent `❯`
prompt (edition accent). Square 11.5px mono chips:
`help · whoami · projects · stack · profile · theme`.

**Trophies** (`mg-trophies` in localStorage, `mg:trophy` event): the first
use of `whoami`, `stack`, `perfil/profile`, `tema/theme`, `idioma/lang`,
`play/quest` and `sudo` each unlocks one; every `[data-trophies]` shows `n/7`.

### 11.1 Base commands

| Command | ES | EN |
| ------- | -- | -- |
| `help` | muestra la ayuda | show help |
| `whoami` | name — role in accent + bio | same |
| `projects` | `01 title year metric` + `·`-joined stack in dim | same |
| `stack` | `group + ·`-joined items | same |
| `contact` | accent email + links | same |
| `perfil <ingenieria\|datos>` | switches the page profile | `profile <engineering\|data>` |
| `tema <claro\|oscuro>` | switches the theme | `theme <light\|dark>` |
| `idioma <es\|en>` | navigates to the other locale URL (600ms) | `lang <es\|en>` |
| `clear` | clears the screen | same |
| `sudo` | `permiso denegado. buen intento.` | `permission denied. nice try.` |
| `cv` | `descargando cv.pdf … (placeholder)` | `downloading cv.pdf … (placeholder)` |

History with `↑/↓`, `Enter` runs, clicking focuses the input. Profile/theme
commands sync both ways via `mg:profile`/`mg:theme` events.

### 11.2 Game: quests

Type `play` for the menu, `quest ledger` or `quest churn` to start,
`a`/`b`/`c` (or `answer a`) to answer, `score` for your scoreboard,
`quest exit` to quit. The score persists in `localStorage mg-score` as
`{ played, correct }`. It closes with `★ X/3 · Fig. ★ quest complete.`

**Ledger · payments platform** (`p95 840 ms`, `310 tickets/week`):

1. p95 at 840 ms, what do you attack first? — a) index on `merchant_id` ✓ —
   b) Redis cache — c) bigger nightly batch.
   Why: the index attacks the cause (per-merchant reconciliation without full
   scans).
2. 310 tickets/week, what kills the noise? — a) near real-time dashboard ✓ —
   b) more logs — c) more support.
   Why: the dashboard exposes derived balances and kills the ticket class.
3. Balances edited by hand, which model? — a) immutable double-entry ✓ —
   b) update in place — c) spreadsheet.
   Why: immutable entries; balances are derived, never edited.

**Churn · churn prediction** (`AUC 0.74`, sales at capacity):

1. AUC 0.74, what improves generalization? — a) temporal validation ✓ —
   b) more features — c) lower the threshold.
   Why: time windows prevent leaking future information.
2. Only the top 10% gets called, what do you optimize? — a) precision@10% ✓ —
   b) global AUC — c) global recall.
   Why: capacity rules; hits count where calls actually happen.
3. Nobody uses the model, what is missing? — a) per-customer SHAP
   explanation ✓ — b) more AUC — c) more data.
   Why: a model nobody understands is a model nobody uses.

(ES: same questions — *p95 en 840 ms, ¿qué atacas primero? / 310
tickets/semana, ¿qué elimina más ruido? / saldos editados a mano, ¿qué
modelo?* and *AUC 0.74, ¿qué mejora generalización? / solo llaman al top 10%,
¿qué optimizas? / nadie usa el modelo, ¿qué falta?* — answered with `a`.)

## 12. Data, profiles, and languages

- Content lives in `src/data/content.ts` as `{ es, en }` pairs plus
  `fullstack`/`data` profiles; `pick()` resolves one locale at build time.
  Research mocks live in `pubs[]` per profile with exact `PublicationDto`
  shape (the API has no `/publications` yet); education fallback lives in
  root `education[]` (replaced live by `GET /education`).
  Personal data (name, email, socials, availability, `cvUrl`) lives in
  `src/data/site.ts` + `src/utils/personal.ts`; profile `about`/`letter`
  and project `metric` come from the API when present, else local.
- Language lives in the URL (Astro i18n, `prefixDefaultLocale: false`).
  Profile and theme persist in `localStorage` (`mg-profile`, `mg-theme`) and
  propagate through `mg:profile`/`mg:theme` events; each page re-renders from
  its embedded JSON (`__mgRender`, `__mgTermData`).
- `src/scripts/site.ts`: switchers, reveal/scramble/ignite (§5), scrollspy + dock (§8), clock, `:` shortcut, i18n via
  `data-t` (UI) and `data-tp` (profile). `src/scripts/store.ts`: global state.

## 13. Data source, DI y mock-first (Astro)

- Puertos en `src/lib/ports.ts` (`PortfolioSource`); contratos espejo API en
  `src/lib/contracts.ts`; mock plantilla en `src/lib/mock-data.ts` +
  `MockPortfolioSource`; live en `src/lib/live-source.ts` (wrapper axios).
- Composición en `src/lib/composition.ts`: `createPortfolioSource(kind)` con
  `PUBLIC_USE_MOCK=true` por defecto en dev. Las páginas crean la fuente y la
  inyectan por props (`<HomePage lang sourceKind>`); ningún `.astro` importa
  axios directo. En cliente, `refreshHomeFromApi(page, source)` recibe el mismo
  puerto. Badge `#api-status`: `Mock API · datos plantilla` vs `API en vivo`.
- Mock bilingüe `es/en` con slugs idénticos (paridad API): `payments-platform`,
  `collaborative-editor`, `churn-prediction`, `recommendation-engine`,
  `aws-*`, `immutable-ledgers`, `crdts-sin-miedo`. Replica filtros en memoria,
  `fields=` con allowlist + 400 y 404 por slug.
- Cambios API se prototipan aquí primero y se portan después: ver
  `docs/api-changes/` (001 publications, 002 projects fields+metric,
  003 offset+level+cvUrl).
