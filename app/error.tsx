"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type StepStatus = "idle" | "running" | "ok" | "fail";

type Step = {
  key: "internet" | "app" | "health";
  title: string;
  subtitle: string;
  status: StepStatus;
  detail?: string;
  ms?: number;
};

function msNow() {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const t = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return res;
  } finally {
    window.clearTimeout(t);
  }
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center">
        <span className="h-4 w-4 rounded-full border border-black/25 border-t-black/65 animate-spin" />
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center">
        <span className="h-5 w-5 rounded-full bg-emerald-500/15 border border-emerald-500/35 grid place-items-center">
          <span className="text-emerald-700 text-sm font-bold">✓</span>
        </span>
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center">
        <span className="h-5 w-5 rounded-full bg-rose-500/12 border border-rose-500/30 grid place-items-center">
          <span className="text-rose-700 text-sm font-bold">×</span>
        </span>
      </span>
    );
  }
  return (
    <span className="inline-flex h-6 w-6 items-center justify-center">
      <span className="h-2 w-2 rounded-full bg-black/15" />
    </span>
  );
}

function Diagnostics({ variant }: { variant: "error" }) {
  const [steps, setSteps] = useState<Step[]>([
    {
      key: "internet",
      title: "Verbindung",
      subtitle: "Internetstatus & Netzwerkverfügbarkeit",
      status: "idle",
    },
    {
      key: "app",
      title: "Erreichbarkeit",
      subtitle: "Antwort der Anwendung (Startseite)",
      status: "idle",
    },
    {
      key: "health",
      title: "Systemstatus",
      subtitle: "Service-Check via /api/health",
      status: "idle",
    },
  ]);

  const loopRef = useRef<number | null>(null);

  const summary = useMemo(() => {
    const ok = steps.filter((s) => s.status === "ok").length;
    const fail = steps.filter((s) => s.status === "fail").length;
    const running = steps.some((s) => s.status === "running");
    return { ok, fail, running };
  }, [steps]);

  async function runOnce() {
    // 1) Verbindung
    setSteps((prev) =>
      prev.map((s) =>
        s.key === "internet" ? { ...s, status: "running", detail: undefined } : s
      )
    );

    const internetStart = msNow();
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    await new Promise((r) => window.setTimeout(r, 350));

    setSteps((prev) =>
      prev.map((s) =>
        s.key === "internet"
          ? {
              ...s,
              status: online ? "ok" : "fail",
              ms: Math.round(msNow() - internetStart),
              detail: online
                ? "Online – Verbindung erkannt."
                : "Offline – WLAN/Mobilfunk oder VPN prüfen.",
            }
          : s
      )
    );

    // 2) Erreichbarkeit der App
    setSteps((prev) =>
      prev.map((s) =>
        s.key === "app" ? { ...s, status: "running", detail: undefined } : s
      )
    );

    const appStart = msNow();
    try {
      const res = await fetchWithTimeout("/", 4000);
      const ms = Math.round(msNow() - appStart);

      setSteps((prev) =>
        prev.map((s) =>
          s.key === "app"
            ? {
                ...s,
                status: res.ok ? "ok" : "fail",
                ms,
                detail: res.ok
                  ? `Antwort erhalten (HTTP ${res.status}).`
                  : `Antwort erhalten, aber nicht OK (HTTP ${res.status}).`,
              }
            : s
        )
      );
    } catch (e: any) {
      const ms = Math.round(msNow() - appStart);
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "app"
            ? {
                ...s,
                status: "fail",
                ms,
                detail:
                  e?.name === "AbortError"
                    ? "Zeitüberschreitung – die App reagiert nicht."
                    : "Fehler beim Laden – Netzwerk/Firewall/Adblock prüfen.",
              }
            : s
        )
      );
    }

    // 3) Systemstatus /api/health (Fallback: favicon)
    setSteps((prev) =>
      prev.map((s) =>
        s.key === "health" ? { ...s, status: "running", detail: undefined } : s
      )
    );

    const healthStart = msNow();
    const healthUrl = "/api/health";

    try {
      const res = await fetchWithTimeout(healthUrl, 4000);
      const ms = Math.round(msNow() - healthStart);

      if (res.ok) {
        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? { ...s, status: "ok", ms, detail: "System OK – Services antworten." }
              : s
          )
        );
      } else {
        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? {
                  ...s,
                  status: "fail",
                  ms,
                  detail: `Service antwortet, aber nicht OK (HTTP ${res.status}).`,
                }
              : s
          )
        );
      }
    } catch {
      try {
        const res2 = await fetchWithTimeout("/favicon.ico", 3500);
        const ms = Math.round(msNow() - healthStart);

        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? {
                  ...s,
                  status: res2.ok ? "ok" : "fail",
                  ms,
                  detail: res2.ok
                    ? "System erreichbar (Fallback-Check)."
                    : "System nicht erreichbar – bitte später erneut versuchen.",
                }
              : s
          )
        );
      } catch {
        const ms = Math.round(msNow() - healthStart);
        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? {
                  ...s,
                  status: "fail",
                  ms,
                  detail: "Keine Antwort – Netzwerk oder Serverstatus prüfen.",
                }
              : s
          )
        );
      }
    }
  }

  useEffect(() => {
    runOnce();

    loopRef.current = window.setInterval(() => {
      runOnce();
    }, 22000);

    return () => {
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-black/75">Live-Systemcheck</div>
          <div className="mt-1 text-[11px] text-black/50">
            Zur Einordnung: Netzwerk, Erreichbarkeit und Systemstatus werden geprüft.
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-black/45">
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-500/60" />
            {summary.ok}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-rose-500/55" />
            {summary.fail}
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-black/25" />
            {summary.running ? "läuft" : "bereit"}
          </span>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            className="flex items-start gap-3 rounded-xl border border-black/10 bg-white/70 px-3 py-2"
          >
            <StatusIcon status={s.status} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold text-black/70">
                  {idx + 1}. {s.title}
                </div>
                <div className="text-[11px] text-black/45">
                  {typeof s.ms === "number" ? `${s.ms} ms` : ""}
                </div>
              </div>
              <div className="text-[11px] text-black/50">{s.subtitle}</div>
              {s.detail && (
                <div className="mt-1 text-[11px] text-black/55">{s.detail}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <button
          onClick={() => runOnce()}
          className="rounded-full px-4 py-2 text-xs font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
        >
          Systemcheck erneut ausführen
        </button>
      </div>
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Optional: später an Monitoring/Logging anschliessen
    // console.error(error);
  }, [error]);

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-hidden">
      <header className="sticky top-0 z-30">
        <div className="bg-white/70 backdrop-blur-xl shadow-[0_12px_30px_rgba(0,0,0,0.08)]">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3 text-left"
              aria-label="Zur Startseite"
              title="Startseite"
            >
              <div className="h-10 w-10 rounded-2xl bg-black/5 border border-black/10 grid place-items-center">
                <span className="text-black/70 text-lg">⌁</span>
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                  Nutzwertanalyse<span className="opacity-60">.tool</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">Systemmeldung</div>
              </div>
            </button>

            <button
              onClick={() => router.refresh()}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Seite neu laden
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="relative z-10 mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
        <div className="rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-black/10 bg-white/70 text-black/70">
            🟢 GLOBAL • Unerwarteter Fehler
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Etwas ist schiefgelaufen.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-black/55 leading-relaxed">
            Das ist ein unerwarteter Fehler. Du kannst es erneut versuchen oder zur Startseite
            zurück. Falls es wiederholt passiert, notiere dir den Fehlercode.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              onClick={() => reset()}
              className="rounded-full py-2.5 text-sm font-semibold transition hover:brightness-[1.03] active:scale-[0.99]"
              style={{ background: "#0b0f14", color: "white" }}
            >
              Erneut versuchen
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-full py-2.5 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Zur Startseite
            </button>
          </div>

          <div className="mt-6 rounded-2xl border border-black/10 bg-white/60 p-4">
            <div className="text-[11px] text-black/50">Fehlercode</div>
            <div className="mt-1 font-mono text-xs text-black/70 break-all">
              {error?.digest ?? "n/a"}
            </div>
          </div>

          <Diagnostics variant="error" />

          <div className="mt-8 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-black/45">
            <a href="/impressum" className="underline underline-offset-2 decoration-black/20">
              Impressum
            </a>
            <a href="/agb" className="underline underline-offset-2 decoration-black/20">
              AGB
            </a>
            <a href="/datenschutz" className="underline underline-offset-2 decoration-black/20">
              Datenschutz
            </a>
          </div>
        </div>
      </section>

      <footer className="relative z-10 pb-6">
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
