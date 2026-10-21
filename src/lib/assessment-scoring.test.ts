import { test } from "node:test";
import assert from "node:assert/strict";
import { scoreAssessment, scoreToLevel } from "./assessment-scoring.js";
import { DEMO_SOAL } from "./demo-data.js";
import type { AnswerKey, Soal } from "../types/index.js";

const soal: Soal[] = DEMO_SOAL.map(item => ({ ...item, asesmen_id: "uji" }));

function jawabBenar(jumlah: number, salahDulu: string[] = []): Record<string, AnswerKey> {
  const urut = [...soal].sort((a, b) => Number(salahDulu.includes(b.indikator)) - Number(salahDulu.includes(a.indikator)));
  return Object.fromEntries(urut.map((item, index) => {
    const salah = (["a", "b", "c", "d"] as AnswerKey[]).find(key => key !== item.jawaban_benar)!;
    return [item.id, index >= soal.length - jumlah ? item.jawaban_benar : salah];
  }));
}

test("batas skor PPA 2022: 0–65 Perlu Bimbingan, 66–85 Berkembang, 86–100 Mahir", () => {
  assert.equal(scoreToLevel(65), "dasar");
  assert.equal(scoreToLevel(66), "menengah");
  assert.equal(scoreToLevel(85), "menengah");
  assert.equal(scoreToLevel(86), "mahir");
});

test("10 butir: 6 benar dasar, 7–8 benar menengah, 9 benar mahir", () => {
  assert.equal(scoreAssessment(soal, jawabBenar(6)).level, "dasar");
  assert.equal(scoreAssessment(soal, jawabBenar(7)).level, "menengah");
  assert.equal(scoreAssessment(soal, jawabBenar(8)).level, "menengah");
  assert.equal(scoreAssessment(soal, jawabBenar(9)).level, "mahir");
});

test("salah di indikator prasyarat tidak menurunkan level; tetap tercatat sebagai indikator lemah", () => {
  const hasil = scoreAssessment(soal, jawabBenar(9, ["IK-01"]));
  assert.equal(hasil.score, 90);
  assert.equal(hasil.level, "mahir");
  assert.equal(hasil.detail_per_indikator["IK-01"].dikuasai, false);
});
