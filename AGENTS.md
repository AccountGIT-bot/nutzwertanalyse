# Arbeitsregeln für Agenten und Mitwirkende

Diese Regeln übernehmen Liams Arbeitsweise aus dem GARAGO-Repository (Stand 13. September 2026) für Nutzwertanalyse.

## Branches und Freigabe

- `dev` ist der gemeinsame Entwicklungs- und Integrationsbranch, `main` trägt ausschliesslich freigegebene Veröffentlichungen. Details: `docs/DEVELOPMENT_WORKFLOW.md`.
- Vor **jedem Merge nach `main`** die konkrete PR, die Prüfungen und die offenen Grenzen vorlegen und Liams ausdrückliche Freigabe für genau diesen Merge einholen. Die Freigabe läuft über die **Release-Karte**: eine kleine Seite mit drei Knöpfen, «Pull Request» (GitHub-Logo, Link zur PR), «Vercel Preview» (Vercel-Logo, Link zur Vorschau des `dev`-Standes) und «Merge nach main freigeben». Der Freigabe-Knopf braucht zwei Klicks innerhalb von 10 Sekunden («Doppelklick»); die Karte speichert die Freigabe mit Zeitstempel, und erst danach wird gemergt. Die Karte wird erst gezeigt, wenn das Paket vollständig ist: alles gepusht, Versionsschritt und CHANGELOG-Eintrag drin, Prüfungen grün, Release-PR offen. Kann die Karte nicht veröffentlicht werden, ersatzweise eine Auswahlfrage mit zweiter Bestätigung stellen. Eine so erteilte Freigabe für diesen konkreten Merge genügt; nicht nochmals fragen. Eine Bitte, weiterzuarbeiten oder zu pushen, ist keine Merge-Freigabe.
- Kein Auto-Merge, kein direkter Entwicklungs-Push auf `main`. Alles vor der Freigabe-Anfrage fertigstellen und prüfen.
- Zusammengehörige Änderungen zu sinnvollen lokalen Commits bündeln und einmal pushen, wenn das Arbeitspaket prüfbar ist, ein Push ausdrücklich gewünscht wird oder eine dauerhafte Übergabe nötig ist. Keine Pushes nach jeder Kleinigkeit, keine leeren Commits für Deployments.
- `dev` wiederverwenden. Kurze Themenbranches nur bei echter Parallelarbeit oder riskanten Experimenten, nicht für jede kleine Anfrage. Bevorzugt eine Release-PR von `dev` nach `main` je fertigem Paket.
- Vor dem Schreiben auf `dev` den Remote-Stand aktualisieren und parallele Änderungen abgleichen. Nie Force-Push oder Umschreiben der veröffentlichten Historie von `main`/`dev`.
- Themenbranches erst löschen, wenn ihr aktueller Head nachweislich gemergt ist, keine offene PR sie nutzt und ein Wiederherstellungsverweis dokumentiert ist. Ungemergte Arbeit bewahren.

## Produkt- und Qualitätsgrenzen

- Kein Backend, kein Login, keine API-Schlüssel, keine laufenden Kosten für externe Dienste. Alle Berechnungen und Daten bleiben im Browser. Diese Grenze nicht stillschweigend aufweichen.
- Keine Cookies, kein Tracking, keine Drittanbieter-Skripte. Jede neue lokale Speicherung auf `/cookies` dokumentieren und, falls nicht technisch notwendig, hinter die Einwilligung «Funktional» stellen.
- Rechtstexte (`lib/legal/`) und Consent-Dialog nur mit Erhöhung von `legalVersion` bzw. `consentVersion` in `lib/site.ts` ändern. `legalVersion` ist ein Datum, bei mehreren Änderungen am selben Tag mit Revision (`2026-10-17.2`).
- Nutzungsbedingungen (`lib/legal/terms-de.ts`, verbindlich; `terms-en.ts` als Übersetzung mit identischer Struktur, geprüft durch `tests/terms.test.ts`): Jede Klausel hat Kurzfassung, Markierung (`limit`, `right`, `duty`, `promise`, `info`) und Rechtsgrundlage. Kurzfassungen dürfen nie mehr versprechen oder weniger einschränken als der Klauseltext. Jede inhaltliche Änderung erhält eine neue Fassungsnummer mit Datum und Eintrag in `history`; die abgelöste Fassung wandert im Wortlaut nach `archive`. Änderungen zum Nachteil der Nutzenden werden gemäss Ziff. 12.2 mindestens 30 Tage vor Inkrafttreten veröffentlicht; die Fassung bleibt bis dahin mit Hinweis «tritt in Kraft am …» sichtbar, die alte Fassung bleibt gültig. Rechtliche Prüfung durch eine Fachperson ist nicht ersetzt; offene Punkte in `docs/QA_<datum>.md` benennen.
- Vor jedem Push: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`. Für UI-Änderungen eine Browserprüfung (Desktop und 390 px) und die Druckansicht; Ergebnisse und Grenzen in `docs/QA_<datum>.md` festhalten.
- Ein grünes Deployment ist keine Geräte- oder Browserabnahme. Ungeprüftes Verhalten ehrlich benennen.
- Übersetzungen typsicher in `lib/i18n/` pflegen; `de.ts` ist die Referenz, alle vier Sprachen werden gemeinsam ergänzt.
- Jede Release-PR nach `main` trägt eine neue Versionsnummer: `npm version <nummer> --no-git-tag-version` (einzige Quelle `package.json`, von dort gelesen für Einstellungsseite und JSON-LD) und den gleich nummerierten Eintrag im `CHANGELOG.md`. Keine Versionsnummern mehr hart kodieren.
