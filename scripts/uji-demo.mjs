/**
 * Uji E2E: data simulasi + alur LKPD siswa.
 * Menggunakan magiclink admin untuk mendapatkan access token guru.
 */
const URL_SB = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const APP = "http://127.0.0.1:3100";
const EMAIL = `uji-hermes-${Date.now()}@contoh.test`;
const SANDI = `Uji-${Math.random().toString(36).slice(2)}-9xZ`;

const adminHeaders = { apikey: SRV, Authorization: `Bearer ${SRV}`, "Content-Type": "application/json" };

/** Buat guru uji sementara, ambil access token, hapus lagi di akhir. */
async function buatGuruUji() {
  const buat = await fetch(`${URL_SB}/auth/v1/admin/users`, {
    method: "POST",
    headers: adminHeaders,
    body: JSON.stringify({ email: EMAIL, password: SANDI, email_confirm: true }),
  });
  const user = await buat.json();
  if (!user.id) throw new Error(`buat user gagal: ${JSON.stringify(user)}`);

  const masuk = await fetch(`${URL_SB}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: { apikey: ANON, "Content-Type": "application/json" },
    body: JSON.stringify({ email: EMAIL, password: SANDI }),
  });
  const sesi = await masuk.json();
  if (!sesi.access_token) throw new Error(`login gagal: ${JSON.stringify(sesi)}`);
  return { id: user.id, token: sesi.access_token };
}

async function hapusGuruUji(id) {
  await fetch(`${URL_SB}/auth/v1/admin/users/${id}`, { method: "DELETE", headers: adminHeaders });
}

const guru = await buatGuruUji();
const token = guru.token;
console.log("1. token guru uji: OK");

// Tanpa token harus ditolak.
const tanpa = await fetch(`${APP}/api/demo`, { method: "POST" });
console.log(`2. POST /api/demo tanpa token -> ${tanpa.status} ${JSON.stringify(await tanpa.json())}`);

const pasang = await fetch(`${APP}/api/demo`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
console.log(`3. POST /api/demo dengan token -> ${pasang.status} ${JSON.stringify(await pasang.json())}`);

const cek = async (tabel, query) => {
  const r = await fetch(`${URL_SB}/rest/v1/${tabel}?${query}`, { headers: adminHeaders });
  const d = await r.json();
  return Array.isArray(d) ? d : d;
};
console.log("4. siswa simulasi:", (await cek("students", "select=nama,level&kelas_id=eq.d0000000-0000-4000-8000-000000000001&order=no_absen")).map((s) => `${s.nama}=${s.level}`).join(", "));
console.log("5. hasil asesmen:", (await cek("submissions", "select=nama_siswa,skor_total,level&asesmen_id=eq.d0000000-0000-4000-8000-000000000002&order=skor_total.desc")).map((s) => `${s.nama_siswa}:${s.skor_total}`).join(", "));
console.log("6. lkpd:", (await cek("lkpd_documents", "select=level,judul,dibagikan&kelas_id=eq.d0000000-0000-4000-8000-000000000001")).map((l) => `${l.level}/dibagikan=${l.dibagikan}`).join(", "));
console.log("7. pengisian:", (await cek("lkpd_submissions", "select=nama_siswa,status,nilai&kelas_id=eq.d0000000-0000-4000-8000-000000000001&order=nama_siswa")).map((p) => `${p.nama_siswa}=${p.status}${p.nilai ? "/" + p.nilai : ""}`).join(", "));

await hapusGuruUji(guru.id);
console.log("8. guru uji dihapus.");
