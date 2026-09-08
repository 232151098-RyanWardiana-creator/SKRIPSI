"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { Role } from "@/types";
import {
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
  GraduationCap,
  Users,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { saveStoredTeacherProfile, getStoredTeacherProfile } from "@/lib/teacher-profile";

export function AuthForm({ mode = "login" }: { mode?: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryRole = searchParams.get("role");
  const redirectTarget = searchParams.get("redirect");

  const [role, setRole] = useState<Role>(queryRole === "siswa" ? "siswa" : "guru");
  const [nama, setNama] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (!isSupabaseConfigured) {
        throw new Error(
          "Koneksi database belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY."
        );
      }

      if (mode === "register") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: nama, sekolah, role: "guru" } },
        });
        if (error) throw error;

        if (data.user) {
          await supabase.from("profiles").upsert({ id: data.user.id, email, nama, sekolah });
          await saveStoredTeacherProfile({
            ...getStoredTeacherProfile(),
            nama,
            email,
            sekolah,
          });
        }

        const target = redirectTarget || "/dashboard";
        setSuccessMsg("Pendaftaran berhasil. Mengalihkan ke dasbor guru...");
        setTimeout(() => router.push(target), 1200);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          throw new Error(
            error.message.includes("Invalid login credentials")
              ? "Email atau kata sandi tidak cocok. Periksa kembali atau daftar akun baru."
              : error.message
          );
        }
        const target = redirectTarget || "/dashboard";
        setSuccessMsg(`Berhasil masuk. Mengalihkan ke ${target === "/generator" ? "Generator LKPD" : "dasbor"}...`);
        setTimeout(() => router.push(target), 600);
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat otentikasi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {redirectTarget && (
        <div className="flex items-start gap-2.5 rounded-2xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-950 shadow-xs">
          <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <span className="font-black text-amber-900">Perlu Akses Masuk</span>
            <p className="mt-0.5 text-slate-600 font-medium">
              Halaman <code className="font-mono font-bold text-amber-900 bg-amber-100/70 px-1 py-0.5 rounded">{redirectTarget}</code> memerlukan login. Silakan masuk terlebih dahulu.
            </p>
          </div>
        </div>
      )}

      {/* Pemilih Peran Interaktif */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100/90 p-1.5 border border-slate-200/80">
        <button
          className={`flex items-center justify-center rounded-xl py-2.5 text-xs sm:text-sm font-black transition-all ${
            role === "guru"
              ? "bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/20 scale-[1.01]"
              : "text-slate-600 hover:text-[#1E1B4B] hover:bg-white/60"
          }`}
          onClick={() => setRole("guru")}
          type="button"
        >
          Portal Guru
        </button>
        <button
          className={`flex items-center justify-center rounded-xl py-2.5 text-xs sm:text-sm font-black transition-all ${
            role === "siswa"
              ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/25 scale-[1.01]"
              : "text-slate-600 hover:text-[#2563EB] hover:bg-white/60"
          }`}
          onClick={() => setRole("siswa")}
          type="button"
        >
          Portal Siswa
        </button>
      </div>

      {role === "siswa" ? (
        <div className="relative overflow-hidden space-y-4 rounded-2xl border border-white/15 bg-gradient-to-b from-slate-900/95 via-[#0B0F19]/95 to-slate-950/95 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.15)] backdrop-blur-2xl text-white">
          {/* Subtle Ambient Glass Glows */}
          <div className="pointer-events-none absolute -top-12 -left-12 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-12 -right-12 h-32 w-32 rounded-full bg-purple-500/20 blur-2xl" />

          {/* Header: Pure Words, No Icon, Subtitle Removed */}
          <div className="border-b border-white/10 pb-2.5">
            <span className="inline-block text-[10px] font-black uppercase tracking-widest text-blue-400 mb-0.5">
              Akses Cepat Siswa
            </span>
            <h3 className="text-base font-black text-white tracking-tight">
              Masuk Tanpa Password
            </h3>
          </div>

          <div className="grid gap-2.5 text-xs font-medium pt-0.5">
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2.5 border border-white/10 shadow-xs backdrop-blur-md transition-colors">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-500/25 border border-blue-400/40 text-[11px] font-black text-blue-300">
                1
              </span>
              <span className="text-slate-200">
                Ketik <strong className="font-bold text-white">Kode Kelas</strong> dari gurumu
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2.5 border border-white/10 shadow-xs backdrop-blur-md transition-colors">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-indigo-500/25 border border-indigo-400/40 text-[11px] font-black text-indigo-300">
                2
              </span>
              <span className="text-slate-200">
                Pilih <strong className="font-bold text-white">Namamu</strong> dari daftar rombel
              </span>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] px-3.5 py-2.5 border border-white/10 shadow-xs backdrop-blur-md transition-colors">
              <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-purple-500/25 border border-purple-400/40 text-[11px] font-black text-purple-300">
                3
              </span>
              <span className="text-slate-200">
                Masukkan <strong className="font-bold text-white">PIN 4 Angka</strong> milikmu
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-950/40 border border-emerald-500/25 px-3 py-2 text-[11px] text-emerald-300/90 backdrop-blur-md">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span>PIN menjaga agar siswa lain tidak dapat mengisi atas namamu.</span>
          </div>

          <button
            className="relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-[#2563EB] via-[#4F46E5] to-[#7C3AED] px-6 py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-950/50 border border-white/20 transition-all hover:brightness-110 hover:shadow-indigo-500/30 hover:-translate-y-0.5 active:scale-95 cursor-pointer"
            onClick={() => router.push("/dashboard-siswa")}
            type="button"
          >
            Buka Portal Siswa
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/95 p-3.5 text-xs text-rose-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
              <p className="leading-relaxed font-medium">{errorMsg}</p>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50/95 p-3.5 text-xs text-emerald-800 font-medium">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
              <p>{successMsg}</p>
            </div>
          )}

          {mode === "register" && (
            <>
              <div>
                <label className="block text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Nama Lengkap <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Ryan Wardiana, S.Pd."
                  required
                  value={nama}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-1.5">
                  Nama Sekolah / Instansi <span className="text-rose-500">*</span>
                </label>
                <input
                  className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                  onChange={(e) => setSekolah(e.target.value)}
                  placeholder="Contoh: SMP Negeri 3 Tasikmalaya"
                  required
                  value={sekolah}
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-1.5">
              Email Guru / Belajar.id <span className="text-rose-500">*</span>
            </label>
            <input
              className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/70 px-4 py-3 text-sm font-medium text-slate-900 transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
              onChange={(e) => setEmail(e.target.value)}
              placeholder="guru@sekolah.sch.id"
              required
              type="email"
              value={email}
            />
          </div>

          <div>
            <label className="block text-xs font-black text-[#1E1B4B] uppercase tracking-wider mb-1.5">
              Kata Sandi <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                className="w-full rounded-xl border-2 border-slate-200 bg-slate-50/70 px-4 py-3 pr-11 text-sm font-medium text-slate-900 transition-all focus:border-[#2563EB] focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10"
                minLength={6}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
                required
                type={show ? "text" : "password"}
                value={password}
              />
              <button
                aria-label={show ? "Sembunyikan sandi" : "Lihat sandi"}
                className="absolute right-3.5 top-3.5 text-slate-400 hover:text-[#1E1B4B]"
                onClick={() => setShow(!show)}
                type="button"
              >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            className="w-full mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#1E1B4B] via-[#2563EB] to-[#7C3AED] py-3.5 text-sm font-black text-white shadow-lg shadow-indigo-950/20 transition-all hover:opacity-95 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 disabled:opacity-50 cursor-pointer"
            disabled={loading}
            type="submit"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses...
              </>
            ) : mode === "login" ? (
              <>
                <LogIn className="h-4 w-4" />
                Masuk ke Akun Guru
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                Daftar Akun Guru
              </>
            )}
          </button>

          <p className="pt-2 text-center text-xs font-semibold text-slate-500">
            {mode === "login" ? "Belum memiliki akun guru?" : "Sudah memiliki akun?"}{" "}
            <Link
              className="font-bold text-[#2563EB] hover:underline"
              href={mode === "login" ? "/register" : "/login"}
            >
              {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
            </Link>
          </p>
        </>
      )}
    </form>
  );
}
