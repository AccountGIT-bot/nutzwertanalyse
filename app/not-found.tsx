"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "idle" | "running" | "ok" | "fail";
type StepKey = "internet" | "app" | "health";

type Step = {
  key: StepKey;
  title: string;
  subtitle: string;
  status: StepStatus;
  detail?: string;
  ms?: number;
};

function msNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

async function fetchWithTimeout(url: string, timeoutMs: number, method: "GET" | "HEAD" = "HEAD") {
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method, cache: "no-store", signal: controller.signal });
    return res;
  } finally {
    window.clearTimeout(t);
  }
}

function StatusDot({
  status,
  accent = "rgba(0,115,106,1)",
}: {
  status: StepStatus;
  accent?: string;
}) {
  const base = "inline-flex h-3 w-3 rounded-full";
  if (status === "running") {
    return (
      <span
        className={`${base} border border-black/20 border-t-black/60 animate-spin`}
        aria-label="läuft"
      />
    );
  }
  if (status === "ok") {
    return (
      <span
        className={`${base} animate-okPulse`}
        style={{ background: accent, boxShadow: `0 0 0 0 rgba(0,115,106,0.0)` }}
        aria-label="ok"
      />
    );
  }
  if (status === "fail") {
    return (
      <span
        className={`${base} animate-failPulse`}
        style={{ background: "rgba(225,29,72,0.95)", boxShadow: "0 0 0 0 rgba(225,29,72,0.0)" }}
        aria-label="fail"
      />
    );
  }
  // "bereit" Punkt weg -> nur noch neutraler, unauffälliger Fallback (optional)
  return <span className={`${base} bg-transparent`} aria-label="bereit" />;
}

function StatusPill({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-black/55">
        <span className="h-3 w-3 rounded-full border border-black/25 border-t-black/65 animate-spin" />
        Prüfe…
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        OK
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex items-center gap-2 text-[11px] font-semibold text-rose-800">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        Problem
      </span>
    );
  }
  // "bereit" komplett weg
  return null;
}

function useDiagnostics() {
  const [steps, setSteps] = useState<Step[]>([
    { key: "internet", title: "Verbindung", subtitle: "Internet & Netzwerk", status: "idle" },
    { key: "app", title: "Erreichbarkeit", subtitle: "Startseite", status: "idle" },
    { key: "health", title: "Systemstatus", subtitle: "/api/health", status: "idle" },
  ]);

  const [lastRunAt, setLastRunAt] = useState<number | null>(null);
  const runningOnceRef = useRef(false);

  const summary = useMemo(() => {
    const ok = steps.filter((s) => s.status === "ok").length;
    const fail = steps.filter((s) => s.status === "fail").length;
    const running = steps.some((s) => s.status === "running");
    return { ok, fail, running };
  }, [steps]);

  const patch = useCallback((key: StepKey, patch: Partial<Step>) => {
    setSteps((prev) => prev.map((s) => (s.key === key ? { ...s, ...patch } : s)));
  }, []);

  const runOnce = useCallback(async () => {
    if (runningOnceRef.current) return;
    runningOnceRef.current = true;

    try {
      // 1) Internet
      patch("internet", { status: "running", detail: undefined, ms: undefined });
      const t1 = msNow();
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      await new Promise((r) => window.setTimeout(r, 220));
      patch("internet", {
        status: online ? "ok" : "fail",
        ms: Math.round(msNow() - t1),
        detail: online ? "Online erkannt." : "Offline – WLAN/Mobilfunk/VPN prüfen.",
      });

      // 2) App (HEAD = schnell, wenig Payload)
      patch("app", { status: "running", detail: undefined, ms: undefined });
      const t2 = msNow();
      try {
        const res = await fetchWithTimeout("/", 4000, "HEAD");
        const ms = Math.round(msNow() - t2);
        patch("app", {
          status: res.ok ? "ok" : "fail",
          ms,
          detail: res.ok ? `HTTP ${res.status}` : `Nicht OK (HTTP ${res.status})`,
        });
      } catch (e: any) {
        const ms = Math.round(msNow() - t2);
        patch("app", {
          status: "fail",
          ms,
          detail: e?.name === "AbortError" ? "Timeout" : "Fehler (Netz/Adblock/Firewall)",
        });
      }

      // 3) Health
      patch("health", { status: "running", detail: undefined, ms: undefined });
      const t3 = msNow();
      try {
        const res = await fetchWithTimeout("/api/health", 4000, "GET");
        const ms = Math.round(msNow() - t3);
        patch("health", {
          status: res.ok ? "ok" : "fail",
          ms,
          detail: res.ok ? "OK" : `Nicht OK (HTTP ${res.status})`,
        });
      } catch {
        // Fallback
        try {
          const res2 = await fetchWithTimeout("/favicon.ico", 3500, "HEAD");
          const ms = Math.round(msNow() - t3);
          patch("health", {
            status: res2.ok ? "ok" : "fail",
            ms,
            detail: res2.ok ? "Fallback OK" : "Keine Antwort",
          });
        } catch {
          const ms = Math.round(msNow() - t3);
          patch("health", { status: "fail", ms, detail: "Keine Antwort" });
        }
      }

      setLastRunAt(Date.now());
    } finally {
      runningOnceRef.current = false;
    }
  }, [patch]);

  const overallLabel = useMemo(() => {
    if (summary.running) return "Prüfung läuft…";
    if (summary.fail > 0) return "Es wurden Probleme erkannt";
    if (summary.ok === steps.length) return "Alles sieht gut aus";
    return "Bereit";
  }, [summary, steps.length]);

  return { steps, summary, runOnce, lastRunAt, overallLabel };
}

