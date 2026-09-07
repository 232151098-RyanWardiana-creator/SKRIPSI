"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CheckCircle2, Cloud, Loader2, Send } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { hitungTerisi } from "@/lib/lkpd-items";
import { simpanPengisianLkpd, type LkpdSiswa } from "@/lib/student-lkpd";

type StatusSimpan = "bersih" | "menyimpan" | "tersimpan" | "gagal";

export function LkpdWorksheet({ lkpd, onKirim }: { lkpd: LkpdSiswa; onKirim: () => void }) {
  const terkunci = lkpd.pengisian?.status === "terkirim" || lkpd.pengisian?.status === "dinilai";
  const [jawaban, setJawaban] = useState<Record<string, string>>(lkpd.pengisian?.jawaban ?? {});
  const [statusSimpan, setStatusSimpan] = useState<StatusSimpan>("bersih");
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [konfirmasiKirim, setKonfirmasiKirim] = useState(false);
  const [mengirim, setMengirim] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progres = useMemo(() => hitungTerisi(lkpd.butir, jawaban), [lkpd.butir, jawaban]);

  // Simpan otomatis 1,5 detik setelah siswa berhenti mengetik.
  // ponytail: debounce sederhana tanpa offline queue — cukup untuk 1 pertemuan
  // di kelas; tambahkan retry berbasis IndexedDB kalau nanti dipakai lintas hari.
  useEffect(() => {
    if (terkunci || statusSimpan !== "menyimpan") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const hasil = await simpanPengisianLkpd(lkpd.id, jawaban, false);
      setStatusSimpan(hasil.ok ? "tersimpan" : "gagal");
      setPesanGagal(hasil.ok ? null : (hasil.error ?? null));
    }, 1500);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [jawaban, lkpd.id, statusSimpan, terkunci]);

  const ubah = (id: string, nilai: string) => {
    setJawaban((prev) => ({ ...prev, [id]: nilai }));
    setStatusSimpan("menyimpan");
  };

  const kirim = async () => {
    setMengirim(true);
    const hasil = await simpanPengisianLkpd(lkpd.id, jawaban, true);
    setMengirim(false);
    setKonfirmasiKirim(false);
    if (hasil.ok) return onKirim();
    setStatusSimpan("gagal");
    setPesanGagal(hasil.error ?? null);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0066cc] hover:underline"
        href="/lkpd-saya"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar LKPD
      </Link>

      <header className="mb-6 rounded-[24px] bg-[#f2f3fc] p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">{lkpd.judul}</h1>
            <p className="mt-1 text-sm text-[#414753]">{lkpd.materi}</p>
          </div>
          <Badge level={lkpd.level}>{lkpd.level}</Badge>
        </div>

        {lkpd.pengisian?.status === "dinilai" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="flex items-center gap-2 font-semibold text-emerald-800">
              <CheckCircle2 className="h-5 w-5" aria-hidden />
              Sudah dinilai gurumu
              {lkpd.pengisian.nilai !== null && <span>· Nilai {lkpd.pengisian.nilai} dari 100</span>}
            </p>
            {lkpd.pengisian.catatanGuru && (
              <p className="mt-2 text-sm leading-relaxed text-emerald-900">
                <strong>Catatan guru:</strong> {lkpd.pengisian.catatanGuru}
              </p>
            )}
          </div>
        ) : lkpd.pengisian?.status === "terkirim" ? (
          <p className="mt-5 rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold text-blue-800">
            Sudah kamu kumpulkan. Tunggu gurumu menilai — jawaban tidak bisa diubah lagi.
          </p>
        ) : (
          <div className="mt-5">
            <ProgressBar
              value={progres.persen}
              label={`${progres.terisi} dari ${progres.total} soal sudah kamu isi`}
            />
          </div>
        )}
      </header>

      {lkpd.konten && (
        <Card className="mb-6">
          <h2 className="mb-3 text-lg font-semibold">Bahan Bacaan</h2>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#374151]">
            {lkpd.konten}
          </div>
        </Card>
      )}

      <ol className="space-y-4">
        {lkpd.butir.map((butir) => {
          const inputId = `butir-${butir.id}`;
          return (
            <li key={butir.id}>
              <Card>
                <label className="block" htmlFor={inputId}>
                  <span className="flex gap-3">
                    <span
                      aria-hidden
                      className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#0066cc] text-xs font-bold text-white"
                    >
                      {butir.nomor}
                    </span>
                    <span className="text-base font-semibold leading-snug text-[#111827]">
                      {butir.pertanyaan}
                    </span>
                  </span>
                  {butir.petunjuk && (
                    <span className="mt-2 block pl-10 text-xs text-[#6b7280]">{butir.petunjuk}</span>
                  )}
                </label>

                {butir.tipe === "isian" ? (
                  <input
                    className="input mt-3 w-full text-sm"
                    disabled={terkunci}
                    id={inputId}
                    onChange={(e) => ubah(butir.id, e.target.value)}
                    placeholder="Tulis jawabanmu"
                    value={jawaban[butir.id] ?? ""}
                  />
                ) : (
                  <textarea
                    className="input mt-3 w-full text-sm"
                    disabled={terkunci}
                    id={inputId}
                    onChange={(e) => ubah(butir.id, e.target.value)}
                    placeholder="Tulis jawaban dan langkah pengerjaanmu di sini"
                    rows={5}
                    value={jawaban[butir.id] ?? ""}
                  />
                )}
              </Card>
            </li>
          );
        })}
      </ol>

      {!terkunci && (
        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-t-2xl border-t border-[#e0e0e0] bg-white/95 p-4 backdrop-blur">
          <p aria-live="polite" className="text-xs text-[#6b7280]">
            {statusSimpan === "menyimpan" && (
              <span className="flex items-center gap-1.5">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Menyimpan...
              </span>
            )}
            {statusSimpan === "tersimpan" && (
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Cloud className="h-3.5 w-3.5" aria-hidden />
                Tersimpan otomatis
              </span>
            )}
            {statusSimpan === "gagal" && (
              <span className="flex items-center gap-1.5 text-red-600">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                {pesanGagal ?? "Gagal menyimpan"}
              </span>
            )}
            {statusSimpan === "bersih" && "Jawabanmu tersimpan otomatis saat kamu mengetik."}
          </p>

          <Button disabled={progres.terisi === 0} onClick={() => setKonfirmasiKirim(true)}>
            <Send className="h-4 w-4" aria-hidden />
            Kumpulkan ke Guru
          </Button>
        </div>
      )}

      <ConfirmModal
        isOpen={konfirmasiKirim}
        title="Kumpulkan LKPD sekarang?"
        description={
          progres.terisi < progres.total
            ? `Masih ada ${progres.total - progres.terisi} soal yang kosong. Setelah dikumpulkan, jawaban tidak bisa diubah lagi.`
            : "Semua soal sudah terisi. Setelah dikumpulkan, jawaban tidak bisa diubah lagi."
        }
        confirmText={mengirim ? "Mengirim..." : "Ya, Kumpulkan"}
        onConfirm={kirim}
        onCancel={() => setKonfirmasiKirim(false)}
      />
    </div>
  );
}
