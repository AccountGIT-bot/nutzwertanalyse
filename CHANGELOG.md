# Änderungsprotokoll

Alle freigegebenen Veröffentlichungen von Nutzwertanalyse. Entwicklung auf `dev`, Freigabe nach `main` nur mit ausdrücklicher Zustimmung von Liam (siehe `docs/DEVELOPMENT_WORKFLOW.md`).

## 2.2.0 – 17.10.2026

Release-PR: [#32](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/32). Freigabe über die Release-Karte ausstehend.

- Nutzungsbedingungen neu geschrieben (`lib/legal/terms-de.ts` verbindlich, `terms-en.ts` als Übersetzung mit identischer Struktur): 14 Klauseln mit Kurzfassung, Markierung (Einschränkung, Recht, Pflicht, Zusage, Information) und Rechtsgrundlage; neue Gewährleistungsklausel 9.2; Fassungsgeschichte mit Archiv der Fassung 1 im Wortlaut; Schweizer Recht mit Vorbehalt des zwingenden Verbraucherschutzes am Wohnsitz. `legalVersion` auf `2026-10-17.2`. Strukturgleichheit DE/EN, fortlaufende Nummerierung, Verweise der Übersicht und Querverweise werden durch `tests/terms.test.ts` geprüft.
- Seite `/agb` neu gestaltet: Titelbereich mit HD-Video «Waage» (selbst gehostet, 1920×1080, nahtlose 20-Sekunden-Schleife, feines Korn, sanfte Einblendung; nur Poster bei «Bewegung reduzieren», im Druck ausgeblendet), Meta-Chips (Fassung, Lesezeit, markierte Einschränkungen, Umschalter Deutsch/Englisch), Reihe «Auf einen Blick» mit acht Kernpunkten und Verweisen auf die Ziffern, Inhaltsverzeichnis, gelb hervorgehobene Einschränkungen, Rechtsgrundlagen aufklappbar, Druckansicht mit ausgeschriebenen Rechtsgrundlagen.
- Hinweis auf die Nutzungsbedingungen im Schritt «Entscheidung».
- Startseite: Das Bild der Sektion «Vertrauen» wird während der Einblendung beschnitten; der weisse Balken am linken Rand ist behoben.
- Arbeitsregeln: Release-Karte als Freigabeschritt (drei Schaltflächen, Doppelklick innerhalb von 10 Sekunden, gespeicherter Zeitstempel), Pflegeregeln für die Nutzungsbedingungen, `legalVersion` als Datum mit Revision.
- `package.json` von 2.1.0 auf 2.2.0.
- Prüfbericht `docs/QA_2026-10-17.md`: Tests, Lint, Typecheck, Build; Chromium bei 390, 1024, 1366 und 1920 px, hell und dunkel, reduzierte Bewegung, Druck.
- Offen: rechtliche Prüfung der Nutzungsbedingungen durch eine Fachperson; Betreiberangaben in `lib/site.ts` sind Platzhalter.

## 2.1.0 – 17.10.2026

Release-PR: [#31](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/31). Freigegeben von Liam am 17.10.2026 in zwei Schritten (drei Schaltflächen, zweite Bestätigung), Merge-Commit `5e7352e`.

- Neue Startseiten-Sektion «Vertrauen»: Text links, cinematisches Bild rechts mit Verlauf in die Seitenfarbe (hell und dunkel), schwebende Kennzahl «100 % im Browser berechnet» mit Zählanimation und sich zeichnendem Ring; mobil mit Bild unter dem Text.
- Neue Startseiten-Sektion «Stimmen»: vollflächiger, vorab weichgezeichneter Hintergrund mit langsamer Kamerafahrt, helle Karte mit Feedback-Aufruf und Karussell aus klar gekennzeichneten Beispielstimmen, vier Argumente mit Haken. Keine behaupteten Bewertungen; der Feedback-Button erscheint erst mit befüllter Betreiber-E-Mail in `lib/site.ts`.
- Abschnittsnavigation der Startseite mit acht Einträgen; Übersetzungen in Deutsch, Englisch, Französisch, Italienisch.
- Versionsnummer wird aus `package.json` gelesen (Einstellungsseite, JSON-LD `softwareVersion`); keine hart kodierte Version mehr. `package.json` von 2.0.0 auf 2.1.0.
- Arbeitsregeln: Versionsschritt je Release-PR, Freigabe nach `main` in zwei Schritten (drei Schaltflächen, zweite Bestätigung), Branch-Bereinigung vom 17.10.2026 dokumentiert.
- Prüfbericht `docs/QA_2026-10-17.md`: Tests, Lint, Typecheck, Build, Chromium 1280 px und 390 px, hell/dunkel, reduzierte Bewegung, Druck.

## 2.0.1 – 17.10.2026

Release-PR: [#30](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/30). Freigegeben von Liam am 17.10.2026, Merge-Commit `e626259`.

- Button «Analyse starten» am Ende der Methodenseite war unlesbar (Linkfarbe des Textblocks überschrieb die Buttonfarbe); Link-Regel auf Fliesstext eingegrenzt.
- Serverseitige Funktion (Open-Graph-Bild) auf die Vercel-Region Frankfurt festgelegt; Hosting-Abschnitt der Datenschutzerklärung (DE/EN) beschreibt CDN-Auslieferung, EU-Funktionen und mögliche US-Übermittlung präzise. `legalVersion` 2026-10-17.
- Geführte Startseite unterhalb des Hero: Kennzahlenband mit Zähl-Animation, Scroll-Tour «Was dazugehört» mit mitlaufender Visualisierung pro Funktion, sechsstufiger Ablauf als sich zeichnende Timeline, Abschnittsnavigation am rechten Rand (Desktop) und animiertes Datenschutz-Schema (Daten bleiben im Browser, Serverweg blockiert). Alle Animationen respektieren `prefers-reduced-motion`; ohne JavaScript bleiben die Inhalte sichtbar.
- Scroll-Tour «Was dazugehört»: Der aktive Eintrag wird jetzt aus der Scrollposition bestimmt statt aus Sichtbarkeitsereignissen. Beim langsamen Scrollen springt der Zähler nicht mehr hin und her und überspringt keine Nummer.
- Sprunglink «Zum Inhalt springen» erschien nach Mausklicks auf Links oben links: Next.js setzt nach jedem Seitenwechsel den Fokus auf das erste Element der Seite. Der Link wird jetzt nur bei Tastaturfokus (`:focus-visible`) eingeblendet; Funktion für Tastatur- und Screenreader-Nutzung unverändert.

## 2.0.0 – 17.10.2026

Release-PR: [#29](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/29). Freigegeben von Liam am 17.10.2026, Merge-Commit `6723641`.

### Anwendung
- Vollständiger Neubau als Web-App ohne Backend, Login, API-Schlüssel und laufende Kosten. Alle Berechnungen, Speicherungen und Exporte laufen im Browser.
- Sechs-Schritte-Assistent (Entscheidung, Alternativen, Kriterien, Gewichtung, Bewertung, Ergebnis) mit Undo/Redo, Tastaturkürzeln und Autosave.
- Vier Gewichtungsmethoden: Punkte, Prozent, Rangfolge (ROC), Paarvergleich (AHP) mit Konsistenzverhältnis.
- K.-o.-Kriterien, mehrere Bewertende mit Stimmgewicht, Bewertungsskala 1–5 oder 1–10.
- Ergebnis mit Rangliste, Kriterienbeiträgen, Stärkenprofil, Kategorien, Bewertungsmatrix, exakten Sensitivitäts-Kipppunkten, Was-wäre-wenn-Reglern und Monte-Carlo-Robustheit.
- Smart-Start: lokale Freitext-Interpretation (ohne Netzwerk) schlägt Vorlage, Titel und Alternativen vor.
- Zehn Vorlagen, Beispielanalyse, Dashboard mit Import, Export, Duplizieren und Suche.
- Export: Druck-/PDF-Bericht, CSV, Markdown, JSON-Backup, Freigabe-Link mit gzip-komprimierten Daten im URL-Fragment.

### Gestaltung und Inhalte
- Ruhige Palette (Weiss, Papiergrau, Petrol, Gold), Hell- und Dunkelmodus, eigene Vektor-Illustrationen für alle Anwendungsfälle, animierte Hero-Grafik, Scroll-Einblendungen mit Fallback für «Bewegung reduzieren».
- Seiten: Startseite, So funktioniert’s (mit Erklärvideo), Anwendungsfälle, Methode, Über uns (Vision, Mission, Werte), FAQ, Einstellungen.
- Erklärvideo (92 s Motion Graphics, MP4/WebM, Untertitel de/en/fr/it), lokal gerendert über `tools/video`.
- Vier Sprachen: Deutsch, Englisch, Französisch, Italienisch.

### Recht und Datenschutz
- Impressum, Datenschutzerklärung (DSG und DSGVO), Nutzungsbedingungen, Cookie-/Speicherseite, Erklärung zur Barrierefreiheit (DE/EN).
- Consent-Banner mit Kategorien, Versionierung, Zeitstempel, Widerruf mit Löschung aller lokalen Daten, GPC/DNT-Hinweis.
- Restriktive Security-Header (CSP, HSTS, Referrer-Policy, Permissions-Policy), Sitemap, Robots, Manifest, Open-Graph-Bild, JSON-LD.

### Prüfung
- Unit-Tests für Berechnung, Parser und Export; ESLint, TypeScript, Produktionsbuild; Browserprüfung in Chromium (Desktop und 390 px): Consent-Flows, Speichern, Löschen, Undo, Freigabe-Link, Druckansicht, Video.

### Bekannte Grenzen
- Betreiberangaben in `lib/site.ts` sind Platzhalter; die Rechtsseiten zeigen bis zur Befüllung einen Hinweis.
- Nicht auf echten Geräten geprüft (Safari/iOS, Firefox, Android, Screenreader).
- Rechtstexte liegen in DE und EN vor; FR und IT zeigen die deutsche Fassung mit Hinweis.
