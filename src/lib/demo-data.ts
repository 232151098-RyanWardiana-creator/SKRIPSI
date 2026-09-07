import type { AnswerKey, Indikator, IndicatorResult, Level } from "@/types";

/**
 * DATA SIMULASI TERINTEGRASI untuk presentasi/demo.
 *
 * Semua id-nya tetap (hard-coded UUID) supaya:
 *   1. Menekan "Muat Data Simulasi" berulang tidak menumpuk data ganda (upsert).
 *   2. "Hapus Data Simulasi" bisa membersihkan tepat baris-baris ini saja,
 *      tanpa menyentuh data penelitian yang asli.
 *
 * Rantai ceritanya utuh: 1 kelas → 8 siswa → 1 asesmen diagnostik + hasil tiap
 * siswa → level & gaya belajar terisi → 3 LKPD berdiferensiasi (dasar/menengah/
 * mahir) yang sudah dibagikan → pengisian siswa dalam tiga kondisi (masih
 * dikerjakan, sudah dikumpulkan, sudah dinilai). Jadi setiap layar aplikasi ada
 * isinya saat didemokan.
 */

export const DEMO_PIN = "1234";
export const DEMO_KODE_KELAS = "SIMULASI-01";

const ID = {
  kelas: "d0000000-0000-4000-8000-000000000001",
  asesmen: "d0000000-0000-4000-8000-000000000002",
  lkpd: {
    dasar: "d0000000-0000-4000-8000-000000000010",
    menengah: "d0000000-0000-4000-8000-000000000011",
    mahir: "d0000000-0000-4000-8000-000000000012",
  },
} as const;

export const DEMO_IDS = ID;

export const DEMO_KELAS = {
  id: ID.kelas,
  nama: "VII-A (Simulasi)",
  tahun_ajaran: "2026/2027",
  kode_undangan: DEMO_KODE_KELAS,
  wali_kelas: "Teti Hernawati, S.Pd.",
  jumlah_siswa: 8,
};

interface DemoSiswa {
  id: string;
  nama: string;
  no_absen: number;
  nisn: string;
  gaya_belajar: "visual" | "auditory" | "kinestetik";
  /** Kunci jawaban yang dipilih siswa ini, dipakai untuk menghitung skor. */
  pilihan: AnswerKey[];
}

/** 8 siswa dengan pola jawaban berbeda agar levelnya menyebar. */
export const DEMO_SISWA: DemoSiswa[] = [
  { id: "d1000000-0000-4000-8000-000000000001", nama: "Aisyah Nurhaliza", no_absen: 1, nisn: "0091234501", gaya_belajar: "visual",     pilihan: ["b","c","a","b","d","c","a","b","c","a"] },
  { id: "d1000000-0000-4000-8000-000000000002", nama: "Bagas Prasetyo",   no_absen: 2, nisn: "0091234502", gaya_belajar: "kinestetik", pilihan: ["b","c","a","b","d","c","a","c","b","d"] },
  { id: "d1000000-0000-4000-8000-000000000003", nama: "Citra Ayu Lestari",no_absen: 3, nisn: "0091234503", gaya_belajar: "auditory",   pilihan: ["b","c","a","d","d","c","b","b","c","a"] },
  { id: "d1000000-0000-4000-8000-000000000004", nama: "Dimas Ardiansyah", no_absen: 4, nisn: "0091234504", gaya_belajar: "visual",     pilihan: ["b","a","a","b","c","c","a","b","d","a"] },
  { id: "d1000000-0000-4000-8000-000000000005", nama: "Elsa Ramadhani",   no_absen: 5, nisn: "0091234505", gaya_belajar: "auditory",   pilihan: ["a","c","c","b","d","a","a","b","c","b"] },
  { id: "d1000000-0000-4000-8000-000000000006", nama: "Fajar Nugraha",    no_absen: 6, nisn: "0091234506", gaya_belajar: "kinestetik", pilihan: ["b","d","a","b","a","c","d","b","c","c"] },
  { id: "d1000000-0000-4000-8000-000000000007", nama: "Gita Puspita",     no_absen: 7, nisn: "0091234507", gaya_belajar: "visual",     pilihan: ["c","c","b","b","d","b","a","d","c","a"] },
  { id: "d1000000-0000-4000-8000-000000000008", nama: "Hafiz Maulana",    no_absen: 8, nisn: "0091234508", gaya_belajar: "kinestetik", pilihan: ["a","b","a","c","d","c","a","b","a","d"] },
];

