export type Role = "guru" | "siswa";
export type Level = "dasar" | "menengah" | "mahir";
export type Indikator = "IK-01" | "IK-02" | "IK-03" | "IK-04" | "IK-05";
export type GayaBelajar = "visual" | "auditory" | "kinestetik" | null;

export interface PertanyaanGayaBelajar {
  id: string;
  pertanyaan: string;
  pilihan: {
    a: { teks: string; tipe: "visual" | "auditory" | "kinestetik" };
    b: { teks: string; tipe: "visual" | "auditory" | "kinestetik" };
    c: { teks: string; tipe: "visual" | "auditory" | "kinestetik" };
  };
}

export interface User { id: string; email: string; nama: string; role: Role; sekolah?: string }
export interface Kelas { id: string; nama: string; tahun_ajaran: string; kode_undangan: string; guru_id: string; jumlah_siswa: number; wali_kelas?: string }
export type AssessmentStatus = "draft" | "aktif" | "selesai";
export type AnswerKey = "a" | "b" | "c" | "d";
export interface Soal { id: string; asesmen_id: string; nomor: number; pertanyaan: string; pilihan: Record<AnswerKey, string>; jawaban_benar: AnswerKey; indikator: Indikator }
export interface Asesmen { id: string; judul: string; materi: string; kelas_id: string; kode_kelas?: string; durasi_menit: number; tanggal_mulai: string; tanggal_selesai: string; status: AssessmentStatus; soal: Soal[]; kuesionerAktif?: boolean; deskripsi?: string; dibuat_pada?: string }
export interface IndicatorResult { benar: number; total: number; dikuasai: boolean }
export interface HasilAsesmen { id: string; siswa_id: string; asesmen_id: string; skor_total: number; level: Level; gaya_belajar?: GayaBelajar; detail_per_indikator: Record<string, IndicatorResult>; dikerjakan_pada: string }
export interface AssessmentSubmission extends HasilAsesmen { jawaban: Record<string, AnswerKey>; selesai: boolean; diperbarui_pada: string }
export interface LKPD { id: string; judul: string; asesmen_id: string; level: Level; konten: string; status: "draft" | "validated"; dibuat_pada: string; kelas?: string; materi?: string }
export interface Siswa { id: string; nama: string; no_absen?: number; nisn?: string; bergabung: string }

/** Kelas + siswa sebagaimana dipakai layar guru. Nama historis dari fase mock. */
export interface KelasMock extends Kelas { wali_kelas: string }
export interface SiswaMock extends Siswa { kelas_id: string; no_absen: number; gaya_belajar: GayaBelajar; level?: Level; punya_pin?: boolean }

