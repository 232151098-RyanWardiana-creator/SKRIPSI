"use client";

import { useEffect, useState } from "react";
import type { AnswerKey, AssessmentStatus, Indikator, IndicatorResult, Level } from "@/types";
import { STUDENT_SESSION_EVENT } from "@/lib/student-session";

/** Soal versi siswa: tanpa kunci jawaban (dibuang di server). */
export interface SoalSiswa {
  id: string;
  nomor: number;
  pertanyaan: string;
  pilihan: Record<AnswerKey, string>;
  indikator: Indikator;
}

export interface AsesmenSiswa {
  id: string;
  judul: string;
  materi: string;
  durasi_menit: number;
  status: AssessmentStatus;
  kuesioner_aktif: boolean;
  soal: SoalSiswa[];
  tanggal_mulai: string | null;
  tanggal_selesai: string | null;
  deskripsi: string | null;
}

export interface HasilSiswa {
  id: string;
  asesmen_id: string;
  skor_total: number;
  level: Level;
  gaya_belajar: string | null;
  jawaban: Record<string, AnswerKey>;
  detail_per_indikator: Record<string, IndicatorResult>;
  selesai: boolean;
  dikerjakan_pada: string;
}

export interface DataSiswa {
  siswa: {
    siswaId: string;
    kelasId: string;
    nama: string;
    noAbsen: number | null;
    level: string | null;
    gayaBelajar: string | null;
    kelasNama: string;
    kodeKelas: string;
  };
  asesmen: AsesmenSiswa[];
  hasilSaya: HasilSiswa[];
}

/** Asesmen + hasil milik siswa yang sedang login. `null` bila belum masuk. */
export async function fetchAsesmenSiswa(): Promise<DataSiswa | null> {
  try {
    const res = await fetch("/api/siswa/asesmen", { cache: "no-store" });
    return res.ok ? ((await res.json()) as DataSiswa) : null;
  } catch (err) {
    console.warn("Gagal membaca asesmen siswa:", err);
    return null;
  }
}

/** `undefined` = masih memuat, `null` = belum masuk. */
export function useDataSiswa() {
  const [data, setData] = useState<DataSiswa | null | undefined>(undefined);

  useEffect(() => {
    let aktif = true;
    const muat = () => {
      fetchAsesmenSiswa()
        .then((hasil) => {
          if (aktif) setData(hasil);
        })
        .catch(() => {
          if (aktif) setData(null);
        });
    };

    muat();

    window.addEventListener(STUDENT_SESSION_EVENT, muat);
    return () => {
      aktif = false;
      window.removeEventListener(STUDENT_SESSION_EVENT, muat);
    };
  }, []);

  return data;
}
