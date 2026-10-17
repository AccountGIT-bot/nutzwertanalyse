import type { Metadata } from "next";
import { ShareImport } from "@/components/nwa/ShareImport";

export const metadata: Metadata = { title: "Geteilte Analyse", robots: { index: false, follow: false } };

export default function Page() {
  return <ShareImport />;
}
