"use client";
import { useRef, useState } from "react";
import { clearLocalData, downloadFile, readDraft } from "../lib/nwa/local-data";
export function LocalDataControls() {
  const [message, setMessage] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  return (
    <div className="local-controls">
      <div className="action-row">
        <button
          className="studio-button secondary"
          onClick={() => {
            const draft = readDraft();
            if (draft) {
              downloadFile(
                JSON.stringify(draft, null, 2),
                "DecisionStudio-Sicherung.json",
                "application/json",
              );
              setMessage("Dein Entwurf wurde als Datei bereitgestellt.");
            } else
              setMessage(
                "Auf diesem Gerät wurde kein gültiger Entwurf gefunden.",
              );
          }}
        >
          Entwurf exportieren
        </button>
        <button
          className="studio-button secondary"
          onClick={() => dialog.current?.showModal()}
        >
          Lokale Daten löschen
        </button>
      </div>
      <p role="status">{message}</p>
      <dialog
        ref={dialog}
        className="studio-dialog"
        aria-labelledby="delete-title"
      >
        <h2 id="delete-title">Lokale Daten löschen?</h2>
        <p>
          Der Entwurf und die Einstellungen dieses Tools werden aus diesem
          Browser entfernt. Bereits heruntergeladene Dateien bleiben erhalten.
          Schliesse zuvor andere geöffnete Analysefenster, damit sie den Entwurf
          nicht erneut speichern.
        </p>
        <div className="action-row">
          <button
            autoFocus
            className="studio-button secondary"
            onClick={() => dialog.current?.close()}
          >
            Abbrechen
          </button>
          <button
            className="studio-button"
            onClick={() => {
              try {
                clearLocalData();
                setMessage(
                  "Lokale Analysedaten und Einstellungen wurden gelöscht.",
                );
              } catch {
                setMessage(
                  "Der Browser blockiert den Zugriff. Lösche die Websitedaten über die Browsereinstellungen.",
                );
              }
              dialog.current?.close();
            }}
          >
            Endgültig löschen
          </button>
        </div>
      </dialog>
    </div>
  );
}
