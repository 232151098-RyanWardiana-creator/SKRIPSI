import type { AnswerKey, Indikator, IndicatorResult, Level } from "@/types";

/**
 * DATA SIMULASI TERINTEGRASI untuk materi Rasio & Perbandingan (SMP Kelas VII).
 * Sesuai bimbingan & wawancara mitra guru SMPN 3 Tasikmalaya (Ibu Teti Hernawati, S.Pd.).
 *
 * Semua id-nya tetap (hard-coded UUID) supaya:
 *   1. Menekan "Muat Data Simulasi" berulang tidak menumpuk data ganda (upsert).
 *   2. "Hapus Data Simulasi" bisa membersihkan tepat baris-baris ini saja,
 *      tanpa menyentuh data penelitian yang asli.
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

/** 10 butir soal asesmen diagnostik materi Rasio (2 butir per IK-01 s.d IK-05). */
export const DEMO_SOAL: DemoSoal[] = [
  {
    id: "s1",
    nomor: 1,
    indikator: "IK-01",
    jawaban_benar: "b",
    pertanyaan: "Di dalam kelas VII-A terdapat 15 siswa laki-laki dan 20 siswa perempuan. Rasio banyak siswa laki-laki terhadap siswa perempuan adalah ...",
    pilihan: { a: "4 : 3", b: "3 : 4", c: "3 : 7", d: "15 : 35" },
  },
  {
    id: "s2",
    nomor: 2,
    indikator: "IK-01",
    jawaban_benar: "c",
    pertanyaan: "Sebuah resep minuman memerlukan 2 gelas sirup untuk 5 gelas air. Rasio banyak air terhadap sirup adalah ...",
    pilihan: { a: "2 : 5", b: "2 : 7", c: "5 : 2", d: "7 : 5" },
  },
  {
    id: "s3",
    nomor: 3,
    indikator: "IK-02",
    jawaban_benar: "a",
    pertanyaan: "Bentuk paling sederhana dari rasio 24 : 36 adalah ...",
    pilihan: { a: "2 : 3", b: "3 : 4", c: "4 : 6", d: "6 : 9" },
  },
  {
    id: "s4",
    nomor: 4,
    indikator: "IK-02",
    jawaban_benar: "b",
    pertanyaan: "Rasio berikut yang senilai (ekuivalen) dengan 3 : 5 adalah ...",
    pilihan: { a: "6 : 8", b: "9 : 15", c: "12 : 25", d: "15 : 20" },
  },
  {
    id: "s5",
    nomor: 5,
    indikator: "IK-03",
    jawaban_benar: "d",
    pertanyaan: "Harga 4 kg apel adalah Rp60.000. Rasio satuan harga per kilogram apel tersebut adalah ...",
    pilihan: { a: "Rp12.000 / kg", b: "Rp14.000 / kg", c: "Rp20.000 / kg", d: "Rp15.000 / kg" },
  },
  {
    id: "s6",
    nomor: 6,
    indikator: "IK-03",
    jawaban_benar: "c",
    pertanyaan: "Mobil A menempuh 180 km dalam 3 jam, sedangkan Mobil B menempuh 200 km dalam 4 jam. Laju satuan yang tepat adalah ...",
    pilihan: {
      a: "Mobil A = 50 km/jam, Mobil B = 60 km/jam",
      b: "Mobil A = 70 km/jam, Mobil B = 50 km/jam",
      c: "Mobil A = 60 km/jam, Mobil B = 50 km/jam",
      d: "Kedua mobil memiliki laju satuan yang sama",
    },
  },
  {
    id: "s7",
    nomor: 7,
    indikator: "IK-04",
    jawaban_benar: "a",
    pertanyaan: "Sebanyak 3 liter bensin cukup untuk menempuh jarak 45 km. Dengan perbandingan senilai, jarak tempuh jika menggunakan 7 liter bensin adalah ...",
    pilihan: { a: "105 km", b: "95 km", c: "135 km", d: "120 km" },
  },
  {
    id: "s8",
    nomor: 8,
    indikator: "IK-04",
    jawaban_benar: "b",
    pertanyaan: "Suatu renovasi ruang kelas dapat diselesaikan 6 pekerja dalam waktu 12 hari. Jika dikerjakan oleh 9 pekerja, waktu yang diperlukan adalah ...",
    pilihan: { a: "6 hari", b: "8 hari", c: "10 hari", d: "18 hari" },
  },
  {
    id: "s9",
    nomor: 9,
    indikator: "IK-05",
    jawaban_benar: "c",
    pertanyaan: "Jarak kota Tasikmalaya ke Bandung pada peta berskala 1 : 500.000 adalah 16 cm. Jarak sebenarnya antara kedua kota tersebut adalah ...",
    pilihan: { a: "8 km", b: "800 km", c: "80 km", d: "50 km" },
  },
  {
    id: "s10",
    nomor: 10,
    indikator: "IK-05",
    jawaban_benar: "a",
    pertanyaan: "Uang saku Rian dan Dimas berbanding 3 : 5. Jika jumlah uang saku mereka berdua adalah Rp80.000, selisih uang saku mereka adalah ...",
    pilihan: { a: "Rp20.000", b: "Rp30.000", c: "Rp50.000", d: "Rp10.000" },
  },
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
    judul: "LKPD Rasio (Perbandingan) — Kelompok Dasar",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat menjelaskan konsep rasio dua besaran, menyederhanakan rasio sederhana, dan menentukan rasio satuan secara terbimbing (scaffolding).\n\n" +
      "Kegiatan 1 — Memahami Rasio\n" +
      "Rasio adalah perbandingan antara dua besaran yang sejenis. Misalnya perbandingan 12 kelereng merah dan 18 kelereng biru adalah 12 : 18 = 2 : 3.\n\n" +
      "Kegiatan 2 — Mencoba & Mengamati\n" +
      "Kerjakan soal berikut dengan menuliskan bentuk pecahan atau perbandingannya secara bertahap.",
    soal: [
      { id: "d1", nomor: 1, tipe: "isian", pertanyaan: "Di kelas terdapat 16 meja dan 32 kursi. Tuliskan rasio banyak meja terhadap kursi dalam bentuk paling sederhana.", petunjuk: "Bagi kedua bilangan dengan FPB-nya (16)." },
      { id: "d2", nomor: 2, tipe: "isian", pertanyaan: "Ibu mencampur 2 sendok gula dengan 6 sendok tepung. Tentukan rasio gula terhadap tepung.", petunjuk: "Bentuk rasio a : b." },
      { id: "d3", nomor: 3, tipe: "uraian", pertanyaan: "Buktikan apakah rasio 4 : 6 senilai dengan rasio 2 : 3. Tulis langkah pembuktianmu.", petunjuk: "Sederhanakan 4 : 6 dengan membagi masing-masing angka dengan 2." },
      { id: "d4", nomor: 4, tipe: "uraian", pertanyaan: "Harga 3 buah buku tulis adalah Rp15.000. Berapakah harga 1 buah buku tulis (rasio satuan)? Tulis langkah perhitungannya." },
    ],
  },
  {
    id: ID.lkpd.menengah,
    level: "menengah",
    judul: "LKPD Rasio (Perbandingan) — Kelompok Menengah",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat menyelesaikan masalah perbandingan senilai, perbandingan berbalik nilai, dan menentukan laju satuan dalam kehidupan sehari-hari.\n\n" +
      "Kegiatan 1 — Menganalisis Hubungan\n" +
      "Perhatikan: jika jumlah barang bertambah dan total harga ikut bertambah, itu perbandingan senilai. Namun jika pekerja bertambah dan waktu selesai berkurang, itu perbandingan berbalik nilai.\n\n" +
      "Kegiatan 2 — Menyelesaikan Masalah\n" +
      "Selesaikan soal berikut dengan menuliskan persamaan perbandingannya.",
    soal: [
      { id: "m1", nomor: 1, tipe: "uraian", pertanyaan: "Sebuah sepeda motor membutuhkan 3 liter bensin untuk menempuh jarak 75 km. Berapa liter bensin yang diperlukan untuk menempuh jarak 150 km? Tulis langkah perbandingan senilainya." },
      { id: "m2", nomor: 2, tipe: "uraian", pertanyaan: "Pembangunan pos ronda direncanakan selesai dalam 15 hari oleh 4 orang pekerja. Jika ingin selesai dalam 10 hari, berapa banyak pekerja yang harus bekerja?" },
      { id: "m3", nomor: 3, tipe: "uraian", pertanyaan: "Toko A menjual 5 kg beras seharga Rp65.000, sedangkan Toko B menjual 3 kg beras seharga Rp42.000. Toko manakah yang menjual beras lebih murah per kilogramnya? Buktikan dengan rasio satuan." },
      { id: "m4", nomor: 4, tipe: "uraian", pertanyaan: "Perbandingan umur Kakak dan Adik adalah 5 : 3. Jika selisih umur mereka 6 tahun, tentukan umur Kakak dan Adik masing-masing." },
      { id: "m5", nomor: 5, tipe: "isian", pertanyaan: "Buatlah satu contoh soal cerita perbandingan senilai buatanmu sendiri beserta jawabannya." },
    ],
  },
  {
    id: ID.lkpd.mahir,
    level: "mahir",
    judul: "LKPD Rasio (Perbandingan) — Kelompok Mahir",
    konten:
      "Tujuan Pembelajaran\n" +
      "Peserta didik dapat menyelesaikan masalah kontekstual bertingkat (HOTS) yang melibatkan skala peta, rasio gabungan tiga besaran, dan analisis proporsi terbalik.\n\n" +
      "Kegiatan — Pemecahan Masalah HOTS\n" +
      "Bacalah setiap situasi dengan kritis. Gunakan representasi aljabar atau diagram proporsi untuk membuktikan jawabanmu.",
    soal: [
      { id: "h1", nomor: 1, tipe: "uraian", pertanyaan: "Pada peta berskala 1 : 1.200.000, jarak kota A dan B adalah 7,5 cm. Sebuah bus berangkat dari kota A pukul 07.30 dengan laju rata-rata 60 km/jam. Pukul berapa bus tiba di kota B? Tulis langkah lengkapmu." },
      { id: "h2", nomor: 2, tipe: "uraian", pertanyaan: "Perbandingan luas kebun Pak Budi dan Pak Joko adalah 4 : 7. Jika selisih luas kebun mereka 450 m², tentukan luas kebun Pak Budi dan total luas kedua kebun tersebut." },
      { id: "h3", nomor: 3, tipe: "uraian", pertanyaan: "Proyek perbaikan jalan ditargetkan selesai 30 hari oleh 24 pekerja. Setelah 10 hari bekerja, pekerjaan terhenti 4 hari karena hujan lebat. Berapa tambahan pekerja yang harus ditambah agar proyek selesai tepat waktu?" },
      { id: "h4", nomor: 4, tipe: "uraian", pertanyaan: "Rasio takaran tepung, gula, dan mentega untuk adonan kue adalah 5 : 3 : 2. Jika seorang koki memiliki 500 gram tepung dan ingin menghabiskan seluruh tepung itu dengan proporsi yang tepat, berapa gram gula dan mentega yang harus disiapkan?" },
      { id: "h5", nomor: 5, tipe: "uraian", pertanyaan: "Periksa kebenaran pernyataan ini: 'Jika laju sebuah kendaraan digandakan menjadi 2 kali lipat, maka waktu tempuh untuk jarak yang sama juga menjadi 2 kali lipat.' Benar atau salah? Jelaskan letak kekeliruannya berdasarkan konsep perbandingan berbalik nilai." },
    ],
  },
];

