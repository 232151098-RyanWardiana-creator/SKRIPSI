"use client";

import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

export interface TeacherProfile {
  nama: string;
  gelar: string;
  nip: string;
  email: string;
  noHp: string;
  sekolah: string;
  alamatSekolah: string;
  mataPelajaran: string;
  faseJenjang: string;
  kurikulum: string;
  modelAi: string;
  exportFormat: "word" | "pdf";
}

/** Kosong, bukan data contoh: profil nyata diisi guru lewat halaman Pengaturan. */
export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  nama: "",
  gelar: "",
  nip: "",
  email: "",
  noHp: "",
  sekolah: "",
  alamatSekolah: "",
  mataPelajaran: "Matematika",
  faseJenjang: "Fase D (SMP Kelas VII)",
  kurikulum: "Kurikulum Merdeka",
  modelAi: "cx/gpt-5.6-sol (9Router Lokal)",
  exportFormat: "word",
};

export const PROFILE_UPDATED_EVENT = "teacher_profile_updated";

let cache: TeacherProfile = DEFAULT_TEACHER_PROFILE;

const rowToProfile = (row: Record<string, unknown>): TeacherProfile => ({
  nama: (row.nama as string) ?? "",
  gelar: (row.gelar as string) ?? "",
  nip: (row.nip as string) ?? "",
  email: (row.email as string) ?? "",
  noHp: (row.no_hp as string) ?? "",
  sekolah: (row.sekolah as string) ?? "",
  alamatSekolah: (row.alamat_sekolah as string) ?? "",
  mataPelajaran: (row.mata_pelajaran as string) ?? DEFAULT_TEACHER_PROFILE.mataPelajaran,
  faseJenjang: (row.fase_jenjang as string) ?? DEFAULT_TEACHER_PROFILE.faseJenjang,
  kurikulum: (row.kurikulum as string) ?? DEFAULT_TEACHER_PROFILE.kurikulum,
  modelAi: (row.model_ai as string) ?? DEFAULT_TEACHER_PROFILE.modelAi,
  exportFormat: row.export_format === "pdf" ? "pdf" : "word",
});

export function getStoredTeacherProfile() {
  return cache;
}

/** Profil guru yang sedang login (tabel `profiles`, kunci = id Supabase Auth). */
export async function refreshTeacherProfile(): Promise<TeacherProfile> {
  if (!isSupabaseConfigured) return cache;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return cache;
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  if (data) {
    cache = rowToProfile(data);
    window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  }
  return cache;
}

export async function saveStoredTeacherProfile(profile: TeacherProfile): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return false;
  const { error } = await supabase.from("profiles").upsert({
    id: user.id,
    email: profile.email || user.email,
    nama: profile.nama,
    gelar: profile.gelar,
    nip: profile.nip,
    no_hp: profile.noHp,
    sekolah: profile.sekolah,
    alamat_sekolah: profile.alamatSekolah,
    mata_pelajaran: profile.mataPelajaran,
    fase_jenjang: profile.faseJenjang,
    kurikulum: profile.kurikulum,
    model_ai: profile.modelAi,
    export_format: profile.exportFormat,
  });
  if (error) return console.error("Gagal menyimpan profil guru:", error), false;
  cache = profile;
  window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
  return true;
}

export function useTeacherProfile() {
  const [profile, setProfile] = useState<TeacherProfile>(cache);
  useEffect(() => {
    const sync = () => setProfile(getStoredTeacherProfile());
    void refreshTeacherProfile().then(sync);
    window.addEventListener(PROFILE_UPDATED_EVENT, sync);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, sync);
  }, []);
  return profile;
}
