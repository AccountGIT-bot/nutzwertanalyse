"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { readConsent } from "@/lib/consent/consent";
import { createClientStore } from "@/lib/clientStore";

export type ThemePref = "light" | "dark" | "system";
/** Visueller Zustand des Theme-Knopfs: pulsieren (Hinweis offen) oder umfärben (Wechsel läuft). */
export type ThemeCue = "none" | "pulse" | "morph";
/** Dauer, in der sich zuerst der Knopf umfärbt, bevor die Seite folgt; danach klingt die Füllung ab. */
const MORPH_MS = 450;
const MORPH_SETTLE_MS = 350;
export const THEME_KEY = "nwa.theme";

const THEME_COLORS = { light: "#f6f7f7", dark: "#0b1211" } as const;

interface ThemeValue {
  pref: ThemePref;
  resolved: "light" | "dark";
  /** true, sobald die Nutzerin / der Nutzer das Design selbst gewählt hat (gespeichert oder in dieser Sitzung). */
  chosen: boolean;
  cue: ThemeCue;
  /** Ziel eines laufenden Wechsels, solange sich der Knopf umfärbt und die Seite noch nicht gefolgt ist. */
  pending: ThemePref | null;
  /** Sofort umschalten (z. B. Einstellungen). */
  setPref: (p: ThemePref) => void;
  /** Mit Effekt umschalten: zuerst färbt sich der Knopf, dann folgt die Seite. */
  requestPref: (p: ThemePref) => void;
  setCue: (c: ThemeCue) => void;
  resolveFor: (p: ThemePref) => "light" | "dark";
}

const ThemeContext = createContext<ThemeValue | null>(null);

function readStoredPref(): ThemePref | null {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark" || saved === "system") return saved;
  } catch {
    /* ignore */
  }
  return null;
}

/* Standard ist Hell. «System» folgt der Betriebssystem-Einstellung nur, wenn es ausdrücklich gewählt wurde. */
const prefStore = createClientStore<ThemePref>(() => readStoredPref() ?? "light", "light");
const chosenStore = createClientStore<boolean>(() => readStoredPref() !== null, false);

const systemDarkStore = createClientStore<boolean>(
  () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  false,
  (notify) => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", notify);
    return () => mq.removeEventListener("change", notify);
  },
);

function applyTheme(pref: ThemePref) {
  const root = document.documentElement;
  if (pref === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", pref);
}

/**
 * Inline-Skript, das vor dem ersten Paint läuft, um ein Aufblitzen des
 * falschen Designs zu vermeiden. Ohne gespeicherte Wahl bleibt die Seite hell.
 */
export const themeInitScript = `(function(){var t=null;try{t=localStorage.getItem(${JSON.stringify(THEME_KEY)})}catch(e){}var r=document.documentElement;if(t==="dark"){r.setAttribute("data-theme","dark")}else if(t==="system"){r.removeAttribute("data-theme")}else{r.setAttribute("data-theme","light")}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pref = useSyncExternalStore(prefStore.subscribe, prefStore.get, prefStore.getServer);
  const chosen = useSyncExternalStore(chosenStore.subscribe, chosenStore.get, chosenStore.getServer);
  const systemDark = useSyncExternalStore(systemDarkStore.subscribe, systemDarkStore.get, systemDarkStore.getServer);
  const resolved: "light" | "dark" = pref === "system" ? (systemDark ? "dark" : "light") : pref;
  const [cue, setCueState] = useState<ThemeCue>("none");
  const [pending, setPending] = useState<ThemePref | null>(null);

  const setPref = useCallback((p: ThemePref) => {
    prefStore.set(p);
    chosenStore.set(true);
    applyTheme(p);
    try {
      if (readConsent()?.functional) window.localStorage.setItem(THEME_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const requestPref = useCallback(
    (p: ThemePref) => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setPref(p);
        setCueState("none");
        return;
      }
      setPending(p);
      setCueState("morph");
    },
    [setPref],
  );

  /* Zuerst färbt sich der Knopf, dann folgt die Seite, dann klingt die Füllung ab */
  useEffect(() => {
    if (pending === null) return;
    const target = pending;
    const t1 = window.setTimeout(() => setPref(target), MORPH_MS);
    const t2 = window.setTimeout(() => {
      setPending(null);
      setCueState("none");
    }, MORPH_MS + MORPH_SETTLE_MS);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [pending, setPref]);

  const setCue = useCallback((c: ThemeCue) => setCueState(c), []);
  const resolveFor = useCallback((p: ThemePref): "light" | "dark" => (p === "system" ? (systemDark ? "dark" : "light") : p), [systemDark]);

  /* Browser-Chrome (theme-color) folgt dem tatsächlichen Design, nicht der Systemeinstellung */
  useEffect(() => {
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute("content", THEME_COLORS[resolved]);
      m.removeAttribute("media");
    });
  }, [resolved]);

  const value = useMemo(
    () => ({ pref, resolved, chosen, cue, pending, setPref, requestPref, setCue, resolveFor }),
    [pref, resolved, chosen, cue, pending, setPref, requestPref, setCue, resolveFor],
  );
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
