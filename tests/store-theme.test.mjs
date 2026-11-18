import { test } from "node:test";
import assert from "node:assert/strict";
import { getTheme } from "../src/scripts/store.ts";

test("getTheme_usesDocumentThemeWhenNoSavedPreference", () => {
  globalThis.localStorage = {
    getItem: () => null,
    setItem: () => {},
  };
  globalThis.document = {
    documentElement: { dataset: { theme: "light" } },
  };

  assert.equal(getTheme(), "light");

  globalThis.localStorage = {
    getItem: (key) => (key === "mg-theme" ? "dark" : null),
    setItem: () => {},
  };
  assert.equal(getTheme(), "dark");
});
