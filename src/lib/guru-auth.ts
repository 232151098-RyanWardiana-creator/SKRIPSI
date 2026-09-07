import { supabaseAdmin } from "@/lib/supabase-admin";

/**
 * Memastikan request datang dari guru yang benar-benar sudah login.
 *
 * Route yang memakai service role bisa menembus semua RLS, jadi route seperti
 * itu WAJIB memanggil fungsi ini lebih dulu. Klien mengirim access token
 * Supabase Auth di header `Authorization: Bearer <token>`; token itu
 * diverifikasi ke Supabase, bukan dipercaya apa adanya.
 *
 * Mengembalikan id guru bila sah, atau `null` bila tidak.
 */
export async function guruDariRequest(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization") ?? "";
  const token = header.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user.id;
}
