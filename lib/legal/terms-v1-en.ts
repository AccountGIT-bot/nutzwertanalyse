import { site } from "@/lib/site";
import type { LegalDoc } from "./types";

const o = site.operator;

/** Fassung 1 der Nutzungsbedingungen (englische Übersetzung), unverändert archiviert. */
export const termsV1En: LegalDoc = {
      title: "Terms of use",
      updated: "2026-10-17",
      intro: "These terms of use govern the use of the free web application “Nutzwertanalyse” (hereinafter “application”).",
      blocks: [
        { type: "h2", text: "1. Scope and provider" },
        {
          type: "p",
          text: `The provider of the application is ${o.name}, ${o.street}, ${o.zipCity}, ${o.country} (hereinafter “provider”). By using the application you accept these terms of use. No registration is required; no continuing obligation arises.`,
        },
        { type: "h2", text: "2. Service" },
        {
          type: "p",
          text: "The application provides a tool for carrying out utility analyses (scoring model). It is made available free of charge and without warranty of specific properties (“as is”). There is no entitlement to availability, further development or support. The provider may change, restrict or discontinue the application at any time.",
        },
        { type: "h2", text: "3. No advice" },
        {
          type: "p",
          text: "The application calculates exclusively the values you have entered. Results, recommendations, sensitivity and robustness analyses are decision aids and do not constitute professional, legal, tax, financial or other advice. You alone are responsible for the inputs, their interpretation and the decisions based on them.",
        },
        { type: "h2", text: "4. Data storage and user responsibility" },
        {
          type: "p",
          text: "The application processes and stores content exclusively locally in the browser. The provider has no access to your analyses and does not create backups. You are responsible for backing up your data yourself (e.g. via JSON export). The provider is not liable for data loss – for example due to deleting browser data, changing devices or browser updates.",
        },
        {
          type: "p",
          text: "When entering data of third parties (in particular personal data) you undertake to comply with the applicable legal provisions and to pass on share links and export files only to authorised persons.",
        },
        { type: "h2", text: "5. Permitted use" },
        {
          type: "ul",
          items: [
            "The application may be used for private and business purposes.",
            "Actions that impair the availability or security of the application (e.g. automated mass requests, attacks on the infrastructure) are not permitted.",
            "Use to infringe the rights of third parties or for unlawful purposes is not permitted.",
          ],
        },
        { type: "h2", text: "6. Intellectual property" },
        {
          type: "p",
          text: "The application, its design, texts, templates and graphics are protected by copyright. The analyses and exports you create belong to you; the provider acquires no rights to them.",
        },
        { type: "h2", text: "7. Liability" },
        {
          type: "p",
          text: "Use is at your own responsibility. To the extent permitted by law, the provider excludes all liability for direct and indirect damage arising from the use or non-use of the application, from incorrect calculations, data loss or interruptions. Mandatory liability for unlawful intent and gross negligence (Art. 100 para. 1 Swiss Code of Obligations) and for personal injury remains reserved. Mandatory consumer protection provisions at the consumer's place of residence remain unaffected.",
        },
        { type: "h2", text: "8. Changes" },
        {
          type: "p",
          text: "The provider may amend these terms of use at any time. The version published on the website at the time of use applies.",
        },
        { type: "h2", text: "9. Applicable law and place of jurisdiction" },
        {
          type: "p",
          text: `Swiss law applies, excluding conflict-of-law rules and the UN Convention on Contracts for the International Sale of Goods. The exclusive place of jurisdiction is ${o.venue}, Switzerland. Mandatory statutory places of jurisdiction, in particular for consumers (e.g. under the Lugano Convention), remain reserved.`,
        },
        { type: "h2", text: "10. Severability" },
        {
          type: "p",
          text: "Should individual provisions of these terms of use be or become invalid, the validity of the remaining provisions remains unaffected. The invalid provision shall be replaced by a valid provision that comes closest to its economic purpose.",
        },
      ],
    };
