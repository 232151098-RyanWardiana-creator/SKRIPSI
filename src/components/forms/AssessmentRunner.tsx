"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { getAssessment } from "@/lib/assessment-store";
import { getClasses, updateStudent } from "@/lib/class-store";
import { scoreAssessment } from "@/lib/assessment-scoring";
import { getSelectedStudentId } from "@/lib/student-session";
import { getSubmissions, upsertSubmission } from "@/lib/submission-store";
import type { AnswerKey, AssessmentSubmission } from "@/types";
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, CircleDot, Clock } from "lucide-react";

const TIMER_VERSION = "v1";

export function AssessmentRunner({ asesmenId, kuesionerAktif = true }: { asesmenId: string; kuesionerAktif?: boolean }) {
  const assessment = useMemo(() => getAssessment(asesmenId), [asesmenId]);
  const studentId = useMemo(() => getSelectedStudentId(), []);
  const classEntry = useMemo(() => assessment ? getClasses().find((entry) => entry.kelas.id === assessment.kelas_id) : undefined, [assessment]);
  const student = classEntry?.siswa.find((item) => item.id === studentId);
  const submissionId = student ? `submission:${asesmenId}:${student.id}` : "";
  const prior = useMemo(() => submissionId ? getSubmissions().find((item) => item.id === submissionId) : undefined, [submissionId]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerKey>>(prior?.jawaban ?? {});
  const [confirming, setConfirming] = useState(false);
  const [result, setResult] = useState<AssessmentSubmission | undefined>(prior?.selesai ? prior : undefined);
  const submitted = useRef(Boolean(prior?.selesai));
  const timerKey = `lkpd_assessment_timer_${TIMER_VERSION}:${asesmenId}:${studentId ?? "none"}`;
  const [deadline] = useState(() => {
    if (!assessment || !studentId || typeof window === "undefined") return Date.now();
    const stored = Number(localStorage.getItem(timerKey));
    if (Number.isFinite(stored) && stored > 0) return stored;
    const created = Date.now() + Math.max(0, assessment.durasi_menit) * 60_000;
    localStorage.setItem(timerKey, String(created));
    return created;
  });

  useEffect(() => {
    if (!assessment || !student || submitted.current) return;
    const now = new Date().toISOString();
    upsertSubmission({
      id: submissionId, siswa_id: student.id, asesmen_id: assessment.id,
      skor_total: prior?.skor_total ?? 0, level: prior?.level ?? "dasar",
      gaya_belajar: prior?.gaya_belajar ?? student.gaya_belajar,
      detail_per_indikator: prior?.detail_per_indikator ?? {}, jawaban: answers,
      selesai: false, dikerjakan_pada: prior?.dikerjakan_pada ?? now, diperbarui_pada: now,
    });
  }, [answers, assessment, prior, student, submissionId]);

  const submit = useCallback(() => {
    if (!assessment || !student || submitted.current) return;
    submitted.current = true;
    const scored = scoreAssessment(assessment.soal, answers);
    const now = new Date().toISOString();
    const completed: AssessmentSubmission = {
      id: submissionId, siswa_id: student.id, asesmen_id: assessment.id,
      skor_total: scored.score, level: scored.level, gaya_belajar: student.gaya_belajar,
      detail_per_indikator: scored.detail_per_indikator, jawaban: answers,
      selesai: true, dikerjakan_pada: prior?.dikerjakan_pada ?? now, diperbarui_pada: now,
    };
    upsertSubmission(completed);
    updateStudent(assessment.kelas_id, student.id, { level: scored.level } as never);
    localStorage.removeItem(timerKey);
    setConfirming(false);
    setResult(completed);
  }, [answers, assessment, prior, student, submissionId, timerKey]);

  if (!assessment) return <StateMessage title="Asesmen tidak ditemukan" text="ID asesmen pada URL tidak tersedia." />;
  if (assessment.status !== "aktif") return <StateMessage title="Asesmen tidak aktif" text="Asesmen ini belum dibuka atau sudah selesai." />;
  if (!studentId) return <StateMessage title="Siswa belum dipilih" text="Pilih profil siswa terlebih dahulu sebelum mengerjakan asesmen." />;
  if (!student) return <StateMessage title="Akses ditolak" text="Siswa terpilih bukan anggota kelas asesmen ini." />;
  if (!assessment.soal.length) return <StateMessage title="Soal belum tersedia" text="Asesmen aktif ini belum memiliki soal." />;

  if (result) {
    return <div className="mx-auto max-w-2xl p-6"><section className="card text-center"><p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Asesmen Selesai</p><h1 className="mt-3 text-3xl font-semibold">Skor {result.skor_total} · Level {result.level}</h1><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">{Object.entries(result.detail_per_indikator).map(([key, value]) => <div className="rounded-xl bg-[#f2f3fc] p-3" key={key}><b>{key}</b><div>{value.benar}/{value.total}</div></div>)}</div><p className="mt-5 text-[#414753]">Gaya belajar: {result.gaya_belajar ?? "belum diisi"}</p><div className="mt-6">{kuesionerAktif ? <Button href={`/asesmen/kerjakan/${encodeURIComponent(asesmenId)}/gaya-belajar`}>Lanjut: Kenali Gaya Belajarmu</Button> : <Button href="/dashboard-siswa">Ke Dashboard</Button>}</div></section></div>;
  }

  const question = assessment.soal[current];
  return <div><div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-white/90 px-5 py-4 backdrop-blur"><div className="w-48"><div className="flex justify-between text-xs"><span>Progres</span><span>{Object.keys(answers).length}/{assessment.soal.length}</span></div><div className="mt-1 h-1 rounded bg-[#e6e8f1]"><div className="h-full bg-[#0066cc]" style={{ width: `${Object.keys(answers).length / assessment.soal.length * 100}%` }} /></div></div><div className="flex items-center gap-2 rounded-full bg-[#f2f3fc] px-4 py-2"><Clock className="h-4 w-4" />Waktu <Timer deadline={deadline} onExpire={submit} /></div><button className="text-sm text-[#0066cc]" onClick={() => setConfirming(true)}>Akhiri Sesi</button></div><div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:flex-row md:p-6"><main className="min-w-0 flex-1"><p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Soal {current + 1}</p><h1 className="mt-4 text-2xl font-semibold">{question.pertanyaan}</h1><div className="mt-8 space-y-3">{Object.entries(question.pilihan).map(([key, choice]) => <label className={`flex cursor-pointer gap-4 rounded-[18px] p-5 ${answers[question.id] === key ? "bg-blue-100 ring-2 ring-[#0066cc]" : "bg-[#f2f3fc]"}`} key={key}><input checked={answers[question.id] === key} name="jawaban" onChange={() => setAnswers((value) => ({ ...value, [question.id]: key as AnswerKey }))} type="radio" /><span>{key.toUpperCase()}. {choice}</span></label>)}</div><div className="mt-8 flex justify-between"><Button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} variant="ghost"><ArrowLeft className="h-4 w-4" />Sebelumnya</Button>{current < assessment.soal.length - 1 ? <Button onClick={() => setCurrent((value) => value + 1)}>Selanjutnya<ArrowRight className="h-4 w-4" /></Button> : <Button onClick={() => setConfirming(true)}>Selesai &amp; Kumpulkan</Button>}</div></main><aside className="card h-fit w-full md:w-70"><h2 className="font-semibold">Navigasi Soal</h2><div className="mt-4 grid grid-cols-5 gap-2">{assessment.soal.map((item, index) => <button className={`grid aspect-square place-items-center rounded-full ${current === index ? "bg-[#0066cc] text-white" : answers[item.id] ? "bg-emerald-50 text-emerald-700" : "bg-[#e6e8f1]"}`} key={item.id} onClick={() => setCurrent(index)}>{answers[item.id] ? <CheckCircle2 className="h-4 w-4" /> : current === index ? <CircleDot className="h-4 w-4" /> : <Circle className="h-4 w-4" />}{index + 1}</button>)}</div></aside></div>{confirming && <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-5"><div className="card max-w-lg text-center"><h2 className="text-2xl font-semibold">Kumpulkan jawaban?</h2><p className="mt-3">Jawaban yang sudah dikumpulkan tidak dapat diubah.</p><div className="mt-6 flex justify-center gap-3"><Button onClick={() => setConfirming(false)} variant="ghost">Kembali</Button><Button onClick={submit}>Kumpulkan</Button></div></div></div>}</div>;
}

function StateMessage({ title, text }: { title: string; text: string }) {
  return <div className="mx-auto max-w-xl p-6"><section className="card text-center"><h1 className="text-2xl font-semibold">{title}</h1><p className="mt-3 text-[#414753]">{text}</p><Button className="mt-6" href="/dashboard-siswa">Ke Dashboard</Button></section></div>;
}
