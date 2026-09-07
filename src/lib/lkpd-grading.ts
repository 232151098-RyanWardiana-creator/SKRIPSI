"use client";

import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import type { Level } from "@/types";
import { itemLkpd, type ItemLkpd } from "@/lib/lkpd-items";

/**
 * Sisi GURU untuk penilaian LKPD.
 *
 * `jawaban` di sini HANYA dibaca, tidak pernah ditulis: guru mengisi `nilai`
 * dan `catatan_guru`, sehingga jawaban asli siswa tetap utuh sebagai data
 * mentah penelitian.
 */
export interface PengisianLkpdGuru {
  id: string;
  lkpdId: string;
  siswaId: string;
  namaSiswa: string;
  jawaban: Record<string, string>;
  status: "draft" | "terkirim" | "dinilai";
  nilai: number | null;
  catatanGuru: string | null;
  dikirimPada: string | null;
  diperbaruiPada: string;
}

export interface LkpdUntukDinilai {
  id: string;
  judul: string;
  materi: string;
  level: Level;
  kelasNama: string;
  butir: ItemLkpd[];
  pengisian: PengisianLkpdGuru[];
}

async function ambilPenilaian(): Promise<LkpdUntukDinilai[]> {
  if (!isSupabaseConfigured) return [];
  {
    const [{ data: dokumen }, { data: pengisian }] = await Promise.all([
      supabase
        .from("lkpd_documents")
        .select("id,judul,materi,level,konten,soal,kelas_nama,dibagikan")
        .eq("dibagikan", true)
        .order("dibuat_pada", { ascending: false }),
      supabase
        .from("lkpd_submissions")
        .select("*")
        .order("diperbarui_pada", { ascending: false }),
    ]);

    const perLkpd = new Map<string, PengisianLkpdGuru[]>();
    for (const row of pengisian ?? []) {
      const list = perLkpd.get(row.lkpd_id) ?? [];
      list.push({
        id: row.id,
        lkpdId: row.lkpd_id,
        siswaId: row.siswa_id,
        namaSiswa: row.nama_siswa,
        jawaban: (row.jawaban ?? {}) as Record<string, string>,
        status: row.status,
        nilai: row.nilai === null ? null : Number(row.nilai),
        catatanGuru: row.catatan_guru ?? null,
        dikirimPada: row.dikirim_pada ?? null,
        diperbaruiPada: row.diperbarui_pada,
      });
      perLkpd.set(row.lkpd_id, list);
    }

    return (dokumen ?? []).map((row) => ({
      id: row.id,
      judul: row.judul,
      materi: row.materi ?? "",
      level: row.level as Level,
      kelasNama: row.kelas_nama ?? "",
      butir: itemLkpd(row.soal, row.konten ?? ""),
      pengisian: perLkpd.get(row.id) ?? [],
    }));
  }
}

export function useLkpdPenilaian() {
  const [data, setData] = useState<LkpdUntukDinilai[] | undefined>(undefined);
  const [tick, setTick] = useState(0);
  const muatUlang = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    let hidup = true;
    void ambilPenilaian().then((hasil) => {
      if (hidup) setData(hasil);
    });
    if (!isSupabaseConfigured) return () => { hidup = false; };
    const channel = supabase
      .channel(`penilaian-lkpd-${Math.random().toString(36).slice(2, 9)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "lkpd_submissions" }, muatUlang)
      .subscribe();
    return () => {
      hidup = false;
      void supabase.removeChannel(channel);
    };
  }, [tick, muatUlang]);

  return { data, muatUlang };
}

/** Guru menyimpan nilai + catatan. Kolom `jawaban` tidak disentuh. */
export async function simpanNilai(
  pengisianId: string,
  nilai: number,
  catatan: string
): Promise<boolean> {
  if (!isSupabaseConfigured) return false;
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("lkpd_submissions")
    .update({
      nilai,
      catatan_guru: catatan.trim() || null,
      status: "dinilai",
      dinilai_pada: new Date().toISOString(),
      dinilai_oleh: user?.id ?? null,
    })
    .eq("id", pengisianId);
  if (error) return console.error("Gagal menyimpan nilai:", error), false;
  return true;
}
