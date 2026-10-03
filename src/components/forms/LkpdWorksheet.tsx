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
  Calculator,
  CheckCircle2,
  Cloud,
  FileEdit,
  Loader2,
  Pencil,
  Send,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { MathKeyboard } from "@/components/ui/MathKeyboard";
import { hitungTerisi } from "@/lib/lkpd-items";
import { simpanPengisianLkpd, type LkpdSiswa } from "@/lib/student-lkpd";
import { splitLkpdContent, sanitizeMathMarkdown } from "@/lib/lkpd-utils";

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

  // Keyboard matematika state
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeFieldId, setActiveFieldId] = useState<string>(lkpd.butir[0]?.id || "");
  const inputRefs = useRef<Record<string, HTMLInputElement | HTMLTextAreaElement | null>>({});

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const progres = useMemo(() => hitungTerisi(lkpd.butir, jawaban), [lkpd.butir, jawaban]);

  // Pisahkan konten siswa murni dari kunci jawaban guru
  const studentKonten = useMemo(() => {
    if (!lkpd.konten) return "";
    return splitLkpdContent(lkpd.konten).studentContent || lkpd.konten;
  }, [lkpd.konten]);

  // Label target soal aktif untuk keyboard
  const activeQuestionLabel = useMemo(() => {
    const item = lkpd.butir.find((b) => b.id === activeFieldId);
    return item ? `Soal ${item.nomor}` : "";
  }, [activeFieldId, lkpd.butir]);

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

  const handleInsertMath = (text: string) => {
    if (!activeFieldId || terkunci) return;
    const el = inputRefs.current[activeFieldId];
    const currentVal = jawaban[activeFieldId] ?? "";

    if (el) {
      const start = el.selectionStart ?? currentVal.length;
      const end = el.selectionEnd ?? currentVal.length;
      const nextVal = currentVal.slice(0, start) + text + currentVal.slice(end);
      ubah(activeFieldId, nextVal);
      setTimeout(() => {
        el.focus();
        el.setSelectionRange(start + text.length, start + text.length);
      }, 0);
    } else {
      ubah(activeFieldId, currentVal + text);
    }
  };

  const handleBackspaceMath = () => {
    if (!activeFieldId || terkunci) return;
    const el = inputRefs.current[activeFieldId];
    const currentVal = jawaban[activeFieldId] ?? "";

    if (el) {
      const start = el.selectionStart ?? currentVal.length;
      const end = el.selectionEnd ?? currentVal.length;
      if (start === end && start > 0) {
        const nextVal = currentVal.slice(0, start - 1) + currentVal.slice(end);
        ubah(activeFieldId, nextVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start - 1, start - 1);
        }, 0);
      } else if (start !== end) {
        const nextVal = currentVal.slice(0, start) + currentVal.slice(end);
        ubah(activeFieldId, nextVal);
        setTimeout(() => {
          el.focus();
          el.setSelectionRange(start, start);
        }, 0);
      }
    } else if (currentVal.length > 0) {
      ubah(activeFieldId, currentVal.slice(0, -1));
    }
  };

  const handleClearMath = () => {
    if (!activeFieldId || terkunci) return;
    ubah(activeFieldId, "");
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
    <div className="mx-auto max-w-4xl pb-32">
      <Link
        className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-[#0066cc] hover:underline"
        href="/lkpd-saya"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Kembali ke daftar LKPD
      </Link>

      {/* Header LKPD */}
      <header className="mb-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Lembar Kerja Peserta Didik</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">{lkpd.judul}</h1>
            <p className="mt-1 text-sm font-medium text-slate-600">{lkpd.materi}</p>
          </div>
          <Badge level={lkpd.level}>{lkpd.level}</Badge>
        </div>

        {lkpd.pengisian?.status === "dinilai" ? (
          <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
            <p className="flex items-center gap-2 font-bold text-emerald-800">
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
          <p className="mt-5 rounded-2xl border border-blue-200 bg-blue-50/80 p-4 text-sm font-bold text-blue-800">
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

      {/* Tampilan Dokumen LKPD (Render Markdown Akademis Resmi) */}
      {studentKonten && (
        <Card className="mb-8 border-slate-200/80 bg-white shadow-xs p-6 md:p-8">
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-800">Isi Lembar Kerja & Aktivitas Siswa</h2>
          </div>
          <div className="lkpd-markdown">
            <ReactMarkdown
              skipHtml
              urlTransform={safeUrl}
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[[rehypeKatex, { throwOnError: false }]]}
            >
              {sanitizeMathMarkdown(studentKonten)}
            </ReactMarkdown>
          </div>
        </Card>
      )}

      {/* Lembar Jawaban Siswa */}
      <section className="mb-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Pencil className="h-5 w-5 text-blue-600" />
            <h2 className="text-xl font-bold text-slate-900">Lembar Jawaban Siswa</h2>
          </div>

          {!terkunci && (
            <button
              type="button"
              onClick={() => setKeyboardOpen((v) => !v)}
              className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer ${
                keyboardOpen
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
              }`}
            >
              <Calculator className="h-4 w-4" />
              <span>{keyboardOpen ? "Tutup Keyboard Matematika" : "Buka Keyboard Matematika"}</span>
            </button>
          )}
        </div>

        <ol className="space-y-5">
          {lkpd.butir.map((butir) => {
            const inputId = `butir-${butir.id}`;
            const isActive = activeFieldId === butir.id;
            const textVal = jawaban[butir.id] ?? "";

            return (
              <li key={butir.id}>
                <Card
                  className={`transition-all ${
                    isActive ? "ring-2 ring-blue-500/40 border-blue-400 shadow-md" : "border-slate-200"
                  }`}
                >
                  <label className="block cursor-pointer" htmlFor={inputId} onClick={() => setActiveFieldId(butir.id)}>
                    <div className="flex items-start gap-3">
                      <span
                        aria-hidden
                        className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-blue-600 text-sm font-bold text-white shadow-xs"
                      >
                        {butir.nomor}
                      </span>
                      <div className="flex-1">
                        <span className="text-base font-bold text-slate-900 leading-snug">
                          {butir.pertanyaan}
                        </span>
                        {butir.petunjuk && (
                          <div className="mt-1.5 text-xs leading-relaxed text-slate-600 bg-slate-50 border border-slate-200/80 rounded-lg p-2.5">
                            {butir.petunjuk}
                          </div>
                        )}
                      </div>
                    </div>
                  </label>

                  {/* Toolbar Simbol Cepat Matematika */}
                  {!terkunci && (
                    <div className="mt-3 flex flex-wrap items-center gap-1 border-t border-slate-100 pt-2.5">
                      <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-amber-500" /> Rumus:
                      </span>
                      {[
                        { label: "a/b", val: " / " },
                        { label: "²", val: "²" },
                        { label: "√", val: "√" },
                        { label: ":", val: " : " },
                        { label: "×", val: " × " },
                        { label: "÷", val: " ÷ " },
                        { label: "≤", val: " ≤ " },
                        { label: "≥", val: " ≥ " },
                        { label: "=", val: " = " },
                        { label: "π", val: "π" },
                        { label: "x", val: "x" },
                        { label: "y", val: "y" },
                      ].map((sym) => (
                        <button
                          key={sym.label}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setActiveFieldId(butir.id);
                            handleInsertMath(sym.val);
                          }}
                          className="h-7 min-w-7 px-1.5 rounded-md bg-slate-100 hover:bg-blue-100 hover:text-blue-700 text-slate-700 border border-slate-200 text-xs font-semibold active:scale-95 transition cursor-pointer"
                        >
                          {sym.label}
                        </button>
                      ))}

                      <button
                        type="button"
                        onClick={() => {
                          setActiveFieldId(butir.id);
                          setKeyboardOpen(true);
                        }}
                        className="ml-auto text-[11px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                      >
                        <Calculator className="h-3 w-3" /> Keyboard Lengkap
                      </button>
                    </div>
                  )}

                  {/* Input Bidang Jawaban */}
                  <div className="mt-2">
                    {butir.tipe === "isian" ? (
                      <input
                        ref={(el) => {
                          inputRefs.current[butir.id] = el;
                        }}
                        className="input w-full text-sm font-sans"
                        disabled={terkunci}
                        id={inputId}
                        onFocus={() => setActiveFieldId(butir.id)}
                        onChange={(e) => ubah(butir.id, e.target.value)}
                        placeholder="Ketik jawabanmu di sini..."
                        value={textVal}
                      />
                    ) : (
                      <textarea
                        ref={(el) => {
                          inputRefs.current[butir.id] = el;
                        }}
                        className="input w-full text-sm font-sans leading-relaxed"
                        disabled={terkunci}
                        id={inputId}
                        onFocus={() => setActiveFieldId(butir.id)}
                        onChange={(e) => ubah(butir.id, e.target.value)}
                        placeholder="Tuliskan langkah pengerjaan bertahap dan jawaban akhirmu di sini..."
                        rows={4}
                        value={textVal}
                      />
                    )}
                  </div>

                  {/* Live Math Hint / Preview jika ada simbol matematika */}
                  {textVal.trim() && (textVal.includes(":") || textVal.includes("√") || textVal.includes("²") || textVal.includes("=") || textVal.includes("×")) && (
                    <div className="mt-2 flex items-center gap-2 rounded-lg bg-blue-50/60 px-3 py-1.5 text-xs text-blue-900 border border-blue-200/60">
                      <span className="font-bold text-blue-700">Format Matematis:</span>
                      <span className="font-mono">{textVal}</span>
                    </div>
                  )}
                </Card>
              </li>
            );
          })}
        </ol>
      </section>

      {/* Bottom Sticky Action Bar */}
      {!terkunci && (
        <div className="sticky bottom-0 mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/95 p-4 backdrop-blur shadow-lg">
          <p aria-live="polite" className="text-xs text-slate-500">
            {statusSimpan === "menyimpan" && (
              <span className="flex items-center gap-1.5 font-medium text-amber-600">
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                Menyimpan jawaban...
              </span>
            )}
            {statusSimpan === "tersimpan" && (
              <span className="flex items-center gap-1.5 font-medium text-emerald-700">
                <Cloud className="h-3.5 w-3.5" aria-hidden />
                Tersimpan otomatis
              </span>
            )}
            {statusSimpan === "gagal" && (
              <span className="flex items-center gap-1.5 font-medium text-red-600">
                <AlertCircle className="h-3.5 w-3.5" aria-hidden />
                {pesanGagal ?? "Gagal menyimpan"}
              </span>
            )}
            {statusSimpan === "bersih" && "Jawabanmu tersimpan otomatis saat kamu mengetik."}
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              type="button"
              onClick={() => setKeyboardOpen((v) => !v)}
              className="text-xs"
            >
              <Calculator className="h-4 w-4 text-blue-600" />
              <span>{keyboardOpen ? "Tutup Keyboard" : "Keyboard Math"}</span>
            </Button>

            <Button disabled={progres.terisi === 0} onClick={() => setKonfirmasiKirim(true)}>
              <Send className="h-4 w-4" aria-hidden />
              Kumpulkan ke Guru
            </Button>
          </div>
        </div>
      )}

      {/* Floating / Docked Math Virtual Keyboard */}
      <MathKeyboard
        isOpen={keyboardOpen && !terkunci}
        onClose={() => setKeyboardOpen(false)}
        onInsert={handleInsertMath}
        onBackspace={handleBackspaceMath}
        onClear={handleClearMath}
        targetLabel={activeQuestionLabel}
      />

      <ConfirmModal
        isOpen={konfirmasiKirim}
        title="Kumpulkan LKPD sekarang?"
        description={
          progres.terisi < progres.total
            ? `Masih ada ${progres.total - progres.terisi} soal yang belum diisi. Setelah dikumpulkan, jawaban akan dinilai oleh guru dan tidak dapat diubah lagi.`
            : "Semua butir soal sudah terisi dengan baik. Setelah dikumpulkan, lembar kerja akan langsung diserahkan kepada guru."
        }
        confirmText={mengirim ? "Mengirim..." : "Ya, Kumpulkan Sekarang"}
        onConfirm={kirim}
        onCancel={() => setKonfirmasiKirim(false)}
      />
    </div>
  );
}
