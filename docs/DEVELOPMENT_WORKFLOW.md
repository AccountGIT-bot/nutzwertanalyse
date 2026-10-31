# Entwicklungsablauf

Übernommen von GARAGO (Vereinbarung mit Liam vom 13. September 2026), gültig für dieses Repository seit dem 16. Oktober 2026. Ziel: wenige verständliche Arbeitspakete, ein gemeinsamer Entwicklungsstand und eine bewusst freigegebene Produktion.

## Zwei dauerhafte Branches

| Branch | Aufgabe | Veröffentlichung |
| --- | --- | --- |
| `dev` | Gemeinsame Entwicklung, Korrekturen und Vorschau (Vercel-Preview) | Gebündelte, geprüfte Arbeitspakete pushen |
| `main` | Freigegebener Produktionsstand | Nur per PR nach ausdrücklicher Freigabe von Liam |

Ein Push auf `dev` ist keine Freigabe für `main`. Vor **jedem Merge nach `main`** die konkrete PR, Änderungen, Prüfungen und offenen Punkte nennen und Liam fragen. Hat er diesen konkreten Merge bereits ausdrücklich freigegeben, direkt ausführen und nicht nochmals fragen. Kein Auto-Merge und kein direkter Entwicklungs-Push auf `main`.

## Ein sinnvoller Arbeitszyklus

1. Remote-Stand von `dev`, `main` und offenen PRs prüfen. Parallele Änderungen zuerst abgleichen.
2. Zusammengehörige Korrekturen lokal fertigstellen. Kleine Folgeanpassungen am selben Ergebnis zusammen erledigen.
3. Passend zum Risiko prüfen: `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`; für UI-Änderungen zusätzlich eine Darstellungsprüfung im Browser (Desktop und 390 px) sowie die Druckansicht.
4. Einen verständlich benannten Commit je abgeschlossenem Arbeitspaket erstellen. Einmal pushen, wenn das Paket prüfbar ist, ein expliziter Push gewünscht wird oder eine dauerhafte Übergabe nötig ist. Keine Pushes nach jedem Textsatz, keine leeren Deployment-Commits.
5. Für eine fertig geprüfte Veröffentlichung eine gemeinsame PR `dev` → `main` erstellen oder aktualisieren. Dazu gehört immer der Versionsschritt nach den Regeln in «Versionierung und Releases»: `npm version <neue Nummer> --no-git-tag-version` (aktualisiert `package.json` und `package-lock.json`; Einstellungsseite, Fusszeile und JSON-LD lesen die Nummer von dort) sowie der gleich nummerierte Eintrag im `CHANGELOG.md`. Versionsnummer und Changelog-Eintrag müssen vor der Freigabe-Anfrage im PR enthalten sein; `npm test` prüft die Übereinstimmung.
6. Konkrete Freigabe einholen, erst dann mergen. Die Freigabe läuft über die Release-Karte mit drei Knöpfen: «Pull Request» (GitHub-Logo, Link zur PR), «Vercel Preview» (Vercel-Logo, Link zur Vorschau des `dev`-Standes) und «Merge nach main freigeben» mit Doppelklick innerhalb von 10 Sekunden. Die Karte speichert die Freigabe mit Zeitstempel; erst dann wird gemergt. Sie erscheint erst, wenn das Paket vollständig gepusht und geprüft ist und die Release-PR offen ist. Ohne Karte ersatzweise eine Auswahlfrage mit zweiter Bestätigung. Anschliessend den Merge-Commit als `vX.Y.Z` taggen, Deployment-Status und Produktionsstand prüfen, Changelog nachführen. `dev` wieder mit `main` synchronisieren.

Kurze Themenbranches sind für echte parallele Arbeit oder riskante Experimente erlaubt und gehen zuerst nach `dev`. Sie sind keine dauerhafte dritte Ebene.

## Versionierung und Releases

Nutzwertanalyse folgt **Semantic Versioning** (`MAJOR.MINOR.PATCH`). Die Nummer steht an genau einer Stelle, in `package.json`; Einstellungsseite, Fusszeile und JSON-LD lesen sie von dort. Jede Release-PR `dev` → `main` erhöht sie um genau eine Stufe:

| Stufe | Wann | Beispiele |
| --- | --- | --- |
| `MAJOR` | Gespeicherte Analysen oder Exporte älterer Fassungen werden nicht mehr gelesen (`schemaVersion`), Produkt grundlegend neu | 1.x → 2.0.0 (Neubau 17.10.2026) |
| `MINOR` | Neue oder sichtbar veränderte Funktion, neue Seite, neuer Bericht, geänderte Rechtstexte | 2.5.0 Druckbericht, 2.6.0 Mobil-Korrekturen und Diagramme |
| `PATCH` | Fehlerbehebung, Textkorrektur, Austausch von Medien ohne neue Funktion | 2.2.1 scharfes Video |

Konventionen:

