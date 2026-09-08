import { NextResponse } from "next/server";
import { generateSoalAsesmen, parseGeneratedQuestions } from "@/lib/ai";

export const runtime = "nodejs";
export const maxDuration = 60;
const indicators = ["IK-01", "IK-02", "IK-03", "IK-04", "IK-05", "SEMUA"] as const;
const difficulties = ["mudah", "sedang", "sulit"] as const;

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object") return NextResponse.json({ error: "Data permintaan tidak valid." }, { status: 400 });
    const value = body as Record<string, unknown>;
    const materi = typeof value.materi === "string" ? value.materi.trim() : "";
    const indikator = typeof value.indikator === "string" ? value.indikator : "";
    const jumlah = value.jumlah;
    const tingkat = typeof value.tingkat === "string" ? value.tingkat : "";
    const provider = typeof value.provider === "string" ? value.provider : undefined;
    const model = typeof value.model === "string" ? value.model : undefined;
    const customApiKey = typeof value.customApiKey === "string" ? value.customApiKey.trim() : undefined;
    const customBaseUrl = typeof value.customBaseUrl === "string" ? value.customBaseUrl.trim() : undefined;

    if (!materi || materi.length > 200 || !indicators.includes(indikator as typeof indicators[number]) || !Number.isInteger(jumlah) || Number(jumlah) < 1 || Number(jumlah) > 10 || !difficulties.includes(tingkat as typeof difficulties[number])) {
      return NextResponse.json({ error: "Isi materi, indikator IK-01 s.d. IK-05, jumlah 1–10, dan tingkat kesulitan yang valid." }, { status: 400 });
    }
    const result = await generateSoalAsesmen({
      materi,
      indikator,
      jumlah: Number(jumlah),
      tingkat: tingkat as "mudah" | "sedang" | "sulit",
      provider,
      model,
      customApiKey,
      customBaseUrl,
    });
    try {
      const questions = parseGeneratedQuestions(result.content, { indikator, tingkat: tingkat as "mudah" | "sedang" | "sulit" });
      return NextResponse.json({ source: result.source, model: result.model, questions, fallback: result.isFallback, isFallback: result.isFallback, error: result.error || null });
    } catch {
      return NextResponse.json({ source: result.source, model: result.model, questions: [], fallback: result.isFallback, isFallback: result.isFallback, error: "Respons AI tidak memiliki format soal yang valid. Silakan coba lagi." }, { status: 502 });
    }
  } catch {
    return NextResponse.json({ error: "Permintaan tidak dapat diproses. Pastikan data yang dikirim valid." }, { status: 400 });
  }
}
