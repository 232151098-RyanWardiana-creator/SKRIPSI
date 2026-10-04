import type { SiswaMock, Level } from "@/types";

export interface HasilGrupTaRL {
  nama: string;
  level: Level | "belum_asesmen";
  labelLevel: string;
  anggota: SiswaMock[];
  juruTulisId: string;
}

/**
 * Mengelompokkan siswa secara homogen berdasarkan kesiapan belajar TaRL (BSKAP 2024).
 * Siswa dalam tier yang sama dikelompokkan bersama, dan 1 siswa pertama di setiap
 * kelompok ditugaskan sebagai Juru Tulis (pemegang device pengerjaan).
 */
export function bagiKelompokTaRL(
  siswaList: SiswaMock[],
  ukuranKelompok: number = 5
): SiswaMock[] {
  if (!siswaList || siswaList.length === 0) return [];
  const targetUkuran = Math.max(2, ukuranKelompok);

  // 1. Kelompokkan siswa berdasarkan kesiapan belajar
  const tiers: Record<string, SiswaMock[]> = {
    dasar: [],
    menengah: [],
    mahir: [],
    belum_asesmen: [],
  };

  siswaList.forEach((s) => {
    const lvl = s.level || "belum_asesmen";
    if (tiers[lvl]) {
      tiers[lvl].push({ ...s });
    } else {
      tiers.belum_asesmen.push({ ...s });
    }
  });

  const levelConfigs: Array<{
    key: string;
    namaPrefix: string;
  }> = [
    { key: "dasar", namaPrefix: "Kelompok Bimbingan" },
    { key: "menengah", namaPrefix: "Kelompok Berkembang" },
    { key: "mahir", namaPrefix: "Kelompok Mahir" },
    { key: "belum_asesmen", namaPrefix: "Kelompok Umum" },
  ];

  const hasilSiswa: SiswaMock[] = [];

  levelConfigs.forEach(({ key, namaPrefix }) => {
    const pool = [...tiers[key]];
    if (pool.length === 0) return;

    // Acak urutan siswa dalam tier yang sama (Fisher-Yates)
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    // Hitung pembagian kelompok
    const jumlahKelompok = Math.max(1, Math.round(pool.length / targetUkuran));
    const kelompokBuckets: SiswaMock[][] = Array.from({ length: jumlahKelompok }, () => []);

    pool.forEach((s, idx) => {
      const bucketIdx = idx % jumlahKelompok;
      kelompokBuckets[bucketIdx].push(s);
    });

    kelompokBuckets.forEach((grup, gIdx) => {
      if (grup.length === 0) return;
      const namaKelompok = `${namaPrefix} ${gIdx + 1}`;

      grup.forEach((anggota, aIdx) => {
        hasilSiswa.push({
          ...anggota,
          kelompok: namaKelompok,
          is_juru_tulis: aIdx === 0, // Siswa pertama menjadi Juru Tulis default
        });
      });
    });
  });

  return hasilSiswa;
}

/**
 * Helper pembagi kelompok yang mengembalikan format grup berstruktur (KelompokPreview)
 * untuk antarmuka modal guru.
 */
export function kelompokkanTaRL(
  siswaList: SiswaMock[],
  ukuranKelompok: number = 5
): HasilGrupTaRL[] {
  const siswaUpdated = bagiKelompokTaRL(siswaList, ukuranKelompok);
  const groupsMap = new Map<string, HasilGrupTaRL>();

  siswaUpdated.forEach((s) => {
    if (!s.kelompok) return;
    if (!groupsMap.has(s.kelompok)) {
      groupsMap.set(s.kelompok, {
        nama: s.kelompok,
        level: s.level || "belum_asesmen",
        labelLevel:
          s.level === "dasar"
            ? "Perlu Bimbingan"
            : s.level === "menengah"
            ? "Berkembang"
            : s.level === "mahir"
            ? "Mahir"
            : "Belum Asesmen",
        anggota: [],
        juruTulisId: "",
      });
    }
    const grp = groupsMap.get(s.kelompok)!;
    grp.anggota.push(s);
    if (s.is_juru_tulis) {
      grp.juruTulisId = s.id;
    }
  });

  return Array.from(groupsMap.values());
}
