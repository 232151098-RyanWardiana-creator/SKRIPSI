import "server-only";

import type { GayaBelajar, Level } from "@/types";
import { ensureCorrectIdentityTable } from "./lkpd-utils";

const DEFAULT_BASE_URL = "http://127.0.0.1:20128/v1";
const DEFAULT_MODEL = "INTELLIGENCE-SKRIPSI";
const DEFAULT_TIMEOUT_MS = 180_000;
const STATUS_TIMEOUT_MS = 10_000;

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface ChatCompletionResponse {
  choices?: Array<{ message?: { content?: string } }>;
  model?: string;
}

interface ModelsResponse {
  data?: Array<{ id?: string }>;
}

export interface AIStatus {
  connected: boolean;
  model: string;
  debug?: {
    baseUrl: string;
    modelsOk: boolean;
    modelFound?: boolean;
    status?: number;
    error?: string;
  };
}

export interface AIDiagnostics {
  connected: boolean;
  model: string;
  baseUrl: string;
  models: { ok: boolean; status?: number; modelFound?: boolean; error?: string };
  chat: { ok: boolean; status?: number; responsePreview?: string; error?: string };
}

export interface AIResult {
  content: string;
  source: "online" | "mock";
  model: string;
  isFallback: boolean;
  error?: string;
}

export interface GenerateLKPDParams {
  level: Level;
  gayaBelajar?: GayaBelajar;
  indikatorLemah: string[];
  materi: string;
  jumlahAktivitas: number;
  promptTambahan?: string;
  modePengerjaan?: "individu" | "kelompok";
  jumlahAnggota?: number;
  provider?: string;
  model?: string;
  customApiKey?: string;
  customBaseUrl?: string;
}

export interface GenerateSoalAsesmenParams {
  materi: string;
  indikator: string;
  jumlah: number;
  tingkat: "mudah" | "sedang" | "sulit";
  provider?: string;
  model?: string;
  customApiKey?: string;
  customBaseUrl?: string;
}

interface ChatOptions {
  baseUrl?: string;
  apiKey?: string;
  backupApiKey?: string;
  model?: string;
}

function config() {
  const configuredTimeout = Number(process.env.AI_TIMEOUT_MS);
  return {
    baseUrl: (process.env.NINEROUTER_BASE_URL || DEFAULT_BASE_URL)
      .replace(/^http:\/\/localhost(?=[:/]|$)/i, "http://127.0.0.1")
      .replace(/\/$/, ""),
    apiKey: process.env.NINEROUTER_API_KEY,
    model: process.env.AI_MODEL || DEFAULT_MODEL,
    timeoutMs: Number.isFinite(configuredTimeout) && configuredTimeout > 0 ? configuredTimeout : DEFAULT_TIMEOUT_MS,
  };
}

function developmentLog(message: string) {
  if (process.env.NODE_ENV === "development") console.info(message);
}

function safeError(error: unknown): string {
  if (error instanceof DOMException && error.name === "AbortError") return "Request timed out";
  if (error instanceof Error) {
    if (error.message.includes("fetch failed") || error.message.includes("ECONNREFUSED")) {
      return "Koneksi gateway gagal";
    }
    return error.message || error.name;
  }
  return "AIError";
}

