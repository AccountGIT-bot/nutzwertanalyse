# Änderungsprotokoll

Alle freigegebenen Veröffentlichungen von Nutzwertanalyse. Entwicklung auf `dev`, Freigabe nach `main` nur mit ausdrücklicher Zustimmung von Liam (siehe `docs/DEVELOPMENT_WORKFLOW.md`).

## 2.0.1 – in Vorbereitung

Release-PR: `dev` → `main`. Noch nicht freigegeben.

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