- **Änderungsprotokoll** `CHANGELOG.md`, neueste Fassung zuoberst. Während der Arbeit auf `dev` sammeln Änderungen unter `## Unveröffentlicht`; beim Versionsschritt wird daraus `## X.Y.Z – TT.MM.JJJJ` mit der Zeile `Release-PR: [#n](…)` und nach dem Merge `Freigegeben von Liam am … (Karte/Chat), Merge-Commit \`abc1234\`, Tag \`vX.Y.Z\``. Jeder Eintrag listet die Änderungen aus Sicht der Nutzenden, den Versionsschritt und den Prüfbericht `docs/QA_<datum>.md`.
- **Tags**: Nach dem Merge trägt der Merge-Commit auf `main` den annotierten Tag `vX.Y.Z`. `npm run release:tags` (`scripts/release-tags.mjs`) liest Version und Merge-Commit aus dem Changelog, legt fehlende Tags an und pusht sie; vorhandene Tags bleiben unberührt. Tags werden nie verschoben oder gelöscht; eine Korrektur ist ein neues Release. Ausgeführt wird das von der GitHub Action «Release-Tags» (`.github/workflows/release-tags.yml`): Sie läuft nach jedem Push auf `main`, also nach jedem Release-Merge, und lässt sich im Reiter Actions oder von Claude über die GitHub-API von Hand starten. Sie braucht kein Secret (`GITHUB_TOKEN`). Aus der Cloud-Sitzung von Claude lehnt der Git-Proxy das Pushen von Tags ab (HTTP 403), lokal geht `npm run release:tags` ebenfalls.
- **Prüfung**: `tests/version.test.ts` läuft mit `npm test` und bricht ab, wenn `package.json`, `package-lock.json` und der oberste Changelog-Eintrag nicht dieselbe Nummer tragen, Einträge nicht streng absteigend sind oder Datum bzw. Release-PR fehlen.
- **Sichtbarkeit**: Die laufende Version steht auf `/einstellungen` («Version X.Y.Z») und in der Fusszeile jeder Seite (`vX.Y.Z`).
- **Keine Vorab-Fassungen** (`-beta`, `-rc`) und keine Build-Nummern: `dev` ist die Vorschau, die Vercel-Preview zeigt den jeweils gepushten Stand.

Release-Checkliste (in dieser Reihenfolge):

1. `dev` aktuell, Paket geprüft (`npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, Browserprüfung, Prüfbericht).
2. Versionsschritt: `npm version X.Y.Z --no-git-tag-version`; Changelog-Eintrag mit Datum und Release-PR-Nummer; Commit «Release X.Y.Z: version step and changelog entry».
3. Push nach `dev`, Release-PR `dev` → `main` «Release X.Y.Z: <Titel>» mit Zusammenfassung und Prüfungen; Vercel-Preview READY abwarten.
4. Release-Karte aktualisieren (Version, PR, Head, Preview, Prüfungen) und Freigabe einholen.
5. Merge als Merge-Commit mit dem PR-Titel, `expectedHeadSha` = freigegebener Head.
6. Changelog-Zeile mit Merge-Commit ergänzen und auf `dev` pushen; die Action «Release-Tags» setzt `vX.Y.Z` beim nächsten Lauf (Push auf `main` oder von Hand starten).
7. Changelog nachführen (Freigabe, Merge-Commit, Tag) mit Commit «Record release X.Y.Z in changelog» auf `dev`, Karte auf «gemergt» stellen, Produktions-Deployment prüfen.

## Verständliche Historie

Für die beiden dauerhaften Branches `dev` und `main` reguläre PR-Merges verwenden, damit ihre gemeinsame Historie erhalten bleibt. Kurze Themenbranches können beim Abschluss gesquasht werden. Veröffentlichte Historie wird nicht nachträglich gelöscht oder per Force-Push umgeschrieben.

## Einmalige Einrichtung (16.10.2026)

Der Neubau der Anwendung entstand auf dem Themenbranch `claude/dazzling-allen-sykizw`. `dev` wurde aus diesem Stand angelegt; die erste Release-PR `dev` → `main` ([#29](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/29), gemergt am 17.10.2026 nach Liams Freigabe) ersetzte die bisherige v0-/Prototyp-Historie auf `main` durch den geprüften Neubau. Die älteren Themenbranches (`v0/*`, `codex/*`, `claude/*`) hat Liam am 17.10.2026 in GitHub gelöscht und die überholte PR [#28](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/28) geschlossen; seither bestehen nur noch `dev` und `main`. Der Neubau-Stand bleibt über die Merge-Commits von #29 und #30 auf `main` wiederherstellbar.

## Geltungsbereich der Absicherung

Diese Regeln sind Projekt- und Agentenanweisungen. Serverseitige Branch-Protection-Regeln wurden nicht eingerichtet oder geprüft; die ausdrückliche Merge-Freigabe bleibt Teil des Arbeitsablaufs. Technische Zugriffssperren dürfen nicht behauptet werden, solange sie nicht eingerichtet und geprüft sind.