interface DemoSoal {
  id: string;
  nomor: number;
  pertanyaan: string;
  pilihan: Record<AnswerKey, string>;
  jawaban_benar: AnswerKey;
  indikator: Indikator;
}

/** 10 butir, 2 butir per indikator IK-01..IK-05. */
export const DEMO_SOAL: DemoSoal[] = [
  { id: "s1", nomor: 1, indikator: "IK-01", jawaban_benar: "b",
    pertanyaan: "Suhu di dalam lemari pendingin tercatat 5 derajat di bawah nol. Bilangan bulat yang tepat untuk menyatakan suhu itu adalah ...",
    pilihan: { a: "5", b: "-5", c: "0", d: "15" } },
  { id: "s2", nomor: 2, indikator: "IK-01", jawaban_benar: "c",
    pertanyaan: "Pada garis bilangan, letak bilangan -3 berada ...",
    pilihan: { a: "di kanan angka 0", b: "tepat di angka 0", c: "di kiri angka 0", d: "di kanan angka 3" } },
  { id: "s3", nomor: 3, indikator: "IK-02", jawaban_benar: "a",
    pertanyaan: "Urutan bilangan -7, 2, -1, 5 dari yang terkecil ke terbesar adalah ...",
    pilihan: { a: "-7, -1, 2, 5", b: "-1, -7, 2, 5", c: "5, 2, -1, -7", d: "-7, 2, -1, 5" } },
  { id: "s4", nomor: 4, indikator: "IK-02", jawaban_benar: "b",
    pertanyaan: "Tanda yang tepat untuk -8 ... -3 adalah ...",
    pilihan: { a: "lebih dari", b: "kurang dari", c: "sama dengan", d: "tidak dapat dibandingkan" } },
  { id: "s5", nomor: 5, indikator: "IK-03", jawaban_benar: "d",
    pertanyaan: "Hasil dari -6 + 9 adalah ...",
    pilihan: { a: "-15", b: "-3", c: "15", d: "3" } },
  { id: "s6", nomor: 6, indikator: "IK-03", jawaban_benar: "c",
    pertanyaan: "Hasil dari 4 - (-7) adalah ...",
    pilihan: { a: "-11", b: "-3", c: "11", d: "3" } },
  { id: "s7", nomor: 7, indikator: "IK-04", jawaban_benar: "a",
    pertanyaan: "Hasil dari (-5) x 6 adalah ...",
    pilihan: { a: "-30", b: "30", c: "-11", d: "11" } },
  { id: "s8", nomor: 8, indikator: "IK-04", jawaban_benar: "b",
    pertanyaan: "Hasil dari (-48) : (-6) adalah ...",
    pilihan: { a: "-8", b: "8", c: "-42", d: "42" } },
  { id: "s9", nomor: 9, indikator: "IK-05", jawaban_benar: "c",
    pertanyaan: "Seorang penyelam berada 12 meter di bawah permukaan laut, lalu naik 5 meter. Posisi penyelam sekarang adalah ...",
    pilihan: { a: "17 meter di bawah permukaan", b: "5 meter di bawah permukaan", c: "7 meter di bawah permukaan", d: "7 meter di atas permukaan" } },
  { id: "s10", nomor: 10, indikator: "IK-05", jawaban_benar: "a",
    pertanyaan: "Saldo tabungan Rani Rp150.000. Ia menabung Rp75.000, lalu menarik Rp200.000. Saldo Rani menjadi ...",
    pilihan: { a: "Rp25.000", b: "Rp425.000", c: "-Rp25.000", d: "Rp125.000" } },
];

export function levelDariSkor(skor: number): Level {
  if (skor >= 80) return "mahir";
  if (skor >= 60) return "menengah";
  return "dasar";
}

/** Menilai satu siswa dengan aturan yang sama seperti asesmen sungguhan. */
export function nilaiDemoSiswa(pilihan: AnswerKey[]) {
  const jawaban: Record<string, AnswerKey> = {};
  const perIndikator: Record<string, IndicatorResult> = {};
  let benar = 0;

  DEMO_SOAL.forEach((soal, index) => {
    const dipilih = pilihan[index] ?? "a";
    jawaban[soal.id] = dipilih;
    const tepat = dipilih === soal.jawaban_benar;
    if (tepat) benar += 1;

    const rekap = perIndikator[soal.indikator] ?? { benar: 0, total: 0, dikuasai: false };
    rekap.total += 1;
    if (tepat) rekap.benar += 1;
    rekap.dikuasai = rekap.benar / rekap.total >= 0.6;
    perIndikator[soal.indikator] = rekap;
  });

  const skor = Math.round((benar / DEMO_SOAL.length) * 100);
  return { jawaban, detail_per_indikator: perIndikator, skor_total: skor, level: levelDariSkor(skor) };
}

