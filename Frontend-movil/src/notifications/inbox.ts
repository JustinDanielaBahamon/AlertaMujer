import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

/**
 * In-app inbox behind the bell of the header: every notification the app shows (alerts of her contacts,
 * warnings, trips, evidence about to be deleted, new phone, risk zones) is also kept here, so she can
 * read it later even if she swiped it away. It lives only on this phone; it also works from the
 * background push handler (the app closed).
 */

export type InboxKind = "alert" | "alert_ended" | "warning" | "trip" | "evidence" | "phone" | "zone";

/** Where tapping the entry leads. */
export type InboxTarget =
  | { screen: "ContactAlert"; alertId: number; userName?: string; code?: string; delivery?: string }
  | { screen: "Trip" }
  | { screen: "History" }
  | { screen: "Map" };

export type InboxEntry = {
  id: string;
  kind: InboxKind;
  title: string;
  body: string;
  at: number;
  read: boolean;
  target?: InboxTarget;
};

const KEY = "@alerta-mujer:inbox";
const MAX_ENTRIES = 60;

const listeners = new Set<() => void>();
const changed = () => listeners.forEach((l) => l());

export async function inboxEntries(): Promise<InboxEntry[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as InboxEntry[]) : [];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

async function save(list: InboxEntry[]): Promise<void> {
  await AsyncStorage.setItem(KEY, JSON.stringify(list.slice(0, MAX_ENTRIES))).catch(() => {});
  changed();
}

/**
 * Keeps a notification. The same id replaces the previous entry (an alert that sends a new warning
 * updates its line instead of piling up), and it becomes unread again.
 */
export async function addToInbox(entry: Omit<InboxEntry, "at" | "read">): Promise<void> {
  const list = (await inboxEntries()).filter((e) => e.id !== entry.id);
  await save([{ ...entry, at: Date.now(), read: false }, ...list]);
}

export async function markInboxRead(): Promise<void> {
  const list = await inboxEntries();
  if (list.some((e) => !e.read)) await save(list.map((e) => ({ ...e, read: true })));
}

export async function clearInbox(): Promise<void> {
  await save([]);
}

/** The inbox and its unread count, refreshed when something arrives or the app comes back. */
export function useInbox() {
  const [entries, setEntries] = useState<InboxEntry[]>([]);

  const reload = useCallback(() => {
    inboxEntries().then(setEntries);
  }, []);

  useEffect(() => {
    reload();
    listeners.add(reload);
    // Entries written by the background handler while the app was closed
    const sub = AppState.addEventListener("change", (s) => s === "active" && reload());
    return () => {
      listeners.delete(reload);
      sub.remove();
    };
  }, [reload]);

  return {
    entries,
    unread: entries.filter((e) => !e.read).length,
    markRead: markInboxRead,
    clear: clearInbox,
  };
}
