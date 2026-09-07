import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";

/** Langkah 1 login siswa: tukar kode kelas dengan daftar nama di kelas itu. */
export async function POST(request: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }

  const body: unknown = await request.json().catch(() => null);
  const kode = typeof (body as { kode?: unknown })?.kode === "string"
    ? (body as { kode: string }).kode.trim().toUpperCase()
    : "";
  if (kode.length < 4) {
    return NextResponse.json({ error: "Kode kelas tidak valid." }, { status: 400 });
  }

  const { data: kelas } = await supabaseAdmin
    .from("classes")
    .select("id,nama,tahun_ajaran,kode_undangan")
    .eq("kode_undangan", kode)
    .maybeSingle();

  if (!kelas) {
    return NextResponse.json({ error: "Kode kelas tidak ditemukan." }, { status: 404 });
  }

  const { data: siswa } = await supabaseAdmin
    .from("students")
    .select("id,nama,no_absen,pin_hash")
    .eq("kelas_id", kelas.id)
    .order("no_absen", { ascending: true });

  return NextResponse.json({
    kelas: { id: kelas.id, nama: kelas.nama, tahunAjaran: kelas.tahun_ajaran, kode: kelas.kode_undangan },
    siswa: (siswa ?? []).map((s) => ({
      id: s.id,
      nama: s.nama,
      noAbsen: s.no_absen,
      sudahPunyaPin: Boolean(s.pin_hash),
    })),
  });
}