/**
 * Kondisi pengisian LKPD tiap siswa materi Rasio.
 */
export const DEMO_PENGISIAN: Record<
  string,
  { status: "draft" | "terkirim" | "dinilai"; nilai?: number; catatan?: string; isi: Record<string, string> }
> = {
  "Aisyah Nurhaliza": {
    status: "dinilai",
    nilai: 88,
    catatan: "Langkah perhitungan skala, proporsi, dan analisis perbandingan berbalik nilai sangat runtut dan sistematis. Pertahankan penalaran matematis yang kritis ini!",
    isi: {
      h1: "Jarak sebenarnya = 7,5 cm x 1.200.000 = 9.000.000 cm = 90 km. Waktu tempuh = 90 km : 60 km/jam = 1,5 jam (1 jam 30 menit). Bus tiba pukul 07.30 + 01.30 = 09.00.",
      h2: "Selisih perbandingan = 7 - 4 = 3 bagian. 1 bagian = 450 m² : 3 = 150 m². Luas kebun Pak Budi = 4 x 150 = 600 m². Total luas kedua kebun = (4 + 7) x 150 = 1.650 m².",
      h3: "Sisa pekerjaan = (30 - 10) x 24 = 480 orang-hari. Sisa waktu = 20 - 4 = 16 hari. Kebutuhan pekerja = 480 : 16 = 30 pekerja. Tambahan pekerja = 30 - 24 = 6 orang pekerja.",
      h4: "Tepung = 5 bagian = 500 gram, artinya 1 bagian = 100 gram. Gula = 3 x 100 = 300 gram. Mentega = 2 x 100 = 200 gram.",
      h5: "Salah. Laju kendaraan dan waktu tempuh merupakan perbandingan berbalik nilai. Jika kecepatan naik menjadi 2 kali lipat, maka waktu tempuh justru berkurang menjadi setengahnya (1/2 kali).",
    },
  },
  "Bagas Prasetyo": {
    status: "terkirim",
    isi: {
      m1: "3 liter = 75 km, jadi 1 liter = 25 km. Untuk 150 km butuh 150 : 25 = 6 liter bensin.",
      m2: "Perbandingan berbalik nilai: 15 x 4 = 10 x p -> 60 = 10p -> p = 6 pekerja.",
      m3: "Toko A = Rp65.000 / 5 = Rp13.000/kg. Toko B = Rp42.000 / 3 = Rp14.000/kg. Toko A lebih murah.",
      m4: "Selisih bagian = 5 - 3 = 2. 1 bagian = 6 : 2 = 3 tahun. Kakak = 15 tahun, Adik = 9 tahun.",
      m5: "Harga 2 pulpen Rp6.000, berapa harga 5 pulpen? Jawab: Rp15.000.",
    },
  },
  "Citra Ayu Lestari": {
    status: "dinilai",
    nilai: 75,
    catatan: "Jawaban nomor 1, 2, dan 4 sudah sangat baik. Nomor 3 perlu penjelasan detail rasio satuan.",
    isi: {
      h1: "Jarak sebenarnya 90 km. Waktu tempuh 1,5 jam. Tiba pukul 09.00.",
      h2: "Kebun Pak Budi = 600 m². Total luas = 1.650 m².",
      h3: "Butuh tambahan 6 pekerja.",
      h4: "Gula = 300 gram dan mentega = 200 gram.",
      h5: "Pernyataan salah karena harusnya waktu tempuh makin cepat (setengahnya).",
    },
  },
  "Dimas Ardiansyah": {
    status: "draft",
    isi: {
      m1: "75 / 3 = 25 km/liter. 150 km butuh 6 liter.",
      m2: "6 pekerja",
      m3: "Toko A Rp13.000, Toko B Rp14.000. Toko A lebih hemat.",
      m4: "",
      m5: "",
    },
  },
  "Elsa Ramadhani": {
    status: "terkirim",
    isi: {
      d1: "16 : 32 = 1 : 2.",
      d2: "Gula : tepung = 2 : 6 = 1 : 3.",
      d3: "Senilai, karena 4 : 6 jika sama-sama dibagi 2 hasilnya adalah 2 : 3.",
      d4: "Harga 1 buku = Rp15.000 : 3 = Rp5.000 per buku.",
    },
  },
  "Fajar Nugraha": {
    status: "draft",
    isi: {
      d1: "16 : 32 dibagi 16 jadi 1 : 2",
      d2: "2 : 6",
      d3: "",
      d4: "Rp5.000",
    },
  },
  "Gita Puspita": {
    status: "terkirim",
    isi: {
      h1: "7,5 cm x 1.200.000 = 90 km. 90 / 60 = 1,5 jam. Sampai jam 09.00.",
      h2: "450 / 3 = 150. Pak Budi = 4 x 150 = 600 m². Total = 11 x 150 = 1.650 m².",
      h3: "Sisa 480 orang-hari : 16 hari = 30 orang. Tambahan = 6 orang.",
      h4: "Gula 300 g, mentega 200 g.",
      h5: "Salah karena berbalik nilai.",
    },
  },
  "Hafiz Maulana": {
    status: "draft",
    isi: {
      d1: "1 banding 2",
      d2: "2 banding 6",
      d3: "",
      d4: "",
    },
  },
};
