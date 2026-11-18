// Contraste de la paleta de marca — lee los tokens reales de `src/styles/global.css`
// y mide WCAG 2.x sobre las combinaciones que usa el sitio:
//   · tinta, tinta secundaria y acento sobre papel y sobre papel-2 (dock, paneles)
//   · papel sobre relleno de acento (estado activo del dock y botones)
//   · terminal
// Regla: todo texto ≥ 4.5:1 en ambos temas. Las dos ediciones comparten acento.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/styles/global.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, " ");

function block(selectorRe) {
  const m = css.match(new RegExp(selectorRe.source + String.raw`\s*\{([^{}]*)\}`));
  assert.ok(m, `no se encontró el bloque ${selectorRe}`);
  const vars = {};
  for (const decl of m[1].split(";")) {
    const i = decl.indexOf(":");
    if (i > 0) vars[decl.slice(0, i).trim()] = decl.slice(i + 1).trim();
  }
  return vars;
}

const palettes = {
  dark: block(/:root,\s*\[data-theme="dark"\]/),
  light: block(/\n\[data-theme="light"\]/),
};

function luminance(hex) {
  const h = hex.replace("#", "");
  assert.ok(/^[0-9a-f]{6}$/i.test(h), `color no interpretable: ${hex}`);
  const [r, g, b] = [0, 2, 4].map((i) => {
    const c = parseInt(h.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const MIN = 4.5;
const EXPECTED_ACCENT = { dark: "#949FD8", light: "#55609C" };

const pairs = [
  ["--mg-ink", "--mg-paper"],
  ["--mg-ink-2", "--mg-paper"],
  ["--mg-accent", "--mg-paper"],
  ["--mg-ink", "--mg-paper-2"],
  ["--mg-ink-2", "--mg-paper-2"],
  ["--mg-accent", "--mg-paper-2"],
  ["--mg-paper", "--mg-accent"],
  ["--mg-term-ink", "--mg-term"],
  ["--mg-term-dim", "--mg-term"],
  ["--mg-term-accent", "--mg-term"],
];

for (const [theme, p] of Object.entries(palettes)) {
  test(`${theme}: el acento es el Pervinca de la marca`, () => {
    assert.equal(p["--mg-accent"], EXPECTED_ACCENT[theme]);
  });

  for (const [fg, bg] of pairs) {
    test(`${theme}: ${fg} sobre ${bg} ≥ ${MIN}:1`, () => {
      assert.ok(p[fg] && p[bg], `faltan ${fg} o ${bg} en ${theme}`);
      const ratio = contrast(p[fg], p[bg]);
      assert.ok(ratio >= MIN, `${fg} ${p[fg]} sobre ${bg} ${p[bg]} = ${ratio.toFixed(2)}:1`);
    });
  }
}
