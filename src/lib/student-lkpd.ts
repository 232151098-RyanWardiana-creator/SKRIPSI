"use client";

import { useCallback, useEffect, useState } from "react";
import type { ItemLkpd } from "@/lib/lkpd-items";
import type { Level } from "@/types";
import { STUDENT_SESSION_EVENT } from "@/lib/student-session";

export interface PengisianSaya {
  jawaban: Record<string, string>;
  status: "draft" | "terkirim" | "dinilai";
  nilai: number | null;
  catatanGuru: string | null;
  dikirimPada: string | null;
  diperbaruiPada: string | null;
}

export interface LkpdSiswa {
  id: string;
  judul: string;
  materi: string;
  level: Level;
  konten: string;
  dibuatPada: string;
  butir: ItemLkpd[];
  pengisian: PengisianSaya | null;
}

/** `undefined` = masih memuat, `null` = belum masuk. */
export function useLkpdSiswa() {
  const [data, setData] = useState<LkpdSiswa[] | null | undefined>(undefined);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const batal = new AbortController();
    fetch("/api/siswa/lkpd", { cache: "no-store", signal: batal.signal })
      .then((res) => (res.ok ? (res.json() as Promise<{ lkpd: LkpdSiswa[] }>) : null))
      .then((json) => setData(json ? json.lkpd : null))
      .catch(() => undefined);

    const onSession = () => setTick((n) => n + 1);
    window.addEventListener(STUDENT_SESSION_EVENT, onSession);

    return () => {
      batal.abort();
      window.removeEventListener(STUDENT_SESSION_EVENT, onSession);
    };
  }, [tick]);

  return { data, muatUlang: useCallback(() => setTick((n) => n + 1), []) };
}

/** Simpan draft (kirim=false) atau kumpulkan ke guru (kirim=true). */
export async function simpanPengisianLkpd(
  lkpdId: string,
  jawaban: Record<string, string>,
  kirim: boolean
): Promise<{ ok: boolean; error?: string }> {
  const res = await fetch(`/api/siswa/lkpd/${lkpdId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jawaban, kirim }),
  });
  if (res.ok) return { ok: true };
  const json = (await res.json().catch(() => null)) as { error?: string } | null;
  return { ok: false, error: json?.error ?? "Gagal menyimpan." };
}
