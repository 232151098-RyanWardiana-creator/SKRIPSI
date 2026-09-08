import "server-only";

import type { GayaBelajar, Level } from "@/types";

const DEFAULT_BASE_URL = "http://127.0.0.1:20128/v1";
const DEFAULT_MODEL = "cx/gpt-5.6-sol";
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
  return error instanceof Error ? error.name : "UnknownError";
}

function sanitizePreview(value: unknown): string {
  return JSON.stringify(value)
    .replace(/("?(?:authorization|api[_-]?key|token)"?\s*:\s*")([^"]+)(")/gi, "$1[REDACTED]$3")
    .slice(0, 500);
}

function mockContent(kind: "lkpd" | "asesmen", context: string): string {
  if (kind === "asesmen") return "[]";

  return `# LKPD Matematika — ${context}\n\n## Tujuan Pembelajaran\nMemahami dan menerapkan konsep melalui aktivitas sesuai tingkat kemampuan awal.\n\n## Petunjuk\nKerjakan setiap aktivitas secara runtut dan tuliskan alasan jawaban.\n\n## Aktivitas\nKonten contoh digunakan karena 9Router sedang tidak tersedia.\n\n## Refleksi\nTuliskan konsep yang sudah dipahami dan bagian yang masih perlu dilatih.`;
}

async function requestCompletion(
  baseUrl: string,
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  timeoutMs: number
): Promise<{ content: string; model: string }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
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
        temperature: 0.7,
        max_tokens: 4096,
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
  const levelKeterangan: Record<Level, string> = {
    dasar: "scaffolding penuh, langkah detail, contoh konkret, dan bahasa sederhana",
    menengah: "latihan penguatan konsep, scaffolding minimal, dan variasi soal sedang",
    mahir: "soal HOTS, pemecahan masalah kompleks, dan tantangan matematika",
  };
  const gayaKeterangan = params.gayaBelajar ? {
    visual: "gunakan tabel, diagram, garis bilangan, dan representasi visual",
    auditory: "gunakan instruksi verbal, pertanyaan refleksi, dan diskusi",
    kinestetik: "gunakan eksplorasi bertahap dan aktivitas hands-on",
  }[params.gayaBelajar] : "tanpa penyesuaian VAK khusus";
  const indikator = params.indikatorLemah.length ? params.indikatorLemah.join(", ") : "pengayaan seluruh indikator";

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "Kamu ahli pendidikan matematika SMP. Buat LKPD Kurikulum Merdeka Kelas VII dalam Bahasa Indonesia dan Markdown bersih. Jangan bungkus jawaban dalam fenced code block. Gunakan $...$ untuk matematika inline dan $$...$$ untuk matematika blok. Gunakan tanda kurung bulat standar seperti (-3), (-4), (+2). JANGAN gunakan tanda kurung siku campuran, kurung kurawal salah tempat, simbol garis vertikal yang memotong angka, atau perintah \\left dan \\right. Hindari environment LaTeX (align, equation, array) dan perintah yang tidak didukung KaTeX. Gunakan tabel GFM bila perlu.",
    },
    {
      role: "user",
      content: `Buat LKPD tentang "${params.materi}" untuk level ${params.level}. Karakter level: ${levelKeterangan[params.level]}. Penyesuaian penyajian: ${gayaKeterangan}. Indikator lemah yang wajib menjadi target eksplisit kegiatan dan remediasi: ${indikator}. Buat ${params.jumlahAktivitas} aktivitas. SETIAP aktivitas harus mencantumkan indikator target dalam tanda kurung, misalnya "(target: IK-01)". Untuk level dasar, kegiatan berfokus pada remediasi indikator prerequisite (IK-01, IK-02) dengan scaffolding penuh sebelum naik ke indikator lain. Untuk level menengah, kegiatan memperkuat indikator lemah yang belum dikuasai. Untuk level mahir, kegiatan berupa pengayaan/penguatan seluruh indikator, tetap menantang pada indikator yang belum dikuasai bila ada. Instruksi tambahan: ${params.promptTambahan || "tidak ada"}. Struktur wajib dan konsisten: # Judul LKPD; ## A. Identitas (tabel Nama, Kelas, Tanggal dengan ruang kosong); ## B. Tujuan Pembelajaran (2-3 butir, mengacu pada indikator target); ## C. Petunjuk; ## D. Kegiatan (aktivitas kontekstual bernomor, ruang jawaban berupa garis kosong atau blockquote); ## E. Refleksi. VAK hanya memengaruhi penyajian, bukan tingkat kesulitan. Pastikan Markdown valid, rumus memakai delimiter matematika, dan jangan keluarkan teks sebelum/sesudah dokumen.`,
    },
  ];

  return chatCompletion(messages, mockContent("lkpd", `${params.materi} (${params.level})`));
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
  const stripped = content.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const parsed: unknown = JSON.parse(stripped);
  if (!Array.isArray(parsed) || parsed.length === 0 || parsed.length > 10) throw new Error("Invalid question array");
  return parsed.map((raw, index) => {
    if (!raw || typeof raw !== "object") throw new Error("Invalid question");
    const item = raw as Record<string, unknown>;
    const choices = item.pilihan as Record<string, unknown> | undefined;
    const answer = String(item.jawaban_benar ?? item.jawaban ?? "").toUpperCase();
    const indicator = String(item.indikator_id ?? item.indikator ?? defaults.indikator).match(/IK-0[1-5]/)?.[0] || "";
    const difficulty = String(item.tingkat_kesulitan ?? item.tingkat ?? defaults.tingkat).toLowerCase();
    const normalizedChoices = { A: String(choices?.A ?? choices?.a ?? "").trim(), B: String(choices?.B ?? choices?.b ?? "").trim(), C: String(choices?.C ?? choices?.c ?? "").trim(), D: String(choices?.D ?? choices?.d ?? "").trim() };
    const question = String(item.pertanyaan ?? "").trim();
    const explanation = String(item.pembahasan ?? item.penjelasan ?? "").trim();
    if (!question || !explanation || !indicator || !["mudah", "sedang", "sulit"].includes(difficulty) || !["A", "B", "C", "D"].includes(answer) || Object.values(normalizedChoices).some((choice) => !choice)) throw new Error("Invalid question fields");
    const diagram = typeof item.diagram === "string" && item.diagram.trim() ? item.diagram.trim() : undefined;
    return { id: String(item.id || `soal-${index + 1}`), pertanyaan: question, indikator_id: indicator, tingkat_kesulitan: difficulty as GeneratedQuestion["tingkat_kesulitan"], pilihan: normalizedChoices, jawaban_benar: answer as GeneratedQuestion["jawaban_benar"], pembahasan: explanation, ...(diagram && { diagram }) };
  });
}

