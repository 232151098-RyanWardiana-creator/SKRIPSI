import { createClient } from "@supabase/supabase-js";

/**
 * Klien Supabase dengan service role. HANYA untuk kode server (route handler).
 * Jangan pernah diimpor dari komponen berlabel "use client" — kuncinya rahasia.
 *
 * Klien ini melewati RLS, jadi setiap route yang memakainya WAJIB memfilter
 * data berdasarkan identitas dari cookie sesi, bukan dari input yang dikirim
 * browser.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const isAdminConfigured = Boolean(url && serviceKey);

export const supabaseAdmin = createClient(
  url || "https://placeholder.supabase.co",
  serviceKey || "placeholder-key",
  { auth: { persistSession: false, autoRefreshToken: false } }
);
