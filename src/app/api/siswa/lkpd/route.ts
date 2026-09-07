import { NextResponse } from "next/server";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { getStudentSession } from "@/lib/student-auth";
import { itemLkpd } from "@/lib/lkpd-items";

/**
 * LKPD yang dibagikan guru untuk kelas + level siswa yang sedang login,
 * beserta pengisian miliknya sendiri.
 *
 * Level diambil dari hasil asesmen siswa (kolom `students.level`), jadi tiap
 * siswa hanya melihat LKPD sesuai kesiapannya — inti diferensiasinya.
 */
export async function GET() {
  if (!isAdminConfigured) {
    return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 503 });
  }
  const sesi = await getStudentSession();
  if (!sesi) return NextResponse.json({ error: "Belum masuk." }, { status: 401 });

  const { data: dokumen } = await supabaseAdmin
    .from("lkpd_documents")
    .select("id,judul,materi,level,konten,soal,dibuat_pada,kelas_nama")
    .eq("kelas_id", sesi.kelasId)
    .eq("dibagikan", true)
    .order("dibuat_pada", { ascending: false });

  // Siswa yang belum asesmen belum punya level: tampilkan semua yang dibagikan
  // agar ia tidak melihat halaman kosong tanpa sebab.
  const cocok = (dokumen ?? []).filter((row) => !sesi.level || row.level === sesi.level);

  const { data: pengisian } = await supabaseAdmin
    .from("lkpd_submissions")
    .select("id,lkpd_id,jawaban,status,nilai,catatan_guru,dikirim_pada,dinilai_pada,diperbarui_pada")
    .eq("siswa_id", sesi.siswaId);

  const punyaSaya = new Map((pengisian ?? []).map((row) => [row.lkpd_id, row]));

  return NextResponse.json({
    siswa: sesi,
    lkpd: cocok.map((row) => {
      const milikSaya = punyaSaya.get(row.id);
      return {
        id: row.id,
        judul: row.judul,
        materi: row.materi,
        level: row.level,
        konten: row.konten ?? "",
        dibuatPada: row.dibuat_pada,
        butir: itemLkpd(row.soal, row.konten ?? ""),
        pengisian: milikSaya
          ? {
              jawaban: (milikSaya.jawaban ?? {}) as Record<string, string>,
              status: milikSaya.status as "draft" | "terkirim" | "dinilai",
              nilai: milikSaya.nilai === null ? null : Number(milikSaya.nilai),
              catatanGuru: milikSaya.catatan_guru ?? null,
              dikirimPada: milikSaya.dikirim_pada ?? null,
              diperbaruiPada: milikSaya.diperbarui_pada ?? null,
            }
          : null,
      };
    }),
  });
}
