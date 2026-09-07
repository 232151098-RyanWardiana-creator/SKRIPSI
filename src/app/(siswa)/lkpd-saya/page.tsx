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
          <header className="mb-7">
            <h1 className="text-2xl font-semibold md:text-3xl">LKPD Saya</h1>
            <p className="mt-2 text-sm text-[#414753] md:text-base">
              Lembar kerja dari gurumu. Kerjakan langsung di sini — jawabanmu tersimpan otomatis,
              jadi tidak hilang kalau HP mati atau internet putus sebentar.
            </p>
          </header>

          {data.length === 0 ? (
            <Card className="text-center">
              <ClipboardList className="mx-auto h-10 w-10 text-[#9ca3af]" aria-hidden />
              <h2 className="mt-4 text-lg font-semibold">Belum ada LKPD untukmu</h2>
              <p className="mx-auto mt-2 max-w-md text-sm text-[#6b7280]">
                Gurumu belum membagikan lembar kerja. Biasanya LKPD muncul setelah kamu
                menyelesaikan asesmen, karena isinya disesuaikan dengan hasil belajarmu.
              </p>
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
