"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Cookie, ShieldCheck, SlidersHorizontal, X } from "lucide-react";
import { useIsHydrated, useStoredValue } from "@/app/lib/client-state";
import {
  CONSENT_CATEGORIES,
  CONSENT_STORAGE_KEY,
  CONSENT_CHANGE_EVENT,
  CONSENT_OPEN_EVENT,
  DEFAULT_CONSENT,
  readConsent,
  writeConsent,
  type ConsentCategory,
} from "@/app/lib/consent";

type Selection = Record<ConsentCategory, boolean>;

const ALL_ACCEPTED: Selection = { necessary: true, preferences: true, statistics: true };

/**
 * Cookie-Banner mit granularer Auswahl.
 * Erscheint erst nach dem Mounten, damit keine Hydration-Abweichung entsteht.
 */
export function CookieConsent() {
  const hydrated = useIsHydrated();
  const storedConsent = useStoredValue(CONSENT_STORAGE_KEY);

  // Wurde bereits eingewilligt, bleibt der Banner geschlossen. Der Wert kommt
  // hydrationssicher aus dem localStorage – kein setState im Effekt nötig.
  const [dismissed, setDismissed] = useState(false);
  const [manuallyOpened, setManuallyOpened] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selection, setSelection] = useState<Selection | null>(null);

  const storedSelection = useMemo<Selection | null>(() => {
    void storedConsent; // Neu auswerten, sobald sich der Speichereintrag ändert.
    return readConsent()?.categories ?? null;
  }, [storedConsent]);

  const effectiveSelection = selection ?? storedSelection ?? DEFAULT_CONSENT;

  useEffect(() => {
    function handleOpen() {
      setSelection(readConsent()?.categories ?? DEFAULT_CONSENT);
      setShowDetails(true);
      setManuallyOpened(true);
      setDismissed(false);
    }

    window.addEventListener(CONSENT_OPEN_EVENT, handleOpen);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, handleOpen);
  }, []);

  const visible = hydrated && !dismissed && (manuallyOpened || storedSelection === null);

  const persist = useCallback((categories: Selection) => {
    writeConsent(categories);
    setSelection(categories);
    setDismissed(true);
    setManuallyOpened(false);
    setShowDetails(false);
  }, []);

  const toggle = useCallback(
    (category: ConsentCategory) => {
      setSelection({ ...effectiveSelection, [category]: !effectiveSelection[category] });
    },
    [effectiveSelection]
  );

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Cookie-Einstellungen"
      className="fixed inset-x-0 bottom-0 z-[100] px-4 pb-4 sm:px-6 sm:pb-6 print:hidden"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-white/[0.09] bg-[#0b0b12]/95 shadow-[0_30px_90px_rgba(0,0,0,0.6)] backdrop-blur-2xl">
        {/* Akzentlinie */}
        <div className="h-[2px] w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <span className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/[0.05] text-white/70 sm:flex">
              <Cookie className="h-5 w-5" />
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold text-white">
                  Datenschutz-Einstellungen
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setDismissed(true);
                    setManuallyOpened(false);
                  }}
                  aria-label="Schliessen"
                  className="-mr-1 -mt-1 rounded-lg p-1.5 text-white/35 transition hover:bg-white/[0.06] hover:text-white/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-sm leading-relaxed text-white/55">
                Wir verwenden ausschliesslich lokale Speichereinträge in Ihrem Browser. Notwendige
                Einträge halten die Anwendung funktionsfähig; alle weiteren setzen wir nur mit Ihrer
                Einwilligung. Sie können diese jederzeit widerrufen –{" "}
                <span className="legal-ref">Art. 45c lit. b FMG</span>,{" "}
                <span className="legal-ref">Art. 6 Abs. 6 DSG</span>. Details in der{" "}
                <Link href="/cookies" className="text-blue-300 underline underline-offset-2 hover:text-blue-200">
                  Cookie-Richtlinie
                </Link>{" "}
                und der{" "}
                <Link href="/datenschutz" className="text-blue-300 underline underline-offset-2 hover:text-blue-200">
                  Datenschutzerklärung
                </Link>
                .
              </p>

              {showDetails && (
                <div className="mt-4 space-y-2.5">
                  {CONSENT_CATEGORIES.map((category) => {
                    const checked = category.required || effectiveSelection[category.id];
                    return (
                      <div
                        key={category.id}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5"
                      >
                        <label className="flex cursor-pointer items-start gap-3">
                          <span className="relative mt-0.5 flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={category.required}
                              onChange={() => toggle(category.id)}
                              className="peer sr-only"
                            />
                            <span
                              className={`block h-5 w-9 rounded-full transition ${
                                checked ? "bg-blue-500" : "bg-white/15"
                              } ${category.required ? "opacity-60" : ""}`}
                            />
                            <span
                              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                                checked ? "left-[1.15rem]" : "left-0.5"
                              }`}
                            />
                          </span>
                          <span className="min-w-0">
                            <span className="flex items-center gap-2 text-sm font-medium text-white/85">
                              {category.label}
                              {category.required && (
                                <span className="rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-normal text-white/45">
                                  immer aktiv
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-xs leading-relaxed text-white/45">
                              {category.description}
                            </span>
                          </span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={() => persist(ALL_ACCEPTED)}
                  className="order-1 flex-1 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 transition hover:scale-[1.01] active:scale-[0.99] sm:order-3"
                >
                  Alle akzeptieren
                </button>
                <button
                  type="button"
                  onClick={() => persist(DEFAULT_CONSENT)}
                  className="order-2 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.09] hover:text-white"
                >
                  Nur notwendige
                </button>
                {showDetails ? (
                  <button
                    type="button"
                    onClick={() => persist(effectiveSelection)}
                    className="order-3 flex-1 rounded-xl border border-white/10 bg-white/[0.04] px-5 py-2.5 text-sm font-semibold text-white/75 transition hover:bg-white/[0.09] hover:text-white sm:order-1"
                  >
                    Auswahl speichern
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="order-3 flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white/45 transition hover:text-white/80 sm:order-1"
                  >
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    Einstellungen
                  </button>
                )}
              </div>

              <div className="mt-3 flex items-center gap-1.5 text-[11px] text-white/30">
                <ShieldCheck className="h-3 w-3" />
                Ihre Analysen bleiben lokal in Ihrem Browser – sie werden nicht an unsere Server übertragen.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Kleiner Auslöser für Footer und Rechtsseiten. */
export function ConsentSettingsButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(CONSENT_OPEN_EVENT))}
      className={className ?? "transition hover:text-white/70"}
    >
      Cookie-Einstellungen
    </button>
  );
}

export { CONSENT_CHANGE_EVENT };
