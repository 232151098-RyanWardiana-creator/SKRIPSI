import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { getStudentSession } from "@/lib/student-auth";
import { scoreAssessment } from "@/lib/assessment-scoring";
import type { AnswerKey, Soal } from "@/types";

const KEYS: AnswerKey[] = ["a", "b", "c", "d"];

/**
 * Siswa menyimpan / mengumpulkan jawaban asesmen.
 * `siswa_id` selalu diambil dari cookie sesi, jadi siswa tidak bisa mengirim
 * jawaban atas nama siswa lain meskipun ia mengubah isi request.
 * Penilaian dihitung di server memakai kunci jawaban dari database.
 */
export async function POST(request: Request, ctx: { params: Promise<{ id: string }> }) {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }
  const sesi = await getStudentSession();
  if (!sesi) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const { id: asesmenId } = await ctx.params;
  const body = (await request.json().catch(() => null)) as
    | { jawaban?: unknown; selesai?: unknown }
    | null;

  const raw = body?.jawaban;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return NextResponse.json({ error: "Format jawaban tidak valid." }, { status: 400 });
  }
  const jawaban: Record<string, AnswerKey> = {};
  for (const [soalId, pilihan] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof pilihan === "string" && (KEYS as string[]).includes(pilihan)) {
      jawaban[soalId] = pilihan as AnswerKey;
    }
  }

  const { data: asesmen } = await supabaseAdmin
    .from("assessments")
    .select("id,kelas_id,status,soal")
    .eq("id", asesmenId)
    .maybeSingle();

  if (!asesmen) return NextResponse.json({ error: "Asesmen tidak ditemukan." }, { status: 404 });
  if (asesmen.kelas_id !== sesi.kelasId) {
    return NextResponse.json({ error: "Asesmen ini bukan untuk kelasmu." }, { status: 403 });
  }
  if (asesmen.status !== "aktif") {
    return NextResponse.json({ error: "Asesmen sudah ditutup." }, { status: 409 });
  }

  // Jawaban yang sudah dikumpulkan tidak boleh diubah lagi.
  const { data: existing } = await supabaseAdmin
    .from("submissions")
    .select("id,selesai,dikerjakan_pada")
    .eq("asesmen_id", asesmenId)
    .eq("siswa_id", sesi.siswaId)
    .maybeSingle();

  if (existing?.selesai) {
    return NextResponse.json({ error: "Kamu sudah mengumpulkan asesmen ini." }, { status: 409 });
  }

  const selesai = body?.selesai === true;
  const soal = (Array.isArray(asesmen.soal) ? asesmen.soal : []) as Soal[];
  const nilai = scoreAssessment(soal, jawaban);
  const now = new Date().toISOString();

  const { error } = await supabaseAdmin.from("submissions").upsert(
    {
      ...(existing?.id ? { id: existing.id } : {}),
      asesmen_id: asesmenId,
      kelas_id: sesi.kelasId,
      siswa_id: sesi.siswaId,
      nama_siswa: sesi.nama,
      skor_total: selesai ? nilai.score : 0,
      level: selesai ? nilai.level : "dasar",
      gaya_belajar: sesi.gayaBelajar,
      jawaban,
      detail_per_indikator: selesai ? nilai.detail_per_indikator : {},
      selesai,
      dikerjakan_pada: existing?.dikerjakan_pada ?? now,
      diperbarui_pada: now,
    },
    { onConflict: "asesmen_id,siswa_id" }
  );

  if (error) {
    console.error("Gagal menyimpan jawaban:", error);
    return NextResponse.json({ error: "Gagal menyimpan jawaban." }, { status: 500 });
  }

  if (selesai) {
    await supabaseAdmin.from("students").update({ level: nilai.level }).eq("id", sesi.siswaId);
  }

  return NextResponse.json({
    ok: true,
    selesai,
    ...(selesai
      ? { skor: nilai.score, level: nilai.level, detail: nilai.detail_per_indikator }
      : {}),
  });
}
