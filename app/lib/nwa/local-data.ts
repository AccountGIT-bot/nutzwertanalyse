import { parseAnalysis, interpretationSchema } from "./validation";
import type {
  AIDecisionInterpretation,
  AnalysisState,
  PackageLevel,
} from "./types";

export const DRAFT_KEY = "nwa_draft_state";
export const START_KEY = "decisionstudio_start";
export function readDraft(): AnalysisState | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw && raw.length < 2_000_000
      ? parseAnalysis(JSON.parse(raw))
      : null;
  } catch {
    return null;
  }
}
export function clearLocalData() {
  for (const key of [
    DRAFT_KEY,
    "nwa_theme",
    "nwa_packageLevel",
    "nwa_decisionDraft",
    "nwa_preset",
    "nwa_aiInterpretation",
    "nwa_locale",
  ])
    localStorage.removeItem(key);
  sessionStorage.removeItem(START_KEY);
}
export type StartData = {
  title?: string;
  preset?: string;
  interpretation?: AIDecisionInterpretation;
  mode?: PackageLevel;
  demo?: boolean;
};
export function storeStart(data: StartData): boolean {
  try {
    sessionStorage.setItem(START_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}
export function readStart(): StartData | null {
  try {
    const raw = sessionStorage.getItem(START_KEY);
    if (!raw || raw.length > 100000) return null;
    const d = JSON.parse(raw);
    if (!d || typeof d !== "object") return null;
    return {
      title: typeof d.title === "string" ? d.title.slice(0, 200) : undefined,
      preset: typeof d.preset === "string" ? d.preset : undefined,
      interpretation: interpretationSchema.safeParse(d.interpretation).success
        ? interpretationSchema.parse(d.interpretation)
        : undefined,
      mode: ["basic", "advanced", "business"].includes(d.mode)
        ? d.mode
        : undefined,
      demo: d.demo === true,
    };
  } catch {
    return null;
  }
}
export function downloadFile(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}
