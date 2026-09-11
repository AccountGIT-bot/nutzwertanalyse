"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    // Ohne Backend: neutrale Bestätigung (verrät nicht, ob ein Konto existiert)
    setSubmitted(true);
  };

  return (
    <main className="premium-light-bg flex min-h-[100svh] items-center justify-center px-5 py-10">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mb-6 inline-flex min-h-11 items-center gap-2 text-sm text-black/55 transition hover:text-black/80"
        >
          <ArrowLeft className="h-4 w-4" />
          Zurück zur Anmeldung
        </button>

        <div className="landing-login-card p-6 sm:p-8">
          {submitted ? (
            <div className="text-center">
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-[#00736a]/10">
                <CheckCircle2 className="h-7 w-7 text-[#00736a]" />
              </div>
              <h1 className="mb-2 text-xl font-semibold text-black/80">E-Mail versendet</h1>
              <p className="text-pretty text-sm leading-relaxed text-black/55">
                Falls ein Konto mit <span className="font-medium text-black/70">{email}</span>{" "}
                existiert, erhalten Sie in Kürze eine E-Mail mit Anweisungen zum Zurücksetzen Ihres
                Passworts.
              </p>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="landing-start mt-6 min-h-11 w-full font-semibold"
              >
                Zur Anmeldung
              </button>
            </div>
          ) : (
            <>
              <h1 className="mb-2 text-2xl font-semibold text-black/80">Passwort vergessen?</h1>
              <p className="mb-6 text-pretty text-sm leading-relaxed text-black/55">
                Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link zum Zurücksetzen
                Ihres Passworts.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-black/70">
                    E-Mail-Adresse
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                    <input
                      id="email"
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@unternehmen.de"
                      className="landing-field w-full pl-9 text-base"
                    />
                  </div>
                </div>

                <button type="submit" className="landing-start min-h-11 w-full font-semibold">
                  Link senden
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
