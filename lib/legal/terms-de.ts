import { site } from "@/lib/site";
import type { TermsDoc } from "./terms";

const o = site.operator;

/** Verbindliche Fassung der Nutzungsbedingungen (Deutsch). */
export const termsDe: TermsDoc = {
  title: "Nutzungsbedingungen",
  lead: "Klartext statt Kleingedrucktes: Jede Klausel hat eine Kurzfassung, jede Einschränkung ist markiert, und zu jeder Regel steht, auf welchem Gesetz sie beruht.",
  version: 2,
  date: "2026-10-17",

  summary: [
    { tag: "promise", text: "Kostenlos und ohne Konto. Nichts wird ohne deine ausdrückliche, gesonderte Bestellung kostenpflichtig.", refs: [1, 8] },
    { tag: "promise", text: "Deine Analysen verlassen dein Gerät nicht. Wir können sie weder sehen noch speichern.", refs: [2, 4] },
    { tag: "duty", text: "Sichere wichtige Analysen selbst per Export. Verlorene lokale Daten können wir nicht wiederherstellen.", refs: [4] },
    { tag: "limit", text: "Die Anwendung rechnet, du entscheidest. Ergebnisse sind keine Beratung.", refs: [3] },
    { tag: "limit", text: "Für leichte Fahrlässigkeit haften wir nicht, weil die Anwendung kostenlos ist. Vorsatz, grobe Fahrlässigkeit und Personenschäden sind nie ausgeschlossen.", refs: [10] },
    { tag: "right", text: "Privat, im Beruf und in Kundenmandaten nutzbar. Deine Analysen und Berichte gehören dir.", refs: [6, 7] },
    { tag: "promise", text: "Keine Werbung, kein Tracking, kein Datenverkauf. Nachteilige Änderungen und eine Einstellung kündigen wir 30 Tage vorher an.", refs: [8, 9, 12] },
    { tag: "right", text: "Es gilt Schweizer Recht. Als Konsumentin oder Konsument behältst du den Schutz deines Wohnsitzlandes und kannst dort klagen.", refs: [13] },
  ],

  clauses: [
    {
      n: 1,
      title: "Worum es geht und wer wir sind",
      tags: ["info"],
      short: "Diese Bedingungen gelten, sobald du die Anwendung nutzt. Sie ist kostenlos, braucht kein Konto, und du gehst keine Verpflichtung ein, die du kündigen müsstest.",
      items: [
        {
          n: "1.1",
          text: `Diese Nutzungsbedingungen regeln die Nutzung der Web-Anwendung «Nutzwertanalyse» unter ${site.domain} und den zugehörigen Domains (nachfolgend «Anwendung»). Anbieterin ist ${o.name}, ${o.street}, ${o.zipCity}, ${o.country}, E-Mail ${o.email} (nachfolgend «wir»). Die vollständigen Angaben stehen im [Impressum](/impressum).`,
        },
        {
          n: "1.2",
          text: "Die Anwendung ist unentgeltlich. Du musst dich nicht registrieren und keine Personendaten angeben. Mit der Nutzung kommt ein unentgeltliches Nutzungsverhältnis zu diesen Bedingungen zustande. Es endet, sobald du die Anwendung nicht mehr nutzt; eine Kündigung ist nicht nötig.",
        },
        {
          n: "1.3",
          text: "Urteilsfähige Minderjährige dürfen die Anwendung ohne Zustimmung ihrer gesetzlichen Vertretung nutzen, weil sie damit keine Pflicht zu einer Gegenleistung eingehen.",
        },
        {
          n: "1.4",
          text: "Die Bedingungen gelten für Verbraucherinnen und Verbraucher ebenso wie für Unternehmen. Wo eine Regel nur für eine dieser Gruppen gilt, steht das ausdrücklich dabei.",
        },
      ],
      basis: "Art. 1 und 6 OR (Vertragsschluss), Art. 19 Abs. 2 ZGB (unentgeltliche Vorteile für Minderjährige), Art. 3 Abs. 1 lit. s UWG (Angaben zur Anbieterin)",
    },
    {
      n: 2,
      title: "Was die Anwendung leistet",
      tags: ["info"],
      short: "Ein Rechenwerkzeug für Nutzwertanalysen, das vollständig in deinem Browser läuft. Ohne KI-Modell und ohne Datenbank auf einem Server.",
      items: [
        {
          n: "2.1",
          text: "Mit der Anwendung strukturierst du Entscheidungen nach der Methode der Nutzwertanalyse: Alternativen und Kriterien erfassen, gewichten, bewerten und das Ergebnis mit Sensitivitäts- und Robustheitsanalysen prüfen. Die Rechenwege sind auf der Seite [Methode](/methode) offengelegt.",
        },
        {
          n: "2.2",
          text: "Alle Berechnungen laufen in deinem Browser. Inhalte deiner Analysen werden weder an uns noch an Dritte übertragen. Die Website selbst wird über unseren Hosting-Anbieter ausgeliefert; welche technischen Daten dabei anfallen, steht in der [Datenschutzerklärung](/datenschutz).",
        },
        {
          n: "2.3",
          text: "Der Smart-Start, der aus einer Beschreibung in eigenen Worten Vorlage, Titel und Alternativen vorschlägt, arbeitet regelbasiert mit Stichwortlisten auf deinem Gerät. In der Anwendung kommt kein KI-Modell zum Einsatz.",
        },
        {
          n: "2.4",
          text: "Die Robustheitsanalyse beruht auf Zufallsstichproben (Monte-Carlo-Simulation). Ihre Werte können deshalb zwischen zwei Durchläufen leicht schwanken; das ist methodisch gewollt.",
        },
        {
          n: "2.5",
          text: "Ein Freigabe-Link enthält die ganze Analyse komprimiert im Teil der Adresse nach dem #-Zeichen. Dieser Teil wird von Browsern nicht an Server übertragen, und wir speichern Freigabe-Links nicht.",
        },
      ],
      basis: "Leistungsbeschreibung; zur Datenbearbeitung siehe Datenschutzerklärung Ziff. 4 bis 7",
    },
    {
      n: 3,
      title: "Die Anwendung rechnet, du entscheidest",
      tags: ["limit"],
      short: "Das Ergebnis ist nur so gut wie deine Eingaben. Es ist keine Beratung, und die Verantwortung für die Entscheidung bleibt bei dir.",
      items: [
        {
          n: "3.1",
          text: "Die Anwendung berechnet ausschliesslich die Werte, die du eingibst. Kriterien, Gewichte und Bewertungen legst du fest. Vorlagen und Beispielkriterien sind Vorschläge; sie sind weder vollständig noch zwingend für deinen Fall geeignet.",
        },
        {
          n: "3.2",
          text: "Ergebnisse, Ranglisten, Kipppunkte und Simulationen sind Entscheidungshilfen. Sie sind keine rechtliche, steuerliche, finanzielle, medizinische, personalrechtliche oder sonstige fachliche Beratung und ersetzen diese nicht.",
        },
        {
          n: "3.3",
          text: "Die Anwendung entscheidet nicht über Personen oder Sachen und fällt keine automatisierte Einzelentscheidung im Sinne des Datenschutzrechts. Ob und wie du ein Ergebnis verwendest, entscheidest du.",
        },
        {
          n: "3.4",
          text: "Bei Entscheidungen mit grosser Tragweite, etwa Investitionen, Anstellungen oder Immobilienkäufen, empfehlen wir, das Ergebnis mit einer Fachperson zu besprechen.",
        },
      ],
      basis: "Art. 21 DSG und Art. 22 DSGVO (keine automatisierte Einzelentscheidung)",
    },
    {
      n: 4,
      title: "Deine Daten bleiben bei dir, die Sicherung auch",
      tags: ["duty"],
      short: "Wir haben keinen Zugriff auf deine Analysen. Darum können wir sie weder sichern noch wiederherstellen. Exportiere Wichtiges als Datei.",
      items: [
        {
          n: "4.1",
          text: "Analysen werden nur auf deinem Gerät gespeichert: im Arbeitsspeicher des Browsers oder, wenn du der Kategorie «Funktional» zustimmst, im lokalen Speicher (localStorage) deines Browsers. Einzelheiten stehen auf der Seite [Cookies & lokale Speicherung](/cookies).",
        },
        {
          n: "4.2",
          text: "Wir haben technisch keinen Zugriff auf diese Daten. Wir können sie weder einsehen noch sichern, wiederherstellen oder löschen.",
        },
        {
          n: "4.3",
          text: "Lokal gespeicherte Daten können verloren gehen, etwa wenn du Browserdaten löschst, das Gerät wechselst, im privaten Modus arbeitest oder der Browser Speicher freigibt. Für die Sicherung bist du deshalb selbst verantwortlich. Die Anwendung bietet dafür Exporte als JSON (vollständig und wieder importierbar), CSV und Markdown sowie einen druckbaren Bericht.",
        },
        {
          n: "4.4",
          text: "Die Exporte sind offene Standardformate. Du kannst deine Daten jederzeit ohne uns weiterverwenden.",
        },
      ],
      basis: "Art. 7 DSG und Art. 25 DSGVO (Datenschutz durch Technik), Art. 28 DSG und Art. 20 DSGVO (Datenherausgabe, hier durch den Export erfüllt)",
    },
    {
      n: 5,
      title: "Daten anderer Personen und faire Kriterien",
      tags: ["duty"],
      short: "Bewertest du Personen, zum Beispiel Bewerbende, bist du für den rechtmässigen Umgang mit ihren Daten verantwortlich und verwendest nur sachliche, diskriminierungsfreie Kriterien.",
      items: [
        {
          n: "5.1",
          text: "Gibst du Personendaten Dritter ein, zum Beispiel Namen von Bewerberinnen und Bewerbern oder Angaben zu Lieferanten, bist du datenschutzrechtlich für diese Bearbeitung verantwortlich. Wir bearbeiten diese Daten nicht.",
        },
        {
          n: "5.2",
          text: "Bei Personalentscheiden verwendest du nur Kriterien, die sachlich mit der Stelle zusammenhängen. Kriterien, die nach anwendbarem Recht diskriminieren, etwa Geschlecht, Herkunft, Religion, Behinderung, Alter oder sexuelle Orientierung, verwendest du nicht, ausser das Gesetz erlaubt es im Einzelfall ausdrücklich.",
        },
        {
          n: "5.3",
          text: "Freigabe-Links und Exportdateien enthalten die vollständige Analyse. Teile sie nur mit Personen, die die Inhalte sehen dürfen. Wer einen Link besitzt, kann die Analyse öffnen; zurückziehen lässt sich ein geteilter Link technisch nicht.",
        },
      ],
      basis: "Art. 5 lit. j DSG und Art. 4 Nr. 7 DSGVO (verantwortliche Person), Art. 328b OR (Daten im Arbeitsverhältnis), Art. 3 GlG (Verbot der Diskriminierung aufgrund des Geschlechts im Erwerbsleben)",
    },
    {
      n: 6,
      title: "Was du darfst und was nicht",
      tags: ["right", "duty"],
      short: "Nutze die Anwendung privat, im Beruf und für Kundinnen und Kunden. Verboten ist nur, was der Anwendung oder anderen schadet.",
      items: [
        {
          n: "6.1",
          text: "Du darfst die Anwendung für private und geschäftliche Zwecke nutzen, auch für Kundinnen und Kunden und in Beratungsmandaten. Berichte und Exporte darfst du ohne Quellenangabe weitergeben, veröffentlichen und kommerziell verwenden.",
        },
        {
          n: "6.2",
          text: "Nicht erlaubt ist:",
          list: [
            "die Anwendung oder ihre Infrastruktur anzugreifen, zu überlasten oder Sicherheitsmassnahmen zu umgehen;",
            "automatisierte Massenabrufe, die über die normale Nutzung hinausgehen;",
            "die Anwendung für rechtswidrige Zwecke oder zur Verletzung von Rechten Dritter zu nutzen;",
            "den Eindruck zu erwecken, wir hätten ein Ergebnis geprüft, bestätigt oder empfohlen.",
          ],
        },
        {
          n: "6.3",
          text: "Bei Verstössen dürfen wir den Zugriff technisch einschränken, soweit dies zum Schutz der Anwendung oder anderer Nutzender nötig ist.",
        },
      ],
      basis: "Art. 143bis und 144bis StGB (unbefugtes Eindringen, Datenbeschädigung), Art. 3 Abs. 1 lit. b UWG (irreführende Angaben)",
    },
    {
      n: 7,
      title: "Wem was gehört",
      tags: ["right"],
      short: "Deine Analysen gehören dir, und die Vorlagen darfst du frei verwenden. Code, Texte, Grafiken und Video der Website bleiben geschützt.",
      items: [
        { n: "7.1", text: "Inhalte, die du eingibst, und die daraus erstellten Berichte gehören dir. Wir erwerben daran keine Rechte." },
        { n: "7.2", text: "Die mitgelieferten Vorlagen und Kriterienkataloge darfst du in deinen Analysen und Berichten frei verwenden, anpassen und weitergeben." },
        {
          n: "7.3",
          text: "Gestaltung, Texte, Illustrationen, das Erklärvideo und der Programmcode der Anwendung sind urheberrechtlich geschützt. Über die Nutzung nach diesen Bedingungen und den gesetzlich erlaubten Eigengebrauch hinaus darfst du sie nicht kopieren, verbreiten oder für eigene Angebote verwenden.",
        },
        {
          n: "7.4",
          text: "Die Anwendung enthält Open-Source-Komponenten, unter anderem Next.js, React und clsx (MIT-Lizenz) sowie Lucide (ISC-Lizenz). Für diese Komponenten gelten ihre Lizenzen; sie gehen diesen Bedingungen vor.",
        },
      ],
      basis: "Art. 2 und 10 URG (Werke und Verwendungsrechte), Art. 19 URG (Eigengebrauch)",
    },
    {
      n: 8,
      title: "Unsere Zusagen",
      tags: ["promise"],
      short: "Sechs Dinge, auf die du dich verlassen kannst. Sie sind Vertragsbestandteil und keine Werbeaussagen.",
      items: [
        {
          n: "8.1",
          text: "Solange diese Fassung gilt, sagen wir verbindlich zu:",
          list: [
            "Kein Konto: Die Nutzung ist ohne Registrierung möglich.",
            "Kostenlos: Nichts wird ohne deine ausdrückliche, gesonderte Bestellung kostenpflichtig.",
            "Keine Werbung und kein Tracking: keine Werbung, keine Analyse- oder Tracking-Werkzeuge, keine Cookies.",
            "Kein Datenverkauf: Wir verkaufen, vermieten oder tauschen keine Daten.",
            "Keine Inhalte auf Servern: Inhalte deiner Analysen werden nicht an uns übertragen.",
            "Vorankündigung: Änderungen dieser Bedingungen zu deinem Nachteil und eine Einstellung der Anwendung kündigen wir mindestens 30 Tage vorher auf dieser Seite an (Ziff. 9.3 und 12.2).",
          ],
        },
        { n: "8.2", text: "Halten wir eine Zusage nicht ein, stehen dir die gesetzlichen Rechte bei Vertragsverletzungen zu." },
      ],
      basis: "Art. 97 ff. OR (Folgen der Vertragsverletzung)",
    },
    {
      n: 9,
      title: "Verfügbarkeit, Weiterentwicklung und Einstellung",
      tags: ["limit"],
      short: "Wir garantieren keine ständige Verfügbarkeit und dürfen Funktionen ändern, wenn es sachlich begründet ist. Wird die Anwendung eingestellt, erfährst du es 30 Tage vorher.",
      items: [
        {
          n: "9.1",
          text: "Wir bemühen uns um einen zuverlässigen Betrieb, sichern aber keine bestimmte Verfügbarkeit zu. Unterbrüche für Wartung, für Sicherheitsupdates oder durch Störungen beim Hosting-Anbieter sind möglich.",
        },
        {
          n: "9.2",
          text: "Wir dürfen die Anwendung weiterentwickeln und Funktionen ändern oder entfernen, wenn dafür ein sachlicher Grund besteht, etwa technische Entwicklung, Sicherheit oder eine Rechtsänderung, und wenn die Änderung für dich zumutbar ist. Wir achten darauf, dass ältere JSON-Exporte importierbar bleiben.",
        },
        {
          n: "9.3",
          text: "Wir dürfen die Anwendung einstellen. Wir kündigen dies mindestens 30 Tage vorher auf der Website an, damit du deine Analysen exportieren kannst. Ist ein sofortiges Abschalten aus rechtlichen oder zwingenden Sicherheitsgründen nötig, informieren wir so früh wie möglich.",
        },
        {
          n: "9.4",
          text: `Support leisten wir freiwillig. Anfragen an ${o.email} beantworten wir in der Regel innert zehn Arbeitstagen.`,
        },
      ],
      basis: "Art. 8 UWG (keine missbräuchliche Benachteiligung), Anhang Nr. 1 Bst. k Richtlinie 93/13/EWG (keine Leistungsänderung ohne triftigen Grund)",
    },
    {
      n: 10,
      title: "Haftung",
      tags: ["limit"],
      short: "Für Vorsatz, grobe Fahrlässigkeit und Personenschäden haften wir immer voll. Für leichte Fahrlässigkeit haften wir nicht, weil wir die Anwendung kostenlos anbieten. Zwingendes Recht geht vor.",
      items: [
        {
          n: "10.1",
          text: "Wir haften unbeschränkt für Schäden, die wir vorsätzlich oder grobfahrlässig verursachen, für Schäden aus der Verletzung von Leben, Körper oder Gesundheit sowie nach den zwingenden Vorschriften des Produkthaftungsrechts.",
        },
        {
          n: "10.2",
          text: "Im Übrigen ist unsere Haftung für leichte Fahrlässigkeit ausgeschlossen, soweit das Gesetz dies zulässt. Der Grund: Wir bieten die Anwendung unentgeltlich an. Der Ausschluss betrifft insbesondere Folgen von Entscheidungen, die du gestützt auf Ergebnisse triffst, sowie entgangenen Gewinn.",
        },
        {
          n: "10.3",
          text: "Für Datenverlust gelten Ziff. 10.1 und 10.2. Hast du keine Sicherung angelegt (Ziff. 4.3), wird das bei der Bemessung eines Schadenersatzes berücksichtigt.",
        },
        {
          n: "10.4",
          text: "Diese Regeln gelten auch für unsere Hilfspersonen. Zwingende Bestimmungen zum Schutz von Verbraucherinnen und Verbrauchern bleiben unberührt, auch jene des Landes, in dem du wohnst.",
        },
      ],
      basis: "Art. 99 Abs. 2 OR (mildere Haftung bei unentgeltlichen Geschäften), Art. 100 Abs. 1 OR (kein Ausschluss für Absicht und grobe Fahrlässigkeit), Art. 101 OR (Hilfspersonen), Art. 44 OR (Selbstverschulden), Produkthaftpflichtgesetz, Anhang Nr. 1 Bst. a und b Richtlinie 93/13/EWG",
    },
    {
      n: 11,
      title: "Was auf dieser Website nicht echt ist",
      tags: ["info"],
      short: "Zwei Fotos auf der Startseite sind KI-generiert, und die Stimmen dort sind erfundene Beispiele. Echte Bewertungen haben wir noch keine.",
      items: [
        {
          n: "11.1",
          text: "Die Fotos in den Abschnitten «Vertrauen» und «Stimmen» der Startseite wurden mit einem KI-Bildgenerator erstellt. Die abgebildeten Personen sind nicht real.",
        },
        {
          n: "11.2",
          text: "Die Karten im Abschnitt «Stimmen» sind als «Beispielstimme» gekennzeichnet. Es sind erfundene Beispiele typischer Anwendungsfälle und keine Bewertungen echter Nutzerinnen und Nutzer. Echte Rückmeldungen werden wir als solche kennzeichnen und nur mit Einwilligung der Verfassenden veröffentlichen.",
        },
        {
          n: "11.3",
          text: "Illustrationen und das Erklärvideo sind eigene Grafiken. Zahlen auf der Website beschreiben Funktionen der Anwendung, etwa die Anzahl Vorlagen. Nutzungsstatistiken erheben wir nicht.",
        },
      ],
      basis: "Art. 3 Abs. 1 lit. b UWG (keine irreführenden Angaben), Anhang I Nr. 23b und 23c Richtlinie 2005/29/EG (Verbot gefälschter Bewertungen)",
    },
    {
      n: 12,
      title: "Änderungen dieser Bedingungen",
      tags: ["promise", "limit"],
      short: "Es gilt die Fassung, die bei deiner Nutzung veröffentlicht ist. Was dich schlechterstellt, kündigen wir 30 Tage vorher an, und frühere Fassungen bleiben einsehbar.",
      items: [
        {
          n: "12.1",
          text: "Weil du kein Konto hast, gilt für jede Nutzung die Fassung, die zu diesem Zeitpunkt auf dieser Seite veröffentlicht ist.",
        },
        {
          n: "12.2",
          text: "Änderungen, die dich schlechterstellen, veröffentlichen wir mindestens 30 Tage vor ihrem Inkrafttreten auf dieser Seite, zusammen mit einer Erklärung, was sich ändert. Früher in Kraft treten dürfen solche Änderungen nur, wenn neue gesetzliche Vorgaben oder Entscheidungen von Behörden oder Gerichten es verlangen.",
        },
        { n: "12.3", text: "Änderungen zu deinen Gunsten und rein redaktionelle Änderungen können sofort gelten." },
        { n: "12.4", text: "Jede Fassung erhält eine Nummer und ein Datum. Frühere Fassungen bleiben unten auf dieser Seite im Wortlaut einsehbar." },
        {
          n: "12.5",
          text: "Bist du mit einer neuen Fassung nicht einverstanden, nutzt du die Anwendung nicht weiter. Bestehende Analysen darfst du trotzdem noch exportieren; dafür gilt die bisherige Fassung.",
        },
      ],
      basis: "Art. 1 OR (Zustimmung durch Nutzung), Art. 8 UWG (keine missbräuchliche Benachteiligung), Anhang Nr. 1 Bst. j Richtlinie 93/13/EWG (keine einseitige Änderung ohne triftigen Grund)",
    },
    {
      n: 13,
      title: "Anwendbares Recht, Gerichtsstand und Streitbeilegung",
      tags: ["right"],
      short: "Es gilt Schweizer Recht. Als Konsumentin oder Konsument behältst du den zwingenden Schutz deines Wohnsitzlandes und kannst an deinem Wohnsitz klagen.",
      items: [
        {
          n: "13.1",
          text: "Es gilt schweizerisches Recht. Bist du Verbraucherin oder Verbraucher und hast deinen gewöhnlichen Aufenthalt in einem anderen Land, bleiben dir die zwingenden Verbraucherschutzbestimmungen dieses Landes erhalten.",
        },
        {
          n: "13.2",
          text: "Bist du Verbraucherin oder Verbraucher, kannst du wahlweise an deinem Wohnsitz oder an unserem Sitz klagen. Wir können dich nur an deinem Wohnsitz einklagen.",
        },
        { n: "13.3", text: `Für Unternehmen ist ausschliesslicher Gerichtsstand ${o.venue}, Schweiz.` },
        {
          n: "13.4",
          text: "Wir nehmen nicht an Verfahren vor Verbraucherschlichtungsstellen teil. Schreib uns bei Problemen direkt; wir suchen mit dir eine Lösung. Die frühere EU-Plattform zur Online-Streitbeilegung wurde per 20. Juli 2025 abgeschafft.",
        },
      ],
      basis: "Art. 32 und 35 ZPO (Gerichtsstand bei Konsumentenverträgen, kein Verzicht im Voraus), Art. 120 IPRG, Art. 15 bis 17 Lugano-Übereinkommen, Art. 6 Rom-I-Verordnung (EG) Nr. 593/2008, Verordnung (EU) 2024/3228 (Aufhebung der Online-Streitbeilegungsplattform)",
    },
    {
      n: 14,
      title: "Schlussbestimmungen",
      tags: ["info"],
      short: "Deutsch ist massgebend. Unklare Formulierungen gelten zu deinen Gunsten, und eine unwirksame Klausel ersetzt das Gesetz.",
      items: [
        { n: "14.1", text: "Massgebend ist die deutsche Fassung. Übersetzungen dienen dem Verständnis. Sind Formulierungen unklar, gilt die für dich günstigere Auslegung." },
        {
          n: "14.2",
          text: "Die Kurzfassungen («Kurz gesagt») und die Übersicht am Anfang dieser Seite erklären die Klauseln; verbindlich ist der Klauseltext. Weichen Kurzfassung und Klauseltext voneinander ab, gilt, was für dich günstiger ist.",
        },
        { n: "14.3", text: "Ist eine Bestimmung ganz oder teilweise unwirksam, bleiben die übrigen wirksam. An die Stelle der unwirksamen Bestimmung tritt die gesetzliche Regelung." },
        { n: "14.4", text: `Kontakt für alle Anliegen zu diesen Bedingungen: ${o.email}.` },
      ],
      basis: "Unklarheitenregel (Auslegung zulasten der verfassenden Partei), Art. 5 Richtlinie 93/13/EWG (verbraucherfreundliche Auslegung), Art. 20 Abs. 2 OR (Teilnichtigkeit)",
    },
  ],

  history: [
    {
      version: 2,
      date: "2026-10-17",
      note: "Vollständig neu geschrieben. Keine Änderung stellt dich gegenüber Fassung 1 schlechter.",
      changes: [
        "Neuer Aufbau: Übersicht, Kurzfassung je Klausel, markierte Einschränkungen und Rechtsgrundlagen.",
        "Neu: verbindliche Zusagen (Ziff. 8) und 30 Tage Vorankündigung bei nachteiligen Änderungen und vor einer Einstellung (Ziff. 9.3, 12.2).",
        "Neu: Offenlegung von KI-Bildern und Beispielstimmen auf der Startseite (Ziff. 11).",
        "Präzisiert: Personendaten Dritter und faire Kriterien bei Personalentscheiden (Ziff. 5), Gerichtsstand für Verbraucherinnen und Verbraucher (Ziff. 13).",
        "Haftung: Personenschäden und Produkthaftung jetzt ausdrücklich vorbehalten (Ziff. 10.1).",
        "Unwirksame Klauseln: Es gilt das Gesetz statt einer «wirtschaftlich nächstliegenden» Ersatzregel (Ziff. 14.3).",
        "Neue Pflichten in Ziff. 5.2 und 6.2 sowie das Recht, bei Missbrauch den Zugriff einzuschränken (Ziff. 6.3), geben im Wesentlichen geltendes Recht wieder.",
      ],
    },
    {
      version: 1,
      date: "2026-10-17",
      note: "Erste Fassung, veröffentlicht mit Release 2.0.0.",
      changes: ["Erste Fassung der Nutzungsbedingungen."],
    },
  ],

  archive: [
    {
      version: 1,
      date: "2026-10-17",
      intro: "Diese Nutzungsbedingungen regeln die Nutzung der kostenlosen Web-Anwendung «Nutzwertanalyse» (nachfolgend «Anwendung»).",
      blocks: [
        { type: "h2", text: "1. Geltungsbereich und Anbieter" },
        {
          type: "p",
          text: `Anbieter der Anwendung ist ${o.name}, ${o.street}, ${o.zipCity}, ${o.country} (nachfolgend «Anbieter»). Mit der Nutzung der Anwendung akzeptieren Sie diese Nutzungsbedingungen. Es besteht keine Registrierungspflicht; es kommt kein Dauerschuldverhältnis zustande.`,
        },
        { type: "h2", text: "2. Leistung" },
        {
          type: "p",
          text: "Die Anwendung stellt ein Werkzeug zur Durchführung von Nutzwertanalysen (Scoring-Modell) bereit. Sie wird kostenlos und ohne Zusicherung bestimmter Eigenschaften («wie besehen») zur Verfügung gestellt. Es besteht kein Anspruch auf Verfügbarkeit, Weiterentwicklung oder Support. Der Anbieter kann die Anwendung jederzeit ändern, einschränken oder einstellen.",
        },
        { type: "h2", text: "3. Keine Beratung" },
        {
          type: "p",
          text: "Die Anwendung berechnet ausschliesslich die von Ihnen eingegebenen Werte. Ergebnisse, Empfehlungen, Sensitivitäts- und Robustheitsanalysen sind Entscheidungshilfen und stellen keine fachliche, rechtliche, steuerliche, finanzielle oder sonstige Beratung dar. Sie sind allein verantwortlich für die Eingaben, deren Interpretation und die darauf gestützten Entscheidungen.",
        },
        { type: "h2", text: "4. Datenhaltung und Verantwortung der Nutzer" },
        {
          type: "p",
          text: "Die Anwendung verarbeitet und speichert Inhalte ausschliesslich lokal im Browser. Der Anbieter hat keinen Zugriff auf Ihre Analysen und erstellt keine Sicherungskopien. Sie sind selbst für die Sicherung Ihrer Daten (z. B. per JSON-Export) verantwortlich. Für Datenverluste – etwa durch das Löschen von Browserdaten, Gerätewechsel oder Browser-Updates – haftet der Anbieter nicht.",
        },
        {
          type: "p",
          text: "Sie verpflichten sich, bei der Eingabe von Daten Dritter (insbesondere Personendaten) die anwendbaren gesetzlichen Bestimmungen einzuhalten und Freigabe-Links sowie Exportdateien nur an berechtigte Personen weiterzugeben.",
        },
        { type: "h2", text: "5. Zulässige Nutzung" },
        {
          type: "ul",
          items: [
            "Die Anwendung darf für private und geschäftliche Zwecke genutzt werden.",
            "Unzulässig sind Handlungen, welche die Verfügbarkeit oder Sicherheit der Anwendung beeinträchtigen (z. B. automatisierte Massenabrufe, Angriffe auf die Infrastruktur).",
            "Unzulässig ist die Nutzung zur Verletzung von Rechten Dritter oder zu rechtswidrigen Zwecken.",
          ],
        },
        { type: "h2", text: "6. Geistiges Eigentum" },
        {
          type: "p",
          text: "Die Anwendung, ihre Gestaltung, Texte, Vorlagen und Grafiken sind urheberrechtlich geschützt. Die von Ihnen erstellten Analysen und Exporte gehören Ihnen; der Anbieter erwirbt daran keine Rechte.",
        },
        { type: "h2", text: "7. Haftung" },
        {
          type: "p",
          text: "Die Nutzung erfolgt auf eigene Verantwortung. Soweit gesetzlich zulässig, schliesst der Anbieter jede Haftung für direkte und indirekte Schäden aus der Nutzung oder Nichtnutzung der Anwendung, aus fehlerhaften Berechnungen, Datenverlust oder Unterbrüchen aus. Vorbehalten bleibt die zwingende Haftung für rechtswidrige Absicht und grobe Fahrlässigkeit (Art. 100 Abs. 1 OR) sowie für Personenschäden. Zwingende Verbraucherschutzbestimmungen am Wohnsitz von Verbraucherinnen und Verbrauchern bleiben unberührt.",
        },
        { type: "h2", text: "8. Änderungen" },
        {
          type: "p",
          text: "Der Anbieter kann diese Nutzungsbedingungen jederzeit anpassen. Massgebend ist die zum Zeitpunkt der Nutzung auf der Website veröffentlichte Fassung.",
        },
        { type: "h2", text: "9. Anwendbares Recht und Gerichtsstand" },
        {
          type: "p",
          text: `Es gilt schweizerisches Recht unter Ausschluss des Kollisionsrechts und des UN-Kaufrechts. Ausschliesslicher Gerichtsstand ist ${o.venue}, Schweiz. Vorbehalten bleiben zwingende gesetzliche Gerichtsstände, insbesondere für Verbraucherinnen und Verbraucher (z. B. nach dem Lugano-Übereinkommen).`,
        },
        { type: "h2", text: "10. Salvatorische Klausel" },
        {
          type: "p",
          text: "Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Anstelle der unwirksamen Bestimmung gilt eine wirksame Regelung, die dem wirtschaftlichen Zweck am nächsten kommt.",
        },
      ],
    },
  ],
};
