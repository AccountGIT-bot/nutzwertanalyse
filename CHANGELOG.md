# Änderungsprotokoll

Alle freigegebenen Veröffentlichungen von Nutzwertanalyse, neueste zuoberst. Entwicklung auf `dev`, Freigabe nach `main` nur mit ausdrücklicher Zustimmung von Liam. Versionsnummern folgen Semantic Versioning (`MAJOR.MINOR.PATCH`), jede Fassung nennt Datum, Release-PR, Freigabe, Merge-Commit und Tag `vX.Y.Z`; Regeln und Checkliste in `docs/DEVELOPMENT_WORKFLOW.md`, Abschnitt «Versionierung und Releases». `tests/version.test.ts` prüft, dass `package.json` und der oberste Eintrag dieselbe Nummer tragen.

## 2.7.0 – 31.10.2026

Release-PR: [#39](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/39). Freigegeben von Liam am 31.10.2026 im Chat («Freigabe erteilt, merge nach main»), Merge-Commit `ace15f2`, Tag `v2.7.0`.

- Neues Logo «Gewicht × Bewertung»: drei Balken auf petrolfarbener Kachel, Breite = Gewicht, Höhe = Bewertung, Fläche = Nutzwert; die grösste Fläche ist golden und steht für die Empfehlung. Ersetzt das detailreiche Rasterlogo (Sechseck, Kompass, Pfeil), das unter 48 px verschwamm. Als Vektor (`public/logo.svg`, `components/brand/LogoMark.tsx`) scharf in jeder Grösse, in hell und dunkel identisch.
- Eingesetzt im Kopf und neu in der Fusszeile, als Favicon (`favicon.ico` 16/32/48 px und SVG), als App-Icons 192/512 px, maskierbares Icon und Apple-Touch-Icon sowie im Teilen-Bild (Open Graph). Farbe des Browser-Rahmens im Manifest auf das Markenpetrol `#0b5d5a` vereinheitlicht. Icons reproduzierbar mit `scripts/brand-icons.mjs`.
- `package.json` von 2.6.1 auf 2.7.0.
- Prüfbericht `docs/QA_2026-10-31.md` (Nachtrag Logo).

## 2.6.1 – 31.10.2026

Release-PR: [#38](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/38). Freigegeben von Liam am 31.10.2026 über die Release-Karte (Doppelklick, 14:57 UTC), Merge-Commit `6e4376f`, Tag `v2.6.1`. Erster Lauf der Action am 31.10.2026 erfolgreich: Tags `v2.0.0` bis `v2.6.0` bei GitHub angelegt.

- Release-Tags automatisch: Die GitHub Action «Release-Tags» (`.github/workflows/release-tags.yml`) setzt nach jedem Merge nach `main` die Tags `vX.Y.Z` auf die im Changelog genannten Merge-Commits und trägt beim ersten Lauf `v2.0.0` bis `v2.6.0` nach. Kein Secret, kein lokaler Rechner nötig. Keine sichtbare Änderung an der Website.
- `package.json` von 2.6.0 auf 2.6.1.
## 2.6.0 – 31.10.2026

Release-PR: [#37](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/37). Freigegeben von Liam am 31.10.2026 im Chat («danach mergen») nach Vorlage von PR, Prüfungen und Grenzen sowie über die Release-Karte (Doppelklick, 14:45 UTC), Merge-Commit `5e13bc4`, Tag `v2.6.0`.

- Startseite, Hero: Der helle bzw. graue Balken links vom Hintergrund während der Einblendung ist behoben; die skalierende Einblendung wird auf die Bühne beschnitten, der Verlauf deckt den Rand jederzeit.
- Kein horizontales Scrollen mehr auf dem Handy (390 px): «Meine Analysen», Einstellungen, Datenschutz, Cookies & Speicher, Impressum, Schritt «Bewertung» sowie die Ergebnis-Reiter «Stärken & Details» und «Robustheit & Sensitivität». Ursache waren Raster ohne explizite Spalte, deren Auto-Spur auf die Inhaltsbreite wuchs; alle responsiven Raster tragen nun eine begrenzte Basisspalte. Dazu: 1–10-Knöpfe der geführten Bewertung schrumpfen auf schmalen Bildschirmen, Tabellen der Rechtstexte scrollen im Rahmen (Impressum bricht lange Werte um), lange Knopftexte und die Was-wäre-wenn-Knopfzeile brechen um, die Sensitivitätstabelle scrollt in der Karte.
- Diagramme auf dem Handy lesbar: Unter 440 px Containerbreite wechseln Rangliste, Beiträge, Sensitivität und Robustheit in einen kompakten Modus mit Beschriftung über dem Balken und 12-px-Schrift statt herunterskalierter 6-px-Schrift; das Radar nutzt grössere Schrift, kleineren Radius und bis drei Beschriftungszeilen. Überlange Einzelwörter werden in allen Diagrammen mit Trennstrich geteilt statt abgeschnitten. Druckbericht unverändert.
- Versionssystem: Semantic Versioning mit dokumentierten Stufen und Release-Checkliste (`docs/DEVELOPMENT_WORKFLOW.md`), Tags `vX.Y.Z` auf den Merge-Commits über `npm run release:tags` (liest die Merge-Commits aus diesem Protokoll; 2.0.0 bis 2.6.0 werden damit nachgetragen), Prüfung `tests/version.test.ts` (Paketversion, Lock-Datei und oberster Changelog-Eintrag müssen übereinstimmen, Einträge absteigend mit Datum und Release-PR), Version in der Fusszeile jeder Seite.
- `package.json` von 2.5.0 auf 2.6.0.
- Prüfbericht `docs/QA_2026-10-31.md`: automatischer Durchgang über 80 Seitenvarianten (14 Routen und sechs Schritte, 1366/390 px, hell/dunkel) vor und nach der Korrektur, Bildfolgen der Hero-Einblendung, Ergebnis-Reiter bei 390 px, Druckbericht erneut erzeugt.

## 2.5.0 – 25.10.2026

Release-PR: [#36](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/36). Freigegeben von Liam am 25.10.2026 über die Release-Karte (Doppelklick, 14:07 UTC) und im Chat bestätigt, Merge-Commit `2437aa8`.

- Druckbericht neu aufgebaut (`components/nwa/PrintReport.tsx`): Deckblatt auf Seite 1 mit Titel, Datum, Bewertenden, Kennzahlen (Alternativen, Kriterien, Gewichtungsmethode, Skala, Vollständigkeit), Empfehlung im Rahmen mit Vorsprung, Konfidenz und Robustheits-Satz, «Rangliste auf einen Blick» und Inhaltsverzeichnis. Danach nummerierte Abschnitte im Fluss: Ausgangslage und Ziel, Rangliste mit Beiträgen, Stärkenprofil (grösseres Radar, Kategorietabelle mit Alternativen als Zeilen und Bestwert je Kategorie fett), Bewertungsmatrix (Bestwert je Kriterium fett), Sensitivitätsanalyse, Robustheits-Simulation als Tabelle mit Siegquoten-Balken, Begründungen je Alternative gruppiert (Rang und Nutzwert in der Kopfzeile), Fazit & Entscheid. Titel bleiben beim ersten Block, Diagramme und kurze Tabellen werden nicht geteilt, Tabellenköpfe wiederholen sich.
- Querformat ab fünf Alternativen: Die Bewertungsmatrix liegt auf einer Querformatseite und wandert als letzter Abschnitt ans Ende; Nummerierung und Inhaltsverzeichnis folgen der tatsächlichen Reihenfolge.
- Fusszeile auf jeder Seite ausser dem Deckblatt: links Titel und Datum, rechts «Seite x von y · nutzwertanalyse.com», gesetzt über `@page`-Randboxen (Chrome, Edge); Firefox und Safari nutzen weiterhin die Kopf-/Fusszeilen des Browsers. Der Drucktipp nennt das.
- Robustheit: App und Bericht rechnen mit 1000 Durchläufen und festem Startwert; die Siegquoten sind auf Bildschirm und Papier identisch.
- Diagramme in App und Bericht: lange Beschriftungen brechen auf zwei Zeilen um statt abgeschnitten zu werden; Radar breiter mit Beschriftungen neben den Achsen.
- Texte in Deutsch, Englisch, Französisch, Italienisch. `package.json` von 2.4.0 auf 2.5.0.
- Prüfbericht `docs/QA_2026-10-25.md`: Tests, Lint, Typecheck, Build; Randbox-Test in Chromium 141; Beispielbericht mit 4 Alternativen (7 Seiten) und mit 6 Alternativen (8 Seiten, Querformat-Anhang), alle Seiten gesichtet; App-Reiter «Stärken & Details» bei 1366 px hell/dunkel und 390 px.

## 2.4.0 – 25.10.2026

Release-PR: [#35](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/35). Freigegeben von Liam am 25.10.2026 über die Release-Karte (Doppelklick, 07:04 UTC) und im Chat bestätigt, Merge-Commit `05d3339`.

- Bewertung geführt: Neue Standardansicht mit einem Kriterium pro Schritt (Beschreibung, Skalenlegende, alle Alternativen untereinander, grosse 1–10-Reihe mit gefülltem Wert und getönten darunterliegenden Werten, Begründung inline, Fortschrittspunkte je Kriterium, «Vorheriges/Nächstes Kriterium», am Ende «Zum Ergebnis», Sprung zum ersten offenen Kriterium). «Matrix» bleibt als Übersicht mit kompakter Einzeilen-Skala und scrollt in der Karte.
- Ergebnis in vier Reitern: Überblick, Stärken & Details, Robustheit & Sensitivität, Fazit & Bericht; Lesehilfe unter der Empfehlung; bei unvollständiger Bewertung auffälliger Hinweis mit «Bewertung fortsetzen». Druckbericht unverändert vollständig.
- Assistent: kompakter Fortschrittskopf unter 640 px statt scrollender Karten; untere Leiste zeigt dauerhaft «Bereit für den nächsten Schritt» oder «Noch offen: …». Hinweis zu den Nutzungsbedingungen in Schritt 1 lautet «Kurz und klar erklärt.»
- Startseite: Hero mit cinematischem Clip «Glasstelen» (Higgsfield, Kling 3.0 pro, 1920×1080) hinter der Ergebnis-Karte ab 1024 px, Verlauf in die Seitenfarbe, Karte mit Tiefenschatten; bis zur Übertragung der Videodateien zeigt die Bühne das Poster.
- Texte in Deutsch, Englisch, Französisch, Italienisch. `package.json` von 2.3.0 auf 2.4.0.
- Prüfbericht `docs/QA_2026-10-24.md` (Nachtrag): Bestandsaufnahme aller Schritte, Prüfungen bei 1366 und 390 px, Startseite hell und dunkel.

## 2.3.0 – 24.10.2026

Release-PR: [#34](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/34). Freigegeben von Liam am 24.10.2026 über die Release-Karte (Doppelklick, 18:07 UTC) und im Chat bestätigt, Merge-Commit `4430aa3`.

- Standarddesign Hell: Die Seite startet hell, unabhängig von der Betriebssystem-Einstellung. «System» gilt nur, wenn es ausdrücklich gewählt wurde; Reihenfolge des Knopfs im Kopf: Hell → Dunkel → System. Das Skript vor dem ersten Paint setzt `data-theme="light"`, sofern keine gespeicherte Wahl vorliegt; `theme-color` folgt dem tatsächlichen Design.
- Hinweis auf den Dunkelmodus: Nach drei Minuten auf der Website erscheint eine kompakte Karte unter dem Kopf mit Pfeil auf den Theme-Knopf («Lieber dunkel? Die Seite gibt es auch im Dunkelmodus.», «Ausprobieren», «Nein danke»), nur wenn das Design nicht selbst gewählt wurde, die Seite hell ist, der Tab sichtbar ist und die Speicherfrage beantwortet wurde. Solange der Hinweis offen ist, pulsiert der Knopf.
- Wechsel in zwei Schritten: Beim Klick füllt sich zuerst der Knopf in der Zielfarbe (Symbol dreht herein), nach 450 ms folgt die Seite, dann klingt die Füllung ab. Bei «Bewegung reduzieren» sofortiger Wechsel ohne Animation.
- Speicherung: Merker `nwa.themeHint` nur mit Einwilligung «Funktional»; auf `/cookies` (DE/EN) eingetragen, `legalVersion` auf `2026-10-24`. Texte in Deutsch, Englisch, Französisch, Italienisch.
- `package.json` von 2.2.1 auf 2.3.0.
- Prüfbericht `docs/QA_2026-10-24.md`: Tests, Lint, Typecheck, Build; Chromium mit verstellter Uhr bei 1366 und 390 px, zweistufiger Wechsel gemessen, reduzierte Bewegung, Reload-Verhalten.

## 2.2.1 – 17.10.2026

Release-PR: [#33](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/33). Freigegeben von Liam am 18.10.2026 über die Release-Karte (Doppelklick, 14:51 UTC) und im Chat bestätigt, Merge-Commit `e25d404`.

- Nutzungsbedingungen, Titelbereich: Das Waage-Video läuft scharf statt weichgezeichnet. Gleicher Clip wie in 2.2.0, aus dem unbearbeiteten 1080p-Material neu encodiert als nahtlose 20-Sekunden-Schleife: 1920×1080 ab 1024 px (`terms-bg.mp4` 3.4 MB, `terms-bg.webm` 1.0 MB), 1280×720 darunter (`terms-bg-720.mp4` 1.1 MB, `terms-bg-720.webm` 0.6 MB), Poster aus dem ersten Frame; Quellenwahl über das `media`-Attribut der `<source>`-Elemente. Das Filmkorn der weichgezeichneten Fassung ist entfernt. Kein 4K: Der Clip liegt nativ in 1080p vor, ein KI-Upscale würde Details erfinden und das Ladegewicht vervielfachen.
- `package.json` von 2.2.0 auf 2.2.1.
- Prüfbericht `docs/QA_2026-10-17.md`: Encode, Quellenwahl, SHA-256-Verifikation, Chromium bei 390, 1366 und 1920 px, hell und dunkel, reduzierte Bewegung, Druck.

## 2.2.0 – 17.10.2026

Release-PR: [#32](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/32). Freigegeben von Liam am 17.10.2026 über die Release-Karte (Doppelklick, 21:26 UTC) und nach zwei Nachbesserungen im Chat für Head `06cdcb2` bestätigt, Merge-Commit `e2a317d`.

- Nutzungsbedingungen neu geschrieben (`lib/legal/terms-de.ts` verbindlich, `terms-en.ts` als Übersetzung mit identischer Struktur): 14 Klauseln mit Kurzfassung, Markierung (Einschränkung, Recht, Pflicht, Zusage, Information) und Rechtsgrundlage; neue Gewährleistungsklausel 9.2; Fassungsgeschichte mit Archiv der Fassung 1 im Wortlaut; Schweizer Recht mit Vorbehalt des zwingenden Verbraucherschutzes am Wohnsitz. `legalVersion` auf `2026-10-17.2`. Strukturgleichheit DE/EN, fortlaufende Nummerierung, Verweise der Übersicht und Querverweise werden durch `tests/terms.test.ts` geprüft.
- Seite `/agb` neu gestaltet: Titelbereich mit HD-Video «Waage» (selbst gehostet, 1920×1080, nahtlose 20-Sekunden-Schleife, feines Korn, sanfte Einblendung; nur Poster bei «Bewegung reduzieren», im Druck ausgeblendet), Meta-Chips (Fassung, Lesezeit, markierte Einschränkungen); die Dokumentsprache folgt der Sprachwahl der Seite (Englisch zeigt die Übersetzung mit Hinweis, Französisch und Italienisch das deutsche Original mit Hinweis), Reihe «Auf einen Blick» mit acht Kernpunkten und Verweisen auf die Ziffern, Inhaltsverzeichnis, gelb hervorgehobene Einschränkungen, Rechtsgrundlagen aufklappbar, Druckansicht mit ausgeschriebenen Rechtsgrundlagen.
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
