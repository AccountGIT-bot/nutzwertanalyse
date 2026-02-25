"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Errors = Partial<Record<"email" | "password", string>>;

const BRAND_GREEN = "0 115 106"; // #00736a

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [touched, setTouched] = useState<{ email: boolean; password: boolean }>({
    email: false,
    password: false,
  });

  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Right invite appears after 3s
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setShowInvite(true), 3000);
    return () => window.clearTimeout(t);
  }, []);

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    if (!email.trim()) e.email = "Bitte E-Mail eingeben.";
    else if (!isEmail(email)) e.email = "Bitte eine gültige E-Mail eingeben.";

    if (!password) e.password = "Bitte Passwort eingeben.";
    else if (password.length < 6) e.password = "Passwort ist zu kurz (min. 6 Zeichen).";

    return e;
  }, [email, password]);

  const canSubmit = Object.keys(errors).length === 0;

  function fieldClass(hasError: boolean) {
    return [
      "h-11 w-full rounded-xl px-3 text-sm outline-none transition",
      "border bg-white/70 backdrop-blur-md",
      hasError
        ? "border-red-500/60 ring-4 ring-red-500/10"
        : "border-black/10 focus:ring-4",
    ].join(" ");
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitAttempted(true);
    if (!canSubmit) return;

    // TODO: echtes Login (API/Auth)
    router.push("/app");
  }

  const showEmailError = (touched.email || submitAttempted) && !!errors.email;
  const showPwError = (touched.password || submitAttempted) && !!errors.password;

  return (
    <main className="premium-light-bg relative min-h-[100svh] text-slate-900 overflow-x-hidden">
      {/* Header */}
      <header className="sticky top-0 z-20">
        <div className="bg-white/0">
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
                  Login • Speichern • Export • Governance-ready
                </div>
              </div>
            </button>

            <button
              onClick={() => router.push("/app")}
              className="rounded-full px-4 py-2 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
              title="Ohne Login starten"
            >
              Ohne Login starten
            </button>
          </div>
          <div className="h-px bg-black/10" />
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-5 sm:px-6 py-10 sm:py-14">
        {/* Stage: after 3s, we add right padding on lg to make room for the invite panel */}
        <div
          className={[
            "relative",
            "transition-[padding] duration-700 ease-out",
            showInvite ? "lg:pr-[460px]" : "lg:pr-0",
          ].join(" ")}
        >
          {/* Right panel (slides in after 3s) */}
          <div
            className={[
              "hidden lg:block",
              "absolute top-0 right-0 w-[420px] xl:w-[460px]",
              "transition-all duration-700 ease-out",
              showInvite
                ? "opacity-100 translate-x-0 pointer-events-auto"
                : "opacity-0 translate-x-8 pointer-events-none",
            ].join(" ")}
            style={{ zIndex: 20 }}
          >
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/55 backdrop-blur-md shadow-[0_22px_80px_rgba(0,0,0,0.10)] min-h-[320px]">
              {/* Brand green bar */}
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
                  background: `radial-gradient(900px 360px at 18% 0%, rgb(${BRAND_GREEN} / 0.12), transparent 60%), radial-gradient(900px 420px at 90% 55%, rgba(0,0,0,0.045), transparent 62%)`,
                }}
              />

              <div className="relative p-6 sm:p-8 h-full flex flex-col justify-center">
                <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                  Neu hier?
                </div>

                <div className="mt-2 text-2xl sm:text-3xl font-semibold tracking-tight">
                  Sind Sie neu<span className="opacity-60">?</span>
                </div>

                <p className="mt-2 text-sm text-black/55 leading-relaxed">
                  Registrieren Sie sich jetzt und speichern Sie Analysen, erstellen Reports (PDF)
                  und dokumentieren Entscheide nachvollziehbar.
                </p>

                <div className="mt-5 flex items-center gap-3">
                  <button
                    onClick={() => router.push("/login/register")}
                    className="rounded-full px-6 py-2.5 text-sm font-semibold transition active:scale-[0.99]"
                    style={{
                      background: `rgb(${BRAND_GREEN} / 0.12)`,
                      border: `1px solid rgb(${BRAND_GREEN} / 0.28)`,
                      color: `rgb(${BRAND_GREEN})`,
                      boxShadow: `0 16px 34px rgb(${BRAND_GREEN} / 0.12)`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = `0 18px 46px rgb(${BRAND_GREEN} / 0.20)`;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = `0 16px 34px rgb(${BRAND_GREEN} / 0.12)`;
                    }}
                  >
                    Registrieren
                  </button>

                  <button
                    onClick={() => router.push("/")}
                    className="rounded-full px-5 py-2.5 text-sm font-semibold border border-black/10 bg-white/70 hover:bg-white/85 transition"
                  >
                    Zurück zur Startseite
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => router.push("/login")}
                  className="mt-4 text-sm text-black/55 hover:text-black/80 underline underline-offset-4 decoration-black/20 transition"
                >
                  Bereits registriert? Zum Login
                </button>

                <div className="mt-4 text-xs text-black/45">
                  DSG-konform • Pflichtfelder • klare Validierung
                </div>
              </div>
            </div>
          </div>

          {/* Login card (stays centered; padding makes room later) */}
          <div className="mx-auto lg:mx-0 max-w-xl relative" style={{ zIndex: 30 }}>
            <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/70 backdrop-blur-md shadow-[0_22px_80px_rgba(0,0,0,0.12)]">
              {/* Brand green bar on login card */}
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
                  background: `radial-gradient(800px 320px at 16% 0%, rgb(${BRAND_GREEN} / 0.12), transparent 60%), radial-gradient(900px 420px at 90% 40%, rgba(0,0,0,0.045), transparent 62%)`,
                }}
              />

              <div className="relative p-6 sm:p-8">
                <div className="text-[11px] sm:text-xs tracking-[0.28em] uppercase text-black/45">
                  Account • Login
                </div>

                <h1
                  className="mt-2 text-3xl sm:text-4xl font-extrabold tracking-tight"
                  style={{ color: `rgb(${BRAND_GREEN})` }}
                >
                  Willkommen zurück<span className="opacity-60">.</span>
                </h1>

                <p className="mt-2 text-sm text-black/55 leading-relaxed max-w-xl">
                  Melde dich an, um Analysen zu speichern, Exporte zu erstellen und deine Dokumentation
                  auditfähig zu verwalten.
                </p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      E-Mail
                    </label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, email: true }))}
                      className={fieldClass(showEmailError)}
                      placeholder="hans.mustermann@muster.ch"
                      autoComplete="email"
                      inputMode="email"
                      style={
                        showEmailError
                          ? undefined
                          : {
                              borderColor: "rgba(0,0,0,0.10)",
                            }
                      }
                    />
                    {showEmailError && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.email}</div>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-black/60 mb-1.5">
                      Passwort
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onBlur={() => setTouched((t) => ({ ...t, password: true }))}
                      className={fieldClass(showPwError)}
                      placeholder="••••••••"
                      type="password"
                      autoComplete="current-password"
                    />
                    {showPwError && (
                      <div className="mt-1.5 text-xs text-red-600/90">{errors.password}</div>
                    )}
                  </div>

                  <div className="flex items-center justify-between gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => alert("TODO: Passwort-Reset")}
                      className="text-sm text-black/55 hover:text-black/80 underline underline-offset-4 decoration-black/20"
                    >
                      Passwort vergessen?
                    </button>

                    <button
                      type="submit"
                      className={[
                        "rounded-full px-6 py-2.5 text-sm font-semibold transition",
                        "shadow-[0_16px_34px_rgba(0,0,0,0.10)] active:scale-[0.99]",
                        canSubmit
                          ? "text-white hover:brightness-[1.05]"
                          : "bg-black/60 text-white/90 opacity-70 cursor-not-allowed",
                      ].join(" ")}
                      style={canSubmit ? { background: `rgb(${BRAND_GREEN})` } : undefined}
                      disabled={!canSubmit}
                    >
                      Login
                    </button>
                  </div>

                  <div className="pt-2 text-xs text-black/45">
                    Hinweis: Ohne Account kannst du trotzdem starten – Registrierung ist für Speichern/Export.
                  </div>
                </form>

                {/* Mobile: invite appears after 3s as a block below */}
                {showInvite && (
                  <div className="lg:hidden mt-6 overflow-hidden rounded-2xl border border-black/10 bg-white/55 backdrop-blur-md">
                    <div
                      className="h-[6px]"
                      style={{
                        background: `linear-gradient(90deg, rgb(${BRAND_GREEN}), rgb(${BRAND_GREEN} / 0.70))`,
                      }}
                    />
                    <div className="p-4">
                      <div className="text-xs tracking-[0.28em] uppercase text-black/45">
                        Neu hier?
                      </div>
                      <div className="mt-1 text-lg font-semibold">Sind Sie neu?</div>
                      <p className="mt-1.5 text-sm text-black/55">
                        Registrieren Sie sich jetzt – Speichern, Export, Dokumentation.
                      </p>
                      <button
                        onClick={() => router.push("/login/register")}
                        className="mt-3 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.99]"
                        style={{
                          background: `rgb(${BRAND_GREEN} / 0.12)`,
                          border: `1px solid rgb(${BRAND_GREEN} / 0.28)`,
                          color: `rgb(${BRAND_GREEN})`,
                        }}
                      >
                        Registrieren
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-[11px] text-black/40">
          © {new Date().getFullYear()} Nutzwertanalyse.tool
        </div>
      </section>
    </main>
  );
}