interface DemoLkpd {
  id: string;
  level: Level;
  judul: string;
  konten: string;
  soal: { id: string; nomor: number; pertanyaan: string; petunjuk?: string; tipe: "isian" | "uraian" }[];
}

export const DEMO_LKPD: DemoLkpd[] = [
  {
    id: ID.lkpd.dasar,
    level: "dasar",
    judul: "LKPD Bilangan Bulat — Kelompok Dasar",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat mengenali bilangan bulat positif dan negatif serta menempatkannya pada garis bilangan.\n\n" +
      "Kegiatan 1 — Mengamati\n" +
      "Perhatikan garis bilangan berikut. Angka di sebelah kiri nol adalah bilangan negatif, di sebelah kanan nol adalah bilangan positif.\n\n" +
      "Kegiatan 2 — Mencoba\n" +
      "Kerjakan soal di bawah bersama teman sebangkumu. Tulis langkahmu, bukan hanya hasil akhirnya.",
    soal: [
      { id: "d1", nomor: 1, tipe: "isian", pertanyaan: "Tulislah tiga contoh bilangan bulat negatif yang kamu temui dalam kehidupan sehari-hari.", petunjuk: "Contoh: suhu kulkas, kedalaman laut." },
      { id: "d2", nomor: 2, tipe: "isian", pertanyaan: "Manakah yang lebih kecil, -4 atau -9? Tulis jawabanmu." },
      { id: "d3", nomor: 3, tipe: "uraian", pertanyaan: "Gambarkan garis bilangan dari -5 sampai 5, lalu jelaskan di mana letak -2.", petunjuk: "Boleh dijelaskan dengan kata-kata jika sulit menggambar." },
      { id: "d4", nomor: 4, tipe: "uraian", pertanyaan: "Suhu ruangan 20 derajat, lalu turun 25 derajat. Berapa suhunya sekarang? Tulis langkah pengerjaanmu." },
    ],
  },
  {
    id: ID.lkpd.menengah,
    level: "menengah",
    judul: "LKPD Bilangan Bulat — Kelompok Menengah",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat melakukan operasi penjumlahan, pengurangan, perkalian, dan pembagian bilangan bulat.\n\n" +
      "Kegiatan 1 — Menemukan Pola\n" +
      "Amati hasil perkalian berikut: (-2) x 3 = -6, (-2) x (-3) = 6. Apa pola tandanya?\n\n" +
      "Kegiatan 2 — Menerapkan\n" +
      "Selesaikan soal berikut dengan menuliskan setiap langkahnya.",
    soal: [
      { id: "m1", nomor: 1, tipe: "uraian", pertanyaan: "Jelaskan pola tanda pada perkalian dua bilangan bulat negatif. Mengapa hasilnya positif?" },
      { id: "m2", nomor: 2, tipe: "uraian", pertanyaan: "Hitunglah -15 + 28 - (-7). Tulis langkahnya satu per satu." },
      { id: "m3", nomor: 3, tipe: "uraian", pertanyaan: "Hitunglah (-9) x 4 : (-6). Kerjakan urut dari kiri ke kanan." },
      { id: "m4", nomor: 4, tipe: "uraian", pertanyaan: "Sebuah lift berada di lantai 3, turun 7 lantai, lalu naik 2 lantai. Di lantai berapa lift sekarang? Tulis kalimat matematikanya." },
      { id: "m5", nomor: 5, tipe: "isian", pertanyaan: "Tulis satu soal cerita buatanmu sendiri yang menggunakan bilangan bulat negatif." },
    ],
  },
  {
    id: ID.lkpd.mahir,
    level: "mahir",
    judul: "LKPD Bilangan Bulat — Kelompok Mahir",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat menyelesaikan masalah kontekstual bertingkat (HOTS) yang melibatkan operasi bilangan bulat.\n\n" +
      "Kegiatan — Memecahkan Masalah\n" +
      "Bacalah setiap situasi dengan teliti. Kamu diminta bukan hanya menghitung, tetapi juga menjelaskan alasan dan memeriksa kembali jawabanmu.",
    soal: [
      { id: "h1", nomor: 1, tipe: "uraian", pertanyaan: "Suhu puncak gunung -8 derajat pada pukul 05.00, naik 3 derajat setiap dua jam. Berapa suhunya pukul 11.00? Tulis pola yang kamu gunakan." },
      { id: "h2", nomor: 2, tipe: "uraian", pertanyaan: "Saldo awal Rp250.000. Terjadi 4 kali penarikan masing-masing Rp80.000 dan 2 kali setoran masing-masing Rp125.000. Tentukan saldo akhir dan jelaskan apakah saldo pernah negatif." },
      { id: "h3", nomor: 3, tipe: "uraian", pertanyaan: "Dua penyelam berada di -18 m dan -25 m. Berapa selisih kedalaman mereka? Jelaskan mengapa hasilnya positif meski kedua bilangannya negatif." },
      { id: "h4", nomor: 4, tipe: "uraian", pertanyaan: "Buat satu masalah kontekstual yang jawabannya adalah -12, lalu selesaikan masalah buatanmu itu." },
      { id: "h5", nomor: 5, tipe: "uraian", pertanyaan: "Periksa pekerjaan temanmu berikut: -6 - (-10) = -16. Benar atau salah? Jelaskan letak kesalahannya dan tulis jawaban yang tepat." },
    ],
  },
];

