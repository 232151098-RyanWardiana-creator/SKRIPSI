import { generateLKPD, getAIStatus, type GenerateLKPDParams } from "@/lib/ai";
import type { GayaBelajar, Level } from "@/types";

export const runtime = "nodejs";

const levels: Level[] = ["dasar", "menengah", "mahir"];
const gayaBelajar = new Set<Exclude<GayaBelajar, null>>(["visual", "auditory", "kinestetik"]);

type RequestBody = Omit<GenerateLKPDParams, "level"> & {
  level?: Level;
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
    provider: typeof body.provider === "string" ? body.provider : undefined,
    model: typeof body.model === "string" ? body.model : undefined,
    customApiKey: typeof body.customApiKey === "string" ? body.customApiKey : undefined,
    customBaseUrl: typeof body.customBaseUrl === "string" ? body.customBaseUrl : undefined,
  };
  const requestedLevels = body.level ? [body.level] : levels;
  const aiConnected = (await getAIStatus()).connected;
  const results = [];

  // Deliberately sequential: the local proxy is less reliable under three simultaneous completions.
  for (const level of requestedLevels) {
    let settled = await Promise.allSettled([generateLKPD({ ...clean, level })]);
    let outcome = settled[0];
    if (aiConnected && (outcome.status === "rejected" || outcome.value.source === "mock")) {
      settled = await Promise.allSettled([generateLKPD({ ...clean, level })]);
      outcome = settled[0];
    }

    if (outcome.status === "fulfilled" && outcome.value.content.trim()) {
      const value = outcome.value;
      results.push({
        level,
        status: value.source === "online" ? "success" : "fallback",
        content: value.content,
        source: value.source,
        model: value.model,
        isFallback: value.isFallback,
        error: value.error ?? null,
      });
    } else {
      results.push({
        level,
        status: "error",
        content: "",
        source: "mock",
        model: "tidak tersedia",
        isFallback: false,
        error: outcome.status === "rejected" && outcome.reason instanceof Error
          ? outcome.reason.message
          : "Generator menghasilkan konten kosong.",
      });
    }
  }

  return Response.json({ results });
}
