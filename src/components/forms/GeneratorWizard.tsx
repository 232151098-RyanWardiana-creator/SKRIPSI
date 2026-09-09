"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { GeneratorLogo } from "@/components/ui/GeneratorLogo";
import { LkpdDocument } from "@/components/LkpdDocument";
import { useClassStore } from "@/lib/class-store";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useSubmissionStore } from "@/lib/submission-store";
import type { GayaBelajar, Level } from "@/types";
import { downloadDocx } from "@/lib/docx-client";
import { getStoredHistory, saveHistoryEntry } from "@/lib/lkpd-history";
import { AI_PROVIDERS } from "@/constants/ai-providers";
import { ModalGenerateAI } from "@/components/forms/ModalGenerateAI";
import { splitLkpdContent } from "@/lib/lkpd-utils";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle,
  Copy,
  Download,
  Edit3,
  FileText,
  KeyRound,
  Loader2,
  Printer,
  RefreshCw,
  Sparkles,
  X
} from "lucide-react";

interface GeneratedLKPD {
  level: Level;
  status: "success" | "fallback" | "error";
  content: string;
  source: "online" | "mock";
  model: string;
  isFallback: boolean;
  error: string | null;
}

interface DocumentState extends GeneratedLKPD {
  draft: string;
  editing: boolean;
  validatedAt: string | null;
}

const levels: Level[] = ["dasar", "menengah", "mahir"];
const labels: Record<Level, string> = { dasar: "Dasar", menengah: "Menengah", mahir: "Mahir" };
function isLevel(value: unknown): value is Level {
  return levels.includes(value as Level);
}

function validDocument(value: unknown): value is DocumentState {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<DocumentState>;
  return isLevel(item.level) && typeof item.content === "string" && typeof item.draft === "string" && ["success", "fallback", "error"].includes(item.status || "") && ["online", "mock"].includes(item.source || "") && typeof item.model === "string";
}

const emptyDocuments = (): Record<Level, DocumentState | undefined> => ({
  dasar: undefined,
  menengah: undefined,
  mahir: undefined,
});

function sanitizeFilename(value: string) {
  return value.normalize("NFKD").replace(/[^a-zA-Z0-9\s_-]/g, "").trim().replace(/\s+/g, "-").toLowerCase().slice(0, 80) || "lkpd";
}

