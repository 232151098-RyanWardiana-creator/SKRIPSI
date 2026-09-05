"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DistribusiLevel } from "@/components/charts/DistribusiLevel";
import { useClassStore } from "@/lib/class-store";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useSubmissionStore } from "@/lib/submission-store";
import { Button } from "@/components/ui/Button";
import { ProgresAlur } from "@/components/ui/ProgresAlur";
import { LABEL_GAYA_BELAJAR } from "@/constants/gaya-belajar";
import type { GayaBelajar, Level } from "@/types";
import { Sparkles } from "lucide-react";
import { buildSubmissionCsv } from "@/lib/submission-csv";

const levels: Level[] = ["dasar", "menengah", "mahir"];
const styles = ["visual", "auditory", "kinestetik"] as const;

export default function HasilPage() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const { submissions } = useSubmissionStore();
  const [classChoice, setClassChoice] = useState("");
  const [assessmentChoice, setAssessmentChoice] = useState("");
  const classId = classes.some(({ kelas }) => kelas.id === classChoice) ? classChoice : classes[0]?.kelas.id ?? "";
  const available = useMemo(() => assessments.filter(item => item.kelas_id === classId), [assessments, classId]);
  const assessmentId = available.some(item => item.id === assessmentChoice) ? assessmentChoice : available[0]?.id ?? "";
  const selectedClass = classes.find(({ kelas }) => kelas.id === classId);
  const assessment = available.find(item => item.id === assessmentId);
  const rows = useMemo(() => submissions.filter(item => item.asesmen_id === assessmentId && item.selesai), [submissions, assessmentId]);
  const students = useMemo(() => new Map(selectedClass?.siswa.map(item => [item.id, item]) ?? []), [selectedClass]);
  const distribution = levels.map((level, index) => ({ label: level[0].toUpperCase() + level.slice(1), value: rows.filter(row => row.level === level).length, color: ["#dc2626", "#d97706", "#1d4ed8"][index] }));
  const average = (level: Level) => { const values = rows.filter(row => row.level === level); return values.length ? Math.round(values.reduce((sum, row) => sum + row.skor_total, 0) / values.length) : 0; };
  const weak = (level: Level) => Array.from(new Set(rows.filter(row => row.level === level).flatMap(row => Object.entries(row.detail_per_indikator).filter(([, value]) => !value.dikuasai).map(([key]) => key))));
  const styleOf = (studentId: string): GayaBelajar => rows.find(row => row.siswa_id === studentId)?.gaya_belajar ?? students.get(studentId)?.gaya_belajar ?? null;
  const exportCsv = () => {
    if (!rows.length) return;
    const csv = buildSubmissionCsv(rows, (id) => students.get(id));
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `rekap-${assessment?.judul ?? "asesmen"}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!classes.length) return <div><ProgresAlur current={2}/><Card className="text-center"><h1 className="text-2xl font-semibold">Belum ada kelas</h1><p className="mt-2 text-[#6b7280]">Tambahkan kelas sebelum melihat hasil asesmen.</p><Button className="mt-4" href="/kelas">Buka Manajemen Kelas</Button></Card></div>;

  return <div><ProgresAlur current={2}/><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Hasil Asesmen</h1><p className="mt-2 text-[#414753]">Data TaRL, VAK, dan indikator dihitung dari submission siswa yang selesai.</p></div><div className="flex flex-wrap gap-3"><label className="text-sm font-semibold">Kelas<select className="input mt-1" value={classId} onChange={e=>{setClassChoice(e.target.value);setAssessmentChoice("")}}>{classes.map(({kelas})=><option key={kelas.id} value={kelas.id}>{kelas.nama}</option>)}</select></label><label className="text-sm font-semibold">Asesmen<select className="input mt-1" value={assessmentId} onChange={e=>setAssessmentChoice(e.target.value)}><option value="">Pilih asesmen</option>{available.map(item=><option key={item.id} value={item.id}>{item.judul}</option>)}</select></label></div></div>
  {!assessment?<Card className="mt-7 text-center"><h2 className="text-xl font-semibold">Belum ada asesmen untuk kelas ini</h2><p className="mt-2 text-[#6b7280]">Buat atau pilih asesmen untuk menampilkan hasil.</p><Button className="mt-4" href="/asesmen/buat">Buat Asesmen</Button></Card>:!rows.length?<Card className="mt-7 text-center"><h2 className="text-xl font-semibold">Belum ada hasil terkumpul</h2><p className="mt-2 text-[#6b7280]">Belum ada siswa yang menyelesaikan {assessment.judul}.</p></Card>:<>
  <Card className="mt-7"><h2 className="text-2xl font-semibold">{assessment.judul}</h2><p className="mb-5 text-sm text-[#6b7280]">{selectedClass?.kelas.nama} · {rows.length} submission selesai</p><div className="mb-5 flex justify-end"><Button onClick={exportCsv} variant="secondary">Unduh Rekap CSV</Button></div><DistribusiLevel data={distribution}/><div className="mt-5 grid gap-3 sm:grid-cols-3">{levels.map(level=><div className="rounded-xl bg-[#f2f3fc] p-3" key={level}><strong className="capitalize">{level}: {average(level)}%</strong><p className="mt-1 text-sm">Indikator lemah: {weak(level).join(", ") || "Tidak ada"}</p></div>)}</div></Card>
  <Card className="mt-6"><h2 className="text-2xl font-semibold">Distribusi Gaya Belajar</h2><p className="text-sm text-[#6b7280]">VAK hanya dari siswa yang memiliki hasil gaya belajar.</p><div className="mt-5 space-y-4">{styles.map(style=>{const count=rows.filter(row=>styleOf(row.siswa_id)===style).length;const known=rows.filter(row=>styleOf(row.siswa_id)).length;const percent=known?Math.round(count/known*100):0;const info=LABEL_GAYA_BELAJAR[style];return <div key={style}><div className="flex justify-between text-sm"><strong>{info.label}</strong><span>{count} siswa ({percent}%)</span></div><div className="mt-1 h-3 overflow-hidden rounded-full bg-gray-200"><div className="h-full" style={{width:`${percent}%`,backgroundColor:info.warna}}/></div></div>})}</div></Card>
  <Card className="mt-6 overflow-hidden"><h2 className="text-2xl font-semibold">Detail Siswa dan Indikator</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead><tr className="border-b"><th className="p-3">Nama</th><th>Skor</th><th>Level</th><th>VAK</th><th>Indikator lemah</th></tr></thead><tbody>{rows.map(row=>{const style=styleOf(row.siswa_id);const weakIndicators=Object.entries(row.detail_per_indikator).filter(([,value])=>!value.dikuasai).map(([key,value])=>`${key} (${value.benar}/${value.total})`);return <tr className="border-b" key={row.id}><td className="p-3 font-medium">{students.get(row.siswa_id)?.nama ?? "Siswa tidak ditemukan"}</td><td>{row.skor_total}</td><td><Badge level={row.level}>{row.level}</Badge></td><td>{style?LABEL_GAYA_BELAJAR[style].label:"Belum diisi"}</td><td>{weakIndicators.join(", ")||"—"}</td></tr>})}</tbody></table></div></Card>
  <div className="mt-6 flex justify-end"><Button href="/generator"><Sparkles className="h-4 w-4"/>Buat LKPD dari Hasil</Button></div></>}
  </div>;
}
