"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { registerStudentByClassCode, useClassStore } from "@/lib/class-store";
import { clearSelectedStudent, setSelectedStudentId, useSelectedStudentId } from "@/lib/student-session";
import { UserCheck, LogOut } from "lucide-react";

export function StudentIdentityPicker() {
  const { classes } = useClassStore();
  const router = useRouter();
  const selectedId = useSelectedStudentId();
  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const currentClassEntry = classes.find(({ siswa }) => siswa.some((s) => s.id === selectedId));
  const currentStudent = currentClassEntry?.siswa.find((s) => s.id === selectedId);

  const enterByCode = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const result = await registerStudentByClassCode(nama, kode);
    setLoading(false);
    if (!result.ok) {
      setError(result.reason === "invalid-code"
        ? "Kode kelas tidak ditemukan. Pastikan kode kelas yang dimasukkan benar."
        : result.reason === "invalid-name"
          ? "Nama lengkap wajib diisi."
          : "Data siswa gagal disimpan. Silakan coba lagi.");
      return;
    }
    setError("");
    setSelectedStudentId(result.student.id);
    router.push("/dashboard-siswa");
  };

  const handleLogout = () => {
    clearSelectedStudent();
    setNama("");
    setKode("");
  };

  if (currentStudent && currentClassEntry) {
    return (
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 border-l-4 border-l-blue-600 bg-blue-50/50 p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
            <UserCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-700">Identitas Siswa Terkunci</span>
              <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-semibold text-green-800">Aktif</span>
            </div>
            <p className="text-base font-bold text-slate-900">
              {currentStudent.no_absen ? `${currentStudent.no_absen}. ` : ""}{currentStudent.nama}
            </p>
            <p className="text-xs text-slate-600">
              Kelas {currentClassEntry.kelas.nama} (Kode: {currentClassEntry.kelas.kode_undangan})
            </p>
          </div>
        </div>
        <Button variant="ghost" className="min-h-9 px-3 py-1.5 text-xs text-red-700 hover:bg-red-50" onClick={handleLogout}>
          <LogOut className="mr-1 h-4 w-4" />
          Ganti Siswa / Keluar
        </Button>
      </div>
    );
  }

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold">Masuk ke Kelas</h2>
      <p className="mt-1 text-xs text-[#6b7280]">Masukkan nama lengkap dan kode kelas dari guru Anda untuk memulai.</p>
      <form className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={enterByCode}>
        <label className="text-sm font-semibold">Nama lengkap
          <input className="input mt-1" placeholder="Contoh: Budi Santoso" value={nama} onChange={event => setNama(event.target.value)} required />
        </label>
        <label className="text-sm font-semibold">Kode kelas
          <input className="input mt-1 font-mono uppercase" placeholder="Contoh: VIIA-K123" value={kode} onChange={event => setKode(event.target.value.toUpperCase())} required />
        </label>
        <Button type="submit" disabled={loading}>{loading ? "Memproses..." : "Masuk"}</Button>
      </form>
      {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
    </div>
  );
}
