import type { Metadata } from "next";
import { AboutView } from "@/components/content/AboutView";

export const metadata: Metadata = {
  title: "Über uns – Vision und Mission",
  description: "Vision, Mission und Werte hinter Nutzwertanalyse: nachvollziehbare Entscheidungen, Datensparsamkeit, Klarheit und Zugänglichkeit.",
  alternates: { canonical: "/ueber-uns" },
};

export default function Page() {
  return <AboutView />;
}
