"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [pageReady, setPageReady] = useState(false);

  useEffect(() => {
    const r = requestAnimationFrame(() => setPageReady(true));
    return () => cancelAnimationFrame(r);
  }, []);

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-hidden">
      {/* Background matches landing */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] via-[#f3f6f6] to-[#eef2f2]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 18% 18%, rgba(0,0,0,0.05), transparent 62%), radial-gradient(850px 600px at 85% 40%, rgba(0,0,0,0.035), transparent 62%), radial-gradient(900px 700px at 50% 115%, rgba(0,0,0,0.07), transparent 72%)",
          }}
        />
        <div className="absolute inset-0 login-grain opacity-[0.18]" />
        <div className="absolute inset-0 login-sheen opacity-[0.60]" />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_30%,transparent_55%,rgba(0,0,0,0.10)_100%)]" />
      </div>

      {/* Appear fog */}
      <div
        className={[
          "fixed inset-0 z-40 pointer-events-none",
          "transition-opacity duration-700 ease-out",
          pageReady ? "opacity-0" : "opacity-100",
        ].join(" ")}
        style={{
          backdropFilter: "blur(10px)",
          background: "rgba(255,255,255,0.22)",
        }}
      />

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
                <div className="text-[11px] sm:text-xs text-black/45">
                  Account • später erweiterbar
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push("/")}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Zurück
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      {/* Content */}
      <div className="min-h-[calc(100svh-76px)] flex items-center justify-center px-6 py-10">
        <div
          className={[
            "w-full max-w-md rounded-3xl",
            "bg-white/72 border border-black/10",
            "shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md",
            "p-6 sm:p-7",
            "transition-all duration-700 ease-out",
            pageReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          ].join(" ")}
        >
          <div className="text-center">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              Login
            </div>
            <div className="mt-2 text-sm text-black/45">
              (Echte Anmeldung kommt später – UI ist bereits vorbereitet.)
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <button className="h-12 w-full rounded-full bg-white/75 border border-black/10 shadow-sm hover:shadow-md transition flex items-center justify-center gap-3">
              <span className="text-lg font-semibold">G</span>
              <span className="text-sm font-medium">Log in with Google</span>
            </button>

            <button className="h-12 w-full rounded-full bg-white/75 border border-black/10 shadow-sm hover:shadow-md transition flex items-center justify-center gap-3">
              <span className="text-lg font-semibold">f</span>
              <span className="text-sm font-medium">Log in with Facebook</span>
            </button>

            <button className="h-12 w-full rounded-full bg-white/75 border border-black/10 shadow-sm hover:shadow-md transition flex items-center justify-center gap-3">
              <span className="text-lg"></span>
              <span className="text-sm font-medium">Log in with Apple</span>
            </button>
          </div>

          <div className="my-6 h-px bg-black/10" />

          <div className="space-y-3">
            <div className="rounded-2xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-black/10">
              <div className="text-[11px] text-black/45">Username</div>
              <input
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="username"
              />
            </div>

            <div className="rounded-2xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-black/10">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-black/45">Password</div>
                <button
                  type="button"
                  className="text-black/45 hover:text-black/70 transition"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                  title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                >
                  👁
                </button>
              </div>
              <input
                className="w-full bg-transparent outline-none text-sm"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
              />
            </div>

            <button
              className="w-full rounded-full py-2.5 text-sm font-semibold transition hover:brightness-[1.03] active:scale-[0.99]"
              style={{
                background: "#0b0f14",
                color: "white",
              }}
            >
              Login
            </button>

            <button
              className="w-full text-xs text-black/45 hover:text-black/65 transition"
              onClick={() => router.push("/")}
            >
              ← Zurück zur Startseite
            </button>
          </div>

          <div className="mt-6 text-[11px] text-black/40">
            Hinweis: Account/SSO wird später umgesetzt (Google/Apple), aktuell ist dies ein UI-Platzhalter.
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="pb-4">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.tool</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              <span className="underline underline-offset-2 decoration-black/20">
                Impressum
              </span>
              <span className="underline underline-offset-2 decoration-black/20">
                Datenschutz
              </span>
              <span className="underline underline-offset-2 decoration-black/20">
                AGB
              </span>
            </div>
          </div>
        </div>
      </footer>

      <style jsx global>{`
        .login-sheen {
          background: radial-gradient(
            800px 420px at 22% 18%,
            rgba(255, 255, 255, 0.55),
            transparent 62%
          );
          animation: sheenMove2 12s ease-in-out infinite;
        }
        @keyframes sheenMove2 {
          0% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.55;
          }
          50% {
            transform: translate3d(2%, -1%, 0);
            opacity: 0.75;
          }
          100% {
            transform: translate3d(-2%, 0, 0);
            opacity: 0.55;
          }
        }
        .login-grain {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='.28'/%3E%3C/svg%3E");
          mix-blend-mode: soft-light;
        }
      `}</style>
    </main>
  );
}