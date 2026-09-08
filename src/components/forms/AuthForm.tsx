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
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, nama, sekolah }),
        });

        const resData = await res.json().catch(() => null);
        if (!res.ok) {
          throw new Error(resData?.error || "Pendaftaran gagal. Periksa data kembali.");
        }

        // Otomatis login ke sesi Supabase di browser
        const { error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
        if (loginErr) throw loginErr;

        await saveStoredTeacherProfile({
          ...getStoredTeacherProfile(),
          nama,
          email,
          sekolah,
        });

        const target = redirectTarget || "/dashboard";
        setSuccessMsg("Pendaftaran berhasil. Mengalihkan ke dasbor guru...");
        setTimeout(() => router.push(target), 1000);
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
        <div className="space-y-4 rounded-2xl border-2 border-slate-200/90 bg-slate-50/60 p-5 shadow-xs">
          {/* Header: Pure Words, No Icon, Subtitle Removed */}
          <div>
            <h3 className="text-base font-black text-[#1E1B4B] tracking-tight">
              Masuk Tanpa Password
            </h3>
          </div>

          {/* Connected Stepper Timeline for Steps 1, 2, 3 (Clean, Human Design, No AI Slop) */}
          <div className="relative pl-7 space-y-2.5 before:absolute before:left-[11px] before:top-3 before:bottom-3 before:w-[2px] before:bg-slate-200">
            {/* Step 1 */}
            <div className="relative flex items-center">
              <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-[#2563EB] text-[11px] font-black text-[#2563EB] shadow-xs">
                1
              </span>
              <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs">
                <span className="font-bold text-slate-900">Kode Kelas</span>
                <span className="text-slate-500 ml-1.5">— Dari gurumu</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative flex items-center">
              <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-indigo-600 text-[11px] font-black text-indigo-600 shadow-xs">
                2
              </span>
              <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs">
                <span className="font-bold text-slate-900">Pilih Nama</span>
                <span className="text-slate-500 ml-1.5">— Dari daftar rombel</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative flex items-center">
              <span className="absolute -left-7 flex h-6 w-6 items-center justify-center rounded-full bg-white border-2 border-purple-600 text-[11px] font-black text-purple-600 shadow-xs">
                3
              </span>
              <div className="flex-1 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs shadow-2xs">
                <span className="font-bold text-slate-900">PIN 4 Angka</span>
                <span className="text-slate-500 ml-1.5">— Kunci privasi siswa</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 border border-emerald-200/80 px-3 py-2 text-[11px] font-medium text-emerald-900">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            <span>PIN menjaga agar siswa lain tidak dapat mengisi atas namamu.</span>
          </div>

          <button
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2563EB] hover:bg-[#1D4ED8] px-6 py-3.5 text-sm font-black text-white shadow-md shadow-blue-600/20 transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 cursor-pointer"
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
