import type { Metadata } from "next";
import { TermsPage } from "@/components/legal/TermsPage";

export const metadata: Metadata = {
  title: "Nutzungsbedingungen",
  description: "Nutzungsbedingungen in Klartext: Kurzfassung je Klausel, markierte Einschränkungen, Rechtsgrundlagen und alle Fassungen. Schweizer Recht, EU-Verbraucherschutz vorbehalten.",
  robots: { index: true, follow: true },
};

export default function Page() {
  return <TermsPage />;
}