function sanitizePreview(value: unknown): string {
  return JSON.stringify(value)
    .replace(/("?(?:authorization|api[_-]?key|token)"?\s*:\s*")([^"]+)(")/gi, "$1[REDACTED]$3")
    .slice(0, 500);
}

function mockContent(
  kind: "lkpd" | "asesmen",
  context: string,
  modePengerjaan: "individu" | "kelompok" = "individu",
  jumlahAnggota: number = 4
): string {
  if (kind === "asesmen") return "[]";

  const scenarioType = Math.floor(Math.random() * 3);
  const n1 = Math.floor(Math.random() * 4) + 2;
  const n2 = n1 + Math.floor(Math.random() * 3) + 2;
  const multiplier = Math.floor(Math.random() * 5) + 3;

  let act1Title = "";
  let act1Problem = "";
  let act1Answer = "";
  let act2Title = "";
  let act2Problem = "";
  let act2Answer = "";

  if (scenarioType === 0) {
    const totalGrams = (n1 + n2) * multiplier * 40;
    const partA = n1 * multiplier * 40;
    const priceUnit = (Math.floor(Math.random() * 4) + 6) * 2000;
    const qty1 = 4;
    const qty2 = 7;
    act1Title = "Aktivitas 1: Resep Adonan Roti Tradisional (target: IK-01)";
    act1Problem = `Seorang koki membuat adonan roti dengan rasio tepung terigu dan ragi basah adalah $${n1} : ${n2}$. Jika total campuran kedua bahan adalah $${totalGrams}\\text{ gram}$, berapakah gram tepung terigu yang digunakan?`;
    act1Answer = `Rasio terigu : ragi = $${n1} : ${n2}$. Total bagian = $${n1 + n2}$. Nilai 1 bagian = $${totalGrams}\\text{ g} \\div ${n1 + n2} = ${multiplier * 40}\\text{ g}$. Tepung terigu = $${n1} \\times ${multiplier * 40}\\text{ g} = \\mathbf{${partA}\\text{ gram}}$.`;

    act2Title = "Aktivitas 2: Perbandingan Senilai Belanja Bahan (target: IK-03)";
    act2Problem = `Untuk membeli $${qty1}\\text{ kg}$ telur ayam, koki tersebut membayar **Rp${(qty1 * priceUnit).toLocaleString("id-ID")}**. Berapakah biaya yang harus dibayar jika koki membutuhkan $${qty2}\\text{ kg}$ telur ayam?`;
    act2Answer = `Harga per kilogram = **Rp${(qty1 * priceUnit).toLocaleString("id-ID")}** $\\div ${qty1}$ = **Rp${priceUnit.toLocaleString("id-ID")}**. Biaya untuk $${qty2}\\text{ kg}$ = $${qty2} \\times$ **Rp${priceUnit.toLocaleString("id-ID")}** = **Rp${(qty2 * priceUnit).toLocaleString("id-ID")}**.`;
  } else if (scenarioType === 1) {
    const scale = [100, 200, 500][Math.floor(Math.random() * 3)];
    const mapCm = Math.floor(Math.random() * 4) + 4;
    const realMeters = (mapCm * scale) / 100;
    const speed = 60;
    const timeHours = Math.floor(Math.random() * 2) + 2;
    const distanceKm = speed * timeHours;
    act1Title = "Aktivitas 1: Skala Peta dan Denah Rumah (target: IK-02)";
    act1Problem = `Pada denah berskala $1 : ${scale}$, panjang sebuah ruang laboratorium adalah $${mapCm}\\text{ cm}$. Berapakah panjang sebenarnya ruang tersebut dalam meter?`;
    act1Answer = `Panjang sebenarnya = $${mapCm}\\text{ cm} \\times ${scale} = ${mapCm * scale}\\text{ cm} = \\mathbf{${realMeters}\\text{ meter}}$.`;

    act2Title = "Aktivitas 2: Laju Kecepatan dan Jarak Tempuh (target: IK-04)";
    act2Problem = `Sebuah mobil melaju dengan kecepatan rata-rata $${speed}\\text{ km/jam}$ selama $${timeHours}\\text{ jam}$. Berapakah jarak yang ditempuh mobil tersebut?`;
    act2Answer = `Jarak = kecepatan $\\times$ waktu = $${speed} \\times ${timeHours} = \\mathbf{${distanceKm}\\text{ km}}$.`;
  } else {
    const totalMl = (n1 + n2) * multiplier * 50;
    const partA = n1 * multiplier * 50;
    const kmPerLiter = 15;
    const dist1 = 90;
    const lit1 = dist1 / kmPerLiter;
    const lit2 = 10;
    const dist2 = lit2 * kmPerLiter;
    act1Title = "Aktivitas 1: Eksplorasi Rasio Pupuk Tanaman (target: IK-01)";
    act1Problem = `Petani hidroponik mencampur cairan nutrisi A dan nutrisi B dengan rasio $${n1} : ${n2}$. Total volume racikan adalah $${totalMl}\\text{ ml}$. Tentukan volume cairan nutrisi A:`;
    act1Answer = `Total bagian = $${n1 + n2}$. Nilai 1 bagian = $${totalMl}\\text{ ml} \\div ${n1 + n2} = ${multiplier * 50}\\text{ ml}$. Nutrisi A = $${n1} \\times ${multiplier * 50}\\text{ ml} = \\mathbf{${partA}\\text{ ml}}$.`;

    act2Title = "Aktivitas 2: Konsumsi Efisiensi Bahan Bakar (target: IK-03)";
    act2Problem = `Sebuah motor menempuh $${dist1}\\text{ km}$ dengan $${lit1}\\text{ liter}$ bensin. Berapa km jarak yang ditempuh dengan $${lit2}\\text{ liter}$ bensin?`;
    act2Answer = `Efisiensi = $${dist1} \\div ${lit1} = ${kmPerLiter}\\text{ km/liter}$. Jarak untuk $${lit2}\\text{ liter}$ = $${lit2} \\times ${kmPerLiter} = \\mathbf{${dist2}\\text{ km}}$.`;
  }

  const isKelompok = modePengerjaan === "kelompok";
  const rowsAnggota = Array.from({ length: Math.max(2, jumlahAnggota) }, (_, i) => `| ${i === 0 ? "**Anggota Kelompok**" : ""} | ${i + 1}. .................................................... (No: .....) |`).join("\n");

  const identitasBlock = isKelompok
    ? `| Komponen | Keterangan |
|---|---|
| **Kelompok** | Kelompok ........................................... |
| **Kelas** | VII-.... |
| **Hari / Tanggal** | .................................................... |
${rowsAnggota}`
    : `| Komponen | Keterangan |
|---|---|
| **Nama Siswa** | .................................................... |
| **Kelas / No. Absen** | VII-.... / ....... |
| **Hari / Tanggal** | .................................................... |`;

  const petunjukBlock = isKelompok
    ? `1. Berdoalah bersama kelompok sebelum memulai aktivitas belajar.
2. Diskusikan masalah kontekstual bersama anggota kelompok dan bagi peran secara adil.
3. Tuliskan langkah pengerjaan secara bertahap pada ruang jawaban yang disediakan.
4. Tanyakan kepada guru jika kelompok menemui kendala.`
    : `1. Berdoalah sebelum memulai kegiatan belajar.
2. Cermati setiap narasi masalah kontekstual yang diberikan.
3. Kerjakan setiap aktivitas secara bertahap pada ruang jawaban yang disediakan.
4. Tanyakan kepada guru jika menemui kendala.`;

  return `# LEMBAR KERJA PESERTA DIDIK (LKPD)

## A. Identitas Peserta Didik
${identitasBlock}

## B. Tujuan Pembelajaran
1. Peserta didik dapat memahami dan memodelkan konsep ${context} melalui permasalahan kontekstual.
2. Peserta didik dapat menyelesaikan masalah perbandingan secara kritis, runtut, dan tepat.

## C. Petunjuk Pengerjaan
${petunjukBlock}

## D. Kegiatan Pembelajaran
### ${act1Title}
${act1Problem}

> **Ruang Jawaban:**
> - Bagian perbandingan = $\\dots\\dots\\dots\\dots$
> - Hasil perhitungan = $\\dots\\dots\\dots\\dots$

### ${act2Title}
${act2Problem}

> **Ruang Jawaban:**
> - Nilai per satuan = $\\dots\\dots\\dots\\dots$
> - Hasil akhir = $\\dots\\dots\\dots\\dots$

## E. Refleksi Diri Siswa
- Konsep apa yang paling membantu dalam memecahkan soal di atas?
- Bagian mana yang menurutmu perlu dilatih lebih sering?

<!-- PEMISAH_KUNCI_GURU -->

# KUNCI JAWABAN & PANDUAN GURU

## A. Pembahasan & Kunci Jawaban Resmi
1. **${act1Title.split("(")[0].trim()}:**
   - ${act1Answer}
2. **${act2Title.split("(")[0].trim()}:**
   - ${act2Answer}

## B. Pedoman & Rubrik Penskoran
| Kriteria | Keterangan Rubrik | Skor Maks |
|---|---|:---:|
| **Pemodelan Masalah** | Menyatakan rasio dan variabel yang diketahui secara tepat | 35 |
| **Langkah Matematis** | Tahapan perhitungan runtut dan logis | 40 |
| **Hasil Akhir & Satuan** | Jawaban akhir tepat beserta satuan besaran | 25 |
| **Total Skor Maksimum** | | **100** |`;
}

async function requestCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number,
  maxTokens: number = 4000
): Promise<{ content: string; model: string }> {
  // Cap at 55 seconds so serverless functions never hit Vercel 60s gateway timeout while giving LLM plenty of time
  const effectiveTimeout = Math.min(timeoutMs, 55_000);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), effectiveTimeout);
  try {
    developmentLog(`AI chat request: ${baseUrl}/chat/completions (model: ${model})`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.85,
        max_tokens: maxTokens,
        stream: false,
      }),
      cache: "no-store",
      signal: controller.signal,
    });

    if (!response.ok) throw new Error(`Gateway returned HTTP ${response.status}`);
    const data = (await response.json()) as ChatCompletionResponse;
    const content = data.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Gateway returned an empty completion");
    return { content, model: data.model || model };
  } finally {
    clearTimeout(timeout);
  }
}

