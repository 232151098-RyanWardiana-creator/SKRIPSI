/**
 * Butir LKPD yang bisa diisi siswa.
 *
 * Sumber utamanya kolom `lkpd_documents.soal` (JSONB) — itulah yang dipakai
 * LKPD hasil simulasi maupun LKPD yang butirnya disusun eksplisit. LKPD lama
 * hasil generate AI hanya punya `konten` markdown, jadi butirnya diambil dari
 * baris bernomor di dalam konten itu. Kalau tetap tidak ketemu, siswa diberi
 * satu kolom jawaban bebas supaya LKPD tetap bisa dikerjakan.
 */
export interface ItemLkpd {
  id: string;
  nomor: number;
  pertanyaan: string;
  petunjuk?: string;
  /** "uraian" = kotak jawaban besar, "isian" = satu baris. */
  tipe: "isian" | "uraian";
}

const bersih = (value: string) =>
  value
    .replace(/\*\*/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function itemLkpd(soal: unknown, konten: string): ItemLkpd[] {
  if (Array.isArray(soal) && soal.length) {
    const items = soal
      .map((raw, index): ItemLkpd | null => {
        if (typeof raw !== "object" || raw === null) return null;
        const row = raw as Record<string, unknown>;
        const pertanyaan = typeof row.pertanyaan === "string" ? bersih(row.pertanyaan) : "";
        if (!pertanyaan) return null;
        return {
          id: typeof row.id === "string" && row.id ? row.id : `butir-${index + 1}`,
          nomor: typeof row.nomor === "number" ? row.nomor : index + 1,
          pertanyaan,
          petunjuk: typeof row.petunjuk === "string" ? bersih(row.petunjuk) : undefined,
          tipe: row.tipe === "isian" ? "isian" : "uraian",
        };
      })
      .filter((item): item is ItemLkpd => item !== null);
    if (items.length) return items;
  }

  const dariKonten: ItemLkpd[] = [];
  for (const baris of konten.split("\n")) {
    const cocok = /^\s*(\d{1,2})[.)]\s+(.{10,})$/.exec(baris);
    if (!cocok) continue;
    const pertanyaan = bersih(cocok[2]);
    if (pertanyaan.length < 10) continue;
    dariKonten.push({
      id: `konten-${cocok[1]}-${dariKonten.length + 1}`,
      nomor: dariKonten.length + 1,
      pertanyaan,
      tipe: "uraian",
    });
    if (dariKonten.length >= 12) break;
  }
  if (dariKonten.length) return dariKonten;

  return [
    {
      id: "jawaban-bebas",
      nomor: 1,
      pertanyaan: "Tulis seluruh jawaban dan langkah pengerjaanmu di sini.",
      petunjuk: "Kerjakan sesuai urutan kegiatan pada LKPD di atas.",
      tipe: "uraian",
    },
  ];
}

/** Berapa butir yang sudah dijawab (tidak kosong). */
export function hitungTerisi(items: ItemLkpd[], jawaban: Record<string, string>) {
  const terisi = items.filter((item) => (jawaban[item.id] ?? "").trim().length > 0).length;
  return {
    terisi,
    total: items.length,
    persen: items.length ? Math.round((terisi / items.length) * 100) : 0,
  };
}
