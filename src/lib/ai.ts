import "server-only";

import type { GayaBelajar, Level } from "@/types";

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

function mockContent(kind: "lkpd" | "asesmen", context: string): string {
  if (kind === "asesmen") return "[]";

  const n1 = Math.floor(Math.random() * 4) + 2;
  const n2 = n1 + Math.floor(Math.random() * 3) + 2;
  const multiplier = Math.floor(Math.random() * 5) + 3;
  const totalWeight = (n1 + n2) * multiplier * 50;
  const partA = n1 * multiplier * 50;
  const partB = n2 * multiplier * 50;

  const kmPerLiter = Math.floor(Math.random() * 4) + 12;
  const distance1 = kmPerLiter * (Math.floor(Math.random() * 3) + 4);
  const liters1 = distance1 / kmPerLiter;
  const liters2 = liters1 + Math.floor(Math.random() * 4) + 3;
  const distance2 = liters2 * kmPerLiter;

  return `# LEMBAR KERJA PESERTA DIDIK (LKPD)

## A. Identitas Peserta Didik
| Komponen | Keterangan |
|---|---|
| **Nama Siswa** | .................................................... |
| **Kelas / No. Absen** | VII-.... / ....... |
| **Hari / Tanggal** | .................................................... |

## B. Tujuan Pembelajaran
1. Peserta didik dapat memahami dan memodelkan konsep ${context} melalui permasalahan kontekstual kehidupan sehari-hari.
2. Peserta didik dapat menyelesaikan masalah perbandingan secara sistematis, kritis, dan logis.

## C. Petunjuk Pengerjaan
1. Berdoalah sebelum memulai kegiatan belajar.
2. Bacalah setiap narasi masalah dan cermati informasi besaran yang diberikan.
3. Kerjakan setiap aktivitas secara bertahap pada ruang jawaban yang telah disediakan.

## D. Kegiatan Pembelajaran
### Aktivitas 1: Eksplorasi Rasio Kontekstual (target: IK-01)
Seorang peracik minuman menyiapkan bahan minuman herbal. Rasio antara sari jahe dan madu murni yang digunakan adalah $${n1} : ${n2}$ dengan total volume racikan $${totalWeight}\\text{ ml}$. Berapakah mililiter sari jahe yang harus dituangkan?

> **Ruang Jawaban:**
> - Jumlah bagian perbandingan = $\\dots\\dots\\dots\\dots$
> - Nilai 1 bagian = $\\dots\\dots\\dots\\dots$
> - Volume sari jahe = $\\dots\\dots\\dots\\dots$

### Aktivitas 2: Penerapan Perbandingan Senilai (target: IK-03)
Sebuah kendaraan operasional menempuh jarak $${distance1}\\text{ km}$ dengan menghabiskan $${liters1}\\text{ liter}$ bensin. Berapakah kilometer jarak yang dapat ditempuh kendaraan tersebut jika diisi $${liters2}\\text{ liter}$ bensin dengan kondisi laju yang sama?

> **Ruang Jawaban:**
> - Rasio konsumsi bahan bakar (jarak per liter) = $\\dots\\dots\\dots\\dots$
> - Jarak yang ditempuh untuk $${liters2}\\text{ liter}$ = $\\dots\\dots\\dots\\dots$

## E. Refleksi Diri Siswa
- Konsep perbandingan apa yang paling membantu dalam menyelesaikan masalah di atas?
- Langkah mana yang menurutmu perlu diperhatikan lebih teliti agar tidak keliru?

<!-- PEMISAH_KUNCI_GURU -->

# KUNCI JAWABAN & PANDUAN GURU (CATATAN PEGANGAN)

## A. Pembahasan & Kunci Jawaban Resmi
1. **Aktivitas 1:**
   - Total bagian perbandingan = $${n1} + ${n2} = ${n1 + n2}$ bagian.
   - Nilai 1 bagian = $${totalWeight}\\text{ ml} \\div ${n1 + n2} = ${multiplier * 50}\\text{ ml}$.
   - Kebutuhan sari jahe = $${n1} \\times ${multiplier * 50}\\text{ ml} = \\mathbf{${partA}\\text{ ml}}$.
   *(Sebagai pelengkap, madu murni = $${n2} \\times ${multiplier * 50}\\text{ ml} = ${partB}\\text{ ml}$)*.
2. **Aktivitas 2:**
   - Efisiensi konsumsi = $${distance1}\\text{ km} \\div ${liters1}\\text{ liter} = ${kmPerLiter}\\text{ km/liter}$.
   - Jarak tempuh baru = $${liters2}\\text{ liter} \\times ${kmPerLiter}\\text{ km/liter} = \\mathbf{${distance2}\\text{ km}}$.

## B. Pedoman & Rubrik Penskoran
| Kriteria | Keterangan Rubrik | Skor Maks |
|---|---|:---:|
| **Pemodelan Rasio** | Mampu menuliskan bentuk matematis rasio dan bagian yang diketahui secara tepat | 30 |
| **Kalkulasi & Langkah** | Langkah perhitungan runtut, tidak melewatkan tahapan nilai per satuan | 40 |
| **Jawaban & Kesimpulan** | Jawaban akhir tepat beserta satuan besaran yang sesuai | 30 |
| **Total Skor Maksimum** | | **100** |`;
}

