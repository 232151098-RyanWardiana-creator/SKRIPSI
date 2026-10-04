import test from "node:test";
import assert from "node:assert/strict";
import { bagiKelompokTaRL } from "./tarl-grouping";
import type { SiswaMock } from "@/types";

function buatMockSiswa(id: string, nama: string, level: "dasar" | "menengah" | "mahir"): SiswaMock {
  return {
    id,
    nama,
    kelas_id: "kelas-1",
    no_absen: 1,
    gaya_belajar: "visual",
    level,
    bergabung: "2026-10-04",
  };
}

test("pembagian kelompok homogen TaRL: 30 siswa (10 dasar, 10 menengah, 10 mahir) menjadi kelompok beranggotakan 5", () => {
  const siswa: SiswaMock[] = [];
  for (let i = 1; i <= 10; i++) siswa.push(buatMockSiswa(`d-${i}`, `Siswa Dasar ${i}`, "dasar"));
  for (let i = 1; i <= 10; i++) siswa.push(buatMockSiswa(`m-${i}`, `Siswa Menengah ${i}`, "menengah"));
  for (let i = 1; i <= 10; i++) siswa.push(buatMockSiswa(`h-${i}`, `Siswa Mahir ${i}`, "mahir"));

  const hasil = bagiKelompokTaRL(siswa, 5);

  assert.equal(hasil.length, 30, "Total siswa tidak boleh berkurang atau bertambah");

  // Periksa bahwa setiap siswa memiliki nama kelompok
  hasil.forEach((s) => {
    assert.ok(s.kelompok, `Siswa ${s.nama} harus memiliki kelompok`);
  });

  // Kumpulkan anggota per kelompok
  const groups: Record<string, SiswaMock[]> = {};
  hasil.forEach((s) => {
    const k = s.kelompok!;
    if (!groups[k]) groups[k] = [];
    groups[k].push(s);
  });

  // Harus ada 6 kelompok (2 bimbingan, 2 berkembang, 2 mahir)
  const namaKelompokList = Object.keys(groups);
  assert.equal(namaKelompokList.length, 6, "Harus menghasilkan tepat 6 kelompok");

  // Periksa homogenitas tier dan juru tulis per kelompok
  namaKelompokList.forEach((namaK) => {
    const anggota = groups[namaK];
    assert.equal(anggota.length, 5, `Kelompok ${namaK} harus beranggotakan 5 siswa`);

    // Pastikan semua anggota di kelompok ini memiliki level yang sama (homogen)
    const levelPertama = anggota[0].level;
    anggota.forEach((a) => {
      assert.equal(a.level, levelPertama, `Semua anggota ${namaK} harus berada di level yang sama (${levelPertama})`);
    });

    // Pastikan tepat ada 1 juru tulis per kelompok
    const juruTulisList = anggota.filter((a) => a.is_juru_tulis);
    assert.equal(juruTulisList.length, 1, `Kelompok ${namaK} harus memiliki tepat 1 Juru Tulis`);
  });
});

test("pembagian kelompok menangani jumlah ganjil tanpa menghilangkan siswa", () => {
  const siswa: SiswaMock[] = [];
  for (let i = 1; i <= 7; i++) siswa.push(buatMockSiswa(`m-${i}`, `Siswa Menengah ${i}`, "menengah"));

  const hasil = bagiKelompokTaRL(siswa, 4);

  assert.equal(hasil.length, 7, "Semua 7 siswa harus tetap ada");

  const groups: Record<string, SiswaMock[]> = {};
  hasil.forEach((s) => {
    const k = s.kelompok!;
    if (!groups[k]) groups[k] = [];
    groups[k].push(s);
  });

  // Total siswa di seluruh kelompok = 7
  const totalAnggota = Object.values(groups).reduce((acc, g) => acc + g.length, 0);
  assert.equal(totalAnggota, 7);

  // Setiap kelompok memiliki tepat 1 juru tulis
  Object.entries(groups).forEach(([namaK, anggota]) => {
    const juruTulis = anggota.filter((a) => a.is_juru_tulis);
    assert.equal(juruTulis.length, 1, `Kelompok ${namaK} harus memiliki tepat 1 juru tulis`);
  });
});

test("pembagian kelompok dengan daftar siswa kosong mengembalikan array kosong", () => {
  const hasil = bagiKelompokTaRL([]);
  assert.deepEqual(hasil, []);
});
