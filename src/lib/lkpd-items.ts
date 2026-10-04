import { splitLkpdContent } from "@/lib/lkpd-utils";

/**
 * Butir LKPD yang bisa diisi siswa.
 */
export interface ItemLkpd {
  id: string;
  nomor: number;
  pertanyaan: string;
  petunjuk?: string;
  tipe: "isian" | "uraian";
}

const bersihkanJudul = (value: string) =>
  value
    .replace(/\*\*/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function itemLkpd(soal: unknown, konten: string): ItemLkpd[] {
  // 1. Jika ada array soal JSONB eksplisit
  if (Array.isArray(soal) && soal.length) {
    const items = soal
      .map((raw, index): ItemLkpd | null => {
        if (typeof raw !== "object" || raw === null) return null;
        const row = raw as Record<string, unknown>;
        const pertanyaan = typeof row.pertanyaan === "string" ? bersihkanJudul(row.pertanyaan) : "";
        if (!pertanyaan) return null;
        return {
          id: typeof row.id === "string" && row.id ? row.id : `butir-${index + 1}`,
          nomor: typeof row.nomor === "number" ? row.nomor : index + 1,
          pertanyaan,
          petunjuk: typeof row.petunjuk === "string" ? row.petunjuk.trim() : undefined,
          tipe: row.tipe === "isian" ? "isian" : "uraian",
        };
      })
      .filter((item): item is ItemLkpd => item !== null);
    if (items.length) return items;
  }

  // 2. Ambil hanya konten siswa (cegah kebocoran kunci jawaban guru)
  const studentKonten = splitLkpdContent(konten || "").studentContent || konten || "";

  // 3. Ekstraksi berdasarkan Heading Aktivitas / Kegiatan / Soal (### Aktivitas 1: ...)
  const actRegex = /###\s*(Aktivitas|Kegiatan|Latihan|Soal|Kasus|Tugas)\s*(\d+)?[:.]?\s*([^\n]+)([\s\S]*?)(?=(?:###\s*(?:Aktivitas|Kegiatan|Latihan|Soal|Kasus|Tugas)|##\s+[A-Z]|<!--|$))/gi;
  const dariAktivitas: ItemLkpd[] = [];
  let match: RegExpExecArray | null;

  while ((match = actRegex.exec(studentKonten)) !== null) {
    const nomor = match[2] ? parseInt(match[2], 10) : dariAktivitas.length + 1;
    const label = `${match[1]}${match[2] ? ` ${match[2]}` : ""}: ${bersihkanJudul(match[3])}`;
    // Pertahankan markdown utuh (termasuk tabel dan rumus KaTeX)
    const deskripsi = (match[4] || "").trim();
    dariAktivitas.push({
      id: `aktivitas-${match[2] || dariAktivitas.length + 1}`,
      nomor: isNaN(nomor) ? dariAktivitas.length + 1 : nomor,
      pertanyaan: label,
      petunjuk: deskripsi || undefined,
      tipe: "uraian",
    });
    if (dariAktivitas.length >= 8) break;
  }

  if (dariAktivitas.length > 0) return dariAktivitas;

  // 4. Fallback ke ekstraksi baris bernomor standar (1. Pertanyaan ...)
  const dariKonten: ItemLkpd[] = [];
  for (const baris of studentKonten.split("\n")) {
    const cocok = /^\s*(\d{1,2})[.)]\s+(.{10,})$/.exec(baris);
    if (!cocok) continue;
    const pertanyaan = bersihkanJudul(cocok[2]);
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

  // 5. Fallback terakhir: jawaban bebas
  return [
    {
      id: "jawaban-bebas",
      nomor: 1,
      pertanyaan: "Lembar Pengerjaan & Jawaban Peserta Didik",
      petunjuk: "Selesaikan aktivitas dan jawab pertanyaan pada lembar kerja ini.",
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
