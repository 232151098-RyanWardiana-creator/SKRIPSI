import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { getStudentSession } from "@/lib/student-auth";

/**
 * Siswa menyimpan draft atau mengirim pengisian LKPD.
 *
 * INTEGRITAS DATA PENELITIAN: `siswa_id` diambil dari cookie sesi, bukan dari
 * body request, sehingga siswa A tidak bisa menulis di lembar siswa B. Kolom
 * `nilai` dan `catatan_guru` tidak pernah disentuh di sini — itu wilayah guru.
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }
  const sesi = await getStudentSession();
  if (!sesi) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const { id: lkpdId } = await params;
  const body = (await request.json().catch(() => null)) as
    | { jawaban?: unknown; kirim?: unknown }
    | null;
  if (!body || typeof body.jawaban !== "object" || body.jawaban === null) {
    return NextResponse.json({ error: "Jawaban tidak valid." }, { status: 400 });
  }

  // LKPD harus benar-benar dibagikan ke kelas siswa ini.
  const { data: dokumen } = await supabaseAdmin
    .from("lkpd_documents")
    .select("id,kelas_id,dibagikan")
    .eq("id", lkpdId)
    .maybeSingle();
  if (!dokumen || dokumen.kelas_id !== sesi.kelasId || !dokumen.dibagikan) {
    return NextResponse.json({ error: "LKPD tidak tersedia untuk kelasmu." }, { status: 404 });
  }

  // Yang sudah dinilai guru dibekukan agar nilai tidak jadi tidak sinkron.
  const { data: adaSebelumnya } = await supabaseAdmin
    .from("lkpd_submissions")
    .select("id,status")
    .eq("lkpd_id", lkpdId)
    .eq("siswa_id", sesi.siswaId)
    .maybeSingle();
  if (adaSebelumnya?.status === "dinilai") {
    return NextResponse.json(
      { error: "LKPD ini sudah dinilai guru dan tidak bisa diubah lagi." },
      { status: 409 }
    );
  }

  const jawaban: Record<string, string> = {};
  for (const [kunci, nilai] of Object.entries(body.jawaban as Record<string, unknown>)) {
    if (typeof nilai === "string") jawaban[kunci] = nilai.slice(0, 5000);
  }

  const kirim = body.kirim === true;
  const sekarang = new Date().toISOString();

  const { error } = await supabaseAdmin.from("lkpd_submissions").upsert(
    {
      lkpd_id: lkpdId,
      siswa_id: sesi.siswaId,
      kelas_id: sesi.kelasId,
      nama_siswa: sesi.nama,
      jawaban,
      status: kirim ? "terkirim" : "draft",
      dikirim_pada: kirim ? sekarang : null,
      diperbarui_pada: sekarang,
    },
    { onConflict: "lkpd_id,siswa_id" }
  );

  if (error) {
    console.error("Gagal menyimpan pengisian LKPD:", error);
    return NextResponse.json({ error: "Gagal menyimpan jawaban." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, status: kirim ? "terkirim" : "draft" });
}
