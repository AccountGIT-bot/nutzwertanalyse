# Nutzwertanalyse.com

Web-App zur strukturierten Entscheidungsfindung mittels Nutzwertanalyse –
Kriterien definieren, gewichten, bewerten, Sensitivität prüfen und
nachvollziehbar dokumentieren.

Gebaut mit Next.js 16 (App Router), React 19, TypeScript und Tailwind CSS 4.

---

## Vor dem Live-Gang ausfüllen

> **Wichtig:** Ohne diese Angaben ist der Betrieb in der Schweiz nicht
> rechtskonform. Das Impressum ist nach **Art. 3 Abs. 1 lit. s UWG** zwingend.

Alle Betreiber-, Kontakt- und Auftragsbearbeiterangaben stehen an **einer**
Stelle: [`app/lib/site-config.ts`](app/lib/site-config.ts).

| Feld | Bedeutung |
| --- | --- |
| `operator.legalName`, `legalForm` | Firma und Rechtsform |
| `operator.street`, `zip`, `city` | Ladungsfähige Postadresse |
| `operator.email` | Elektronische Kontaktmöglichkeit (Pflicht nach UWG) |
| `operator.privacyEmail` | Kontaktstelle für Betroffenenrechte (Art. 25 ff. DSG) |
| `operator.uid`, `vatId` | UID (Art. 3 UIDG) und MWST-Nummer, sofern steuerpflichtig |
| `operator.commercialRegister` | Handelsregistereintrag, sofern vorhanden |
| `operator.representatives` | Zeichnungsberechtigte Personen |
| `operator.jurisdiction` | Sitz – bestimmt den Gerichtsstand in den AGB |
| `dataProcessors[]` | Tatsächlich eingesetzte Dienstleister inkl. Standort |
| `legalVersion` | Version und Stand der Rechtstexte |

Solange Pflichtangaben fehlen, blenden die Rechtsseiten einen sichtbaren
Hinweis für den Betreiber ein. Die Texte sind sorgfältig auf das Schweizer
Recht ausgerichtet, ersetzen aber **keine anwaltliche Prüfung** des konkreten
Geschäftsmodells.

Weiter zu prüfen:

- `siteConfig.url` auf die produktive Domain setzen (steuert Metadaten,
  `sitemap.xml`, `robots.txt` und die kanonischen URLs).
- `privacy.euRepresentative` bestellen, falls die Bearbeitung in den
  räumlichen Anwendungsbereich der DSGVO fällt (Art. 27 DSGVO).
- `commerce.paidPlansAvailable` aktivieren, sobald kostenpflichtige Pläne
  angeboten werden – die AGB verweisen darauf.

## Umgebungsvariablen

| Variable | Zweck |
| --- | --- |
| `AI_GATEWAY_API_KEY` | Aktiviert die optionale KI-Strukturierung unter `/api/interpret-decision`. |

Ohne Schlüssel bleibt die App voll funktionsfähig: Die Startseite fällt auf
die lokale Interpretations-Engine zurück und weist sichtbar darauf hin.

## Skripte

```bash
npm run dev     # Entwicklungsserver
npm run build   # Produktionsbuild inkl. TypeScript-Prüfung
npm run start   # Produktionsserver
npm run lint    # ESLint (inkl. React-Compiler-Regeln)
```

## Funktionsumfang

- **Assistent in sechs Schritten**: Entscheidung, Alternativen, Kriterien,
  Gewichtung, Bewertung, Ergebnis.
- **Drei Analysetiefen**: Basic, Advanced und Business – mit Kategorien,
  K.-o.-Kriterien, Szenarien und Mehrpersonenbewertung.
- **Gewichtungsmethoden**: einfache Skala, prozentuale Verteilung sowie AHP
  mit paarweisen Vergleichen und Konsistenzprüfung.
- **Sensitivitätsanalyse**: zeigt, wie stabil das Ranking gegenüber
  Gewichtsänderungen ist.
- **Exporte**: Bericht (HTML, direkt als PDF druckbar), CSV (Excel-tauglich,
  Semikolon und BOM), JSON und Markdown; dazu eine Kurzfassung für die
  Zwischenablage.
- **Import**: zuvor exportierte JSON-Analysen lassen sich wieder einlesen.
- **Analysen-Bibliothek**: bis zu 50 Analysen lokal speichern, laden,
  umbenennen, einzeln exportieren und löschen.
- **Sechs Sprachen**: Deutsch, Englisch, Französisch, Italienisch, Spanisch,
  Portugiesisch.

## Datenschutz und Sicherheit

- Analysen werden **ausschliesslich im `localStorage` des Browsers**
  gespeichert und nie an den Server übertragen (Art. 7 DSG – Datenschutz
  durch Technik). Ausnahme ist die ausdrücklich ausgelöste KI-Funktion.
- Cookie-Consent mit Kategorien, Widerruf und Zeitstempel als Nachweis;
  eingesetzte Speichereinträge sind unter `/cookies` vollständig aufgeführt.
- Sicherheits-Header inklusive CSP, HSTS, Referrer- und Permissions-Policy
  werden in [`next.config.ts`](next.config.ts) gesetzt.
- Die KI-Route ist ratenbegrenzt (10 Anfragen pro Minute und IP) und gibt
  keine internen Fehlermeldungen an den Client weiter.

## Rechtsseiten

| Route | Inhalt |
| --- | --- |
| `/rechtliches` | Übersicht aller Rechtstexte |
| `/impressum` | Anbieterkennzeichnung (Art. 3 Abs. 1 lit. s UWG) |
| `/datenschutz` | Datenschutzerklärung nach revDSG/DSV, mit DSGVO-Ergänzungen |
| `/cookies` | Cookie-Richtlinie (Art. 45c lit. b FMG) |
| `/agb` | Allgemeine Geschäftsbedingungen nach OR |

## Projektstruktur

```
app/
  api/                 Route Handler (KI-Interpretation, Health-Check)
  components/          UI-Komponenten (nwa/ = Assistent, legal/ = Rechtsseiten)
  lib/
    site-config.ts     Betreiber- und Rechtsangaben (hier ausfüllen)
    consent.ts         Einwilligungsverwaltung
    client-state.ts    Hydrationssichere localStorage-Zugriffe
    nwa/               Datenmodell, Berechnung, Vorlagen, Export, Bibliothek
    i18n/              Übersetzungen
  <route>/page.tsx     Seiten
```
