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
    <Card className="p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="rounded-xl bg-indigo-50 p-2.5 text-[#2563EB] shrink-0 border border-blue-100">
            <Database className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-bold text-slate-900 text-sm sm:text-base">Data Simulasi untuk Presentasi</h2>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1 sm:pt-0">
          <Button disabled={sibuk !== null} onClick={() => void jalankan("POST")}>
            {sibuk === "muat" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden /> : null}
            Muat Data Simulasi
          </Button>
          <button
            disabled={sibuk !== null}
            onClick={() => void jalankan("DELETE")}
            title="Hapus Data Simulasi"
            aria-label="Hapus Data Simulasi"
            className="grid h-11 w-11 place-items-center rounded-full border border-rose-200 bg-white text-rose-600 shadow-2xs transition-all hover:bg-rose-50 hover:border-rose-300 disabled:opacity-50 cursor-pointer"
            type="button"
          >
            {sibuk === "hapus" ? (
              <Loader2 className="h-4 w-4 animate-spin text-rose-600" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4 text-rose-600" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {kabar ? (
        <p aria-live="polite" className="mt-3 text-xs font-semibold text-blue-800 bg-blue-50/80 border border-blue-100 rounded-xl px-3.5 py-2.5">
          {kabar}
        </p>
      ) : null}
    </Card>
  );
}
