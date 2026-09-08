import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/forms/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-br from-blue-100/70 via-indigo-50/60 to-purple-100/70 flex flex-col justify-center items-center p-4 sm:p-6 py-10 selection:bg-pink-500 selection:text-white">
      {/* Dynamic Colorful Background Circles */}
      <div className="pointer-events-none absolute -top-32 -left-20 h-96 w-96 rounded-full bg-gradient-to-br from-blue-400/30 to-indigo-500/30 blur-3xl animate-pulse" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-96 w-96 rounded-full bg-gradient-to-tl from-purple-400/30 to-pink-500/30 blur-3xl" />
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-300/15 blur-3xl" />

      {/* Header Navigation Bar */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-white/90 border border-indigo-100 px-4 py-2 text-xs font-black text-[#1E1B4B] shadow-md shadow-indigo-950/5 backdrop-blur-md transition-all hover:bg-white hover:text-[#2563EB] hover:-translate-x-0.5 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Kembali ke Beranda
        </Link>
        <span className="rounded-full bg-white/90 border border-indigo-100 px-3.5 py-1 text-xs font-black text-[#1E1B4B] shadow-xs backdrop-blur-md">
          LKPD<span className="text-[#2563EB]">.AI</span>
        </span>
      </div>

      {/* Main Glassmorphic Card with Vibrant Accents */}
      <section className="relative w-full max-w-md rounded-[32px] border-2 border-white/80 bg-white/95 p-6 sm:p-9 shadow-2xl shadow-indigo-900/15 backdrop-blur-2xl z-10">
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 inset-x-8 h-1.5 rounded-full bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#EC4899]" />

        <div className="mb-6 text-center pt-1">
          <div className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-1.5 border border-blue-200/80 shadow-xs mb-3">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
            <span className="text-[11px] font-black uppercase tracking-wider text-[#2563EB]">
              Platform Diferensiasi Matematika
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1E1B4B]">
            Masuk <span className="bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#7C3AED] bg-clip-text text-transparent">Portal</span>
          </h1>
          <p className="mt-2 text-xs sm:text-sm font-medium text-slate-600">
            Platform Berdiferensiasi Rasio (Perbandingan) SMP Kelas VII
          </p>
        </div>

        <AuthForm mode="login" />
      </section>

      {/* Footer Branding */}
      <footer className="mt-6 text-center text-xs font-semibold text-[#1E1B4B]/70 z-10">
        <p>Ryan Wardiana • Pendidikan Matematika FKIP Universitas Siliwangi</p>
      </footer>
    </main>
  );
}
