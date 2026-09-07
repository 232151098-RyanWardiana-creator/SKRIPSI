import { test } from "node:test";
import assert from "node:assert/strict";
import { hashPin, verifyPin, isValidPin, normalizeName } from "./pin.js";

test("PIN benar lolos, PIN salah ditolak", async () => {
  const stored = await hashPin("1234");
  assert.equal(await verifyPin("1234", stored), true);
  assert.equal(await verifyPin("1235", stored), false);
  assert.equal(await verifyPin("1234", null), false);
});

test("hash tidak menyimpan PIN dalam teks polos dan selalu bergaram unik", async () => {
  const a = await hashPin("4321");
  const b = await hashPin("4321");
  assert.ok(!a.includes("4321"));
  assert.notEqual(a, b);
  assert.equal(await verifyPin("4321", b), true);
});

test("format PIN dibatasi 4-6 digit", () => {
  assert.equal(isValidPin("1234"), true);
  assert.equal(isValidPin("123456"), true);
  assert.equal(isValidPin("123"), false);
  assert.equal(isValidPin("1234567"), false);
  assert.equal(isValidPin("12a4"), false);
  assert.equal(isValidPin(1234), false);
});

test("nama dinormalisasi agar spasi ganda tidak membuat siswa kembar", () => {
  assert.equal(normalizeName("  Ani   Wulandari "), "Ani Wulandari");
});
