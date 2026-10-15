"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  /** Schliessen per Klick auf den Hintergrund / Escape erlauben */
  dismissible?: boolean;
  size?: "sm" | "md" | "lg";
  closeLabel?: string;
}

export function Dialog({ open, onClose, title, description, children, footer, dismissible = true, size = "md", closeLabel = "Schliessen" }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descId = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();
  }, [open]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      if (dismissible) onClose();
    };
    el.addEventListener("cancel", onCancel);
    return () => el.removeEventListener("cancel", onCancel);
  }, [dismissible, onClose]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
      className={cn(
        "m-auto w-[calc(100%-2rem)] rounded-2xl border border-line bg-surface p-0 text-ink shadow-lg backdrop:bg-black/50 backdrop:backdrop-blur-sm",
        size === "sm" && "max-w-md",
        size === "md" && "max-w-xl",
        size === "lg" && "max-w-3xl",
      )}
      onClick={(e) => {
        if (dismissible && e.target === ref.current) onClose();
      }}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <div>
          <h2 id={titleId} className="text-lg font-semibold tracking-tight">
            {title}
          </h2>
          {description && (
            <p id={descId} className="mt-1 text-sm text-ink-2">
              {description}
            </p>
          )}
        </div>
        {dismissible && (
          <button type="button" className="btn btn-ghost btn-icon -mr-2 -mt-1" onClick={onClose} aria-label={closeLabel}>
            <X className="h-5 w-5" aria-hidden />
          </button>
        )}
      </div>
      {children && <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>}
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  text?: string;
  confirmLabel: string;
  cancelLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ open, title, text, confirmLabel, cancelLabel, danger, onConfirm, onCancel }: ConfirmProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      description={text}
      size="sm"
      closeLabel={cancelLabel}
      footer={
        <>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className={cn("btn", danger ? "btn-danger" : "btn-primary")} onClick={onConfirm} autoFocus>
            {confirmLabel}
          </button>
        </>
      }
    />
  );
}
