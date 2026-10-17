import { site } from "@/lib/site";
import type { LegalSet } from "./types";

const o = site.operator;
const h = site.hosting;

export const legalDe: LegalSet = {
  bindingNote: "Massgebend ist die deutsche Fassung dieser Rechtstexte.",
  placeholderWarning:
    "Hinweis für den Betreiber: In der Konfiguration (lib/site.ts) sind noch Platzhalter hinterlegt. Vor dem Produktivbetrieb müssen die Angaben zum Betreiber vollständig ausgefüllt werden.",
  docs: {
    imprint: {
      title: "Impressum",
      updated: site.legalVersion,
      intro: "Angaben gemäss Art. 3 Abs. 1 lit. s UWG (Schweiz) sowie Informationspflichten nach DSG und DSGVO.",
      blocks: [
        { type: "h2", text: "Betreiber dieser Website" },
        {
          type: "table",
          head: ["", ""],
          rows: [
            ["Name / Firma", o.name],
            ["Rechtsform", o.legalForm],
            ["Adresse", `${o.street}, ${o.zipCity}, ${o.country}`],
            ["E-Mail", o.email],
            ["Telefon", o.phone],
            ["UID", o.uid],
            ["Vertretungsberechtigte Person", o.representative],
          ],
        },
        { type: "h2", text: "Hosting" },
        {
          type: "p",
          text: `Diese Website wird bei ${h.provider}, ${h.address}, gehostet. Beim Aufruf der Website werden vom Hosting-Anbieter technisch notwendige Zugriffsdaten (Server-Logs) verarbeitet. Details dazu finden sich in der [Datenschutzerklärung](/datenschutz).`,
        },
        { type: "h2", text: "Haftungsausschluss" },
        {
          type: "p",
          text: "Die Inhalte dieser Website wurden mit grösstmöglicher Sorgfalt erstellt. Der Betreiber übernimmt jedoch keine Gewähr für die Richtigkeit, Vollständigkeit und Aktualität der bereitgestellten Inhalte und Berechnungen. Die Nutzwertanalyse ist eine Entscheidungshilfe; sie strukturiert subjektive Einschätzungen und ersetzt keine fachliche, rechtliche, steuerliche oder finanzielle Beratung. Entscheidungen, die auf Basis dieser Website getroffen werden, liegen in der alleinigen Verantwortung der Nutzerinnen und Nutzer.",
        },
        {
          type: "p",
          text: "Haftungsansprüche gegen den Betreiber wegen Schäden materieller oder immaterieller Art, die aus dem Zugriff, der Nutzung oder Nichtnutzung der Website, aus Missbrauch der Verbindung oder aus technischen Störungen entstanden sind, werden – soweit gesetzlich zulässig – ausgeschlossen. Vorbehalten bleibt die Haftung für rechtswidrige Absicht und grobe Fahrlässigkeit (Art. 100 OR).",
        },
        { type: "h2", text: "Haftung für Links" },
        {
          type: "p",
          text: "Verweise und Links auf Websites Dritter liegen ausserhalb des Verantwortungsbereichs des Betreibers. Es wird jegliche Verantwortung für solche Websites abgelehnt. Der Zugriff und die Nutzung solcher Websites erfolgen auf eigene Gefahr der Nutzerinnen und Nutzer.",
        },
        { type: "h2", text: "Urheberrechte" },
        {
          type: "p",
          text: "Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf dieser Website gehören ausschliesslich dem Betreiber oder den speziell genannten Rechteinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen. Von Nutzerinnen und Nutzern erstellte Analysen und Exporte bleiben deren Eigentum.",
        },
        { type: "h2", text: "Rechtstexte" },
        { type: "p", text: "[Datenschutzerklärung](/datenschutz) · [Nutzungsbedingungen](/agb) · [Cookies & lokale Speicherung](/cookies) · [Barrierefreiheit](/barrierefreiheit)" },
      ],
    },

    privacy: {
      title: "Datenschutzerklärung",
      updated: site.legalVersion,
      intro:
        "Diese Datenschutzerklärung informiert über die Bearbeitung von Personendaten beim Besuch und bei der Nutzung dieser Website. Sie richtet sich nach dem Schweizer Bundesgesetz über den Datenschutz (DSG) sowie – soweit anwendbar – nach der Datenschutz-Grundverordnung der EU (DSGVO).",
      blocks: [
        { type: "h2", text: "1. Das Wichtigste in Kürze" },
        {
          type: "ul",
          items: [
            "Diese Website hat kein Benutzerkonto, kein Login und keinen Server, der Ihre Analysen speichert oder verarbeitet. Sämtliche Berechnungen, Speicherungen und Exporte erfolgen ausschliesslich in Ihrem Browser auf Ihrem Gerät.",
            "Wir setzen keine Cookies, keine Analyse-, Tracking- oder Marketing-Tools und keine Skripte von Drittanbietern ein.",
            "Der Inhalt Ihrer Analysen (Titel, Alternativen, Kriterien, Bewertungen, Notizen) wird zu keinem Zeitpunkt an uns oder an Dritte übermittelt. Wir haben darauf keinen Zugriff.",
            "Einzig unser Hosting-Anbieter verarbeitet beim Laden der Website technisch notwendige Zugriffsdaten (Server-Logs), siehe Ziffer 4.",
            "Mit Ihrer Einwilligung werden Analysen und Einstellungen im lokalen Speicher (localStorage) Ihres Browsers abgelegt, damit sie beim nächsten Besuch noch vorhanden sind. Sie können diese Daten jederzeit selbst löschen, siehe Ziffer 5.",
          ],
        },
        { type: "h2", text: "2. Verantwortliche Stelle" },
        {
          type: "p",
          text: `Verantwortlich für die Datenbearbeitung im Zusammenhang mit dieser Website ist: ${o.name}, ${o.street}, ${o.zipCity}, ${o.country}, E-Mail: ${o.email}.`,
        },
        ...(o.dpo ? [{ type: "p" as const, text: `Datenschutzberatung / Datenschutzbeauftragte Person: ${o.dpo}.` }] : []),
        ...(o.euRepresentative
          ? [{ type: "p" as const, text: `Vertretung in der EU gemäss Art. 27 DSGVO: ${o.euRepresentative}.` }]
          : [
              {
                type: "p" as const,
                text: "Die Website richtet sich primär an Nutzerinnen und Nutzer in der Schweiz. Soweit die DSGVO auf Personen in der EU/im EWR Anwendung findet, gelten die nachfolgenden Angaben zu Rechtsgrundlagen und Betroffenenrechten entsprechend.",
              },
            ]),
        { type: "h2", text: "3. Grundsätze" },
        {
          type: "p",
          text: "Wir bearbeiten Personendaten nur, soweit dies für den Betrieb der Website technisch notwendig ist (Hosting) oder Sie selbst dies durch eine Handlung veranlassen (z. B. E-Mail-Kontakt). Wir folgen den Grundsätzen «Privacy by Design» und «Privacy by Default» (Art. 7 DSG, Art. 25 DSGVO): Die Anwendung wurde bewusst so gebaut, dass keine inhaltlichen Daten den Browser verlassen.",
        },
        { type: "h2", text: "4. Hosting und Server-Logs" },
        {
          type: "p",
          text: `Diese Website wird bei ${h.provider}, ${h.address}, betrieben (nachfolgend «Hoster»). Beim Aufruf der Website übermittelt Ihr Browser automatisch technische Daten an den Server des Hosters. Dazu gehören: IP-Adresse, Datum und Uhrzeit des Zugriffs, aufgerufene URL, Referrer-URL, verwendeter Browser und Betriebssystem (User Agent), übertragene Datenmenge und HTTP-Statuscode.`,
        },
        {
          type: "p",
          text: `Zweck: Auslieferung der Website, Gewährleistung von Stabilität und Sicherheit (z. B. Abwehr von Angriffen), Fehleranalyse. Rechtsgrundlage: überwiegendes berechtigtes Interesse am sicheren und zuverlässigen Betrieb der Website (Art. 31 Abs. 1 DSG; Art. 6 Abs. 1 lit. f DSGVO). Speicherdauer: Server-Logs werden vom Hoster nur so lange gespeichert, wie es für die genannten Zwecke erforderlich ist (gemäss Angaben des Hosters ${h.logRetention}). Wir selbst werten keine Server-Logs mit Personenbezug aus und erstellen keine Nutzungsstatistiken.`,
        },
        {
          type: "p",
          text: `Der Hoster hat seinen Sitz in den USA. Die statischen Seiten werden über ein weltweites Content-Delivery-Netzwerk ausgeliefert, serverseitige Funktionen (einzig die Erzeugung des Vorschaubilds für soziale Netzwerke) laufen in der Region Frankfurt (EU). Eine Übermittlung technischer Zugriffsdaten in die USA kann dennoch nicht ausgeschlossen werden, etwa für Logs und Netzwerkbetrieb. Sie erfolgt auf Grundlage des Swiss-U.S. Data Privacy Framework bzw. des EU-U.S. Data Privacy Framework, soweit der Hoster zertifiziert ist, sowie ergänzend auf Grundlage der Standardvertragsklauseln der EU-Kommission (Art. 16 Abs. 2 lit. d DSG; Art. 46 Abs. 2 lit. c DSGVO). Datenschutzhinweise des Hosters: [${h.privacyUrl}](${h.privacyUrl}).`,
        },
        { type: "h2", text: "5. Lokale Speicherung im Browser (localStorage)" },
        {
          type: "p",
          text: "Diese Website verwendet keine Cookies. Um Ihre Analysen und Einstellungen über das Schliessen des Browsers hinaus zu erhalten, kann die Anwendung Daten im sogenannten localStorage Ihres Browsers speichern. Diese Daten verbleiben ausschliesslich auf Ihrem Gerät und werden weder an uns noch an Dritte übermittelt. Wir haben technisch keinen Zugriff darauf.",
        },
        {
          type: "table",
          head: ["Kategorie", "Inhalt", "Zweck", "Rechtsgrundlage", "Dauer"],
          rows: [
            ["Notwendig", "Ihre Entscheidung im Einwilligungsdialog (Version, Zeitpunkt, Auswahl)", "Nachweis und Beachtung Ihrer Wahl", "Technisch notwendig (Art. 45c lit. b FMG; Art. 5 Abs. 3 ePrivacy-RL)", "bis zur Löschung durch Sie"],
            ["Funktional", "Ihre Analysen (Titel, Alternativen, Kriterien, Gewichte, Bewertungen, Notizen), Sprache, Design", "Fortsetzen der Arbeit beim nächsten Besuch", "Ihre Einwilligung (Art. 6 Abs. 6 DSG; Art. 6 Abs. 1 lit. a DSGVO), jederzeit widerrufbar", "bis zur Löschung durch Sie"],
            ["Statistik / Marketing", "—", "nicht eingesetzt", "—", "—"],
          ],
        },
        {
          type: "p",
          text: "Ohne Einwilligung in die Kategorie «Funktional» arbeitet die Anwendung ausschliesslich im Arbeitsspeicher; Analysen gehen dann beim Schliessen des Tabs verloren (ein Export als Datei ist weiterhin möglich). Sie können Ihre Einwilligung jederzeit über den Link «Cookie-Einstellungen» im Seitenfuss oder auf der Seite [Einstellungen](/einstellungen) ändern oder widerrufen; dabei werden alle lokal gespeicherten Daten gelöscht. Unabhängig davon können Sie die Daten auch über die Einstellungen Ihres Browsers (Website-Daten löschen) entfernen.",
        },
        { type: "h2", text: "6. Inhalte Ihrer Analysen" },
        {
          type: "p",
          text: "Sie entscheiden selbst, welche Inhalte Sie in eine Analyse eingeben. Enthalten Ihre Analysen Personendaten Dritter (z. B. Namen von Bewerberinnen und Bewerbern bei einer Personalauswahl), sind Sie als Nutzerin bzw. Nutzer für die rechtmässige Bearbeitung dieser Daten verantwortlich. Wir bearbeiten diese Inhalte nicht und haben keinen Zugriff darauf. Beachten Sie insbesondere, dass Freigabe-Links und Exportdateien die vollständige Analyse enthalten.",
        },
        { type: "h2", text: "7. Freigabe-Links" },
        {
          type: "p",
          text: "Die Funktion «Freigabe-Link» verpackt die gesamte Analyse komprimiert in den Teil der Adresse nach dem #-Zeichen (URL-Fragment). Das Fragment wird von Browsern nicht an Server übertragen; der Link wird weder bei uns noch beim Hoster gespeichert. Wer den Link besitzt, kann die Analyse öffnen. Teilen Sie Links daher nur mit Personen, die die Inhalte sehen dürfen, und bevorzugt über verschlüsselte Kanäle.",
        },
        { type: "h2", text: "8. Kontaktaufnahme" },
        {
          type: "p",
          text: "Wenn Sie uns per E-Mail kontaktieren, bearbeiten wir Ihre Angaben (E-Mail-Adresse, Inhalt der Nachricht, allfällige weitere Angaben) zur Beantwortung Ihrer Anfrage. Rechtsgrundlage: Erfüllung vorvertraglicher Pflichten bzw. berechtigtes Interesse an der Beantwortung (Art. 31 DSG; Art. 6 Abs. 1 lit. b und f DSGVO). Die Daten werden gelöscht, sobald sie für die Beantwortung nicht mehr erforderlich sind und keine gesetzlichen Aufbewahrungspflichten bestehen.",
        },
        { type: "h2", text: "9. Keine Weitergabe, kein Profiling" },
        {
          type: "p",
          text: "Wir geben keine Personendaten an Dritte weiter, verkaufen keine Daten und erstellen keine Profile. Es findet keine automatisierte Einzelentscheidung im Sinne von Art. 21 DSG bzw. Art. 22 DSGVO statt. Die Nutzwertanalyse berechnet lediglich die von Ihnen selbst eingegebenen Werte; das Ergebnis ist eine Entscheidungshilfe, die Sie frei verwenden.",
        },
        { type: "h2", text: "10. Datensicherheit" },
        {
          type: "p",
          text: "Die Website wird ausschliesslich über eine verschlüsselte Verbindung (HTTPS/TLS) ausgeliefert. Wir setzen restriktive Sicherheits-Header ein (u. a. Content-Security-Policy, Strict-Transport-Security, Referrer-Policy) und binden keine Ressourcen von Drittanbietern ein. Da keine Inhaltsdaten an Server übermittelt werden, besteht kein serverseitiges Risiko eines Datenverlusts Ihrer Analysen. Für die Sicherheit Ihres Geräts und Browsers sind Sie selbst verantwortlich.",
        },
        { type: "h2", text: "11. Ihre Rechte" },
        {
          type: "p",
          text: "Sie haben im Rahmen des anwendbaren Datenschutzrechts das Recht auf Auskunft (Art. 25 DSG; Art. 15 DSGVO), Berichtigung (Art. 32 DSG; Art. 16 DSGVO), Löschung (Art. 32 DSG; Art. 17 DSGVO), Einschränkung der Bearbeitung (Art. 18 DSGVO), Datenherausgabe bzw. -übertragung (Art. 28 DSG; Art. 20 DSGVO) sowie auf Widerspruch gegen die Bearbeitung (Art. 30 DSG; Art. 21 DSGVO). Eine erteilte Einwilligung können Sie jederzeit mit Wirkung für die Zukunft widerrufen.",
        },
        {
          type: "p",
          text: `Da wir keine Inhaltsdaten speichern, können Sie Ihre Analysen jederzeit selbst exportieren (Recht auf Datenübertragbarkeit, als JSON/CSV/Markdown) und löschen. Für Anfragen betreffend Server-Logs oder E-Mail-Korrespondenz wenden Sie sich an ${o.email}. Zudem haben Sie das Recht, sich bei einer Aufsichtsbehörde zu beschweren: in der Schweiz beim Eidgenössischen Datenschutz- und Öffentlichkeitsbeauftragten (EDÖB), Feldeggweg 1, 3003 Bern, [www.edoeb.admin.ch](https://www.edoeb.admin.ch); in der EU/im EWR bei der Aufsichtsbehörde Ihres Aufenthaltsorts.`,
        },
        { type: "h2", text: "12. Privacy-Signale (GPC / Do Not Track)" },
        {
          type: "p",
          text: "Sendet Ihr Browser ein Global-Privacy-Control- oder Do-Not-Track-Signal, respektieren wir dieses. Da wir ohnehin keine Tracking- oder Werbetechnologien einsetzen, ergibt sich daraus keine Änderung der Datenbearbeitung.",
        },
        { type: "h2", text: "13. Änderungen" },
        {
          type: "p",
          text: "Wir können diese Datenschutzerklärung jederzeit anpassen, insbesondere bei Änderungen der Funktionen oder der Rechtslage. Es gilt die jeweils auf dieser Website veröffentlichte Fassung. Bei wesentlichen Änderungen der lokalen Speicherung fragen wir Ihre Einwilligung erneut ab.",
        },
      ],
    },

    terms: {
      title: "Nutzungsbedingungen",
      updated: site.legalVersion,
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

    cookies: {
      title: "Cookies und lokale Speicherung",
      updated: site.legalVersion,
      intro: "Transparenz darüber, was diese Website auf Ihrem Gerät speichert – und was nicht.",
      blocks: [
        { type: "h2", text: "Keine Cookies" },
        {
          type: "p",
          text: "Diese Website setzt keine Cookies – weder eigene noch solche von Dritten. Es gibt keine Analyse-, Tracking-, Werbe- oder Social-Media-Einbindungen. Es werden keine Schriften, Skripte oder Bilder von fremden Servern geladen.",
        },
        { type: "h2", text: "Was im Browser gespeichert wird (localStorage)" },
        {
          type: "p",
          text: "Der localStorage ist ein Speicherbereich Ihres Browsers, der nur von dieser Website gelesen werden kann und nicht automatisch an Server übertragen wird. Folgende Einträge können angelegt werden:",
        },
        {
          type: "table",
          head: ["Schlüssel", "Inhalt", "Kategorie", "Dauer"],
          rows: [
            ["nwa.consent", "Ihre Einwilligungsentscheidung (Version, Zeitpunkt, Auswahl)", "Notwendig", "bis zur Löschung"],
            ["nwa.library.index", "Liste der IDs Ihrer gespeicherten Analysen", "Funktional", "bis zur Löschung"],
            ["nwa.analysis.<id>", "Je eine gespeicherte Analyse (vollständiger Inhalt)", "Funktional", "bis zur Löschung"],
            ["nwa.locale", "Gewählte Sprache", "Funktional", "bis zur Löschung"],
            ["nwa.theme", "Gewähltes Design (hell/dunkel)", "Funktional", "bis zur Löschung"],
          ],
        },
        {
          type: "p",
          text: "Die Kategorie «Funktional» wird nur nach Ihrer ausdrücklichen Einwilligung genutzt. Ohne Einwilligung bleiben Analysen nur bis zum Schliessen des Tabs im Arbeitsspeicher erhalten.",
        },
        { type: "h2", text: "Rechtsgrundlagen" },
        {
          type: "ul",
          items: [
            "Schweiz: Art. 45c Fernmeldegesetz (FMG) – Information über die Bearbeitung von Daten auf fremden Geräten – sowie das Datenschutzgesetz (DSG).",
            "EU/EWR: Art. 5 Abs. 3 der Richtlinie 2002/58/EG (ePrivacy) – Einwilligung für nicht unbedingt erforderliche Speicherung – sowie die DSGVO (Art. 6 Abs. 1 lit. a, Art. 7).",
            "Die Speicherung Ihrer Einwilligungsentscheidung selbst ist technisch notwendig und bedarf keiner Einwilligung.",
          ],
        },
        { type: "h2", text: "Einwilligung ändern oder widerrufen" },
        {
          type: "p",
          text: "Über den Link «Cookie-Einstellungen» im Seitenfuss oder auf der Seite [Einstellungen](/einstellungen) können Sie Ihre Auswahl jederzeit ändern. Beim Widerruf werden sämtliche lokal gespeicherten Daten dieser Website gelöscht. Zusätzlich können Sie die Daten in den Einstellungen Ihres Browsers unter «Website-Daten» entfernen.",
        },
        { type: "h2", text: "Freigabe-Links" },
        {
          type: "p",
          text: "Freigabe-Links enthalten die Analyse komprimiert im URL-Fragment (nach dem #). Beim Öffnen wird die Analyse ausschliesslich im Browser entpackt; das Fragment wird nicht an den Server übertragen.",
        },
      ],
    },

    accessibility: {
      title: "Erklärung zur Barrierefreiheit",
      updated: site.legalVersion,
      intro: "Wir sind bestrebt, diese Website für alle Menschen zugänglich zu gestalten – unabhängig von Einschränkungen und genutzten Hilfsmitteln.",
      blocks: [
        { type: "h2", text: "Standard und Stand der Vereinbarkeit" },
        {
          type: "p",
          text: "Die Website orientiert sich an den Web Content Accessibility Guidelines (WCAG) 2.2, Konformitätsstufe AA, dem Schweizer Standard eCH-0059 sowie den Anforderungen des Behindertengleichstellungsgesetzes (BehiG) und – soweit anwendbar – des European Accessibility Act (Richtlinie (EU) 2019/882).",
        },
        {
          type: "ul",
          items: [
            "Vollständige Bedienbarkeit per Tastatur, sichtbarer Fokus, Sprunglink zum Inhalt.",
            "Semantische Struktur (Überschriften, Landmarks, Formularbeschriftungen, ARIA-Attribute).",
            "Kontraste nach WCAG AA in hellem und dunklem Design; keine Information ausschliesslich über Farbe.",
            "Diagramme mit Textalternativen und tabellarischer Darstellung der Werte.",
            "Berücksichtigung der Systemeinstellung «Bewegung reduzieren».",
            "Skalierbare Darstellung bis 400 % Zoom ohne Informationsverlust.",
          ],
        },
        { type: "h2", text: "Bekannte Einschränkungen" },
        {
          type: "ul",
          items: [
            "Interaktive Diagramme werden mit Tooltips ergänzt; deren Inhalte sind alternativ in den Ergebnistabellen verfügbar.",
            "Die Druck-/PDF-Ansicht ist für die visuelle Ausgabe optimiert; für Screenreader empfehlen wir den Markdown- oder CSV-Export.",
          ],
        },
        { type: "h2", text: "Feedback und Kontakt" },
        {
          type: "p",
          text: `Sie sind auf Barrieren gestossen? Bitte melden Sie uns diese an ${o.email}. Wir bemühen uns, Hindernisse zeitnah zu beseitigen.`,
        },
        { type: "h2", text: "Erstellung dieser Erklärung" },
        { type: "p", text: `Diese Erklärung wurde am ${site.legalVersion} auf Basis einer Selbstbewertung erstellt.` },
      ],
    },
  },
};
