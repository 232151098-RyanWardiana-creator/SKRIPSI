"use client";

import { useEffect, useState } from "react";

/**
 * Identitas siswa yang sedang login, selalu dari server (cookie httpOnly).
 * Tidak ada localStorage: siswa tidak bisa mengganti identitasnya dari browser.
 */
export interface SesiSiswa {
  siswaId: string;
  kelasId: string;
  nama: string;
  noAbsen: number | null;
  level: string | null;
  gayaBelajar: string | null;
  kelasNama: string;
  kodeKelas: string;
}

export const STUDENT_SESSION_EVENT = "lkpd_student_session_updated";

export function notifySessionChanged() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(STUDENT_SESSION_EVENT));
  }
}

export async function fetchSesiSiswa(): Promise<SesiSiswa | null> {
  try {
    const res = await fetch("/api/siswa/me", { cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { siswa: SesiSiswa | null };
    return data.siswa;
  } catch (err) {
    console.warn("Gagal membaca sesi siswa:", err);
    return null;
  }
}

export async function logoutSiswa() {
  await fetch("/api/siswa/logout", { method: "POST" });
  notifySessionChanged();
}

/** `undefined` = masih memuat, `null` = belum masuk. */
export function useSesiSiswa() {
  const [sesi, setSesi] = useState<SesiSiswa | null | undefined>(undefined);

  useEffect(() => {
    let aktif = true;
    const muat = () => {
      fetchSesiSiswa()
        .then((hasil) => {
          if (aktif) setSesi(hasil);
        })
        .catch(() => {
          if (aktif) setSesi(null);
        });
    };

    muat();

    window.addEventListener(STUDENT_SESSION_EVENT, muat);
    return () => {
      aktif = false;
      window.removeEventListener(STUDENT_SESSION_EVENT, muat);
    };
  }, []);

  return sesi;
}
