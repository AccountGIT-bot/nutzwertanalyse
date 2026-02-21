"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "intro" | "landing";

export default function LandingWithIntro() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [text, setText] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // UI states for the input overlay
  const [isFocused, setIsFocused] = useState(false);

  const canStart = useMemo(() => text.trim().length > 0, [text]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("landing"), 3000);
    return () => clearTimeout(t);
  }, []);

  function start() {
    try {
      localStorage.setItem("nwa_decisionDraft", text.trim());
    } catch {}
    router.push("/app"); // führt zur Paketwahl (app/app/page.tsx)
  }

  const placeholderText = "WELCHE ENTSCHEIDUNG STEHT HEUTE AN...?";

  return (
    <main className="relative min-h-screen text-slate-900 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfb] to-[#eef1f1]" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(900px 650px at 20% 15%, rgba(0,115,106,0.26), transparent 58%), radial-gradient(700px 520px at 85% 45%, rgba(0,115,106,0.12), transparent 62%)",
          }}
        />
        {/* subtle animated sheen */}
        <div className="absolute inset-0 landing-sheen" />
        {/* subtle hex vibe without image */}
        <div className="absolute inset-0 landing-hex opacity-[0.12]" />
        {/* subtle vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_35%,transparent_55%,rgba(0,0,0,0.06)_100%)]" />
      </div>

      {/* INTRO OVERLAY */}
      <div
        className={[
          "fixed inset-0 z-50 grid place-items-center",
          "transition-all duration-700 ease-out",
          phase === "intro" ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
      >
        <div
          className={[
            "text-center transition-all duration-700 ease-out",
            phase === "intro"
              ? "translate-y-0 scale-100 opacity-100"
              : "-translate-y-3 scale-[0.98] opacity-0",
          ].join(" ")}
        >
          <div
            className="text-5xl md:text-6xl font-semibold tracking-tight"
            style={{ color: "#00736a" }}
          >
            Nutzwertanalyse<span className="opacity-90">.</span>
          </div>
          <div className="mt-4 text-sm text-black/45">
            Entscheidungen strukturiert treffen
          </div>
        </div>
      </div>

      {/* LANDING CONTENT */}
      <div
        className={[
          "mx-auto max-w-6xl px-5 sm:px-6",
          "py-10 sm:py-14 md:py-16",
          "transition-all duration-700 ease-out",
          phase === "landing" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Headline */}
        <div className="text-center">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight">
            <span style={{ color: "#00736a" }}>Nutzwertanalyse</span>
            <span style={{ color: "#00736a" }}>.</span>
          </h1>
        </div>

        {/* Search + Start (hero, big) */}
        <div className="mt-8 sm:mt-10 md:mt-12 flex justify-center">
          <div className="w-full max-w-4xl">
            <div className="relative rounded-[999px] bg-white/70 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md px-3 sm:px-4 py-3 sm:py-4">
              <div className="flex items-center gap-3 sm:gap-4">
                {/* icon bubble */}
                <div
                  className="h-12 w-12 sm:h-14 sm:w-14 shrink-0 rounded-full flex items-center justify-center"
                  style={{
                    background: "rgba(0,115,106,0.12)",
                    border: "1px solid rgba(0,115,106,0.20)",
                  }}
                  aria-hidden="true"
                >
                  <span style={{ color: "#00736a", fontSize: 18 }}>⌁</span>
                </div>

                {/* input with animated placeholder overlay */}
                <div className="relative w-full">
                  <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") start();
                    }}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    className={[
                      "w-full bg-transparent outline-none font-medium tracking-wide",
                      "text-sm sm:text-base",
                      "placeholder:text-transparent", // we draw our own placeholder
                      "pr-2",
                    ].join(" ")}
                    placeholder={placeholderText}
                    aria-label="Welche Entscheidung steht heute an?"
                  />

                  {/* Desktop placeholder (static) */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 hidden sm:flex items-center">
                      <span className="text-[#00736a]/75 text-sm sm:text-base font-semibold tracking-[0.18em] uppercase">
                        {placeholderText}
                      </span>
                    </div>
                  )}

                  {/* Mobile placeholder (marquee) */}
                  {!text && !isFocused && (
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex sm:hidden items-center w-full overflow-hidden">
                      <div className="w-full landing-marquee-mask">
                        <div className="landing-marquee text-[#00736a]/75 text-sm font-semibold tracking-[0.18em] uppercase whitespace-nowrap">
                          {placeholderText}&nbsp;&nbsp;&nbsp;•&nbsp;&nbsp;&nbsp;
                          {placeholderText}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={start}
                  disabled={!canStart}
                  className={[
                    "shrink-0 rounded-full px-6 sm:px-9 py-3 sm:py-3.5",
                    "text-sm sm:text-base font-semibold",
                    "transition-all duration-200",
                    "shadow-[0_18px_40px_rgba(0,0,0,0.10)]",
                    "active:scale-[0.99]",
                    canStart ? "hover:brightness-[1.04]" : "opacity-70 cursor-not-allowed",
                  ].join(" ")}
                  style={{
                    background: "#00736a",
                    color: "white",
                  }}
                  aria-label="Start"
                  title="Start"
                >
                  START
                </button>
              </div>
            </div>

            <div className="mt-4 text-center text-xs sm:text-sm text-black/45">
              Tipp: Du kannst ohne Login starten – Login kann später im Prozess erfolgen.
            </div>
          </div>
        </div>

        {/* Lower area */}
        <div className="mt-10 sm:mt-12 md:mt-14 flex justify-center">
          <div className="w-full max-w-4xl">
            {/* Desktop: Social + Login side-by-side, aligned */}
            <div className="hidden md:grid grid-cols-2 gap-8 items-stretch">
              <div className="landing-card p-5 sm:p-6">
                <div className="text-xs font-semibold text-black/50 mb-4">
                  Schnell anmelden (später echt)
                </div>

                <div className="flex flex-col gap-3">
                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition hover:-translate-y-[1px] hover:shadow-md">
                    <span className="text-lg font-semibold" aria-hidden="true">G</span>
                    <span>Log in with Google</span>
                  </button>

                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition hover:-translate-y-[1px] hover:shadow-md">
                    <span className="text-lg font-semibold" aria-hidden="true">f</span>
                    <span>Log in with Facebook</span>
                  </button>

                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition hover:-translate-y-[1px] hover:shadow-md">
                    <span className="text-lg" aria-hidden="true"></span>
                    <span>Log in with Apple</span>
                  </button>
                </div>
              </div>

              <div className="landing-card p-5 sm:p-6">
                <div className="text-center font-semibold text-black/65">Login</div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-[#00736a]/20">
                    <div className="text-[11px] text-black/45">Username</div>
                    <input
                      className="w-full bg-transparent outline-none text-sm"
                      autoComplete="username"
                    />
                  </div>

                  <div className="rounded-xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-[#00736a]/20">
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
                      background: "rgba(0,115,106,0.14)",
                      border: "1px solid rgba(0,115,106,0.22)",
                      color: "#00736a",
                    }}
                  >
                    Login
                  </button>

                  <div className="text-center text-[11px] text-black/45">
                    (Echte Anmeldung kommt später.)
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile: social buttons + collapsible login (smaller, unauffälliger) */}
            <div className="md:hidden space-y-4">
              <div className="landing-card p-4">
                <div className="flex flex-col gap-3">
                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition active:scale-[0.99]">
                    <span className="text-lg font-semibold" aria-hidden="true">G</span>
                    <span>Log in with Google</span>
                  </button>

                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition active:scale-[0.99]">
                    <span className="text-lg font-semibold" aria-hidden="true">f</span>
                    <span>Log in with Facebook</span>
                  </button>

                  <button className="landing-btn h-12 px-4 text-sm font-medium flex items-center justify-center gap-3 transition active:scale-[0.99]">
                    <span className="text-lg" aria-hidden="true"></span>
                    <span>Log in with Apple</span>
                  </button>
                </div>
              </div>

              <details className="landing-card p-4">
                <summary className="cursor-pointer select-none list-none flex items-center justify-between text-sm font-semibold text-black/60">
                  <span>Login (optional)</span>
                  <span className="text-black/40">▾</span>
                </summary>

                <div className="mt-4 space-y-3">
                  <div className="rounded-xl bg-white/70 border border-black/10 px-3 py-2">
                    <div className="text-[11px] text-black/45">Username</div>
                    <input className="w-full bg-transparent outline-none text-sm" />
                  </div>

                  <div className="rounded-xl bg-white/70 border border-black/10 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <div className="text-[11px] text-black/45">Password</div>
                      <button
                        type="button"
                        className="text-black/45 hover:text-black/70 transition"
                        onClick={(e) => {
                          e.preventDefault(); // prevent closing details
                          setShowPassword((v) => !v);
                        }}
                        aria-label={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                        title={showPassword ? "Passwort verbergen" : "Passwort anzeigen"}
                      >
                        👁
                      </button>
                    </div>
                    <input
                      className="w-full bg-transparent outline-none text-sm"
                      type={showPassword ? "text" : "password"}
                    />
                  </div>

                  <button
                    className="w-full rounded-full py-2.5 text-sm font-semibold transition active:scale-[0.99]"
                    style={{
                      background: "rgba(0,115,106,0.14)",
                      border: "1px solid rgba(0,115,106,0.22)",
                      color: "#00736a",
                    }}
                  >
                    Login
                  </button>

                  <div className="text-center text-[11px] text-black/45">
                    (Echte Anmeldung kommt später.)
                  </div>
                </div>
              </details>
            </div>
          </div>
        </div>
      </div>

      {/* Global CSS (only for this landing) */}
      <style jsx global>{`
        .landing-card {
          border-radius: 22px;
          background: rgba(255, 255, 255, 0.58);
          border: 1px solid rgba(0, 0, 0, 0.08);
          box-shadow: 0 24px 70px rgba(0, 0, 0, 0.10);
          backdrop-filter: blur(12px);
        }
        .landing-btn {
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.70);
          border: 1px solid rgba(0, 0, 0, 0.10);
          box-shadow: 0 16px 40px rgba(0, 0, 0, 0.08);
        }
        .landing-sheen {
          opacity: 0.55;
          background: radial-gradient(
            900px 500px at 10% 30%,
            rgba(0, 115, 106, 0.14),
            transparent 60%
          );
          animation: sheenMove 10s ease-in-out infinite;
        }
        @keyframes sheenMove {
          0% { transform: translate3d(-2%, 0, 0); opacity: 0.45; }
          50% { transform: translate3d(2%, -1%, 0); opacity: 0.65; }
          100% { transform: translate3d(-2%, 0, 0); opacity: 0.45; }
        }
        /* light hex pattern */
        .landing-hex {
          background-image:
            linear-gradient(30deg, rgba(0,0,0,0.08) 12%, transparent 12.5%, transparent 87%, rgba(0,0,0,0.08) 87.5%, rgba(0,0,0,0.08)),
            linear-gradient(150deg, rgba(0,0,0,0.08) 12%, transparent 12.5%, transparent 87%, rgba(0,0,0,0.08) 87.5%, rgba(0,0,0,0.08)),
            linear-gradient(90deg, rgba(0,0,0,0.06) 2%, transparent 2.5%, transparent 97%, rgba(0,0,0,0.06) 97.5%, rgba(0,0,0,0.06));
          background-size: 120px 208px;
          background-position: 0 0, 0 0, 0 0;
          mask-image: radial-gradient(900px 600px at 78% 35%, black 55%, transparent 78%);
          -webkit-mask-image: radial-gradient(900px 600px at 78% 35%, black 55%, transparent 78%);
        }

        /* marquee for mobile placeholder */
        .landing-marquee-mask {
          mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, black 12%, black 88%, transparent);
        }
        .landing-marquee {
          display: inline-block;
          animation: marquee 8s linear infinite;
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
      `}</style>
    </main>
  );
}