export default function NotFoundPage() {
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const loopRef = useRef<number | null>(null);
  const diag = useDiagnostics();

  const stopLoop = useCallback(() => {
    if (loopRef.current) {
      window.clearInterval(loopRef.current);
      loopRef.current = null;
    }
  }, []);

  useEffect(() => stopLoop, [stopLoop]);

  const startCheck = useCallback(async () => {
    setOpen(true);
    setHasRun(true);

    await diag.runOnce();

    if (!loopRef.current) {
      loopRef.current = window.setInterval(() => {
        diag.runOnce();
      }, 22000);
    }
  }, [diag]);

  useEffect(() => {
    if (!open) stopLoop();
  }, [open, stopLoop]);

  const showRows = open && hasRun;

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-hidden">
      {/* Header (wie ursprünglich) */}
      <header className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Zur Startseite"
              title="Startseite"
            >
              <div className="h-10 w-10 rounded-2xl overflow-hidden">
                <img src="/images/logo.webp" alt="Logo" className="h-full w-full object-contain" />
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                  Nutzwertanalyse<span className="opacity-60">.com</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">404</div>
              </div>
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push("/")}
                className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
              >
                Startseite
              </button>
              <button
                onClick={() => router.back()}
                className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
              >
                Zurück
              </button>
            </div>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      {/* Image block: kleiner + weiter oben */}
      <div className="mx-auto max-w-6xl px-5 sm:px-6 pt-2 sm:pt-3">
        <img
          src="/presets/404_Error_Image.png"
          alt="404"
          className="mx-auto w-full max-w-[360px] sm:max-w-[420px] xl:max-w-[480px] h-auto select-none pointer-events-none"
          style={{ opacity: 0.98, filter: "contrast(1.02) saturate(1.06)" }}
        />
      </div>

      {/* Overlapping content card: Rahmen weg */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 pb-10 sm:pb-14">
        <div className="-mt-[12%] sm:-mt-[14%] relative z-10 rounded-3xl bg-white/72 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <h1 className="mt-1 text-3xl sm:text-4xl font-semibold tracking-tight">
            Diese Seite ist nicht verfügbar.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-black/55 leading-relaxed">
            Die URL ist ungültig oder die Seite wurde verschoben. Du kannst zur Startseite zurückkehren
            oder den Zurück-Button verwenden.
          </p>

          <div className="mt-6">
            <button
              onClick={() => router.push("/")}
              className="w-full rounded-full py-2.5 text-sm font-semibold transition hover:brightness-[1.03] active:scale-[0.99]"
              style={{ background: "#0b0f14", color: "white" }}
            >
              Zur Startseite
            </button>
          </div>

          {/* Live Diagnose (ohne Zusatztext im offenen/geschlossenen Zustand) */}
          <div className="mt-5">
            <button
              onClick={() => (open ? setOpen(false) : startCheck())}
              className="w-full rounded-2xl bg-white/70 hover:bg-white/85 transition px-4 py-3 text-left"
              aria-expanded={open}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-black/75">Live-Systemdiagnose</div>
                  <div className="mt-0.5 text-[11px] text-black/50">
                    {open ? "Ausblenden" : "Starten (Verbindung, App, API)"}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="inline-flex items-center gap-1 text-[11px] text-black/45">
                    <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
                    {diag.summary.ok}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[11px] text-black/45">
                    <span className="h-2 w-2 rounded-full bg-rose-500/55" />
                    {diag.summary.fail}
                  </span>

                  {diag.summary.running && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-black/45">
                      <span className="h-3 w-3 rounded-full border border-black/30 border-t-black/70 animate-spin" />
                    </span>
                  )}

                  <span
                    className={`ml-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/70 transition ${
                      open ? "rotate-180" : ""
                    }`}
                    aria-hidden="true"
                  >
                    ▾
                  </span>
                </div>
              </div>
            </button>

            <div
              className={`grid transition-all duration-300 ease-out ${
                showRows ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0 mt-0"
              }`}
            >
              <div className="overflow-hidden">
                <div className="rounded-2xl bg-white/60 p-4">
                  {/* Kopfzeile Diagnose */}
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <div className="text-sm font-semibold text-black/70">{diag.overallLabel}</div>
                      <div className="text-[11px] text-black/45">
                        {diag.lastRunAt
                          ? `Letzte Prüfung: ${new Date(diag.lastRunAt).toLocaleTimeString("de-CH", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : ""}
                      </div>
                    </div>

                    <button
                      onClick={() => startCheck()}
                      className="rounded-full px-4 py-2 text-xs font-semibold bg-white/70 hover:bg-white/85 transition active:scale-[0.99]"
                    >
                      Erneut prüfen
                    </button>
                  </div>

                  {/* Liste */}
                  <div className="grid gap-2">
                    {diag.steps.map((s, idx) => (
                      <div
                        key={s.key}
                        className="flex items-center justify-between gap-4 rounded-xl bg-white/70 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <StatusDot status={s.status} />
                            <div className="text-sm font-semibold text-black/70">
                              {idx + 1}. {s.title}
                            </div>
                            <div className="text-[11px] text-black/40">
                              {typeof s.ms === "number" ? `${s.ms} ms` : ""}
                            </div>
                          </div>

                          <div className="text-[11px] text-black/50">{s.subtitle}</div>

                          {s.detail && (
                            <div className="text-[11px] text-black/55">
                              <span className="font-mono">{s.detail}</span>
                            </div>
                          )}
                        </div>

                        <StatusPill status={s.status} />
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 text-[11px] text-black/45">
                    Tipp: Bei „Problem“ VPN/Adblock kurz deaktivieren oder Netzwerk wechseln.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx global>{`
            @keyframes okPulseMini {
              0% { transform: scale(1); opacity: 0.85; }
              50% { transform: scale(1.18); opacity: 1; }
              100% { transform: scale(1); opacity: 0.85; }
            }
            @keyframes failPulseMini {
              0% { transform: scale(1); opacity: 0.85; }
              50% { transform: scale(1.18); opacity: 1; }
              100% { transform: scale(1); opacity: 0.85; }
            }
            @keyframes okPulse {
              0% { box-shadow: 0 0 0 0 rgba(0,115,106,0.0); transform: scale(1); opacity: 0.95; }
              50% { box-shadow: 0 0 0 10px rgba(0,115,106,0.08); transform: scale(1.05); opacity: 1; }
              100% { box-shadow: 0 0 0 0 rgba(0,115,106,0.0); transform: scale(1); opacity: 0.95; }
            }
            @keyframes failPulse {
              0% { box-shadow: 0 0 0 0 rgba(225,29,72,0.0); transform: scale(1); opacity: 0.95; }
              50% { box-shadow: 0 0 0 10px rgba(225,29,72,0.08); transform: scale(1.05); opacity: 1; }
              100% { box-shadow: 0 0 0 0 rgba(225,29,72,0.0); transform: scale(1); opacity: 0.95; }
            }
            .animate-okPulseMini { animation: okPulseMini 1.6s ease-in-out infinite; }
            .animate-failPulseMini { animation: failPulseMini 1.6s ease-in-out infinite; }
            .animate-okPulse { animation: okPulse 2.2s ease-in-out infinite; }
            .animate-failPulse { animation: failPulse 2.2s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) {
              .animate-okPulseMini,
              .animate-failPulseMini,
              .animate-okPulse,
              .animate-failPulse {
                animation: none !important;
              }
            }
          `}</style>
        </div>
      </section>

      {/* Footer (wie ursprünglich) */}
      <footer className="pb-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.com</div>
            <div className="text-black/35">Stabilität • Transparenz • Governance</div>
          </div>
        </div>
      </footer>
    </main>
  );
}
