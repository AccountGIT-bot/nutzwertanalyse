import { redirect } from "next/navigation";

/**
 * Redirect /new to /app - the main app flow handles new analysis creation
 */
export default function NewAnalysis() {
  redirect("/app");
}
