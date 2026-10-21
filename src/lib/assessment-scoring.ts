import type { Indikator, Level, Soal, AnswerKey, IndicatorResult } from "@/types";
import { KESIAPAN_BELAJAR_LABELS } from "@/types";

export const INDICATORS: Indikator[] = ["IK-01", "IK-02", "IK-03", "IK-04", "IK-05"];
const MASTERY_THRESHOLD = 0.6;

/** Level kesiapan ditentukan dari skor total saja: < 60 Perlu Bimbingan, 60–79 Berkembang, ≥ 80 Mahir. */
export function scoreToLevel(score: number): Level { return score < 60 ? "dasar" : score < 80 ? "menengah" : "mahir"; }
export const getLevelFromScore = scoreToLevel;

export function getReadinessInfo(score: number) {
  const level = scoreToLevel(score);
  return KESIAPAN_BELAJAR_LABELS[level];
}

/**
 * Detail per indikator tidak menentukan level; dipakai sebagai "indikator lemah"
 * yang ditekankan AI saat menyusun LKPD tiap kelompok.
 */
export function scoreAssessment(questions: Soal[], answers: Record<string, AnswerKey>) {
  const correct = questions.filter(question => answers[question.id] === question.jawaban_benar).length;
  const score = questions.length ? Math.round(correct / questions.length * 100) : 0;
  const detail = Object.fromEntries(INDICATORS.map(indicator => {
    const rows = questions.filter(question => question.indikator === indicator);
    const benar = rows.filter(question => answers[question.id] === question.jawaban_benar).length;
    return [indicator, { benar, total: rows.length, dikuasai: rows.length > 0 && benar / rows.length >= MASTERY_THRESHOLD } satisfies IndicatorResult];
  })) as Record<Indikator, IndicatorResult>;
  return { correct, total: questions.length, score, level: scoreToLevel(score), detail_per_indikator: detail };
}
