"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { INDIKATOR_KOMPETENSI } from "@/constants/indikator";
import type { Indikator } from "@/types";
import { Brain, Check, Loader2, Plus, RefreshCw, Sparkles, Tag, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ModalGenerateAI } from "./ModalGenerateAI";

type Difficulty = "mudah" | "sedang" | "sulit";
export type SoalDraft = { id: number; pertanyaan: string; indikator: Indikator; pilihan: string[]; benar: number; pembahasan: string; diagram?: string; tingkat: Difficulty };
export interface AsesmenDraft { judul: string; materi: string; durasi: number; soal: SoalDraft[]; kuesionerAktif: boolean }
type AIQuestion = { pertanyaan:string; indikator_id:Indikator; pilihan:{A:string;B:string;C:string;D:string}; jawaban_benar:"A"|"B"|"C"|"D"; pembahasan:string; diagram?:string; tingkat_kesulitan:Difficulty };

export const DEFAULT_SOAL: SoalDraft[] = [
  {
    id: 1,
    pertanyaan: "Di kelas VII-A terdapat 15 siswa laki-laki dan 20 siswa perempuan. Rasio banyak siswa laki-laki terhadap perempuan adalah ...",
    indikator: "IK-01",
    pilihan: ["4 : 3", "3 : 4", "3 : 7", "15 : 35"],
    benar: 1,
    pembahasan: "Bandingkan 15 : 20. Bagi kedua bilangan dengan FPB (5) sehingga diperoleh 3 : 4.",
    tingkat: "mudah",
  },
  {
    id: 2,
    pertanyaan: "Bentuk paling sederhana dari rasio 24 : 36 adalah ...",
    indikator: "IK-02",
    pilihan: ["2 : 3", "3 : 4", "4 : 6", "6 : 9"],
    benar: 0,
    pembahasan: "FPB dari 24 dan 36 adalah 12. Bagi 24:12 = 2 dan 36:12 = 3, diperoleh 2 : 3.",
    tingkat: "mudah",
  },
  {
    id: 3,
    pertanyaan: "Harga 4 kg apel adalah Rp60.000. Rasio satuan harga per kilogram apel tersebut adalah ...",
    indikator: "IK-03",
    pilihan: ["Rp12.000/kg", "Rp14.000/kg", "Rp15.000/kg", "Rp20.000/kg"],
    benar: 2,
    pembahasan: "Rasio satuan = Rp60.000 : 4 kg = Rp15.000 per kg.",
    tingkat: "sedang",
  },
  {
    id: 4,
    pertanyaan: "Sebuah motor membutuhkan 3 liter bensin untuk 75 km. Dengan perbandingan senilai, jarak tempuh dengan 6 liter bensin adalah ...",
    indikator: "IK-04",
    pilihan: ["120 km", "150 km", "175 km", "200 km"],
    benar: 1,
    pembahasan: "Laju = 75 / 3 = 25 km/liter. Jarak untuk 6 liter = 6 × 25 = 150 km.",
    tingkat: "sedang",
  },
  {
    id: 5,
    pertanyaan: "Pada peta berskala 1 : 250.000, jarak dua kecamatan adalah 6 cm. Jarak sebenarnya adalah ...",
    indikator: "IK-05",
    pilihan: ["15 km", "25 km", "150 km", "250 km"],
    benar: 0,
    pembahasan: "Jarak sebenarnya = 6 cm × 250.000 = 1.500.000 cm = 15 km.",
    tingkat: "sulit",
  },
];

const STORAGE_KEY = "lkpd_draft_asesmen_builder";

interface SoalBuilderProps { onDraftChange?: (draft: AsesmenDraft) => void }

