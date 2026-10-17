import { LandingView } from "@/components/content/LandingView";
import { appVersion, site } from "@/lib/site";

export default function Page() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Nutzwertanalyse",
    url: site.url,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    softwareVersion: appVersion,
    offers: { "@type": "Offer", price: "0", priceCurrency: "CHF" },
    description:
      "Kostenloses Online-Tool für die Nutzwertanalyse: Alternativen definieren, Kriterien gewichten, bewerten, Sensitivität prüfen und als PDF exportieren. Ohne Konto, ohne Tracking.",
    inLanguage: ["de", "en", "fr", "it"],
    featureList: ["Vier Gewichtungsmethoden inkl. AHP", "Sensitivitätsanalyse", "Monte-Carlo-Robustheitssimulation", "Mehrere Bewertende", "K.-o.-Kriterien", "Export als PDF, CSV, JSON, Markdown"],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <LandingView />
    </>
  );
}
