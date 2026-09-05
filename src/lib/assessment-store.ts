"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Asesmen } from "@/types";

export const ASSESSMENT_STORAGE_KEY = "lkpd_assessments_master_v1";
export const ASSESSMENT_UPDATED_EVENT = "lkpd_assessments_updated";
const EMPTY: Asesmen[] = [];
let cacheRaw: string | null | undefined;
let cache = EMPTY;
function read(): Asesmen[] { if (typeof window === "undefined") return EMPTY; const raw = localStorage.getItem(ASSESSMENT_STORAGE_KEY); if (raw === cacheRaw) return cache; cacheRaw = raw; try { const value: unknown = raw ? JSON.parse(raw) : []; cache = Array.isArray(value) ? value as Asesmen[] : EMPTY; } catch { cache = EMPTY; } return cache; }
function subscribe(listener: () => void) { const custom = () => listener(); const storage = (event: StorageEvent) => { if (event.key === ASSESSMENT_STORAGE_KEY) { cacheRaw = undefined; listener(); } }; window.addEventListener(ASSESSMENT_UPDATED_EVENT, custom); window.addEventListener("storage", storage); return () => { window.removeEventListener(ASSESSMENT_UPDATED_EVENT, custom); window.removeEventListener("storage", storage); }; }
function cacheAssessments(items: Asesmen[]) { if (typeof window === "undefined") return false; try { const raw = JSON.stringify(items); localStorage.setItem(ASSESSMENT_STORAGE_KEY, raw); cacheRaw = raw; cache = items; window.dispatchEvent(new Event(ASSESSMENT_UPDATED_EVENT)); return true; } catch { return false; } }
import { ensureUUID } from "@/lib/utils";

async function pushAssessment(item: Asesmen) {
  if (!isSupabaseConfigured) return;
  const { error } = await supabase.from("assessments").upsert({
    id: ensureUUID(item.id),
    judul: item.judul,
    materi: item.materi,
    kelas_id: ensureUUID(item.kelas_id),
    kode_kelas: item.kode_kelas,
    durasi_menit: item.durasi_menit,
    status: item.status,
    kuesioner_aktif: item.kuesionerAktif ?? true,
    soal: item.soal,
    dibuat_pada: item.dibuat_pada ?? new Date().toISOString(),
    tanggal_mulai: item.tanggal_mulai,
    tanggal_selesai: item.tanggal_selesai,
    deskripsi: item.deskripsi ?? null
  });
  if (error) {
    console.error("Gagal push assessment ke Supabase:", error);
  }
}
async function pullAssessments(): Promise<Asesmen[]> {
  if (!isSupabaseConfigured) return read();
  const { data, error } = await supabase.from("assessments").select("*").order("dibuat_pada", { ascending: false });
  const currentLocal = read();
  if (error || !data) {
    if (error) console.warn("Supabase pullAssessments error:", error);
    return currentLocal;
  }
  if (data.length === 0 && currentLocal.length > 0) {
    for (const item of currentLocal) void pushAssessment(item);
    return currentLocal;
  }
  const mapped = data.map((row) => ({
    id: row.id,
    judul: row.judul,
    materi: row.materi,
    kelas_id: row.kelas_id,
    kode_kelas: row.kode_kelas,
    durasi_menit: row.durasi_menit,
    tanggal_mulai: row.tanggal_mulai ?? "",
    tanggal_selesai: row.tanggal_selesai ?? "",
    status: row.status,
    soal: row.soal ?? [],
    kuesionerAktif: row.kuesioner_aktif,
    deskripsi: row.deskripsi ?? undefined,
    dibuat_pada: row.dibuat_pada
  } as Asesmen));
  cacheAssessments(mapped);
  return mapped;
}
export function getAssessments() { return read(); }
export async function refreshAssessments() { return pullAssessments(); }
export function saveAssessments(items: Asesmen[]) { return cacheAssessments(items); }
export function upsertAssessment(item: Asesmen) { const current = read(); const index = current.findIndex(row => row.id === item.id); const saved = cacheAssessments(index < 0 ? [item, ...current] : current.map(row => row.id === item.id ? item : row)); if (saved) void pushAssessment(item); return saved; }
export function deleteAssessment(id: string) { const saved = cacheAssessments(read().filter(item => item.id !== id)); if (saved && isSupabaseConfigured) void supabase.from("assessments").delete().eq("id", id); return saved; }
export function getAssessment(id: string) { return read().find(item => item.id === id); }
export function useAssessmentStore() { const assessments = useSyncExternalStore(subscribe, read, () => EMPTY); useEffect(() => { void refreshAssessments(); if (!isSupabaseConfigured) return; const channelName = `assessment-store-${Math.random().toString(36).slice(2, 9)}`; const channel = supabase.channel(channelName).on("postgres_changes", { event: "*", schema: "public", table: "assessments" }, () => void refreshAssessments()).subscribe(); return () => { void supabase.removeChannel(channel); }; }, []); return { assessments, saveAssessments, upsertAssessment, deleteAssessment }; }
