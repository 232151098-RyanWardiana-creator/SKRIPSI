import { NextResponse } from "next/server";
import { getStudentSession } from "@/lib/student-auth";
import { supabaseAdmin } from "@/lib/supabase-admin";

export async function POST() {
  const session = await getStudentSession();
  if (!session) {
    return NextResponse.json({ error: "Sesi tidak valid" }, { status: 401 });
  }

  if (!session.kelompok) {
    return NextResponse.json(
      { error: "Kamu belum terdaftar di kelompok manapun." },
      { status: 400 }
    );
  }

  try {
    // 1. Reset juru tulis di kelompok ini
    await supabaseAdmin
      .from("students")
      .update({ is_juru_tulis: false })
      .eq("kelas_id", session.kelasId)
      .eq("kelompok", session.kelompok);

    // 2. Set siswa ini sebagai juru tulis
    const { error } = await supabaseAdmin
      .from("students")
      .update({ is_juru_tulis: true })
      .eq("id", session.siswaId);

    if (error) {
      console.warn("Update juru tulis warning (mungkin kolom belum ada di schema):", error);
    }

    return NextResponse.json({
      success: true,
      message: "Peran Juru Tulis berhasil dialihkan ke perangkatmu.",
      kelompok: session.kelompok,
      isJuruTulis: true,
    });
  } catch (err) {
    console.error("Gagal alihkan juru tulis:", err);
    return NextResponse.json(
      { error: "Gagal mengalihkan juru tulis" },
      { status: 500 }
    );
  }
}
