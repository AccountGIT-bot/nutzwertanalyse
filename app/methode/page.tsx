import type { Metadata } from "next";
import { MethodView } from "@/components/content/MethodView";

export const metadata: Metadata = {
  title: "Die Methode: Nutzwertanalyse erklärt",
  description:
    "Nutzwertanalyse verständlich erklärt: Formel, Gewichtungsmethoden (Punkte, Prozent, Rangfolge/ROC, AHP-Paarvergleich), K.-o.-Kriterien, Sensitivitäts- und Robustheitsanalyse, Grenzen der Methode.",
  alternates: { canonical: "/methode" },
};

export default function Page() {
  return <MethodView />;
}
