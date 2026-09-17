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
    <div className="space-y-6">
      <StudentIdentityPicker />
      {data && (
        <>
          <section className="rounded-2xl bg-gradient-to-r from-blue-50/90 via-indigo-50/70 to-slate-50 border border-blue-100/80 p-5 md:p-6 shadow-xs">
            <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">Halo, {data.siswa.nama}!</h1>
          </section>

          {/* Bagian 1: Asesmen Diagnostik */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">1. Asesmen Diagnostik</h2>
            </div>
            {aktif.length ? (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {aktif.map((item) => {
                  const hasil = data.hasilSaya?.find((h) => h.asesmen_id === item.id);
                  const sudahDikerjakan = Boolean(hasil?.selesai);
                  return (
                    <Card className="flex min-h-48 flex-col justify-between p-4 md:p-5 rounded-2xl border-slate-200/80 shadow-xs hover:border-blue-300 transition-all" key={item.id}>
                      <div>
                        <div className="flex items-center justify-between">
                          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#2563EB] text-white font-bold text-base shadow-xs">±</div>
                          {sudahDikerjakan && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Skor: {hasil?.skor_total}
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-base md:text-lg font-bold text-slate-900 leading-snug">{item.judul}</h3>
                        <p className="mt-1 text-xs md:text-sm text-slate-500">{item.materi}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between pt-2 border-t border-slate-100">
                        {sudahDikerjakan ? (
                          <Button
                            disabled
                            className="text-xs px-3.5 py-2 rounded-xl bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hover:bg-slate-100"
                          >
                            <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-600" />
                            Sudah Dikerjakan
                          </Button>
                        ) : (
                          <Button className="text-xs px-3.5 py-2 rounded-xl" href={`/asesmen/kerjakan/${item.id}`}>
                            Mulai Kerjakan
                          </Button>
                        )}
                        <span className="text-xs font-semibold text-slate-500">{item.durasi_menit} menit</span>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-6 rounded-2xl border-slate-200/80 shadow-xs">
                <h3 className="text-sm md:text-base font-semibold text-slate-700">Tidak ada asesmen diagnostik yang perlu dikerjakan</h3>
              </Card>
            )}
          </section>

          {/* Bagian 2: Lembar LKPD yang Dibagikan Guru */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg md:text-xl font-bold text-slate-900">2. Lembar LKPD Siswa</h2>
            </div>
            {lkpdList && lkpdList.length > 0 ? (
              <div className="grid gap-3.5 sm:grid-cols-2">
                {lkpdList.map((item) => {
                  const status = item.pengisian?.status ?? "belum";
                  return (
                    <Card className="flex min-h-48 flex-col justify-between p-4 md:p-5 rounded-2xl border-slate-200/80 shadow-xs hover:border-blue-300 transition-all" key={item.id}>
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
                            Level: {item.level.toUpperCase()}
                          </span>
                          {status === "dinilai" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800">
                              <CheckCircle2 className="h-3 w-3" /> Nilai: {item.pengisian?.nilai ?? 0}
                            </span>
                          )}
                          {status === "terkirim" && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                              <Clock className="h-3 w-3" /> Terkirim
                            </span>
                          )}
                          {status === "draft" && (
                            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
                              Draft
                            </span>
                          )}
                        </div>
                        <h3 className="mt-3 text-base md:text-lg font-bold text-slate-900 leading-snug">{item.judul}</h3>
                        <p className="mt-1 text-xs md:text-sm text-slate-500">{item.materi} · {item.butir.length} Pertanyaan</p>
                      </div>

                      <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between">
                        <Button className="text-xs px-3.5 py-2 rounded-xl" href={`/lkpd-saya/${item.id}`} variant={status === "dinilai" ? "secondary" : "primary"}>
                          <BookOpenCheck className="mr-1.5 h-3.5 w-3.5" />
                          {status === "dinilai" ? "Lihat Nilai & Catatan" : status === "terkirim" ? "Buka Lembar LKPD" : "Kerjakan LKPD"}
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <Card className="text-center py-6 rounded-2xl border-slate-200/80 shadow-xs">
                <h3 className="text-sm md:text-base font-semibold text-slate-700">Belum ada LKPD yang dibagikan guru</h3>
              </Card>
            )}
          </section>
        </>
      )}
    </div>
  );
}
