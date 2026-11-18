// Lógica pura de los juegos de la terminal (src/scripts/term-games.ts).
// Node ≥ 23.6 ejecuta TypeScript con tipos borrables, sin build.
import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreGuess, WORDS, dayNumber, wordOfDay } from "../src/scripts/term-games.ts";

test("scoreGuess: aciertos, presentes y ausentes", () => {
  assert.deepEqual(scoreGuess("REACT", "REACT"), ["hit", "hit", "hit", "hit", "hit"]);
  assert.deepEqual(scoreGuess("TRACE", "REACT"), ["near", "near", "hit", "hit", "near"]);
  assert.deepEqual(scoreGuess("QUBIT", "REACT"), ["miss", "miss", "miss", "miss", "hit"]);
});

test("scoreGuess: letras repetidas no cuentan de más", () => {
  // RADAR tiene dos R y dos A; ARRAY tiene dos R, dos A y una Y.
  assert.deepEqual(scoreGuess("ARRAY", "RADAR"), ["near", "near", "near", "hit", "miss"]);
  // Solo una E del intento puede marcarse si la respuesta tiene una.
  assert.deepEqual(scoreGuess("EERIE", "MERGE"), ["miss", "hit", "hit", "miss", "hit"]);
  // Una sola L en la respuesta: la segunda L del intento queda ausente.
  assert.deepEqual(scoreGuess("LLAMA", "LOGIC"), ["hit", "miss", "miss", "miss", "miss"]);
});

test("WORDS: 5 letras A–Z, sin duplicados", () => {
  for (const w of WORDS) assert.match(w, /^[A-Z]{5}$/);
  assert.equal(new Set(WORDS).size, WORDS.length);
});

test("palabra del día: determinista y de la lista", () => {
  const d = dayNumber(new Date(2026, 10, 18));
  assert.equal(d, 321);
  assert.equal(wordOfDay(d), wordOfDay(d));
  assert.ok(WORDS.includes(wordOfDay(d)));
  assert.notEqual(wordOfDay(d), wordOfDay(d + 1));
});
