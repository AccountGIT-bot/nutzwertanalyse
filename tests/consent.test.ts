import { test } from "node:test";
import assert from "node:assert/strict";
import { CONSENT_KEY, purgeFunctionalStorage, readConsent, writeConsent } from "../lib/consent/consent";
import { site } from "../lib/site";
import { themeInitScript, THEME_KEY } from "../lib/theme/ThemeProvider";

/** Minimaler localStorage-Ersatz für Node */
function fakeStorage(init: Record<string, string> = {}) {
  const m = new Map(Object.entries(init));
  return {
    get length() { return m.size; },
    key: (i: number) => [...m.keys()][i] ?? null,
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    keys: () => [...m.keys()].sort(),
  };
}
function withWindow<T>(store: ReturnType<typeof fakeStorage>, fn: () => T): T {
  const g = globalThis as unknown as { window?: unknown };
  const prev = g.window;
  g.window = { localStorage: store };
  try { return fn(); } finally { g.window = prev; }
}
const consent = (version: number, functional: boolean) => JSON.stringify({ version, decidedAt: "2026-11-04T10:00:00Z", functional, analytics: false, marketing: false });

test("readConsent: nur die aktuelle Version gilt", () => {
  assert.equal(withWindow(fakeStorage({ [CONSENT_KEY]: consent(site.consentVersion, true) }), readConsent)?.functional, true);
  assert.equal(withWindow(fakeStorage({ [CONSENT_KEY]: consent(site.consentVersion - 1, true) }), readConsent), null);
  assert.equal(withWindow(fakeStorage({ [CONSENT_KEY]: "kaputt" }), readConsent), null);
});

test("Ablehnen löscht alle funktionalen Einträge, behält nur den Entscheid", () => {
  const s = fakeStorage({ "nwa.theme": "dark", "nwa.locale": "fr", "nwa.library.index": "[]", "nwa.analysis.x": "{}", "nwa.themeHint": "1", "fremd.key": "bleibt" });
  withWindow(s, () => writeConsent(false));
  assert.deepEqual(s.keys(), ["fremd.key", CONSENT_KEY].sort());
  assert.equal(JSON.parse(s.getItem(CONSENT_KEY)!).functional, false);
  withWindow(s, purgeFunctionalStorage);
  assert.deepEqual(s.keys(), ["fremd.key", CONSENT_KEY].sort());
});

test("Design-Skript vor dem ersten Paint: gespeichertes Design nur mit gültiger Einwilligung", () => {
  const run = (store: ReturnType<typeof fakeStorage>) => {
    const attrs = new Map<string, string>();
    const doc = { documentElement: { setAttribute: (k: string, v: string) => attrs.set(k, v), removeAttribute: (k: string) => attrs.delete(k) } };
    new Function("localStorage", "document", themeInitScript)(store, doc);
    return attrs.get("data-theme") ?? "system";
  };
  assert.equal(run(fakeStorage({ [CONSENT_KEY]: consent(site.consentVersion, true), [THEME_KEY]: "dark" })), "dark");
  assert.equal(run(fakeStorage({ [CONSENT_KEY]: consent(site.consentVersion, false), [THEME_KEY]: "dark" })), "light");
  assert.equal(run(fakeStorage({ [CONSENT_KEY]: consent(site.consentVersion - 1, true), [THEME_KEY]: "dark" })), "light");
  assert.equal(run(fakeStorage({ [THEME_KEY]: "dark" })), "light");
  const throwing = { getItem: () => { throw new Error("blocked"); } } as unknown as ReturnType<typeof fakeStorage>;
  assert.equal(run(throwing), "light");
});
