import { test } from "node:test";
import assert from "node:assert/strict";
import { indicatorResultsToLevel } from "./assessment-scoring.js";
import type { Indikator, IndicatorResult, Level } from "../types/index.js";

function makeDetail(overrides: Partial<Record<Indikator, IndicatorResult>>): Record<Indikator, IndicatorResult> {
  const empty = { benar: 0, total: 0, dikuasai: false };
  return {
    "IK-01": empty,
    "IK-02": empty,
    "IK-03": empty,
    "IK-04": empty,
    "IK-05": empty,
    ...overrides,
  };
}
const m = { benar: 2, total: 3, dikuasai: true };
const f = { benar: 1, total: 3, dikuasai: false };

function level(detail: Record<Indikator, IndicatorResult>, score: number): Level {
  return indicatorResultsToLevel(detail, score);
}

test("mahir: semua prerequisite dikuasai, >=4 dikuasai, skor >=80", () => {
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m, "IK-03": m, "IK-04": m }), 90), "mahir");
});

test("menengah: prereq ok tapi <4 indikator dikuasai", () => {
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m, "IK-03": m }), 85), "menengah");
});

test("menengah: prereq ok, >=4 dikuasai, tapi skor <80", () => {
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m, "IK-03": m, "IK-04": m }), 79), "menengah");
});

test("dasar: salah satu prerequisite gagal", () => {
  assert.equal(level(makeDetail({ "IK-01": f, "IK-02": m, "IK-03": m, "IK-04": m }), 90), "dasar");
});

test("dasar: total indikator dikuasai <=2", () => {
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m }), 90), "dasar");
});

test("prerequisite tidak diuji tidak dianggap gagal", () => {
  assert.equal(level(makeDetail({ "IK-02": m, "IK-03": m, "IK-04": m, "IK-05": m }), 90), "mahir");
});

test("indikator tanpa soal tidak menghukum", () => {
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m }), 50), "dasar");
  assert.equal(level(makeDetail({ "IK-01": m, "IK-02": m, "IK-03": m, "IK-04": m }), 90), "mahir");
});
