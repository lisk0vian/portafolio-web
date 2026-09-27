# DESIGN.md — Marginalia System

Use this document as the single visual and behavioral reference for the portfolio.
If something is not here, it does not exist in the design.

## 1. What Marginalia is

Marginalia is an editorial-technical system: the clarity of a scientific journal
applied to an engineering and data portfolio. Paper, ink, a single vermilion
accent, and data treated as numbered figures (`Fig.`, `Listing`, `Table`).

It applies to these pages (ES at `/…`, EN at `/en/…`):

| Page | ES / EN route |
| ---- | ------------- |
| Portfolio | `/` , `/en/` |
| Case study | `/caso-de-estudio` , `/en/case-study` |
| Design system | `/sistema-diseno` , `/en/design-system` |

## 2. Reference deletion map

Each file in `Portafolio web multidisciplinario/` is replaced by the section
shown. Once you verify the table, you can delete the whole folder.

| Reference file | Replaced by | Repo equivalent |
| -------------- | ----------- | --------------- |
| `Portafolio.dc.html` | §7, §8, §10 | `src/components/HomePage.astro`, `src/components/SiteHeader.astro` |
| `Caso de Estudio.dc.html` | §11 (case) | `src/components/CasePage.astro` |
| `Sistema de Diseno.dc.html` | §1–§6 | `src/components/SystemPage.astro` |
| `Terminal.dc.html` | §9 | `src/components/Terminal.astro`, `src/scripts/terminal.ts` |
| `Portafolio v1 (3 heros).dc.html` | Only variant A (Headline) shipped. Variants B and C are not implemented | — |
| `Vista Movil.dc.html` | Responsive target 390×844; see §5 | — |
| `tailwind/marginalia.css` | §3 and `src/styles/global.css` (canonical copy) | `src/styles/global.css` |
| `tailwind/tokens.css` | `:root` variables in §3 | `src/styles/global.css` |
| `tailwind/tailwind.config.js` | v3 preset, unused (the project uses Tailwind v4) | — |
| `support.js` | `.dc.html` viewer runtime, unused | — |

## 3. Color

Nine OKLCH tokens. Colors switch with `[data-theme="dark"]`, so you use
`bg-paper` or `text-ink` in both themes with no `dark:` prefix.

| Token | Light | Dark | Usage |
| ----- | ----- | ---- | ----- |
| `--paper` | `oklch(0.975 0.008 85)` | `oklch(0.17 0.008 60)` | Main background |
| `--paper-2` | `oklch(0.94 0.012 85)` | `oklch(0.22 0.01 60)` | Row hover, chart tracks, placeholders |
| `--ink` | `oklch(0.21 0.012 60)` | `oklch(0.93 0.01 85)` | Text, section rules |
| `--ink-2` | `oklch(0.43 0.012 60)` | `oklch(0.72 0.012 85)` | Secondary text and metadata (≥ 4.5:1) |
| `--rule` | `oklch(0.21 0.012 60 / 0.16)` | `oklch(0.93 0.01 85 / 0.14)` | Hairline rules and tag borders |
| `--accent` | `oklch(0.55 0.17 35)` | `oklch(0.72 0.14 40)` | Vermilion: emphasis, metrics, status. Use sparingly |
| `--accent-2` | `oklch(0.52 0.12 250)` | `oklch(0.72 0.1 250)` | Secondary series in charts |
| `--term-bg` | `oklch(0.21 0.012 60)` | `oklch(0.12 0.006 60)` | Terminal and code blocks (always dark) |
| `--term-ink` | `oklch(0.93 0.01 85)` | same | Terminal text |
| `--term-dim` | `oklch(0.7 0.012 85)` | same | Hints and secondary lines |
| `--term-accent` | `oklch(0.76 0.13 55)` | same | Prompt `❯` and highlights |

Terminal-only error color (not a token): `oklch(0.74 0.15 25)`.

Generated Tailwind classes: `bg-paper`, `bg-paper-2`, `text-ink`, `text-ink-2`,
`border-rule`, `text-accent`, `bg-accent`, `bg-term`, `text-term-ink`,
`text-term-dim`, `text-term-accent`.

## 4. Typography

