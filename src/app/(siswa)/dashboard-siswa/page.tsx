"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { useDataSiswa } from "@/lib/student-assessments";
import { useLkpdSiswa } from "@/lib/student-lkpd";
import { BookOpenCheck, CheckCircle2, Clock } from "lucide-react";

export default function DashboardSiswa() {
  const data = useDataSiswa();
  const { data: lkpdList } = useLkpdSiswa();
  const aktif = data?.asesmen.filter((item) => item.status === "aktif") ?? [];

  return (
    <div>
      <StudentIdentityPicker />
      {data && (
        <>
          <section className="mb-8 rounded-[24px] bg-[#f2f3fc] p-7">
            <h1 className="text-2xl font-semibold md:text-3xl">Halo, {data.siswa.nama}!</h1>
            <p className="mt-2 text-sm text-[#414753] md:text-base">
              Kelas {data.siswa.kelasNama} · Siap belajar dan mengerjakan tugas hari ini?
            </p>
          </section>

          {/* Bagian 1: Asesmen Diagnostik */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">1. Asesmen Diagnostik</h2>
              <span className="text-xs text-slate-500">Tahap pemetaan kemampuan</span>
            </div>
            {aktif.length ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {aktif.map((item) => (
                  <Card className="flex min-h-56 flex-col" key={item.id}>
                    <div className="grid h-12 w-12 place-items-center rounded-full bg-[#0066cc] text-white">±</div>
                    <h3 className="mt-5 text-xl font-semibold">{item.judul}</h3>
                    <p className="mt-1 text-sm text-[#7a7a7a]">{item.materi}</p>
                    <div className="mt-auto flex items-end justify-between">
                      <Button href={`/asesmen/kerjakan/${item.id}`}>Mulai Kerjakan</Button>
                      <span className="text-xs text-[#7a7a7a]">{item.durasi_menit} menit</span>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="text-center py-6">
                <h3 className="text-base font-semibold text-slate-800">Tidak ada asesmen diagnostik yang perlu dikerjakan</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Kamu sudah menyelesaikan asesmen atau gurumu belum membuka sesi asesmen baru.
                </p>
              </Card>
            )}
          </section>

          {/* Bagian 2: Lembar LKPD yang Dibagikan Guru */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-2xl font-semibold">2. Lembar LKPD Siswa</h2>
              <span className="text-xs text-slate-500">Disesuaikan dengan level belajarmu</span>
            </div>
            {lkpdList && lkpdList.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {lkpdList.map((item) => {
                  const status = item.pengisian?.status ?? "belum";
                  return (
                    <Card className="flex min-h-56 flex-col justify-between" key={item.id}>
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Level: {item.level.toUpperCase()}
                          </span>
                          {status === "dinilai" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Nilai: {item.pengisian?.nilai ?? 0}
                            </span>
                          )}
                          {status === "terkirim" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-800">
                              <Clock className="h-3.5 w-3.5" /> Sudah Terkirim
                            </span>
                          )}
                          {status === "draft" && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                              Tersimpan sebagai Draft
                            </span>
                          )}
                        </div>
                        <h3 className="mt-4 text-lg font-semibold text-slate-900">{item.judul}</h3>
                        <p className="mt-1 text-sm text-slate-500">{item.materi} · {item.butir.length} Pertanyaan</p>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <Button href={`/lkpd-saya/${item.id}`} variant={status === "dinilai" ? "secondary" : "primary"}>
                          <BookOpenCheck className="mr-1.5 h-4 w-4" />
                          {status === "dinilai" ? "Lihat Nilai & Catatan" : status === "terkirim" ? "Buka Lembar LKPD" : "Kerjakan LKPD"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-6">
                <h3 className="text-base font-semibold text-slate-800">Belum ada LKPD yang dibagikan guru</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Guru akan membagikan lembar kerja setelah tahap asesmen diagnostik selesai.
                </p>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