async function chatCompletion(
  messages: ChatMessage[],
  fallback: string,
  options?: ChatOptions,
  maxTokens: number = 4000
): Promise<AIResult> {
  const cfg = config();
  const baseUrl = options?.baseUrl || cfg.baseUrl;
  const apiKey = options?.apiKey || cfg.apiKey;
  const backupApiKey = options?.backupApiKey;
  const model = options?.model || cfg.model;
  const timeoutMs = cfg.timeoutMs;

  if (!apiKey) return { content: fallback, source: "mock", model, isFallback: true };

  try {
    const res = await requestCompletion(baseUrl, apiKey, model, messages, timeoutMs, maxTokens);
    return { content: res.content, source: "online", model: res.model, isFallback: false };
  } catch (primaryError) {
    const reason = primaryError instanceof Error ? primaryError.message : "UnknownError";
    console.warn(`Primary AI key failed (${reason}).`);

    if (backupApiKey && backupApiKey !== apiKey) {
      try {
        console.info("Switching to backup AI key...");
        const res = await requestCompletion(baseUrl, backupApiKey, model, messages, timeoutMs, maxTokens);
        return { content: res.content, source: "online", model: res.model, isFallback: false };
      } catch (backupError) {
        console.error(`Backup AI key failed (${safeError(backupError)}); using mock fallback.`);
      }
    }

    // Auto-failover to Xkiro online if local 9router (127.0.0.1) is unreachable (e.g. running on Vercel cloud)
    if (baseUrl.includes("127.0.0.1") || baseUrl.includes("localhost")) {
      const xkiroKey = process.env.XKIRO_API_KEY;
      const xkiroBase = process.env.XKIRO_BASE_URL || "https://api.xkiro.com/v1";
      if (xkiroKey) {
        try {
          console.info("9Router lokal tidak terjangkau. Otomatis beralih ke Xkiro online...");
          const res = await requestCompletion(xkiroBase, xkiroKey, "deepseek/deepseek-v3.2", messages, timeoutMs, maxTokens);
          return { content: res.content, source: "online", model: `${res.model} (Auto Failover)`, isFallback: false };
        } catch (xkiroErr) {
          console.error("Failover ke Xkiro online juga gagal:", xkiroErr);
        }
      }
    }

    return {
      content: fallback,
      source: "mock",
      model,
      isFallback: true,
      error: `AI fallback (${safeError(primaryError)}): konten cadangan digunakan.`,
    };
  }
}

