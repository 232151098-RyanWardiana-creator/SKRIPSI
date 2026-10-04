import { test } from "node:test";
import assert from "node:assert/strict";
import { itemLkpd, hitungTerisi } from "./lkpd-items";

test("ekstraksi sub-butir (a, b, c) dan pemisahan stimulus kontekstual", () => {
  const markdown = `
# LKPD Matematika: Rasio dan Perbandingan

## D. Kegiatan Pembelajaran

### Aktivitas 1: Resep Adonan Roti Tradisional (target: IK-01)
Seorang koki membuat adonan roti dengan perbandingan tepung terigu dan ragi adalah 2 : 3.
Berikut adalah data pengamatan bahan adonan:

| Bahan | Takaran (gram) |
| :--- | :--- |
| Tepung | 200 |
| Ragi | 300 |

Pertanyaan Pengerjaan:
a. Tuliskan bentuk perbandingan rasio tepung terhadap ragi!
b. Jika tepung 600 gram, berapa gram ragi yang diperlukan?
c. Tuliskan kesimpulan hubungan perbandingan senilai tersebut!

### Aktivitas 2: Perjalanan Sepeda Motor (target: IK-02)
Jarak dan waktu tempuh sepeda motor disajikan di bawah:
Waktu tempuh 2 jam dengan jarak 80 km.

Pertanyaan Pengerjaan:
a. Berapakah rasio kecepatan per jam?
b. Berapa jarak tempuh jika berkendara selama 5 jam?
`;

  const items = itemLkpd(null, markdown);

  assert.equal(items.length, 2);

  // Aktivitas 1
  const act1 = items[0];
  assert.equal(act1.nomor, 1);
  assert.ok(act1.pertanyaan.includes("Aktivitas 1"));
  assert.ok(act1.petunjuk?.includes("Seorang koki"));
  assert.ok(act1.petunjuk?.includes("| Tepung | 200 |"));
  // Memastikan pertanyaan tidak bocor ke dalam stimulus petunjuk
  assert.equal(act1.petunjuk?.includes("Pertanyaan Pengerjaan:"), false);

  assert.equal(act1.subItems?.length, 3);
  assert.equal(act1.subItems?.[0].kode, "a");
  assert.ok(act1.subItems?.[0].pertanyaan.includes("Tuliskan bentuk perbandingan"));
  assert.equal(act1.subItems?.[1].kode, "b");
  assert.ok(act1.subItems?.[1].pertanyaan.includes("Jika tepung 600 gram"));
  assert.equal(act1.subItems?.[2].kode, "c");
  assert.ok(act1.subItems?.[2].pertanyaan.includes("Tuliskan kesimpulan"));

  // Aktivitas 2
  const act2 = items[1];
  assert.equal(act2.nomor, 2);
  assert.equal(act2.subItems?.length, 2);
  assert.equal(act2.subItems?.[0].kode, "a");
  assert.equal(act2.subItems?.[1].kode, "b");
});

test("fallback sub-butir jika teks aktivitas tidak memiliki format a/b/c", () => {
  const markdown = `
### Aktivitas 1: Latihan Rasio Bebas
Selesaikan permasalahan rasio berikut dengan cermat dan teliti.
`;

  const items = itemLkpd(null, markdown);
  assert.equal(items.length, 1);
  assert.equal(items[0].subItems?.length, 2);
  assert.equal(items[0].subItems?.[0].kode, "a");
  assert.equal(items[0].subItems?.[1].kode, "b");
});

test("hitungTerisi menghitung progres seluruh sub-butir dengan akurat", () => {
  const markdown = `
### Aktivitas 1: Contoh
Pertanyaan Pengerjaan:
a. Pertanyaan satu
b. Pertanyaan dua
c. Pertanyaan tiga
`;
  const items = itemLkpd(null, markdown);

  // Belum ada jawaban
  let res = hitungTerisi(items, {});
  assert.equal(res.total, 3);
  assert.equal(res.terisi, 0);
  assert.equal(res.persen, 0);

  // 1 terisi
  res = hitungTerisi(items, { "aktivitas-1-a": "2 : 3" });
  assert.equal(res.total, 3);
  assert.equal(res.terisi, 1);
  assert.equal(res.persen, 33);

  // 3 terisi penuh
  res = hitungTerisi(items, {
    "aktivitas-1-a": "2 : 3",
    "aktivitas-1-b": "\\frac{600}{2} \\times 3 = 900",
    "aktivitas-1-c": "Rasio senilai konstan",
  });
  assert.equal(res.total, 3);
  assert.equal(res.terisi, 3);
  assert.equal(res.persen, 100);
});
