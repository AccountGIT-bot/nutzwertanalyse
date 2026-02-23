"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12 bg-gradient-to-b from-[#fbfbfb] to-[#eef1f1] text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white/70 border border-black/10 shadow-[0_30px_80px_rgba(0,0,0,0.10)] backdrop-blur-md p-6">
        <div className="text-center">
          <div className="text-3xl font-semibold tracking-tight" style={{ color: "#00736a" }}>
            Login
          </div>
          <div className="mt-2 text-sm text-black/45">(Echte Anmeldung kommt später.)</div>
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
          <div className="rounded-xl bg-white/70 border border-black/10 px-3 py-2 focus-within:ring-2 focus-within:ring-[#00736a]/20">
            <div className="text-[11px] text-black/45">Username</div>
            <input className="w-full bg-transparent outline-none text-sm" autoComplete="username" />
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

          <button
            className="w-full text-xs text-black/45 hover:text-black/65 transition"
            onClick={() => router.push("/")}
          >
            ← Zurück zur Startseite
          </button>
        </div>
      </div>
    </main>
  );
}