async function requestCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number,
  maxTokens: number = 2500
): Promise<{ content: string; model: string }> {
  // Cap at 25 seconds so serverless functions never hit Vercel gateway timeout
  const effectiveTimeout = Math.min(timeoutMs, 25_000);
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
  options?: ChatOptions
): Promise<AIResult> {
  const cfg = config();
  const baseUrl = options?.baseUrl || cfg.baseUrl;
  const apiKey = options?.apiKey || cfg.apiKey;
  const backupApiKey = options?.backupApiKey;
  const model = options?.model || cfg.model;
  const timeoutMs = cfg.timeoutMs;

  if (!apiKey) return { content: fallback, source: "mock", model, isFallback: true };

  try {
    const res = await requestCompletion(baseUrl, apiKey, model, messages, timeoutMs);
    return { content: res.content, source: "online", model: res.model, isFallback: false };
  } catch (primaryError) {
    const reason = primaryError instanceof Error ? primaryError.message : "UnknownError";
    console.warn(`Primary AI key failed (${reason}).`);

    if (backupApiKey && backupApiKey !== apiKey) {
      try {
        console.info("Switching to backup AI key...");
        const res = await requestCompletion(baseUrl, backupApiKey, model, messages, timeoutMs);
        return { content: res.content, source: "online", model: res.model, isFallback: false };
      } catch (backupError) {
        console.error(`Backup AI key failed (${safeError(backupError)}); using mock fallback.`);
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
    dasar: "scaffolding penuh, langkah detail berurutan dengan panduan eksplisit, contoh konkret, dan bahasa sederhana",
    menengah: "latihan penguatan konsep, scaffolding minimal, dan variasi kontekstual sedang",
    mahir: "tantangan kontekstual analitis, soal HOTS, pemecahan masalah kompleks, dan penalaran matematika mendalam",
  };
  const gayaKeterangan = params.gayaBelajar ? {
    visual: "gunakan representasi visual, tabel data terstruktur, diagram teks, dan perbandingan grafis",
    auditory: "gunakan kalimat instruksi dialogis naratif, pertanyaan refleksi kritis, dan elaborasi konseptual",
    kinestetik: "gunakan simulasi eksperimen bertahap, manipulasi angka konkret, dan aktivitas hands-on",
  }[params.gayaBelajar] : "tanpa penyesuaian VAK khusus";
  const indikator = params.indikatorLemah.length ? params.indikatorLemah.join(", ") : "pengayaan seluruh indikator";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Kamu adalah pakar penyusun instrumen Lembar Kerja Peserta Didik (LKPD) matematika SMP Kurikulum Merdeka.
TUGAS UTAMA: Susun dokumen LKPD berdiferensiasi kontekstual kehidupan nyata yang KREATIF, SEGAR, dan BERBEDA di setiap generasi untuk materi "${params.materi}".
HINDARI pengulangan angka, narasi cerita, atau studi kasus klise yang sama dengan generasi sebelumnya. Gunakan variasi skenario kehidupan nyata yang unik (terinspirasi dari konteks: ${randomContext}).
Dokumen harus dalam format Markdown bersih, ramah cetak A4, dan rumus matematika ditulis menggunakan $...$ (inline) atau $$...$$ (blok). JANGAN gunakan fenced code block untuk seluruh isi dokumen.

PENTING — STRUKTUR DOKUMEN WAJIB MENGGUNAKAN PEMISAH RESMI BERIKUT:
# LEMBAR KERJA PESERTA DIDIK (LKPD)
## A. Identitas Peserta Didik (tabel Nama Siswa, Kelas/No. Absen, Hari/Tanggal dengan titik-titik ruang kosong)
## B. Tujuan Pembelajaran (2-3 butir mengacu pada indikator target)
## C. Petunjuk Pengerjaan
## D. Kegiatan Pembelajaran (aktivitas kontekstual 1 sampai ${params.jumlahAktivitas} yang segar dan berbeda, setiap nomor mencantumkan target indikator dalam tanda kurung misal "(target: IK-01)", diikuti ruang pengerjaan berformat blockquote atau garis titik-titik)
## E. Refleksi Diri Siswa (2 pertanyaan refleksi singkat pemahaman konsep)

<!-- PEMISAH_KUNCI_GURU -->

# KUNCI JAWABAN & PANDUAN GURU (CATATAN PEGANGAN)
## A. Pembahasan & Kunci Jawaban Resmi (langkah matematis runtut dan jawaban akhir tebal untuk setiap aktivitas)
## B. Pedoman & Rubrik Penskoran (tabel kriteria penilaian, deskripsi rubrik, dan skor maksimum)`,
    },
    {
      role: "user",
      content: `Buat LKPD BARU dan BERBEDA (Variasi Token #${seed}) tentang "${params.materi}" untuk tingkat ${params.level}.
Karakteristik level: ${levelKeterangan[params.level]}.
Penyesuaian VAK: ${gayaKeterangan}.
Indikator target: ${indikator}.
Buat tepat ${params.jumlahAktivitas} aktivitas kontekstual unik. Instruksi tambahan: ${params.promptTambahan || "tidak ada"}.
Sertakan tanda pembatas <!-- PEMISAH_KUNCI_GURU --> tepat sebelum bagian Kunci Jawaban Guru. Keluarkan langsung teks Markdown tanpa sapaan pembuka/penutup.`,
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

  return chatCompletion(messages, mockContent("lkpd", `${params.materi} (${params.level})`), aiOptions);
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
