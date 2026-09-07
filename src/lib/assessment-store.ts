"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ensureUUID } from "@/lib/utils";
import type { Asesmen } from "@/types";

/** Sumber data: Supabase. Cache hanya di memori tab, bukan localStorage. */
export const ASSESSMENT_UPDATED_EVENT = "lkpd_assessments_updated";

const EMPTY: Asesmen[] = [];
let cache = EMPTY;

const emit = () => window.dispatchEvent(new Event(ASSESSMENT_UPDATED_EVENT));

function subscribe(listener: () => void) {
  window.addEventListener(ASSESSMENT_UPDATED_EVENT, listener);
  return () => window.removeEventListener(ASSESSMENT_UPDATED_EVENT, listener);
}

const toRow = (item: Asesmen) => ({
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
  deskripsi: item.deskripsi ?? null,
});

export function getAssessments() {
  return cache;
}

export async function refreshAssessments(): Promise<Asesmen[]> {
  if (!isSupabaseConfigured) return cache;
  const { data, error } = await supabase
    .from("assessments")
    .select("*")
    .order("dibuat_pada", { ascending: false });
  if (error || !data) {
    if (error) console.warn("Supabase refreshAssessments error:", error);
    return cache;
  }
  cache = data.map(
    (row) =>
      ({
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
        dibuat_pada: row.dibuat_pada,
      }) as Asesmen
  );
  emit();
  return cache;
}

export async function upsertAssessment(item: Asesmen): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from("assessments").upsert(toRow(item));
  if (error) return console.error("Gagal menyimpan asesmen:", error), false;
  await refreshAssessments();
  return true;
}

export async function saveAssessments(items: Asesmen[]): Promise<boolean> {
  if (!isSupabaseConfigured || !items.length) return false;
  const { error } = await supabase.from("assessments").upsert(items.map(toRow));
  if (error) return console.error("Gagal menyimpan asesmen:", error), false;
  await refreshAssessments();
  return true;
}

export async function deleteAssessment(id: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase.from("assessments").delete().eq("id", id);
  if (error) return console.error("Gagal menghapus asesmen:", error), false;
  await refreshAssessments();
  return true;
}

export function getAssessment(id: string) {
  return cache.find((item) => item.id === id);
}

export function useAssessmentStore() {
  const assessments = useSyncExternalStore(subscribe, getAssessments, () => EMPTY);
  useEffect(() => {
    void refreshAssessments();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`assessment-store-${Math.random().toString(36).slice(2, 9)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "assessments" }, () =>
        void refreshAssessments()
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
  return { assessments, saveAssessments, upsertAssessment, deleteAssessment };
}
