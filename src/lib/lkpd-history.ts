import type { Level } from "@/types";

export interface LkpdHistoryEntry {
  id: string;
  judul: string;
  topik: string;
  level: Level;
  kelas: string;
  kelasId?: string;
  tanggal: string;
  dibuat_pada: string;
  status: "Tervalidasi" | "Draf";
  content: string;
  model: string;
  validatedAt?: string | null;
  isFallback?: boolean;
  source?: "online" | "mock";
}

export const HISTORY_STORAGE_KEY = "lkpd_history_entries_v1";

const LEVELS: Level[] = ["dasar", "menengah", "mahir"];
const STATUSES: LkpdHistoryEntry["status"][] = ["Tervalidasi", "Draf"];

export function normalizePlainText(value: unknown): string {
  if (typeof value !== "string") return "";
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function sanitizeFilename(value: unknown): string {
  const normalized = normalizePlainText(value)
    .replace(/[<>:"/\\|?*]/g, "-")
    .replace(/\.+$/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 120);
  return normalized || "LKPD";
}

function parseHistoryEntry(value: unknown): LkpdHistoryEntry | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const item = value as Record<string, unknown>;
  if (
    typeof item.id !== "string" || !item.id.trim() ||
    typeof item.content !== "string" ||
    typeof item.dibuat_pada !== "string" ||
    typeof item.model !== "string" ||
    !LEVELS.includes(item.level as Level) ||
    !STATUSES.includes(item.status as LkpdHistoryEntry["status"]) ||
    (item.validatedAt !== undefined && item.validatedAt !== null && typeof item.validatedAt !== "string")
  ) return null;

  return {
    id: normalizePlainText(item.id),
    judul: normalizePlainText(item.judul),
    topik: normalizePlainText(item.topik),
    level: item.level as Level,
    kelas: normalizePlainText(item.kelas),
    kelasId: typeof item.kelasId === "string" ? normalizePlainText(item.kelasId) : undefined,
    tanggal: normalizePlainText(item.tanggal),
    dibuat_pada: item.dibuat_pada,
    status: item.status as LkpdHistoryEntry["status"],
    content: item.content.replace(/\u0000/g, ""),
    model: normalizePlainText(item.model),
    validatedAt: item.validatedAt as string | null | undefined,
    isFallback: typeof item.isFallback === "boolean" ? item.isFallback : undefined,
    source: item.source === "online" || item.source === "mock" ? item.source : undefined,
  };
}

export function getStoredHistory(): LkpdHistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (raw) {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.flatMap(item => {
          const valid = parseHistoryEntry(item);
          return valid ? [valid] : [];
        });
      }
    }
  } catch {
    // A corrupt or unavailable store must produce a clean slate.
  }
  return [];
}

export function saveHistoryEntry(entry: LkpdHistoryEntry): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredHistory();
    const existingIndex = current.findIndex(item => item.id === entry.id);
    let updated: LkpdHistoryEntry[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = entry;
    } else {
      updated = [entry, ...current];
    }
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("lkpd_history_updated"));
  } catch {
    // ignore
  }
}

export function deleteHistoryEntry(id: string): void {
  if (typeof window === "undefined") return;
  try {
    const current = getStoredHistory();
    const updated = current.filter(item => item.id !== id);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("lkpd_history_updated"));
  } catch {
    // ignore
  }
}
