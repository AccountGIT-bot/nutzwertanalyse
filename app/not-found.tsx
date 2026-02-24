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

function StatusPill({ status }: { status: StepStatus }) {
  if (status === "running") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-black/10 bg-white/70 text-black/55">
        <span className="h-3 w-3 rounded-full border border-black/25 border-t-black/65 animate-spin" />
        Prüfe…
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-emerald-500/25 bg-emerald-500/10 text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        OK
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-rose-500/25 bg-rose-500/10 text-rose-800">
        <span className="h-2 w-2 rounded-full bg-rose-500" />
        Problem
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-black/10 bg-white/65 text-black/45">
      <span className="h-2 w-2 rounded-full bg-black/20" />
      Bereit
    </span>
  );
}

function Diagnostics({ variant }: { variant: "404" | "error" }) {
  const [steps, setSteps] = useState<Step[]>([
    {
      key: "internet",
      title: "Verbindung",
      subtitle: "Internetstatus & Netzwerk",
      status: "idle",
    },
    {
      key: "app",
      title: "Erreichbarkeit",
      subtitle: "Antwort der Startseite",
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
    // 1) Internet
    setSteps((prev) =>
      prev.map((s) =>
        s.key === "internet" ? { ...s, status: "running", detail: undefined } : s
      )
    );

    const internetStart = msNow();
    const online = typeof navigator !== "undefined" ? navigator.onLine : true;

    await new Promise((r) => window.setTimeout(r, 260));

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

    // 2) App
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
                    ? "Zeitüberschreitung – App reagiert nicht."
                    : "Fehler beim Laden – Netzwerk/Firewall/Adblock prüfen.",
              }
            : s
        )
      );
    }

    // 3) Health
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
              ? { ...s, status: "ok", ms, detail: "System OK – Service antwortet." }
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
      // Fallback: favicon
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
            {variant === "404"
              ? "Zur Einordnung: falscher Link vs. Verbindungs-/Systemthema."
              : "Zur Einordnung: Netzwerk, Erreichbarkeit und Systemstatus."}
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

      <div className="mt-4 space-y-2">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            className="flex items-center justify-between gap-4 rounded-xl border border-black/10 bg-white/70 px-3 py-2"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <div className="text-sm font-semibold text-black/70">
                  {idx + 1}. {s.title}
                </div>
                <div className="text-[11px] text-black/40">
                  {typeof s.ms === "number" ? `${s.ms} ms` : ""}
                </div>
              </div>
              <div className="text-[11px] text-black/50">{s.subtitle}</div>
              {s.detail && <div className="text-[11px] text-black/55">{s.detail}</div>}
            </div>

            <StatusPill status={s.status} />
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

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-hidden">
      {/* Header */}
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

      {/* Image on top */}
      <div className="mx-auto max-w-5xl px-5 sm:px-6 pt-7 sm:pt-9">
        <img
          src="/presets/404_Error_Image.png"
          alt="404"
          className="mx-auto w-full max-w-[900px] xl:max-w-[1000px] h-auto select-none pointer-events-none"
          style={{
            opacity: 0.98,
            filter: "contrast(1.02) saturate(1.05)",
          }}
        />
      </div>

      {/* Main card (no extra frame above image, image “blends”) */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-7 sm:py-10">
        <div className="rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-8">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold border border-black/10 bg-white/70 text-black/70">
            🟢 GLOBAL • Seite nicht gefunden
          </div>

          <h1 className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight">
            Diese Seite ist nicht verfügbar.
          </h1>

          <p className="mt-3 text-sm sm:text-base text-black/55 leading-relaxed">
            Die URL ist ungültig oder die Seite wurde verschoben. Du kannst zur Startseite
            zurückkehren oder den Zurück-Button verwenden.
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

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-black/45">
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

          {/* Compact diagnostics below */}
          <Diagnostics variant="404" />
        </div>
      </section>

      {/* Footer */}
      <footer className="pb-6">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.tool</div>
            <div className="text-black/35">Stabilität • Transparenz • Governance</div>
          </div>
        </div>
      </footer>
    </main>
  );
}