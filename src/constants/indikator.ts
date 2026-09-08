import type { Indikator, Level } from "@/types";

export const INDIKATOR_KOMPETENSI: Record<Indikator, string> = {
  "IK-01": "Menjelaskan konsep rasio dan menyatakan perbandingan dua besaran",
  "IK-02": "Menyederhanakan rasio dan menentukan rasio ekuivalen (senilai)",
  "IK-03": "Menentukan rasio satuan serta membandingkan laju atau harga satuan",
  "IK-04": "Menyelesaikan masalah perbandingan senilai dan berbalik nilai",
  "IK-05": "Menyelesaikan masalah kontekstual yang melibatkan rasio dan skala peta (HOTS)",
};

export const KLASIFIKASI_LEVEL: Record<Level, { min: number; max: number; label: string; color: string }> = {
  dasar: { min: 0, max: 59, label: "Dasar", color: "#dc2626" },
  menengah: { min: 60, max: 79, label: "Menengah", color: "#d97706" },
  mahir: { min: 80, max: 100, label: "Mahir", color: "#1d4ed8" },
};
