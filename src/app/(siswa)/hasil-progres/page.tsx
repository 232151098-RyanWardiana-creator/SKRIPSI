"use client";

import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useAssessmentStore } from "@/lib/assessment-store";
import { useClassStore } from "@/lib/class-store";
import { useSelectedStudentId } from "@/lib/student-session";
import { useSubmissionStore } from "@/lib/submission-store";

export default function HasilProgresPage() {
  const selectedStudentId = useSelectedStudentId();
  const { classes } = useClassStore();
  const { assessments } = useAssessmentStore();
  const { submissions } = useSubmissionStore();
  const classEntry = classes.find(({ siswa }) => siswa.some(({ id }) => id === selectedStudentId));
  const classAssessments = assessments.filter(({ kelas_id }) => kelas_id === classEntry?.kelas.id);
  const assessmentById = new Map(classAssessments.map((assessment) => [assessment.id, assessment]));
  const results = submissions.filter((submission) =>
    submission.selesai
    && submission.siswa_id === selectedStudentId
    && assessmentById.has(submission.asesmen_id)
  );
  const activeAssessments = classAssessments.filter(({ status }) => status === "aktif");
  const completedIds = new Set(results.map(({ asesmen_id }) => asesmen_id));
  const completedActive = activeAssessments.filter(({ id }) => completedIds.has(id)).length;
  const progress = activeAssessments.length ? Math.round(completedActive / activeAssessments.length * 100) : 0;

  return <div>
    <h1 className="flex items-center gap-3 text-2xl font-semibold md:text-3xl"><TrendingUp className="h-7 w-7 text-[#0066cc]" />Hasil &amp; Progres</h1>
    <p className="mt-2 text-sm text-[#414753] md:text-base">Pantau hasil asesmen dan progres belajarmu.</p>
    <Card className="mt-7 p-4 md:p-6">
      <h2 className="font-semibold">Progres Asesmen Aktif</h2>
      <p className="mb-4 mt-1 text-sm text-[#6b7280]">{completedActive} dari {activeAssessments.length} asesmen selesai</p>
      <ProgressBar value={progress} />
    </Card>
    {results.length === 0
      ? <Card className="mt-5 text-center"><p className="text-[#6b7280]">Belum ada hasil asesmen. Kerjakan asesmen yang tersedia pada menu Asesmen Saya untuk melihat hasil dan progres belajarmu.</p></Card>
      : <div className="mt-5 grid gap-4 md:grid-cols-2">{results.map((result) => {
        const assessment = assessmentById.get(result.asesmen_id);
        return <Card className="flex items-center justify-between gap-4 p-4 md:p-6" key={result.id}>
          <div><h2 className="font-semibold">{assessment?.judul}</h2><Badge level={result.level}>{result.level}</Badge></div>
          <strong className="text-3xl text-[#0066cc]">{result.skor_total}</strong>
        </Card>;
      })}</div>}
  </div>;
}
