"use client";

import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StudentIdentityPicker } from "@/components/forms/StudentIdentityPicker";
import { useClassStore } from "@/lib/class-store";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useSelectedStudentId } from "@/lib/student-session";

export default function DashboardSiswa() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const selectedId = useSelectedStudentId();
  const entry = classes.find(({ siswa }) => siswa.some(item => item.id === selectedId));
  const student = entry?.siswa.find(item => item.id === selectedId);
  const aktif = student ? assessments.filter(item => item.status === "aktif" && item.kelas_id === entry?.kelas.id) : [];

  return <div>
    <StudentIdentityPicker />
    {student ? <>
      <section className="mb-8 rounded-[24px] bg-[#f2f3fc] p-7"><h1 className="text-2xl font-semibold md:text-3xl">Halo, {student.nama}!</h1><p className="mt-2 text-sm text-[#414753] md:text-base">Kelas {entry?.kelas.nama} · Siap mengerjakan asesmen hari ini?</p></section>
      <section><h2 className="mb-4 text-2xl font-semibold">Asesmen Aktif</h2>{aktif.length ? <div className="grid gap-4 sm:grid-cols-2">{aktif.map(item => <Card className="flex min-h-56 flex-col" key={item.id}><div className="grid h-12 w-12 place-items-center rounded-full bg-[#0066cc] text-white">±</div><h3 className="mt-5 text-xl font-semibold">{item.judul}</h3><p className="mt-1 text-sm text-[#7a7a7a]">{item.materi}</p><div className="mt-auto flex items-end justify-between"><Button href={`/asesmen/kerjakan/${item.id}`}>Mulai Kerjakan</Button><span className="text-xs text-[#7a7a7a]">{item.durasi_menit} menit</span></div></Card>)}</div> : <Card className="text-center"><h3 className="text-lg font-semibold">Belum ada asesmen aktif</h3><p className="mt-2 text-sm text-[#6b7280]">Guru belum mempublikasikan asesmen aktif untuk kelas {entry?.kelas.nama}.</p></Card>}</section>
    </> : classes.some(item => item.siswa.length) && <Card className="text-center"><p className="text-[#6b7280]">Pilih identitas siswa untuk membuka dashboard.</p></Card>}
  </div>;
}
