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

test("batas skor: < 60 Perlu Bimbingan, 60–79 Berkembang, >= 80 Mahir", () => {
  assert.equal(scoreToLevel(59), "dasar");
  assert.equal(scoreToLevel(60), "menengah");
  assert.equal(scoreToLevel(79), "menengah");
  assert.equal(scoreToLevel(80), "mahir");
});

test("10 butir: 5 benar dasar, 6–7 benar menengah, 8 benar mahir", () => {
  assert.equal(scoreAssessment(soal, jawabBenar(5)).level, "dasar");
  assert.equal(scoreAssessment(soal, jawabBenar(6)).level, "menengah");
  assert.equal(scoreAssessment(soal, jawabBenar(7)).level, "menengah");
  assert.equal(scoreAssessment(soal, jawabBenar(8)).level, "mahir");
});

test("salah di indikator prasyarat tidak menurunkan level; tetap tercatat sebagai indikator lemah", () => {
  const hasil = scoreAssessment(soal, jawabBenar(8, ["IK-01"]));
  assert.equal(hasil.score, 80);
  assert.equal(hasil.level, "mahir");
  assert.equal(hasil.detail_per_indikator["IK-01"].dikuasai, false);
});
