# Sicherheit

## Architektur

- Keine Server-Komponente, keine API-Routen, keine Datenbank. Die Anwendung wird als statische Next.js-Seite ausgeliefert; sämtliche Daten bleiben im Browser.
- Keine Drittanbieter-Skripte, keine externen Schriften oder Bilder. Content-Security-Policy mit `default-src 'self'`, `object-src 'none'`, `frame-ancestors 'none'`; HSTS, Referrer-Policy, Permissions-Policy und `X-Content-Type-Options` in `next.config.ts`.
- Importierte Daten (JSON-Dateien, Freigabe-Links) durchlaufen `sanitizeAnalysis` in `lib/nwa/factory.ts`: Typen, Wertebereiche, Längen und Referenzen werden geprüft, unbekannte Felder verworfen.
- Freigabe-Links transportieren die Analyse im URL-Fragment, das Browser nicht an Server senden. Wer den Link besitzt, kann die Analyse lesen; die Anwendung weist darauf hin.

## Meldung von Schwachstellen

Bitte Schwachstellen vertraulich an die im Impressum genannte E-Mail-Adresse melden (konfiguriert in `lib/site.ts`, Feld `operator.email`). Keine öffentlichen Issues für sicherheitsrelevante Funde. Eine Rückmeldung erfolgt in der Regel innerhalb von fünf Arbeitstagen.

## Abhängigkeiten

Laufzeit: `next`, `react`, `react-dom`, `lucide-react`, `clsx`. Aktualisierung über `npm audit` und reguläre Versionspflege auf `dev`; sicherheitsrelevante Updates werden bevorzugt in einer eigenen Release-PR veröffentlicht.
