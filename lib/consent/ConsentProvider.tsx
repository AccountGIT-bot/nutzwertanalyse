"use client";

import { createContext, useCallback, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { purgeAllStorage, readConsent, writeConsent, CONSENT_KEY, type ConsentState } from "./consent";
import { createClientStore } from "@/lib/clientStore";
import { library } from "@/lib/nwa/library";

/** undefined = noch nicht gelesen (Server / vor Hydration), null = keine Entscheidung */
const consentStore = createClientStore<ConsentState | null | undefined>(
  () => readConsent(),
  undefined,
  (notify) => {
    if (typeof window === "undefined") return () => {};
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY || e.key === null) notify();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  },
);

interface ConsentValue {
  /** null = noch nicht entschieden */
  consent: ConsentState | null;
  /** true solange der Status noch nicht aus dem Speicher gelesen wurde */
  loading: boolean;
  functional: boolean;
  dialogOpen: boolean;
  openDialog: () => void;
  closeDialog: () => void;
  acceptAll: () => void;
  essentialOnly: () => void;
  setFunctional: (on: boolean) => void;
  revokeAll: () => void;
}

const ConsentContext = createContext<ConsentValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(consentStore.subscribe, consentStore.get, consentStore.getServer);
  const [dialogOpen, setDialogOpen] = useState(false);

  const apply = useCallback((functional: boolean) => {
    const state = writeConsent(functional);
    consentStore.set(state);
    setDialogOpen(false);
    if (functional) library.flushToStorage();
  }, []);

  const revokeAll = useCallback(() => {
    purgeAllStorage();
    library.clear();
    consentStore.set(null);
    setDialogOpen(false);
  }, []);

  const value = useMemo<ConsentValue>(
    () => ({
      consent: raw ?? null,
      loading: raw === undefined,
      functional: raw?.functional === true,
      dialogOpen,
      openDialog: () => setDialogOpen(true),
      closeDialog: () => setDialogOpen(false),
      acceptAll: () => apply(true),
      essentialOnly: () => apply(false),
      setFunctional: (on) => apply(on),
      revokeAll,
    }),
    [raw, dialogOpen, apply, revokeAll],
  );

  return <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>;
}

export function useConsent(): ConsentValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within ConsentProvider");
  return ctx;
}
