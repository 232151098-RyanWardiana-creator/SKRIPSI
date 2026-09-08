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
        temperature: 0.85,
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
    return {
      id: `soal-${Date.now()}-${idx + 1}`,
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

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: `Kamu adalah pakar penyusun asesmen diagnostik matematika SMP Kurikulum Merdeka.
TUGAS UTAMA: Susun butir soal diagnostik pilihan ganda kontekstual kehidupan nyata yang KREATIF, SEGAR, dan BERBEDA di setiap permintaan untuk topik materi "${params.materi}".
HINDARI pengulangan soal atau angka klise yang sudah sering dipakai. Gunakan variasi skenario kehidupan nyata yang unik (misal terinspirasi dari konteks: ${randomContext}).
Pastikan angka perhitungan rapi, realistis, dan logis untuk siswa SMP.
Keluarkan HANYA JSON array valid tanpa formatting markdown backticks atau pengantar apa pun.

Format setiap objek dalam array:
[
  {
    "id": "soal-1",
    "pertanyaan": "soal cerita kontekstual realistis yang unik dan segar",
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
]`,
    },
    {
      role: "user",
      content: `Buat tepat ${params.jumlah} butir soal pilihan ganda kontekstual BARU dan BERBEDA (Variasi Token #${seed}) untuk topik materi "${params.materi}", indikator "${params.indikator}", tingkat "${params.tingkat}". Pastikan soal memiliki skenario unik, angka yang berbeda, tepat satu jawaban benar, dan format JSON array valid.`,
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
