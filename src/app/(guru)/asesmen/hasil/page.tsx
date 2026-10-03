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
import { KESIAPAN_BELAJAR_LABELS } from "@/types";
import type { Level } from "@/types";
import { buildSubmissionCsv } from "@/lib/submission-csv";

const levels: Level[] = ["dasar", "menengah", "mahir"];

export default function HasilPage() {
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const { submissions } = useSubmissionStore();
  const [classChoice, setClassChoice] = useState("");
  const [assessmentChoice, setAssessmentChoice] = useState("");
  const [sortField, setSortField] = useState<"nama" | "skor" | "level" | null>("nama");
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  const classId = classes.some(({ kelas }) => kelas.id === classChoice) ? classChoice : classes[0]?.kelas.id ?? "";
  const available = useMemo(() => assessments.filter(item => item.kelas_id === classId), [assessments, classId]);
  const assessmentId = available.some(item => item.id === assessmentChoice) ? assessmentChoice : available[0]?.id ?? "";
  const selectedClass = classes.find(({ kelas }) => kelas.id === classId);
  const assessment = available.find(item => item.id === assessmentId);
  const rows = useMemo(() => submissions.filter(item => item.asesmen_id === assessmentId && item.selesai), [submissions, assessmentId]);
  const students = useMemo(() => new Map(selectedClass?.siswa.map(item => [item.id, item]) ?? []), [selectedClass]);
  const distribution = levels.map((level, index) => ({
    label: KESIAPAN_BELAJAR_LABELS[level].kategori,
    value: rows.filter(row => row.level === level).length,
    color: ["#dc2626", "#d97706", "#1d4ed8"][index]
  }));
  const average = (level: Level) => {
    const values = rows.filter(row => row.level === level);
    return values.length ? Math.round(values.reduce((sum, row) => sum + row.skor_total, 0) / values.length) : 0;
  };
  const weak = (level: Level) => Array.from(new Set(rows.filter(row => row.level === level).flatMap(row => Object.entries(row.detail_per_indikator).filter(([, value]) => !value.dikuasai).map(([key]) => key))));

  const handleSort = (field: "nama" | "skor" | "level") => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const sortedRows = useMemo(() => {
    if (!sortField) return rows;
    const levelRank: Record<string, number> = { dasar: 1, menengah: 2, mahir: 3 };
    return [...rows].sort((a, b) => {
      let cmp = 0;
      if (sortField === "nama") {
        const nameA = students.get(a.siswa_id)?.nama?.toLowerCase() ?? "";
        const nameB = students.get(b.siswa_id)?.nama?.toLowerCase() ?? "";
        cmp = nameA.localeCompare(nameB);
      } else if (sortField === "skor") {
        cmp = a.skor_total - b.skor_total;
      } else if (sortField === "level") {
        cmp = (levelRank[a.level] ?? 0) - (levelRank[b.level] ?? 0);
      }
      return sortAsc ? cmp : -cmp;
    });
  }, [rows, sortField, sortAsc, students]);

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

  return <div><ProgresAlur current={2}/><div className="flex flex-wrap items-end justify-between gap-4"><div><h1 className="text-3xl font-semibold">Profil Kesiapan Belajar Siswa (TaRL)</h1></div><div className="flex flex-wrap gap-3"><label className="text-sm font-semibold">Kelas<select className="input mt-1" value={classId} onChange={e=>{setClassChoice(e.target.value);setAssessmentChoice("")}}>{classes.map(({kelas})=><option key={kelas.id} value={kelas.id}>{kelas.nama}</option>)}</select></label><label className="text-sm font-semibold">Asesmen<select className="input mt-1" value={assessmentId} onChange={e=>setAssessmentChoice(e.target.value)}><option value="">Pilih asesmen</option>{available.map(item=><option key={item.id} value={item.id}>{item.judul}</option>)}</select></label></div></div>
  {!assessment?<Card className="mt-7 text-center"><h2 className="text-xl font-semibold">Belum ada asesmen untuk kelas ini</h2><p className="mt-2 text-[#6b7280]">Buat atau pilih asesmen untuk menampilkan hasil.</p><Button className="mt-4" href="/asesmen/buat">Buat Asesmen</Button></Card>:!rows.length?<Card className="mt-7 text-center"><h2 className="text-xl font-semibold">Belum ada hasil terkumpul</h2><p className="mt-2 text-[#6b7280]">Belum ada siswa yang menyelesaikan {assessment.judul}.</p></Card>:<>
  <Card className="mt-7"><h2 className="text-2xl font-semibold">{assessment.judul}</h2><p className="mb-5 text-sm text-[#6b7280]">{selectedClass?.kelas.nama} · {rows.length} submission selesai</p><div className="mb-5 flex justify-end"><Button onClick={exportCsv} variant="secondary">Unduh Rekap CSV</Button></div><DistribusiLevel data={distribution}/><div className="mt-5 grid gap-3 sm:grid-cols-3">{levels.map(level=><div className="rounded-xl bg-[#f2f3fc] p-3" key={level}><strong>{KESIAPAN_BELAJAR_LABELS[level].kategori}: {average(level)}%</strong><p className="mt-1 text-sm">Indikator lemah: {weak(level).join(", ") || "Tidak ada"}</p></div>)}</div></Card>
  <Card className="mt-6 overflow-hidden"><h2 className="text-2xl font-semibold">Detail Siswa dan Indikator</h2><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b"><th className="p-3 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => handleSort("nama")}><div className="flex items-center gap-1.5 font-bold"><span>Nama</span><span className="text-xs text-slate-400 font-normal">{sortField === "nama" ? (sortAsc ? "↑" : "↓") : "↕"}</span></div></th><th className="p-3 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => handleSort("skor")}><div className="flex items-center gap-1.5 font-bold"><span>Skor</span><span className="text-xs text-slate-400 font-normal">{sortField === "skor" ? (sortAsc ? "↑" : "↓") : "↕"}</span></div></th><th className="p-3 cursor-pointer select-none hover:text-blue-600 transition-colors" onClick={() => handleSort("level")}><div className="flex items-center gap-1.5 font-bold"><span>Kesiapan Belajar</span><span className="text-xs text-slate-400 font-normal">{sortField === "level" ? (sortAsc ? "↑" : "↓") : "↕"}</span></div></th><th className="p-3 font-bold">Indikator lemah</th></tr></thead><tbody>{sortedRows.map(row=>{const weakIndicators=Object.entries(row.detail_per_indikator).filter(([,value])=>!value.dikuasai).map(([key,value])=>`${key} (${value.benar}/${value.total})`);return <tr className="border-b hover:bg-slate-50/70 transition-colors" key={row.id}><td className="p-3 font-medium text-slate-900">{students.get(row.siswa_id)?.nama ?? "Siswa tidak ditemukan"}</td><td className="p-3 font-semibold text-slate-700">{row.skor_total}</td><td className="p-3"><Badge level={row.level}>{KESIAPAN_BELAJAR_LABELS[row.level].kategori}</Badge></td><td className="p-3 text-slate-600">{weakIndicators.join(", ") || "Semua dikuasai"}</td></tr>;})}</tbody></table></div></Card>
  <div className="mt-6 flex justify-end"><Button href="/generator">Buat LKPD dari Hasil</Button></div></>}
  </div>;
}