export function SoalBuilder({ onDraftChange }: SoalBuilderProps) {
  const [judul, setJudul] = useState("Diagnostik Rasio dan Perbandingan");
  const [durasi, setDurasi] = useState(30);
  const [soal, setSoal] = useState<SoalDraft[]>([]);
  const [kuesionerAktif, setKuesionerAktif] = useState(true);
  const [materi, setMateri] = useState("Rasio (Perbandingan)");
  const [indikator, setIndikator] = useState<Indikator | "SEMUA">("SEMUA");
  const [jumlah, setJumlah] = useState(3);
  const [tingkat, setTingkat] = useState<Difficulty>("sedang");
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [modalAIOpen, setModalAIOpen] = useState(false);

  // Restore from localStorage
  /* eslint-disable react-hooks/set-state-in-effect -- hydration intentionally restores client persistence */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (typeof data.judul === "string") setJudul(data.judul);
        if (typeof data.durasi === "number") setDurasi(data.durasi);
        if (Array.isArray(data.soal)) setSoal(data.soal);
        if (typeof data.kuesionerAktif === "boolean") setKuesionerAktif(data.kuesionerAktif);
        if (typeof data.materi === "string") setMateri(data.materi);
        if (typeof data.indikator === "string") setIndikator(data.indikator as Indikator | "SEMUA");
        if (typeof data.tingkat === "string") setTingkat(data.tingkat as Difficulty);
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true);
    }
  }, []);

  // Save to localStorage only after restoration has committed.
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ judul, durasi, soal, kuesionerAktif, materi, indikator, tingkat }));
      setSaved(true);
    } catch {
      // ignore
    }
  }, [hydrated, judul, durasi, soal, kuesionerAktif, materi, indikator, tingkat]);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (hydrated) onDraftChange?.({ judul, materi, durasi, soal, kuesionerAktif });
  }, [durasi, hydrated, judul, kuesionerAktif, materi, onDraftChange, soal]);

  const update = (id: number, field: keyof SoalDraft, value: SoalDraft[keyof SoalDraft]) =>
    setSoal(list => list.map(item => item.id === id ? { ...item, [field]: value } : item));

  const distribusi = Object.keys(INDIKATOR_KOMPETENSI).map(key => ({
    key: key as Indikator,
    count: soal.filter(item => item.indikator === key).length
  }));

  const manual = () =>
    setSoal(list => [...list, { id: Date.now(), pertanyaan: "", indikator: "IK-01", pilihan: ["", "", "", ""], benar: 0, pembahasan: "", tingkat: "sedang" }]);

  function resetDraft() {
    localStorage.removeItem(STORAGE_KEY);
    setJudul("Diagnostik Rasio dan Perbandingan");
    setDurasi(30);
    setSoal([]);
    setKuesionerAktif(true);
    setMateri("Rasio (Perbandingan)");
    setIndikator("SEMUA");
    setAiMessage("");
    setResetOpen(false);
  }

  const useDefaultQuestions = () => setSoal(DEFAULT_SOAL.map(item => ({ ...item, pilihan: [...item.pilihan] })));

  async function generateWithConfig(aiConfig: {
    provider: string;
    model: string;
    customApiKey?: string;
    customBaseUrl?: string;
  }) {
    setLoading(true);
    setAiMessage("");
    try {
      const response = await fetch("/api/ai/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          materi,
          indikator,
          jumlah,
          tingkat,
          provider: aiConfig.provider,
          model: aiConfig.model,
          customApiKey: aiConfig.customApiKey,
          customBaseUrl: aiConfig.customBaseUrl,
        }),
      });
      const payload = (await response.json()) as {
        questions?: AIQuestion[];
        source?: string;
        model?: string;
        fallback?: boolean;
        error?: string | null;
      };
      if (!response.ok || !payload.questions?.length)
        throw new Error(payload.error || "AI belum menghasilkan soal yang valid.");
      const stamp = Date.now();
      const generated = payload.questions.map((item, index) => ({
        id: stamp + index,
        pertanyaan: item.pertanyaan,
        indikator: item.indikator_id,
        pilihan: [item.pilihan.A, item.pilihan.B, item.pilihan.C, item.pilihan.D],
        benar: "ABCD".indexOf(item.jawaban_benar) as number,
        pembahasan: item.pembahasan,
        diagram: item.diagram,
        tingkat: item.tingkat_kesulitan,
      }));
      setSoal((list) => {
        const nextSoal = [...list, ...generated];
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({ judul, durasi, soal: nextSoal, kuesionerAktif, materi, indikator, tingkat })
        );
        return nextSoal;
      });
      setModalAIOpen(false);
      setAiMessage(
        `${payload.questions.length} butir soal ditambahkan · ${
          payload.fallback ? "Fallback kontekstual" : `AI (${payload.model || aiConfig.model})`
        }`
      );
    } catch (error) {
      setAiMessage(error instanceof Error ? error.message : "Gagal membuat soal dengan AI.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <aside className="space-y-5">
        <div className="card">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Informasi Asesmen</h2>
            {saved && <span className="flex items-center gap-1 text-xs text-green-700"><Check className="h-3 w-3" />Tersimpan</span>}
          </div>
          <label className="label">
            Nama asesmen
            <input className="input" value={judul} onChange={e => setJudul(e.target.value)} />
          </label>
          <label className="label">
            Durasi (menit)
            <input className="input" type="number" min="5" max="120" value={durasi} onChange={e => setDurasi(Number(e.target.value))} />
          </label>
          <div className="mt-5 border-t border-slate-100 pt-5">
            <div className="flex items-center justify-between gap-4">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <Brain className="h-4 w-4 text-[#2563EB]" />Kuesioner Gaya Belajar
              </p>
              <button
                type="button"
                role="switch"
                aria-checked={kuesionerAktif}
                onClick={() => setKuesionerAktif(v => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors cursor-pointer ${kuesionerAktif ? "bg-[#2563EB]" : "bg-slate-300"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all shadow-xs ${kuesionerAktif ? "left-6" : "left-1"}`} />
              </button>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3 text-sm">
            <span>Total butir soal: <strong>{soal.length}</strong></span>
            <Button variant="ghost" onClick={() => setResetOpen(true)} className="text-xs text-red-600 hover:text-red-700">
              <RefreshCw className="h-3.5 w-3.5" />Reset Draf
            </Button>
          </div>
        </div>

        <div className="card">
          <h2 className="mb-4 font-semibold">Sebaran Indikator Kompetensi</h2>
          {distribusi.map(item => (
            <div className="mb-3" key={item.key}>
              <div className="flex justify-between text-xs">
                <span>{item.key} — {INDIKATOR_KOMPETENSI[item.key].slice(0, 24)}...</span>
                <span className="font-semibold">{soal.length ? Math.round((item.count / soal.length) * 100) : 0}%</span>
              </div>
              <div className="mt-1 h-2 rounded-full bg-[#e6e8f1]">
                <div className="h-full rounded-full bg-[#0066cc] transition-all" style={{ width: `${soal.length ? (item.count / soal.length) * 100 : 0}%` }} />
              </div>
            </div>
          ))}
        </div>
      </aside>

      <section className="card">
        <div className="mb-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#1E1B4B]">Daftar Butir Soal</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={manual}><Plus className="h-4 w-4" />Soal Manual</Button>
              <Button variant="secondary" disabled={loading || !materi.trim()} onClick={() => setModalAIOpen(true)}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}Generate AI
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-2xl bg-blue-50/70 border border-blue-100 p-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.3fr_1.5fr_90px_1.1fr]">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Materi
              <input className="input mt-1 bg-white" value={materi} onChange={e => setMateri(e.target.value)} />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Indikator Fokus
              <select className="input mt-1 bg-white truncate" value={indikator} onChange={e => setIndikator(e.target.value as Indikator | "SEMUA")}>
                <option value="SEMUA">Semua (IK-01–05)</option>
                {Object.keys(INDIKATOR_KOMPETENSI).map(key => <option key={key} value={key}>{key}</option>)}
              </select>
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Jumlah
              <input className="input mt-1 bg-white" type="number" min="1" max="10" value={jumlah} onChange={e => setJumlah(Math.min(10, Math.max(1, Number(e.target.value))))} />
            </label>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Tingkat Kesulitan
              <select className="input mt-1 bg-white" value={tingkat} onChange={e => setTingkat(e.target.value as Difficulty)}>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </label>
          </div>
          {aiMessage && <p role="status" className="mt-3 text-xs font-semibold text-[#2563EB] bg-blue-50/90 border border-blue-100 rounded-xl px-3 py-2">{aiMessage}</p>}
        </div>

        <div className="space-y-4">
          {soal.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-slate-300 px-6 py-12 text-center bg-slate-50/50">
              <p className="font-bold text-slate-800">Belum ada butir soal asesmen.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button onClick={manual}><Plus className="h-4 w-4" />Soal Manual</Button>
                <Button variant="secondary" disabled={loading || !materi.trim()} onClick={() => setModalAIOpen(true)}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}Generate AI
                </Button>
                <Button variant="ghost" onClick={useDefaultQuestions}>5 Contoh Rasio</Button>
              </div>
            </div>
          )}
          {soal.map((item, index) => (
            <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-[#2563EB]/50" key={item.id}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-6 w-6 place-items-center rounded-lg bg-[#2563EB] text-white text-xs font-black">
                    {index + 1}
                  </span>
                  <strong className="text-sm font-black text-[#1E1B4B]">Butir Soal {index + 1}</strong>
                </div>
                <button
                  className="grid h-8 w-8 place-items-center rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 transition-colors cursor-pointer"
                  onClick={() => setSoal(list => list.filter(s => s.id !== item.id))}
                  title="Hapus Butir Soal"
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea
                className="input min-h-20 font-medium text-slate-900"
                aria-label={`Pertanyaan soal ${index + 1}`}
                value={item.pertanyaan}
                onChange={e => update(item.id, "pertanyaan", e.target.value)}
                placeholder="Tuliskan teks pertanyaan di sini..."
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <Tag className="mr-1 inline h-3.5 w-3.5 text-[#2563EB]" />Indikator
                  <select className="input mt-1.5" value={item.indikator} onChange={e => update(item.id, "indikator", e.target.value as Indikator)}>
                    {Object.entries(INDIKATOR_KOMPETENSI).map(([key, value]) => (
                      <option key={key} value={key}>{key} — {value}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tingkat Kesulitan
                  <select className="input mt-1.5" value={item.tingkat} onChange={e => update(item.id, "tingkat", e.target.value as Difficulty)}>
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                {item.pilihan.map((choice, pi) => {
                  const letter = String.fromCharCode(65 + pi);
                  const isCorrect = item.benar === pi;
                  return (
                    <div
                      key={pi}
                      className={cn(
                        "flex items-center gap-2 rounded-xl border p-1.5 transition-all",
                        isCorrect
                          ? "border-[#2563EB] bg-blue-50/60 ring-1 ring-[#2563EB]"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => update(item.id, "benar", pi)}
                        title={`Pilih ${letter} sebagai kunci jawaban benar`}
                        className={cn(
                          "grid h-8 w-8 shrink-0 place-items-center rounded-lg text-xs font-black transition-all cursor-pointer",
                          isCorrect
                            ? "bg-[#2563EB] text-white shadow-xs"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        )}
                      >
                        {letter}
                      </button>
                      <input
                        className="w-full bg-transparent px-2 py-1 text-xs sm:text-sm font-medium text-slate-900 outline-none placeholder:text-slate-400"
                        placeholder={`Pilihan ${letter}`}
                        aria-label={`Pilihan ${letter} soal ${index + 1}`}
                        value={choice}
                        onChange={(e) => {
                          const next = [...item.pilihan];
                          next[pi] = e.target.value;
                          update(item.id, "pilihan", next);
                        }}
                      />
                    </div>
                  );
                })}
              </div>
              <label className="label">
                Pembahasan / Kunci Alur Berpikir
                <textarea className="input min-h-16 text-xs sm:text-sm" value={item.pembahasan} onChange={e => update(item.id, "pembahasan", e.target.value)} placeholder="Tuliskan langkah penyelesaian masalah..." />
              </label>
              <label className="label">
                Catatan / Representasi Visual (Opsional)
                <textarea className="input min-h-16 font-mono text-xs" value={item.diagram || ""} onChange={e => update(item.id, "diagram", e.target.value)} placeholder="Tabel rasio, skala, atau ilustrasi kontekstual..." />
              </label>
            </article>
          ))}
        </div>
      </section>
      <ModalGenerateAI
        isOpen={modalAIOpen}
        onClose={() => setModalAIOpen(false)}
        onGenerate={generateWithConfig}
        loading={loading}
        materi={materi}
        jumlah={jumlah}
        indikator={indikator}
        tingkat={tingkat}
      />
      <ConfirmModal
        isOpen={resetOpen}
        title="Reset draf asesmen?"
        description="Semua perubahan pada draf soal akan dihapus dan Anda akan memulai dari daftar soal kosong."
        confirmText="Reset Draf"
        variant="danger"
        onConfirm={resetDraft}
        onCancel={() => setResetOpen(false)}
      />
    </div>
  );
}
