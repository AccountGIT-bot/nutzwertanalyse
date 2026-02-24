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
      <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] border border-black/10 bg-white/70 text-black/55">
        <span className="h-3 w-3 rounded-full border border-black/25 border-t-black/65 animate-spin" />
        läuft
      </span>
    );
  }
  if (status === "ok") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] border border-emerald-500/20 bg-emerald-500/10 text-emerald-800">
        <span className="h-2 w-2 rounded-full bg-emerald-600/70" />
        OK
      </span>
    );
  }
  if (status === "fail") {
    return (
      <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] border border-rose-500/20 bg-rose-500/10 text-rose-800">
        <span className="h-2 w-2 rounded-full bg-rose-600/70" />
        Fehler
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full px-2.5 py-1 text-[11px] border border-black/10 bg-white/60 text-black/45">
      <span className="h-2 w-2 rounded-full bg-black/25" />
      bereit
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
      subtitle: "/api/health",
      status: "idle",
    },
  ]);

  const loopRef = useRef<number | null>(null);
  const runningRef = useRef(false);
  const unmountedRef = useRef(false);

  const summary = useMemo(() => {
    const ok = steps.filter((s) => s.status === "ok").length;
    const fail = steps.filter((s) => s.status === "fail").length;
    const running = steps.some((s) => s.status === "running");
    return { ok, fail, running };
  }, [steps]);

  async function runOnce() {
    if (runningRef.current || unmountedRef.current) return;
    runningRef.current = true;

    try {
      // 1) Internet
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "internet"
            ? { ...s, status: "running", detail: undefined, ms: undefined }
            : s
        )
      );

      const internetStart = msNow();
      const online = typeof navigator !== "undefined" ? navigator.onLine : true;
      await new Promise((r) => window.setTimeout(r, 280));
      if (unmountedRef.current) return;

      setSteps((prev) =>
        prev.map((s) =>
          s.key === "internet"
            ? {
                ...s,
                status: online ? "ok" : "fail",
                ms: Math.round(msNow() - internetStart),
                detail: online ? "Online" : "Offline (WLAN/Mobilfunk/VPN prüfen)",
              }
            : s
        )
      );

      // 2) App
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "app"
            ? { ...s, status: "running", detail: undefined, ms: undefined }
            : s
        )
      );

      const appStart = msNow();
      try {
        const res = await fetchWithTimeout("/", 3500);
        const ms = Math.round(msNow() - appStart);
        if (unmountedRef.current) return;

        setSteps((prev) =>
          prev.map((s) =>
            s.key === "app"
              ? {
                  ...s,
                  status: res.ok ? "ok" : "fail",
                  ms,
                  detail: `HTTP ${res.status}`,
                }
              : s
          )
        );
      } catch (e: any) {
        const ms = Math.round(msNow() - appStart);
        if (unmountedRef.current) return;

        setSteps((prev) =>
          prev.map((s) =>
            s.key === "app"
              ? {
                  ...s,
                  status: "fail",
                  ms,
                  detail:
                    e?.name === "AbortError" ? "Timeout" : "Netz/Firewall/Adblock",
                }
              : s
          )
        );
      }

      // 3) Health
      setSteps((prev) =>
        prev.map((s) =>
          s.key === "health"
            ? { ...s, status: "running", detail: undefined, ms: undefined }
            : s
        )
      );

      const healthStart = msNow();
      try {
        const res = await fetchWithTimeout("/api/health", 3500);
        const ms = Math.round(msNow() - healthStart);
        if (unmountedRef.current) return;

        setSteps((prev) =>
          prev.map((s) =>
            s.key === "health"
              ? {
                  ...s,
                  status: res.ok ? "ok" : "fail",
                  ms,
                  detail: res.ok ? "OK" : `HTTP ${res.status}`,
                }
              : s
          )
        );
      } catch {
        // Fallback: favicon
        try {
          const res2 = await fetchWithTimeout("/favicon.ico", 2500);
          const ms = Math.round(msNow() - healthStart);
          if (unmountedRef.current) return;

          setSteps((prev) =>
            prev.map((s) =>
              s.key === "health"
                ? {
                    ...s,
                    status: res2.ok ? "ok" : "fail",
                    ms,
                    detail: res2.ok ? "Fallback OK" : "Keine Antwort",
                  }
                : s
            )
          );
        } catch {
          const ms = Math.round(msNow() - healthStart);
          if (unmountedRef.current) return;

          setSteps((prev) =>
            prev.map((s) =>
              s.key === "health"
                ? { ...s, status: "fail", ms, detail: "Keine Antwort" }
                : s
            )
          );
        }
      }
    } finally {
      runningRef.current = false;
    }
  }

  useEffect(() => {
    unmountedRef.current = false;
    runOnce();
    loopRef.current = window.setInterval(() => runOnce(), 22000);

    return () => {
      unmountedRef.current = true;
      if (loopRef.current) window.clearInterval(loopRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="mt-8 rounded-2xl border border-black/10 bg-white/60 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-black/75">Live-Systemcheck</div>
          <div className="mt-1 text-[11px] text-black/50">
            {variant === "404"
              ? "Hilft zu unterscheiden: falscher Link vs. Verbindungs-/Systemproblem."
              : "Netzwerk, Erreichbarkeit und Systemstatus."}
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

      {/* kompakt als Liste */}
      <div className="mt-4 divide-y divide-black/10 rounded-xl border border-black/10 bg-white/70 overflow-hidden">
        {steps.map((s) => (
          <div key={s.key} className="px-3 py-2 flex items-center gap-3">
            <div className="min-w-[120px] text-sm font-semibold text-black/70">
              {s.title}
            </div>

            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-black/55">{s.subtitle}</div>
              {s.detail && (
                <div className="text-[11px] text-black/60">
                  {s.detail}
                  {typeof s.ms === "number" ? ` • ${s.ms} ms` : ""}
                </div>
              )}
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

function ErrorImageTop() {
  const [imgOk, setImgOk] = useState(true);

  return (
    <div className="w-full flex justify-center">
      <div className="relative">
        {/* Grössenlogik: gross sichtbar, aber nie aus dem Screen */}
        <img
          src="/404_Error_Image.jpg"
          alt="404"
          onError={() => setImgOk(false)}
          className="block w-[min(920px,94vw)] sm:w-[min(980px,90vw)] h-auto"
          style={{
            filter: "drop-shadow(0 22px 60px rgba(0,0,0,0.14))",
          }}
        />

        {/* subtile grüne aura */}
        <div className="absolute inset-0 pointer-events-none rounded-2xl opacity-80 animate-softGlow" />

        {!imgOk && (
          <div className="mt-3 text-center text-[12px] text-black/55">
            Bild nicht gefunden. Lege es in <span className="font-mono">/public/404_Error_Image.jpg</span>
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes softGlow {
          0% { transform: translateY(0px); opacity: 0.35; }
          50% { transform: translateY(-6px); opacity: 0.70; }
          100% { transform: translateY(0px); opacity: 0.35; }
        }
        .animate-softGlow {
          animation: softGlow 10.5s ease-in-out infinite;
          background: radial-gradient(
            520px 280px at 50% 60%,
            rgba(0, 115, 106, 0.18),
            transparent 62%
          );
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-softGlow { animation: none; }
        }
      `}</style>
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

      {/* Content */}
      <section className="mx-auto max-w-3xl px-5 sm:px-6 py-10 sm:py-14">
        {/* 1) Bild */}
        <ErrorImageTop />

        {/* 2) Text/CTA frei */}
        <div className="mt-7">
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

          <div className="mt-7 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-black/45">
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

        {/* 3) Diagnose unten kompakt */}
        <Diagnostics variant="404" />
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