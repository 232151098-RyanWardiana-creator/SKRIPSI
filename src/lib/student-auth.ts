import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { supabaseAdmin } from "@/lib/supabase-admin";

export { hashPin, verifyPin, isValidPin, normalizeName } from "@/lib/pin";

export const SESSION_COOKIE = "lkpd_siswa";
const SESSION_DAYS = 30;

export async function createSession(siswaId: string, kelasId: string) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  const { error } = await supabaseAdmin.from("student_sessions").insert({
    token,
    siswa_id: siswaId,
    kelas_id: kelasId,
    kedaluwarsa_pada: expires.toISOString(),
  });
  if (error) return null;
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return token;
}

export interface StudentSession {
  siswaId: string;
  kelasId: string;
  nama: string;
  noAbsen: number | null;
  level: string | null;
  gayaBelajar: string | null;
  kelasNama: string;
  kodeKelas: string;
}

/**
 * Identitas siswa untuk request ini, dibaca dari cookie httpOnly.
 * Inilah satu-satunya sumber identitas yang sah: siswa tidak bisa mengaku
 * sebagai siswa lain dengan mengubah body request.
 */
export async function getStudentSession(): Promise<StudentSession | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const { data } = await supabaseAdmin
    .from("student_sessions")
    .select("siswa_id,kelas_id,kedaluwarsa_pada,students(nama,no_absen,level,gaya_belajar),classes(nama,kode_undangan)")
    .eq("token", token)
    .maybeSingle();

  if (!data) return null;
  if (new Date(data.kedaluwarsa_pada).getTime() < Date.now()) {
    await supabaseAdmin.from("student_sessions").delete().eq("token", token);
    return null;
  }

  const student = data.students as unknown as {
    nama: string; no_absen: number | null; level: string | null; gaya_belajar: string | null;
  } | null;
  const kelas = data.classes as unknown as { nama: string; kode_undangan: string } | null;
  if (!student) return null;

  return {
    siswaId: data.siswa_id,
    kelasId: data.kelas_id,
    nama: student.nama,
    noAbsen: student.no_absen,
    level: student.level,
    gayaBelajar: student.gaya_belajar,
    kelasNama: kelas?.nama ?? "",
    kodeKelas: kelas?.kode_undangan ?? "",
  };
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await supabaseAdmin.from("student_sessions").delete().eq("token", token);
  store.delete(SESSION_COOKIE);
}
