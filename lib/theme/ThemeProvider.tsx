"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { readConsent } from "@/lib/consent/consent";
import { createClientStore } from "@/lib/clientStore";

export type ThemePref = "light" | "dark" | "system";
export const THEME_KEY = "nwa.theme";

interface ThemeValue {
  pref: ThemePref;
  resolved: "light" | "dark";
  setPref: (p: ThemePref) => void;
}

const ThemeContext = createContext<ThemeValue | null>(null);

const prefStore = createClientStore<ThemePref>(() => {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "light" || saved === "dark") return saved;
  } catch {
    /* ignore */
  }
  return "system";
}, "system");

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
 * falschen Designs zu vermeiden. Liest nur eine vom Nutzer gesetzte Präferenz.
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem(${JSON.stringify(THEME_KEY)});if(t==="light"||t==="dark"){document.documentElement.setAttribute("data-theme",t);}}catch(e){}})();`;

export function ThemeProvider({ children }: { children: ReactNode }) {
  const pref = useSyncExternalStore(prefStore.subscribe, prefStore.get, prefStore.getServer);
  const systemDark = useSyncExternalStore(systemDarkStore.subscribe, systemDarkStore.get, systemDarkStore.getServer);
  const resolved: "light" | "dark" = pref === "system" ? (systemDark ? "dark" : "light") : pref;

  const setPref = useCallback((p: ThemePref) => {
    prefStore.set(p);
    applyTheme(p);
    try {
      if (p === "system") window.localStorage.removeItem(THEME_KEY);
      else if (readConsent()?.functional) window.localStorage.setItem(THEME_KEY, p);
    } catch {
      /* ignore */
    }
  }, []);

  const value = useMemo(() => ({ pref, resolved, setPref }), [pref, resolved, setPref]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
