# Nutzwertanalyse

Kostenlose Web-App für die **Nutzwertanalyse** (Scoring-Modell): Alternativen definieren, Kriterien gewichten, bewerten, Sensitivität und Robustheit prüfen, Bericht exportieren.

- **Kein Backend, kein Login, keine API-Schlüssel, keine laufenden Kosten.** Alle Berechnungen, Speicherungen und Exporte passieren im Browser.
- **Keine Cookies, kein Tracking, keine Drittanbieter-Skripte.** Lokale Speicherung (localStorage) nur mit Einwilligung.
- **Vier Sprachen:** Deutsch, English, Français, Italiano (Rechtstexte DE/EN).
- **Vier Gewichtungsmethoden:** Punkte, Prozent, Rangfolge (ROC), Paarvergleich (AHP mit Konsistenzprüfung).
- **Analysen:** K.-o.-Kriterien, mehrere Bewertende mit Stimmgewicht, Sensitivitätsanalyse (Kipppunkte), Was-wäre-wenn-Slider, Monte-Carlo-Robustheitssimulation.
- **Export:** Druck-/PDF-Bericht, CSV (Excel), Markdown, JSON-Backup, Freigabe-Link (Daten im URL-Fragment, serverlos).
- **Seiten:** Startseite, So funktioniert’s (mit Erklärvideo), Anwendungsfälle, Methode, Über uns (Vision, Mission, Werte), FAQ, Einstellungen.
- **Rechtliches:** Impressum, Datenschutzerklärung (DSG + DSGVO), Nutzungsbedingungen, Cookie-/Speicherseite, Erklärung zur Barrierefreiheit, Consent-Dialog mit Kategorien.

## Entwicklung

```bash
npm install
npm run dev        # http://localhost:3000
npm run typecheck  # TypeScript
npm run lint       # ESLint
npm test           # Unit-Tests der Berechnungslogik (node:test)
npm run build && npm start
```

Stack: Next.js 16 (App Router), React 19, Tailwind CSS 4, TypeScript. Keine weiteren Laufzeit-Abhängigkeiten ausser `lucide-react` (Icons) und `clsx`.

## Branches und Freigabe

Entwicklung erfolgt auf `dev`, freigegebene Veröffentlichungen auf `main`. Zusammengehörige Änderungen werden fertiggestellt, geprüft und gebündelt gepusht. Vor jedem Merge einer Release-PR nach `main` ist Liams ausdrückliche Freigabe erforderlich; kein Auto-Merge und kein direkter Entwicklungs-Push auf `main`. Details: [Entwicklungsablauf](docs/DEVELOPMENT_WORKFLOW.md), Regeln für Mitwirkende: [AGENTS.md](AGENTS.md), freigegebene Versionen: [Änderungsprotokoll](CHANGELOG.md), Sicherheitshinweise: [SECURITY.md](SECURITY.md).

## Vor dem Produktivbetrieb (Pflicht)

1. **Betreiberangaben eintragen** in `lib/site.ts` (`operator`): Name, Adresse, E-Mail, Telefon, UID, vertretungsberechtigte Person, Gerichtsstand. Solange Platzhalter in eckigen Klammern stehen, zeigen die Rechtsseiten einen gelben Hinweis.
2. **Hosting prüfen** in `lib/site.ts` (`hosting`): Anbieter, Adresse, Datenschutz-URL und Log-Aufbewahrung gemäss dem tatsächlich genutzten Hoster anpassen (vorbelegt: Vercel).
3. **Domain** in `lib/site.ts` (`url`, `domain`) setzen – wird für Canonical-URLs, Sitemap, Open-Graph und Freigabe-Links verwendet.
4. Optional: `euRepresentative` (Art. 27 DSGVO) und `dpo` ausfüllen, falls zutreffend; `repoUrl` für einen Quellcode-Link im Footer.
5. Bei Änderungen an Rechtstexten oder am Consent-Dialog `legalVersion` bzw. `consentVersion` in `lib/site.ts` erhöhen – Nutzer werden dann erneut gefragt.

## Projektstruktur

```
app/                 Routen (Landing, /app Dashboard, /app/analyse Editor, /app/teilen, Rechtsseiten, Methode, FAQ, Einstellungen)
components/          UI, Layout, Consent-Banner, Diagramme (SVG, ohne Abhängigkeiten), Analyse-Wizard
lib/nwa/             Domänenmodell, Berechnung (calc.ts), Store mit Undo/Redo, Bibliothek (localStorage), Export/Teilen, Smart-Start-Parser
lib/i18n/            Übersetzungen de/en/fr/it (typsicher, `de.ts` ist Referenz)
lib/legal/           Rechtstexte DE/EN (strukturiert, aus `lib/site.ts` befüllt)
lib/consent/         Einwilligungs-Logik (Kategorien, Speicherung, Widerruf)
tests/               Unit-Tests
```

## Erklärvideo

Das Video unter `public/video/` wird aus `tools/video/scene.html` (Motion Graphics, 1280×720, 92 s) gerendert – ohne externe Dienste und ohne Kosten:

```bash
cd tools/video && npm i playwright   # einmalig; Chromium muss vorhanden sein (CHROMIUM_PATH)
node tools/video/render.mjs          # erzeugt explainer.mp4, explainer.webm, Poster und Untertitel (VTT, de/en/fr/it)
```

Texte der Untertitel stehen in `tools/video/subtitles.json`; die Szenen lassen sich direkt in `scene.html` anpassen.

## Datenschutz-Architektur

- Inhalte (Analysen) verlassen den Browser nie. Es gibt keine API-Routen.
- localStorage-Schlüssel sind mit `nwa.` präfixiert und auf der Seite `/cookies` dokumentiert.
- Einwilligung wird versioniert und mit Zeitstempel gespeichert (`nwa.consent`); Widerruf löscht alle lokalen Daten.
- Freigabe-Links transportieren die Analyse gzip-komprimiert im URL-Fragment (`#z.…`), das Browser nicht an Server senden.
- Restriktive Security-Header (CSP, HSTS, Referrer-Policy, Permissions-Policy) in `next.config.ts`.

## Lizenz

Alle Rechte vorbehalten, sofern nicht anders angegeben.
