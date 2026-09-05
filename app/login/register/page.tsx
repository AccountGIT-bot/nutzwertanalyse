"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const BRAND_GREEN = "0 115 106"; // #00736a

type Form = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  address: string;
  company: string;
  acceptTerms: boolean;
};

type Field =
  | "firstName"
  | "lastName"
  | "email"
  | "password"
  | "confirmPassword"
  | "acceptTerms";

type Errors = Partial<Record<Field, string>>;

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

function strongEnough(pw: string) {
  return pw.length >= 8 && /\d/.test(pw);
}

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState<Form>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    company: "",
    acceptTerms: false,
  });

  const [touched, setTouched] = useState<Record<Field, boolean>>({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
    confirmPassword: false,
    acceptTerms: false,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [serverMsg, setServerMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authNotice, setAuthNotice] = useState<string | null>(null);

  // Trial note after 15s
  const [showTrial, setShowTrial] = useState(false);
  useEffect(() => {
    const t = window.setTimeout(() => setShowTrial(true), 15000);
    return () => window.clearTimeout(t);
  }, []);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};

    if (!form.firstName.trim()) e.firstName = "Vorname ist erforderlich.";
    if (!form.lastName.trim()) e.lastName = "Nachname ist erforderlich.";

    if (!form.email.trim()) e.email = "E-Mail ist erforderlich.";
    else if (!isEmail(form.email)) e.email = "Bitte eine gültige E-Mail eingeben.";

    if (!form.password) e.password = "Passwort ist erforderlich.";
    else if (!strongEnough(form.password)) e.password = "Min. 8 Zeichen und mindestens 1 Zahl.";

    if (!form.confirmPassword) e.confirmPassword = "Bitte Passwort bestätigen.";
    else if (form.confirmPassword !== form.password)
      e.confirmPassword = "Passwörter stimmen nicht überein.";

    if (!form.acceptTerms)
      e.acceptTerms = "Bitte AGB & Datenschutz akzeptieren, um fortzufahren.";

    return e;
  }, [form]);

  const canSubmit = Object.keys(errors).length === 0 && !isSubmitting;

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((p) => ({ ...p, [key]: value }));
  }

  function showError(field: Field) {
    return (touched[field] || submitAttempted) && !!errors[field];
  }

  function inputClass(hasError: boolean) {
    return [
      "h-11 w-full rounded-xl px-3 text-sm outline-none transition",
      "border bg-white/70 backdrop-blur-md",
      hasError
        ? "border-red-500/60 ring-4 ring-red-500/10"
        : "border-black/10 focus:ring-4",
    ].join(" ");
  }

  function startOAuth(provider: "apple" | "google") {
    setAuthNotice(
      `Die Registrierung mit ${provider === "apple" ? "Apple" : "Google"} ist noch nicht aktiviert. Sie können ohne Konto starten – alle Funktionen sind verfügbar.`
    );
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    setServerMsg(null);

    if (Object.keys(errors).length) return;

    // Es besteht noch keine Benutzerverwaltung – kein Konto vortäuschen.
    setServerMsg(
      "Die Registrierung ist noch nicht freigeschaltet. Sie können die Nutzwertanalyse ohne Konto in vollem Umfang nutzen – Ihre Daten bleiben lokal in Ihrem Browser."
    );
    try {
      setAuthNotice(null);
    } finally {
      setIsSubmitting(false);
    }
  }

  const pwStrength = useMemo(() => {
    const pw = form.password;
    if (!pw) return { label: "—", ok: false };
    if (strongEnough(pw)) return { label: "Gut", ok: true };
    if (pw.length >= 6) return { label: "Mittel", ok: false };
    return { label: "Schwach", ok: false };
  }, [form.password]);

  const oauthBtnBase =
    "w-full h-11 rounded-xl border border-black/10 bg-white/70 backdrop-blur-md " +
    "shadow-[0_14px_36px_rgba(0,0,0,0.10)] transition " +
    "hover:bg-white/85 hover:-translate-y-[1px] active:translate-y-0 " +
    "focus:outline-none focus-visible:ring-4";

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-x-hidden">
      <header className="sticky top-0 z-20">
        <div className="bg-white/0">
          <div className="mx-auto max-w-6xl px-5 sm:px-6 h-[68px] sm:h-[76px] flex items-center justify-between">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center gap-3 text-left"
              aria-label="Zurück zum Login"
              title="Login"
            >
              <div className="h-10 w-10 rounded-2xl overflow-hidden">
                <Image
                  src="/images/logo.webp"
                  alt="Nutzwertanalyse.com"
                  width={40}
                  height={40}
                  priority
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="text-sm sm:text-base font-semibold tracking-tight text-slate-900">
                  Registrierung<span className="opacity-60">.</span>
                </div>
                <div className="text-[11px] sm:text-xs text-black/45">
                  Pflichtfelder • Validierung • DSG
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push("/login")}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
            >
              Zum Login
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-14">
        <div className="grid gap-6 lg:gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
          {/* Form card */}
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md shadow-[0_22px_80px_rgba(0,0,0,0.12)]">
            {/* Right brand bar */}
            <div
              className="absolute top-0 bottom-0 right-0 w-[10px]"
              style={{
                background: `linear-gradient(180deg, rgb(${BRAND_GREEN} / 0.95), rgb(${BRAND_GREEN} / 0.70))`,
                boxShadow: `0 0 0 1px rgb(${BRAND_GREEN} / 0.22), 0 18px 60px rgb(${BRAND_GREEN} / 0.18)`,
              }}
            />

            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                background: `radial-gradient(900px 360px at 18% 0%, rgb(${BRAND_GREEN} / 0.14), transparent 60%), radial-gradient(900px 420px at 90% 50%, rgba(0,0,0,0.045), transparent 62%)`,
              }}
            />

            <div className="relative p-6 sm:p-8">
              <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                Account erstellen
              </div>

              <h1 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                Neu registrieren<span className="opacity-60">.</span>
              </h1>

              <p className="mt-2 text-sm text-black/55 leading-relaxed max-w-xl">
                Erstelle deinen Account, um Analysen zu speichern, Exporte zu generieren und deine
                Entscheid-Dokumentation sauber zu verwalten.
              </p>

              {/* Social register */}
              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => startOAuth("apple")}
                  className={oauthBtnBase}
                  style={{ borderColor: `rgb(${BRAND_GREEN} / 0.20)` }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="relative h-5 w-5">
                      <Image
                        src="/presets/Apple_logo_transparent.png"
                        alt="Apple"
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </span>
                    <span className="text-sm font-semibold text-black/70">Mit Apple registrieren</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => startOAuth("google")}
                  className={oauthBtnBase}
                  style={{ borderColor: `rgb(${BRAND_GREEN} / 0.20)` }}
                >
                  <div className="flex items-center justify-center gap-3">
                    <span className="relative h-5 w-5">
                      <Image
                        src="/presets/Google_logo_transparent.png"
                        alt="Google"
                        fill
                        sizes="20px"
                        className="object-contain"
                      />
                    </span>
                    <span className="text-sm font-semibold text-black/70">Mit Google registrieren</span>
                  </div>
                </button>

                <div className="flex items-center gap-3 pt-1">
                  <div className="h-px flex-1 bg-black/10" />
                  <div className="text-[11px] uppercase tracking-[0.28em] text-black/35">
                    oder
                  </div>
                  <div className="h-px flex-1 bg-black/10" />
                </div>
              </div>

              <form onSubmit={onSubmit} className="mt-4 space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      Vorname <span style={{ color: `rgb(${BRAND_GREEN})` }}>*</span>
                    </label>
                    <input
                      value={form.firstName}
                      onChange={(e) => set("firstName", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, firstName: true }))}
                      className={inputClass(showError("firstName"))}
                      placeholder="Hans"
                      autoComplete="given-name"
                      required
                    />
                    {showError("firstName") && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.firstName}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      Nachname <span style={{ color: `rgb(${BRAND_GREEN})` }}>*</span>
                    </label>
                    <input
                      value={form.lastName}
                      onChange={(e) => set("lastName", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, lastName: true }))}
                      className={inputClass(showError("lastName"))}
                      placeholder="Mustermann"
                      autoComplete="family-name"
                      required
                    />
                    {showError("lastName") && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.lastName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1.5">
                    Adresse (optional)
                  </label>
                  <input
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    className={inputClass(false)}
                    placeholder="Musterstrasse 1, 5000 Aarau"
                    autoComplete="street-address"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1.5">
                    Firma (optional)
                  </label>
                  <input
                    value={form.company}
                    onChange={(e) => set("company", e.target.value)}
                    className={inputClass(false)}
                    placeholder="Musterfirma AG"
                    autoComplete="organization"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black/60 mb-1.5">
                    E-Mail <span style={{ color: `rgb(${BRAND_GREEN})` }}>*</span>
                  </label>
                  <input
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                    className={inputClass(showError("email"))}
                    placeholder="hans.mustermann@muster.ch"
                    autoComplete="email"
                    inputMode="email"
                    type="email"
                    required
                  />
                  {showError("email") && (
                    <div className="mt-1.5 text-xs text-red-600/90">{errors.email}</div>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      Passwort <span style={{ color: `rgb(${BRAND_GREEN})` }}>*</span>
                    </label>
                    <input
                      value={form.password}
                      onChange={(e) => set("password", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className={inputClass(showError("password"))}
                      placeholder="Min. 8 Zeichen + Zahl"
                      type="password"
                      autoComplete="new-password"
                      required
                      minLength={8}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-xs">
                      <span className="text-black/45">
                        Stärke:{" "}
                        <span
                          className={pwStrength.ok ? "font-semibold" : "text-black/55"}
                          style={pwStrength.ok ? { color: `rgb(${BRAND_GREEN})` } : undefined}
                        >
                          {pwStrength.label}
                        </span>
                      </span>
                      <span className="text-black/35">Empfohlen: 12+ Zeichen</span>
                    </div>
                    {showError("password") && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.password}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      Passwort bestätigen <span style={{ color: `rgb(${BRAND_GREEN})` }}>*</span>
                    </label>
                    <input
                      value={form.confirmPassword}
                      onChange={(e) => set("confirmPassword", e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, confirmPassword: true }))}
                      className={inputClass(showError("confirmPassword"))}
                      placeholder="Nochmals eingeben"
                      type="password"
                      autoComplete="new-password"
                      required
                    />
                    {showError("confirmPassword") && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.confirmPassword}</div>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <div className="pt-1">
                  <label
                    className={[
                      "flex items-start gap-3 rounded-2xl p-4 border transition",
                      "bg-white/55 backdrop-blur-md",
                      showError("acceptTerms")
                        ? "border-red-500/50 ring-4 ring-red-500/10"
                        : "border-black/10",
                    ].join(" ")}
                  >
                    <input
                      type="checkbox"
                      checked={form.acceptTerms}
                      onChange={(e) => set("acceptTerms", e.target.checked)}
                      onBlur={() => setTouched((t) => ({ ...t, acceptTerms: true }))}
                      className="mt-1 h-4 w-4"
                      required
                    />
                    <div className="text-sm text-black/60 leading-relaxed">
                      Ich akzeptiere{" "}
                      <a className="underline underline-offset-4 decoration-black/20 hover:text-black/80" href="/agb">
                        AGB
                      </a>{" "}
                      und{" "}
                      <a className="underline underline-offset-4 decoration-black/20 hover:text-black/80" href="/datenschutz">
                        Datenschutz (DSG)
                      </a>
                      . <span style={{ color: `rgb(${BRAND_GREEN})` }} className="font-semibold">*</span>
                      {showError("acceptTerms") && (
                        <div className="mt-1.5 text-xs text-red-600/90">{errors.acceptTerms}</div>
                      )}
                    </div>
                  </label>
                </div>

                {/* Trial note after 15s */}
                <div
                  className={[
                    "transition-all duration-700 ease-out",
                    showTrial
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-2 pointer-events-none h-0 overflow-hidden",
                  ].join(" ")}
                >
                  <div
                    className="mt-2 rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      borderColor: `rgb(${BRAND_GREEN} / 0.22)`,
                      background: `rgb(${BRAND_GREEN} / 0.08)`,
                      color: "rgba(0,0,0,0.72)",
                    }}
                  >
                    <div className="font-extrabold tracking-[0.10em]" style={{ color: `rgb(${BRAND_GREEN})` }}>
                      14 TAGE KOSTENLOSE TESTVERSION
                    </div>
                    <div className="mt-1 text-black/60">
                      Unsere Software können Sie 14 Tage kostenlos testen – ohne Risiko.
                    </div>
                  </div>
                </div>

{authNotice && (
                  <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.08] px-4 py-3 text-sm text-amber-900">
                    <div className="font-medium">{authNotice}</div>
                    <a
                      href="/app"
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold underline underline-offset-4"
                    >
                      Ohne Konto starten →
                    </a>
                  </div>
                )}

                                {serverMsg && (
                  <div
                    className="rounded-2xl border px-4 py-3 text-sm"
                    style={{
                      borderColor: `rgb(${BRAND_GREEN} / 0.22)`,
                      background: `rgb(${BRAND_GREEN} / 0.10)`,
                      color: "rgba(0,0,0,0.78)",
                    }}
                  >
                    {serverMsg}
                  </div>
                )}

                <div className="flex items-center justify-between gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => router.push("/login")}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
                  >
                    Abbrechen
                  </button>

                  <button
                    type="submit"
                    disabled={!canSubmit}
                    className={[
                      "rounded-full px-6 py-2.5 text-sm font-semibold transition",
                      "shadow-[0_16px_34px_rgba(0,0,0,0.10)] active:scale-[0.99]",
                      canSubmit
                        ? "text-white hover:brightness-[1.05]"
                        : "bg-black/60 text-white/90 opacity-70 cursor-not-allowed",
                    ].join(" ")}
                    style={canSubmit ? { background: `rgb(${BRAND_GREEN})` } : undefined}
                  >
                    {isSubmitting ? "…" : "Account erstellen"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Side info card */}
          <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/55 backdrop-blur-md shadow-[0_22px_80px_rgba(0,0,0,0.10)]">
            <div
              className="absolute top-0 bottom-0 right-0 w-[10px]"
              style={{
                background: `linear-gradient(180deg, rgb(${BRAND_GREEN} / 0.95), rgb(${BRAND_GREEN} / 0.70))`,
                boxShadow: `0 0 0 1px rgb(${BRAND_GREEN} / 0.18)`,
              }}
            />
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(700px 260px at 20% 0%, rgb(${BRAND_GREEN} / 0.12), transparent 60%)`,
              }}
            />
            <div className="relative p-6 sm:p-8">
              <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                Was du bekommst
              </div>

              <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-tight">
                Speichern. Exportieren. Nachvollziehen<span className="opacity-60">.</span>
              </div>

              <ul className="mt-4 space-y-2.5 text-sm text-black/65">
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${BRAND_GREEN})` }} />
                  Analysen & Versionen speichern
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${BRAND_GREEN})` }} />
                  PDF Report / Entscheidungsdokumentation
                </li>
                <li className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full" style={{ background: `rgb(${BRAND_GREEN})` }} />
                  DSG & Governance-Ready Struktur
                </li>
              </ul>

              <div className="mt-6 text-xs text-black/45 leading-relaxed">
                Hinweis: UI/Validierung ist bereit. Auth-Anbindung kommt als nächster Schritt.
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-[11px] text-black/40">
          © {new Date().getFullYear()} Nutzwertanalyse.com
        </div>
      </section>
    </main>
  );
}
