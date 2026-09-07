"use client";

import { use } from "react";
import { Card } from "@/components/ui/Card";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { LkpdWorksheet } from "@/components/forms/LkpdWorksheet";
import { useLkpdSiswa } from "@/lib/student-lkpd";

export default function KerjakanLkpdPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, muatUlang } = useLkpdSiswa();
  const lkpd = data?.find((item) => item.id === id);

  return (
    <div>
      <StudentIdentityPicker />
      {data && !lkpd && (
        <Card className="mx-auto max-w-md text-center">
          <h1 className="text-lg font-semibold">LKPD tidak ditemukan</h1>
          <p className="mt-2 text-sm text-[#6b7280]">
            Lembar kerja ini mungkin sudah ditarik gurumu, atau bukan untuk kelasmu.
          </p>
        </Card>
      )}
      {lkpd && <LkpdWorksheet lkpd={lkpd} onKirim={muatUlang} />}
    </div>
  );
}
