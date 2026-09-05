"use client";

import { useSyncExternalStore } from "react";

/**
 * Hydrationssichere Zugriffe auf Browser-Zustand.
 *
 * `useSyncExternalStore` liefert beim serverseitigen Rendern und während der
 * Hydration den Server-Snapshot und gleicht danach automatisch auf den
 * Client-Wert an. Dadurch entstehen weder Hydration-Abweichungen noch
 * `setState`-Aufrufe im Effekt-Rumpf.
 */

/**
 * Das native `storage`-Ereignis feuert nur in *anderen* Tabs. Für Änderungen
 * im selben Tab lösen Schreibzugriffe dieses zusätzliche Ereignis aus.
 */
export const LOCAL_STORAGE_EVENT = "nwa:local-storage";

/** Meldet eine Änderung am localStorage innerhalb desselben Tabs. */
export function notifyStorageChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(LOCAL_STORAGE_EVENT));
}

/** Schreibt einen Wert und benachrichtigt alle Leser. */
export function setStoredValue(key: string, value: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Kontingent erschöpft oder privater Modus – Wert gilt nur für die Sitzung.
  }
  notifyStorageChange();
}

/** Entfernt einen Wert und benachrichtigt alle Leser. */
export function removeStoredValue(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignorieren
  }
  notifyStorageChange();
}

function subscribeToStorage(onChange: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", onChange);
  window.addEventListener(LOCAL_STORAGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LOCAL_STORAGE_EVENT, onChange);
  };
}

function noopSubscribe(): () => void {
  return () => {};
}

/** `false` beim Server-Rendering, `true` sobald der Client übernommen hat. */
export function useIsHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false
  );
}

/** Liest einen Rohwert aus dem localStorage; `null`, wenn nicht vorhanden. */
export function useStoredValue(key: string): string | null {
  return useSyncExternalStore(
    subscribeToStorage,
    () => {
      try {
        return window.localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => null
  );
}
