import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { createSession, hashPin, verifyPin, isValidPin, normalizeName } from "@/lib/student-auth";

/**
 * Langkah 2 login siswa: kode kelas + nama + PIN.
 *
 * Pertama kali seorang siswa masuk, PIN yang ia ketik dipasang sebagai kunci
 * namanya (klaim sekali). Setelah itu nama tersebut hanya bisa dibuka dengan
 * PIN yang sama — siswa lain tidak bisa masuk sebagai dirinya meskipun tahu
 * kode kelas dan nama lengkapnya.
 */
export async function POST(request: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as
    | { kode?: unknown; nama?: unknown; pin?: unknown }
    | null;

  const kode = typeof body?.kode === "string" ? body.kode.trim().toUpperCase() : "";
  const nama = typeof body?.nama === "string" ? normalizeName(body.nama) : "";
  const pin = body?.pin;

  if (!kode || !nama) {
    return NextResponse.json({ error: "Kode kelas dan nama wajib diisi." }, { status: 400 });
  }
  if (!isValidPin(pin)) {
    return NextResponse.json({ error: "PIN harus 4-6 angka." }, { status: 400 });
  }

  const { data: kelas } = await supabaseAdmin
    .from("classes")
    .select("id,nama")
    .eq("kode_undangan", kode)
    .maybeSingle();

  if (!kelas) {
    return NextResponse.json({ error: "Kode kelas tidak ditemukan." }, { status: 404 });
  }

  const { data: siswa } = await supabaseAdmin
    .from("students")
    .select("id,nama,pin_hash")
    .eq("kelas_id", kelas.id)
    .ilike("nama", nama)
    .maybeSingle();

  if (!siswa) {
    return NextResponse.json(
      { error: "Nama tidak ada di daftar kelas ini. Minta gurumu menambahkan namamu." },
      { status: 404 }
    );
  }

  let baru = false;
  if (siswa.pin_hash) {
    if (!(await verifyPin(pin, siswa.pin_hash))) {
      return NextResponse.json({ error: "PIN salah." }, { status: 401 });
    }
  } else {
    // Klaim pertama: PIN ini menjadi kunci permanen untuk nama tersebut.
    const { error } = await supabaseAdmin
      .from("students")
      .update({ pin_hash: await hashPin(pin), pin_diperbarui_pada: new Date().toISOString() })
      .eq("id", siswa.id)
      .is("pin_hash", null); // cegah balapan: hanya berhasil bila masih kosong
    if (error) {
      return NextResponse.json({ error: "Gagal menyimpan PIN." }, { status: 500 });
    }
    baru = true;
  }

  if (!(await createSession(siswa.id, kelas.id))) {
    return NextResponse.json({ error: "Gagal membuat sesi." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, pinBaru: baru, nama: siswa.nama, kelas: kelas.nama });
}
