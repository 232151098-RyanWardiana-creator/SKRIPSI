import type { Asesmen, GayaBelajar, Indikator, Kelas, Level, Siswa } from "@/types";

export interface KelasMock extends Kelas {
  wali_kelas: string;
}

export interface SiswaMock extends Siswa {
  kelas_id: string;
  no_absen: number;
  gaya_belajar: GayaBelajar;
}

export interface HasilMock {
  siswa_id: string;
  nama: string;
  skor: number;
  level: Level;
  indikator: Indikator[];
  indikator_lemah: Indikator[];
}

export interface DataKelasMock {
  kelas: KelasMock;
  siswa: SiswaMock[];
  hasil: HasilMock[];
  ringkasan: {
    dasar: { jumlah: number; rata_rata: number; indikator_lemah: Indikator[] };
    menengah: { jumlah: number; rata_rata: number; indikator_lemah: Indikator[] };
    mahir: { jumlah: number; rata_rata: number; indikator_lemah: Indikator[] };
  };
}

const kelasA: KelasMock = { id: "7a", nama: "VII-A", wali_kelas: "Budi Santoso, S.Pd.", tahun_ajaran: "2026/2027", kode_undangan: "VIIA-9K2", guru_id: "g1", jumlah_siswa: 32 };
const kelasB: KelasMock = { id: "7b", nama: "VII-B", wali_kelas: "Sari Dewi, M.Pd.", tahun_ajaran: "2026/2027", kode_undangan: "VIIB-4M1", guru_id: "g1", jumlah_siswa: 28 };

const namaA = ["Ani Wulandari", "Beni Saputra", "Cici Maharani", "Dodi Kurniawan", "Eka Safitri", "Fajar Ramadhan", "Gita Permata", "Hana Azzahra", "Indra Pratama", "Jihan Nuraini", "Kiki Firmansyah", "Laila Khairunnisa", "Muhammad Rizky", "Nabila Putri", "Oki Setiawan", "Putri Amelia", "Rafi Akbar", "Salsa Nabila", "Tegar Maulana", "Ulfa Rahma", "Vino Aditya", "Widia Lestari", "Yogi Prakoso", "Zahra Aulia", "Aditya Nugraha", "Bella Anjani", "Cahyo Pamungkas", "Dinda Larasati", "Farhan Hakim", "Intan Sari", "Kevin Alfarizi", "Mira Oktaviani"];
const namaB = ["Agus Setiaji", "Bela Aprilia", "Candra Wijaya", "Dewi Anggraini", "Eko Susanto", "Fitri Handayani", "Galih Purnama", "Hesti Rahayu", "Ivan Gunawan", "Joko Purnomo", "Kartika Sari", "Lina Marlina", "Maya Kusuma", "Nanda Prameswari", "Oscar Mahendra", "Puspita Dewi", "Qori Aisyah", "Reza Fahlevi", "Sinta Melati", "Tommy Irawan", "Umar Faruq", "Vania Putri", "Wahyu Hidayat", "Yuni Astuti", "Zaki Mubarak", "Arum Sekar", "Bagas Wicaksono", "Nisa Ramadhani"];

const polaGayaA: Exclude<GayaBelajar, null>[] = [
  "visual", "kinestetik", "auditory", "visual", "kinestetik", "visual", "auditory", "visual",
  "kinestetik", "auditory", "visual", "visual", "auditory", "kinestetik", "visual", "auditory",
  "visual", "kinestetik", "auditory", "visual", "kinestetik", "visual", "auditory", "visual",
  "kinestetik", "auditory", "visual", "auditory", "visual", "kinestetik", "visual", "kinestetik",
];
const polaGayaB: Exclude<GayaBelajar, null>[] = [
  "auditory", "visual", "kinestetik", "auditory", "visual", "kinestetik", "visual", "auditory",
  "visual", "kinestetik", "visual", "auditory", "kinestetik", "visual", "auditory", "visual",
  "kinestetik", "visual", "auditory", "kinestetik", "visual", "auditory", "visual", "kinestetik",
  "visual", "auditory", "visual", "kinestetik",
];

function buatSiswa(kelas: KelasMock, nama: string[], polaGaya: Exclude<GayaBelajar, null>[]): SiswaMock[] {
  return nama.map((namaSiswa, index) => ({
    id: `${kelas.id}-s${index + 1}`,
    kelas_id: kelas.id,
    no_absen: index + 1,
    nama: namaSiswa,
    nisn: `006${kelas.id === "7a" ? "1" : "2"}${String(index + 1).padStart(6, "0")}`,
    bergabung: `2026-07-${String(8 + (index % 10)).padStart(2, "0")}`,
    gaya_belajar: polaGaya[index],
  }));
}

const siswaA = buatSiswa(kelasA, namaA, polaGayaA);
const siswaB = buatSiswa(kelasB, namaB, polaGayaB);
const polaIndikator: Indikator[][] = [["IK-01"], ["IK-01", "IK-02"], ["IK-01", "IK-05"], ["IK-01", "IK-02", "IK-05"], ["IK-01", "IK-03", "IK-05"], ["IK-01", "IK-02", "IK-04", "IK-05"]];

