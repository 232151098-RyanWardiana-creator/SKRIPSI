import type { PertanyaanGayaBelajar } from "@/types";

export const KUESIONER_GAYA_BELAJAR: PertanyaanGayaBelajar[] = [
  {
    id: "gb-01",
    pertanyaan: "Ketika belajar hal baru, kamu lebih suka...",
    pilihan: {
      a: { teks: "Melihat diagram, gambar, atau tabel", tipe: "visual" },
      b: { teks: "Mendengarkan penjelasan dari guru", tipe: "auditory" },
      c: { teks: "Langsung mencoba atau mempraktikkan sendiri", tipe: "kinestetik" },
    },
  },
  {
    id: "gb-02",
    pertanyaan: "Ketika mengerjakan soal matematika, kamu biasanya...",
    pilihan: {
      a: { teks: "Membuat sketsa atau diagram bantu", tipe: "visual" },
      b: { teks: "Mengulang soal dalam hati atau berbisik", tipe: "auditory" },
      c: { teks: "Langsung menulis langkah demi langkah", tipe: "kinestetik" },
    },
  },
  {
    id: "gb-03",
    pertanyaan: "Kamu lebih mudah mengingat materi jika...",
    pilihan: {
      a: { teks: "Ada mind map atau rangkuman bergambar", tipe: "visual" },
      b: { teks: "Dibaca keras-keras atau didiskusikan", tipe: "auditory" },
      c: { teks: "Dikerjakan dalam latihan soal langsung", tipe: "kinestetik" },
    },
  },
  {
    id: "gb-04",
    pertanyaan: "Saat guru menjelaskan, kamu lebih paham ketika...",
    pilihan: {
      a: { teks: "Guru menulis atau menggambar di papan tulis", tipe: "visual" },
      b: { teks: "Guru menjelaskan dengan cerita atau analogi", tipe: "auditory" },
      c: { teks: "Kamu ikut mencoba mengerjakan bersamaan", tipe: "kinestetik" },
    },
  },
  {
    id: "gb-05",
    pertanyaan: "Ketika mendapat instruksi baru, kamu lebih mudah mengikutinya jika...",
    pilihan: {
      a: { teks: "Ada panduan tertulis bergambar yang jelas", tipe: "visual" },
      b: { teks: "Seseorang menjelaskan langsung kepadamu", tipe: "auditory" },
      c: { teks: "Kamu langsung mencoba sambil belajar", tipe: "kinestetik" },
    },
  },
];

export const LABEL_GAYA_BELAJAR = {
  visual: { label: "Visual", warna: "#7c3aed", deskripsi: "Belajar terbaik melalui gambar, diagram, dan representasi visual" },
  auditory: { label: "Auditory", warna: "#0891b2", deskripsi: "Belajar terbaik melalui penjelasan lisan dan diskusi" },
  kinestetik: { label: "Kinestetik", warna: "#059669", deskripsi: "Belajar terbaik melalui praktik langsung dan pengalaman nyata" },
} as const;
