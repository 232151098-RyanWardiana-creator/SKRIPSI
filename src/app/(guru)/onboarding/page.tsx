"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, ArrowRight, CheckCircle, ClipboardList, Download, School, Share2, Sparkles, type LucideIcon } from "lucide-react";

const langkah: { icon: LucideIcon; judul: string; deskripsi: string; catatan?: string; cta?: string; href?: string }[] = [
  { icon: School, judul: "Siapkan Kelas Anda", deskripsi: "Tambahkan kelas yang akan menggunakan sistem ini. Setiap kelas mendapat kode undangan unik untuk dibagikan ke siswa.", cta: "Mulai Buat Kelas", href: "/kelas" },
  { icon: ClipboardList, judul: "Rancang Asesmen Diagnostik", deskripsi: "Buat soal pilihan ganda untuk mengetahui kemampuan awal siswa pada materi Rasio (Perbandingan). Setiap soal dipetakan ke Indikator Kompetensi (IK-01 sampai IK-05).", catatan: "Asesmen ini bukan untuk nilai, tetapi untuk mengetahui posisi kemampuan setiap siswa.", cta: "Buat Asesmen", href: "/asesmen/buat" },
  { icon: Share2, judul: "Bagikan Kode ke Siswa", deskripsi: "Bagikan kode undangan kelas dan tautan asesmen ke siswa. Siswa mengerjakan asesmen secara online. Sistem otomatis menghitung skor dan menentukan level: Dasar, Menengah, atau Mahir." },
  { icon: Sparkles, judul: "Buat LKPD Berdiferensiasi", deskripsi: "Setelah asesmen selesai, buat tiga varian LKPD sekaligus: Dasar dengan panduan langkah demi langkah (scaffolding), Menengah untuk penguatan konsep, dan Mahir dengan soal berpikir tingkat tinggi (HOTS).", cta: "Lihat Generator", href: "/generator" },
  { icon: Download, judul: "Periksa, Koreksi, dan Unduh", deskripsi: "Periksa hasil AI dan edit bagian yang perlu diperbaiki. Setelah sesuai, validasi dan unduh sebagai file Word (.docx) yang dapat langsung dicetak." },
];

export default function OnboardingPage() {
  const [active, setActive] = useState(0);
  const router = useRouter();
  function selesai(janganTampilkan = false) { if (janganTampilkan) localStorage.setItem("onboarding-jangan-tampilkan", "true"); localStorage.setItem("onboarding-selesai", "true"); router.push("/dashboard"); }
  const item = langkah[active];
  const StepIcon = item.icon;
  return <div className="mx-auto max-w-4xl"><p className="text-sm font-semibold uppercase tracking-widest text-[#0066cc]">Panduan Guru</p><h1 className="mt-2 text-4xl font-semibold">Mulai dalam 5 Langkah</h1><p className="mt-2 text-[#414753]">Kenali alur asesmen kemampuan awal matematis hingga LKPD siap digunakan.</p><div className="mt-7 flex gap-2" aria-label="Langkah tutorial">{langkah.map((step, index) => <button aria-current={index === active ? "step" : undefined} className={`h-2 flex-1 rounded-full ${index <= active ? "bg-[#0066cc]" : "bg-[#d9dbe8]"}`} key={step.judul} onClick={() => setActive(index)} title={`Langkah ${index + 1}: ${step.judul}`} type="button" />)}</div><section className="card mt-5 min-h-80"><p className="flex items-center gap-2 text-sm font-semibold text-[#0066cc]"><StepIcon className="h-5 w-5" />LANGKAH {active + 1} DARI 5</p><h2 className="mt-4 text-3xl font-semibold">{item.judul}</h2><p className="mt-4 max-w-2xl text-lg text-[#414753]">{item.deskripsi}</p>{item.catatan && <p className="mt-5 rounded-xl bg-amber-50 p-4 text-sm"><strong>Catatan:</strong> {item.catatan}</p>}<div className="mt-8 flex flex-wrap gap-3">{active > 0 && <Button variant="ghost" onClick={() => setActive(active - 1)}><ArrowLeft className="h-4 w-4" />Sebelumnya</Button>}{active < 4 && <Button onClick={() => setActive(active + 1)}>Langkah Berikutnya<ArrowRight className="h-4 w-4" /></Button>}{active === 4 && <Button onClick={() => selesai()}><CheckCircle className="h-4 w-4" />Selesai</Button>}{item.cta && <Button href={item.href} variant="secondary">{item.cta}</Button>}</div></section><div className="mt-5 flex flex-wrap justify-between gap-3"><button className="text-sm font-semibold text-[#414753] underline" onClick={() => selesai()} type="button">Lewati Tutorial</button><button className="text-sm font-semibold text-[#414753] underline" onClick={() => selesai(true)} type="button">Jangan tampilkan lagi</button></div></div>;
}
