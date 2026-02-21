"use client";

import { useRouter } from "next/navigation";

export default function Landing() {
  const router = useRouter();

  return (
    <main className="mx-auto max-w-4xl px-6 py-24 text-white">
      <h1 className="text-5xl font-semibold tracking-tight text-center">
        Nutzwertanalyse<span style={{ color: `rgb(var(--accent))` }}>.</span>
      </h1>

      <p className="mt-6 text-center text-white/70 text-lg leading-relaxed">
        Starte eine neue Analyse oder wähle zuerst dein Paket.
      </p>

      <div className="mt-12 flex justify-center">
        <button
          onClick={() => router.push("/app")}
          className="rounded-full border border-white/15 bg-white/10 px-6 py-3 text-sm font-medium text-white/90 transition hover:bg-white/15"
        >
          Start
        </button>
      </div>

      <div className="mt-10 text-center text-xs text-white/50">
        (Landing wird später: 3s Animation + Suchfeld + optional Login)
      </div>
    </main>
  );
}