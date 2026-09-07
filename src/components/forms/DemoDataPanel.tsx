"use client";

import { useState } from "react";
import { Database, Loader2, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabase";
import { refreshClasses } from "@/lib/class-store";
import { refreshAssessments } from "@/lib/assessment-store";
import { refreshHistory } from "@/lib/lkpd-history";
import { DEMO_KELAS, DEMO_KODE_KELAS, DEMO_PIN } from "@/lib/demo-data";

/**
 * Tombol Data Simulasi. Satu klik memasang contoh lengkap satu siklus
 * pembelajaran supaya aplikasi bisa didemokan tanpa menyentuh data asli.
 */
export function DemoDataPanel() {
  const [sibuk, setSibuk] = useState<"muat" | "hapus" | null>(null);
  const [kabar, setKabar] = useState("");

  async function jalankan(metode: "POST" | "DELETE") {
    setSibuk(metode === "POST" ? "muat" : "hapus");
    setKabar("");
    try {
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) {
        setKabar("Sesi login guru sudah berakhir. Silakan masuk ulang.");
        return;
      }
      const res = await fetch("/api/demo", {
        method: metode,
        headers: { Authorization: `Bearer ${token}` },
      });
      const hasil = await res.json();
      if (!res.ok) {
        setKabar(hasil.error ?? "Gagal memproses data simulasi.");
        return;
      }
      await Promise.all([refreshClasses(), refreshAssessments(), refreshHistory()]);
      setKabar(
        metode === "POST"
          ? `Berhasil. ${hasil.siswa} siswa, 1 asesmen beserta hasilnya, dan ${hasil.lkpd} LKPD siap didemokan.`
          : "Data simulasi sudah dibersihkan. Data asli tidak tersentuh."
      );
    } catch {
      setKabar("Tidak dapat menghubungi server. Periksa koneksi internet.");
    } finally {
      setSibuk(null);
    }
  }

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <span className="rounded-xl bg-indigo-50 p-2 text-indigo-600">
          <Database className="h-5 w-5" aria-hidden />
        </span>
        <div className="flex-1">
          <h2 className="font-semibold text-slate-900">Data Simulasi untuk Presentasi</h2>
          <p className="mt-1 text-sm text-slate-600">
            Sekali klik, aplikasi terisi contoh utuh satu siklus: kelas <b>{DEMO_KELAS.nama}</b> berisi 8 siswa, hasil
            asesmen diagnostik mereka, pembagian level, sampai LKPD yang sudah diisi dan dinilai. Cocok dipakai saat
            menjelaskan aplikasi kepada orang lain.
          </p>
          <p className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
            Untuk mencoba sisi siswa: kode kelas <b>{DEMO_KODE_KELAS}</b>, PIN <b>{DEMO_PIN}</b> (semua siswa simulasi).
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button disabled={sibuk !== null} onClick={() => void jalankan("POST")}>
              {sibuk === "muat" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
              Muat Data Simulasi
            </Button>
            <Button disabled={sibuk !== null} onClick={() => void jalankan("DELETE")} variant="secondary">
              {sibuk === "hapus" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" aria-hidden />
              )}
              Hapus Data Simulasi
            </Button>
          </div>

          {kabar ? (
            <p aria-live="polite" className="mt-3 text-sm font-medium text-slate-700">
              {kabar}
            </p>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
