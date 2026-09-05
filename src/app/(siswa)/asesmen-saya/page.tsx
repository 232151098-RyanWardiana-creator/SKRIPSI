"use client";

import { ClipboardCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { useClassStore } from "@/lib/class-store";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useSelectedStudentId } from "@/lib/student-session";

export default function AsesmenSayaPage() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const selectedId = useSelectedStudentId();
  const entry = classes.find(({ siswa }) => siswa.some(item => item.id === selectedId));
  const student = entry?.siswa.find(item => item.id === selectedId);
  const items = student ? assessments.filter(item => item.status === "aktif" && item.kelas_id === entry?.kelas.id) : [];

  return <div>
    <h1 className="flex items-center gap-3 text-2xl font-semibold md:text-3xl"><ClipboardCheck className="h-7 w-7 text-[#0066cc]" />Asesmen Saya</h1>
    <p className="mt-2 text-sm text-[#414753] md:text-base">Daftar asesmen aktif yang tersedia untuk kelas siswa.</p>
    <div className="mt-6"><StudentIdentityPicker /></div>
    {student ? items.length ? <div className="grid gap-4 md:grid-cols-2">{items.map(item => <Card className="p-4 md:p-6" key={item.id}><h2 className="text-xl font-semibold">{item.judul}</h2><p className="mt-2 text-sm text-[#6b7280]">{item.materi} · Kelas {entry?.kelas.nama}</p><p className="mt-2 flex items-center gap-2 text-sm"><Clock className="h-4 w-4" />{item.durasi_menit} menit</p><Button className="mt-5 w-full sm:w-auto" href={`/asesmen/kerjakan/${item.id}`}><ClipboardCheck className="h-4 w-4" />Mulai Kerjakan</Button></Card>)}</div> : <Card className="text-center"><h2 className="text-xl font-semibold">Belum ada asesmen aktif</h2><p className="mt-2 text-sm text-[#6b7280]">Tidak ada asesmen aktif untuk kelas {entry?.kelas.nama}.</p></Card> : classes.some(item => item.siswa.length) && <Card className="text-center"><p className="text-[#6b7280]">Pilih identitas siswa untuk melihat asesmen.</p></Card>}
  </div>;
}