function mockSoalContent(params: GenerateSoalAsesmenParams): string {
  const materi = params.materi.trim() || "Matematika SMP";
  const ind = params.indikator || "IK-01";

  const samples = [
    {
      p: `Dalam situasi kehidupan sehari-hari pada materi ${materi}, perbandingan yang digunakan adalah 2 : 5 untuk total 35 satuan bahan. Tentukan nilai bagian pertama:`,
      a: "10 satuan",
      b: "14 satuan",
      c: "20 satuan",
      d: "25 satuan",
      kunci: "A",
      bahas: `Jumlah perbandingan = 2 + 5 = 7 bagian. Nilai 1 bagian = 35 : 7 = 5. Nilai bagian pertama = 2 × 5 = 10 satuan.`,
    },
    {
      p: `Pada materi ${materi}, jika 4 unit membutuhkan biaya Rp48.000, berapakah biaya yang dibutuhkan untuk 7 unit dengan perbandingan senilai?`,
      a: "Rp72.000",
      b: "Rp84.000",
      c: "Rp96.000",
      d: "Rp105.000",
      kunci: "B",
      bahas: `Biaya satuan = Rp48.000 : 4 = Rp12.000/unit. Untuk 7 unit = 7 × Rp12.000 = Rp84.000.`,
    },
    {
      p: `Sebuah denah berskala 1 : 200 menunjukkan ukuran panjang 4 cm. Pada materi ${materi}, panjang sebenarnya adalah ...`,
      a: "800 cm (8 meter)",
      b: "600 cm (6 meter)",
      c: "500 cm (5 meter)",
      d: "400 cm (4 meter)",
      kunci: "A",
      bahas: `Panjang sebenarnya = 4 cm × 200 = 800 cm = 8 meter.`,
    },
    {
      p: `Terkait materi ${materi}, bentuk paling sederhana dari perbandingan 18 : 45 adalah ...`,
      a: "3 : 7",
      b: "2 : 5",
      c: "3 : 5",
      d: "2 : 9",
      kunci: "B",
      bahas: `FPB dari 18 dan 45 adalah 9. Bagi 18:9 = 2 dan 45:9 = 5, menghasilkan 2 : 5.`,
    },
    {
      p: `Dalam konteks ${materi}, sebuah pekerjaan diselesaikan 6 pekerja dalam 15 hari. Jika dikerjakan oleh 10 pekerja, waktu yang diperlukan adalah ...`,
      a: "7 hari",
      b: "9 hari",
      c: "10 hari",
      d: "12 hari",
      kunci: "B",
      bahas: `Perbandingan berbalik nilai: 6 × 15 = 10 × t. 90 = 10t, maka t = 9 hari.`,
    },
  ];

  const items = Array.from({ length: params.jumlah }, (_, idx) => {
    const pick = samples[idx % samples.length];
    return {
      id: `soal-${idx + 1}`,
      pertanyaan: pick.p,
      indikator_id: ind.match(/IK-0[1-5]/)?.[0] || "IK-01",
      tingkat_kesulitan: params.tingkat,
      pilihan: { A: pick.a, B: pick.b, C: pick.c, D: pick.d },
      jawaban_benar: pick.kunci,
      pembahasan: pick.bahas,
    };
  });

  return JSON.stringify(items);
}

export async function generateSoalAsesmen(params: GenerateSoalAsesmenParams): Promise<AIResult> {
  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Kamu adalah pakar pembuat soal asesmen diagnostik matematika SMP Kurikulum Merdeka.
TUGAS UTAMA: Buatkan soal pilihan ganda kontekstual kehidupan nyata yang relevan secara langsung dengan topik "${params.materi}".
HINDARI teks pengantar dan teks penutup. Keluarkan HANYA JSON array valid tanpa formatting markdown backticks.

Format setiap objek dalam array:
[
  {
    "id": "soal-1",
    "pertanyaan": "teks soal cerita kontekstual realistis sesuai topik materi yang diminta",
    "indikator_id": "${params.indikator}",
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
]
Pastikan tepat satu jawaban benar, angka realistis, dan JSON dapat diproses langsung dengan JSON.parse.`,
    },
    {
      role: "user",
      content: `Buat tepat ${params.jumlah} butir soal diagnostik pilihan ganda kontekstual kehidupan nyata untuk topik materi "${params.materi}", indikator "${params.indikator}", dengan tingkat kesulitan "${params.tingkat}". Jangan keluarkan teks apa pun selain JSON array valid.`,
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
