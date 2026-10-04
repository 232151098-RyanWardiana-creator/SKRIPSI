import { splitLkpdContent } from "@/lib/lkpd-utils";

/**
 * Sub-butir pertanyaan di dalam satu aktivitas LKPD.
 * Setiap sub-butir memiliki kotak EquationField tersendiri.
 */
export interface SubItemLkpd {
  id: string; // e.g. "aktivitas-1-a"
  kode: string; // e.g. "a"
  pertanyaan: string; // "Tuliskan bentuk perbandingan rasio..."
  tipe: "isian" | "uraian";
}

/**
 * Butir Aktivitas LKPD yang memuat stimulus kontekstual dan daftar sub-pertanyaan.
 */
export interface ItemLkpd {
  id: string;
  nomor: number;
  pertanyaan: string;
  petunjuk?: string; // Stimulus materi, cerita, dan tabel data (Markdown)
  tipe: "isian" | "uraian";
  subItems: SubItemLkpd[];
}

const bersihkanJudul = (value: string) =>
  value
    .replace(/\*\*/g, "")
    .replace(/[*_`#>]/g, "")
    .replace(/\s+/g, " ")
    .trim();

/**
 * Memisahkan teks deskripsi aktivitas menjadi:
 * 1. Stimulus kontekstual (cerita, tabel pengamatan, data)
 * 2. Daftar sub-pertanyaan (a, b, c, dst.)
 */
function pecahSubPertanyaan(
  aktivitasId: string,
  deskripsi: string
): { stimulus: string; subItems: SubItemLkpd[] } {
  if (!deskripsi || !deskripsi.trim()) {
    return {
      stimulus: "",
      subItems: [
        {
          id: `${aktivitasId}-a`,
          kode: "a",
          pertanyaan: "Tuliskan langkah penyelesaian dan jawaban akhirmu:",
          tipe: "uraian",
        },
      ],
    };
  }

  const baris = deskripsi.split("\n");
  const subItems: SubItemLkpd[] = [];
  const barisStimulus: string[] = [];
  let sedangBacaSoal = false;

  for (let i = 0; i < baris.length; i++) {
    const rawLine = baris[i];
    const trimmed = rawLine.trim();

    // Deteksi sub-soal huruf: a. atau a) atau (a)
    const matchLetter = /^(?:([a-d])\.|([a-d])\)|\(([a-d])\))\s+(.+)$/i.exec(trimmed);
    // Deteksi sub-soal angka dalam seksi soal: 1. atau 1)
    const matchNumber = /^(?:([1-6])\.|([1-6])\)|\(([1-6])\))\s+(.+)$/i.exec(trimmed);
    // Deteksi format kutipan ruang jawaban lama: > - Bagian ...
    const matchQuote = /^>\s*-\s*(.+?)(?:=\s*[\.\dots_]+)?$/i.exec(trimmed);

    if (matchLetter) {
      sedangBacaSoal = true;
      const kode = (matchLetter[1] || matchLetter[2] || matchLetter[3]).toLowerCase();
      subItems.push({
        id: `${aktivitasId}-${kode}`,
        kode,
        pertanyaan: matchLetter[4].trim(),
        tipe: "isian",
      });
    } else if (sedangBacaSoal && matchNumber) {
      const kode = matchNumber[1] || matchNumber[2] || matchNumber[3];
      subItems.push({
        id: `${aktivitasId}-${kode}`,
        kode,
        pertanyaan: matchNumber[4].trim(),
        tipe: "isian",
      });
    } else if (matchQuote && !sedangBacaSoal) {
      sedangBacaSoal = true;
      const huruf = String.fromCharCode(97 + subItems.length); // 'a', 'b', 'c'
      subItems.push({
        id: `${aktivitasId}-${huruf}`,
        kode: huruf,
        pertanyaan: matchQuote[1].replace(/[:=]/g, "").trim(),
        tipe: "isian",
      });
    } else if (!sedangBacaSoal) {
      // Cek apakah ada penanda heading pertanyaan
      if (
        /^(?:Pertanyaan|Instruksi|Tugas|Soal Pengerjaan|Ayo Mencoba|Mari Selesaikan|Langkah Kerja)\s*[:.]?/i.test(
          trimmed
        )
      ) {
        sedangBacaSoal = true;
      } else {
        barisStimulus.push(rawLine);
      }
    }
  }

  // Jika tidak ditemukan sub-soal spesifik a/b/c, buat 2 sub-soal terstruktur default
  if (subItems.length === 0) {
    subItems.push(
      {
        id: `${aktivitasId}-a`,
        kode: "a",
        pertanyaan: "Tuliskan penurunan rumus dan langkah pengerjaan bertahap:",
        tipe: "uraian",
      },
      {
        id: `${aktivitasId}-b`,
        kode: "b",
        pertanyaan: "Tuliskan jawaban akhir beserta satuannya:",
        tipe: "isian",
      }
    );
  }

  return {
    stimulus: barisStimulus.join("\n").trim(),
    subItems,
  };
}

export function itemLkpd(soal: unknown, konten: string): ItemLkpd[] {
  // 1. Jika ada array soal JSONB eksplisit
  if (Array.isArray(soal) && soal.length) {
    const items = soal
      .map((raw, index): ItemLkpd | null => {
        if (typeof raw !== "object" || raw === null) return null;
        const row = raw as Record<string, unknown>;
        const pertanyaan = typeof row.pertanyaan === "string" ? bersihkanJudul(row.pertanyaan) : "";
        if (!pertanyaan) return null;
        const id = typeof row.id === "string" && row.id ? row.id : `butir-${index + 1}`;
        const petunjuk = typeof row.petunjuk === "string" ? row.petunjuk.trim() : undefined;
        const { stimulus, subItems } = pecahSubPertanyaan(id, petunjuk || "");

        return {
          id,
          nomor: typeof row.nomor === "number" ? row.nomor : index + 1,
          pertanyaan,
          petunjuk: stimulus || petunjuk || undefined,
          tipe: row.tipe === "isian" ? "isian" : "uraian",
          subItems,
        };
      })
      .filter((item): item is ItemLkpd => item !== null);
    if (items.length) return items;
  }

  // 2. Ambil hanya konten siswa (cegah kebocoran kunci jawaban guru)
  const studentKonten = splitLkpdContent(konten || "").studentContent || konten || "";

  // 3. Ekstraksi berdasarkan Heading Aktivitas / Kegiatan / Soal (### Aktivitas 1: ...)
  const actRegex =
    /###\s*(Aktivitas|Kegiatan|Latihan|Soal|Kasus|Tugas)\s*(\d+)?[:.]?\s*([^\n]+)([\s\S]*?)(?=(?:###\s*(?:Aktivitas|Kegiatan|Latihan|Soal|Kasus|Tugas)|##\s+[A-Z]|<!--|$))/gi;
  const dariAktivitas: ItemLkpd[] = [];
  let match: RegExpExecArray | null;

  while ((match = actRegex.exec(studentKonten)) !== null) {
    const nomor = match[2] ? parseInt(match[2], 10) : dariAktivitas.length + 1;
    const label = `${match[1]}${match[2] ? ` ${match[2]}` : ""}: ${bersihkanJudul(match[3])}`;
    const id = `aktivitas-${match[2] || dariAktivitas.length + 1}`;
    const rawDeskripsi = (match[4] || "").trim();

    // Pecah deskripsi menjadi stimulus dan sub-pertanyaan
    const { stimulus, subItems } = pecahSubPertanyaan(id, rawDeskripsi);

    dariAktivitas.push({
      id,
      nomor: isNaN(nomor) ? dariAktivitas.length + 1 : nomor,
      pertanyaan: label,
      petunjuk: stimulus || rawDeskripsi || undefined,
      tipe: "uraian",
      subItems,
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
    const id = `konten-${cocok[1]}-${dariKonten.length + 1}`;
    dariKonten.push({
      id,
      nomor: dariKonten.length + 1,
      pertanyaan,
      tipe: "uraian",
      subItems: [
        {
          id: `${id}-a`,
          kode: "a",
          pertanyaan: "Tuliskan langkah penyelesaian dan jawaban:",
          tipe: "uraian",
        },
      ],
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
      subItems: [
        {
          id: "jawaban-bebas-a",
          kode: "a",
          pertanyaan: "Langkah pengerjaan bertahap dan jawaban akhir:",
          tipe: "uraian",
        },
      ],
    },
  ];
}

/**
 * Menghitung berapa banyak sub-pertanyaan yang telah diisi siswa.
 */
export function hitungTerisi(items: ItemLkpd[], jawaban: Record<string, string>) {
  let total = 0;
  let terisi = 0;

  for (const item of items) {
    if (item.subItems && item.subItems.length > 0) {
      for (const sub of item.subItems) {
        total += 1;
        const val = (jawaban[sub.id] ?? jawaban[item.id] ?? "").trim();
        if (val.length > 0) terisi += 1;
      }
    } else {
      total += 1;
      const val = (jawaban[item.id] ?? "").trim();
      if (val.length > 0) terisi += 1;
    }
  }

  return {
    terisi,
    total,
    persen: total ? Math.round((terisi / total) * 100) : 0,
  };
}
