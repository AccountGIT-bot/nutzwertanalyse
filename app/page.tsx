"use client";
import { useState, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Truck,
  Code2,
  Factory,
  Car,
  Users,
  Coins,
  FolderOpen,
  Laptop,
  Check,
} from "lucide-react";
import { SiteHeader, SiteFooter } from "./components/SiteChrome";
import { interpretDecisionInput } from "./lib/nwa/interpretation-engine";
import { readDraft, storeStart, START_KEY } from "./lib/nwa/local-data";

const presets = [
  {
    id: "supplier",
    label: "Lieferanten",
    description: "Qualität, Kosten & Zuverlässigkeit",
    icon: Truck,
  },
  {
    id: "software",
    label: "Software",
    description: "Funktionen, Aufwand & Integration",
    icon: Code2,
  },
  {
    id: "investment",
    label: "Investitionen",
    description: "Nutzen, Ressourcen & Risiken",
    icon: Coins,
  },
  {
    id: "machines",
    label: "Maschinen",
    description: "Leistung, Betrieb & Sicherheit",
    icon: Factory,
  },
  {
    id: "vehicle",
    label: "Fahrzeuge",
    description: "Kosten, Alltag & Komfort",
    icon: Car,
  },
  {
    id: "employee",
    label: "Personalauswahl",
    description: "Jobbezogene Kompetenzen vergleichen",
    icon: Users,
  },
];

function subscribeDraft(listener: () => void) {
  window.addEventListener("storage", listener);
  return () => window.removeEventListener("storage", listener);
}
const getDraftTitle = () => readDraft()?.decision.title || null;
const getServerDraft = () => null;