function buatHasil(siswa: SiswaMock[], skor: number[], batasDasar: number, batasMenengah: number, lemahDasar: Indikator[]): HasilMock[] {
  return siswa.map((item, index) => {
    const level: Level = index < batasDasar ? "dasar" : index < batasDasar + batasMenengah ? "menengah" : "mahir";
    const indikator = level === "mahir" ? (["IK-01", "IK-02", "IK-03", "IK-04", ...(index % 2 ? [] : ["IK-05" as Indikator])] as Indikator[]) : polaIndikator[index % polaIndikator.length];
    const indikatorLemah = (["IK-01", "IK-02", "IK-03", "IK-04", "IK-05"] as Indikator[]).filter((ik) => !indikator.includes(ik));
    return { siswa_id: item.id, nama: item.nama, skor: skor[index], level, indikator, indikator_lemah: level === "dasar" ? lemahDasar.filter((ik, i) => i !== index % lemahDasar.length || lemahDasar.length === 2) : indikatorLemah };
  });
}

const skorA = [35, 38, 40, 41, 42, 44, 47, 49, 60, 61, 63, 64, 65, 66, 67, 67, 68, 68, 69, 69, 70, 71, 72, 73, 74, 77, 81, 83, 85, 87, 89, 91];
const skorB = [28, 30, 32, 34, 36, 37, 39, 40, 42, 44, 46, 48, 62, 64, 66, 68, 70, 71, 72, 74, 76, 79, 79, 82, 85, 88, 91, 94];

export const dataKelasMock: DataKelasMock[] = [
  { kelas: kelasA, siswa: siswaA, hasil: buatHasil(siswaA, skorA, 8, 18, ["IK-03", "IK-04"]), ringkasan: { dasar: { jumlah: 8, rata_rata: 42, indikator_lemah: ["IK-03", "IK-04"] }, menengah: { jumlah: 18, rata_rata: 68, indikator_lemah: ["IK-03"] }, mahir: { jumlah: 6, rata_rata: 86, indikator_lemah: [] } } },
  { kelas: kelasB, siswa: siswaB, hasil: buatHasil(siswaB, skorB, 12, 11, ["IK-02", "IK-03", "IK-04"]), ringkasan: { dasar: { jumlah: 12, rata_rata: 38, indikator_lemah: ["IK-02", "IK-03", "IK-04"] }, menengah: { jumlah: 11, rata_rata: 71, indikator_lemah: ["IK-03", "IK-04"] }, mahir: { jumlah: 5, rata_rata: 88, indikator_lemah: [] } } },
];

export const kelasMock = dataKelasMock.map(({ kelas }) => kelas);
export const siswaMock = dataKelasMock.flatMap(({ siswa }) => siswa);
export const hasilMock = dataKelasMock[0].hasil;
const templateSoal = [
  { pertanyaan: "Suhu 4°C turun 9°C. Berapa suhu sekarang?", pilihan: ["−13°C", "−5°C", "5°C", "13°C"], benar: 1, indikator: "IK-01" },
  { pertanyaan: "Urutan bilangan dari terkecil adalah ...", pilihan: ["−2, −5, 0, 3", "−5, −2, 0, 3", "0, −2, −5, 3", "3, 0, −2, −5"], benar: 1, indikator: "IK-02" },
  { pertanyaan: "Hasil dari −12 + 7 adalah ...", pilihan: ["−19", "−5", "5", "19"], benar: 1, indikator: "IK-03" },
  { pertanyaan: "Hasil dari (−6) × (−4) adalah ...", pilihan: ["−24", "−10", "10", "24"], benar: 3, indikator: "IK-04" },
  { pertanyaan: "Lift dari lantai 3 turun 7 lantai, berhenti di ...", pilihan: ["−10", "−4", "4", "10"], benar: 1, indikator: "IK-05" },
] as const;
const answerKeys = ["a", "b", "c", "d"] as const;
export const asesmenMock: Asesmen[] = dataKelasMock.map(({ kelas }) => {
  const id = `bilbul-${kelas.id}`;
  return { id, judul: `Diagnostik Bilangan Bulat ${kelas.nama}`, materi: "Bilangan Bulat", kelas_id: kelas.id, durasi_menit: 30, tanggal_mulai: "2026-08-08", tanggal_selesai: "2026-08-10", status: "selesai", soal: templateSoal.map((item, index) => ({ id: `${id}-q${index + 1}`, asesmen_id: id, nomor: index + 1, pertanyaan: item.pertanyaan, pilihan: { a: item.pilihan[0], b: item.pilihan[1], c: item.pilihan[2], d: item.pilihan[3] }, jawaban_benar: answerKeys[item.benar], indikator: item.indikator })) };
});
export const submissionsMock: AssessmentSubmission[] = dataKelasMock.flatMap(({ kelas, siswa, hasil }) => {
  const asesmenId = `bilbul-${kelas.id}`;
  return hasil.map((h) => {
    const student = siswa.find((s) => s.id === h.siswa_id);
    const detail_per_indikator: Record<string, IndicatorResult> = {};
    (["IK-01", "IK-02", "IK-03", "IK-04", "IK-05"] as Indikator[]).forEach((ik) => {
      const dikuasai = h.indikator.includes(ik);
      detail_per_indikator[ik] = { benar: dikuasai ? 1 : 0, total: 1, dikuasai };
    });
    return {
      id: `sub-${asesmenId}-${h.siswa_id}`,
      siswa_id: h.siswa_id,
      asesmen_id: asesmenId,
      skor_total: h.skor,
      level: h.level,
      gaya_belajar: student?.gaya_belajar ?? "visual",
      detail_per_indikator,
      jawaban: {
        [`${asesmenId}-q1`]: "b",
        [`${asesmenId}-q2`]: "b",
        [`${asesmenId}-q3`]: "b",
        [`${asesmenId}-q4`]: "d",
        [`${asesmenId}-q5`]: "b",
      },
      selesai: true,
      dikerjakan_pada: "2026-08-09T08:30:00.000Z",
      diperbarui_pada: "2026-08-09T08:50:00.000Z",
    };
  });
});

