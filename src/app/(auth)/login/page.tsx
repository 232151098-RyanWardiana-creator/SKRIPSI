import { Suspense } from "react";
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

      {/* Main Glassmorphic Card with Animated Running Dark Light Beam */}
      <div className="relative w-full max-w-md rounded-[34px] p-[3px] overflow-hidden shadow-2xl shadow-indigo-950/20 z-10 bg-slate-200/90">
        {/* Animated Running Dark Light Beam (Cahaya Gelap Berjalan Mengelilingi Kartu) */}
        <div
          className="absolute inset-[-150%] animate-border-beam pointer-events-none"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 200deg, rgba(30,27,75,0.5) 260deg, #000000 310deg, rgba(30,27,75,0.5) 345deg, transparent 360deg)",
          }}
        />

        {/* Inner Solid Card */}
        <section className="relative h-full w-full rounded-[31px] bg-white p-6 sm:p-9 z-10">
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
          </div>

          <Suspense fallback={<div className="p-8 text-center text-xs font-semibold text-slate-500">Memuat formulir masuk...</div>}>
            <AuthForm mode="login" />
          </Suspense>
        </section>
      </div>

      {/* Footer Branding */}
      <footer className="mt-6 text-center text-xs font-semibold text-[#1E1B4B]/70 z-10">
        <p>Ryan Wardiana • Pendidikan Matematika FKIP Universitas Siliwangi</p>
      </footer>
    </main>
  );
}
