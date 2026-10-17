/**
 * Minimaler externer Store für clientseitige Präferenzen (localStorage, Media
 * Queries). Für den Einsatz mit useSyncExternalStore: Der Server-Snapshot ist
 * ein Platzhalter, der Client-Snapshot wird beim ersten Zugriff gelesen –
 * ohne Hydrations-Konflikte und ohne setState in Effekten.
 */
export interface ClientStore<T> {
  subscribe: (listener: () => void) => () => void;
  get: () => T;
  getServer: () => T;
  set: (value: T) => void;
  /** Erneut aus der Quelle lesen und Abonnenten benachrichtigen */
  refresh: () => void;
}

export function createClientStore<T>(read: () => T, serverValue: T, onSubscribe?: (notify: () => void) => () => void): ClientStore<T> {
  let value: T = serverValue;
  let initialized = false;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());
  return {
    subscribe(listener) {
      listeners.add(listener);
      const cleanup = onSubscribe?.(() => {
        value = read();
        initialized = true;
        notify();
      });
      return () => {
        listeners.delete(listener);
        cleanup?.();
      };
    },
    get() {
      if (!initialized) {
        value = read();
        initialized = true;
      }
      return value;
    },
    getServer: () => serverValue,
    set(v) {
      value = v;
      initialized = true;
      notify();
    },
    refresh() {
      value = read();
      initialized = true;
      notify();
    },
  };
}
