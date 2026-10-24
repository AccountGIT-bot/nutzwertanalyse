import { site } from "@/lib/site";
import type { LegalSet } from "./types";

const o = site.operator;
const h = site.hosting;

export const legalEn: LegalSet = {
  bindingNote: "The German version of these legal texts is authoritative; this translation is provided for convenience.",
  placeholderWarning:
    "Note for the operator: the configuration (lib/site.ts) still contains placeholders. The operator details must be completed before going live.",
  docs: {
    imprint: {
      title: "Legal notice",
      updated: site.legalVersion,
      intro: "Information pursuant to Art. 3 para. 1 lit. s of the Swiss Unfair Competition Act (UCA) and the information duties under the FADP and the GDPR.",
      blocks: [
        { type: "h2", text: "Operator of this website" },
        {
          type: "table",
          head: ["", ""],
          rows: [
            ["Name / company", o.name],
            ["Legal form", o.legalForm],
            ["Address", `${o.street}, ${o.zipCity}, ${o.country}`],
            ["E-mail", o.email],
            ["Phone", o.phone],
            ["UID", o.uid],
            ["Authorised representative", o.representative],
          ],
        },
        { type: "h2", text: "Hosting" },
        {
          type: "p",
          text: `This website is hosted by ${h.provider}, ${h.address}. When the website is accessed, the hosting provider processes technically necessary access data (server logs). Details can be found in the [privacy policy](/datenschutz).`,
        },
        { type: "h2", text: "Disclaimer" },
        {
          type: "p",
          text: "The content of this website has been created with the greatest possible care. However, the operator assumes no liability for the accuracy, completeness or timeliness of the content and calculations provided. Utility analysis is a decision aid; it structures subjective judgements and does not replace professional, legal, tax or financial advice. Decisions made on the basis of this website are the sole responsibility of the users.",
        },
        {
          type: "p",
          text: "Liability claims against the operator for material or immaterial damage arising from access to, use or non-use of the website, from misuse of the connection or from technical faults are excluded to the extent permitted by law. Liability for unlawful intent and gross negligence remains reserved (Art. 100 Swiss Code of Obligations).",
        },
        { type: "h2", text: "Liability for links" },
        {
          type: "p",
          text: "References and links to third-party websites are outside the operator's area of responsibility. Any responsibility for such websites is declined. Access to and use of such websites is at the user's own risk.",
        },
        { type: "h2", text: "Copyright" },
        {
          type: "p",
          text: "The copyright and all other rights to content, images, photos or other files on this website belong exclusively to the operator or the specifically named rights holders. The written consent of the copyright holder must be obtained in advance for the reproduction of any elements. Analyses and exports created by users remain their property.",
        },
        { type: "h2", text: "Legal texts" },
        { type: "p", text: "[Privacy policy](/datenschutz) · [Terms of use](/agb) · [Cookies & local storage](/cookies) · [Accessibility](/barrierefreiheit)" },
      ],
    },

    privacy: {
      title: "Privacy policy",
      updated: site.legalVersion,
      intro:
        "This privacy policy informs you about the processing of personal data when visiting and using this website. It is based on the Swiss Federal Act on Data Protection (FADP) and – where applicable – the EU General Data Protection Regulation (GDPR).",
      blocks: [
        { type: "h2", text: "1. The essentials" },
        {
          type: "ul",
          items: [
            "This website has no user account, no login and no server that stores or processes your analyses. All calculations, saves and exports take place exclusively in your browser on your device.",
            "We use no cookies, no analytics, tracking or marketing tools and no third-party scripts.",
            "The content of your analyses (title, alternatives, criteria, ratings, notes) is never transmitted to us or to third parties. We have no access to it.",
            "Only our hosting provider processes technically necessary access data (server logs) when the website is loaded, see section 4.",
            "With your consent, analyses and settings are kept in your browser's local storage (localStorage) so that they are still available on your next visit. You can delete this data yourself at any time, see section 5.",
          ],
        },
        { type: "h2", text: "2. Controller" },
        {
          type: "p",
          text: `The controller for data processing in connection with this website is: ${o.name}, ${o.street}, ${o.zipCity}, ${o.country}, e-mail: ${o.email}.`,
        },
        ...(o.dpo ? [{ type: "p" as const, text: `Data protection officer / adviser: ${o.dpo}.` }] : []),
        ...(o.euRepresentative
          ? [{ type: "p" as const, text: `Representative in the EU pursuant to Art. 27 GDPR: ${o.euRepresentative}.` }]
          : [
              {
                type: "p" as const,
                text: "The website is primarily aimed at users in Switzerland. Insofar as the GDPR applies to persons in the EU/EEA, the following information on legal bases and data subject rights applies accordingly.",
              },
            ]),
        { type: "h2", text: "3. Principles" },
        {
          type: "p",
          text: "We process personal data only insofar as this is technically necessary for the operation of the website (hosting) or you yourself initiate it by an action (e.g. contacting us by e-mail). We follow the principles of privacy by design and privacy by default (Art. 7 FADP, Art. 25 GDPR): the application was deliberately built so that no content data leaves the browser.",
        },
        { type: "h2", text: "4. Hosting and server logs" },
        {
          type: "p",
          text: `This website is operated at ${h.provider}, ${h.address} (hereinafter “host”). When you access the website, your browser automatically transmits technical data to the host's server: IP address, date and time of access, requested URL, referrer URL, browser and operating system (user agent), amount of data transferred and HTTP status code.`,
        },
        {
          type: "p",
          text: `Purpose: delivery of the website, ensuring stability and security (e.g. defence against attacks), error analysis. Legal basis: overriding legitimate interest in the secure and reliable operation of the website (Art. 31 para. 1 FADP; Art. 6 para. 1 lit. f GDPR). Retention: server logs are retained by the host only as long as necessary for the stated purposes (according to the host ${h.logRetention}). We ourselves do not evaluate server logs with personal references and do not compile usage statistics.`,
        },
        {
          type: "p",
          text: `The host is based in the USA. Static pages are delivered via a global content delivery network; server-side functions (only the generation of the social-media preview image) run in the Frankfurt (EU) region. A transfer of technical access data to the USA can nevertheless not be ruled out, for example for logs and network operation. It takes place on the basis of the Swiss-U.S. Data Privacy Framework or the EU-U.S. Data Privacy Framework, insofar as the host is certified, and additionally on the basis of the EU Commission's standard contractual clauses (Art. 16 para. 2 lit. d FADP; Art. 46 para. 2 lit. c GDPR). Host's privacy notice: [${h.privacyUrl}](${h.privacyUrl}).`,
        },
        { type: "h2", text: "5. Local storage in the browser (localStorage)" },
        {
          type: "p",
          text: "This website does not use cookies. To keep your analyses and settings beyond closing the browser, the application may store data in your browser's localStorage. This data remains exclusively on your device and is transmitted neither to us nor to third parties. We have no technical access to it.",
        },
        {
          type: "table",
          head: ["Category", "Content", "Purpose", "Legal basis", "Duration"],
          rows: [
            ["Essential", "Your decision in the consent dialog (version, time, selection)", "Proof and observance of your choice", "Technically necessary (Art. 45c lit. b Swiss Telecommunications Act; Art. 5(3) ePrivacy Directive)", "until deleted by you"],
            ["Functional", "Your analyses (title, alternatives, criteria, weights, ratings, notes), language, theme", "Continuing your work on the next visit", "Your consent (Art. 6 para. 6 FADP; Art. 6 para. 1 lit. a GDPR), revocable at any time", "until deleted by you"],
            ["Statistics / marketing", "—", "not used", "—", "—"],
          ],
        },
        {
          type: "p",
          text: "Without consent to the “Functional” category, the application works exclusively in memory; analyses are then lost when the tab is closed (export as a file remains possible). You can change or withdraw your consent at any time via the “Cookie settings” link in the footer or on the [Settings](/einstellungen) page; all locally stored data is then deleted. Independently of this, you can also remove the data via your browser settings (clear site data).",
        },
        { type: "h2", text: "6. Content of your analyses" },
        {
          type: "p",
          text: "You decide which content you enter into an analysis. If your analyses contain personal data of third parties (e.g. names of applicants in a hiring decision), you as the user are responsible for the lawful processing of this data. We do not process this content and have no access to it. Note in particular that share links and export files contain the complete analysis.",
        },
        { type: "h2", text: "7. Share links" },
        {
          type: "p",
          text: "The “share link” function packs the entire analysis, compressed, into the part of the address after the # sign (URL fragment). Browsers do not transmit the fragment to servers; the link is stored neither by us nor by the host. Anyone who has the link can open the analysis. Therefore share links only with persons who are allowed to see the content, preferably via encrypted channels.",
        },
        { type: "h2", text: "8. Contact" },
        {
          type: "p",
          text: "If you contact us by e-mail, we process your details (e-mail address, content of the message, any further details) to answer your enquiry. Legal basis: performance of pre-contractual obligations or legitimate interest in answering (Art. 31 FADP; Art. 6 para. 1 lit. b and f GDPR). The data is deleted as soon as it is no longer required for the reply and no statutory retention obligations exist.",
        },
        { type: "h2", text: "9. No disclosure, no profiling" },
        {
          type: "p",
          text: "We do not pass personal data on to third parties, do not sell data and do not create profiles. There is no automated individual decision-making within the meaning of Art. 21 FADP or Art. 22 GDPR. The utility analysis merely calculates the values you entered yourself; the result is a decision aid that you use freely.",
        },
        { type: "h2", text: "10. Data security" },
        {
          type: "p",
          text: "The website is delivered exclusively via an encrypted connection (HTTPS/TLS). We use restrictive security headers (including Content-Security-Policy, Strict-Transport-Security, Referrer-Policy) and do not embed third-party resources. As no content data is transmitted to servers, there is no server-side risk of losing your analyses. You are responsible for the security of your device and browser.",
        },
        { type: "h2", text: "11. Your rights" },
        {
          type: "p",
          text: "Under applicable data protection law you have the right to information (Art. 25 FADP; Art. 15 GDPR), rectification (Art. 32 FADP; Art. 16 GDPR), erasure (Art. 32 FADP; Art. 17 GDPR), restriction of processing (Art. 18 GDPR), data portability (Art. 28 FADP; Art. 20 GDPR) and to object to processing (Art. 30 FADP; Art. 21 GDPR). You may withdraw any consent given at any time with effect for the future.",
        },
        {
          type: "p",
          text: `Since we do not store content data, you can export (right to data portability, as JSON/CSV/Markdown) and delete your analyses yourself at any time. For requests concerning server logs or e-mail correspondence, contact ${o.email}. You also have the right to lodge a complaint with a supervisory authority: in Switzerland with the Federal Data Protection and Information Commissioner (FDPIC), Feldeggweg 1, 3003 Bern, [www.edoeb.admin.ch](https://www.edoeb.admin.ch); in the EU/EEA with the supervisory authority of your place of residence.`,
        },
        { type: "h2", text: "12. Privacy signals (GPC / Do Not Track)" },
        {
          type: "p",
          text: "If your browser sends a Global Privacy Control or Do Not Track signal, we respect it. Since we do not use any tracking or advertising technologies anyway, this does not change the data processing.",
        },
        { type: "h2", text: "13. Changes" },
        {
          type: "p",
          text: "We may amend this privacy policy at any time, in particular in the event of changes to the functions or the legal situation. The version published on this website at the time applies. In the event of significant changes to local storage, we will ask for your consent again.",
        },
      ],
    },

    cookies: {
      title: "Cookies and local storage",
      updated: site.legalVersion,
      intro: "Transparency about what this website stores on your device – and what it does not.",
      blocks: [
        { type: "h2", text: "No cookies" },
        {
          type: "p",
          text: "This website sets no cookies – neither its own nor third-party ones. There are no analytics, tracking, advertising or social media integrations. No fonts, scripts or images are loaded from external servers.",
        },
        { type: "h2", text: "What is stored in the browser (localStorage)" },
        {
          type: "p",
          text: "localStorage is a storage area of your browser that can only be read by this website and is not automatically transmitted to servers. The following entries may be created:",
        },
        {
          type: "table",
          head: ["Key", "Content", "Category", "Duration"],
          rows: [
            ["nwa.consent", "Your consent decision (version, time, selection)", "Essential", "until deleted"],
            ["nwa.library.index", "List of IDs of your saved analyses", "Functional", "until deleted"],
            ["nwa.analysis.<id>", "One saved analysis each (complete content)", "Functional", "until deleted"],
            ["nwa.locale", "Selected language", "Functional", "until deleted"],
            ["nwa.theme", "Selected theme (light/dark)", "Functional", "until deleted"],
            ["nwa.themeHint", "Marker that the dark-mode hint has been shown", "Functional", "until deleted"],
          ],
        },
        {
          type: "p",
          text: "The “Functional” category is used only after your explicit consent. Without consent, analyses are kept in memory only until the tab is closed.",
        },
        { type: "h2", text: "Legal bases" },
        {
          type: "ul",
          items: [
            "Switzerland: Art. 45c Telecommunications Act (TCA) – information on the processing of data on third-party devices – and the Data Protection Act (FADP).",
            "EU/EEA: Art. 5(3) of Directive 2002/58/EC (ePrivacy) – consent for storage that is not strictly necessary – and the GDPR (Art. 6(1)(a), Art. 7).",
            "Storing your consent decision itself is technically necessary and does not require consent.",
          ],
        },
        { type: "h2", text: "Change or withdraw consent" },
        {
          type: "p",
          text: "Via the “Cookie settings” link in the footer or on the [Settings](/einstellungen) page you can change your selection at any time. On withdrawal, all locally stored data of this website is deleted. You can additionally remove the data in your browser settings under “site data”.",
        },
        { type: "h2", text: "Share links" },
        {
          type: "p",
          text: "Share links contain the analysis compressed in the URL fragment (after the #). When opened, the analysis is unpacked exclusively in the browser; the fragment is not transmitted to the server.",
        },
      ],
    },

    accessibility: {
      title: "Accessibility statement",
      updated: site.legalVersion,
      intro: "We strive to make this website accessible to everyone – regardless of impairments and assistive technologies used.",
      blocks: [
        { type: "h2", text: "Standard and compliance status" },
        {
          type: "p",
          text: "The website follows the Web Content Accessibility Guidelines (WCAG) 2.2, conformance level AA, the Swiss standard eCH-0059 and the requirements of the Swiss Disability Discrimination Act (DDA) and – where applicable – the European Accessibility Act (Directive (EU) 2019/882).",
        },
        {
          type: "ul",
          items: [
            "Full keyboard operability, visible focus, skip link to content.",
            "Semantic structure (headings, landmarks, form labels, ARIA attributes).",
            "WCAG AA contrasts in light and dark themes; no information conveyed by colour alone.",
            "Charts with text alternatives and tabular presentation of the values.",
            "Respect for the system setting “reduce motion”.",
            "Scalable presentation up to 400 % zoom without loss of information.",
          ],
        },
        { type: "h2", text: "Known limitations" },
        {
          type: "ul",
          items: [
            "Interactive charts are supplemented with tooltips; their content is alternatively available in the result tables.",
            "The print/PDF view is optimised for visual output; for screen readers we recommend the Markdown or CSV export.",
          ],
        },
        { type: "h2", text: "Feedback and contact" },
        { type: "p", text: `Have you encountered barriers? Please report them to ${o.email}. We endeavour to remove obstacles promptly.` },
        { type: "h2", text: "Preparation of this statement" },
        { type: "p", text: `This statement was prepared on ${site.legalVersion} on the basis of a self-assessment.` },
      ],
    },
  },
};
