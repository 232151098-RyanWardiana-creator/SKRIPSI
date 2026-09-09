import { generateLKPD, type GenerateLKPDParams } from "@/lib/ai";
import type { GayaBelajar, Level } from "@/types";

export const runtime = "nodejs";
export const maxDuration = 60;

const levels: Level[] = ["dasar", "menengah", "mahir"];
const gayaBelajar = new Set<Exclude<GayaBelajar, null>>(["visual", "auditory", "kinestetik"]);

type RequestBody = Omit<GenerateLKPDParams, "level"> & {
  level?: Level;
  modePengerjaan?: "individu" | "kelompok";
  jumlahAnggota?: number;
  provider?: string;
  model?: string;
  customApiKey?: string;
  customBaseUrl?: string;
};

function validBody(value: unknown): value is RequestBody {
  if (!value || typeof value !== "object") return false;
  const body = value as Record<string, unknown>;
  return typeof body.materi === "string" && body.materi.trim().length >= 2 && body.materi.length <= 200
    && Number.isInteger(body.jumlahAktivitas) && Number(body.jumlahAktivitas) >= 1 && Number(body.jumlahAktivitas) <= 10
    && Array.isArray(body.indikatorLemah) && body.indikatorLemah.length <= 20
    && body.indikatorLemah.every((item) => typeof item === "string" && item.length <= 50)
    && (body.gayaBelajar === null || body.gayaBelajar === undefined || gayaBelajar.has(body.gayaBelajar as Exclude<GayaBelajar, null>))
    && (body.promptTambahan === undefined || (typeof body.promptTambahan === "string" && body.promptTambahan.length <= 1000))
    && (body.level === undefined || levels.includes(body.level as Level));
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Body JSON tidak valid." }, { status: 400 });
  }

  if (!validBody(body)) {
    return Response.json({ error: "Data generator tidak valid. Periksa materi, jumlah aktivitas, dan opsi VAK." }, { status: 400 });
  }

  const clean = {
    materi: body.materi.trim(),
    jumlahAktivitas: body.jumlahAktivitas,
    gayaBelajar: body.gayaBelajar,
    indikatorLemah: body.indikatorLemah.map((item) => item.trim()),
    promptTambahan: body.promptTambahan?.trim(),
    modePengerjaan: body.modePengerjaan === "kelompok" ? ("kelompok" as const) : ("individu" as const),
    jumlahAnggota: typeof body.jumlahAnggota === "number" ? body.jumlahAnggota : 4,
    provider: typeof body.provider === "string" ? body.provider : undefined,
    model: typeof body.model === "string" ? body.model : undefined,
    customApiKey: typeof body.customApiKey === "string" ? body.customApiKey : undefined,
    customBaseUrl: typeof body.customBaseUrl === "string" ? body.customBaseUrl : undefined,
  };
  const requestedLevels = body.level ? [body.level] : levels;
  const results = [];

  // Sequential execution ensures clean state tracking per level
  for (const level of requestedLevels) {
    try {
      const value = await generateLKPD({ ...clean, level });
      results.push({
        level,
        status: value.source === "online" ? "success" : "fallback",
        content: value.content,
        source: value.source,
        model: value.model,
        isFallback: value.isFallback,
        error: value.error ?? null,
      });
    } catch (error) {
      results.push({
        level,
        status: "fallback",
        content: `# LEMBAR KERJA PESERTA DIDIK (LKPD)\n\n## A. Identitas Peserta Didik\n| Komponen | Keterangan |\n|---|---|\n| **Nama Siswa** | .................................................... |\n| **Kelas / No. Absen** | VII-.... / ....... |\n| **Hari / Tanggal** | .................................................... |\n\n## B. Tujuan Pembelajaran\n1. Mengidentifikasi hubungan rasio kontekstual.\n2. Menyelesaikan perbandingan secara bertahap.\n\n## C. Petunjuk Pengerjaan\nKerjakan secara bertahap pada ruang jawaban yang disediakan.\n\n## D. Kegiatan Pembelajaran\n### Aktivitas 1: Perbandingan Bahan Masakan (target: IK-01)\nIbu menyiapkan adonan kue dengan perbandingan tepung terigu dan gula pasir adalah 3 : 2. Jika total berat kedua bahan adalah 500 gram, tentukan berat tepung terigu!\n\n> **Ruang Jawaban:**\n> - Jumlah bagian rasio = 3 + 2 = ......\n> - Berat 1 bagian = 500 ÷ ...... = ...... gram\n> - Berat tepung terigu (3 bagian) = 3 × ...... = ...... gram\n\n## E. Refleksi Diri Siswa\n- Apa yang telah kamu pelajari hari ini?\n\n<!-- PEMISAH_KUNCI_GURU -->\n\n# KUNCI JAWABAN & PANDUAN GURU\n## A. Pembahasan & Kunci Jawaban Resmi\n1. **Aktivitas 1:** Total bagian = 5. Nilai 1 bagian = 500 ÷ 5 = 100 gram. Berat tepung = 3 × 100 = **300 gram**.\n\n## B. Pedoman Penskoran\n| Kriteria | Skor Maks |\n|---|:---:|\n| Pemodelan | 50 |\n| Perhitungan | 50 |`,
        source: "mock",
        model: "cadangan",
        isFallback: true,
        error: error instanceof Error ? error.message : "Konten cadangan digunakan.",
      });
    }
  }

  return Response.json({ results });
}