export async function generateLKPD(params: GenerateLKPDParams): Promise<AIResult> {
  const seed = Math.floor(Math.random() * 1000000);
  const contexts = [
    "resep kuliner nusantara, takaran bahan kue, dan racikan sirup tradisional",
    "jarak tempuh kendaraan bermotor, konsumsi bahan bakar bensin, dan peta perjalanan",
    "arsitektur bangunan, perancangan denah rumah impian, dan skala miniatur gedung",
    "ekonomi pasar tradisional, paket grosir vs eceran, dan rasio harga satuan",
    "komposisi campuran cat tembok, takaran pupuk pertanian hidroponik, dan nutrisi tanaman",
    "pembagian modal usaha kecil, bagi hasil keuntungan panen, dan rasio investasi",
    "kecepatan laju sepeda santai, waktu tempuh lari estafet, dan rasio peralatan tim olahraga",
  ];
  const randomContext = contexts[Math.floor(Math.random() * contexts.length)];

  const levelKeterangan: Record<Level, string> = {
    dasar: "panduan bertahap (memecah langkah kerja menjadi isian titik-titik kosong ...... tanpa membocorkan jawaban), bahasa sederhana, dan angka bulat yang mudah dipahami",
    menengah: "latihan penguatan konsep, scaffolding minimal, dan variasi kontekstual sedang",
    mahir: "tantangan kontekstual analitis, soal HOTS, pemecahan masalah kompleks, dan penalaran matematika mendalam",
  };
  const gayaKeterangan = params.gayaBelajar ? {
    visual: "gunakan representasi visual, tabel data terstruktur, diagram teks, dan perbandingan grafis",
    auditory: "gunakan kalimat instruksi dialogis naratif, pertanyaan refleksi kritis, dan elaborasi konseptual",
    kinestetik: "gunakan simulasi eksperimen bertahap, manipulasi angka konkret, dan aktivitas hands-on",
  }[params.gayaBelajar] : "tanpa penyesuaian VAK khusus";
  const indikator = params.indikatorLemah.length ? params.indikatorLemah.join(", ") : "pengayaan seluruh indikator";

  const isKelompok = params.modePengerjaan === "kelompok";
  const jumlahAnggota = params.jumlahAnggota || 4;

  const identitasInstruksi = isKelompok
    ? `BENTUK PENGERJAAN: KELOMPOK KOLABORATIF (${jumlahAnggota} Siswa per Kelompok).
Pada ## A. Identitas Peserta Didik, WAJIB buat tabel identitas kelompok dengan format:
| Komponen | Keterangan |
|---|---|
| **Kelompok** | Kelompok ........................................... |
| **Kelas** | VII-.... |
| **Hari / Tanggal** | .................................................... |
${Array.from({ length: Math.max(2, jumlahAnggota) }, (_, i) => `| ${i === 0 ? "**Anggota Kelompok**" : ""} | ${i + 1}. .................................................... (No: .....) |`).join("\n")}
Pada bagian C (Petunjuk Pengerjaan), sertakan instruksi pembagian peran diskusi kelompok.`
    : `BENTUK PENGERJAAN: MANDIRI / INDIVIDU.
Pada ## A. Identitas Peserta Didik, format tabel identitas siswa perorangan (Nama Siswa, Kelas/No. Absen, Hari/Tanggal).`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Kamu adalah pakar penyusun instrumen Lembar Kerja Peserta Didik (LKPD) matematika SMP Kurikulum Merdeka.
TUGAS UTAMA: Susun dokumen LKPD berdiferensiasi kontekstual kehidupan nyata yang KREATIF, SEGAR, dan BERBEDA di setiap generasi untuk materi "${params.materi}".
HINDARI pengulangan angka, narasi cerita, atau studi kasus klise yang sama dengan generasi sebelumnya. Gunakan variasi skenario kehidupan nyata yang unik (terinspirasi dari konteks: ${randomContext}).
Dokumen harus dalam format Markdown bersih, ramah cetak A4, dan rumus matematika ditulis menggunakan $...$ (inline) atau $$...$$ (blok). JANGAN gunakan fenced code block untuk seluruh isi dokumen.

ATURAN FORMULA & SIMBOL MATEMATIKA (PEDOMAN EQUATION & OMML):
1. Satuan mata uang Rupiah DILARANG ditulis di dalam format LaTeX ($...$). Jangan gunakan \\text{Rp}, \\mathbf{Rp}, dsb. Tulis selalu satuan Rupiah sebagai teks biasa tebal: **Rp16.000** atau **Rp112.000**.
2. Rumus matematika WAJIB menggunakan tanda dolar lengkap berpasangan: $...$ untuk inline (contoh: $3 : 5$ atau $\\frac{a}{b}$) dan $$...$$ untuk baris rumus terpisah.
3. HINDARI menulis kalimat deskripsi panjang di dalam pecahan KaTeX \\frac{\\text{...}}{\\text{...}}. Gunakan format perbandingan yang rapi atau variabel/istilah ringkas seperti $\\frac{\\text{Bahan Tersedia}}{\\text{Kebutuhan Resep}}$ agar equation tampil elegan dan garis pecahan tidak menabrak teks.
4. JANGAN PERNAH menyisakan kode LaTeX mentah tanpa penutup atau di dalam backtick inline.

${identitasInstruksi}

PENTING — STRUKTUR DOKUMEN WAJIB MENGGUNAKAN PEMISAH RESMI BERIKUT:
# LEMBAR KERJA PESERTA DIDIK (LKPD)
## A. Identitas Peserta Didik
## B. Tujuan Pembelajaran (2-3 butir mengacu pada indikator target)
## C. Petunjuk Pengerjaan
## D. Kegiatan Pembelajaran (aktivitas kontekstual 1 sampai ${params.jumlahAktivitas} yang segar dan berbeda, setiap nomor mencantumkan target indikator dalam tanda kurung misal "(target: IK-01)", diikuti ruang pengerjaan berformat blockquote atau garis titik-titik)
## E. Refleksi Diri Siswa (2 pertanyaan refleksi singkat pemahaman konsep)

<!-- PEMISAH_KUNCI_GURU -->

# KUNCI JAWABAN & PANDUAN GURU
## A. Pembahasan & Kunci Jawaban Resmi (langkah matematis runtut dan jawaban akhir tebal untuk setiap aktivitas)
## B. Pedoman & Rubrik Penskoran (tabel kriteria penilaian, deskripsi rubrik, dan skor maksimum)

ATURAN MUTLAK LEMBAR KERJA SISWA (BAGIAN D):
1. DILARANG KERAS MENULISKAN JAWABAN ATAU HASIL PERHITUNGAN PADA BAGIAN D (KEGIATAN PEMBELAJARAN SISWA)!
2. Untuk Level Dasar sekalipun: Scaffolding HANYA berupa panduan alur langkah kerja. Setiap langkah pada ruang jawaban siswa WAJIB KOSONG (berupa titik-titik "......" atau garis isian yang harus dikerjakan sendiri oleh siswa). JANGAN PERNAH mengisi ruang jawaban siswa dengan angka atau solusi yang sudah selesai!

ATURAN WAJIB KUNCI JAWABAN & PANDUAN GURU:
1. Kunci jawaban HARUS menjawab SECARA PERSIS, NYATA, dan LENGKAP seluruh ${params.jumlahAktivitas} aktivitas yang dibuat pada Bagian D.
2. Tuliskan langkah perhitungan numerik yang detail, angka riil, dan hasil akhir tebal (**jawaban**). DILARANG KERAS menulis instruksi umum atau menyuruh guru/siswa mengamati/mencari sendiri! Berikan seluruh solusi matematis tuntas untuk mempermudah guru memeriksa hasil siswa.
3. Selesaikan seluruh isi dokumen dari awal sampai tuntas tanpa terpotong di tengah jalan.`,
    },
    {
      role: "user",
      content: `Buat LKPD BARU, LENGKAP, dan BERBEDA (Variasi Token #${seed}) tentang "${params.materi}" untuk tingkat ${params.level}.
Bentuk pengerjaan: ${isKelompok ? `Kelompok (${jumlahAnggota} orang)` : "Individu"}.
Karakteristik level: ${levelKeterangan[params.level]}.
Penyesuaian VAK: ${gayaKeterangan}.
Indikator target: ${indikator}.
Buat tepat ${params.jumlahAktivitas} aktivitas kontekstual unik. Instruksi tambahan: ${params.promptTambahan || "tidak ada"}.
Pastikan pada Bagian D (Kegiatan Pembelajaran), ruang jawaban siswa murni berupa titik-titik kosong tanpa angka jawaban yang terisi!
Sertakan tanda pembatas <!-- PEMISAH_KUNCI_GURU --> tepat sebelum bagian Kunci Jawaban Guru. Tulis kunci jawaban nyata dan lengkap untuk seluruh aktivitas. Keluarkan langsung teks Markdown tanpa sapaan pembuka/penutup.`,
    },
  ];

  let baseUrl: string | undefined = params.customBaseUrl;
  let apiKey: string | undefined = params.customApiKey;
  let backupApiKey: string | undefined = undefined;

  if (params.provider === "xkiro") {
    baseUrl = process.env.XKIRO_BASE_URL || "https://api.xkiro.com/v1";
    apiKey = process.env.XKIRO_API_KEY || "";
    backupApiKey = process.env.XKIRO_API_KEY_BACKUP || "";
  }

  const aiOptions = {
    baseUrl,
    apiKey,
    backupApiKey,
    model: params.model,
  };

  const aiResult = await chatCompletion(
    messages,
    mockContent("lkpd", `${params.materi} (${params.level})`, params.modePengerjaan, params.jumlahAnggota),
    aiOptions,
    4000
  );

  const finalContent = ensureCorrectIdentityTable(
    aiResult.content,
    isKelompok,
    jumlahAnggota
  );

  return {
    ...aiResult,
    content: finalContent,
  };
}

export interface GeneratedQuestion {
  id: string;
  pertanyaan: string;
  indikator_id: string;
  tingkat_kesulitan: "mudah" | "sedang" | "sulit";
  pilihan: { A: string; B: string; C: string; D: string };
  jawaban_benar: "A" | "B" | "C" | "D";
  pembahasan: string;
  diagram?: string;
}

export function parseGeneratedQuestions(content: string, defaults: { indikator: string; tingkat: GenerateSoalAsesmenParams["tingkat"] }): GeneratedQuestion[] {
  let clean = content.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  clean = clean.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  
  const firstBracket = clean.indexOf("[");
  const lastBracket = clean.lastIndexOf("]");
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    clean = clean.slice(firstBracket, lastBracket + 1);
  }

  const parsed: unknown = JSON.parse(clean);
  if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid question array");

  return parsed.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid question");
    const item = raw as Record<string, unknown>;

    const question = String(item.pertanyaan ?? item.question ?? item.soal ?? item.prompt ?? "").trim();
    const explanation = String(item.pembahasan ?? item.penjelasan ?? item.explanation ?? item.reasoning ?? "Langkah penyelesaian sesuai konsep perbandingan.").trim();

    let choices = { A: "", B: "", C: "", D: "" };
    const stripPrefix = (text: string) => text.replace(/^[A-Da-d][.)]\s*/, "").trim();

    if (Array.isArray(item.options) || Array.isArray(item.pilihan)) {
      const arr = (Array.isArray(item.options) ? item.options : item.pilihan) as unknown[];
      choices.A = stripPrefix(String(arr[0] ?? ""));
      choices.B = stripPrefix(String(arr[1] ?? ""));
      choices.C = stripPrefix(String(arr[2] ?? ""));
      choices.D = stripPrefix(String(arr[3] ?? ""));
    } else {
      const obj = ((item.pilihan || item.options || item.choices || {}) as Record<string, unknown>);
      choices.A = stripPrefix(String(obj.A ?? obj.a ?? ""));
      choices.B = stripPrefix(String(obj.B ?? obj.b ?? ""));
      choices.C = stripPrefix(String(obj.C ?? obj.c ?? ""));
      choices.D = stripPrefix(String(obj.D ?? obj.d ?? ""));
    }

    let answer: "A" | "B" | "C" | "D" = "A";
    const rawAns = item.jawaban_benar ?? item.jawaban ?? item.correctAnswer ?? item.answer ?? item.kunci ?? "";
    if (typeof rawAns === "number" && rawAns >= 0 && rawAns <= 3) {
      answer = (["A", "B", "C", "D"][rawAns] || "A") as "A" | "B" | "C" | "D";
    } else {
      const s = String(rawAns).trim().toUpperCase();
      if (["A", "B", "C", "D"].includes(s)) {
        answer = s as "A" | "B" | "C" | "D";
      } else if (["0", "1", "2", "3"].includes(s)) {
        answer = (["A", "B", "C", "D"][Number(s)] || "A") as "A" | "B" | "C" | "D";
      }
    }

    const defaultInd = defaults.indikator === "SEMUA" ? `IK-0${(index % 5) + 1}` : defaults.indikator;
    const indicator = String(item.indikator_id ?? item.indikator ?? defaultInd).match(/IK-0[1-5]/)?.[0] || defaultInd;
    const rawDifficulty = String(item.tingkat_kesulitan ?? item.tingkat ?? defaults.tingkat).toLowerCase();
    const difficulty = (["mudah", "sedang", "sulit"].includes(rawDifficulty) ? rawDifficulty : defaults.tingkat) as GeneratedQuestion["tingkat_kesulitan"];

    if (!question || !choices.A || !choices.B || !choices.C || !choices.D) {
      throw new Error("Invalid question fields");
    }

    const diagram = typeof item.diagram === "string" && item.diagram.trim() ? item.diagram.trim() : undefined;

    return {
      id: String(item.id || `soal-${index + 1}`),
      pertanyaan: question,
      indikator_id: indicator,
      tingkat_kesulitan: difficulty,
      pilihan: choices,
      jawaban_benar: answer,
      pembahasan: explanation,
      ...(diagram && { diagram }),
    };
  });
}

function mockSoalContent(params: GenerateSoalAsesmenParams): string {
  const materi = params.materi.trim() || "Matematika SMP";
  const ind = params.indikator || "IK-01";

  // Dynamic randomization for fallback so questions never repeat
  const n1 = Math.floor(Math.random() * 5) + 2;
  const n2 = n1 + Math.floor(Math.random() * 4) + 2;
  const totalMult = (n1 + n2) * (Math.floor(Math.random() * 5) + 4);
  const part1 = (n1 / (n1 + n2)) * totalMult;

  const unitPrice = (Math.floor(Math.random() * 6) + 5) * 2000;
  const unitCount = Math.floor(Math.random() * 4) + 3;
  const targetCount = unitCount + Math.floor(Math.random() * 3) + 2;
  const totalCost = targetCount * unitPrice;

  const scale = [100, 200, 250, 500, 1000][Math.floor(Math.random() * 5)];
  const mapCm = Math.floor(Math.random() * 6) + 3;
  const realMeters = (mapCm * scale) / 100;

  const samples = [
    {
      p: `Dalam situasi kehidupan nyata terkait materi ${materi}, rasio bahan utama A dan B adalah ${n1} : ${n2} dengan total campuran ${totalMult} kg. Berapakah berat bahan A?`,
      a: `${part1} kg`,
      b: `${part1 + 4} kg`,
      c: `${part1 + 8} kg`,
      d: `${part1 - 2 > 0 ? part1 - 2 : part1 + 10} kg`,
      kunci: "A",
      bahas: `Jumlah perbandingan = ${n1} + ${n2} = ${n1 + n2} bagian. Nilai 1 bagian = ${totalMult} ÷ ${n1 + n2} = ${totalMult / (n1 + n2)} kg. Berat bahan A = ${n1} × ${totalMult / (n1 + n2)} = ${part1} kg.`,
    },
    {
      p: `Pada materi ${materi}, jika ${unitCount} buah barang membutuhkan biaya Rp${(unitCount * unitPrice).toLocaleString("id-ID")}, berapakah biaya untuk ${targetCount} buah barang dengan perbandingan senilai?`,
      a: `Rp${(totalCost - unitPrice).toLocaleString("id-ID")}`,
      b: `Rp${totalCost.toLocaleString("id-ID")}`,
      c: `Rp${(totalCost + unitPrice).toLocaleString("id-ID")}`,
      d: `Rp${(totalCost + unitPrice * 2).toLocaleString("id-ID")}`,
      kunci: "B",
      bahas: `Harga per unit = Rp${(unitCount * unitPrice).toLocaleString("id-ID")} ÷ ${unitCount} = Rp${unitPrice.toLocaleString("id-ID")}. Biaya untuk ${targetCount} unit = ${targetCount} × Rp${unitPrice.toLocaleString("id-ID")} = Rp${totalCost.toLocaleString("id-ID")}.`,
    },
    {
      p: `Sebuah denah berskala 1 : ${scale} menunjukkan panjang taman ${mapCm} cm. Pada konteks ${materi}, berapakah panjang taman sebenarnya dalam meter?`,
      a: `${realMeters} meter`,
      b: `${realMeters + 2} meter`,
      c: `${realMeters + 5} meter`,
      d: `${realMeters > 3 ? realMeters - 2 : realMeters + 8} meter`,
      kunci: "A",
      bahas: `Panjang sebenarnya = ${mapCm} cm × ${scale} = ${mapCm * scale} cm = ${realMeters} meter.`,
    },
    {
      p: `Seorang pengendara motor menempuh jarak ${(Math.floor(Math.random() * 4) + 2) * 30} km dengan ${Math.floor(Math.random() * 3) + 2} liter bensin. Berapakah jarak yang dapat ditempuh jika tersedia ${(Math.floor(Math.random() * 3) + 5)} liter bensin?`,
      a: "120 km",
      b: "150 km",
      c: "180 km",
      d: "210 km",
      kunci: "C",
      bahas: `Gunakan perbandingan senilai: efisiensi konsumsi = jarak ÷ liter. Kalikan dengan jumlah liter target untuk mendapat jarak tempuh.`,
    },
  ];

  // Randomize sample order so questions vary each time
  const shuffled = [...samples].sort(() => Math.random() - 0.5);

  const items = Array.from({ length: params.jumlah }, (_, idx) => {
    const pick = shuffled[idx % shuffled.length];
    const assignedInd = ind === "SEMUA" ? `IK-0${(idx % 5) + 1}` : (ind.match(/IK-0[1-5]/)?.[0] || "IK-01");
    return {
      id: `soal-${Date.now()}-${idx + 1}`,
      pertanyaan: pick.p,
      indikator_id: assignedInd,
      tingkat_kesulitan: params.tingkat,
      pilihan: { A: pick.a, B: pick.b, C: pick.c, D: pick.d },
      jawaban_benar: pick.kunci,
      pembahasan: pick.bahas,
    };
  });

  return JSON.stringify(items);
}

export async function generateSoalAsesmen(params: GenerateSoalAsesmenParams): Promise<AIResult> {
  const seed = Math.floor(Math.random() * 100000);
  const contexts = [
    "resep kuliner, takaran bumbu dapur, dan pembuatan minuman",
    "jarak tempuh, konsumsi bahan bakar, dan kecepatan kendaraan bermotor",
    "skala denah rumah, miniatur bangunan, dan peta perjalanan",
    "perbandingan harga barang di pasar tradisional, diskon per unit, dan paket hemat",
    "pencampuran warna cat tembok, komposisi pupuk pertanian hidroponik",
    "pembagian keuntungan usaha bersama, bagi hasil panen, dan permodalan",
    "waktu penyelesaian renovasi bangunan, jumlah tukang, dan konveksi pakaian",
  ];
  const randomContext = contexts[Math.floor(Math.random() * contexts.length)];

  const isAll = params.indikator === "SEMUA" || params.indikator === "all";
  const indicatorInstruction = isAll
    ? `Bagikan butir-butir soal secara MERATA ke indikator IK-01 sampai IK-05. Tentukan properti "indikator_id" secara tepat untuk setiap soal (IK-01, IK-02, IK-03, IK-04, atau IK-05) secara berurutan atau bergiliran seimbang.`
    : `Setiap soal wajib memiliki properti "indikator_id": "${params.indikator}".`;

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Kamu adalah pakar penyusun asesmen diagnostik matematika SMP Kurikulum Merdeka.
TUGAS UTAMA: Susun butir soal diagnostik pilihan ganda kontekstual kehidupan nyata yang KREATIF, SEGAR, dan BERBEDA di setiap permintaan untuk topik materi "${params.materi}".
${indicatorInstruction}
HINDARI pengulangan soal atau angka klise yang sudah sering dipakai. Gunakan variasi skenario kehidupan nyata yang unik (misal terinspirasi dari konteks: ${randomContext}).
Pastikan angka perhitungan rapi, realistis, dan logis untuk siswa SMP.
Keluarkan HANYA JSON array valid tanpa formatting markdown backticks atau pengantar apa pun.

Format setiap objek dalam array:
[
  {
    "id": "soal-1",
    "pertanyaan": "soal cerita kontekstual realistis yang unik dan segar",
    "indikator_id": "${isAll ? "IK-01 (sesuaikan IK-01 s.d IK-05)" : params.indikator}",
    "tingkat_kesulitan": "${params.tingkat}",
    "pilihan": {
      "A": "opsi A",
      "B": "opsi B",
      "C": "opsi C",
      "D": "opsi D"
    },
    "jawaban_benar": "A|B|C|D",
    "pembahasan": "penjelasan langkah matematis runtut dan jelas",
    "diagram": "opsional representasi teks/tabel"
  }
]`,
    },
    {
      role: "user",
      content: isAll
        ? `Buat tepat ${params.jumlah} butir soal pilihan ganda kontekstual BARU dan BERBEDA (Variasi Token #${seed}) untuk materi "${params.materi}", tingkat "${params.tingkat}". BAGIKAN SECARA MERATA ke indikator IK-01 s.d. IK-05 (berikan "indikator_id" IK-01, IK-02, dst pada masing-masing soal). Pastikan tepat satu jawaban benar dan keluarkan HANYA JSON array valid.`
        : `Buat tepat ${params.jumlah} butir soal pilihan ganda kontekstual BARU dan BERBEDA (Variasi Token #${seed}) untuk topik materi "${params.materi}", indikator "${params.indikator}", tingkat "${params.tingkat}". Pastikan soal memiliki skenario unik, angka yang berbeda, tepat satu jawaban benar, dan format JSON array valid.`,
    },
  ];

  let baseUrl: string | undefined = params.customBaseUrl;
  let apiKey: string | undefined = params.customApiKey;
  let backupApiKey: string | undefined = undefined;

  if (params.provider === "xkiro") {
    baseUrl = process.env.XKIRO_BASE_URL || "https://api.xkiro.com/v1";
    apiKey = process.env.XKIRO_API_KEY || "";
    backupApiKey = process.env.XKIRO_API_KEY_BACKUP || "";
  }

  const aiOptions = {
    baseUrl,
    apiKey,
    backupApiKey,
    model: params.model,
  };

  return chatCompletion(messages, mockSoalContent(params), aiOptions);
}

