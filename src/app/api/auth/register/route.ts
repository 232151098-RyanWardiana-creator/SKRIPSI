import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";

export async function POST(request: Request) {
  if (!isAdminConfigured) {
    return NextResponse.json(
      { error: "Konfigurasi server database belum lengkap." },
      { status: 503 }
    );
  }

  try {
    const body = (await request.json().catch(() => null)) as {
      email?: string;
      password?: string;
      nama?: string;
      sekolah?: string;
    } | null;

    const email = body?.email?.trim().toLowerCase();
    const password = body?.password;
    const nama = body?.nama?.trim();
    const sekolah = body?.sekolah?.trim() || "";

    if (!email || !password || !nama) {
      return NextResponse.json(
        { error: "Email, kata sandi, dan nama lengkap wajib diisi." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Kata sandi minimal 6 karakter." },
        { status: 400 }
      );
    }

    // 1. Cek apakah user sudah ada di auth Supabase
    const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
    const existing = listData?.users?.find((u) => u.email === email);

    let userId: string;

    if (existing) {
      // User sudah terdaftar, update password dan pastikan email terkonfirmasi
      const { data: updated, error: updateErr } =
        await supabaseAdmin.auth.admin.updateUserById(existing.id, {
          password,
          email_confirm: true,
          user_metadata: { full_name: nama, sekolah, role: "guru" },
        });

      if (updateErr || !updated.user) {
        return NextResponse.json(
          { error: updateErr?.message || "Gagal memperbarui akun guru." },
          { status: 400 }
        );
      }
      userId = updated.user.id;
    } else {
      // Buat user baru langsung berstatus email terkonfirmasi (tanpa hambatan email verifikasi)
      const { data: created, error: createErr } =
        await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { full_name: nama, sekolah, role: "guru" },
        });

      if (createErr || !created.user) {
        return NextResponse.json(
          { error: createErr?.message || "Gagal membuat akun guru." },
          { status: 400 }
        );
      }
      userId = created.user.id;
    }

    // 2. Simpan atau perbarui profil di tabel profiles
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: userId, email, nama, sekolah });

    return NextResponse.json({
      ok: true,
      message: "Pendaftaran berhasil.",
      userId,
    });
  } catch (err) {
    console.error("Error register teacher:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan pada server saat pendaftaran." },
      { status: 500 }
    );
  }
}
