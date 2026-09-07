"use client";

import { useMemo, useState } from "react";
import { StatCard } from "@/components/ui/StatCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DonutChart } from "@/components/ui/DonutChart";
import { useClassStore } from "@/lib/class-store";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useSubmissionStore } from "@/lib/submission-store";
import { useHistoryStore } from "@/lib/lkpd-history";
import { useTeacherProfile } from "@/lib/teacher-profile";
import { ClipboardList, FileText, Plus, TrendingUp, Users } from "lucide-react";

export default function DashboardGuru() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const { submissions } = useSubmissionStore();
  const { history } = useHistoryStore();
  const profile = useTeacherProfile();
  const [dataMessage] = useState("");
  const teacherName = profile.nama.split(" ")[0] || "Guru";
  const school = profile.sekolah;
  const totalStudents = classes.reduce((sum, item) => sum + item.siswa.length, 0);
  const completed = submissions.filter(item => item.selesai);
  const average = completed.length ? Math.round(completed.reduce((sum,item)=>sum+item.skor_total,0)/completed.length) : 0;
  const active = assessments.filter(item => item.status === "aktif").length;
  const validated = history.filter(item => item.status === "Tervalidasi").length;
  const readiness = history.length ? Math.round(validated/history.length*100) : 0;
  const classNames = useMemo(()=>new Map(classes.map(item=>[item.kelas.id,item.kelas.nama])),[classes]);
  const activities = useMemo(()=>[
    ...assessments.map(item=>({id:`assessment-${item.id}`,title:item.judul,className:classNames.get(item.kelas_id)??"Kelas dihapus",date:item.dibuat_pada??item.tanggal_mulai,status:item.status==="aktif"?"Aktif":item.status==="selesai"?"Selesai":"Draf"})),
    ...history.map(item=>({id:`history-${item.id}`,title:item.judul,className:item.kelas,date:item.dibuat_pada,status:item.status}))
  ].sort((a,b)=>new Date(b.date).getTime()-new Date(a.date).getTime()).slice(0,8),[assessments,history,classNames]);
  return <div><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-2xl font-semibold md:text-3xl">Selamat datang, {teacherName}</h1><p className="mt-2 text-[#414753]">Ringkasan data pembelajaran aktual{school?` di ${school}`:""}.</p>{dataMessage&&<p role="status" className="mt-2 text-sm font-semibold text-green-700">{dataMessage}</p>}</div><div className="flex flex-wrap gap-2"><Button href="/asesmen/buat"><Plus className="h-4 w-4"/>Buat Asesmen Baru</Button></div></div>
  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5"><StatCard icon={Users} iconClassName="bg-blue-50 text-blue-600" label="Total Siswa" value={totalStudents} detail={`${classes.length} kelas`}/><StatCard icon={ClipboardList} iconClassName="bg-emerald-50 text-emerald-600" label="Asesmen Aktif" value={active} detail={`${assessments.length} total asesmen`}/><StatCard icon={FileText} iconClassName="bg-purple-50 text-purple-600" label="LKPD Dibuat" value={history.length} detail={`${validated} tervalidasi`}/><StatCard icon={TrendingUp} iconClassName="bg-orange-50 text-orange-600" label="Rata-rata Skor" value={completed.length?`${average}%`:"—"} detail={`${completed.length} submission selesai`}/></div>
  <div className="mt-7 grid gap-6 xl:grid-cols-[1fr_340px]"><Card><div className="mb-5 flex justify-between"><h2 className="text-xl font-semibold">Aktivitas Terbaru</h2><a className="text-sm font-semibold text-[#0066cc]" href="/riwayat">Lihat Semua</a></div>{activities.length?<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr><th className="pb-3">Judul</th><th>Kelas</th><th>Tanggal</th><th>Status</th></tr></thead><tbody>{activities.map(item=><tr className="border-t" key={item.id}><td className="py-4 font-semibold">{item.title}</td><td>{item.className}</td><td>{new Date(item.date).toLocaleDateString("id-ID")}</td><td><span className="rounded-full bg-blue-50 px-3 py-1 text-xs text-blue-700">{item.status}</span></td></tr>)}</tbody></table></div>:<div className="py-12 text-center text-[#6b7280]">Belum ada aktivitas. Buat kelas, tambahkan siswa, lalu susun asesmen diagnostik.</div>}</Card><Card className="flex flex-col items-center"><h2 className="self-start text-xl font-semibold">Kesiapan Mengajar</h2><div className="mt-8"><DonutChart label={history.length?"Siap":"Belum ada"} value={readiness}/></div><p className="mt-6 text-center text-sm text-[#414753]">{history.length?`${validated} dari ${history.length} LKPD telah divalidasi.`:"Generate LKPD untuk mulai mengukur kesiapan."}</p></Card></div></div>;
}
