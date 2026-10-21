import type { AnswerKey, Indikator } from "@/types";

export type TingkatSoal = "mudah" | "sedang" | "sulit";

export interface SoalPenelitian {
  id: string;
  nomor: number;
  indikator: Indikator;
  tingkat: TingkatSoal;
  pertanyaan: string;
  pilihan: Record<AnswerKey, string>;
  jawaban_benar: AnswerKey;
  /** Miskonsepsi yang diwakili tiap pengecoh, untuk telaah validator. */
  pembahasan: string;
}

/**
 * 10 butir tes diagnostik kesiapan belajar materi Rasio untuk penelitian (2 butir per IK-01 s.d. IK-05).
 * Diturunkan dari naskah soal uraian instrumen 04; pengecoh disusun dari miskonsepsi rasio.
 * Butir ini FIXED: yang divalidasi ahli (Aiken's V) adalah butir persis ini, jadi jangan diubah
 * tanpa memperbarui instrumen 04 dan lembar validasi 05.
 */
export const SOAL_PENELITIAN: SoalPenelitian[] = [
  {
    id: "s1",
    nomor: 1,
    indikator: "IK-01",
    tingkat: "mudah",
    pertanyaan: "Di kelas VII-A SMP Negeri 3 Tasikmalaya terdapat 15 siswa laki-laki dan 20 siswa perempuan. Perbandingan banyak siswa laki-laki terhadap banyak seluruh siswa di kelas tersebut dalam bentuk paling sederhana adalah ...",
    pilihan: { a: "3 : 4", b: "3 : 7", c: "4 : 7", d: "15 : 20" },
    jawaban_benar: "b",
    pembahasan: "Seluruh siswa = 15 + 20 = 35, sehingga 15 : 35 = 3 : 7. Pengecoh: 3 : 4 dan 15 : 20 = tertukar bagian-bagian dengan bagian-keseluruhan; 4 : 7 = memakai banyak siswa perempuan.",
  },
  {
    id: "s2",
    nomor: 2,
    indikator: "IK-01",
    tingkat: "mudah",
    pertanyaan: "Pak Budi memiliki dua utas kawat. Kawat pertama panjangnya 2,4 meter dan kawat kedua panjangnya 80 sentimeter. Perbandingan panjang kawat pertama terhadap kawat kedua dalam bentuk paling sederhana adalah ...",
    pilihan: { a: "3 : 100", b: "1 : 3", c: "3 : 1", d: "30 : 1" },
    jawaban_benar: "c",
    pembahasan: "2,4 m = 240 cm, sehingga 240 : 80 = 3 : 1. Pengecoh: 3 : 100 = satuan tidak disetarakan (2,4 : 80); 1 : 3 = urutan terbalik; 30 : 1 = salah konversi (2,4 m dianggap 2.400 cm).",
  },
  {
    id: "s3",
    nomor: 3,
    indikator: "IK-02",
    tingkat: "mudah",
    pertanyaan: "Ibu Nina mencampurkan 350 mL konsentrat sari buah dengan 1.400 mL air mineral. Bentuk paling sederhana dari rasio konsentrat sari buah terhadap air mineral adalah ...",
    pilihan: { a: "1 : 4", b: "4 : 1", c: "35 : 140", d: "1 : 5" },
    jawaban_benar: "a",
    pembahasan: "FPB(350, 1.400) = 350, sehingga 350 : 1.400 = 1 : 4. Pengecoh: 4 : 1 = urutan terbalik; 35 : 140 = belum paling sederhana; 1 : 5 = membandingkan dengan jumlah seluruh campuran.",
  },
  {
    id: "s4",
    nomor: 4,
    indikator: "IK-02",
    tingkat: "sedang",
    pertanyaan: "Rasio banyak kelereng merah terhadap kelereng biru di dalam toples adalah 4 : 7. Jika banyak kelereng merah 28 butir, banyak kelereng biru adalah ...",
    pilihan: { a: "31 butir", b: "49 butir", c: "16 butir", d: "77 butir" },
    jawaban_benar: "b",
    pembahasan: "Faktor pengali 28 : 4 = 7, sehingga biru = 7 × 7 = 49. Pengecoh: 31 = penalaran aditif (selisih 7 − 4 = 3 ditambahkan); 16 = pengali terbalik (28 × 4 : 7); 77 = jumlah seluruh kelereng.",
  },
  {
    id: "s5",
    nomor: 5,
    indikator: "IK-03",
    tingkat: "sedang",
    pertanyaan: "Mobil A menempuh 150 km dalam 2,5 jam, sedangkan Mobil B menempuh 210 km dalam 3,5 jam. Pernyataan yang tepat mengenai kecepatan rata-rata kedua mobil adalah ...",
    pilihan: {
      a: "Mobil A lebih cepat karena waktu tempuhnya lebih singkat",
      b: "Mobil B lebih cepat karena jarak tempuhnya lebih jauh",
      c: "Mobil B lebih cepat karena selisih jarak dan waktunya lebih besar",
      d: "Kedua mobil sama cepat, yaitu 60 km/jam",
    },
    jawaban_benar: "d",
    pembahasan: "150 : 2,5 = 60 km/jam dan 210 : 3,5 = 60 km/jam. Pengecoh a dan b = hanya memperhatikan satu besaran; c = penalaran aditif (membandingkan selisih).",
  },
  {
    id: "s6",
    nomor: 6,
    indikator: "IK-03",
    tingkat: "sedang",
    pertanyaan: "Beras kemasan A seberat 2,5 kg dijual Rp35.000,00, sedangkan kemasan B seberat 5 kg dijual Rp67.500,00. Berdasarkan harga per kilogram, kemasan yang lebih hemat adalah ...",
    pilihan: {
      a: "Kemasan A, karena harga totalnya lebih murah",
      b: "Kemasan A, karena harga per kilogramnya Rp13.500,00",
      c: "Kemasan B, karena harga per kilogramnya Rp13.500,00",
      d: "Keduanya sama hemat karena mereknya sama",
    },
    jawaban_benar: "c",
    pembahasan: "A = Rp35.000 : 2,5 = Rp14.000/kg; B = Rp67.500 : 5 = Rp13.500/kg, sehingga B lebih hemat. Pengecoh: a = membandingkan harga total; b = salah menghitung harga satuan; d = tidak menghitung rasio satuan.",
  },
  {
    id: "s7",
    nomor: 7,
    indikator: "IK-04",
    tingkat: "sedang",
    pertanyaan: "Sebuah mobil memerlukan 6 liter bensin untuk menempuh jarak 72 km. Dengan laju yang sama, banyak bensin yang diperlukan untuk menempuh 180 km adalah ...",
    pilihan: { a: "15 liter", b: "114 liter", c: "2,4 liter", d: "30 liter" },
    jawaban_benar: "a",
    pembahasan: "Perbandingan senilai: 72 : 6 = 12 km/liter, sehingga 180 : 12 = 15 liter. Pengecoh: 114 = penalaran aditif (6 + (180 − 72)); 2,4 = diperlakukan berbalik nilai; 30 = 180 : 6.",
  },
  {
    id: "s8",
    nomor: 8,
    indikator: "IK-04",
    tingkat: "sulit",
    pertanyaan: "Sebuah jembatan direncanakan selesai dalam 40 hari oleh 15 pekerja. Karena target dipercepat menjadi 24 hari, banyak pekerja TAMBAHAN yang diperlukan adalah ...",
    pilihan: { a: "9 orang", b: "10 orang", c: "16 orang", d: "25 orang" },
    jawaban_benar: "b",
    pembahasan: "Perbandingan berbalik nilai: 15 × 40 = 24 × x, x = 25 pekerja, tambahan = 25 − 15 = 10. Pengecoh: 9 = diperlakukan senilai (15 × 24 : 40); 16 = penalaran aditif (40 − 24); 25 = jumlah seluruh pekerja, bukan tambahan.",
  },
  {
    id: "s9",
    nomor: 9,
    indikator: "IK-05",
    tingkat: "sulit",
    pertanyaan: "Pada peta berskala 1 : 400.000, jarak Kota Tasikmalaya ke Kota Ciamis adalah 7,5 cm. Seorang kurir bersepeda motor dengan kecepatan rata-rata 50 km/jam tanpa berhenti. Waktu tempuh kurir tersebut adalah ...",
    pilihan: { a: "3,6 menit", b: "6 jam", c: "36 menit", d: "0,6 menit" },
    jawaban_benar: "c",
    pembahasan: "Jarak = 7,5 × 400.000 = 3.000.000 cm = 30 km; waktu = 30 : 50 = 0,6 jam = 36 menit. Pengecoh: 3,6 menit = salah konversi (3 km); 6 jam = salah konversi (300 km); 0,6 menit = lupa mengubah jam ke menit.",
  },
  {
    id: "s10",
    nomor: 10,
    indikator: "IK-05",
    tingkat: "sulit",
    pertanyaan: "Denah laboratorium komputer berukuran 10 cm × 6 cm dengan skala 1 : 120. Jika setiap meja komputer membutuhkan area 3 m², kapasitas maksimal meja komputer di laboratorium tersebut adalah ...",
    pilihan: { a: "28 unit", b: "29 unit", c: "24 unit", d: "86 unit" },
    jawaban_benar: "a",
    pembahasan: "Ukuran sebenarnya 12 m × 7,2 m = 86,4 m²; 86,4 : 3 = 28,8, dibulatkan ke bawah menjadi 28 unit. Pengecoh: 29 = dibulatkan ke atas; 24 = hanya panjang yang dikonversi (12 × 6); 86 = luas tidak dibagi area per meja.",
  },
];
