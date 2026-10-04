"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  AlertCircle,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Cloud,
  FileText,
  GraduationCap,
  HelpCircle,
  Loader2,
  PenLine,
  Send,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { EquationField } from "@/components/ui/EquationField";
import { hitungTerisi } from "@/lib/lkpd-items";
import { simpanPengisianLkpd, type LkpdSiswa } from "@/lib/student-lkpd";
import { splitLkpdContent, sanitizeMathMarkdown } from "@/lib/lkpd-utils";
import { KESIAPAN_BELAJAR_LABELS } from "@/types";

type StatusSimpan = "bersih" | "menyimpan" | "tersimpan" | "gagal";

function safeUrl(url: string): string {
  const value = url.trim();
  if (/^(https?:|mailto:|tel:)/i.test(value) || value.startsWith("/") || value.startsWith("#")) return value;
  return "";
}

export function LkpdWorksheet({ lkpd, onKirim }: { lkpd: LkpdSiswa; onKirim: () => void }) {
  const terkunci = lkpd.pengisian?.status === "terkirim" || lkpd.pengisian?.status === "dinilai";
  const [jawaban, setJawaban] = useState<Record<string, string>>(lkpd.pengisian?.jawaban ?? {});
  const [statusSimpan, setStatusSimpan] = useState<StatusSimpan>("bersih");
  const [pesanGagal, setPesanGagal] = useState<string | null>(null);
  const [konfirmasiKirim, setKonfirmasiKirim] = useState(false);
  const [mengirim, setMengirim] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progres = useMemo(() => hitungTerisi(lkpd.butir, jawaban), [lkpd.butir, jawaban]);

  // Pisahkan konten siswa murni dari kunci jawaban guru
  const studentKonten = useMemo(() => {
    if (!lkpd.konten) return "";
    return splitLkpdContent(lkpd.konten).studentContent || lkpd.konten;
  }, [lkpd.konten]);

  // Ambil pengantar LKPD (bagian sebelum Aktivitas 1 jika ada)
  const kontenPengantar = useMemo(() => {
    if (!studentKonten) return "";
    const splitIndex = studentKonten.search(/###\s*(Aktivitas|Kegiatan|Latihan|Soal|Kasus|Tugas)\s*1/i);
    if (splitIndex !== -1) {
      return studentKonten.slice(0, splitIndex).trim();
    }
    // Jika tidak ada heading aktivitas bernomor, cek seksi kegiatan
    const kegiatanIndex = studentKonten.search(/##\s*[D-F]\.?\s*Kegiatan/i);
    if (kegiatanIndex !== -1) {
      return studentKonten.slice(0, kegiatanIndex).trim();
    }
    return "";
  }, [studentKonten]);

  // Simpan otomatis 1,5 detik setelah siswa berhenti mengetik
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

  const labelLevel =
    KESIAPAN_BELAJAR_LABELS[lkpd.level as keyof typeof KESIAPAN_BELAJAR_LABELS]?.kategori ||
    lkpd.level;

  return (
    <div className="mx-auto max-w-4xl pb-32">
      {/* Bar Navigasi Atas */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 hover:underline"
          href="/lkpd-saya"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Kembali ke daftar LKPD
        </Link>

        {/* Indikator Status Simpan */}
        <div className="flex items-center gap-2 text-xs">
          {statusSimpan === "menyimpan" && (
            <span className="flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
              Menyimpan...
            </span>
          )}
          {statusSimpan === "tersimpan" && (
            <span className="flex items-center gap-1.5 font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <Cloud className="h-3 w-3" aria-hidden />
              Tersimpan otomatis
            </span>
          )}
          {statusSimpan === "gagal" && (
            <span className="flex items-center gap-1.5 font-medium text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
              <AlertCircle className="h-3 w-3" aria-hidden />
              {pesanGagal ?? "Gagal menyimpan"}
            </span>
          )}
        </div>
      </div>

      {/* Progress Bar Pengerjaan */}
      {!terkunci && (
        <div className="mb-6 rounded-xl bg-white p-3.5 border border-slate-200/80 shadow-2xs">
          <ProgressBar
            value={progres.persen}
            label={`${progres.terisi} dari ${progres.total} aktivitas sudah kamu selesaikan (${progres.persen}%)`}
          />
        </div>
      )}

      {/* ========================================================
          LEMBAR KERJA PESERTA DIDIK DIGITAL (KERTAS KERJA UTUH)
          Konsep: Seperti lembar kerja cetak yang langsung diisi pulpen oleh siswa
          ======================================================== */}
      <main className="rounded-2xl border-2 border-slate-200/90 bg-white shadow-xl overflow-hidden">
        {/* KOP FORMAL LKPD */}
        <header className="border-b-2 border-slate-800/80 bg-slate-50/60 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-300 pb-5">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-700 text-white font-black shadow-xs">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
                  Kurikulum Merdeka · Fase D (Kelas VII)
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
                  LEMBAR KERJA PESERTA DIDIK (LKPD)
                </h1>
                <p className="text-xs font-semibold text-blue-700">Mata Pelajaran Matematika</p>
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block rounded-lg bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800 border border-blue-200">
                {labelLevel}
              </span>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Materi: {lkpd.materi}</p>
            </div>
          </div>

          {/* Kotak Identitas Siswa & Kelompok */}
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs text-slate-700 shadow-2xs">
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Judul Kegiatan:</span>
              <span className="font-semibold text-slate-900 block truncate">{lkpd.judul}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Nama Kelompok:</span>
              {terkunci ? (
                <span className="font-semibold text-slate-800">{jawaban["identitas_kelompok"] || "-"}</span>
              ) : (
                <input
                  type="text"
                  value={jawaban["identitas_kelompok"] ?? ""}
                  onChange={(e) => ubah("identitas_kelompok", e.target.value)}
                  placeholder="Contoh: Kelompok 1 (Al-Khawarizmi)"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
              )}
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Anggota Kelompok / Siswa:</span>
              {terkunci ? (
                <span className="font-semibold text-slate-800">{jawaban["identitas_anggota"] || "-"}</span>
              ) : (
                <input
                  type="text"
                  value={jawaban["identitas_anggota"] ?? ""}
                  onChange={(e) => ubah("identitas_anggota", e.target.value)}
                  placeholder="Contoh: Aisyah, Budi, Citra, Dadan"
                  className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-xs font-medium focus:border-blue-500 focus:outline-hidden"
                />
              )}
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase text-slate-400">Status Tugas:</span>
              <span className={`font-bold mt-1 inline-block ${terkunci ? "text-emerald-700" : "text-amber-700"}`}>
                {lkpd.pengisian?.status === "dinilai"
                  ? `Sudah Dinilai (${lkpd.pengisian.nilai}/100)`
                  : lkpd.pengisian?.status === "terkirim"
                  ? "Sudah Dikumpulkan"
                  : "Sedang Dikerjakan"}
              </span>
            </div>
          </div>

          {/* Notifikasi Nilai & Catatan Guru */}
          {lkpd.pengisian?.status === "dinilai" && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/90 p-4">
              <p className="flex items-center gap-2 font-bold text-emerald-900">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" aria-hidden />
                Sudah dinilai oleh gurumu
                {lkpd.pengisian.nilai !== null && <span>· Nilai: {lkpd.pengisian.nilai} / 100</span>}
              </p>
              {lkpd.pengisian.catatanGuru && (
                <p className="mt-2 text-xs leading-relaxed text-emerald-950 bg-white/70 p-3 rounded-lg border border-emerald-200">
                  <strong>Catatan Evaluasi Guru:</strong> {lkpd.pengisian.catatanGuru}
                </p>
              )}
            </div>
          )}

          {lkpd.pengisian?.status === "terkirim" && (
            <p className="mt-4 rounded-xl border border-blue-200 bg-blue-50/90 p-3.5 text-xs font-bold text-blue-900">
              Lembar kerja ini sudah kamu kumpulkan ke guru. Kamu dapat meninjau langkah penyelesaianmu di bawah ini.
            </p>
          )}
        </header>

        {/* BADAN LEMBAR KERJA */}
        <div className="p-6 sm:p-8 space-y-8">
          {/* 1. Pengantar / Tujuan & Petunjuk (jika ada pada konten LKPD) */}
          {kontenPengantar && (
            <section className="rounded-xl border border-slate-200/80 bg-slate-50/40 p-5">
              <div className="flex items-center gap-2 border-b border-slate-200 pb-2.5 mb-3">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  A. Petunjuk & Informasi Pembelajaran
                </h2>
              </div>
              <div className="lkpd-markdown text-sm">
                <ReactMarkdown
                  skipHtml
                  urlTransform={safeUrl}
                  remarkPlugins={[remarkGfm, remarkMath]}
                  rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
                >
                  {sanitizeMathMarkdown(kontenPengantar)}
                </ReactMarkdown>
              </div>
            </section>
          )}

          {/* 2. BUTIR AKTIVITAS & KOLOM PENGERJAAN IN-PLACE (Kertas Ditimpa Isian Siswa) */}
          <section className="space-y-8">
            <div className="flex items-center justify-between border-b-2 border-slate-800 pb-2">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-700" />
                B. Aktivitas Pembelajaran & Lembar Pengerjaan
              </h2>
              <span className="text-[11px] font-semibold text-slate-500">
                Total {lkpd.butir.length} Aktivitas
              </span>
            </div>

            {lkpd.butir.map((butir, index) => {
              const textVal = jawaban[butir.id] ?? "";
              const sudahTerisi = textVal.trim().length > 0;

              return (
                <article
                  key={butir.id}
                  className="rounded-xl border border-slate-300 bg-white overflow-hidden shadow-2xs"
                >
                  {/* Header Bar Aktivitas */}
                  <div className="flex items-center justify-between bg-slate-100/90 border-b border-slate-200 px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="grid h-6 w-6 place-items-center rounded-md bg-blue-700 text-xs font-black text-white">
                        {index + 1}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{butir.pertanyaan}</h3>
                    </div>
                    {sudahTerisi ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-bold text-emerald-800">
                        <CheckCircle2 className="h-3 w-3" /> Terisi
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                        Belum Diisi
                      </span>
                    )}
                  </div>

                  {/* Konten Stimulus Soal / Cerita / Tabel Data (Dirender KaTeX & GFM Cantik) */}
                  {butir.petunjuk && (
                    <div className="p-4 sm:p-5 bg-slate-50/30 border-b border-slate-200">
                      <div className="lkpd-markdown text-sm">
                        <ReactMarkdown
                          skipHtml
                          urlTransform={safeUrl}
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
                        >
                          {sanitizeMathMarkdown(butir.petunjuk)}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}

                  {/* ========================================================
                      KOLOM PENGERJAAN SUB-PERTANYAAN (EQUATION FIELD MATHLIVE)
                      Setiap sub-pertanyaan (a, b, c) memiliki kotak equation tersendiri
                      ======================================================== */}
                  <div className="p-4 sm:p-5 bg-white space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                      <label className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                        <PenLine className="h-3.5 w-3.5 text-blue-600" />
                        <span>Lembar Pengerjaan Sub-Pertanyaan:</span>
                      </label>
                      <span className="text-[11px] text-slate-500">
                        {butir.subItems && butir.subItems.length > 0
                          ? `Tuliskan rumus atau jawaban pada masing-masing butir (${butir.subItems.length} sub-soal)`
                          : "Gunakan tombol rumus (pecahan, kuadrat, akar) di bawah ini"}
                      </span>
                    </div>

                    {butir.subItems && butir.subItems.length > 0 ? (
                      <div className="space-y-4">
                        {butir.subItems.map((sub, sIdx) => {
                          const subVal =
                            jawaban[sub.id] ??
                            (sIdx === 0 && butir.subItems.length === 1 ? (jawaban[butir.id] ?? "") : "");
                          const subTerisi = subVal.trim().length > 0;

                          return (
                            <div
                              key={sub.id}
                              className={`rounded-xl border p-3.5 sm:p-4 transition-all ${
                                subTerisi
                                  ? "border-emerald-300/80 bg-emerald-50/15"
                                  : "border-slate-200 bg-slate-50/40 hover:border-blue-300"
                              }`}
                            >
                              <div className="mb-2.5 flex items-start justify-between gap-3">
                                <div className="flex items-start gap-2.5">
                                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-blue-700 text-xs font-black text-white shadow-2xs">
                                    {sub.kode}
                                  </span>
                                  <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                                    {sub.pertanyaan}
                                  </p>
                                </div>
                                {subTerisi ? (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 shrink-0">
                                    <CheckCircle2 className="h-3 w-3" /> Terisi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-600 shrink-0">
                                    Belum Diisi
                                  </span>
                                )}
                              </div>

                              <EquationField
                                value={subVal}
                                onChange={(val) => ubah(sub.id, val)}
                                placeholder={`Tuliskan rumus atau jawaban untuk pertanyaan ${sub.kode}...`}
                                disabled={terkunci}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <EquationField
                        value={textVal}
                        onChange={(val) => ubah(butir.id, val)}
                        placeholder="Klik di sini untuk menulis langkah penyelesaian matematika..."
                        disabled={terkunci}
                      />
                    )}
                  </div>
                </article>
              );
            })}
          </section>

          {/* 3. Penutup & Refleksi Lembar Kerja */}
          <section className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-4 text-xs text-blue-950">
            <h4 className="font-bold flex items-center gap-1.5 text-blue-900 mb-1">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Petunjuk Pengumpulan Tugas:
            </h4>
            <p className="leading-relaxed">
              Pastikan seluruh langkah penyelesaian dan jawaban matematika pada tiap aktivitas di atas telah
              terisi dengan benar. Setelah kamu menekan tombol <strong>Kumpulkan ke Guru</strong>, lembar kerjamu
              akan dikunci dan diteruskan ke guru untuk evaluasi dan penilaian.
            </p>
          </section>
        </div>

        {/* FOOTER AKSI LEMBAR KERJA */}
        <footer className="border-t-2 border-slate-200 bg-slate-50/80 p-5 sm:p-6 flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Status Pengerjaan: {progres.terisi} dari {progres.total} aktivitas selesai ({progres.persen}%)
            </p>
            <p className="text-[11px] text-slate-500">
              {terkunci
                ? "Lembar kerja telah dikumpulkan."
                : "Semua isian tersimpan otomatis di perangkatmu."}
            </p>
          </div>

          {!terkunci && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                disabled={progres.terisi === 0 || mengirim}
                onClick={() => setKonfirmasiKirim(true)}
                className="gap-2 px-5 py-2.5 text-sm font-bold shadow-md cursor-pointer"
              >
                <Send className="h-4 w-4" aria-hidden />
                <span>{mengirim ? "Mengirim..." : "Kumpulkan ke Guru"}</span>
              </Button>
            </div>
          )}
        </footer>
      </main>

      {/* Modal Konfirmasi Pengumpulan */}
      <ConfirmModal
        isOpen={konfirmasiKirim}
        title="Kumpulkan Lembar Kerja Peserta Didik?"
        description={
          progres.terisi < progres.total
            ? `Masih ada ${progres.total - progres.terisi} aktivitas yang belum terisi. Yakin ingin mengumpulkan sekarang? Jawaban tidak dapat diubah lagi setelah dikirim.`
            : "Semua aktivitas pembelajaran telah selesai kamu kerjakan. Setelah dikumpulkan, lembar kerja akan langsung diserahkan kepada guru untuk dinilai."
        }
        confirmText={mengirim ? "Mengirim..." : "Ya, Kumpulkan Sekarang"}
        onConfirm={kirim}
        onCancel={() => setKonfirmasiKirim(false)}
      />
    </div>
  );
}
