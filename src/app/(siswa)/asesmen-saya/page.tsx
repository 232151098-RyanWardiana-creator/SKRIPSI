"use client";

import { ClipboardCheck, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { useDataSiswa } from "@/lib/student-assessments";

export default function AsesmenSayaPage() {
  const data = useDataSiswa();
  const items = data?.asesmen.filter((item) => item.status === "aktif") ?? [];

  return (
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-semibold md:text-3xl">
        <ClipboardCheck className="h-7 w-7 text-[#0066cc]" />
        Asesmen Saya
      </h1>
      <p className="mt-2 text-sm text-[#414753] md:text-base">Daftar asesmen aktif untuk kelasmu.</p>
      <div className="mt-6">
        <StudentIdentityPicker />
      </div>
      {data &&
        (items.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => {
              const hasil = data.hasilSaya?.find((h) => h.asesmen_id === item.id);
              const sudahDikerjakan = Boolean(hasil?.selesai);
              return (
                <Card className="p-4 md:p-6" key={item.id}>
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="text-xl font-semibold">{item.judul}</h2>
                    {sudahDikerjakan && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 shrink-0">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Skor: {hasil?.skor_total}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-[#6b7280]">
                    {item.materi} · Kelas {data.siswa.kelasNama}
                  </p>
                  <p className="mt-2 flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" />
                    {item.durasi_menit} menit
                  </p>
                  {sudahDikerjakan ? (
                    <Button
                      disabled
                      className="mt-5 w-full sm:w-auto bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed hover:bg-slate-100"
                    >
                      <CheckCircle2 className="mr-1 h-4 w-4 text-emerald-600" />
                      Sudah Dikerjakan
                    </Button>
                  ) : (
                    <Button className="mt-5 w-full sm:w-auto" href={`/asesmen/kerjakan/${item.id}`}>
                      <ClipboardCheck className="h-4 w-4" />
                      Mulai Kerjakan
                    </Button>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <Card className="text-center py-8 rounded-2xl border-slate-200/80 shadow-xs">
            <h2 className="text-base font-bold text-slate-700">Belum ada asesmen aktif</h2>
          </Card>
        ))}
    </div>
  );
}
