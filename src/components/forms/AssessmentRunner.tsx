"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Timer } from "@/components/ui/Timer";
import { Button } from "@/components/ui/Button";
import { fetchAsesmenSiswa, type AsesmenSiswa, type HasilSiswa } from "@/lib/student-assessments";
import type { AnswerKey, IndicatorResult } from "@/types";
import { ArrowLeft, ArrowRight, Clock } from "lucide-react";

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
    <div>
      <div className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b bg-white/90 px-5 py-4 backdrop-blur">
        <div className="w-48">
          <div className="flex justify-between text-xs">
            <span>Progres</span>
            <span>
              {terjawab}/{asesmen.soal.length}
            </span>
          </div>
          <div className="mt-1 h-1 rounded bg-[#e6e8f1]">
            <div className="h-full bg-[#0066cc]" style={{ width: `${(terjawab / asesmen.soal.length) * 100}%` }} />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-[#f2f3fc] px-4 py-2">
          <Clock className="h-4 w-4" />
          Waktu {deadline && <Timer deadline={deadline} onExpire={() => void submit()} />}
        </div>
        <button className="text-sm text-[#0066cc]" onClick={() => setConfirming(true)} type="button">
          Akhiri Sesi
        </button>
      </div>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 p-4 md:flex-row md:p-6">
        <main className="min-w-0 flex-1">
          <p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Soal {current + 1}</p>
          <h1 className="mt-4 text-2xl font-semibold">{question.pertanyaan}</h1>
          <div className="mt-8 space-y-3">
            {Object.entries(question.pilihan).map(([key, choice]) => (
              <label
                className={`flex cursor-pointer gap-4 rounded-[18px] p-5 ${
                  answers[question.id] === key ? "bg-blue-100 ring-2 ring-[#0066cc]" : "bg-[#f2f3fc]"
                }`}
                key={key}
              >
                <input
                  checked={answers[question.id] === key}
                  name="jawaban"
                  onChange={() => setAnswers((value) => ({ ...value, [question.id]: key as AnswerKey }))}
                  type="radio"
                />
                <span>
                  {key.toUpperCase()}. {choice}
                </span>
              </label>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Button disabled={current === 0} onClick={() => setCurrent((value) => value - 1)} variant="ghost">
              <ArrowLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            {current < asesmen.soal.length - 1 ? (
              <Button onClick={() => setCurrent((value) => value + 1)}>
                Selanjutnya
                <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={() => setConfirming(true)}>Selesai &amp; Kumpulkan</Button>
            )}
          </div>
          {pesan && (
            <p className="mt-4 text-sm text-red-700" role="alert">
              {pesan}
            </p>
          )}
        </main>

        <aside className="card h-fit w-full md:w-70">
          <h2 className="text-sm font-semibold">Navigasi Soal</h2>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {asesmen.soal.map((item, index) => (
              <button
                aria-label={`Ke soal ${index + 1}`}
                className={`h-9 rounded-lg text-xs font-semibold ${
                  index === current
                    ? "bg-[#0066cc] text-white"
                    : answers[item.id]
                      ? "bg-blue-100 text-blue-800"
                      : "bg-[#f2f3fc] text-slate-600"
                }`}
                key={item.id}
                onClick={() => setCurrent(index)}
                type="button"
              >
                {index + 1}
              </button>
            ))}
          </div>
        </aside>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6">
            <h2 className="text-lg font-semibold">Kumpulkan jawaban?</h2>
            <p className="mt-2 text-sm text-[#414753]">
              Kamu menjawab {terjawab} dari {asesmen.soal.length} soal. Jawaban tidak dapat diubah setelah
              dikumpulkan.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <Button onClick={() => setConfirming(false)} variant="ghost">
                Batal
              </Button>
              <Button onClick={() => void submit()}>Kumpulkan</Button>
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
