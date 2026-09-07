"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { KUESIONER_GAYA_BELAJAR, LABEL_GAYA_BELAJAR } from "@/constants/gaya-belajar";
import { fetchAsesmenSiswa, type HasilSiswa } from "@/lib/student-assessments";
import type { GayaBelajar } from "@/types";
import { ArrowLeft, ArrowRight } from "lucide-react";

type TipeGaya = Exclude<GayaBelajar, null>;
type KunciPilihan = "a" | "b" | "c";

export function KuesionerGayaBelajar({ asesmenId }: { asesmenId: string }) {
  const [memuat, setMemuat] = useState(true);
  const [pesan, setPesan] = useState<string | null>(null);
  const [submission, setSubmission] = useState<HasilSiswa | null>(null);
  const [langkah, setLangkah] = useState(0);
  const [jawaban, setJawaban] = useState<Partial<Record<string, TipeGaya>>>({});
  const [hasil, setHasil] = useState<TipeGaya | null>(null);

  useEffect(() => {
    void (async () => {
      const data = await fetchAsesmenSiswa();
      if (!data) return setPesan("Kamu belum masuk."), setMemuat(false);
      const milik = data.hasilSaya.find((item) => item.asesmen_id === asesmenId && item.selesai);
      if (!milik) return setPesan("Selesaikan asesmen terlebih dahulu."), setMemuat(false);
      setSubmission(milik);
      if (milik.gaya_belajar) setHasil(milik.gaya_belajar as TipeGaya);
      setMemuat(false);
    })();
  }, [asesmenId]);

  const question = useMemo(() => KUESIONER_GAYA_BELAJAR[langkah], [langkah]);

  const finish = async () => {
    const ordered = KUESIONER_GAYA_BELAJAR.map((item) => jawaban[item.id]).filter(
      (item): item is TipeGaya => Boolean(item)
    );
    const counts = ordered.reduce<Record<TipeGaya, number>>(
      (total, value) => ({ ...total, [value]: total[value] + 1 }),
      { visual: 0, auditory: 0, kinestetik: 0 }
    );
    const highest = Math.max(...Object.values(counts));
    const value = ordered.find((item) => counts[item] === highest);
    if (!value) return;
    const res = await fetch("/api/siswa/gaya-belajar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ gayaBelajar: value, asesmenId }),
    });
    if (!res.ok) return setPesan("Gagal menyimpan hasil. Coba lagi.");
    setHasil(value);
  };

  if (memuat) return <Message title="Memuat…" />;
  if (pesan && !submission) return <Message title={pesan} />;
  if (!submission) return <Message title="Data tidak tersedia" />;

  if (hasil) {
    return (
      <section className="mx-auto max-w-2xl rounded-[24px] bg-white p-6 text-center shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Hasil Final</p>
        <h1 className="mt-3 text-3xl font-semibold">
          Skor {submission.skor_total} · Level {submission.level}
        </h1>
        <h2 className="mt-4 text-2xl font-semibold">Gaya belajar: {LABEL_GAYA_BELAJAR[hasil].label}</h2>
        <p className="mx-auto mt-4 max-w-lg text-[#414753]">{LABEL_GAYA_BELAJAR[hasil].deskripsi}.</p>
        <Button className="mt-7" href="/dashboard-siswa">
          Selesai
        </Button>
      </section>
    );
  }

  const selected = jawaban[question.id];
  return (
    <section className="mx-auto max-w-3xl rounded-[24px] bg-white p-5 shadow-sm sm:p-9">
      <div className="flex justify-between text-sm">
        <b className="text-[#0066cc]">Kenali Gaya Belajarmu</b>
        <span>
          Pertanyaan {langkah + 1} dari {KUESIONER_GAYA_BELAJAR.length}
        </span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-[#e6e8f1]">
        <div
          className="h-full rounded-full bg-[#0066cc]"
          style={{ width: `${((langkah + 1) / KUESIONER_GAYA_BELAJAR.length) * 100}%` }}
        />
      </div>
      <p className="mt-3 text-xs text-[#6b7280]">
        Skor {submission.skor_total} · Level {submission.level}
      </p>
      <h1 className="mt-7 text-2xl font-semibold">{question.pertanyaan}</h1>
      <div className="mt-6 grid gap-3">
        {(Object.entries(question.pilihan) as [KunciPilihan, (typeof question.pilihan)[KunciPilihan]][]).map(
          ([key, choice]) => (
            <button
              className={`min-h-20 rounded-[18px] border-2 p-5 text-left ${
                selected === choice.tipe ? "border-[#0066cc] bg-blue-50" : "border-[#e0e0e0]"
              }`}
              key={key}
              onClick={() => setJawaban((current) => ({ ...current, [question.id]: choice.tipe }))}
              type="button"
            >
              <b className="mr-3">{key.toUpperCase()}.</b>
              {choice.teks}
            </button>
          )
        )}
      </div>
      <div className="mt-8 flex justify-between">
        <Button disabled={langkah === 0} onClick={() => setLangkah((value) => value - 1)} variant="ghost">
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </Button>
        <Button
          disabled={!selected}
          onClick={() =>
            langkah === KUESIONER_GAYA_BELAJAR.length - 1 ? void finish() : setLangkah((value) => value + 1)
          }
        >
          {langkah === KUESIONER_GAYA_BELAJAR.length - 1 ? "Lihat Hasil" : "Lanjut"}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
      {pesan && (
        <p className="mt-4 text-sm text-red-700" role="alert">
          {pesan}
        </p>
      )}
    </section>
  );
}

function Message({ title }: { title: string }) {
  return (
    <section className="card mx-auto max-w-xl text-center">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <Button className="mt-6" href="/dashboard-siswa">
        Ke Dashboard
      </Button>
    </section>
  );
}
