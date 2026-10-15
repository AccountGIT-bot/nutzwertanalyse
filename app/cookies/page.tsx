import type { Metadata } from "next";
import { LegalPage } from "@/components/legal/LegalPage";

export const metadata: Metadata = { title: "Cookies und lokale Speicherung", robots: { index: true, follow: true } };

export default function Page() {
  return <LegalPage docKey="cookies" />;
}
