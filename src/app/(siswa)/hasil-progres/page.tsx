"use client";

import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useDataSiswa } from "@/lib/student-assessments";

export default function HasilProgresPage() {
  const data = useDataSiswa();
  const judulById = new Map((data?.asesmen ?? []).map((item) => [item.id, item.judul]));
  const results = (data?.hasilSaya ?? []).filter((item) => item.selesai && judulById.has(item.asesmen_id));
  const aktif = (data?.asesmen ?? []).filter((item) => item.status === "aktif");
  const selesaiIds = new Set(results.map((item) => item.asesmen_id));
  const selesaiAktif = aktif.filter((item) => selesaiIds.has(item.id)).length;
  const progress = aktif.length ? Math.round((selesaiAktif / aktif.length) * 100) : 0;

  return (
    <div>
      <h1 className="flex items-center gap-3 text-2xl font-semibold md:text-3xl">
        <TrendingUp className="h-7 w-7 text-[#0066cc]" />
        Hasil &amp; Progres
      </h1>
      <p className="mt-2 text-sm text-[#414753] md:text-base">Pantau hasil asesmen dan progres belajarmu.</p>

      {data === null ? (
        <Card className="mt-7 text-center">
          <p className="text-[#6b7280]">Masuk dulu dari menu Dashboard untuk melihat hasilmu.</p>
        </Card>
      ) : (
        <>
          <Card className="mt-7 p-4 md:p-6">
            <h2 className="font-semibold">Progres Asesmen Aktif</h2>
            <p className="mb-4 mt-1 text-sm text-[#6b7280]">
              {selesaiAktif} dari {aktif.length} asesmen selesai
            </p>
            <ProgressBar value={progress} />
          </Card>
          {results.length === 0 ? (
            <Card className="mt-5 text-center">
              <p className="text-[#6b7280]">
                Belum ada hasil asesmen. Kerjakan asesmen yang tersedia pada menu Asesmen Saya untuk melihat hasil
                dan progres belajarmu.
              </p>
            </Card>
          ) : (
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {results.map((result) => (
                <Card className="flex items-center justify-between gap-4 p-4 md:p-6" key={result.id}>
                  <div>
                    <h2 className="font-semibold">{judulById.get(result.asesmen_id)}</h2>
                    <Badge level={result.level}>{result.level}</Badge>
                  </div>
                  <strong className="text-3xl text-[#0066cc]">{result.skor_total}</strong>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