/**
 * Kondisi pengisian LKPD tiap siswa, dibuat bertingkat supaya layar penilaian
 * guru punya contoh ketiga status sekaligus.
 */
export const DEMO_PENGISIAN: Record<
  string,
  { status: "draft" | "terkirim" | "dinilai"; nilai?: number; catatan?: string; isi: Record<string, string> }
> = {
  "Aisyah Nurhaliza": {
    status: "dinilai",
    nilai: 88,
    catatan: "Langkah pengerjaan rapi dan alasannya jelas. Perhatikan penulisan tanda kurung pada nomor 3.",
    isi: {
      m1: "Karena mengurangi bilangan negatif sama dengan menambah. Jadi tandanya berubah menjadi positif.",
      m2: "-15 + 28 = 13, lalu 13 - (-7) = 13 + 7 = 20.",
      m3: "(-9) x 4 = -36, lalu -36 : (-6) = 6.",
      m4: "3 - 7 + 2 = -2. Jadi lift ada di lantai -2, yaitu 2 lantai di bawah tanah.",
      m5: "Suhu es krim di freezer -7 derajat, dikeluarkan lalu naik 10 derajat. Berapa suhunya?",
    },
  },
  "Bagas Prasetyo": {
    status: "terkirim",
    isi: {
      m1: "Karena negatif kali negatif hasilnya positif.",
      m2: "-15 + 28 = 13. 13 + 7 = 20.",
      m3: "-36 : -6 = 6",
      m4: "3 - 7 = -4, terus + 2 = -2",
      m5: "",
    },
  },
  "Citra Ayu Lestari": {
    status: "dinilai",
    nilai: 75,
    catatan: "Jawaban nomor 2 dan 4 sudah tepat. Nomor 1 perlu penjelasan alasan, bukan hanya hasil.",
    isi: {
      m1: "Hasilnya positif.",
      m2: "13 - (-7) = 20",
      m3: "6",
      m4: "Lantai -2",
      m5: "Kedalaman kolam -3 meter.",
    },
  },
  "Dimas Ardiansyah": {
    status: "draft",
    isi: { d1: "Suhu kulkas, kedalaman laut, dan utang.", d2: "-9 lebih kecil", d3: "", d4: "" },
  },
  "Elsa Ramadhani": {
    status: "terkirim",
    isi: {
      d1: "Suhu di kulkas, dasar laut, lantai basement.",
      d2: "Yang lebih kecil -9 karena letaknya lebih jauh ke kiri dari nol.",
      d3: "Garis bilangan -5 sampai 5. Angka -2 ada di kiri nol, dua langkah dari nol.",
      d4: "20 - 25 = -5. Jadi suhunya -5 derajat.",
    },
  },
  "Fajar Nugraha": {
    status: "draft",
    isi: { d1: "Kulkas dan laut", d2: "", d3: "", d4: "" },
  },
  "Gita Puspita": {
    status: "terkirim",
    isi: {
      h1: "Dari 05.00 ke 11.00 ada 6 jam, berarti 3 kali kenaikan. -8 + 3 + 3 + 3 = 1 derajat.",
      h2: "250.000 - 320.000 = -70.000, lalu + 250.000 = 180.000. Saldo pernah negatif setelah penarikan keempat.",
      h3: "-18 - (-25) = 7 meter. Positif karena yang dicari jarak, bukan posisi.",
      h4: "Suhu -4 turun 8 derajat menjadi -12.",
      h5: "Salah. Seharusnya -6 + 10 = 4.",
    },
  },
  "Hafiz Maulana": {
    status: "draft",
    isi: { d1: "Suhu dingin", d2: "-9", d3: "", d4: "" },
  },
};
