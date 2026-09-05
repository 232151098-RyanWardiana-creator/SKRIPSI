"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { KUESIONER_GAYA_BELAJAR, LABEL_GAYA_BELAJAR } from "@/constants/gaya-belajar";
import { getAssessment } from "@/lib/assessment-store";
import { getClasses, updateStudent } from "@/lib/class-store";
import { getSelectedStudentId } from "@/lib/student-session";
import { getSubmissions, upsertSubmission } from "@/lib/submission-store";
import type { GayaBelajar } from "@/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

type TipeGaya = Exclude<GayaBelajar, null>;
type KunciPilihan = "a" | "b" | "c";
const STORAGE_VERSION = "v1";

export function KuesionerGayaBelajar({ asesmenId }: { asesmenId: string }) {
  const assessment = useMemo(() => getAssessment(asesmenId), [asesmenId]);
  const studentId = useMemo(() => getSelectedStudentId(), []);
  const student = useMemo(() => assessment ? getClasses().find((entry) => entry.kelas.id === assessment.kelas_id)?.siswa.find((item) => item.id === studentId) : undefined, [assessment, studentId]);
  const submission = useMemo(() => studentId ? getSubmissions().filter((item) => item.asesmen_id === asesmenId && item.siswa_id === studentId && item.selesai).sort((a, b) => b.diperbarui_pada.localeCompare(a.diperbarui_pada))[0] : undefined, [asesmenId, studentId]);
  const storageKey = `lkpd_learning_style_${STORAGE_VERSION}:${submission?.id ?? "none"}`;
  const saved = useMemo(() => { if (typeof window === "undefined" || !submission) return undefined; try { return JSON.parse(localStorage.getItem(storageKey) ?? "null") as { jawaban?: Partial<Record<string, TipeGaya>>; hasil?: TipeGaya } | null; } catch { return undefined; } }, [storageKey, submission]);
  const [langkah, setLangkah] = useState(0);
  const [jawaban, setJawaban] = useState<Partial<Record<string, TipeGaya>>>(saved?.jawaban ?? {});
  const [hasil, setHasil] = useState<TipeGaya | null>(saved?.hasil ?? submission?.gaya_belajar ?? null);

  if (!assessment) return <Message title="Asesmen tidak ditemukan" />;
  if (!studentId) return <Message title="Siswa belum dipilih" />;
  if (!student) return <Message title="Siswa bukan anggota kelas asesmen" />;
  if (!submission) return <Message title="Selesaikan asesmen terlebih dahulu" />;

  const saveAnswer = (id: string, value: TipeGaya) => {
    const next = { ...jawaban, [id]: value };
    setJawaban(next);
    localStorage.setItem(storageKey, JSON.stringify({ jawaban: next }));
  };
  const finish = () => {
    const ordered = KUESIONER_GAYA_BELAJAR.map((item) => jawaban[item.id]).filter((item): item is TipeGaya => Boolean(item));
    const counts = ordered.reduce<Record<TipeGaya, number>>((total, value) => ({ ...total, [value]: total[value] + 1 }), { visual: 0, auditory: 0, kinestetik: 0 });
    const highest = Math.max(...Object.values(counts));
    const value = ordered.find((item) => counts[item] === highest);
    if (!value) return;
    const updated = { ...submission, gaya_belajar: value, diperbarui_pada: new Date().toISOString() };
    upsertSubmission(updated);
    updateStudent(assessment.kelas_id, student.id, { gaya_belajar: value });
    localStorage.setItem(storageKey, JSON.stringify({ jawaban, hasil: value }));
    setHasil(value);
  };

  if (hasil) return <section className="mx-auto max-w-2xl rounded-[24px] bg-white p-6 text-center shadow-sm sm:p-10"><p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Hasil Final</p><h1 className="mt-3 text-3xl font-semibold">Skor {submission.skor_total} · Level {submission.level}</h1><h2 className="mt-4 text-2xl font-semibold">Gaya belajar: {LABEL_GAYA_BELAJAR[hasil].label}</h2><p className="mx-auto mt-4 max-w-lg text-[#414753]">{LABEL_GAYA_BELAJAR[hasil].deskripsi}.</p><Button className="mt-7" href="/dashboard-siswa">Selesai</Button></section>;

  const question = KUESIONER_GAYA_BELAJAR[langkah];
  const selected = jawaban[question.id];
  return <section className="mx-auto max-w-3xl rounded-[24px] bg-white p-5 shadow-sm sm:p-9"><div className="flex justify-between text-sm"><b className="text-[#0066cc]">Kenali Gaya Belajarmu</b><span>Pertanyaan {langkah + 1} dari {KUESIONER_GAYA_BELAJAR.length}</span></div><div className="mt-3 h-2 rounded-full bg-[#e6e8f1]"><div className="h-full rounded-full bg-[#0066cc]" style={{ width: `${(langkah + 1) / KUESIONER_GAYA_BELAJAR.length * 100}%` }} /></div><p className="mt-3 text-xs text-[#6b7280]">Skor {submission.skor_total} · Level {submission.level}</p><h1 className="mt-7 text-2xl font-semibold">{question.pertanyaan}</h1><div className="mt-6 grid gap-3">{(Object.entries(question.pilihan) as [KunciPilihan, (typeof question.pilihan)[KunciPilihan]][]).map(([key, choice]) => <button key={key} onClick={() => saveAnswer(question.id, choice.tipe)} className={`min-h-20 rounded-[18px] border-2 p-5 text-left ${selected === choice.tipe ? "border-[#0066cc] bg-blue-50" : "border-[#e0e0e0]"}`}><b className="mr-3">{key.toUpperCase()}.</b>{choice.teks}</button>)}</div><div className="mt-8 flex justify-between"><Button disabled={langkah === 0} onClick={() => setLangkah((value) => value - 1)} variant="ghost"><ArrowLeft className="h-4 w-4" />Kembali</Button><Button disabled={!selected} onClick={() => langkah === KUESIONER_GAYA_BELAJAR.length - 1 ? finish() : setLangkah((value) => value + 1)}>{langkah === KUESIONER_GAYA_BELAJAR.length - 1 ? "Lihat Hasil" : "Lanjut"}<ArrowRight className="h-4 w-4" /></Button></div></section>;
}

function Message({ title }: { title: string }) { return <section className="card mx-auto max-w-xl text-center"><h1 className="text-2xl font-semibold">{title}</h1><Button className="mt-6" href="/dashboard-siswa">Ke Dashboard</Button></section>; }
