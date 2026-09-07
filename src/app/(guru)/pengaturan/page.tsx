"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_TEACHER_PROFILE,
  refreshTeacherProfile,
  saveStoredTeacherProfile,
  type TeacherProfile,
} from "@/lib/teacher-profile";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { CheckCircle2, Save, School, Settings, User, Cpu } from "lucide-react";

export default function PengaturanPage() {
  const [profile, setProfile] = useState<TeacherProfile>(DEFAULT_TEACHER_PROFILE);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    void refreshTeacherProfile().then(setProfile);
  }, []);

  const handleChange = (field: keyof TeacherProfile, value: string) => {
    setProfile(prev => ({ ...prev, [field]: value }));
    setSavedSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await saveStoredTeacherProfile(profile);
    setSaveError(ok ? "" : "Gagal menyimpan. Pastikan Anda sudah login sebagai guru.");
    setSavedSuccess(ok);
    if (ok) setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b pb-4">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold md:text-3xl">
            <Settings className="h-7 w-7 text-[#0066cc]" />
            Pengaturan Akun & Instansi
          </h1>
          <p className="mt-1 text-sm text-[#414753] md:text-base">
            Sesuaikan identitas pendidik, data sekolah, dan preferensi AI generator LKPD.
          </p>
        </div>
        {savedSuccess && (
          <div className="flex items-center gap-2 rounded-xl bg-green-50 px-4 py-2 text-sm font-semibold text-green-700 shadow-xs">
            <CheckCircle2 className="h-4 w-4" />
            Pengaturan Berhasil Disimpan!
          </div>
        )}
        {saveError && (
          <p role="alert" className="rounded-xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700">{saveError}</p>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Profil Pendidik */}
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2.5 border-b pb-3 text-[#1e3a8a]">
            <User className="h-5 w-5" />
            <h2 className="text-lg font-semibold">1. Identitas Pendidik</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="label mt-0">
              Nama Lengkap (tanpa gelar) *
              <input
                className="input"
                required
                value={profile.nama}
                onChange={e => handleChange("nama", e.target.value)}
                placeholder="Contoh: Ryan Wardiana"
              />
            </label>
            <label className="label mt-0">
              Gelar Akademik
              <input
                className="input"
                value={profile.gelar}
                onChange={e => handleChange("gelar", e.target.value)}
                placeholder="Contoh: S.Pd."
              />
            </label>
            <label className="label mt-0">
              NIP / NUPTK
              <input
                className="input"
                value={profile.nip}
                onChange={e => handleChange("nip", e.target.value)}
                placeholder="Contoh: 19980809 202401 1 002"
              />
            </label>
            <label className="label mt-0">
              Email Dinas / Belajar.id
              <input
                className="input"
                type="email"
                value={profile.email}
                onChange={e => handleChange("email", e.target.value)}
                placeholder="guru@smp.belajar.id"
              />
            </label>
            <label className="label mt-0 sm:col-span-2">
              Nomor Telepon / WhatsApp
              <input
                className="input"
                value={profile.noHp}
                onChange={e => handleChange("noHp", e.target.value)}
                placeholder="0812-3456-7890"
              />
            </label>
          </div>
        </Card>

        {/* Section 2: Data Sekolah & Mata Pelajaran */}
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2.5 border-b pb-3 text-[#1e3a8a]">
            <School className="h-5 w-5" />
            <h2 className="text-lg font-semibold">2. Satuan Pendidikan & Mata Pelajaran</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="label mt-0">
              Nama Sekolah / Instansi *
              <input
                className="input"
                required
                value={profile.sekolah}
                onChange={e => handleChange("sekolah", e.target.value)}
                placeholder="Contoh: SMP Negeri 7 Nusantara"
              />
            </label>
            <label className="label mt-0">
              Mata Pelajaran yang Diampu
              <input
                className="input"
                value={profile.mataPelajaran}
                onChange={e => handleChange("mataPelajaran", e.target.value)}
                placeholder="Contoh: Matematika"
              />
            </label>
            <label className="label mt-0">
              Fase & Jenjang Kelas
              <input
                className="input"
                value={profile.faseJenjang}
                onChange={e => handleChange("faseJenjang", e.target.value)}
                placeholder="Contoh: Fase D (SMP Kelas VII)"
              />
            </label>
            <label className="label mt-0">
              Kurikulum Acuan
              <input
                className="input"
                value={profile.kurikulum}
                onChange={e => handleChange("kurikulum", e.target.value)}
                placeholder="Contoh: Kurikulum Merdeka"
              />
            </label>
            <label className="label mt-0 sm:col-span-2">
              Alamat Sekolah
              <input
                className="input"
                value={profile.alamatSekolah}
                onChange={e => handleChange("alamatSekolah", e.target.value)}
                placeholder="Contoh: Jl. Pendidikan No. 45, Kota Bandung"
              />
            </label>
          </div>
        </Card>

        {/* Section 3: Preferensi AI & Format Output */}
        <Card className="p-5 md:p-6">
          <div className="flex items-center gap-2.5 border-b pb-3 text-[#1e3a8a]">
            <Cpu className="h-5 w-5" />
            <h2 className="text-lg font-semibold">3. Preferensi AI & Format Ekspor</h2>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <label className="label mt-0">
              Koneksi AI Engine
              <select
                className="input"
                value={profile.modelAi}
                onChange={e => handleChange("modelAi", e.target.value)}
              >
                <option value="cx/gpt-5.6-sol (9Router Lokal)">
                  cx/gpt-5.6-sol (9Router Lokal http://localhost:20128)
                </option>
                <option value="claude-3-5-sonnet (9Router Lokal)">
                  claude-3-5-sonnet (9Router Lokal)
                </option>
                <option value="gpt-4o (9Router Lokal)">gpt-4o (9Router Lokal)</option>
              </select>
            </label>
            <label className="label mt-0">
              Format Ekspor Default
              <select
                className="input"
                value={profile.exportFormat}
                onChange={e => handleChange("exportFormat", e.target.value as "word" | "pdf")}
              >
                <option value="word">Microsoft Word (.docx dengan Formula OMML)</option>
                <option value="pdf">Cetak / PDF A4 Standar KaTeX</option>
              </select>
            </label>
          </div>
        </Card>

        {/* Action Button */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-t pt-4">
          <p className="text-xs text-[#6b7280]">
            Perubahan disimpan ke database Supabase dan langsung diterapkan ke seluruh sistem.
          </p>
          <Button type="submit" className="min-w-40">
            <Save className="h-4 w-4" />
            Simpan Pengaturan
          </Button>
        </div>
      </form>
    </div>
  );
}
