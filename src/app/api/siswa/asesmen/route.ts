import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { getStudentSession } from "@/lib/student-auth";

/** Asesmen aktif di kelas siswa yang sedang login + progres miliknya sendiri. */
export async function GET() {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }
  const sesi = await getStudentSession();
  if (!sesi) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const [{ data: asesmen }, { data: milikSaya }] = await Promise.all([
    supabaseAdmin
      .from("assessments")
      .select("id,judul,materi,durasi_menit,status,kuesioner_aktif,soal,tanggal_mulai,tanggal_selesai,deskripsi")
      .eq("kelas_id", sesi.kelasId)
      .order("dibuat_pada", { ascending: false }),
    supabaseAdmin
      .from("submissions")
      .select("id,asesmen_id,skor_total,level,gaya_belajar,jawaban,detail_per_indikator,selesai,dikerjakan_pada")
      .eq("siswa_id", sesi.siswaId),
  ]);

  return NextResponse.json({
    siswa: sesi,
    // Kunci jawaban dibuang sebelum dikirim ke browser siswa.
    asesmen: (asesmen ?? []).map((a) => ({
      ...a,
      soal: (Array.isArray(a.soal) ? a.soal : []).map((s: Record<string, unknown>) => {
        const { jawaban_benar: _kunci, ...aman } = s;
        void _kunci;
        return aman;
      }),
    })),
    hasilSaya: milikSaya ?? [],
  });
}
