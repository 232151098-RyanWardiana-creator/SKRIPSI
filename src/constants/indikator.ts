import type { Indikator, Level } from "@/types";

export const INDIKATOR_KOMPETENSI: Record<Indikator, string> = {
  "IK-01": "Mengenal konsep bilangan bulat positif dan negatif",
  "IK-02": "Membandingkan dan mengurutkan bilangan bulat",
  "IK-03": "Melakukan operasi penjumlahan dan pengurangan bilangan bulat",
  "IK-04": "Melakukan operasi perkalian dan pembagian bilangan bulat",
  "IK-05": "Menyelesaikan masalah kontekstual yang melibatkan bilangan bulat (HOTS)",
};
export const KLASIFIKASI_LEVEL: Record<Level, { min: number; max: number; label: string; color: string }> = {
  dasar: { min: 0, max: 59, label: "Dasar", color: "#dc2626" },
  menengah: { min: 60, max: 79, label: "Menengah", color: "#d97706" },
  mahir: { min: 80, max: 100, label: "Mahir", color: "#1d4ed8" },
};
