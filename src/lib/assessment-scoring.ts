import type { Indikator, Level, Soal, AnswerKey, IndicatorResult } from "@/types";

export const INDICATORS: Indikator[] = ["IK-01", "IK-02", "IK-03", "IK-04", "IK-05"];
const PREREQUISITE: Indikator[] = ["IK-01", "IK-02"];
const MASTERY_THRESHOLD = 0.6;

export function scoreToLevel(score: number): Level { return score < 60 ? "dasar" : score < 80 ? "menengah" : "mahir"; }
export const getLevelFromScore = scoreToLevel;

export function indicatorResultsToLevel(detail: Record<Indikator, IndicatorResult>, score: number): Level {
  const mastered = INDICATORS.filter(k => detail[k].total > 0 && detail[k].dikuasai);
  const prereqOk = PREREQUISITE.every(k => !(detail[k].total > 0) || detail[k].dikuasai);
  if (!prereqOk || mastered.length <= 2) return "dasar";
  if (prereqOk && mastered.length >= 4 && score >= 80) return "mahir";
  return "menengah";
}

export function scoreAssessment(questions: Soal[], answers: Record<string, AnswerKey>) {
  const correct = questions.filter(question => answers[question.id] === question.jawaban_benar).length;
  const score = questions.length ? Math.round(correct / questions.length * 100) : 0;
  const detail = Object.fromEntries(INDICATORS.map(indicator => {
    const rows = questions.filter(question => question.indikator === indicator);
    const benar = rows.filter(question => answers[question.id] === question.jawaban_benar).length;
    return [indicator, { benar, total: rows.length, dikuasai: rows.length > 0 && benar / rows.length >= MASTERY_THRESHOLD } satisfies IndicatorResult];
  })) as Record<Indikator, IndicatorResult>;
  return { correct, total: questions.length, score, level: indicatorResultsToLevel(detail, score), detail_per_indikator: detail };
}
