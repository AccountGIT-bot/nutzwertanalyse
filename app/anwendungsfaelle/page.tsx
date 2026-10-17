import type { Metadata } from "next";
import { UseCasesView } from "@/components/content/UseCasesView";

export const metadata: Metadata = {
  title: "Anwendungsfälle",
  description: "Nutzwertanalyse-Vorlagen für Lieferantenauswahl, Softwarevergleich, Investitionen, Maschinenkauf, Fahrzeuge, Personal, Immobilien, Produkte, Standorte und persönliche Entscheidungen.",
  alternates: { canonical: "/anwendungsfaelle" },
};

export default function Page() {
  return <UseCasesView />;
}