Load Newsreader (300–600, roman and italic), IBM Plex Sans (400–600), and
IBM Plex Mono (400–500) with `display=swap`.

| Role | Font | Spec |
| ---- | ---- | ---- |
| Display | Newsreader 350 | `clamp(46px, 7.4vw, 118px)`, lh 0.96, −0.028em |
| Section H1 | Newsreader 350 | `clamp(40px, 5.4vw, 80px)`, lh 1, −0.025em |
| H2 | Newsreader 400 | `clamp(30px, 3.2vw, 44px)`, lh 1.05, −0.015em |
| Project H3 | Newsreader 400 | `clamp(26px, 2.8vw, 40px)`, lh 1.08, −0.015em |
| Lead / long body | Newsreader 400 | `clamp(19px, 1.7vw, 23px)` or 21px, lh 1.45–1.6 |
| UI (nav, buttons, descriptions) | Plex Sans 400/500 | 14–16px, lh 1.55 |
| Label / data / code | Plex Mono 400/500 | 11–13px, uppercase +0.08em for labels only |

Rules: serif for ideas, sans for interface, mono for data and code only.
Build hierarchy with scale and rules, never with boxes. No cards or shadows
outside the terminal.

## 5. Grid, spacing, and motion

- Max width `1320px`, prose `720px`, margins `clamp(20px, 4vw, 56px)`.
- 4px base scale: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96`.
- Sections are separated by an ink rule (`1px --ink`); inner elements by
  hairlines (`--rule`). Mobile target: 390×844 with no horizontal scroll.
- Reveal: the `data-reveal` attribute is the delay in ms (`0, 80, 90, 100, …`).
  Entry: opacity 0→1 and an 18px→0 rise over 900ms with
  `cubic-bezier(.2, .7, .2, 1)`. It triggers on entering the viewport
  (`top < viewport − 30`), rechecked on scroll, resize, and at 1200ms.
  Honor `prefers-reduced-motion`.
- Light/dark theme transitions over 400ms. Visible focus with an accent
  outline at 3px offset. Staggered hero at 80–100ms: label → headline →
  text → actions.

## 6. `mg-*` components

Define each component once in `src/styles/global.css` and reuse it.

```html
<!-- Primary action: italic serif text with an accent rule -->
<a class="mg-btn-primary">See work <span>→</span></a>

<!-- Secondary action: uppercase mono with a hairline rule -->
<a class="mg-btn-secondary">Download CV ↓</a>

<!-- Stack tag -->
<span class="mg-tag">PostgreSQL</span>

<!-- Section head: ink rule + mono § + serif title -->
<div class="mg-section-head"><span>§ 01</span><span>Work</span></div>

