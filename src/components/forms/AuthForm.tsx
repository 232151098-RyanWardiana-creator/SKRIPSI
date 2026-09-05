"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Role } from "@/types";
import { Button } from "@/components/ui/Button";
import { LogIn, UserPlus, AlertCircle, CheckCircle2, Eye, EyeOff, Sparkles, Loader2 } from "lucide-react";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { saveStoredTeacherProfile, getStoredTeacherProfile } from "@/lib/teacher-profile";

export function AuthForm({ mode = "login" }: { mode?: "login" | "register" }) {
  const [role, setRole] = useState<Role>("guru");
  const [nama, setNama] = useState("");
  const [sekolah, setSekolah] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isSupabaseConfigured) {
        if (mode === "register") {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: nama,
                sekolah: sekolah || "SMP",
                role: role,
              },
            },
          });

          if (error) throw error;

          // Simpan atau sinkronkan profil guru ke tabel profiles & local store
          if (role === "guru") {
            const currentProfile = getStoredTeacherProfile();
            saveStoredTeacherProfile({
              ...currentProfile,
              nama: nama || currentProfile.nama,
              email: email,
              sekolah: sekolah || currentProfile.sekolah,
            });

            if (data.user) {
              await supabase.from("profiles").upsert({
                id: data.user.id,
                email: email,
                nama: nama,
                sekolah: sekolah || "SMP",
              });
            }
          }

          setSuccessMsg("Pendaftaran berhasil! Mengalihkan ke dashboard...");
          setTimeout(() => {
            router.push(role === "guru" ? "/dashboard" : "/dashboard-siswa");
          }, 1200);
        } else {
          // Mode Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) {
            // Jika akun belum terdaftar di Supabase namun ingin masuk
            if (error.message.includes("Invalid login credentials")) {
              throw new Error("Email atau kata sandi tidak cocok. Silakan periksa kembali atau daftar akun baru.");
            }
            throw error;
          }

          if (data.user) {
            // Ambil profil dari Supabase jika ada
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", data.user.id)
              .single();

            if (profileData && role === "guru") {
              const currentProfile = getStoredTeacherProfile();
              saveStoredTeacherProfile({
                ...currentProfile,
                nama: profileData.nama || currentProfile.nama,
                email: profileData.email || email,
                sekolah: profileData.sekolah || currentProfile.sekolah,
              });
            }
          }

          setSuccessMsg("Berhasil masuk! Memuat portal...");
          setTimeout(() => {
            router.push(role === "guru" ? "/dashboard" : "/dashboard-siswa");
          }, 800);
        }
      } else {
        // Fallback jika offline / Supabase belum dikonfigurasi
        if (role === "guru" && nama) {
          const currentProfile = getStoredTeacherProfile();
          saveStoredTeacherProfile({
            ...currentProfile,
            nama: nama,
            email: email,
            sekolah: sekolah || currentProfile.sekolah,
          });
        }
        router.push(role === "guru" ? "/dashboard" : "/dashboard-siswa");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kesalahan saat otentikasi.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    // Mode demo instan tanpa perlu ketik email/password
    if (role === "guru") {
      router.push("/dashboard");
    } else {
      router.push("/dashboard-siswa");
    }
  };

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {/* Role Selector Tabs */}
      <div className="flex rounded-xl bg-[#e1e2eb]/70 p-1">
        {(["guru", "siswa"] as Role[]).map((item) => (
          <button
            className={`flex-1 rounded-lg py-2 text-sm font-medium capitalize transition-all ${
              role === item
                ? "bg-white text-slate-900 shadow-xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
            key={item}
            onClick={() => setRole(item)}
            type="button"
          >
            Portal {item}
          </button>
        ))}
      </div>

      {/* Alert Error / Success */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3.5 text-xs text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
          <p className="leading-relaxed">{errorMsg}</p>
        </div>
      )}

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 p-3.5 text-xs text-emerald-800">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
          <p>{successMsg}</p>
        </div>
      )}

      {mode === "register" && (
        <>
          <label className="block text-xs font-semibold text-slate-700">
            Nama Lengkap *
            <input
              className="input mt-1.5 w-full text-sm"
              required
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Contoh: Ryan Wardiana, S.Pd."
            />
          </label>

          <label className="block text-xs font-semibold text-slate-700">
            Nama Sekolah / Instansi *
            <input
              className="input mt-1.5 w-full text-sm"
              required
              value={sekolah}
              onChange={(e) => setSekolah(e.target.value)}
              placeholder="Contoh: SMP Negeri 7 Nusantara"
            />
          </label>
        </>
      )}

      <label className="block text-xs font-semibold text-slate-700">
        Email {role === "guru" ? "Dinas / Belajar.id" : "Siswa"} *
        <input
          className="input mt-1.5 w-full text-sm"
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={role === "guru" ? "guru@sekolah.sch.id" : "siswa@sekolah.sch.id"}
        />
      </label>

      <label className="block text-xs font-semibold text-slate-700">
        Kata Sandi *
        <div className="relative mt-1.5">
          <input
            className="input w-full pr-10 text-sm"
            minLength={6}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={show ? "text" : "password"}
            placeholder="Minimal 6 karakter"
          />
          <button
            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
            onClick={() => setShow(!show)}
            type="button"
            aria-label={show ? "Sembunyikan sandi" : "Lihat sandi"}
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </label>

      {/* Main Submit Button */}
      <Button className="w-full mt-2" type="submit" disabled={loading}>
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Memproses...
          </>
        ) : mode === "login" ? (
          <>
            <LogIn className="h-4 w-4" />
            Masuk ke Portal {role === "guru" ? "Guru" : "Siswa"}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Daftar Akun Baru
          </>
        )}
      </Button>

      {/* Mode Masuk Cepat / Demo */}
      <div className="relative my-3 text-center text-xs text-slate-400">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200" />
        </div>
        <span className="relative bg-white px-2 text-slate-500">atau</span>
      </div>

      <button
        type="button"
        onClick={handleDemoLogin}
        className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200/90 bg-slate-50/80 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100/80 transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5 text-blue-600" />
        Masuk Cepat Mode Demo (Tanpa Password)
      </button>

      {/* Switch Login / Register Link */}
      <p className="pt-2 text-center text-xs text-slate-500">
        {mode === "login" ? "Belum memiliki akun?" : "Sudah memiliki akun?"}{" "}
        <Link
          className="font-semibold text-blue-600 hover:underline"
          href={mode === "login" ? "/register" : "/login"}
        >
          {mode === "login" ? "Daftar sekarang" : "Masuk di sini"}
        </Link>
      </p>
    </form>
  );
}
