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
5. Für eine fertig geprüfte Veröffentlichung eine gemeinsame PR `dev` → `main` erstellen oder aktualisieren und den Eintrag im `CHANGELOG.md` ergänzen.
6. Konkrete Freigabe einholen, erst dann mergen. Anschliessend Deployment-Status und Produktionsstand prüfen. `dev` wieder mit `main` synchronisieren.

Kurze Themenbranches sind für echte parallele Arbeit oder riskante Experimente erlaubt und gehen zuerst nach `dev`. Sie sind keine dauerhafte dritte Ebene.

## Verständliche Historie

Für die beiden dauerhaften Branches `dev` und `main` reguläre PR-Merges verwenden, damit ihre gemeinsame Historie erhalten bleibt. Kurze Themenbranches können beim Abschluss gesquasht werden. Veröffentlichte Historie wird nicht nachträglich gelöscht oder per Force-Push umgeschrieben.

## Einmalige Einrichtung (16.10.2026)

Der Neubau der Anwendung entstand auf dem Themenbranch `claude/dazzling-allen-sykizw`. `dev` wurde aus diesem Stand angelegt; die erste Release-PR `dev` → `main` ([#29](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/29), gemergt am 17.10.2026 nach Liams Freigabe) ersetzte die bisherige v0-/Prototyp-Historie auf `main` durch den geprüften Neubau. Die älteren Themenbranches (`v0/*`, `codex/*`, `claude/*`) hat Liam am 17.10.2026 in GitHub gelöscht und die überholte PR [#28](https://github.com/AccountGIT-bot/nutzwertanalyse/pull/28) geschlossen; seither bestehen nur noch `dev` und `main`. Der Neubau-Stand bleibt über die Merge-Commits von #29 und #30 auf `main` wiederherstellbar.

## Geltungsbereich der Absicherung

Diese Regeln sind Projekt- und Agentenanweisungen. Serverseitige Branch-Protection-Regeln wurden nicht eingerichtet oder geprüft; die ausdrückliche Merge-Freigabe bleibt Teil des Arbeitsablaufs. Technische Zugriffssperren dürfen nicht behauptet werden, solange sie nicht eingerichtet und geprüft sind.
