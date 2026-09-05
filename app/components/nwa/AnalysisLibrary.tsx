"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  Check,
  Download,
  FolderOpen,
  Pencil,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useAnalysis } from "@/app/lib/nwa/analysis-context";
import {
  LIBRARY_CHANGE_EVENT,
  clearLibrary,
  deleteAnalysis,
  listAnalyses,
  loadAnalysis,
  renameAnalysis,
  saveAnalysis,
  type SavedAnalysisMeta,
} from "@/app/lib/nwa/storage";
import { buildFileName, downloadFile, fromJson, toJson } from "@/app/lib/nwa/export";

const PACKAGE_LABEL: Record<string, string> = {
  basic: "Basic",
  advanced: "Advanced",
  business: "Business",
};

function formatSavedAt(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("de-CH", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Bibliothek gespeicherter Analysen: speichern, laden, umbenennen, löschen,
 * exportieren und importieren. Alle Daten bleiben im Browser.
 */
export function AnalysisLibrary({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state, loadState } = useAnalysis();
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);
  const [revision, setRevision] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refresh = useCallback(() => setRevision((value) => value + 1), []);

  // Der Dialog wird ausschliesslich clientseitig geöffnet – der Lesezugriff im
  // Render ist deshalb hydrationssicher.
  const entries: SavedAnalysisMeta[] = useMemo(() => {
    void revision;
    return open ? listAnalyses() : [];
  }, [open, revision]);

  useEffect(() => {
    if (!open) return;
    window.addEventListener(LIBRARY_CHANGE_EVENT, refresh);
    return () => window.removeEventListener(LIBRARY_CHANGE_EVENT, refresh);
  }, [open, refresh]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  const notify = useCallback((tone: "ok" | "error", text: string) => {
    setMessage({ tone, text });
    window.setTimeout(() => setMessage(null), 3500);
  }, []);

  const handleSaveCurrent = useCallback(() => {
    if (!state.decision.title.trim()) {
      notify("error", "Bitte vergeben Sie zuerst einen Titel für die Analyse.");
      return;
    }
    const meta = saveAnalysis(state);
    if (meta) {
      notify("ok", `„${meta.title}“ wurde gespeichert.`);
      refresh();
    } else {
      notify("error", "Speichern fehlgeschlagen – der lokale Speicher ist voll oder gesperrt.");
    }
  }, [state, notify, refresh]);

  const handleLoad = useCallback(
    (id: string) => {
      const loaded = loadAnalysis(id);
      if (!loaded) {
        notify("error", "Die Analyse konnte nicht geladen werden.");
        return;
      }
      loadState(loaded);
      onClose();
    },
    [loadState, notify, onClose]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteAnalysis(id);
      refresh();
    },
    [refresh]
  );

  const handleExportOne = useCallback(
    (id: string) => {
      const loaded = loadAnalysis(id);
      if (!loaded) return;
      downloadFile(toJson(loaded), buildFileName(loaded.decision.title, "json"), "application/json");
    },
    []
  );

  const commitRename = useCallback(
    (id: string) => {
      if (renameValue.trim()) renameAnalysis(id, renameValue);
      setRenamingId(null);
      setRenameValue("");
      refresh();
    },
    [renameValue, refresh]
  );

  const handleImportFile = useCallback(
    async (file: File) => {
      try {
        const text = await file.text();
        const result = fromJson(text);
        if (!result.ok || !result.state) {
          notify("error", result.error ?? "Die Datei konnte nicht gelesen werden.");
          return;
        }
        loadState(result.state);
        saveAnalysis(result.state);
        refresh();
        notify("ok", "Analyse importiert.");
        onClose();
      } catch {
        notify("error", "Die Datei konnte nicht gelesen werden.");
      }
    },
    [loadState, notify, onClose, refresh]
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl border border-white/[0.09] bg-[#101018] shadow-2xl sm:rounded-3xl">
        {/* Kopf */}
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] p-5 sm:p-6">
          <div>
            <h3 className="flex items-center gap-2 text-lg font-semibold text-white">
              <FolderOpen className="h-4.5 w-4.5" style={{ color: "rgb(var(--accent))" }} />
              Meine Analysen
            </h3>
            <p className="mt-1 text-sm text-white/45">
              Bis zu 50 Analysen – gespeichert ausschliesslich in diesem Browser.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Schliessen"
            className="rounded-lg p-1.5 text-white/35 transition hover:bg-white/[0.06] hover:text-white/80"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Aktionen */}
        <div className="flex flex-wrap gap-2 border-b border-white/[0.07] p-4 sm:px-6">
          <button
            onClick={handleSaveCurrent}
            className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            style={{ background: "rgb(var(--accent))" }}
          >
            <Save className="h-4 w-4" />
            Aktuelle Analyse speichern
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.09] hover:text-white"
          >
            <Upload className="h-4 w-4" />
            JSON importieren
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleImportFile(file);
              event.target.value = "";
            }}
          />
        </div>

        {message && (
          <div
            className={`mx-4 mt-4 flex items-start gap-2 rounded-xl border p-3 text-sm sm:mx-6 ${
              message.tone === "ok"
                ? "border-emerald-400/25 bg-emerald-400/[0.08] text-emerald-100/85"
                : "border-red-400/25 bg-red-400/[0.08] text-red-100/85"
            }`}
          >
            {message.tone === "ok" ? (
              <Check className="mt-0.5 h-4 w-4 flex-shrink-0" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            )}
            {message.text}
          </div>
        )}

        {/* Liste */}
        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:px-6">
          {entries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-white/[0.1] p-8 text-center">
              <FolderOpen className="mx-auto h-8 w-8 text-white/20" />
              <p className="mt-3 text-sm text-white/50">Noch keine gespeicherten Analysen.</p>
              <p className="mt-1 text-xs text-white/30">
                Speichern Sie die aktuelle Analyse, um später daran weiterzuarbeiten.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {entries.map((entry) => (
                <li
                  key={entry.id}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 transition hover:border-white/[0.13] hover:bg-white/[0.04]"
                >
                  {renamingId === entry.id ? (
                    <div className="flex gap-2">
                      <input
                        autoFocus
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter") commitRename(entry.id);
                          if (event.key === "Escape") setRenamingId(null);
                        }}
                        className="h-9 flex-1 rounded-lg border border-white/15 bg-white/[0.05] px-3 text-sm text-white outline-none focus:border-white/30"
                      />
                      <button
                        onClick={() => commitRename(entry.id)}
                        className="rounded-lg px-3 text-sm font-medium text-white"
                        style={{ background: "rgb(var(--accent))" }}
                      >
                        OK
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => handleLoad(entry.id)}
                        className="min-w-0 flex-1 text-left"
                      >
                        <div className="truncate text-sm font-semibold text-white/90">
                          {entry.title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-white/40">
                          <span>{formatSavedAt(entry.savedAt)}</span>
                          <span className="text-white/20">•</span>
                          <span>{PACKAGE_LABEL[entry.packageLevel] ?? entry.packageLevel}</span>
                          <span className="text-white/20">•</span>
                          <span>
                            {entry.alternativeCount} Alternativen, {entry.criterionCount} Kriterien
                          </span>
                          {entry.topAlternative && entry.topScore !== null && (
                            <>
                              <span className="text-white/20">•</span>
                              <span style={{ color: "rgb(var(--accent))" }}>
                                {entry.topAlternative} ({entry.topScore.toFixed(2)} Punkte)
                              </span>
                            </>
                          )}
                        </div>
                      </button>

                      <div className="flex flex-shrink-0 gap-1">
                        <IconButton
                          label="Umbenennen"
                          onClick={() => {
                            setRenamingId(entry.id);
                            setRenameValue(entry.title);
                          }}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton label="Als JSON exportieren" onClick={() => handleExportOne(entry.id)}>
                          <Download className="h-3.5 w-3.5" />
                        </IconButton>
                        <IconButton
                          label="Löschen"
                          destructive
                          onClick={() => handleDelete(entry.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </IconButton>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Fuss */}
        {entries.length > 0 && (
          <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] p-4 sm:px-6">
            <span className="text-[11px] text-white/30">
              {entries.length} von 50 Plätzen belegt
            </span>
            {confirmClear ? (
              <div className="flex gap-2">
                <button
                  onClick={() => setConfirmClear(false)}
                  className="rounded-lg px-3 py-1.5 text-xs font-medium text-white/50 transition hover:text-white/80"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => {
                    clearLibrary();
                    setConfirmClear(false);
                    refresh();
                  }}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-red-500"
                >
                  Wirklich alles löschen
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClear(true)}
                className="text-xs font-medium text-white/35 transition hover:text-red-300"
              >
                Alle Analysen löschen
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function IconButton({
  label,
  onClick,
  destructive,
  children,
}: {
  label: string;
  onClick: () => void;
  destructive?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className={`rounded-lg border border-transparent p-2 text-white/35 transition hover:border-white/10 hover:bg-white/[0.06] ${
        destructive ? "hover:text-red-300" : "hover:text-white/80"
      }`}
    >
      {children}
    </button>
  );
}
