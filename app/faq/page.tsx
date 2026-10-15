import type { Metadata } from "next";
import { FaqView } from "@/components/content/FaqView";
import { de } from "@/lib/i18n/de";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Häufige Fragen (FAQ)",
  description: "Antworten zu Nutzwertanalyse, Datenschutz, Gewichtungsmethoden, Sensitivitätsanalyse, Export und Teilen.",
  alternates: { canonical: "/faq" },
};

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    url: `${site.url}/faq`,
    mainEntity: de.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <FaqView />
    </>
  );
}
