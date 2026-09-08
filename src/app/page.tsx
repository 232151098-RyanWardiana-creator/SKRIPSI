"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  ChevronRight,
  Code2,
  Cpu,
  Download,
  Eye,
  Ear,
  Hand,
  FileCheck,
  GraduationCap,
  Home as HomeIcon,
  Layers,
  LogIn,
  Play,
  Printer,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Sliders,
  Users,
  X,
  Zap,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { LiquidButton } from "@/components/ui/liquid-glass-button";

type LevelTab = "dasar" | "menengah" | "mahir";
type GayaTab = "visual" | "auditory" | "kinestetik";

export default function Home() {
  // 1. Mouse Follower State
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });
  const [dotPos, setDotPos] = useState<{ x: number; y: number }>({ x: -100, y: -100 });

  // 2. Scrollspy Active Section
  const [activeSection, setActiveSection] = useState<string>("home");

  // Mobile Top Menu Toggle State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 3. Creative Hero Interactive Showcase State
  const [activeLevel, setActiveLevel] = useState<LevelTab>("dasar");
  const [activeGaya, setActiveGaya] = useState<GayaTab>("visual");

  // Interactive Number Line step state for Level Dasar
  const [numberLineStep, setNumberLineStep] = useState<number>(-7);

  // 4. Interactive Diagnostic Slider
  const [simScore, setSimScore] = useState<number>(72);

  // Mouse Follower Effect with smooth spring physics
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    let animationFrameId: number;
    const follow = () => {
      setDotPos((prev) => ({
        x: prev.x + (mousePos.x - prev.x) * 0.22,
        y: prev.y + (mousePos.y - prev.y) * 0.22,
      }));
      animationFrameId = requestAnimationFrame(follow);
    };
    animationFrameId = requestAnimationFrame(follow);
    return () => cancelAnimationFrame(animationFrameId);
  }, [mousePos]);

  // Scrollspy Effect
  useEffect(() => {
    const sections = ["home", "keunggulan", "simulasi", "alur"];
    const handleScroll = () => {
      const scrollY = window.scrollY + 200;
      for (const id of sections) {
        const el = document.getElementById(id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollY >= top && scrollY < top + height) {
            setActiveSection(id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Diagnostic Score Calculator Logic
  const getScoreInfo = (score: number) => {
    if (score < 60) {
      return {
        level: "dasar",
        label: "Level Dasar",
        badge: "bg-rose-500 text-white",
        desc: "Perlu bimbingan konsep perbandingan dasar, rasio ekuivalen, dan representasi konkret.",
      };
    }
    if (score < 80) {
      return {
        level: "menengah",
        label: "Level Menengah",
        badge: "bg-amber-500 text-white",
        desc: "Latihan terarah menentukan nilai perbandingan senilai dan laju satuan bertingkat.",
      };
    }
    return {
      level: "mahir",
      label: "Level Mahir",
      badge: "bg-blue-600 text-white",
      desc: "Tantangan masalah nyata rasio kontekstual, skala peta, dan pemodelan tingkat lanjut (HOTS).",
    };
  };

  const currentScoreInfo = getScoreInfo(simScore);

  return (
    <main className="min-h-screen bg-[#FAF9FF] text-[#1E1B4B] antialiased selection:bg-[#2563EB] selection:text-white overflow-x-hidden">
      {/* 🟢 Mouse Follower Glow Dot (Desktop only) */}
      <div
        className="pointer-events-none fixed z-50 -translate-x-1/2 -translate-y-1/2 hidden md:flex items-center justify-center rounded-full border-2 border-emerald-500 bg-white shadow-[0_0_12px_rgba(16,185,129,0.5)] transition-transform duration-75"
        style={{
          width: "24px",
          height: "24px",
          left: `${dotPos.x}px`,
          top: `${dotPos.y}px`,
        }}
      >
        <div className="h-2 w-2 rounded-full bg-emerald-500" />
      </div>

      {/* 1. Desktop Floating Pill Navbar (Komputer Saja) */}
      <header className="fixed inset-x-0 top-4 z-40 hidden md:flex justify-center px-4 transition-all">
        <nav className="flex items-center gap-1.5 rounded-full border-2 border-[#1E1B4B]/10 bg-white/90 p-2 shadow-xl backdrop-blur-md">
          <Link href="/" className="px-3 text-lg font-black tracking-tight text-[#1E1B4B] hover:scale-105 transition-transform">
            LKPD<span className="text-[#EC4899]">.</span>
          </Link>
          <div className="mx-1 h-5 w-[1px] bg-[#1E1B4B]/15" />

          {/* Scrollspy Navigation Pills */}
          <div className="flex items-center gap-1">
            {[
              { id: "home", label: "Beranda" },
              { id: "keunggulan", label: "Keunggulan" },
              { id: "simulasi", label: "Simulasi TaRL" },
              { id: "alur", label: "Alur Guru" },
            ].map((item) => {
              const isActive = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-md"
                      : "text-[#1E1B4B]/70 hover:bg-[#1E1B4B]/5 hover:text-[#1E1B4B]"
                  }`}
                >
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>

          <div className="mx-1 h-5 w-[1px] bg-[#1E1B4B]/15" />

          <Link
            href="/login"
            className="flex items-center gap-1.5 rounded-full bg-[#1E1B4B] px-4 py-1.5 text-xs font-black text-white shadow-sm transition hover:bg-[#2563EB] active:scale-95 whitespace-nowrap"
          >
            <LogIn className="h-3.5 w-3.5" /> Masuk Portal
          </Link>
        </nav>
      </header>

      {/* 📱 Mobile Top Right: Tombol Logo Melayang (Klik 1: Buka Navigasi, Klik 2: Masuk Portal) */}
      <div className="fixed top-3.5 right-3.5 z-50 md:hidden">
        <button
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          type="button"
          aria-label="Menu Navigasi Portal"
          aria-expanded={mobileMenuOpen}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#1E1B4B] text-white shadow-xl shadow-indigo-950/25 backdrop-blur-md transition-all active:scale-90 border-2 border-white/40 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
        </button>

        {/* Dropdown Menu Popup saat logo diklik */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40 bg-black/20 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="absolute right-0 mt-2 w-60 rounded-2xl border-2 border-[#1E1B4B]/15 bg-white/95 p-3 shadow-2xl shadow-indigo-950/25 backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-150">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex justify-center"
              >
                <LiquidButton
                  className="w-full rounded-xl bg-white/40 border border-white/60 py-2.5 px-4 text-xs font-black text-[#1E1B4B] shadow-md transition-all hover:bg-white/70 active:scale-95 text-center flex items-center justify-center gap-2"
                >
                  <LogIn className="h-3.5 w-3.5 text-[#2563EB]" />
                  Masuk Portal
                </LiquidButton>
              </Link>

              <div className="my-2 h-[1px] bg-slate-200/80" />

              <p className="px-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Navigasi Cepat
              </p>
              <div className="flex flex-col gap-1 text-xs font-bold text-slate-700">
                {[
                  { id: "home", label: "Beranda" },
                  { id: "keunggulan", label: "Keunggulan" },
                  { id: "simulasi", label: "Simulasi TaRL" },
                  { id: "alur", label: "Alur Guru" },
                ].map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-2.5 py-2 transition-colors hover:bg-slate-100 hover:text-[#2563EB]"
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
                  </a>
                ))}
              </div>
            </div>
          </>
        )}
      </div>

      {/* 📱 Floating Mobile Navigation Bar (Melayang Khusus Layar HP) */}
      <nav
        aria-label="Navigasi Melayang Mobile"
        className="fixed bottom-4 inset-x-0 z-40 flex justify-center px-3 md:hidden pointer-events-none"
      >
        <div className="pointer-events-auto flex w-full max-w-sm items-center justify-between gap-1 rounded-full border-2 border-[#1E1B4B]/15 bg-white/95 p-1.5 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl">
          {[
            { id: "home", label: "Beranda", shortLabel: "Beranda" },
            { id: "keunggulan", label: "Keunggulan", shortLabel: "Keunggulan" },
            { id: "simulasi", label: "Simulasi TaRL", shortLabel: "Simulasi" },
            { id: "alur", label: "Alur Guru", shortLabel: "Alur" },
          ].map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={`flex-1 text-center rounded-full py-2 px-1.5 text-[11px] font-black transition-all ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-md shadow-blue-600/30 scale-[1.02]"
                    : "text-[#1E1B4B]/70 hover:bg-[#1E1B4B]/5 hover:text-[#1E1B4B]"
                }`}
              >
                <span className="hidden sm:inline">{item.label}</span>
                <span className="sm:hidden">{item.shortLabel}</span>
              </a>
            );
          })}
        </div>
      </nav>

      {/* 2. Hero Section: Responsive Mobile & Desktop */}
      <section id="home" className="relative px-4 sm:px-6 pt-20 sm:pt-32 pb-24 sm:pb-16 md:px-12 lg:pt-36 lg:pb-20 text-center">
        {/* Soft Backdrop Orbs */}
        <div className="pointer-events-none absolute top-6 sm:top-10 left-1/2 -z-10 h-[320px] sm:h-[400px] w-[92vw] max-w-[650px] -translate-x-1/2 rounded-full bg-gradient-to-r from-blue-300/40 via-indigo-300/35 to-purple-300/40 blur-[80px] sm:blur-[90px]" />

        <div className="mx-auto max-w-4xl space-y-4 sm:space-y-6">
          {/* Spotlight Wrapper Card on Mobile */}
          <div className="rounded-3xl sm:rounded-none border border-[#1E1B4B]/10 sm:border-0 bg-white/75 sm:bg-transparent p-5 sm:p-0 shadow-xl shadow-indigo-950/5 sm:shadow-none backdrop-blur-md sm:backdrop-blur-none space-y-3.5 sm:space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3.5 sm:px-4 py-1.5 border border-blue-200/60 shadow-xs">
              <span className="h-2 w-2 rounded-full bg-[#2563EB] animate-ping" />
              <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-wider text-[#2563EB]">
                Platform Diferensiasi Matematika
              </span>
            </div>

            {/* Bold Headline */}
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.15] sm:leading-[1.08] tracking-tight text-[#1E1B4B]">
              Belajar Tepat. <br />
              <span className="animate-shimmer-blue">Berdiferensiasi.</span>
            </h1>

            <p className="text-lg sm:text-2xl font-black text-[#1E1B4B]/85 tracking-tight">
              Rasio (Perbandingan) SMP Kelas VII
            </p>

            <p className="mx-auto max-w-xl text-xs sm:text-base md:text-lg font-medium leading-relaxed text-slate-600 px-1 sm:px-2">
              Ubah hasil asesmen diagnostik menjadi 3 level LKPD siap cetak secara instan.
            </p>

            {/* Action Buttons: Compact Grid on Mobile, Flex Row on Tablet+ */}
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:flex-row sm:items-center sm:justify-center sm:gap-4 pt-1 w-full max-w-sm sm:max-w-none mx-auto">
              <Link href="/login" className="w-full sm:w-auto">
                <LiquidButton
                  className="w-full sm:w-auto rounded-full bg-gradient-to-r from-[#7C3AED]/90 via-[#6366F1]/90 to-[#2563EB]/90 border border-white/50 px-4 sm:px-8 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black text-white shadow-xl shadow-purple-600/25 backdrop-blur-xl transition-all hover:scale-105 active:scale-95 text-center whitespace-nowrap"
                >
                  Masuk Portal
                </LiquidButton>
              </Link>
              <Link
                href="/generator"
                className="flex items-center justify-center rounded-full border-2 border-slate-200 bg-white px-4 sm:px-7 py-2.5 sm:py-3.5 text-xs sm:text-sm font-black text-slate-800 shadow-xs transition-all hover:border-[#2563EB] hover:text-[#2563EB] hover:-translate-y-0.5 active:scale-95 text-center whitespace-nowrap"
              >
                Generator LKPD
              </Link>
            </div>
          </div>

          {/* 3 Interactive Feature Tiers (Matriks 2 Baris di Mobile, 3 Kolom di Desktop - Tanpa Scroll) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-4 pt-3 sm:pt-8 text-center">
            {/* Level Dasar */}
            <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-rose-200/80 bg-white p-3 sm:p-5 shadow-xs transition-all hover:scale-[1.02] hover:border-rose-400">
              <h3 className="text-xs sm:text-sm font-black text-rose-600">Level Dasar</h3>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium text-slate-600">Konsep Rasio & Bentuk Sederhana</p>
              <p className="mt-1.5 sm:mt-2.5 w-full rounded-xl border border-rose-100 bg-rose-50/70 py-1 sm:py-2 text-center font-mono text-[11px] sm:text-xs font-black text-rose-700">
                12 : 18 = 2 : 3
              </p>
            </div>

            {/* Level Menengah */}
            <div className="col-span-1 flex flex-col items-center justify-center rounded-2xl border border-amber-200/80 bg-white p-3 sm:p-5 shadow-xs transition-all hover:scale-[1.02] hover:border-amber-400">
              <h3 className="text-xs sm:text-sm font-black text-amber-600">Level Menengah</h3>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium text-slate-600">Perbandingan Senilai & Laju</p>
              <p className="mt-1.5 sm:mt-2.5 w-full rounded-xl border border-amber-100 bg-amber-50/70 py-1 sm:py-2 text-center font-mono text-[11px] sm:text-xs font-black text-amber-800">
                5 liter → 60 km | 8 L → 96 km
              </p>
            </div>

            {/* Level Mahir (Baris 2 Penuh di Mobile, Kolom 3 di Desktop) */}
            <div className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center rounded-2xl border border-blue-200/80 bg-white p-3 sm:p-5 shadow-xs transition-all hover:scale-[1.02] hover:border-blue-400">
              <h3 className="text-xs sm:text-sm font-black text-blue-600">Level Mahir</h3>
              <p className="mt-0.5 sm:mt-1 text-[10px] sm:text-xs font-medium text-slate-600">Masalah Kontekstual & Skala HOTS</p>
              <p className="mt-1.5 sm:mt-2.5 w-full sm:w-full max-w-xs sm:max-w-none rounded-xl border border-blue-100 bg-blue-50/70 py-1 sm:py-2 text-center font-mono text-[11px] sm:text-xs font-black text-blue-800">
                Skala 1 : 250.000 | 6 cm → 15 km
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Karakteristik & Keunggulan (Marquee + 3 Bento Pillar Cards) */}
      <section id="keunggulan" className="py-20 md:py-24 overflow-hidden relative border-y border-slate-200/80 bg-white">
        <div className="text-center mb-12 px-4">
          <span className="inline-block -rotate-1 rounded-xl bg-purple-100 text-purple-700 border border-purple-200 px-3.5 py-1 text-xs font-black uppercase tracking-wider shadow-xs">
            Standar Kurikulum Merdeka
          </span>
          <h2 className="mt-3 text-3xl md:text-4xl font-extrabold tracking-tight text-[#1E1B4B]">
            Karakteristik & <span className="text-[#EC4899]">Keunggulan</span>.
          </h2>
          <p className="mt-2.5 text-sm md:text-base font-normal text-slate-600 max-w-xl mx-auto leading-relaxed">
            Didesain khusus untuk menyederhanakan diferensiasi matematika di sekolah secara terukur dan otomatis.
          </p>
        </div>

        {/* Gradient Faders */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-28 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-28 bg-gradient-to-l from-white to-transparent z-10" />

        {/* Row 1: Marquee moving Left */}
        <div className="animate-marquee-left py-2">
          <div className="flex gap-4 pr-4">
            {[
              { icon: GraduationCap, text: "Kurikulum Merdeka", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Layers, text: "TaRL 3 Level Kognitif", bg: "bg-indigo-100", color: "text-indigo-600" },
              { icon: Brain, text: "Gaya Belajar VAK", bg: "bg-purple-100", color: "text-purple-600" },
              { icon: CheckCircle2, text: "5 Indikator (IK-01–05)", bg: "bg-emerald-100", color: "text-emerald-600" },
              { icon: Zap, text: "Otomatisasi AI 9Router", bg: "bg-amber-100", color: "text-amber-600" },
              { icon: Code2, text: "Materi Rasio & Perbandingan", bg: "bg-pink-100", color: "text-pink-600" },
              { icon: GraduationCap, text: "Kurikulum Merdeka", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Layers, text: "TaRL 3 Level Kognitif", bg: "bg-indigo-100", color: "text-indigo-600" },
              { icon: Brain, text: "Gaya Belajar VAK", bg: "bg-purple-100", color: "text-purple-600" },
              { icon: CheckCircle2, text: "5 Indikator (IK-01–05)", bg: "bg-emerald-100", color: "text-emerald-600" },
              { icon: Zap, text: "Otomatisasi AI 9Router", bg: "bg-amber-100", color: "text-amber-600" },
              { icon: Code2, text: "Materi Rasio & Perbandingan", bg: "bg-pink-100", color: "text-pink-600" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-full border border-slate-200/90 bg-white px-6 py-3 shadow-xs transition-all duration-200 hover:scale-105 hover:border-[#2563EB]/40 hover:shadow-md cursor-pointer"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap text-sm font-extrabold tracking-tight text-slate-800">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Marquee moving Right */}
        <div className="animate-marquee-right py-2 mt-3">
          <div className="flex gap-4 pr-4">
            {[
              { icon: Download, text: "Ekspor Word (.docx)", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Printer, text: "Cetak PDF A4 Rapi", bg: "bg-rose-100", color: "text-rose-600" },
              { icon: Users, text: "Manajemen Kelas Siswa", bg: "bg-teal-100", color: "text-teal-600" },
              { icon: ShieldCheck, text: "Penyimpanan Otomatis", bg: "bg-emerald-100", color: "text-emerald-600" },
              { icon: Code2, text: "Rumus KaTeX Bersih", bg: "bg-cyan-100", color: "text-cyan-600" },
              { icon: BarChart3, text: "Diagnostik Terintegrasi", bg: "bg-purple-100", color: "text-purple-600" },
              { icon: Download, text: "Ekspor Word (.docx)", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Printer, text: "Cetak PDF A4 Rapi", bg: "bg-rose-100", color: "text-rose-600" },
              { icon: Users, text: "Manajemen Kelas Siswa", bg: "bg-teal-100", color: "text-teal-600" },
              { icon: ShieldCheck, text: "Penyimpanan Otomatis", bg: "bg-emerald-100", color: "text-emerald-600" },
              { icon: Code2, text: "Rumus KaTeX Bersih", bg: "bg-cyan-100", color: "text-cyan-600" },
              { icon: BarChart3, text: "Diagnostik Terintegrasi", bg: "bg-purple-100", color: "text-purple-600" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-full border border-slate-200/90 bg-white px-6 py-3 shadow-xs transition-all duration-200 hover:scale-105 hover:border-[#2563EB]/40 hover:shadow-md cursor-pointer"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap text-sm font-extrabold tracking-tight text-slate-800">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Marquee moving Left */}
        <div className="animate-marquee-left py-2 mt-3">
          <div className="flex gap-4 pr-4">
            {[
              { icon: ShieldCheck, text: "Scaffolding Bertingkat", bg: "bg-rose-100", color: "text-rose-600" },
              { icon: Zap, text: "Anti-Salah Konsep Tanda", bg: "bg-amber-100", color: "text-amber-600" },
              { icon: GraduationCap, text: "Fase D Matematika SMP", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Printer, text: "Format Siap Cetak A4", bg: "bg-indigo-100", color: "text-indigo-600" },
              { icon: Sparkles, text: "Respon Cepat AI", bg: "bg-purple-100", color: "text-purple-600" },
              { icon: FileCheck, text: "Validasi Fleksibel Guru", bg: "bg-emerald-100", color: "text-emerald-600" },
              { icon: ShieldCheck, text: "Scaffolding Bertingkat", bg: "bg-rose-100", color: "text-rose-600" },
              { icon: Zap, text: "Anti-Salah Konsep Tanda", bg: "bg-amber-100", color: "text-amber-600" },
              { icon: GraduationCap, text: "Fase D Matematika SMP", bg: "bg-blue-100", color: "text-blue-600" },
              { icon: Printer, text: "Format Siap Cetak A4", bg: "bg-indigo-100", color: "text-indigo-600" },
              { icon: Sparkles, text: "Respon Cepat AI", bg: "bg-purple-100", color: "text-purple-600" },
              { icon: FileCheck, text: "Validasi Fleksibel Guru", bg: "bg-emerald-100", color: "text-emerald-600" },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3.5 rounded-full border border-slate-200/90 bg-white px-6 py-3 shadow-xs transition-all duration-200 hover:scale-105 hover:border-[#2563EB]/40 hover:shadow-md cursor-pointer"
                >
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${item.bg} ${item.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="whitespace-nowrap text-sm font-extrabold tracking-tight text-slate-800">
                    {item.text}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 4. Interactive Diagnostic Score Simulator */}
      <section id="simulasi" className="px-6 py-20 md:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-block -rotate-1 rounded-xl bg-[#2563EB] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              Simulasi TaRL
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#1E1B4B]">
              Kalkulator Pemetaan Skor
            </h2>
            <p className="mt-2 text-xs md:text-sm font-medium text-[#1E1B4B]/60">
              Geser nilai skor di bawah untuk menyimulasikan penentuan level otomatis.
            </p>
          </div>

          <div className="mt-10 rounded-[32px] border-2 border-[#1E1B4B]/10 bg-white p-6 md:p-10 shadow-xl">
            <div className="grid items-center gap-8 md:grid-cols-12">
              <div className="space-y-5 md:col-span-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-extrabold text-[#1E1B4B]">Skor Diagnostik Siswa:</span>
                  <span className="text-3xl font-black text-[#2563EB]">{simScore} / 100</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={simScore}
                  onChange={(e) => setSimScore(+e.target.value)}
                  className="w-full h-3 bg-[#E0E7FF] rounded-lg appearance-none cursor-pointer accent-[#2563EB]"
                />
                <div className="flex justify-between text-[11px] font-extrabold text-[#1E1B4B]/50">
                  <span>0 (Dasar)</span>
                  <span>60 (Batas Menengah)</span>
                  <span>80 (Batas Mahir)</span>
                  <span>100</span>
                </div>

                {/* Preset buttons */}
                <div className="grid grid-cols-3 gap-2 text-xs font-bold pt-2">
                  <button
                    onClick={() => setSimScore(48)}
                    className="rounded-xl border border-rose-200 bg-rose-50 py-2 text-rose-700 hover:bg-rose-100"
                  >
                    48 (Dasar)
                  </button>
                  <button
                    onClick={() => setSimScore(72)}
                    className="rounded-xl border border-amber-200 bg-amber-50 py-2 text-amber-800 hover:bg-amber-100"
                  >
                    72 (Menengah)
                  </button>
                  <button
                    onClick={() => setSimScore(94)}
                    className="rounded-xl border border-blue-200 bg-blue-50 py-2 text-blue-700 hover:bg-blue-100"
                  >
                    94 (Mahir)
                  </button>
                </div>
              </div>

              {/* Result Box */}
              <div className="md:col-span-6">
                <div className="rounded-2xl border-2 border-[#1E1B4B]/10 bg-[#FAF9FF] p-6">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#1E1B4B]/50">
                    Hasil Pengelompokan:
                  </span>
                  <div className="mt-2 flex items-center gap-2.5">
                    <span className={`rounded-full px-3 py-0.5 text-xs font-black ${currentScoreInfo.badge}`}>
                      {currentScoreInfo.label}
                    </span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed font-medium text-[#1E1B4B]/80">
                    {currentScoreInfo.desc}
                  </p>
                  <div className="mt-4 flex items-center gap-1.5 border-t border-[#1E1B4B]/10 pt-3 text-xs font-bold text-emerald-600">
                    <CheckCircle2 className="h-4 w-4" /> Diferensiasi Terukur Tanpa Asumsi
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Alur Kerja 4 Langkah Guru */}
      <section id="alur" className="bg-white px-6 py-20 md:px-12 border-t-2 border-[#1E1B4B]/5">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <span className="inline-block rotate-1 rounded-xl bg-[#EC4899] px-3.5 py-1 text-xs font-black uppercase tracking-wider text-white shadow-xs">
              Alur Guru
            </span>
            <h2 className="mt-3 text-3xl md:text-4xl font-black text-[#1E1B4B]">
              4 Langkah Menyiapkan LKPD
            </h2>
          </div>

          <div className="mt-8 sm:mt-12 grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 text-center">
            {[
              {
                step: "1",
                title: "Buat Asesmen",
                desc: "Susun soal diagnostik IK-01 s.d IK-05 dengan bantuan AI.",
                color: "text-[#2563EB]",
                glow: "bg-blue-400/35",
                badgeBorder: "border-blue-200/80 bg-blue-50/80",
              },
              {
                step: "2",
                title: "Pemetaan Siswa",
                desc: "Siswa menjawab tes; sistem mengelompokkan ke 3 level.",
                color: "text-[#7C3AED]",
                glow: "bg-purple-400/35",
                badgeBorder: "border-purple-200/80 bg-purple-50/80",
              },
              {
                step: "3",
                title: "Generate 3 Level",
                desc: "AI membuat 3 dokumen LKPD secara berjenjang.",
                color: "text-[#EC4899]",
                glow: "bg-pink-400/35",
                badgeBorder: "border-pink-200/80 bg-pink-50/80",
              },
              {
                step: "4",
                title: "Validasi & Cetak",
                desc: "Guru menyunting, memvalidasi, lalu cetak PDF atau Word.",
                color: "text-[#059669]",
                glow: "bg-emerald-400/35",
                badgeBorder: "border-emerald-200/80 bg-emerald-50/80",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="group relative flex flex-col items-center justify-center rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-[#FAF9FF] p-3.5 sm:p-7 transition-all duration-200 hover:-translate-y-1 hover:border-[#2563EB]/40 hover:shadow-lg"
              >
                {/* 🌟 Background Blur Glowing Aura & Frosted Glass Badge */}
                <div className="relative mb-1 sm:mb-2 flex items-center justify-center">
                  <div className={`absolute h-9 w-9 sm:h-16 sm:w-16 rounded-full ${item.glow} blur-md sm:blur-xl transition-all group-hover:scale-125`} />
                  <div className={`relative flex h-9 w-9 sm:h-14 sm:w-14 items-center justify-center rounded-xl sm:rounded-2xl border ${item.badgeBorder} shadow-xs backdrop-blur-md transition-all group-hover:scale-105`}>
                    <span className={`text-base sm:text-2xl font-black tracking-tight ${item.color}`}>
                      {item.step}
                    </span>
                  </div>
                </div>

                <h3 className="mt-1.5 sm:mt-3 text-xs sm:text-lg font-black text-[#1E1B4B]">{item.title}</h3>
                <p className="hidden sm:block mt-2 text-xs font-medium leading-relaxed text-slate-600">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner (Clean, Punchy, & Balanced) */}
      <section className="px-6 py-16 md:px-12">
        <div className="relative overflow-hidden mx-auto max-w-5xl rounded-[32px] bg-gradient-to-r from-[#2563EB] via-[#6366F1] to-[#7C3AED] p-8 md:p-11 text-white shadow-xl">
          {/* Subtle Ambient Shine */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3.5 py-1 text-xs font-black backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Platform Siap Digunakan</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
                Mulai Pembelajaran Berdiferensiasi di Kelas
              </h2>
            </div>
            <Link
              href="/login"
              className="flex shrink-0 items-center justify-center"
            >
              <LiquidButton className="rounded-full bg-white/20 border border-white/40 px-8 py-3.5 text-sm font-black text-white shadow-xl backdrop-blur-md transition-all hover:bg-white/30 hover:scale-105 active:scale-95">
                Masuk Portal
              </LiquidButton>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t-2 border-[#1E1B4B]/5 bg-white px-6 pt-8 pb-24 md:pb-8 text-center text-xs font-medium text-[#1E1B4B]/60">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 sm:flex-row">
          <p>
            <strong>LKPD-AI</strong> • Generator LKPD Berdiferensiasi Berbantuan AI Terintegrasi Asesmen Diagnostik
          </p>
          <p className="font-bold text-[#1E1B4B]/80">
            Ryan Wardiana • Pendidikan Matematika FKIP
          </p>
        </div>
      </footer>
    </main>
  );
}