export async function getAIStatus(): Promise<AIStatus> {
  const { baseUrl, apiKey, model } = config();
  const isDevelopment = process.env.NODE_ENV === "development";
  if (!apiKey) return {
    connected: false,
    model,
    ...(isDevelopment && { debug: { baseUrl, modelsOk: false, error: "API key is not configured" } }),
  };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), STATUS_TIMEOUT_MS);
  try {
    developmentLog(`AI status request: ${baseUrl}/models`);
    const response = await fetch(`${baseUrl}/models`, {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
      signal: controller.signal,
    });
    let modelFound: boolean | undefined;
    if (response.ok) {
      const data = await response.json().catch(() => null) as ModelsResponse | null;
      if (Array.isArray(data?.data)) modelFound = data.data.some((item) => item.id === model);
    }
    return {
      connected: response.ok && modelFound !== false,
      model,
      ...(isDevelopment && { debug: { baseUrl, modelsOk: response.ok, modelFound, status: response.status } }),
    };
  } catch (error) {
    return {
      connected: false,
      model,
      ...(isDevelopment && { debug: { baseUrl, modelsOk: false, error: safeError(error) } }),
    };
  } finally {
    clearTimeout(timeout);
  }
}

export async function runAIDiagnostics(): Promise<AIDiagnostics> {
  const { baseUrl, apiKey, model } = config();
  const result: AIDiagnostics = {
    connected: false,
    model,
    baseUrl,
    models: { ok: false },
    chat: { ok: false },
  };
  if (!apiKey) {
    result.models.error = "API key is not configured";
    result.chat.error = "API key is not configured";
    return result;
  }

  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` };
  const modelsController = new AbortController();
  const modelsTimeout = setTimeout(() => modelsController.abort(), STATUS_TIMEOUT_MS);
  try {
    developmentLog(`AI debug models request: ${baseUrl}/models`);
    const response = await fetch(`${baseUrl}/models`, { headers, cache: "no-store", signal: modelsController.signal });
    result.models.status = response.status;
    result.models.ok = response.ok;
    if (response.ok) {
      const data = await response.json().catch(() => null) as ModelsResponse | null;
      if (Array.isArray(data?.data)) result.models.modelFound = data.data.some((item) => item.id === model);
    }
  } catch (error) {
    result.models.error = safeError(error);
  } finally {
    clearTimeout(modelsTimeout);
  }

  const chatController = new AbortController();
  const chatTimeout = setTimeout(() => chatController.abort(), STATUS_TIMEOUT_MS);
  try {
    developmentLog(`AI debug chat request: ${baseUrl}/chat/completions (model: ${model})`);
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers,
      body: JSON.stringify({ model, messages: [{ role: "user", content: "Reply with OK only." }], max_tokens: 8, temperature: 0 }),
      cache: "no-store",
      signal: chatController.signal,
    });
    result.chat.status = response.status;
    result.chat.ok = response.ok;
    const data: unknown = await response.json().catch(() => ({ error: `Non-JSON response (HTTP ${response.status})` }));
    result.chat.responsePreview = sanitizePreview(data);
  } catch (error) {
    result.chat.error = safeError(error);
  } finally {
    clearTimeout(chatTimeout);
  }

  result.connected = result.models.ok && result.models.modelFound !== false && result.chat.ok;
  return result;
}
