import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { getStudentSession } from "@/lib/student-auth";
import type { GayaBelajar } from "@/types";

const GAYA: GayaBelajar[] = ["visual", "auditory", "kinestetik"];

/** Hasil kuesioner gaya belajar milik siswa yang sedang login. */
export async function POST(request: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }
  const sesi = await getStudentSession();
  if (!sesi) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const body = (await request.json().catch(() => null)) as
    | { gayaBelajar?: unknown; asesmenId?: unknown }
    | null;
  const gaya = body?.gayaBelajar;
  if (!GAYA.includes(gaya as GayaBelajar)) {
    return NextResponse.json({ error: "Gaya belajar tidak valid." }, { status: 400 });
  }

  const { error } = await supabaseAdmin
    .from("students")
    .update({ gaya_belajar: gaya })
    .eq("id", sesi.siswaId);
  if (error) return NextResponse.json({ error: "Gagal menyimpan." }, { status: 500 });

  if (typeof body?.asesmenId === "string" && body.asesmenId) {
    await supabaseAdmin
      .from("submissions")
      .update({ gaya_belajar: gaya, diperbarui_pada: new Date().toISOString() })
      .eq("asesmen_id", body.asesmenId)
      .eq("siswa_id", sesi.siswaId);
  }

  return NextResponse.json({ ok: true, gayaBelajar: gaya });
}
