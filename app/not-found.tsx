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
  // Subtle, premium "living" animation: spinner while running, check on ok, x on fail
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

function Diagnostics({ variant }: { variant: "404" | "error" }) {
  const [steps, setSteps] = useState<Step[]>([
    {
      key: "internet",
      title: "Netzwerk",
      subtitle: "Internetverbindung prüfen",
      status: "idle",
    },
    {
      key: "app",
      title: "App",
      subtitle: "Erreichbarkeit der Seite prüfen",
      status: "idle",
    },
    {
      key: "health",
      title: "System",
      subtitle: "Status /api/health prüfen",
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
    // Step 1: internet
    setSteps((prev) =>
      prev.map((s) =>
        s.key === "internet" ? { ...s, status: "running", detail: undefined } : s
      )
    );

    const internetStart = msNow();
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    // quick wait to make it feel "alive" even if instant
    await new Promise((r) => window.setTimeout(r, 350));

    setSteps((prev) =>
      prev.map((s) =>
        s.key === "internet"
          ? {
              ...s,
              status: online ? "ok" : "fail",
              ms: Math.round(msNow() - internetStart),
              detail: online
                ? "Online erkannt"
                : "Offline erkannt (WLAN/Mobilfunk prüfen)",
            }
          : s
      )
    );

    // Step 2: app reachability
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
                  ? `Antwort erhalten (${res.status})`
                  : `Antwort erhalten (${res.status})`,
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
                    ? "Timeout – App reagiert nicht"
                    : "Fehler beim Laden der App",
              }
            : s
        )
      );
    }

    // Step 3: health check (prefer /api/health, fallback to favicon)
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
              ? { ...s, status: "ok", ms, detail: "System OK" }
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
                  detail: `Health nicht OK (${res.status})`,
                }
              : s
          )
        );
      }
    } catch (e: any) {
      // fallback
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
                    ? "System erreichbar (Fallback)"
                    : "System nicht erreichbar",
                }
              : s
          )
        );
      } catch {
        const ms = Math.round(msNow() - healthStart);
        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? { ...s, status: "fail", ms, detail: "Keine Antwort erhalten" }
              : s
          )
        );
      }
    }
  }

  useEffect(() => {
    // Run immediately, then keep a soft “hourglass feeling” by re-running periodically
    runOnce();

    // Subtle periodic re-check (not too aggressive)
    loopRef.current = window.setInterval(() => {
      // Don’t spam if user is offline and it keeps failing: still re-check but slower feel
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
          <div className="text-sm font-semibold text-black/75">
            Live-Diagnose
          </div>
          <div className="mt-1 text-[11px] text-black/50">
            {variant === "404"
              ? "Hilft dir zu erkennen, ob es wirklich nur ein Link-Problem ist."
              : "Hilft dir zu erkennen, ob es ein Netzwerk- oder Systemproblem ist."}
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
                <div className="mt-1 text-[11px] text-black/55">
                  {s.detail}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={() => runOnce()}
          className="rounded-full px-4 py-2 text-xs font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
        >
          Diagnose erneut ausführen
        </button>

        <a
          href="/"
          className="rounded-full px-4 py-2 text-xs font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
        >
          Startseite
        </a>
      </div>
    </div>
  );
}

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] via-[#f3f6f6] to-[#eef2f2]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 18% 18%, rgba(0,0,0,0.05), transparent 62%), radial-gradient(850px 600px at 85% 40%, rgba(0,0,0,0.035), transparent 62%), radial-gradient(900px 700px at 50% 115%, rgba(0,0,0,0.07), transparent 72%)",
          }}
        />
        <div className="absolute inset-0 app-grain opacity-[0.18]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
      </div>

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
                <div className="text-[11px] sm:text-xs text-black/45">404</div>
              </div>
            </button>

            <button
              onClick={() => router.back()}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Zurück
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
        <div className="rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-black/10 bg-white/70 text-black/70">
            🟢 GLOBAL • Seite nicht gefunden
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Diese Seite existiert nicht.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-black/55 leading-relaxed">
            Der Link ist ungültig oder die Seite wurde verschoben. Du kannst zur
            Startseite zurückgehen.
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

          {/* ✅ Animated, real diagnostics */}
          <Diagnostics variant="404" />

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

      <footer className="pb-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.tool</div>
            <div className="text-black/35">Stabilität • Transparenz • Governance</div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .app-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.22'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
        }
      `}</style>
    </main>
  );
}