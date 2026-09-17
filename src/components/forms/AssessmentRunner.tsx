"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { fetchAsesmenSiswa, type AsesmenSiswa, type HasilSiswa } from "@/lib/student-assessments";
import type { AnswerKey, IndicatorResult } from "@/types";
import { ArrowLeft, ArrowRight, Clock, LayoutGrid, X, CheckCircle2 } from "lucide-react";

interface HasilAkhir {
  skor: number;
  level: string;
  detail: Record<string, IndicatorResult>;
}

export function AssessmentRunner({
  asesmenId,
  kuesionerAktif = true,
}: {
  asesmenId: string;
  kuesionerAktif?: boolean;
}) {
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);
  const [asesmen, setAsesmen] = useState<AsesmenSiswa | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>({});
  const [confirming, setConfirming] = useState(false);
  const [showPalette, setShowPalette] = useState(false);
  const [hasil, setHasil] = useState<HasilAkhir | null>(null);
  const [deadline, setDeadline] = useState<number | null>(null);
  const submitted = useRef(false);

  useEffect(() => {
    void (async () => {
      const data = await fetchAsesmenSiswa();
      if (!data) return setPesan("Kamu belum masuk. Masuk dulu dari dashboard siswa."), setMemuat(false);
      const target = data.asesmen.find((item) => item.id === asesmenId);
      if (!target) return setPesan("Asesmen tidak ada di kelasmu."), setMemuat(false);
      if (target.status !== "aktif") return setPesan("Asesmen ini belum dibuka atau sudah ditutup."), setMemuat(false);
      if (!target.soal.length) return setPesan("Asesmen ini belum memiliki soal."), setMemuat(false);

      const milik: HasilSiswa | undefined = data.hasilSaya.find((item) => item.asesmen_id === asesmenId);
      if (milik?.selesai) {
        setHasil({ skor: Number(milik.skor_total), level: milik.level, detail: milik.detail_per_indikator ?? {} });
      } else if (milik?.jawaban) {
        setAnswers(milik.jawaban);
      }
      setAsesmen(target);
      // Waktu dihitung dari saat halaman dibuka; ponytail: batas waktu belum
      // dijaga server, tambahkan kolom `batas_waktu` bila diperlukan pengawasan ketat.
      setDeadline(Date.now() + Math.max(0, target.durasi_menit) * 60_000);
      setMemuat(false);
    })();
  }, [asesmenId]);

  const kirim = useCallback(
    async (selesai: boolean, jawaban: Record<string, AnswerKey>) => {
      const res = await fetch(`/api/siswa/asesmen/${encodeURIComponent(asesmenId)}/jawaban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jawaban, selesai }),
      });
      return res.ok ? ((await res.json()) as { skor?: number; level?: string; detail?: Record<string, IndicatorResult> }) : null;
    },
    [asesmenId]
  );

  // Simpan progres (draft) setiap jawaban berubah.
  useEffect(() => {
    if (!asesmen || hasil || submitted.current || !Object.keys(answers).length) return;
    void kirim(false, answers);
  }, [answers, asesmen, hasil, kirim]);

  const submit = useCallback(async () => {
    if (!asesmen || submitted.current) return;
    submitted.current = true;
    const data = await kirim(true, answers);
    setConfirming(false);
    if (data && typeof data.skor === "number") {
      setHasil({ skor: data.skor, level: data.level ?? "dasar", detail: data.detail ?? {} });
    } else {
      submitted.current = false;
      setPesan("Gagal mengumpulkan jawaban. Periksa koneksi lalu coba lagi.");
    }
  }, [answers, asesmen, kirim]);

  if (memuat) return <StateMessage text="Sedang memuat asesmen…" title="Mohon tunggu" />;
  if (pesan && !asesmen) return <StateMessage text={pesan} title="Tidak dapat mengerjakan" />;
  if (!asesmen) return <StateMessage text="Asesmen tidak tersedia." title="Asesmen tidak ditemukan" />;

  if (hasil) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <section className="card text-center">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Asesmen Selesai</p>
          <h1 className="mt-3 text-3xl font-semibold">
            Skor {hasil.skor} · Level {hasil.level}
          </h1>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
            {Object.entries(hasil.detail).map(([key, value]) => (
              <div className="rounded-xl bg-[#f2f3fc] p-3" key={key}>
                <b>{key}</b>
                <div>
                  {value.benar}/{value.total}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            {kuesionerAktif ? (
              <Button href={`/asesmen/kerjakan/${encodeURIComponent(asesmenId)}/gaya-belajar`}>
                Lanjut: Kenali Gaya Belajarmu
              </Button>
            ) : (
              <Button href="/dashboard-siswa">Ke Dashboard</Button>
            )}
          </div>
        </section>
      </div>
    );
  }

  const question = asesmen.soal[current];
  const terjawab = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-slate-50/50 pb-16">
      {/* Top Bar Ringkas ala CAT / CBT */}
      <div className="sticky top-0 z-30 border-b border-slate-200/90 bg-white/95 backdrop-blur px-3 sm:px-5 py-2.5 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-2">
          {/* Nomor Soal & Progres */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPalette(true)}
              className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1 text-xs font-bold text-blue-700 hover:bg-blue-100 transition-all md:hidden cursor-pointer"
              type="button"
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Soal {current + 1}/{asesmen.soal.length}</span>
            </button>
            <div className="hidden md:flex flex-col">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Soal {current + 1} dari {asesmen.soal.length}
              </span>
              <span className="text-xs font-semibold text-slate-700">
                Terjawab {terjawab}/{asesmen.soal.length}
              </span>
            </div>
          </div>

          {/* Timer Pill */}
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50/90 px-3 py-1 text-xs font-bold text-amber-900 shadow-2xs">
            <Clock className="h-3.5 w-3.5 text-amber-600 shrink-0" />
            <span className="hidden sm:inline">Sisa Waktu:</span>
            {deadline && <Timer deadline={deadline} onExpire={() => void submit()} />}
          </div>

          {/* Tombol Selesai */}
          <button
            className="rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-1 text-xs font-bold text-rose-700 hover:bg-rose-100 transition-all cursor-pointer"
            onClick={() => setConfirming(true)}
            type="button"
          >
            Selesai
          </button>
        </div>

        {/* Progress Bar Tipis */}
        <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-slate-100">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300"
            style={{ width: `${(terjawab / asesmen.soal.length) * 100}%` }}
          />
        </div>
      </div>

      <div className="mx-auto flex max-w-5xl flex-col gap-4 p-3.5 sm:p-5 md:flex-row md:gap-6">
        <main className="min-w-0 flex-1 space-y-3.5">
          {/* Card Soal CAT */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 sm:p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
              <span className="inline-flex items-center rounded-lg bg-blue-100 px-2.5 py-0.5 text-xs font-black text-blue-800 uppercase tracking-wide">
                Soal Nomor {current + 1}
              </span>
              <span className="text-[11px] font-semibold text-slate-400">
                Pilihan Ganda
              </span>
            </div>
            <p className="text-sm sm:text-base font-medium text-slate-900 leading-relaxed text-justify">
              {question.pertanyaan}
            </p>
          </div>

          {/* Pilihan Jawaban (A, B, C, D) Modern & Rapi */}
          <div className="space-y-2 sm:space-y-2.5">
            {Object.entries(question.pilihan).map(([key, choice]) => {
              const isSelected = answers[question.id] === key;
              return (
                <label
                  key={key}
                  onClick={() => setAnswers((value) => ({ ...value, [question.id]: key as AnswerKey }))}
                  className={`flex items-start gap-3 rounded-xl border p-3 sm:p-3.5 transition-all cursor-pointer select-none ${
                    isSelected
                      ? "border-2 border-[#2563EB] bg-blue-50/80 shadow-xs"
                      : "border-slate-200/80 bg-white hover:border-blue-300 hover:bg-slate-50/60"
                  }`}
                >
                  <input
                    type="radio"
                    name={`jawaban-${question.id}`}
                    checked={isSelected}
                    onChange={() => {}}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-black transition-all ${
                      isSelected
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    {key.toUpperCase()}
                  </div>
                  <div className={`text-xs sm:text-sm leading-snug pt-0.5 ${isSelected ? "font-bold text-blue-950" : "font-medium text-slate-800"}`}>
                    {choice}
                  </div>
                </label>
              );
            })}
          </div>

          {/* Navigasi Bawah */}
          <div className="flex items-center justify-between pt-3 gap-2">
            <Button
              disabled={current === 0}
              onClick={() => setCurrent((value) => value - 1)}
              variant="ghost"
              className="text-xs px-3 sm:px-4 py-2 rounded-xl"
            >
              <ArrowLeft className="mr-1 h-3.5 w-3.5" />
              Sebelumnya
            </Button>

            <Button
              onClick={() => setShowPalette(true)}
              variant="secondary"
              className="text-xs px-3 py-2 rounded-xl md:hidden"
              type="button"
            >
              <LayoutGrid className="mr-1 h-3.5 w-3.5" />
              Daftar Soal
            </Button>

            {current < asesmen.soal.length - 1 ? (
              <Button
                onClick={() => setCurrent((value) => value + 1)}
                className="bg-[#2563EB] hover:bg-blue-700 text-white text-xs px-3 sm:px-4 py-2 rounded-xl shadow-xs"
              >
                Selanjutnya
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            ) : (
              <Button
                onClick={() => setConfirming(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-xl shadow-xs"
              >
                Kumpulkan
              </Button>
            )}
          </div>

          {pesan && (
            <p className="mt-4 text-xs font-semibold text-rose-700" role="alert">
              {pesan}
            </p>
          )}
        </main>

        {/* Desktop Sidebar: Navigasi Nomor */}
        <aside className="hidden md:block w-64 shrink-0">
          <div className="rounded-2xl border border-slate-200/90 bg-white p-4 shadow-2xs sticky top-16">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-3">
              <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Navigasi Soal</h2>
              <span className="text-[11px] font-bold text-blue-600">{terjawab}/{asesmen.soal.length}</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {asesmen.soal.map((item, index) => {
                const isCurrent = index === current;
                const isAnswered = Boolean(answers[item.id]);
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrent(index)}
                    className={`h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#2563EB] text-white shadow-xs"
                        : isAnswered
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile Modal / Drawer Daftar Nomor Soal */}
      {showPalette && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 backdrop-blur-xs">
          <div className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-2xl bg-white p-5 shadow-xl animate-in slide-in-from-bottom">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Daftar Nomor Soal</h3>
                <p className="text-xs text-slate-500">Terjawab {terjawab} dari {asesmen.soal.length} soal</p>
              </div>
              <button
                onClick={() => setShowPalette(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
              {asesmen.soal.map((item, index) => {
                const isCurrent = index === current;
                const isAnswered = Boolean(answers[item.id]);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrent(index);
                      setShowPalette(false);
                    }}
                    className={`h-10 rounded-xl text-xs font-black transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-[#2563EB] text-white ring-2 ring-blue-300 shadow-xs"
                        : isAnswered
                          ? "bg-blue-100 text-blue-900 border border-blue-300"
                          : "bg-slate-100 text-slate-600 border border-slate-200/80"
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-blue-100 border border-blue-300 inline-block" /> Terjawab</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-slate-100 border border-slate-200 inline-block" /> Belum</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-[#2563EB] inline-block" /> Aktif</span>
            </div>
          </div>
        </div>
      )}

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-bold text-slate-900">Kumpulkan jawaban?</h2>
            <p className="mt-2 text-xs md:text-sm text-slate-600 leading-relaxed">
              Kamu telah menjawab <b className="text-blue-700">{terjawab}</b> dari <b>{asesmen.soal.length}</b> soal. Jawaban tidak dapat diubah setelah dikumpulkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setConfirming(false)} variant="ghost" className="text-xs rounded-xl">
                Batal
              </Button>
              <Button onClick={() => void submit()} className="bg-[#2563EB] text-white hover:bg-blue-700 text-xs rounded-xl shadow-xs">
                Kumpulkan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StateMessage({ title, text }: { title: string; text: string }) {
  return (
    <div className="mx-auto max-w-xl p-6">
      <section className="card text-center">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-3 text-[#414753]">{text}</p>
        <Button className="mt-6" href="/dashboard-siswa">
          Ke Dashboard
        </Button>
      </section>
    </div>
  );
}
