import { site } from "@/lib/site";
import type { TermsDoc } from "./terms";
import { termsV1En } from "./terms-v1-en";

const o = site.operator;

/** English translation of the terms of use. The German version is legally binding. */
export const termsEn: TermsDoc = {
  title: "Terms of use",
  lead: "Plain language instead of small print: every clause has a short version, every restriction is marked, and every rule names the law it rests on.",
  version: 2,
  date: "2026-10-17",

  summary: [
    { tag: "promise", text: "Free and without an account. Nothing becomes chargeable without your explicit, separate order.", refs: [1, 8] },
    { tag: "promise", text: "Your analyses never leave your device. We can neither see nor store them.", refs: [2, 4] },
    { tag: "duty", text: "Back up important analyses yourself by exporting them. We cannot restore lost local data.", refs: [4] },
    { tag: "limit", text: "The application calculates, you decide. Results are not advice.", refs: [3] },
    { tag: "limit", text: "We are not liable for slight negligence because the application is free. Intent, gross negligence and personal injury are never excluded.", refs: [10] },
    { tag: "right", text: "Use it privately, at work and for clients. Your analyses and reports belong to you.", refs: [6, 7] },
    { tag: "promise", text: "No ads, no tracking, no selling of data. We announce disadvantageous changes and a shutdown 30 days in advance.", refs: [8, 9, 12] },
    { tag: "right", text: "Swiss law applies. As a consumer you keep the protection of your country of residence and can sue there.", refs: [13] },
  ],

  clauses: [
    {
      n: 1,
      title: "What this is about and who we are",
      tags: ["info"],
      short: "These terms apply as soon as you use the application. It is free, needs no account, and you take on no obligation you would have to cancel.",
      items: [
        {
          n: "1.1",
          text: `These terms of use govern the use of the web application “Nutzwertanalyse” at ${site.domain} and the associated domains (hereinafter “application”). The provider is ${o.name}, ${o.street}, ${o.zipCity}, ${o.country}, e-mail ${o.email} (hereinafter “we”). Full details are in the [legal notice](/impressum).`,
        },
        {
          n: "1.2",
          text: "The application is free of charge. You do not have to register or provide any personal data. Using it creates a free-of-charge usage relationship under these terms. It ends as soon as you stop using the application; no cancellation is needed.",
        },
        { n: "1.3", text: "Minors with capacity of judgement may use the application without the consent of their legal representatives, because they take on no obligation to give anything in return." },
        { n: "1.4", text: "These terms apply to consumers and businesses alike. Where a rule applies to only one of these groups, it says so expressly." },
      ],
      basis: "Art. 1 and 6 Swiss Code of Obligations (conclusion of contract), Art. 19 para. 2 Swiss Civil Code (free benefits for minors), Art. 3 para. 1 lit. s Unfair Competition Act (provider details)",
    },
    {
      n: 2,
      title: "What the application does",
      tags: ["info"],
      short: "A calculation tool for utility analyses that runs entirely in your browser. No AI model and no database on a server.",
      items: [
        {
          n: "2.1",
          text: "The application lets you structure decisions using the utility analysis method: record alternatives and criteria, weight them, rate them and test the result with sensitivity and robustness analyses. The calculations are disclosed on the [method](/methode) page.",
        },
        {
          n: "2.2",
          text: "All calculations run in your browser. The content of your analyses is transmitted neither to us nor to third parties. The website itself is delivered via our hosting provider; the technical data involved is described in the [privacy policy](/datenschutz).",
        },
        {
          n: "2.3",
          text: "Smart Start, which suggests a template, title and alternatives from a description in your own words, works rule-based with keyword lists on your device. No AI model is used in the application.",
        },
        {
          n: "2.4",
          text: "The robustness analysis is based on random sampling (Monte Carlo simulation). Its values can therefore vary slightly between two runs; this is intended by the method.",
        },
        {
          n: "2.5",
          text: "A share link contains the entire analysis in compressed form in the part of the address after the # sign. Browsers do not send this part to servers, and we do not store share links.",
        },
        {
          n: "2.6",
          text: "The website contains a few links to third-party websites, for example to the hosting provider's privacy notice or to supervisory authorities. Their operators are responsible for that content; we check it when we set the link, not continuously.",
        },
      ],
      basis: "Description of service; for data processing see privacy policy sections 4 to 7",
    },
    {
      n: 3,
      title: "The application calculates, you decide",
      tags: ["limit"],
      short: "The result is only as good as your input. It is not advice, and the responsibility for the decision stays with you.",
      items: [
        {
          n: "3.1",
          text: "The application calculates only the values you enter. You set the criteria, weights and ratings. Templates and example criteria are suggestions; they are neither complete nor necessarily suitable for your case.",
        },
        {
          n: "3.2",
          text: "Results, rankings, tipping points and simulations are decision aids. They are not legal, tax, financial, medical, employment law or other professional advice and do not replace it.",
        },
        {
          n: "3.3",
          text: "The application does not decide about people or things and makes no automated individual decision within the meaning of data protection law. Whether and how you use a result is your decision.",
        },
        { n: "3.4", text: "For decisions with major consequences, such as investments, hiring or buying property, we recommend discussing the result with a professional." },
      ],
      basis: "Art. 21 Swiss Data Protection Act (FADP) and Art. 22 GDPR (no automated individual decision)",
    },
    {
      n: 4,
      title: "Your data stays with you, and so does the backup",
      tags: ["duty"],
      short: "We have no access to your analyses. That is why we can neither back them up nor restore them. Export anything important as a file.",
      items: [
        {
          n: "4.1",
          text: "Analyses are stored only on your device: in the browser's memory or, if you consent to the “Functional” category, in your browser's local storage. Details are on the [cookies & local storage](/cookies) page.",
        },
        { n: "4.2", text: "We have no technical access to this data. We can neither view, back up, restore nor delete it." },
        {
          n: "4.3",
          text: "Locally stored data can be lost, for example if you clear browser data, switch devices, use private mode or the browser frees up storage. You are therefore responsible for backups yourself. The application offers exports as JSON (complete and re-importable), CSV and Markdown as well as a printable report.",
        },
        { n: "4.4", text: "The exports use open standard formats. You can keep using your data at any time without us." },
      ],
      basis: "Art. 7 FADP and Art. 25 GDPR (data protection by design), Art. 28 FADP and Art. 20 GDPR (data portability, fulfilled here by the export)",
    },
    {
      n: 5,
      title: "Other people's data and fair criteria",
      tags: ["duty"],
      short: "If you rate people, for example applicants, you are responsible for handling their data lawfully and use only objective, non-discriminatory criteria.",
      items: [
        {
          n: "5.1",
          text: "If you enter personal data of third parties, for example names of applicants or details about suppliers, you are the controller for this processing under data protection law. We do not process this data.",
        },
        {
          n: "5.2",
          text: "For hiring decisions you use only criteria that are objectively related to the position. You do not use criteria that discriminate under applicable law, such as sex, origin, religion, disability, age or sexual orientation, unless the law expressly permits it in the individual case.",
        },
        {
          n: "5.3",
          text: "Share links and export files contain the complete analysis. Share them only with people who may see the content. Anyone who has a link can open the analysis; a shared link cannot technically be withdrawn.",
        },
      ],
      basis: "Art. 5 lit. j FADP and Art. 4 no. 7 GDPR (controller), Art. 328 and 328b Swiss Code of Obligations (protection of personality and data in employment), Art. 3 Gender Equality Act (no discrimination on grounds of sex at work), Directives 2000/43/EC and 2000/78/EC (equal treatment in the EU)",
    },
    {
      n: 6,
      title: "What you may and may not do",
      tags: ["right", "duty"],
      short: "Use the application privately, at work and for clients. Only what harms the application or others is prohibited.",
      items: [
        {
          n: "6.1",
          text: "You may use the application for private and business purposes, including for clients and in consulting mandates. You may pass on, publish and use reports and exports commercially without attribution.",
        },
        {
          n: "6.2",
          text: "It is not permitted:",
          list: [
            "to attack or overload the application or its infrastructure or to circumvent security measures;",
            "to make automated mass requests beyond normal use;",
            "to use the application for unlawful purposes or to infringe the rights of third parties;",
            "to give the impression that we have checked, confirmed or recommended a result.",
          ],
        },
        { n: "6.3", text: "In case of violations we may restrict access technically to the extent necessary to protect the application or other users." },
      ],
      basis: "Art. 143bis and 144bis Swiss Criminal Code (unauthorised access, damage to data), Art. 3 para. 1 lit. b Unfair Competition Act (misleading statements)",
    },
    {
      n: 7,
      title: "Who owns what",
      tags: ["right"],
      short: "Your analyses belong to you, and you may use the templates freely. Code, texts, graphics and video of the website remain protected.",
      items: [
        { n: "7.1", text: "Content you enter and the reports created from it belong to you. We acquire no rights to them." },
        { n: "7.2", text: "You may freely use, adapt and pass on the included templates and criteria catalogues in your analyses and reports." },
        {
          n: "7.3",
          text: "The design, texts, illustrations, explainer video and program code of the application are protected by copyright. Beyond use under these terms and legally permitted private use, you may not copy, distribute or use them for your own offerings.",
        },
        {
          n: "7.4",
          text: "The application contains open-source components, including Next.js, React and clsx (MIT licence) and Lucide (ISC licence). Their licences apply to these components and take precedence over these terms.",
        },
      ],
      basis: "Art. 2 and 10 Swiss Copyright Act (works and rights of use), Art. 19 Swiss Copyright Act (private use)",
    },
    {
      n: 8,
      title: "Our commitments",
      tags: ["promise"],
      short: "Six things you can rely on. They are part of the contract, not marketing statements.",
      items: [
        {
          n: "8.1",
          text: "As long as this version applies, we bindingly commit to:",
          list: [
            "No account: you can use the application without registering.",
            "Free: nothing becomes chargeable without your explicit, separate order.",
            "No ads and no tracking: no advertising, no analytics or tracking tools, no cookies.",
            "No selling of data: we do not sell, rent or trade any data.",
            "No content on servers: the content of your analyses is not transmitted to us.",
            "Advance notice: we announce changes to these terms to your disadvantage and a shutdown of the application at least 30 days in advance on this page (sections 9.4 and 12.2).",
          ],
        },
        { n: "8.2", text: "If we break a commitment, you have the statutory rights for breach of contract." },
      ],
      basis: "Art. 97 et seq. Swiss Code of Obligations (consequences of breach of contract)",
    },
    {
      n: 9,
      title: "Availability, warranty and shutdown",
      tags: ["limit"],
      short: "We guarantee neither constant availability nor freedom from errors and may change features for objective reasons. If the application is shut down, you will know 30 days in advance.",
      items: [
        {
          n: "9.1",
          text: "We strive for reliable operation but do not guarantee any particular availability. Interruptions for maintenance, security updates or due to faults at the hosting provider are possible.",
        },
        {
          n: "9.2",
          text: `We provide the application in its current version. Because it is free of charge, we warrant neither freedom from errors nor fitness for a particular purpose. We fix known errors as part of further development; reports are welcome at ${o.email}. Liability is governed by section 10.`,
        },
        {
          n: "9.3",
          text: "We may develop the application further and change or remove features if there is an objective reason, such as technical development, security or a change in the law, and if the change is reasonable for you. We take care that older JSON exports remain importable.",
        },
        {
          n: "9.4",
          text: "We may shut the application down. We announce this at least 30 days in advance on the website so that you can export your analyses. If an immediate shutdown is necessary for legal or compelling security reasons, we inform you as early as possible.",
        },
        { n: "9.5", text: `Support is voluntary. We usually answer enquiries to ${o.email} within ten working days.` },
      ],
      basis: "Art. 99 para. 2 Swiss Code of Obligations (milder standard of liability for gratuitous transactions), Art. 8 Unfair Competition Act (no abusive disadvantage), Annex no. 1 lit. k Directive 93/13/EEC (no change of service without valid reason)",
    },
    {
      n: 10,
      title: "Liability",
      tags: ["limit"],
      short: "We are always fully liable for intent, gross negligence and personal injury. We are not liable for slight negligence because we offer the application free of charge. Mandatory law takes precedence.",
      items: [
        {
          n: "10.1",
          text: "We are liable without limitation for damage we cause intentionally or through gross negligence, for damage resulting from injury to life, body or health and under the mandatory provisions of product liability law.",
        },
        {
          n: "10.2",
          text: "Otherwise our liability for slight negligence is excluded to the extent permitted by law. The reason: we offer the application free of charge. The exclusion covers in particular the consequences of decisions you make based on results, and lost profits.",
        },
        { n: "10.3", text: "Sections 10.1 and 10.2 apply to data loss. If you have not made a backup (section 4.3), this is taken into account when assessing compensation." },
        { n: "10.4", text: "These rules also apply to our auxiliary persons. Mandatory consumer protection provisions remain unaffected, including those of the country in which you live." },
      ],
      basis: "Art. 99 para. 2 Swiss Code of Obligations (milder liability for gratuitous transactions), Art. 100 para. 1 (no exclusion for intent and gross negligence), Art. 101 (auxiliary persons), Art. 44 (contributory fault), Swiss Product Liability Act, Annex no. 1 lit. a and b Directive 93/13/EEC",
    },
    {
      n: 11,
      title: "What on this website is not real",
      tags: ["info"],
      short: "Two photos on the home page are AI-generated, and the voices there are invented examples. We do not have any real reviews yet.",
      items: [
        { n: "11.1", text: "The photos in the “Trust” and “Voices” sections of the home page were created with an AI image generator. The people shown are not real." },
        {
          n: "11.2",
          text: "The cards in the “Voices” section are labelled “example voice”. They are invented examples of typical use cases, not reviews by real users. We will label real feedback as such and publish it only with the authors' consent.",
        },
        { n: "11.3", text: "Illustrations and the explainer video are our own graphics. Figures on the website describe features of the application, such as the number of templates. We do not collect usage statistics." },
      ],
      basis: "Art. 3 para. 1 lit. b Unfair Competition Act (no misleading statements), Annex I no. 23b and 23c Directive 2005/29/EC (ban on fake reviews)",
    },
    {
      n: 12,
      title: "Changes to these terms",
      tags: ["promise", "limit"],
      short: "The version published at the time of your use applies. Anything that puts you in a worse position is announced 30 days in advance, and earlier versions remain available.",
      items: [
        { n: "12.1", text: "Because you have no account, each use is governed by the version published on this page at that time." },
        {
          n: "12.2",
          text: "We publish changes that put you in a worse position on this page at least 30 days before they take effect, together with an explanation of what changes. Such changes may take effect earlier only if new legal requirements or decisions by authorities or courts require it.",
        },
        { n: "12.3", text: "Changes in your favour and purely editorial changes may apply immediately." },
        { n: "12.4", text: "Each version has a number and a date. Earlier versions remain available in full further down this page." },
        { n: "12.5", text: "If you do not agree with a new version, you stop using the application. You may still export existing analyses; the previous version applies to that." },
      ],
      basis: "Art. 1 Swiss Code of Obligations (consent through use), Art. 8 Unfair Competition Act (no abusive disadvantage), Annex no. 1 lit. j Directive 93/13/EEC (no unilateral change without valid reason)",
    },
    {
      n: 13,
      title: "Applicable law, jurisdiction and dispute resolution",
      tags: ["right"],
      short: "Swiss law applies. As a consumer you keep the mandatory protection of your country of residence and can sue at your place of residence.",
      items: [
        {
          n: "13.1",
          text: "Swiss law applies. If you are a consumer with your habitual residence in another country, you keep the mandatory consumer protection provisions of that country.",
        },
        { n: "13.2", text: "If you are a consumer, you can sue either at your place of residence or at our registered office. We can only sue you at your place of residence." },
        { n: "13.3", text: `For businesses, the exclusive place of jurisdiction is ${o.venue}, Switzerland.` },
        {
          n: "13.4",
          text: "We do not take part in proceedings before consumer arbitration boards. If there is a problem, write to us directly; we will look for a solution with you. The former EU online dispute resolution platform was abolished as of 20 July 2025.",
        },
      ],
      basis: "Art. 32 and 35 Swiss Civil Procedure Code (consumer jurisdiction, no advance waiver), Art. 120 Swiss Private International Law Act, Art. 15 to 17 Lugano Convention, Art. 6 Rome I Regulation (EC) No 593/2008, Regulation (EU) 2024/3228 (repeal of the online dispute resolution platform)",
    },
    {
      n: 14,
      title: "Final provisions",
      tags: ["info"],
      short: "German is binding. Unclear wording is interpreted in your favour, and the law replaces an invalid clause.",
      items: [
        { n: "14.1", text: "The German version is binding. Translations are for understanding. If wording is unclear, the interpretation more favourable to you applies." },
        {
          n: "14.2",
          text: "The short versions (“In short”) and the overview at the top of this page explain the clauses; the clause text is binding. If a short version and the clause text differ, whichever is more favourable to you applies.",
        },
        { n: "14.3", text: "If a provision is wholly or partly invalid, the remaining provisions remain valid. The statutory rule takes the place of the invalid provision." },
        { n: "14.4", text: `Contact for all matters relating to these terms: ${o.email}.` },
      ],
      basis: "Contra proferentem rule (interpretation against the drafting party), Art. 5 Directive 93/13/EEC (consumer-friendly interpretation), Art. 20 para. 2 Swiss Code of Obligations (partial invalidity)",
    },
  ],

  history: [
    {
      version: 2,
      date: "2026-10-17",
      note: "Completely rewritten. No change puts you in a worse position than version 1.",
      changes: [
        "New structure: overview, short version for every clause, marked restrictions and legal bases.",
        "New: binding commitments (section 8) and 30 days' notice of disadvantageous changes and before a shutdown (sections 9.4, 12.2).",
        "New: warranty expressly regulated (section 9.2) and note on third-party links (section 2.6).",
        "New: disclosure of AI images and example voices on the home page (section 11).",
        "Clarified: third-party personal data and fair criteria in hiring decisions (section 5), jurisdiction for consumers (section 13).",
        "Liability: personal injury and product liability now expressly reserved (section 10.1).",
        "Invalid clauses: the law applies instead of an “economically closest” replacement rule (section 14.3).",
        "New duties in sections 5.2 and 6.2 and the right to restrict access in case of misuse (section 6.3) essentially restate existing law.",
      ],
    },
    {
      version: 1,
      date: "2026-10-17",
      note: "First version, published with release 2.0.0.",
      changes: ["First version of the terms of use."],
    },
  ],

  archive: [{ version: 1, date: "2026-10-17", intro: termsV1En.intro ?? "", blocks: termsV1En.blocks }],
};