<!-- Figure with a numbered caption -->
<figure><div class="mg-placeholder">screenshot</div>
<figcaption class="mg-figcaption"><strong>Fig. 2 —</strong> …</figcaption></figure>
```

| Utility | Equals |
| ------- | ------ |
| `mg-label` | mono 12px uppercase `ink-2` |
| `mg-btn-primary` | italic serif 22px, `border-b-[1.5px]` accent, accent on hover |
| `mg-btn-secondary` | mono label, `border-b` rule, ink on hover |
| `mg-tag` | mono 11px, rule border, `rounded-pill` |
| `mg-section-head` | space-between flex, `border-t` ink, uppercase mono label |
| `mg-figcaption` | serif 15px `ink-2` |
| `mg-placeholder` | rule border, `135deg` striped background with `paper-2` |

Radii: `pill 999px`, terminal `6px`. Shadow on the terminal only:
`0 40px 80px -40px oklch(0.2 0.02 60 / 0.55)`.

## 7. Header and navigation

The header is sticky with a paper background and an ink `border-b`. It holds:

1. Newsreader 24px brand: first name + last name in a light `em`.
2. Running head (`aria-live`): `● role` by default; on scroll it shows
   `§ n · section` for these anchors: `trabajo, sobre-mi, herramientas,
   escritos, trayectoria, contacto` (the last one with `top < 140px` wins).
3. Edition switcher: 18px italic serif (`Ingeniería / Datos`); it switches the
   whole page profile with no reload.
4. `ES / EN` language in mono: plain Astro links (`/` and `/en/…`); the active
   one is underlined in accent (1.5px, 5px offset).
5. `◐ Light/Dark` theme toggle in 11px uppercase mono.

## 8. Portfolio (home)

Fixed section order:

1. **§ 00 Summary.** Mono label, display headline (max 17ch) with a light
   accent `em`, serif intro in `ink-2` (max 40ch), availability status with an
   accent dot, and `See work →` / `Download CV ↓` CTAs. "In this issue / 06
   sections" index in 2 columns × 3 cells (accent mono number + serif title).
2. **§ 00.1 Console.** 240px column (label, H2, note) + terminal
   (`height 300`) captioned `Fig. 0 — Interactive terminal. Click and type.`
3. **§ 01 Work.** Rows with a mono number, H3 title + summary, tags, year,
   right-aligned accent metric, and a 26px serif `→`. `paper-2` on hover.
4. **§ 02 About.** 4:5 portrait with placeholder + `Fig. 2`, two serif
   paragraphs with accent superscript margin notes, plus a side rail of italic
   notes.
5. **§ 03 Toolkit.** 4 groups; uppercase accent mono header + 23px serif
   items with a top rule.
6. **§ 04 Writing.** Rows of mono date / serif title / accent mono kind / `↗`.
7. **§ 05 Experience.** Rows of mono year / 26px serif role + company /
   description.
8. **§ 06 Correspondence.** Display serif letter + signature + ruled P.S.;
   directory (email, socials, location, status) and a `Write an email →` CTA.
9. Footer with ink `border-t`, 11px uppercase mono: `© 2026`, typefaces, and
   links to the design system and case study.

## 9. Interactive terminal

Always dark in both themes. Header reads `~/portafolio — marginalia-sh` plus
a hint (`escribe help` / `type help`). Body is 13px mono at lh 1.65 with
scroll; accent `❯` prompt and accent `caret-color`. Pill-shaped 11.5px mono
chips: `help · whoami · projects · stack · profile/theme · theme`.

### 9.1 Base commands

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

### 9.2 Game: quests

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

## 10. Data, profiles, and languages

- Content lives in `src/data/content.ts` as `{ es, en }` pairs plus
  `fullstack`/`data` profiles; `pick()` resolves one locale at build time.
  Personal data (name, email, socials, availability) lives in
  `src/data/site.ts`; the contact directory is composed in
  `src/utils/personal.ts` (email ↗, socials, CV ↓, location, ● status).
- Language lives in the URL (Astro i18n, `prefixDefaultLocale: false`).
  Profile and theme persist in `localStorage` (`mg-profile`, `mg-theme`) and
  propagate through `mg:profile`/`mg:theme` events; each page re-renders from
  its embedded JSON (`__mgRender`, `__mgTermData`).
- `src/scripts/site.ts`: switchers, reveal (§5), scrollspy (§7), i18n via
  `data-t` (UI) and `data-tp` (profile). `src/scripts/store.ts`: global state.

## 11. Case study and design system pages

**Case** (`CasePage.astro`): `← Back to index` breadcrumb + `Case study ·
01/04`; `clamp(48px, 8vw, 128px)` hero title + light italic deck; 4-cell meta
grid (role, year, duration, stack); `Fig. 1` with placeholder; sticky TOC
numbered `01–05`; Problem, Approach, Architecture/Model, Results, Lessons
sections; `Listing 1` in a term block; Metric/Before/After table (after in
accent); large italic quote; `Next case →`.

**System** (`SystemPage.astro`): giant `Marginalia` hero + lead; principles I
rigor, II typography, III data; token table (§3); type scale; grid (§5);
component §6 with the §6 recipes; Tailwind v4 theme (`@theme inline` for
colors, `@theme` for fonts, `mg-*` via `@utility`); motion (§5).

## 12. Deletion checklist

1. Verify `src/styles/global.css` holds the 9 tokens from §3.
2. Verify `help` lists all 12 commands from §9.1–§9.2 in ES and EN.
3. Verify the build emits the 6 routes from §1 (`pnpm astro build`).
4. Delete the `Portafolio web multidisciplinario/` folder.
5. This file becomes the only reference.
