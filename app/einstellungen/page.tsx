import type { Metadata } from "next";
import { SettingsView } from "@/components/content/SettingsView";

export const metadata: Metadata = { title: "Einstellungen", robots: { index: false } };

export default function Page() {
  return <SettingsView />;
}
