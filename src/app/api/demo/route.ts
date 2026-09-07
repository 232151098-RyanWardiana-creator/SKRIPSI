import { NextResponse } from "next/server";
import { guruDariRequest } from "@/lib/guru-auth";
import { supabaseAdmin, isAdminConfigured } from "@/lib/supabase-admin";
import { hashPin } from "@/lib/pin";
import {
  DEMO_IDS,
  DEMO_KELAS,
  DEMO_LKPD,
  DEMO_PENGISIAN,
  DEMO_PIN,
  DEMO_SISWA,
  DEMO_SOAL,
  nilaiDemoSiswa,
} from "@/lib/demo-data";

/**
 * Data simulasi untuk presentasi. Hanya guru yang sudah login boleh memicunya
 * (service role bisa menembus RLS, jadi penjaga ini wajib).
 *
 * POST   -> memasang seluruh rantai: kelas, siswa, asesmen, hasil asesmen,
 *           3 LKPD berdiferensiasi, dan pengisian LKPD siswa.
 * DELETE -> mencabut kembali tepat baris-baris simulasi itu saja.
 */

const now = () => new Date().toISOString();
const idSiswa = DEMO_SISWA.map((s) => s.id);

export async function POST(request: Request) {
  if (!isAdminConfigured) return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 500 });
  if (!(await guruDariRequest(request)))
    return NextResponse.json({ error: "Harus login sebagai guru." }, { status: 401 });

  const pinHash = await hashPin(DEMO_PIN);
  const hasil = new Map(DEMO_SISWA.map((s) => [s.nama, nilaiDemoSiswa(s.pilihan)]));

  const langkah: [string, unknown[]][] = [
    ["classes", [{ ...DEMO_KELAS, guru_id: null }]],
    [
      "students",
      DEMO_SISWA.map((s) => ({
        id: s.id,
        kelas_id: DEMO_KELAS.id,
        nama: s.nama,
        no_absen: s.no_absen,
        nisn: s.nisn,
        gaya_belajar: s.gaya_belajar,
        level: hasil.get(s.nama)!.level,
        pin_hash: pinHash,
        pin_diperbarui_pada: now(),
      })),
    ],
    [
      "assessments",
      [
        {
          id: DEMO_IDS.asesmen,
          judul: "Asesmen Diagnostik Bilangan Bulat (Simulasi)",
          materi: "Bilangan Bulat",
          kelas_id: DEMO_KELAS.id,
          kode_kelas: DEMO_KELAS.kode_undangan,
          durasi_menit: 30,
          status: "selesai",
          kuesioner_aktif: true,
          soal: DEMO_SOAL.map((s) => ({ ...s, asesmen_id: DEMO_IDS.asesmen })),
          deskripsi: "Contoh asesmen lengkap beserta hasil 8 siswa, dipakai untuk demonstrasi aplikasi.",
        },
      ],
    ],
    [
      "submissions",
      DEMO_SISWA.map((s) => {
        const nilai = hasil.get(s.nama)!;
        return {
          id: s.id.replace("d1000000", "d2000000"),
          asesmen_id: DEMO_IDS.asesmen,
          kelas_id: DEMO_KELAS.id,
          siswa_id: s.id,
          nama_siswa: s.nama,
          skor_total: nilai.skor_total,
          level: nilai.level,
          gaya_belajar: s.gaya_belajar,
          jawaban: nilai.jawaban,
          detail_per_indikator: nilai.detail_per_indikator,
          selesai: true,
        };
      }),
    ],
    [
      "lkpd_documents",
      DEMO_LKPD.map((l) => ({
        id: l.id,
        judul: l.judul,
        asesmen_id: DEMO_IDS.asesmen,
        kelas_id: DEMO_KELAS.id,
        kelas_nama: DEMO_KELAS.nama,
        materi: "Bilangan Bulat",
        level: l.level,
        konten: l.konten,
        soal: l.soal,
        status: "validated",
        dibagikan: true,
        model: "simulasi",
        is_fallback: true,
        divalidasi_pada: now(),
      })),
    ],
    [
      "lkpd_submissions",
      DEMO_SISWA.flatMap((s) => {
        const isi = DEMO_PENGISIAN[s.nama];
        if (!isi) return [];
        const lkpd = DEMO_LKPD.find((l) => l.level === hasil.get(s.nama)!.level) ?? DEMO_LKPD[0];
        return [
          {
            id: s.id.replace("d1000000", "d3000000"),
            lkpd_id: lkpd.id,
            siswa_id: s.id,
            kelas_id: DEMO_KELAS.id,
            nama_siswa: s.nama,
            jawaban: isi.isi,
            status: isi.status,
            nilai: isi.nilai ?? null,
            catatan_guru: isi.catatan ?? null,
            dikirim_pada: isi.status === "draft" ? null : now(),
            dinilai_pada: isi.status === "dinilai" ? now() : null,
          },
        ];
      }),
    ],
  ];

  for (const [tabel, rows] of langkah) {
    if (!rows.length) continue;
    const { error } = await supabaseAdmin.from(tabel).upsert(rows);
    if (error) return NextResponse.json({ error: `Gagal memuat ${tabel}: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    kelas: DEMO_KELAS.nama,
    kode: DEMO_KELAS.kode_undangan,
    pin: DEMO_PIN,
    siswa: DEMO_SISWA.length,
    lkpd: DEMO_LKPD.length,
  });
}

export async function DELETE(request: Request) {
  if (!isAdminConfigured) return NextResponse.json({ error: "Server belum dikonfigurasi." }, { status: 500 });
  if (!(await guruDariRequest(request)))
    return NextResponse.json({ error: "Harus login sebagai guru." }, { status: 401 });

  // Urutan sengaja dari anak ke induk supaya tidak melanggar foreign key.
  await supabaseAdmin.from("lkpd_submissions").delete().in("siswa_id", idSiswa);
  await supabaseAdmin.from("lkpd_documents").delete().in("id", Object.values(DEMO_IDS.lkpd));
  await supabaseAdmin.from("submissions").delete().in("siswa_id", idSiswa);
  await supabaseAdmin.from("student_sessions").delete().in("siswa_id", idSiswa);
  await supabaseAdmin.from("assessments").delete().eq("id", DEMO_IDS.asesmen);
  await supabaseAdmin.from("students").delete().in("id", idSiswa);
  const { error } = await supabaseAdmin.from("classes").delete().eq("id", DEMO_KELAS.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
