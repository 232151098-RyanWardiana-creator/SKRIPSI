"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { INDIKATOR_KOMPETENSI } from "@/constants/indikator";
import type { Indikator } from "@/types";
import { Brain, Check, Loader2, Plus, RefreshCw, Sparkles, Tag, Trash2 } from "lucide-react";

type Difficulty = "mudah" | "sedang" | "sulit";
export type SoalDraft = { id: number; pertanyaan: string; indikator: Indikator; pilihan: string[]; benar: number; pembahasan: string; diagram?: string; tingkat: Difficulty };
export interface AsesmenDraft { judul: string; materi: string; durasi: number; soal: SoalDraft[]; kuesionerAktif: boolean }
type AIQuestion = { pertanyaan:string; indikator_id:Indikator; pilihan:{A:string;B:string;C:string;D:string}; jawaban_benar:"A"|"B"|"C"|"D"; pembahasan:string; diagram?:string; tingkat_kesulitan:Difficulty };

export const DEFAULT_SOAL: SoalDraft[] = [
  { id: 1, pertanyaan: "Bilangan yang terletak 4 langkah di sebelah kiri nol pada garis bilangan adalah ...", indikator: "IK-01", pilihan: ["−4", "−3", "3", "4"], benar: 0, pembahasan: "Empat langkah ke kiri dari nol menunjukkan bilangan −4.", tingkat: "mudah" },
  { id: 2, pertanyaan: "Urutan bilangan −5, 2, −1, dan 4 dari yang terkecil adalah ...", indikator: "IK-02", pilihan: ["−5, −1, 2, 4", "−1, −5, 2, 4", "4, 2, −1, −5", "−5, 2, −1, 4"], benar: 0, pembahasan: "Pada garis bilangan, −5 berada paling kiri, kemudian −1, 2, dan 4.", tingkat: "mudah" },
  { id: 3, pertanyaan: "Hasil dari −8 + 13 adalah ...", indikator: "IK-03", pilihan: ["−21", "−5", "5", "21"], benar: 2, pembahasan: "Bergerak 13 langkah ke kanan dari −8 menghasilkan 5.", tingkat: "sedang" },
  { id: 4, pertanyaan: "Hasil dari (−6) × 4 adalah ...", indikator: "IK-04", pilihan: ["−24", "−10", "10", "24"], benar: 0, pembahasan: "Bilangan negatif dikalikan bilangan positif menghasilkan bilangan negatif: 6 × 4 = 24, jadi hasilnya −24.", tingkat: "sedang" },
  { id: 5, pertanyaan: "Suhu awal sebuah kota −3°C. Suhu naik 7°C lalu turun 5°C. Suhu akhirnya adalah ...", indikator: "IK-05", pilihan: ["−15°C", "−1°C", "1°C", "9°C"], benar: 1, pembahasan: "Suhu akhir = −3 + 7 − 5 = −1°C.", tingkat: "sulit" },
];

const STORAGE_KEY = "lkpd_draft_asesmen_builder";

interface SoalBuilderProps { onDraftChange?: (draft: AsesmenDraft) => void }

