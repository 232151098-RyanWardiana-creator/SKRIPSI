"use client";

import { useEffect, useSyncExternalStore } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { ensureUUID, isUUID } from "@/lib/utils";
import type { KelasMock, SiswaMock } from "@/types";
import type { Level } from "@/types";

/**
 * Sumber data: Supabase (satu-satunya). Tidak ada localStorage.
 * Cache di bawah ini hanya memori proses tab, hilang saat halaman ditutup.
 */
export const CLASS_UPDATED_EVENT = "lkpd_classes_updated";

export interface ClassStoreEntry {
  kelas: KelasMock;
  siswa: SiswaMock[];
}

const EMPTY: ClassStoreEntry[] = [];
let cache = EMPTY;

const emit = () => window.dispatchEvent(new Event(CLASS_UPDATED_EVENT));

function subscribe(listener: () => void) {
  window.addEventListener(CLASS_UPDATED_EVENT, listener);
  return () => window.removeEventListener(CLASS_UPDATED_EVENT, listener);
}

export function getClasses() {
  return cache;
}

export async function refreshClasses(): Promise<ClassStoreEntry[]> {
  if (!isSupabaseConfigured) return cache;
  const [{ data: classes, error }, { data: students }] = await Promise.all([
    supabase.from("classes").select("id,nama,tahun_ajaran,kode_undangan,guru_id,wali_kelas,jumlah_siswa"),
    supabase.from("students").select("id,kelas_id,nama,no_absen,nisn,level,gaya_belajar,bergabung,punya_pin"),
  ]);
  if (error || !classes) {
    if (error) console.warn("Supabase refreshClasses error:", error);
    return cache;
  }
  cache = classes.map((kelas) => {
    const siswa = (students ?? [])
      .filter((item) => item.kelas_id === kelas.id)
      .map(
        (item) =>
          ({
            ...item,
            no_absen: item.no_absen ?? 0,
          }) as SiswaMock
      );
    return {
      kelas: {
        ...kelas,
        guru_id: kelas.guru_id ?? "",
        wali_kelas: kelas.wali_kelas ?? "",
        jumlah_siswa: siswa.length,
      } as KelasMock,
      siswa,
    };
  });
  emit();
  return cache;
}

/**
 * Menyimpan seluruh daftar kelas + siswa ke Supabase, lalu memuat ulang.
 * Baris yang hilang dari `classes` dihapus di server agar penghapusan kelas
 * benar-benar tersimpan (bukan hanya hilang di layar).
 */
export async function saveClasses(classes: ClassStoreEntry[]): Promise<boolean> {
  if (!isSupabaseConfigured) return false;

  const classRows = classes.map(({ kelas, siswa }) => ({
    id: ensureUUID(kelas.id),
    nama: kelas.nama,
    tahun_ajaran: kelas.tahun_ajaran,
    kode_undangan: kelas.kode_undangan,
    guru_id: isUUID(kelas.guru_id) ? kelas.guru_id : null,
    wali_kelas: kelas.wali_kelas || null,
    jumlah_siswa: siswa.length,
  }));
  const studentRows = classes.flatMap(({ siswa, kelas }) =>
    siswa.map((item) => ({
      id: ensureUUID(item.id),
      kelas_id: ensureUUID(item.kelas_id || kelas.id),
      nama: item.nama,
      no_absen: item.no_absen,
      nisn: item.nisn ?? null,
      level: (item as SiswaMock & { level?: Level }).level ?? null,
      gaya_belajar: item.gaya_belajar,
      bergabung: item.bergabung,
    }))
  );

  const keptClassIds = classRows.map((row) => row.id);
  const keptStudentIds = studentRows.map((row) => row.id);

  if (classRows.length) {
    const { error } = await supabase.from("classes").upsert(classRows);
    if (error) return console.error("Gagal menyimpan kelas:", error), false;
  }
  if (studentRows.length) {
    const { error } = await supabase.from("students").upsert(studentRows);
    if (error) return console.error("Gagal menyimpan siswa:", error), false;
  }

  // Hapus baris yang sudah tidak ada di daftar.
  if (keptClassIds.length === 0) {
    // Pengguna mengosongkan seluruh kelas
    await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    await supabase.from("classes").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  } else {
    await supabase.from("classes").delete().not("id", "in", `(${keptClassIds.join(",")})`);
    await supabase
      .from("students")
      .delete()
      .in("kelas_id", keptClassIds)
      .not("id", "in", `(${keptStudentIds.length ? keptStudentIds.join(",") : ensureUUID("kosong")})`);
  }

  await refreshClasses();
  return true;
}

export async function deleteClass(classId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  await supabase.from("students").delete().eq("kelas_id", classId);
  const { error } = await supabase.from("classes").delete().eq("id", classId);
  if (error) {
    console.error("Gagal menghapus kelas:", error);
    return false;
  }
  await refreshClasses();
  return true;
}

export async function updateStudent(
  classId: string,
  studentId: string,
  update: Partial<SiswaMock> | ((student: SiswaMock) => SiswaMock)
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const current = cache.find((entry) => entry.kelas.id === classId)?.siswa.find((item) => item.id === studentId);
  if (!current) return false;
  const next = typeof update === "function" ? update(current) : { ...current, ...update };
  const { error } = await supabase
    .from("students")
    .update({
      nama: next.nama,
      no_absen: next.no_absen,
      nisn: next.nisn ?? null,
      level: (next as SiswaMock & { level?: Level }).level ?? null,
      gaya_belajar: next.gaya_belajar,
    })
    .eq("id", studentId);
  if (error) return console.error("Gagal memperbarui siswa:", error), false;
  await refreshClasses();
  return true;
}

/** Guru mencabut PIN siswa (lupa PIN) + memutus sesi aktifnya. */
export async function resetStudentPin(studentId: string): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const { error } = await supabase
    .from("students")
    .update({ pin_hash: null, pin_diperbarui_pada: null })
    .eq("id", studentId);
  if (error) return console.error("Gagal reset PIN siswa:", error), false;
  await refreshClasses();
  return true;
}

export function useClassStore() {
  const classes = useSyncExternalStore(subscribe, getClasses, () => EMPTY);
  useEffect(() => {
    void refreshClasses();
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`class-store-${Math.random().toString(36).slice(2, 9)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "classes" }, () => void refreshClasses())
      .on("postgres_changes", { event: "*", schema: "public", table: "students" }, () => void refreshClasses())
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);
  const updateClasses = (update: ClassStoreEntry[] | ((current: ClassStoreEntry[]) => ClassStoreEntry[])) =>
    void saveClasses(typeof update === "function" ? update(cache) : update);
  return { classes, updateClasses, updateStudent };
}
