import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Datenschutzerklärung", robots: { index: true, follow: true } };

export default function Page() {
  return <LegalPage docKey="privacy" />;
}
