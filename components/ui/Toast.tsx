"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Kind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: Kind;
  text: string;
}
interface ToastValue {
  toast: (text: string, kind?: Kind) => void;
}

const ToastContext = createContext<ToastValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => setItems((l) => l.filter((t) => t.id !== id)), []);

  const toast = useCallback(
    (text: string, kind: Kind = "info") => {
      const id = ++counter.current;
      setItems((l) => [...l.slice(-3), { id, kind, text }]);
      window.setTimeout(() => remove(id), kind === "error" ? 7000 : 4000);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="false" className="no-print pointer-events-none fixed inset-x-0 bottom-4 z-[90] flex flex-col items-center gap-2 px-4">
        {items.map((t) => (
          <div
            key={t.id}
            role="status"
            className={cn(
              "pointer-events-auto flex max-w-md items-start gap-2 rounded-xl border px-3.5 py-2.5 text-sm shadow-lg fade-up",
              t.kind === "success" && "border-good/30 bg-good-soft text-ink",
              t.kind === "error" && "border-bad/30 bg-bad-soft text-ink",
              t.kind === "info" && "border-line bg-surface text-ink",
            )}
          >
            {t.kind === "success" && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-good" aria-hidden />}
            {t.kind === "error" && <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-bad" aria-hidden />}
            {t.kind === "info" && <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />}
            <span className="leading-snug">{t.text}</span>
            <button type="button" onClick={() => remove(t.id)} className="ml-1 rounded p-0.5 text-ink-3 hover:text-ink" aria-label="×">
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
