"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Slot = { r: number; c: number };

type FloatingQuote = {
  id: string;
  text: string;
  slot: Slot;
  rotate: number;
  phase: "in" | "out"; // for fade in/out
  bornAt: number;
  lifeMs: number;
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

      // 10 zusätzliche, abwechslungsreiche
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

  // Grid slots => verhindert Overlap
  const GRID = { rows: 4, cols: 5 }; // 20 Slots

  const allSlots = useMemo(() => {
    const slots: Slot[] = [];
    for (let r = 0; r < GRID.rows; r++) {
      for (let c = 0; c < GRID.cols; c++) slots.push({ r, c });
    }
    return slots;
  }, [GRID.rows, GRID.cols]);

  const [quotes, setQuotes] = useState<FloatingQuote[]>([]);

  const timersRef = useRef<number[]>([]);
  const usedRecentlyRef = useRef<string[]>([]);

  function clearAllTimers() {
    timersRef.current.forEach((t) => window.clearTimeout(t));
    timersRef.current = [];
  }

  function rand(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  function pickText(exclude: string[]) {
    // avoid recently used to keep it feeling “fresh”
    const recent = new Set(usedRecentlyRef.current);
    const candidates = MICRO_TEXTS.filter((t) => !recent.has(t) && !exclude.includes(t));
    const pool = candidates.length ? candidates : MICRO_TEXTS.filter((t) => !exclude.includes(t));
    const text = pool[Math.floor(Math.random() * pool.length)] ?? MICRO_TEXTS[0];

    usedRecentlyRef.current = [text, ...usedRecentlyRef.current].slice(0, 10);
    return text;
  }

  function pickFreeSlot(current: FloatingQuote[]) {
    const used = new Set(current.map((q) => `${q.slot.r}-${q.slot.c}`));
    const free = allSlots.filter((s) => !used.has(`${s.r}-${s.c}`));
    if (!free.length) return null;
    return free[Math.floor(Math.random() * free.length)];
  }

  function spawnOne() {
    setQuotes((prev) => {
      // limit how many are concurrently visible (premium, nicht “zu voll”)
      const maxVisible = 6;
      if (prev.filter((p) => p.phase === "in").length >= maxVisible) return prev;

      const slot = pickFreeSlot(prev);
      if (!slot) return prev;

      const text = pickText(prev.map((p) => p.text));
      const q: FloatingQuote = {
        id: `q-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        text,
        slot,
        rotate: rand(-8, 8),
        phase: "in",
        bornAt: Date.now(),
        lifeMs: Math.floor(rand(5200, 9800)), // stays visible for a random time
      };
      return [...prev, q];
    });
  }

  function scheduleLoop() {
    // Spawn intervals: each quote has its own random timing -> organic
    const nextInMs = Math.floor(rand(900, 2300));
    const t = window.setTimeout(() => {
      spawnOne();
      scheduleLoop();
    }, nextInMs);
    timersRef.current.push(t);
  }

  useEffect(() => {
    // initial: start with 3 quotes so it feels alive, then random spawns
    const initial = window.setTimeout(() => {
      spawnOne();
      window.setTimeout(spawnOne, 450);
      window.setTimeout(spawnOne, 900);
      scheduleLoop();
    }, 250);
    timersRef.current.push(initial);

    return () => clearAllTimers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // per quote lifetime -> fade out -> remove (soft)
    // we do it by scheduling timeouts when quotes change
    // keep it simple: schedule for each "in" quote if not already scheduled via bornAt
    quotes.forEach((q) => {
      if (q.phase !== "in") return;

      const age = Date.now() - q.bornAt;
      const remaining = Math.max(0, q.lifeMs - age);

      // after remaining: mark as out (fade)
      const t1 = window.setTimeout(() => {
        setQuotes((prev) =>
          prev.map((x) => (x.id === q.id ? { ...x, phase: "out" } : x))
        );
      }, remaining);

      // after remaining + fadeDuration: remove
      const fadeMs = 900;
      const t2 = window.setTimeout(() => {
        setQuotes((prev) => prev.filter((x) => x.id !== q.id));
      }, remaining + fadeMs);

      timersRef.current.push(t1, t2);
    });

    // don’t return cleanup here, global cleanup is enough;
    // otherwise we'd remove timers too aggressively.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quotes.length]);

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-hidden">

      {/* Organic rotating quotes (no overlap by slot-grid) */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
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
          {quotes.map((q) => (
            <div
              key={q.id}
              style={{
                gridColumn: q.slot.c + 1,
                gridRow: q.slot.r + 1,
                alignSelf: "center",
                justifySelf: "center",
                transform: `rotate(${q.rotate}deg)`,
                color: "rgba(0,115,106,0.98)", // slightly more saturated
                fontSize: "clamp(13px, 1.35vw, 17px)",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
                opacity: q.phase === "in" ? 0.34 : 0,
                transition: "opacity 900ms ease, transform 1400ms ease",
                filter: "blur(0.15px)",
                textShadow: "0 1px 0 rgba(255,255,255,0.22)",
              }}
            >
              {q.text}
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
      <div className="relative z-10 min-h-[calc(100svh-76px)] flex items-center justify-center px-6 py-10">
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
              <input className="w-full bg-transparent outline-none text-sm" autoComplete="username" />
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
      <footer className="relative z-10 pb-4">
        <div className="mx-auto max-w-6xl px-5 sm:px-6">
          <div className="h-px bg-black/10" />
          <div className="pt-3 text-[10px] sm:text-[11px] text-black/40 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} Nutzwertanalyse.tool</div>
            <div className="flex flex-wrap gap-x-3 gap-y-1">
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
        </div>
      </footer>

      <style jsx global>{`
  @media (prefers-reduced-motion: reduce) {
    * {
      scroll-behavior: auto !important;
    }
  }
`}</style>
    </main>
  );
}