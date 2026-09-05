import { INDICATORS } from "@/lib/assessment-scoring";
import type { AssessmentSubmission, Siswa } from "@/types";

function csvCell(value: string | number): string {
  const text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) return `'${text}`;
  if (/[",\n\r]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function buildSubmissionCsv(submissions: AssessmentSubmission[], studentOf: (id: string) => Siswa | undefined): string {
  const header = ["Nama", "Skor", "Level", ...INDICATORS.flatMap(k => [`${k} Benar`, `${k} Total`, `${k} Dikuasai`])];
  const lines = submissions.map(row => {
    const cells = [
      studentOf(row.siswa_id)?.nama ?? "Siswa tidak ditemukan",
      row.skor_total,
      row.level,
      ...INDICATORS.flatMap(k => {
        const d = row.detail_per_indikator[k];
        return [d?.benar ?? 0, d?.total ?? 0, d ? (d.dikuasai ? "Ya" : "Tidak") : "Tidak diuji"];
      }),
    ];
    return cells.map(csvCell).join(",");
  });
  return "\uFEFF" + [header.map(csvCell).join(","), ...lines].join("\r\n");
}
