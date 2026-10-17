import type { Metadata } from "next";
import { HowItWorksView } from "@/components/content/HowItWorksView";

export const metadata: Metadata = {
  title: "So funktioniert’s",
  description: "Was die Nutzwertanalyse ist, für wen sie sich eignet, wie der Ablauf in sechs Schritten aussieht und wo die Daten bleiben – mit Erklärvideo.",
  alternates: { canonical: "/so-funktionierts" },
};

export default function Page() {
  return <HowItWorksView />;
}
