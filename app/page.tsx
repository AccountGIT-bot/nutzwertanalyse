"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "intro" | "landing";

export default function LandingWithIntro() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("intro");
  const [text, setText] = useState("");

  const canStart = useMemo(() => text.trim().length > 0, [text]);

  useEffect(() => {
    const t = setTimeout(() => setPhase("landing"), 3000);
    return () => clearTimeout(t);
  }, []);

  function start() {
    try {
      localStorage.setItem("nwa_decisionDraft", text.trim());
    } catch {}
    router.push("/app"); // ✅ führt zur Paketwahl (app/app/page.tsx)
  }

  return (
    <main className="landing-bg landing-hex text-slate-900">
      {/* INTRO OVERLAY */}
      <div
        className={[
          "fixed inset-0 z-50 grid place-items-center",
          "transition-all duration-700 ease-out",
          phase === "intro" ? "opacity-100" : "opacity-0 pointer-events-none",
        ].join(" ")}
        style={{
          background:
            "radial-gradient(900px 600px at 30% 20%, rgba(0,115,106,0.22), transparent 55%), linear-gradient(180deg, #fbfbfb, #eef1f1)",
        }}
      >
        <div
          className={[
            "text-center transition-all duration-700 ease-out",
            phase === "intro" ? "translate-y-0 scale-100" : "-translate-y-3 scale-[0.98]",
          ].join(" ")}
        >
          <div
            className="text-5xl md:text-6xl font-semibold tracking-tight"
            style={{ color: "rgb(var(--landing-accent))" }}
          >
            Nutzwertanalyse<span>.</span>
          </div>
          <div className="mt-4 text-sm text-black/45">
            Entscheidungen strukturiert treffen
          </div>
        </div>
      </div>

      {/* LANDING CONTENT */}
      <div
        className={[
          "mx-auto max-w-6xl px-6 py-14 md:py-20",
          "transition-all duration-700 ease-out",
          phase === "landing" ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
        ].join(" ")}
      >
        {/* Headline */}
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-semibold tracking-tight">
            <span style={{ color: "rgb(var(--landing-accent))" }}>Nutzwertanalyse</span>
            <span style={{ color: "rgb(var(--landing-accent))" }}>.</span>
          </h1>
        </div>

        {/* Search + Start */}
        <div className="mt-10 md:mt-12 flex justify-center">
          <div className="landing-pill w-full max-w-3xl px-4 py-3 md:px-5 md:py-4 flex items-center gap-3">
            {/* icon */}
            <div
              className="h-11 w-11 shrink-0 rounded-full flex items-center justify-center"
              style={{
                background: "rgba(0,115,106,0.12)",
                border: "1px solid rgba(0,115,106,0.20)",
              }}
              aria-hidden="true"
            >
              <span style={{ color: "rgb(var(--landing-accent))", fontSize: 18 }}>⌁</span>
            </div>

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") start();
              }}
              className="landing-input w-full text-sm md:text-base font-medium tracking-wide"
              placeholder="WELCHE ENTSCHEIDUNG STEHT HEUTE AN...?"
            />

            <button
              onClick={start}
              className="landing-start px-6 md:px-8 py-3 md:py-3.5 text-sm md:text-base font-semibold transition"
              style={{ opacity: canStart ? 1 : 0.78 }}
              aria-label="Start"
              title="Start"
            >
              START
            </button>
          </div>
        </div>

        {/* Lower area: Social + Login card (optisch, später funktional) */}
        <div className="mt-12 md:mt-16 grid gap-8 md:grid-cols-2 items-end">
          {/* Social buttons */}
          <div className="flex flex-col gap-3 md:max-w-sm">
            <button className="landing-btn px-4 py-3 text-sm font-medium flex items-center justify-center gap-3 transition hover:brightness-[1.02]">
              <span className="text-lg" aria-hidden="true">G</span>
              <span>Log in with Google</span>
            </button>

            <button className="landing-btn px-4 py-3 text-sm font-medium flex items-center justify-center gap-3 transition hover:brightness-[1.02]">
              <span className="text-lg" aria-hidden="true">f</span>
              <span>Log in with Facebook</span>
            </button>

            <button className="landing-btn px-4 py-3 text-sm font-medium flex items-center justify-center gap-3 transition hover:brightness-[1.02]">
              <span className="text-lg" aria-hidden="true"></span>
              <span>Log in with Apple</span>
            </button>
          </div>

          {/* Login card */}
          <div className="md:flex md:justify-end">
            <div className="landing-login-card w-full md:w-[320px] p-5">
              <div className="text-center font-semibold text-black/70">Login</div>

              <div className="mt-4 space-y-3">
                <div className="rounded-xl bg-white/60 border border-black/10 px-3 py-2">
                  <div className="text-[11px] text-black/45">Username</div>
                  <input className="w-full bg-transparent outline-none text-sm" />
                </div>

                <div className="rounded-xl bg-white/60 border border-black/10 px-3 py-2">
                  <div className="text-[11px] text-black/45">Password</div>
                  <input className="w-full bg-transparent outline-none text-sm" type="password" />
                </div>

                <button
                  className="w-full rounded-full py-2.5 text-sm font-semibold text-white transition"
                  style={{ background: "rgba(0,0,0,0.55)" }}
                >
                  Login
                </button>

                <div className="text-center text-[11px] text-black/45">
                  (Echte Anmeldung kommt später.)
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 md:mt-14 text-center text-xs text-black/40">
          Tipp: Du kannst ohne Login starten – Login kann später im Prozess erfolgen.
        </div>
      </div>
    </main>
  );
}