export default function Home() {
  const router = useRouter();
  const [input, setInput] = useState("");
  const draft = useSyncExternalStore(
    subscribeDraft,
    getDraftTitle,
    getServerDraft,
  );
  const [error, setError] = useState("");
  function prepare(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const interpretation = interpretDecisionInput(input.trim());
    interpretation.title = interpretation.title.slice(0, 200);
    if (!storeStart({ title: input.trim().slice(0, 200), interpretation })) {
      setError(
        "Dein Browser blockiert die lokale Ablage. Öffne eine leere Analyse und trage deine Entscheidung dort ein.",
      );
      return;
    }
    router.push("/app?new=1");
  }
  return (
    <>
      <SiteHeader />
      <main id="main-content" lang="de-CH" className="home-main">
        {draft && (
          <Link href="/app" className="resume-strip">
            <FolderOpen size={19} />
            <span>
              Dein letzter Entwurf <strong>{draft}</strong>
            </span>
            <span>
              Fortsetzen <ArrowRight size={16} />
            </span>
          </Link>
        )}
        <section className="start-grid">
          <div className="start-copy">
            <p className="eyebrow">
              <span className="line-mark" /> DEIN RAUM FÜR KLARE ENTSCHEIDUNGEN
            </p>
            <h1>
              Abwägen.
              <br />
              <span>Weiterdenken.</span>
              <br />
              Entscheiden.
            </h1>
            <p className="start-intro">
              Was zählt wirklich? Vergleiche deine Optionen mit den Kriterien,
              die dir wichtig sind.
            </p>
            <form onSubmit={prepare} className="decision-form">
              <label htmlFor="decision-input">
                Welche Entscheidung steht an?
              </label>
              <textarea
                id="decision-input"
                rows={2}
                maxLength={2000}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Zum Beispiel: Welche Software passt zu unserem Team?"
                required
              />
              <div className="form-bottom">
                <span>Vorschläge entstehen lokal im Browser.</span>
                <button
                  className="studio-button"
                  type="submit"
                  disabled={!input.trim()}
                >
                  Vorbereiten <ArrowRight size={17} />
                </button>
              </div>
            </form>
            {error && (
              <p className="notice warning" role="alert">
                {error}
              </p>
            )}
            <div className="start-links">
              <Link
                href="/app?new=1"
                onClick={() => {
                  try {
                    sessionStorage.removeItem(START_KEY);
                  } catch {}
                }}
              >
                Mit leerer Analyse starten <ArrowUpRight size={16} />
              </Link>
              <span>Ohne Konto. Ohne Abo.</span>
            </div>
          </div>
          <aside
            className="decision-preview"
            aria-label="Beispiel einer Nutzwertanalyse"
          >
            <div className="preview-top">
              <span className="eyebrow">SO SIEHT KLARHEIT AUS</span>
              <span className="outline-label">Beispiel</span>
            </div>
            <h2>
              Welche Software
              <br />
              passt zu uns?
            </h2>
            <div className="preview-winner">
              <span>Option mit dem höchsten Nutzwert</span>
              <div>
                <strong>Software B</strong>
                <b>
                  8.3<small>/ 10</small>
                </b>
              </div>
            </div>
            <div className="preview-bars">
              {[
                { name: "Software B", value: 8.3 },
                { name: "Software A", value: 7.4 },
                { name: "Eigenentwicklung", value: 6.8 },
              ].map((r, i) => (
                <div key={r.name} className={i === 0 ? "leading" : ""}>
                  <div>
                    <span>{r.name}</span>
                    <span>{r.value.toFixed(1)}</span>
                  </div>
                  <div className="bar-track">
                    <span style={{ width: `${r.value * 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="preview-note">
              <Check size={17} />
              <span>3 Optionen · 4 Kriterien · nachvollziehbar gewichtet</span>
            </div>
            <Link href="/app?demo=1" className="demo-link">
              Beispiel öffnen & selbst verändern <ArrowUpRight size={18} />
            </Link>
            <p className="sample-note">Fiktive Daten zur Demonstration.</p>
          </aside>
        </section>
        <section id="vorlagen" className="preset-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">EIN GUTER AUSGANGSPUNKT</p>
              <h2>Deine Entscheidung. Dein Kontext.</h2>
            </div>
            <span>Vorlagen, die du anpassen kannst.</span>
          </div>
          <div className="preset-grid">
            {presets.map(({ id, label, description, icon: Icon }, i) => (
              <Link key={id} href={`/app?preset=${id}`} className="preset-card">
                <div>
                  <span className="preset-icon">
                    <Icon size={24} />
                  </span>
                  <span className="preset-number">0{i + 1}</span>
                </div>
                <h3>{label}</h3>
                <p>{description}</p>
                <ArrowUpRight className="preset-arrow" size={18} />
              </Link>
            ))}
          </div>
        </section>
        <section id="methodik" className="method-section">
          <div>
            <p className="eyebrow">NACHVOLLZIEHBAR STATT BAUCHGEFÜHL</p>
            <h2>
              Du bestimmst,
              <br />
              was wichtig ist.
            </h2>
            <p>
              Die Nutzwertanalyse macht deine Prioritäten sichtbar. Sie
              unterstützt deine Entscheidung – die Verantwortung bleibt bei dir.
            </p>
          </div>
          <ol>
            {[
              [
                "Den Rahmen setzen",
                "Entscheidung beschreiben, Alternativen festlegen und passende Kriterien auswählen.",
              ],
              [
                "Bewusst abwägen",
                "Kriterien gewichten und jede Option auf derselben Skala von 1 bis 10 bewerten. Eine höhere Zahl bedeutet immer eine bessere Eignung.",
              ],
              [
                "Das Ergebnis verstehen",
                "Rangliste prüfen, Gewichte verändern und deinen Entscheid als Excel-Datei oder druckbaren Bericht sichern.",
              ],
            ].map(([title, text], i) => (
              <li key={title}>
                <span>0{i + 1}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
        <section className="local-note">
          <Laptop size={28} />
          <div>
            <h2>Deine Analyse bleibt auf diesem Gerät.</h2>
            <p>
              Die Berechnung läuft im Browser. Entwürfe werden lokal
              gespeichert, sobald du eine Analyse beginnst. Exportiere wichtige
              Arbeiten als Sicherung.{" "}
              <Link href="/datenschutz">
                Details zu Speicherung und Hosting
              </Link>
            </p>
          </div>
        </section>
        <section className="faq-section">
          <p className="eyebrow">KURZ ERKLÄRT</p>
          <h2>Gut zu wissen.</h2>
          <details>
            <summary>Was kosten Basic, Advanced und Business?</summary>
            <p>
              Alle drei Analyseumfänge sind in dieser Version kostenlos nutzbar.
              Es gibt keine Bestellung, keine Zahlung und keine automatische
              Verlängerung.
            </p>
          </details>
          <details>
            <summary>Ist die Auswertung eine objektive Empfehlung?</summary>
            <p>
              Die Rechnung ist nachvollziehbar, die Kriterien, Gewichte und
              Bewertungen legst du fest. Prüfe Datenquellen und vergleiche
              unterschiedliche Gewichtungen. Eine enge Rangfolge ist kein
              sicherer Entscheid.
            </p>
          </details>
          <details>
            <summary>Kann ich mit anderen Personen bewerten?</summary>
            <p>
              Im Business-Umfang kannst du mehrere Bewertende anlegen und ihre
              Bewertungen nacheinander auf demselben Gerät erfassen. Eine
              Online-Zusammenarbeit ist nicht enthalten.
            </p>
          </details>
          <details>
            <summary>Wie bekomme ich eine PDF-Datei?</summary>
            <p>
              Öffne im letzten Schritt den Bericht und wähle «Drucken / PDF». Im
              Druckdialog deines Browsers kannst du «Als PDF speichern» wählen.
              Ein direkter Excel-Export ist ebenfalls verfügbar.
            </p>
          </details>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
