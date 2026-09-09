# DecisionStudio

Nutzwertanalyse als lokale Next.js-Anwendung. Rebranding und Fertigstellung auf Basis des vorhandenen Repositorys `AccountGIT-bot/nutzwertanalyse`.

## Funktionen

- Sechs Vorlagen, lokaler regelbasierter Textvorschlag, leere Analyse und bearbeitbares Softwarebeispiel.
- Basic: 2–5 Alternativen und Wichtigkeit 1–5. Advanced/Business: bis zu 10 Alternativen, Prozentgewichte oder AHP (maximal 15 Kriterien für AHP, sonst 20).
- Vollständige Schritte: Kontext → Alternativen → Kriterien → Gewichtung → Bewertung → Ergebnis.
- K.O.-Kriterien, gleichwertige Ränge bei Gleichstand, Nutzwert auf einer festen Skala von 1 bis 10.
- Sensitivitätsanalyse mit proportionaler Umverteilung der übrigen Gewichte und Berücksichtigung aller zulässigen Herausforderer.
- Business: mehrere gewichtete Bewertende nacheinander auf einem Gerät; begründete Bewertungen, Quellen und separate Risiken. Keine Cloud-Zusammenarbeit und kein unveränderbarer Audit-Trail.
- Lokaler Entwurf, JSON-Sicherung und validierter Wiederimport. Vorhandene Entwürfe werden vor dem Wechsel zu einer neuen Analyse geschützt. Bei Konflikten mit anderen Fenstern wird das Speichern gestoppt.
- Echter XLSX-Export mit acht Tabellenblättern, druckbarer HTML-Bericht und PDF über den Browserdruckdialog. Kein externer Exportdienst.
- Login und Registrierung sind ausdrücklich noch nicht verfügbar und nehmen keine Zugangsdaten entgegen.

## Lokal ausführen

Node.js 22 oder neuer und npm verwenden.

```sh
npm ci
npm run lint
npm test
npm run build
npm run dev
```

`npm test` prüft berechnete Referenzwerte, K.O.-Ausschlüsse, Gleichstände, AHP, Sensitivität, Mehrpersonenbewertung, Importvalidierung und sichere Exporte. Der Excel-Export wurde zusätzlich mit Python/openpyxl eingelesen und als OOXML-ZIP auf Integrität geprüft.

## Datenfluss

Analysewerte werden ausschliesslich im Browser berechnet. `nwa_draft_state` enthält den aktuellen Entwurf in localStorage. Die Übergabe von der Startseite erfolgt per sessionStorage (`decisionstudio_start`), nie über Analyseinhalte in Query-Parametern. Alte gespeicherte Datensätze werden validiert, Datumswerte wiederhergestellt und Ergebnisse neu berechnet. Der frühere kostenpflichtige KI-API-Aufruf ist deaktiviert; POST `/api/interpret-decision` liefert HTTP 410, ohne Eingaben zu lesen, zu protokollieren oder weiterzugeben.

Namen, Kriterien und Notizen werden im HTML-Export maskiert. Excel schreibt alle Texte als `inlineStr`, damit auch Eingaben mit `=` nicht als Formeln ausgeführt werden. Der Druckbericht läuft in einem Sandbox-Iframe ohne Skriptausführung. Die globale CSP erlaubt Ressourcen nur vom eigenen Ursprung und notwendige lokale Daten-/Blob-Quellen; keine externen Analyse-, KI- oder Trackingdienste.

## Schweizer Recht: vor Veröffentlichung zu vervollständigen

**Die Rechtstexte sind eine auf den implementierten Datenfluss abgestimmte Vorbereitung, keine bestätigte umfassende Rechtskonformität.** Im vorhandenen Projekt waren Betreiber- und Hostingangaben nicht verifiziert. Es wurden keine Privatadresse, E-Mail-Adresse, Rechtsform, UID oder Datenresidenz erfunden.

In `site-config.json` sind vor einer Veröffentlichung zu ergänzen:

1. Rechtlich verantwortlicher Betreiber, vollständige Postadresse und Kontakt-E-Mail; UID nur falls zutreffend.
2. Tatsächliche Hosting-Bearbeitungsländer, Aufbewahrung von Verbindungsprotokollen und vertragliche Absicherung internationaler Übermittlungen anhand des Vercel-Kontos und des anwendbaren Vertrags.

Bei `VERCEL_ENV=production` verweigert `next.config.ts` den Build, solange die notwendigen Angaben fehlen. Das dient dazu, eine versehentliche Veröffentlichung dieses unvollständigen Impressums zu vermeiden. Für andere Hostingumgebungen ist derselbe Veröffentlichungsschritt organisatorisch einzuhalten. Suchmaschinenindexierung ist für diese Prüfversion deaktiviert. Preview-Zugriffsschutz und Vercel-Vertragsstatus wurden über die verfügbare Verbindung nicht verifiziert.

Es werden keine Abonnements, Käufe, Zahlungsabläufe oder simulierten Kontoabschlüsse angeboten. Die Datenschutzerklärung behandelt die tatsächliche lokale Ablage und die separate Datenverarbeitung beim Hosting. Lokale Daten lassen sich auf der Datenschutzseite exportieren und löschen.

Geprüfte Primärquellen (6. September 2026):

- [EDÖB: Datenschutzerklärungen im Internet](https://www.edoeb.admin.ch/de/datenschutzerklaerungen-im-internet)
- [EDÖB: aktualisierter Cookie-Leitfaden](https://www.edoeb.admin.ch/de/cookie-leitfaden-aktualisiert)
- [SECO: Schweizer Regeln für Onlineangebote](https://www.kmu.admin.ch/de/die-gesetze-der-schweiz-und-der-eu)
- [Vercel Privacy Notice](https://vercel.com/legal/privacy-notice) und [Data Processing Addendum](https://vercel.com/legal/dpa)

## Prüfung und technische Grenzen

Abschliessend erfolgreich geprüft: ESLint ohne Warnungen, 17 fachliche Tests und vollständiger Next.js-Build einschliesslich TypeScript. Der Schutz vor einer Vercel-Produktionsveröffentlichung mit fehlenden Betreiber-/Hostingangaben wurde zusätzlich mit einem erwarteten Build-Abbruch geprüft. Eine interaktive Browserprüfung, reale Mobilgeräteprüfung und der tatsächliche PDF-Druckdialog wurden in diesem Durchlauf nicht ausgeführt. PDF wird über den Browserdruckdialog erzeugt, nicht als eigener PDF-Renderer. Die Oberfläche und der Bericht verwenden einheitlich Schweizer Hochdeutsch (de-CH). Die unvollständige Sprachauswahl wird nicht mehr angeboten; vorhandene Übersetzungskataloge bleiben für einen späteren vollständig übersetzten Release im Quellcode.

Die eingesetzte Next.js-Version wurde wegen der vom Paket-Audit gemeldeten Sicherheitslücken von 16.1.6 auf 16.3.4 aktualisiert. Grundlage: [offizieller Release](https://github.com/vercel/next.js/releases/tag/v16.3.4) und [Security Advisory zu Server Components](https://github.com/vercel/next.js/security/advisories/GHSA-q4gf-8mx6-v5v3). `npm audit --omit=dev` meldet am 6. September 2026 keine bekannten Schwachstellen (0 Meldungen). Dies ist keine Garantie für die Abwesenheit unbekannter Sicherheitslücken.
