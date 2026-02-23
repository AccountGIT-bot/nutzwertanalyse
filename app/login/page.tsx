"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = { r: number; c: number };

type RotatingItem = {
  id: string;
  text: string;
  slot: Slot;
  rotate: string;
  opacity: number;
};

function shuffle<T>(arr: T[]) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const MICRO_TEXTS = useMemo(
    () => [
      // existing-ish + improved mix
      "Nutzwert = Summe gewichteter Kriterien",
      "Transparenz statt Bauchgefühl",
      "Vergleichbarkeit über Alternativen",
      "Gewichtung: 100%-Methode",
      "AHP: Struktur & Konsistenz",
      "Sensitivität: Was ändert das Ergebnis?",
      "Dokumentation = Entscheidungsqualität",
      "Kriterien sauber definieren",
      "Governance: nachvollziehbare Begründung",
      "DSG: Datenminimierung & Zweckbindung",
      "Risiken sichtbar machen",
      "Entscheidungen auditfähig machen",

      // ✅ 10 neue, abwechslungsreiche
      "Entscheidungslogik: konsistent & prüfbar",
      "Prioritäten sichtbar – Konflikte reduzieren",
      "Kriterienkataloge: wiederverwendbar",
      "Stakeholder-Input strukturiert erfassen",
      "Trade-offs klar kommunizieren",
      "Qualität: Methode vor Meinung",
      "Bewertungsskala: einheitlich & verständlich",
      "Entscheidungsreport: kompakt & sauber",
      "Versionierung: Änderungen nachvollziehbar",
      "Szenarien: Varianten transparent vergleichen",
    ],
    []
  );

  // 5x4 grid => 20 slots, guaranteed no overlap
  const GRID = { rows: 4, cols: 5 };

  const [items, setItems] = useState<RotatingItem[]>([]);

  useEffect(() => {
    // Build all slots
    const slots: Slot[] = [];
    for (let r = 0; r < GRID.rows; r++) {
      for (let c = 0; c < GRID.cols; c++) slots.push({ r, c });
    }

    // pick 5 unique slots per render cycle
    const pickCount = 5;

    function buildSet(): RotatingItem[] {
      const texts = shuffle(MICRO_TEXTS).slice(0, pickCount);
      const chosenSlots = shuffle(slots).slice(0, pickCount);

      return texts.map((text, i) => ({
        id: `it-${Date.now()}-${i}`,
        text,
        slot: chosenSlots[i],
        rotate: `${(Math.random() * 14 - 7).toFixed(1)}deg`,
        opacity: 0.22 + Math.random() * 0.12, // 0.22–0.34 (satter)
      }));
    }

    // initial
    setItems(buildSet());

    // rotate every 6.5s
    const t = window.setInterval(() => {
      setItems(buildSet());
    }, 6500);

    return () => window.clearInterval(t);
  }, [MICRO_TEXTS]);

  return (
    <main className="relative min-h-[100svh] text-slate-900 overflow-hidden">
      {/* Background */}
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

      {/* Rotating micro-text layer (no overlap via grid slots) */}
      <div className="absolute inset-0 -z-10 pointer-events-none select-none">
        <div
          className="absolute inset-0"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${GRID.cols}, 1fr)`,
            gridTemplateRows: `repeat(${GRID.rows}, 1fr)`,
            padding: "6%",
            gap: "2.5%",
          }}
        >
          {items.map((it) => (
            <div
              key={it.id}
              className="login-quote"
              style={{
                gridColumn: it.slot.c + 1,
                gridRow: it.slot.r + 1,
                alignSelf: "center",
                justifySelf: "center",
                transform: `rotate(${it.rotate})`,
                color: "rgba(0,115,106,0.98)",
                opacity: it.opacity,
                fontSize: "clamp(12px, 1.25vw, 16px)", // bigger
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                filter: "blur(0.15px)",
                textShadow: "0 1px 0 rgba(255,255,255,0.25)",
                whiteSpace: "nowrap",
              }}
            >
              {it.text}
            </div>
          ))}
        </div>
      </div>

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
        <div className="w-full max-w-md rounded-3xl bg-white/72 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6 sm:p-7">
          <div className="text-center">
            <div className="text-3xl font-semibold tracking-tight text-slate-900">
              Login
            </div>
            <div className="mt-2 text-sm text-black/45">
              (SSO & echte Anmeldung kommen später — UI ist vorbereitet.)
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
            <div className="rounded-2xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-[#00736a]/15">
              <div className="text-[11px] text-black/45">Username</div>
              <input
                className="w-full bg-transparent outline-none text-sm"
                autoComplete="username"
              />
            </div>

            <div className="rounded-2xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-[#00736a]/15">
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
              style={{ background: "#0b0f14", color: "white" }}
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
            Hinweis: Dies ist ein Platzhalter. Echte Authentifizierung (Google/Apple) folgt später.
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
              <a
                href="/impressum"
                className="underline underline-offset-2 decoration-black/20"
              >
                Impressum
              </a>
              <a href="/agb" className="underline underline-offset-2 decoration-black/20">
                AGB
              </a>
              <a
                href="/datenschutz"
                className="underline underline-offset-2 decoration-black/20"
              >
                Datenschutz
              </a>
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
        .login-quote {
          animation: quoteFloat 8s ease-in-out infinite;
          will-change: transform, opacity;
        }
        @keyframes quoteFloat {
          0% {
            transform: translateY(0px) rotate(var(--r, 0deg));
          }
          50% {
            transform: translateY(-10px) rotate(var(--r, 0deg));
          }
          100% {
            transform: translateY(0px) rotate(var(--r, 0deg));
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .login-quote {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}