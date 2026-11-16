"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "4kwom:favorites:v1";
const listeners = new Set<() => void>();

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

// The raw JSON string is the snapshot: strings compare by value, so React gets a stable snapshot.
function getSnapshot(): string {
  try {
    return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function getServerSnapshot(): string {
  return "[]";
}

function parse(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];
  } catch {
    return [];
  }
}

function write(ids: string[]): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Storage may be unavailable (private mode / quota); favorites then simply don't persist.
  }
  listeners.forEach((listener) => listener());
}

export function useFavorites() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ids = useMemo(() => parse(raw), [raw]);

  const has = useCallback((id: string) => ids.includes(id), [ids]);
  const toggle = useCallback(
    (id: string) => {
      const current = parse(getSnapshot());
      write(current.includes(id) ? current.filter((entry) => entry !== id) : [id, ...current]);
    },
    [],
  );
  const replaceAll = useCallback((next: string[]) => write(next), []);

  return { ids, has, toggle, replaceAll };
}