export function GeneratorWizard() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const { submissions } = useSubmissionStore();

  const [step, setStep] = useState(0);
  const [selectedClassId, setKelasId] = useState("");
  const [selectedAssessmentId, setAssessmentId] = useState("");
  const [topik, setTopik] = useState("Rasio (Perbandingan)");
  const [jumlah, setJumlah] = useState(4);
  const [gaya, setGaya] = useState("Gunakan konteks resep masakan, denah/skala peta, dan perbandingan harga satuan.");
  const [pertimbangkanGaya, setPertimbangkanGaya] = useState(true);
  const [modePengerjaan, setModePengerjaan] = useState<"individu" | "kelompok">("individu");
  const [jumlahAnggota, setJumlahAnggota] = useState<number>(4);

  // AI Provider & Model selection (default to Xkiro DeepSeek V3.2 for fast online response)
  const [aiProvider, setAiProvider] = useState("xkiro");
  const [aiModel, setAiModel] = useState("deepseek/deepseek-v3.2");
  const [modalAIOpen, setModalAIOpen] = useState(false);

  const [documents, setDocuments] = useState<Record<Level, DocumentState | undefined>>(emptyDocuments);
  const documentsRef = useRef<Record<Level, DocumentState | undefined>>(emptyDocuments());
  const [active, setActive] = useState<Level>("dasar");
  const [docType, setDocType] = useState<"siswa" | "kunci">("siswa");

  const [loadingLevels, setLoadingLevels] = useState<Level[]>([]);
  const [error, setError] = useState("");
  const [progress, setProgress] = useState<{ level: Level; index: number } | null>(null);
  const [validationLevel, setValidationLevel] = useState<Level | null>(null);
  const [saved, setSaved] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  const kelasId = classes.some((item) => item.kelas.id === selectedClassId) ? selectedClassId : classes[0]?.kelas.id ?? "";
  const dataKelas = classes.find((item) => item.kelas.id === kelasId);
  const availableAssessments = assessments.filter(item => item.kelas_id === kelasId);
  const assessmentId = availableAssessments.some(item => item.id === selectedAssessmentId) ? selectedAssessmentId : availableAssessments[0]?.id ?? "";
  const assessment = availableAssessments.find(item => item.id === assessmentId);

  const assessmentSubmissions = submissions.filter(item => item.asesmen_id === assessmentId && item.selesai);
  const vak = useMemo(() => {
    const counts = { visual: 0, auditory: 0, kinestetik: 0 };
    assessmentSubmissions.forEach(item => {
      const style = item.gaya_belajar ?? dataKelas?.siswa.find(student => student.id === item.siswa_id)?.gaya_belajar;
      if (style) counts[style]++;
    });
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const dominant = (Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "visual") as Exclude<GayaBelajar, null>;
    return {
      counts,
      total,
      dominant,
      percent: (key: Exclude<GayaBelajar, null>) => total ? Math.round(counts[key] / total * 100) : 0
    };
  }, [assessmentSubmissions, dataKelas]);

  const weakByLevel = useMemo(() => Object.fromEntries(levels.map(level => [
    level,
    Array.from(new Set(assessmentSubmissions.filter(item => item.level === level).flatMap(item => Object.entries(item.detail_per_indikator).filter(([, result]) => !result.dikuasai).map(([indicator]) => indicator))))
  ])) as Record<Level, string[]>, [assessmentSubmissions]);

  const indikatorLemah = useMemo(() => Array.from(new Set(levels.flatMap(level => weakByLevel[level]))), [weakByLevel]);

  const counts: Record<Level, number> = {
    dasar: assessmentSubmissions.filter(item => item.level === "dasar").length,
    menengah: assessmentSubmissions.filter(item => item.level === "menengah").length,
    mahir: assessmentSubmissions.filter(item => item.level === "mahir").length,
  };

  const providerObj = AI_PROVIDERS.find(p => p.id === aiProvider) || AI_PROVIDERS[0];
  const modelObj = providerObj.models.find(m => m.id === aiModel) || providerObj.models[0];
  const providerName = providerObj.name;
  const modelLabel = modelObj?.label || aiModel;

  function resetGenerator() {
    const cleared = emptyDocuments();
    documentsRef.current = cleared;
    setDocuments(cleared);
    setStep(0);
    setTopik("Rasio (Perbandingan)");
    setKelasId(classes[0]?.kelas.id ?? "");
    setAssessmentId("");
    setActive("dasar");
    setJumlah(4);
    setGaya("Gunakan konteks resep masakan, denah/skala peta, dan perbandingan harga satuan.");
    setPertimbangkanGaya(true);
    setModePengerjaan("individu");
    setJumlahAnggota(4);
    setError("");
    setSaved(false);
    setLoadingLevels([]);
    setProgress(null);
    setValidationLevel(null);
    setResetOpen(false);
  }

  const assessmentJudul = assessment?.judul ?? "-";
  const body = {
    materi: topik,
    jumlahAktivitas: jumlah,
    promptTambahan: `${gaya}\nKonteks asesmen: ${assessmentJudul}. Rekap TaRL: ${levels.map(level => `${labels[level]} ${counts[level]} siswa; indikator target ${weakByLevel[level].join(", ") || "IK-01, IK-02"}`).join(" | ")}. Distribusi VAK: Visual ${vak.counts.visual}, Auditory ${vak.counts.auditory}, Kinestetik ${vak.counts.kinestetik}.`.slice(0, 1000),
    gayaBelajar: pertimbangkanGaya && vak.total ? vak.dominant : null,
    indikatorLemah: indikatorLemah.length ? indikatorLemah : ["IK-01", "IK-02", "IK-03"],
    modePengerjaan,
    jumlahAnggota: modePengerjaan === "kelompok" ? jumlahAnggota : undefined,
  };

  function updateDocument(level: Level, document: DocumentState | undefined, _immediate?: boolean) {
    const next = { ...documentsRef.current, [level]: document };
    documentsRef.current = next;
    setDocuments(next);
  }

  async function generate(only?: Level, customConfig?: { provider: string; model: string }) {
    if (!dataKelas) {
      setError("Tambahkan kelas sebelum membuat LKPD.");
      return;
    }
    const currentProviderId = customConfig?.provider || aiProvider;
    const currentModelId = customConfig?.model || aiModel;

    const targets = only ? [only] : levels;
    setLoadingLevels(targets);
    setError("");

    // Clear documents for target levels so stale content is never shown
    const clearedTargets = { ...documentsRef.current };
    targets.forEach((lvl) => {
      clearedTargets[lvl] = undefined;
    });
    documentsRef.current = clearedTargets;
    setDocuments(clearedTargets);

    if (!only) setStep(3);

    for (const [index, level] of targets.entries()) {
      setProgress({ level, index: only ? levels.indexOf(level) : index });
      setActive(level);
      try {
        const response = await fetch("/api/ai/generate-lkpd", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...body,
            level,
            provider: currentProviderId,
            model: currentModelId,
          }),
        });
        const text = await response.text();
        let payload: { results?: GeneratedLKPD[]; error?: string };
        try {
          payload = JSON.parse(text) as { results?: GeneratedLKPD[]; error?: string };
        } catch {
          throw new Error(
            response.status === 504
              ? "Waktu tunggu server Vercel habis (Timeout). Pilih model respons cepat seperti DeepSeek V3.2 atau Codestral."
              : `Respons server tidak valid (${response.status}).`
          );
        }
        if (!response.ok || !payload.results?.[0]) throw new Error(payload.error || "Gagal membuat LKPD.");
        const item = payload.results[0];
        updateDocument(level, { ...item, draft: item.content, editing: false, validatedAt: null }, true);
        saveHistoryEntry({
          id: `lkpd-${kelasId}-${level}-${sanitizeFilename(topik)}`,
          judul: `LKPD ${topik}`,
          topik,
          level,
          kelas: dataKelas.kelas.nama,
          kelasId,
          tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
          dibuat_pada: new Date().toISOString(),
          status: "Draf",
          content: item.content,
          model: item.model || currentModelId,
          validatedAt: null,
          isFallback: item.isFallback,
          source: item.source,
        });
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : "Layanan belum dapat digunakan.";
        const fallbackDraft = `# LEMBAR KERJA PESERTA DIDIK (LKPD)\n\n## A. Identitas Peserta Didik\n| Komponen | Keterangan |\n|---|---|\n| **Nama Siswa** | .................................................... |\n| **Kelas / No. Absen** | VII-.... / ....... |\n| **Hari / Tanggal** | .................................................... |\n\n## B. Tujuan Pembelajaran\n1. Mengidentifikasi hubungan rasio kontekstual pada masalah kehidupan sehari-hari.\n2. Menyelesaikan perbandingan secara bertahap pada level ${labels[level]}.\n\n## C. Petunjuk Pengerjaan\nKerjakan secara bertahap pada ruang jawaban yang disediakan.\n\n## D. Kegiatan Pembelajaran\n### Aktivitas 1: Perbandingan Bahan Masakan (target: IK-01)\nIbu menyiapkan adonan kue dengan perbandingan tepung terigu dan gula pasir adalah 3 : 2. Jika total berat kedua bahan adalah 500 gram, tentukan berat tepung terigu!\n\n> **Ruang Jawaban:**\n> - Jumlah bagian rasio = 3 + 2 = ......\n> - Berat 1 bagian = 500 ÷ ...... = ...... gram\n> - Berat tepung terigu (3 bagian) = 3 × ...... = ...... gram\n\n### Aktivitas 2: Perbandingan Jarak Tempuh (target: IK-02)\nSebuah kendaraan menempuh jarak 90 km dengan 3 liter bensin. Tentukan jarak yang ditempuh jika bensin yang tersedia adalah 5 liter!\n\n> **Ruang Jawaban:**\n> - Jarak per 1 liter = ...... ÷ ...... = ...... km\n> - Jarak untuk 5 liter = 5 × ...... = ...... km\n\n## E. Refleksi Diri Siswa\n1. Bagian mana yang paling mudah dipahami?\n2. Langkah mana yang masih membutuhkan bantuan guru?\n\n<!-- PEMISAH_KUNCI_GURU -->\n\n# KUNCI JAWABAN & PANDUAN GURU\n## A. Pembahasan & Kunci Jawaban Resmi\n1. **Aktivitas 1:**\n   - Jumlah bagian = 3 + 2 = 5 bagian.\n   - Nilai 1 bagian = 500 ÷ 5 = 100 gram.\n   - Berat tepung terigu = 3 × 100 = **300 gram**.\n\n2. **Aktivitas 2:**\n   - Efisiensi bahan bakar = 90 ÷ 3 = 30 km/liter.\n   - Jarak tempuh = 5 × 30 = **150 km**.\n\n## B. Pedoman & Rubrik Penskoran\n| Kriteria | Indikator | Skor Maks |\n|---|---|:---:|\n| Pemodelan | Menuliskan model perbandingan dengan tepat | 50 |\n| Perhitungan | Menyelesaikan perkalian/pembagian hingga hasil akhir | 50 |`;

        updateDocument(level, {
          level,
          status: "fallback",
          content: fallbackDraft,
          source: "mock",
          model: currentModelId,
          isFallback: true,
          error: `${message} (Dokumen cadangan ditampilkan)`,
          draft: fallbackDraft,
          editing: false,
          validatedAt: null,
        }, true);
      } finally {
        setLoadingLevels((current) => current.filter((item) => item !== level));
      }
    }
    setProgress(null);
    if (!only) {
      setActive("dasar");
      setStep(3);
    }
  }

  function patch(level: Level, values: Partial<DocumentState>) {
    const current = documentsRef.current[level];
    updateDocument(level, current ? { ...current, ...values } : undefined);
  }

  function print(level: Level, docType: "siswa" | "kunci" = "siswa") {
    const printId = docType === "siswa" ? level : `kunci-${level}`;
    const clearPrintSelection = () => delete document.body.dataset.printLevel;
    document.body.dataset.printLevel = printId;
    window.addEventListener("afterprint", clearPrintSelection, { once: true });
    window.print();
  }

  async function downloadWordDoc(content: string, filename: string) {
    try {
      await downloadDocx(content, filename);
    } catch {
      setError("Gagal mengekspor dokumen Word.");
    }
  }

  const vakLabel = vak.dominant[0].toUpperCase() + vak.dominant.slice(1);
  const current = documents[active];

  // Split current document into student LKPD and teacher answer key
  const { studentContent, teacherKeyContent } = splitLkpdContent(current?.content || "", labels[active], topik);

  if (!dataKelas) {
    return (
      <div className="card text-center">
        <h1 className="text-2xl font-semibold">Belum ada kelas</h1>
        <p className="mt-2 text-[#6b7280]">Tambahkan kelas terlebih dahulu sebelum membuat LKPD.</p>
        <Button className="mt-4" href="/kelas">Buka Manajemen Kelas</Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header Generator Clean */}
      <div className="mb-6 flex flex-col justify-between gap-4 border-b pb-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-black text-[#1E1B4B] md:text-3xl">
            <GeneratorLogo aria-hidden className="h-9 w-9 shrink-0" size={36} />
            Generator LKPD
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            {saved && <span className="text-xs font-medium text-emerald-700">Tersimpan otomatis</span>}
          </div>
        </div>

        <Button variant="ghost" onClick={() => setResetOpen(true)}>
          <RefreshCw className="h-4 w-4" />Reset / Buat Baru
        </Button>
      </div>

      <div className="grid min-h-[620px] gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
        <aside className="card space-y-5">
          <h2 className="font-semibold">{["Pilih Data Asesmen", "Konfigurasi LKPD", "Konfirmasi Generate", "Validasi Guru"][step]}</h2>

          {step === 0 && (
            <div className="space-y-4">
              <label className="label">
                Kelas
                <select className="input" value={kelasId} onChange={(e) => { setKelasId(e.target.value); setAssessmentId(""); }}>
                  {classes.map(({ kelas }) => <option key={kelas.id} value={kelas.id}>{kelas.nama}</option>)}
                </select>
              </label>

              <label className="label">
                Asesmen Diagnostik
                <select className="input" value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)}>
                  <option value="">Pilih asesmen</option>
                  {availableAssessments.map((item) => <option key={item.id} value={item.id}>{item.judul}</option>)}
                </select>
              </label>

              {assessment ? (
                <div className="space-y-3">
                  <div className="rounded-xl bg-blue-50/70 border border-blue-100 p-3.5 text-sm space-y-1">
                    <strong className="text-[#1E1B4B]">{assessmentSubmissions.length} siswa telah menyelesaikan asesmen</strong>
                    <p className="text-xs text-slate-700">
                      {levels.map((level) => `${labels[level]}: ${assessmentSubmissions.filter((item) => item.level === level).length} siswa`).join(" · ")}
                    </p>
                    <p className="text-xs text-slate-600">
                      Gaya Belajar: Visual {vak.counts.visual} · Auditory {vak.counts.auditory} · Kinestetik {vak.counts.kinestetik}
                    </p>
                  </div>

                  {assessmentSubmissions.length === 0 && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 text-xs text-amber-950 font-bold">
                      Belum ada data pengerjaan siswa (0 submission)
                    </div>
                  )}
                </div>
              ) : (
                <div className="rounded-xl bg-slate-100 p-3.5 text-xs text-slate-600 space-y-1.5">
                  <p className="font-semibold text-slate-800">Pilih asesmen diagnostik di atas</p>
                  <p>Data hasil asesmen akan menjadi dasar pembagian tingkat kesulitan materi LKPD.</p>
                </div>
              )}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <label className="label">
                Topik Materi
                <input className="input" value={topik} onChange={(e) => setTopik(e.target.value)} />
              </label>

              {/* Mode Pengerjaan: Mandiri vs Kelompok */}
              <div className="space-y-1.5">
                <label className="label">Bentuk Pengerjaan</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setModePengerjaan("individu")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center",
                      modePengerjaan === "individu"
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB] shadow-2xs font-black"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Mandiri (Individu)
                  </button>
                  <button
                    type="button"
                    onClick={() => setModePengerjaan("kelompok")}
                    className={cn(
                      "py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer text-center",
                      modePengerjaan === "kelompok"
                        ? "border-[#2563EB] bg-blue-50 text-[#2563EB] shadow-2xs font-black"
                        : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    Kelompok
                  </button>
                </div>
              </div>

              {modePengerjaan === "kelompok" && (
                <div className="space-y-1.5 rounded-xl border border-blue-100 bg-blue-50/50 p-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Jumlah Anggota per Kelompok:</span>
                    <span className="text-xs font-black text-[#2563EB]">{jumlahAnggota} Siswa</span>
                  </div>
                  <div className="flex gap-1.5 pt-1">
                    {[2, 3, 4, 5, 6].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setJumlahAnggota(num)}
                        className={cn(
                          "flex-1 py-1 rounded-lg border text-xs font-bold transition cursor-pointer text-center",
                          jumlahAnggota === num
                            ? "border-[#2563EB] bg-[#2563EB] text-white shadow-2xs"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        )}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <label className="label">
                Jumlah Aktivitas Per Level: {jumlah}
                <input className="w-full" type="range" min="1" max="6" value={jumlah} onChange={(e) => setJumlah(+e.target.value)} />
              </label>

              <label className="label">
                Prompt / Konteks Tambahan
                <textarea className="input min-h-24" value={gaya} maxLength={1000} onChange={(e) => setGaya(e.target.value)} />
              </label>

              <button
                type="button"
                className="w-full rounded-xl border border-slate-200 p-3 text-left hover:bg-slate-50 transition cursor-pointer"
                onClick={() => setPertimbangkanGaya((v) => !v)}
              >
                <span className="text-xs text-slate-500 block uppercase font-bold">Penyesuaian VAK:</span>
                <strong className="text-xs font-black text-slate-900">
                  {pertimbangkanGaya ? `Aktif — ${vakLabel} (${vak.percent(vak.dominant)}%)` : "Tidak aktif"}
                </strong>
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-3 space-y-1.5">
                <p><strong>Kelas:</strong> {dataKelas.kelas.nama}</p>
                <p><strong>Topik Materi:</strong> {topik}</p>
                <p><strong>Bentuk:</strong> {modePengerjaan === "kelompok" ? `Kelompok (${jumlahAnggota} Siswa)` : "Mandiri (Individu)"}</p>
                <p><strong>Aktivitas:</strong> {jumlah} per level</p>
                <p><strong>Hasil Asesmen:</strong> Dasar {counts.dasar} · Menengah {counts.menengah} · Mahir {counts.mahir}</p>
                <p><strong>Gaya Belajar:</strong> {pertimbangkanGaya ? `${vakLabel} (${vak.percent(vak.dominant)}%)` : "Nonaktif"}</p>
              </div>

              {/* Chosen AI engine summary card with change button */}
              <div className="flex items-center justify-between rounded-xl bg-blue-50/70 border border-blue-200/80 p-3.5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">Engine AI Terpilih:</span>
                  <span className="text-xs font-black text-[#1E1B4B]">{providerName} — {modelLabel}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAIOpen(true)}
                  className="rounded-lg bg-white border border-blue-200 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-50 transition cursor-pointer shadow-2xs"
                >
                  Ganti Model
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="text-xs text-slate-500">
              <p>Periksa draf dokumen siswa dan kunci jawaban guru sebelum divalidasi atau diunduh.</p>
            </div>
          )}

          {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="flex flex-wrap gap-2 border-t pt-4">
            {step > 0 && (
              <Button variant="ghost" onClick={() => setStep(step - 1)}>
                <ArrowLeft className="h-4 w-4" />Kembali
              </Button>
            )}
            {step < 2 && (
              <Button
                disabled={!topik.trim() || (step === 0 && (!assessment || assessmentSubmissions.length === 0))}
                onClick={() => setStep(step + 1)}
              >
                Lanjut<ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === 2 && (
              <Button disabled={loadingLevels.length > 0 || !topik.trim()} onClick={() => generate()}>
                {progress ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Membuat LKPD {labels[progress.level]}... ({progress.index + 1}/3)
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />Generate 3 Level
                  </>
                )}
              </Button>
            )}
          </div>
        </aside>

        <main className="min-w-0">
          {loadingLevels.length > 0 ? (
            <div className="card grid min-h-[460px] place-items-center p-8 text-center bg-white border border-blue-100 shadow-sm rounded-2xl">
              <div className="max-w-md mx-auto space-y-5">
                <div className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 border border-blue-200 shadow-2xs">
                  <Loader2 className="h-8 w-8 text-[#2563EB] animate-spin" />
                </div>

                <div>
                  <h3 className="text-lg font-black text-[#1E1B4B]">
                    {progress ? `Membuat LKPD Level ${labels[progress.level]}... (${progress.index + 1}/3)` : "Menyusun Dokumen LKPD..."}
                  </h3>
                </div>

                {/* Progress 3 Level Indicators */}
                <div className="grid grid-cols-3 gap-2 pt-1">
                  {levels.map((lvl, idx) => {
                    const isDone = documents[lvl]?.status === "success" || documents[lvl]?.status === "fallback";
                    const isCurrent = progress?.level === lvl;
                    return (
                      <div
                        key={lvl}
                        className={cn(
                          "rounded-xl border py-2.5 px-2 text-xs font-bold transition-all text-center",
                          isDone
                            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                            : isCurrent
                            ? "border-[#2563EB] bg-blue-50 text-[#2563EB] shadow-xs ring-1 ring-[#2563EB]"
                            : "border-slate-200 bg-slate-50 text-slate-400"
                        )}
                      >
                        <div className="flex items-center justify-center gap-1.5">
                          {isDone ? (
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                          ) : isCurrent ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#2563EB]" />
                          ) : (
                            <span className="h-3.5 w-3.5 rounded-full border border-slate-300 text-[9px] grid place-items-center">{idx + 1}</span>
                          )}
                          <span>{labels[lvl]}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs font-bold text-slate-400 tracking-wide">
                  Tunggu...
                </p>
              </div>
            </div>
          ) : step < 3 ? (
            <div className="card grid min-h-96 place-items-center text-center text-slate-600">
              <p className="font-semibold text-slate-700">Lengkapi konfigurasi di samping</p>
            </div>
          ) : (
            <>
              {/* Dual-Row Navigation Tabs: Row 1 LKPD Siswa, Row 2 Kunci Jawaban Guru */}
              <div className="space-y-2 mb-5">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B] block mb-1.5">
                    1. Dokumen LKPD Siswa (Siap Cetak / Bagikan)
                  </span>
                  <div className="grid grid-cols-3 gap-2" role="tablist">
                    {levels.map((level) => {
                      const isSelected = active === level && docType === "siswa";
                      return (
                        <button
                          role="tab"
                          aria-selected={isSelected}
                          type="button"
                          onClick={() => { setActive(level); setDocType("siswa"); }}
                          className={cn(
                            "rounded-xl border p-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-left",
                            isSelected
                              ? "border-[#2563EB] bg-blue-50/90 text-[#1E1B4B] shadow-sm ring-2 ring-[#2563EB]/80"
                              : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          )}
                          key={`siswa-${level}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>LKPD {labels[level]}</span>
                            {documents[level]?.validatedAt && <span className="text-[10px] text-emerald-700 font-bold">✓ Tervalidasi</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-1.5">
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 block mb-1.5">
                    2. Kunci Jawaban & Panduan Guru
                  </span>
                  <div className="grid grid-cols-3 gap-2" role="tablist">
                    {levels.map((level) => {
                      const isSelected = active === level && docType === "kunci";
                      return (
                        <button
                          role="tab"
                          aria-selected={isSelected}
                          type="button"
                          onClick={() => { setActive(level); setDocType("kunci"); }}
                          className={cn(
                            "rounded-xl border p-3 text-xs sm:text-sm font-black transition-all cursor-pointer text-left",
                            isSelected
                              ? "border-amber-500 bg-amber-100 text-amber-950 shadow-sm ring-2 ring-amber-500/80"
                              : "border-amber-200 bg-amber-50/50 text-amber-900 hover:border-amber-300 hover:bg-amber-100/50"
                          )}
                          key={`kunci-${level}`}
                        >
                          <div className="flex items-center justify-between">
                            <span>Kunci Jawaban {labels[level]}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Action Bar Atas: Ganti Model & Regenerasi */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div>
                  {current?.validatedAt && (
                    <span className="text-xs text-emerald-700 font-bold">
                      Tervalidasi {new Date(current.validatedAt).toLocaleString("id-ID")}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="ghost" disabled={loadingLevels.length > 0} onClick={() => setModalAIOpen(true)}>
                    Ganti Model AI
                  </Button>
                  <Button variant="secondary" disabled={loadingLevels.includes(active)} onClick={() => generate(active)}>
                    <RefreshCw className="h-4 w-4" />Regenerasi Level Ini
                  </Button>
                </div>
              </div>

              {current ? (
                <article className="space-y-5">
                  {/* KONDISI TAMPILAN BERDASARKAN TAB AKTIF: DOKUMEN SISWA ATAU KUNCI JAWABAN */}
                  {docType === "siswa" ? (
                    /* CARD 1: Dokumen LKPD Siswa (Bebas Kunci Jawaban) */
                    <div className="card space-y-4 border-2 border-blue-100 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div>
                          <h3 className="text-base font-black text-[#1E1B4B]">
                            Dokumen LKPD Siswa (Level {labels[active]})
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocType("kunci")}
                          title="Buka Kunci Jawaban"
                          aria-label="Buka Kunci Jawaban"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100 transition cursor-pointer shadow-2xs"
                        >
                          <KeyRound className="h-4 w-4" />
                        </button>
                      </div>

                      {current.editing ? (
                        <div>
                          <textarea
                            aria-label={`Editor LKPD ${labels[active]}`}
                            className="input min-h-[460px] font-mono text-sm"
                            value={current.draft}
                            onChange={(e) => patch(active, { draft: e.target.value, validatedAt: null })}
                          />
                          <div className="mt-3 flex gap-2">
                            <Button disabled={!current.draft.trim()} onClick={() => patch(active, { content: current.draft, editing: false, validatedAt: null })}>
                              <FileText className="h-4 w-4" />Simpan Perubahan
                            </Button>
                            <Button variant="ghost" onClick={() => patch(active, { draft: current.content, editing: false })}>
                              <X className="h-4 w-4" />Batal
                            </Button>
                          </div>
                        </div>
                      ) : studentContent ? (
                        <LkpdDocument content={studentContent} level={labels[active]} topic={topik} printId={active} />
                      ) : (
                        <div className="text-sm text-red-700 p-4">Dokumen kosong. Gunakan Regenerasi untuk mencoba level ini lagi.</div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
                        <Button variant="ghost" disabled={!current.content} onClick={() => patch(active, { draft: current.content, editing: true })}>
                          <Edit3 className="h-4 w-4" />Edit Draf
                        </Button>
                        <Button variant="secondary" disabled={!current.content.trim() || current.editing} onClick={() => setValidationLevel(active)}>
                          <CheckCircle className="h-4 w-4" />{current.validatedAt ? "Validasi Ulang" : "Validasi LKPD"}
                        </Button>
                        <Button disabled={!studentContent} onClick={() => print(active, "siswa")}>
                          <Printer className="h-4 w-4" />Print / PDF LKPD Siswa
                        </Button>
                        <Button disabled={!studentContent} onClick={() => downloadWordDoc(studentContent, `LKPD-${sanitizeFilename(topik)}-${active}`)}>
                          <Download className="h-4 w-4" />Unduh Word (.docx)
                        </Button>
                      </div>
                    </div>
                  ) : (
                    /* CARD 2: Kunci Jawaban & Panduan Guru */
                    <div className="card space-y-4 border-2 border-amber-200 bg-amber-50/40 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/80 pb-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid h-8 w-8 place-items-center rounded-xl bg-amber-100 text-amber-900 border border-amber-300/80">
                            <KeyRound className="h-4 w-4" />
                          </span>
                          <div>
                            <h3 className="text-base font-black text-amber-950">
                              Kunci Jawaban & Panduan Guru (Level {labels[active]})
                            </h3>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setDocType("siswa")}
                          title="Kembali ke LKPD Siswa"
                          aria-label="Kembali ke LKPD Siswa"
                          className="grid h-9 w-9 place-items-center rounded-xl border border-blue-200 bg-white text-[#2563EB] hover:bg-blue-50 transition cursor-pointer shadow-2xs"
                        >
                          <FileText className="h-4 w-4" />
                        </button>
                      </div>

                      {teacherKeyContent ? (
                        <LkpdDocument
                          content={teacherKeyContent}
                          level={labels[active]}
                          topic={topik}
                          printId={`kunci-${active}`}
                          docTitle="KUNCI JAWABAN & PANDUAN GURU"
                          docBadge="Catatan Pegangan Guru · Pembelajaran Berdiferensiasi (TaRL)"
                        />
                      ) : (
                        <div className="p-4 rounded-xl bg-white border border-amber-200 text-xs text-amber-900">
                          Bagian kunci jawaban guru akan otomatis dibuat saat Anda men-generate LKPD.
                        </div>
                      )}

                      <div className="flex flex-wrap items-center gap-2 border-t border-amber-200/80 pt-4">
                        <Button
                          disabled={!teacherKeyContent}
                          onClick={() => print(active, "kunci")}
                          variant="secondary"
                        >
                          <Printer className="h-4 w-4" />Print / PDF Kunci Jawaban
                        </Button>
                        <Button
                          disabled={!teacherKeyContent}
                          onClick={() => downloadWordDoc(teacherKeyContent, `Kunci-Jawaban-${sanitizeFilename(topik)}-${active}`)}
                          variant="secondary"
                        >
                          <Download className="h-4 w-4" />Unduh Word Kunci (.docx)
                        </Button>
                        <Button
                          disabled={!teacherKeyContent}
                          variant="ghost"
                          onClick={() => {
                            navigator.clipboard.writeText(teacherKeyContent);
                            setCopiedKey(true);
                            setTimeout(() => setCopiedKey(false), 2000);
                          }}
                        >
                          {copiedKey ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                          {copiedKey ? "Tersalin!" : "Salin Teks Kunci"}
                        </Button>
                      </div>
                    </div>
                  )}
                </article>
              ) : (
                <div className="card text-center">
                  <p>Belum ada hasil untuk {labels[active]}.</p>
                  <Button className="mt-4" onClick={() => generate(active)}>Generate {labels[active]}</Button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      <ConfirmModal
        isOpen={resetOpen}
        title="Reset generator LKPD?"
        description="Konfigurasi dan dokumen hasil generator yang tersimpan akan dihapus. Anda akan memulai LKPD baru dari awal."
        confirmText="Reset Generator"
        variant="danger"
        onConfirm={resetGenerator}
        onCancel={() => setResetOpen(false)}
      />

      {/* Modal Pemilih Provider & Model AI */}
      <ModalGenerateAI
        isOpen={modalAIOpen}
        onClose={() => setModalAIOpen(false)}
        currentProviderId={aiProvider}
        currentModelId={aiModel}
        onGenerate={async (config) => {
          setAiProvider(config.provider);
          setAiModel(config.model);
          setModalAIOpen(false);
          if (step === 2) {
            await generate(undefined, config);
          } else if (step === 3) {
            await generate(active, config);
          }
        }}
        loading={loadingLevels.length > 0}
        materi={topik}
        targetInfo={step === 3 ? `Regenerasi Level ${labels[active]}` : "3 Level (Dasar, Menengah, Mahir)"}
        actionText={step === 2 ? "Generate 3 Level" : "Regenerasi Level Ini"}
      />

      {validationLevel && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4"
          onMouseDown={(event) => { if (event.target === event.currentTarget) setValidationLevel(null); }}
        >
          <div role="dialog" aria-modal="true" aria-labelledby="validation-title" className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" onKeyDown={(event) => { if (event.key === "Escape") setValidationLevel(null); }}>
            <h2 id="validation-title" className="text-lg font-semibold">Konfirmasi Validasi</h2>
            <p className="mt-3 text-sm text-[#414753]">Apakah konten LKPD {labels[validationLevel]} sudah sesuai dan siap diunduh?</p>
            <div className="mt-6 flex flex-wrap justify-end gap-2">
              <Button autoFocus variant="ghost" onClick={() => setValidationLevel(null)}>Kembali periksa</Button>
              <Button
                onClick={() => {
                  const now = new Date().toISOString();
                  patch(validationLevel, { validatedAt: now });
                  const doc = documents[validationLevel];
                  if (doc) {
                    saveHistoryEntry({
                      id: `lkpd-${kelasId}-${validationLevel}-${sanitizeFilename(topik)}`,
                      judul: `LKPD ${topik}`,
                      topik,
                      level: validationLevel,
                      kelas: dataKelas.kelas.nama,
                      kelasId,
                      tanggal: new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }),
                      dibuat_pada: now,
                      status: "Tervalidasi",
                      content: doc.content,
                      model: doc.model || aiModel,
                      validatedAt: now,
                      isFallback: doc.isFallback,
                      source: doc.source,
                    });
                  }
                  setValidationLevel(null);
                }}
              >
                <CheckCircle className="h-4 w-4" />Ya, Validasi
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
