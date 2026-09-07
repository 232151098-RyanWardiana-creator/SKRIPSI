import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { AuthForm } from "@/components/forms/AuthForm";

export default function LoginPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#FAFAFD] flex flex-col justify-center items-center p-4 sm:p-6 selection:bg-pink-500 selection:text-white">
      {/* Ambient Gradient Glow Orbs (matching Landing Page) */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[700px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-200/50 via-indigo-200/40 to-purple-200/50 blur-[100px]" />
      <div className="pointer-events-none absolute -bottom-24 right-10 -z-10 h-[350px] w-[350px] rounded-full bg-gradient-to-br from-purple-200/40 to-pink-200/30 blur-[80px]" />

      {/* Floating Math Accent Pills (Desktop only) */}
      <div className="pointer-events-none absolute top-14 left-12 hidden xl:block rounded-2xl border border-rose-200/80 bg-white/80 px-4 py-2 text-xs font-mono font-black text-rose-600 shadow-sm backdrop-blur-md -rotate-6">
        -3 - 4 = -7
      </div>
      <div className="pointer-events-none absolute bottom-20 left-16 hidden xl:block rounded-2xl border border-blue-200/80 bg-white/80 px-4 py-2 text-xs font-bold text-blue-700 shadow-sm backdrop-blur-md rotate-3">
        Diferensiasi TaRL
      </div>
      <div className="pointer-events-none absolute top-20 right-16 hidden xl:block rounded-2xl border border-amber-200/80 bg-white/80 px-4 py-2 text-xs font-mono font-black text-amber-600 shadow-sm backdrop-blur-md rotate-6">
        (-14) + 20 = +6
      </div>

      {/* Header Bar */}
      <div className="w-full max-w-md mb-4 flex justify-between items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full bg-white/90 border border-slate-200/80 px-3.5 py-1.5 text-xs font-bold text-[#1E1B4B]/80 shadow-xs backdrop-blur-md transition-all hover:bg-white hover:text-[#2563EB] hover:-translate-x-0.5 active:scale-95"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Beranda
        </Link>
        <span className="text-xs font-black text-[#1E1B4B] tracking-tight">
          LKPD<span className="text-[#2563EB]">.</span>
        </span>
      </div>

      {/* Main Glassmorphic Card */}
      <section className="relative w-full max-w-md rounded-[28px] border-2 border-[#1E1B4B]/10 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-indigo-950/10 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 py-1 border border-blue-200/60 shadow-xs mb-3">
            <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#2563EB]">
              Portal Pembelajaran
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-[#1E1B4B]">
            Masuk <span className="animate-shimmer-blue">Portal</span>
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-600">
            Platform Berdiferensiasi Bilangan Bulat SMP Kelas VII
          </p>
        </div>

        <AuthForm mode="login" />
      </section>

      {/* Footer copyright */}
      <p className="mt-6 text-center text-xs font-medium text-slate-500">
        Ryan Wardiana • Pendidikan Matematika FKIP UNSIL
      </p>
    </main>
  );
}
