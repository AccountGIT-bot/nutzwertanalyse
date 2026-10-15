import type { Metadata } from "next";
import { Dashboard } from "@/components/nwa/Dashboard";

export const metadata: Metadata = { title: "Meine Analysen", robots: { index: false, follow: true }, alternates: { canonical: "/app" } };

export default function Page() {
  return <Dashboard />;
}
