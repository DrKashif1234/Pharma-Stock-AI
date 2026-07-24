// Thin, defensive wrapper around localStorage. All app data (medicines,
// stock transactions, settings) lives here — there is no backend database.
// Structured with a single get/set-per-key API so a future cloud database
// integration only has to replace this file.

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or unavailable (e.g. private browsing) — fail silently,
    // the app still works for the current session.
  }
}

export const STORAGE_KEYS = {
  medicines: 'pharmastock_medicines_v1',
  transactions: 'pharmastock_transactions_v1',
  settings: 'pharmastock_settings_v1',
  demoDismissed: 'pharmastock_demo_dismissed_v1',
} as const;