export function SoalBuilder({ onDraftChange }: SoalBuilderProps) {
  const [judul, setJudul] = useState("Diagnostik Rasio dan Perbandingan");
  const [durasi, setDurasi] = useState(30);
  const [soal, setSoal] = useState<SoalDraft[]>([]);
  const [kuesionerAktif, setKuesionerAktif] = useState(true);
  const [materi, setMateri] = useState("Rasio (Perbandingan)");
  const [indikator, setIndikator] = useState<Indikator>("IK-03");
  const [jumlah, setJumlah] = useState(3);
  const [tingkat, setTingkat] = useState<Difficulty>("sedang");
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState("");
  const [saved, setSaved] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

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
        if (typeof data.indikator === "string") setIndikator(data.indikator as Indikator);
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
    setJudul("Diagnostik Bilangan Bulat");
    setDurasi(30);
    setSoal([]);
    setKuesionerAktif(true);
    setMateri("Operasi Bilangan Bulat");
    setIndikator("IK-03");
    setAiMessage("");
    setResetOpen(false);
  }

  const useDefaultQuestions = () => setSoal(DEFAULT_SOAL.map(item => ({ ...item, pilihan: [...item.pilihan] })));

  async function generate() {
    setLoading(true);
    setAiMessage("");
    try {
      const response = await fetch("/api/ai/generate-soal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ materi, indikator, jumlah, tingkat })
      });
      const payload = await response.json() as { questions?: AIQuestion[]; source?: string; model?: string; fallback?: boolean; error?: string | null };
      if (!response.ok || !payload.questions?.length) throw new Error(payload.error || "AI belum menghasilkan soal yang valid.");
      const stamp = Date.now();
      const generated = payload.questions.map((item, index) => ({
        id: stamp + index,
        pertanyaan: item.pertanyaan,
        indikator: item.indikator_id,
        pilihan: [item.pilihan.A, item.pilihan.B, item.pilihan.C, item.pilihan.D],
        benar: "ABCD".indexOf(item.jawaban_benar) as number,
        pembahasan: item.pembahasan,
        diagram: item.diagram,
        tingkat: item.tingkat_kesulitan
      }));
      setSoal(list => {
        const nextSoal = [...list, ...generated];
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ judul, durasi, soal: nextSoal, kuesionerAktif, materi, indikator, tingkat }));
        return nextSoal;
      });
      setAiMessage(`${payload.questions.length} butir soal ditambahkan · ${payload.fallback ? "Fallback lokal" : `9Router (${payload.model})`}`);
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
          <div className="mt-5 border-t pt-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Brain className="h-4 w-4 text-[#0066cc]" />Aktifkan kuesioner VAK
                </p>
                <p className="mt-1 text-xs text-[#6b7280]">5 pertanyaan preferensi belajar (2 menit).</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={kuesionerAktif}
                onClick={() => setKuesionerAktif(v => !v)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${kuesionerAktif ? "bg-[#0066cc]" : "bg-[#9ca3af]"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-all ${kuesionerAktif ? "left-6" : "left-1"}`} />
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
              <h2 className="text-xl font-semibold">Daftar Butir Soal</h2>
              <p className="text-sm text-[#7a7a7a]">Pilihan ganda diagnostik kemampuan awal matematika SMP VII</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={manual}><Plus className="h-4 w-4" />Tambah Manual</Button>
              <Button variant="secondary" disabled={loading || !materi.trim()} onClick={generate}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}Buat Soal dengan AI
              </Button>
            </div>
          </div>

          <div className="mt-4 grid gap-3 rounded-xl bg-blue-50/80 p-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-semibold">
              Materi
              <input className="input mt-1" value={materi} onChange={e => setMateri(e.target.value)} />
            </label>
            <label className="text-sm font-semibold">
              Indikator Fokus
              <select className="input mt-1" value={indikator} onChange={e => setIndikator(e.target.value as Indikator)}>
                {Object.keys(INDIKATOR_KOMPETENSI).map(key => <option key={key}>{key}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold">
              Jumlah
              <input className="input mt-1" type="number" min="1" max="10" value={jumlah} onChange={e => setJumlah(Math.min(10, Math.max(1, Number(e.target.value))))} />
            </label>
            <label className="text-sm font-semibold">
              Tingkat Kesulitan
              <select className="input mt-1" value={tingkat} onChange={e => setTingkat(e.target.value as Difficulty)}>
                <option value="mudah">Mudah</option>
                <option value="sedang">Sedang</option>
                <option value="sulit">Sulit</option>
              </select>
            </label>
          </div>
          {aiMessage && <p role="status" className="mt-3 text-sm font-medium text-[#0066cc]">{aiMessage}</p>}
        </div>

        <div className="space-y-5">
          {soal.length === 0 && (
            <div className="rounded-2xl border-2 border-dashed border-[#b8c6d9] px-6 py-12 text-center">
              <p className="font-semibold">Belum ada butir soal asesmen.</p>
              <p className="mt-2 text-sm text-slate-500">Tambahkan soal manual, gunakan simulasi, atau buat soal otomatis dengan AI.</p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <Button onClick={manual}><Plus className="h-4 w-4" />+ Tambah Soal Manual</Button>
                <Button variant="secondary" disabled={loading || !materi.trim()} onClick={generate}><Sparkles className="h-4 w-4" />Buat Soal dengan AI</Button>
                <Button variant="ghost" onClick={useDefaultQuestions}>Muat 5 Contoh Soal</Button>
              </div>
            </div>
          )}
          {soal.map((item, index) => (
            <article className="rounded-[18px] border border-[#e0e0e0] p-5 shadow-xs transition-all hover:border-[#0066cc]/40" key={item.id}>
              <div className="mb-4 flex items-center justify-between">
                <strong className="text-base">Soal {index + 1}</strong>
                <button
                  className="inline-flex items-center gap-1 text-sm font-medium text-red-600 hover:text-red-700"
                  onClick={() => setSoal(list => list.filter(s => s.id !== item.id))}
                  type="button"
                >
                  <Trash2 className="h-4 w-4" />Hapus
                </button>
              </div>
              <textarea
                className="input min-h-24 font-medium"
                aria-label={`Pertanyaan soal ${index + 1}`}
                value={item.pertanyaan}
                onChange={e => update(item.id, "pertanyaan", e.target.value)}
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <label className="text-sm font-semibold">
                  <Tag className="mr-1 inline h-4 w-4 text-[#0066cc]" />Indikator
                  <select className="input mt-2" value={item.indikator} onChange={e => update(item.id, "indikator", e.target.value as Indikator)}>
                    {Object.entries(INDIKATOR_KOMPETENSI).map(([key, value]) => (
                      <option key={key} value={key}>{key} — {value}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-semibold">
                  Tingkat Kesulitan
                  <select className="input mt-2" value={item.tingkat} onChange={e => update(item.id, "tingkat", e.target.value as Difficulty)}>
                    <option value="mudah">Mudah</option>
                    <option value="sedang">Sedang</option>
                    <option value="sulit">Sulit</option>
                  </select>
                </label>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {item.pilihan.map((choice, pi) => (
                  <label className="flex items-center gap-2" key={pi}>
                    <input
                      checked={item.benar === pi}
                      name={`benar-${item.id}`}
                      onChange={() => update(item.id, "benar", pi)}
                      type="radio"
                      className="h-4 w-4 accent-[#0066cc]"
                    />
                    <input
                      className="input"
                      placeholder={`Pilihan ${String.fromCharCode(65 + pi)}`}
                      aria-label={`Pilihan ${String.fromCharCode(65 + pi)} soal ${index + 1}`}
                      value={choice}
                      onChange={e => {
                        const next = [...item.pilihan];
                        next[pi] = e.target.value;
                        update(item.id, "pilihan", next);
                      }}
                    />
                  </label>
                ))}
              </div>
              <label className="label">
                Pembahasan / Kunci Alur Berpikir
                <textarea className="input min-h-20" value={item.pembahasan} onChange={e => update(item.id, "pembahasan", e.target.value)} />
              </label>
              <label className="label">
                Diagram ASCII / Garis Bilangan (opsional)
                <textarea className="input min-h-20 font-mono text-sm" value={item.diagram || ""} onChange={e => update(item.id, "diagram", e.target.value)} />
              </label>
            </article>
          ))}
        </div>
      </section>
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
