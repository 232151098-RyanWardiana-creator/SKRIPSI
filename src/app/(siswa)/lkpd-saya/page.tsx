"use client";

import Link from "next/link";
import { BookOpenCheck, CheckCircle2, ClipboardList, Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { useLkpdSiswa } from "@/lib/student-lkpd";
import { hitungTerisi } from "@/lib/lkpd-items";

export default function LkpdSayaPage() {
  const { data } = useLkpdSiswa();

  return (
    <div>
      <StudentIdentityPicker />
      {data && (
        <>
          <header className="mb-6">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">LKPD Saya</h1>
            <p className="mt-1 text-xs md:text-sm text-slate-500 font-medium">
              Lembar kerja dari gurumu. Jawaban tersimpan otomatis.
            </p>
          </header>

          {data.length === 0 ? (
            <Card className="text-center py-8 rounded-2xl border-slate-200/80 shadow-xs">
              <ClipboardList className="mx-auto h-8 w-8 text-slate-400" aria-hidden />
              <h2 className="mt-3 text-base font-bold text-slate-700">Belum ada LKPD untukmu</h2>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {data.map((item) => {
                const jawaban = item.pengisian?.jawaban ?? {};
                const progres = hitungTerisi(item.butir, jawaban);
                const status = item.pengisian?.status ?? "belum";

                return (
                  <Card className="flex flex-col" key={item.id}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-lg font-semibold leading-snug">{item.judul}</h2>
                        <p className="mt-1 text-sm text-[#7a7a7a]">{item.materi}</p>
                      </div>
                      <Badge level={item.level}>{item.level}</Badge>
                    </div>

                    <div className="mt-4">
                      {status === "dinilai" ? (
                        <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" aria-hidden />
                          Sudah dinilai
                          {item.pengisian?.nilai !== null && item.pengisian !== null && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs">
                              Nilai {item.pengisian.nilai}
                            </span>
                          )}
                        </p>
                      ) : status === "terkirim" ? (
                        <p className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                          <Clock className="h-4 w-4" aria-hidden />
                          Sudah dikumpulkan, menunggu penilaian guru
                        </p>
                      ) : (
                        <ProgressBar
                          value={progres.persen}
                          label={`${progres.terisi} dari ${progres.total} soal terisi`}
                        />
                      )}
                    </div>

                    <Link
                      className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#0066cc] px-5 text-sm font-semibold text-white hover:bg-[#0055aa]"
                      href={`/lkpd-saya/${item.id}`}
                    >
                      <BookOpenCheck className="h-4 w-4" aria-hidden />
                      {status === "belum"
                        ? "Mulai Kerjakan"
                        : status === "draft"
                          ? "Lanjutkan"
                          : "Lihat Lembar Kerja"}
                    </Link>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
