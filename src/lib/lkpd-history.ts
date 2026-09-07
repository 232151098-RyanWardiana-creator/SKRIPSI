"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ensureUUID, isUUID } from "@/lib/utils";
import type { Level } from "@/types";

/** Riwayat LKPD hasil generate AI. Sumber data: tabel `lkpd_documents`. */
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
  dibagikan?: boolean;
  source?: "online" | "mock";
}

export const HISTORY_UPDATED_EVENT = "lkpd_history_updated";

const EMPTY: LkpdHistoryEntry[] = [];
let cache = EMPTY;

const emit = () => window.dispatchEvent(new Event(HISTORY_UPDATED_EVENT));

function subscribe(listener: () => void) {
  window.addEventListener(HISTORY_UPDATED_EVENT, listener);
  return () => window.removeEventListener(HISTORY_UPDATED_EVENT, listener);
}

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

const tanggalId = (iso: string) =>
  new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export function getStoredHistory() {
  return cache;
}

export async function refreshHistory(): Promise<LkpdHistoryEntry[]> {
  if (!isSupabaseConfigured) return cache;
  const { data, error } = await supabase
    .from("lkpd_documents")
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error || !data) {
    if (error) console.warn("Supabase refreshHistory error:", error);
    return cache;
  }
  cache = data.map((row) => ({
    id: row.id,
    judul: row.judul,
    topik: row.materi ?? "",
    level: row.level as Level,
    kelas: row.kelas_nama ?? "",
    kelasId: row.kelas_id ?? undefined,
    tanggal: tanggalId(row.dibuat_pada),
    dibuat_pada: row.dibuat_pada,
    status: row.status === "validated" ? "Tervalidasi" : "Draf",
    content: row.konten ?? "",
    model: row.model ?? "",
    validatedAt: row.divalidasi_pada ?? null,
    isFallback: Boolean(row.is_fallback),
    dibagikan: Boolean(row.dibagikan),
    source: row.is_fallback ? "mock" : "online",
  }));
  emit();
  return cache;
}

export async function saveHistoryEntry(entry: LkpdHistoryEntry): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from("lkpd_documents").upsert({
    id: ensureUUID(entry.id),
    judul: entry.judul,
    kelas_id: isUUID(entry.kelasId) ? entry.kelasId : entry.kelasId ? ensureUUID(entry.kelasId) : null,
    kelas_nama: entry.kelas,
    materi: entry.topik,
    level: entry.level,
    konten: entry.content,
    status: entry.status === "Tervalidasi" ? "validated" : "draft",
    model: entry.model,
    is_fallback: entry.isFallback ?? false,
    divalidasi_pada: entry.validatedAt ?? null,
    dibuat_pada: entry.dibuat_pada,
  });
  if (error) return console.error("Gagal menyimpan riwayat LKPD:", error), false;
  await refreshHistory();
  return true;
}

export async function deleteHistoryEntry(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from("lkpd_documents").delete().eq("id", ensureUUID(id));
  if (error) return console.error("Gagal menghapus riwayat LKPD:", error), false;
  await refreshHistory();
  return true;
}

/** Menandai LKPD dibagikan / ditarik dari siswa. */
export async function setLkpdDibagikan(id: string, dibagikan: boolean): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from("lkpd_documents")
    .update({ dibagikan })
    .eq("id", ensureUUID(id));
  if (error) return console.error("Gagal mengubah status bagikan:", error), false;
  await refreshHistory();
  return true;
}

export function useHistoryStore() {
  const history = useSyncExternalStore(subscribe, getStoredHistory, () => EMPTY);
  useEffect(() => {
    void refreshHistory();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`history-store-${Math.random().toString(36).slice(2, 9)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lkpd_documents" }, () =>
        void refreshHistory()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
  return { history };
}
