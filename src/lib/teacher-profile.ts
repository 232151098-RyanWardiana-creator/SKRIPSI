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

export const DEFAULT_TEACHER_PROFILE: TeacherProfile = {
  nama: "Ryan Wardiana",
  gelar: "S.Pd.",
  nip: "19980809 202401 1 002",
  email: "ryan.wardiana@guru.smp.belajar.id",
  noHp: "0812-3456-7890",
  sekolah: "SMP Negeri 7 Nusantara",
  alamatSekolah: "Jl. Pendidikan No. 45, Kota Bandung",
  mataPelajaran: "Matematika",
  faseJenjang: "Fase D (SMP Kelas VII)",
  kurikulum: "Kurikulum Merdeka",
  modelAi: "cx/gpt-5.6-sol (9Router Lokal)",
  exportFormat: "word",
};

export const PROFILE_STORAGE_KEY = "lkpd_teacher_profile_v1";

export function getStoredTeacherProfile(): TeacherProfile {
  if (typeof window === "undefined") return DEFAULT_TEACHER_PROFILE;
  try {
    const raw = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (raw) {
      return { ...DEFAULT_TEACHER_PROFILE, ...JSON.parse(raw) };
    }
  } catch {
    // fallback
  }
  return DEFAULT_TEACHER_PROFILE;
}

export function saveStoredTeacherProfile(profile: TeacherProfile): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    window.dispatchEvent(new Event("teacher_profile_updated"));
  } catch {
    // ignore
  }
}
