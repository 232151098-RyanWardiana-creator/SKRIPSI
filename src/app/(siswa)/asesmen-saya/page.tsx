"use client";

import { ClipboardCheck, Clock } from "lucide-react";
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
            {items.map((item) => (
              <Card className="p-4 md:p-6" key={item.id}>
                <h2 className="text-xl font-semibold">{item.judul}</h2>
                <p className="mt-2 text-sm text-[#6b7280]">
                  {item.materi} · Kelas {data.siswa.kelasNama}
                </p>
                <p className="mt-2 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {item.durasi_menit} menit
                </p>
                <Button className="mt-5 w-full sm:w-auto" href={`/asesmen/kerjakan/${item.id}`}>
                  <ClipboardCheck className="h-4 w-4" />
                  Mulai Kerjakan
                </Button>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center">
            <h2 className="text-xl font-semibold">Belum ada asesmen aktif</h2>
            <p className="mt-2 text-sm text-[#6b7280]">
              Tidak ada asesmen aktif untuk kelas {data.siswa.kelasNama}.
            </p>
          </Card>
        ))}
    </div>
  );
}
