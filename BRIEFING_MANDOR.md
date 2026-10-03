# BRIEFING MANDOR & ARSITEKTUR ORKESTRASI
## Sinkronisasi Teknis Web LKPD AI (`lkpd-ai`) dengan Naskah Proposal Skripsi

**Dokumen Rujukan:** Revisi Naskah Proposal Bab 1–3, Pedoman Pembelajaran dan Asesmen BSKAP 2024, Kerangka Teoretis TaRL (Gambar 6.1).  
**Status Naskah Proposal:** DITUNDA TOTAL (Freeze / Jangan Sentuh Berkas Proposal DOCX/PDF).  
**Fokus Utama:** Implementasi Teknis Aplikasi Web Next.js 15 (`lkpd-ai`).

---

## 1. STRUKTUR PERAN & ALUR KERJA DINAMIS

Sesi pengembangan menggunakan model kolaborasi berjenjang untuk menjaga efisiensi pool sewa 10M token (Claude API di `https://ai.ipeenk.com/v1`) dan memaksimalkan kuota gratis 9Router lokal.

```
       ┌──────────────────────────────────────────────────────────┐
       │                 MANDOR / ARSITEK UTAMA                   │
       │    (Claude 3.7 Sonnet / Model Flagship Tertinggi)        │
       │  • Merancang arsitektur data & kontrak antarmuka         │
       │  • Merumuskan spesifikasi prompt generator TaRL          │
       │  • Mendefinisikan Work Packages (WP) berbutir mikro      │
       │  • DILARANG mengetik kode implementasi panjang           │
       │  • Melakukan quality gate & verifikasi lint/build        │
       └─────────────────────────────┬────────────────────────────┘
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
  ┌───────────────────────────────┐     ┌────────────────────────────────┐
  │   PELAKSANA 1: KULI SEWAAN    │     │   PELAKSANA 2: KULI GRATIS     │
  │   (Claude 3.5 Haiku di        │     │   (9Router Combos / Local)     │
  │    https://ai.ipeenk.com/v1)  │     │   • ANTIGRAVITY (Gemini 2.5)   │
  │  • Tugas logika presisi       │     │   • Free-AI / ATRIA / XIRO     │
  │  • OMML XML Parser engine     │     │   • Tugas refactor teks/label  │
  │  • Strict math prompt sync    │     │   • Update UI komponen/views   │
  └───────────────────────────────┘     └────────────────────────────────┘
```

### Aturan Operasional Mandor & Pelaksana:
1. **Mandor (Arsitek):**
   - Menghasilkan blueprint, skema JSON, tipe data TypeScript, dan tes assertion mandiri.
   - Tidak membakar token flagship untuk menulis repetisi markup HTML/JSX atau boilerplate.
   - Menginspeksi hasil keluaran sub-model, menguji integritas, dan menyetujui commit.
2. **Pelaksana / Sub-Model:**
   - Menerima 1 (satu) Work Package spesifik per eksekusi.
   - Wajib mematuhi file target, batasan baris, dan skema kontrak yang telah digariskan Mandor.
   - Dilarang membuat file cabang atau refaktor di luar cakupan Work Package.

---

## 2. DAFTAR MODEL & ENDPOINT YANG TERSEDIA

### A. Endpoint Sewa (10M Token Pool — Kuota 24 Jam)
* **Base URL:** `https://ai.ipeenk.com/v1`
* **Protokol:** Anthropic Claude / OpenAI Compatible
* **Alokasi Model:**
  | Model ID | Peran | Alasan Penggunaan |
  |---|---|---|
  | `claude-3-7-sonnet-20250219` / `claude-3-5-sonnet-20241022` | **Mandor / Arsitek** | Penalaran tingkat tinggi, arsitektur sistem, validasi matematis & skema prompt. |
  | `claude-3-5-haiku-20241022` | **Pelaksana Utama (Kuli Cerdas)** | Penulisan algoritma parser OMML, penataan fungsi kritis, sangat hemat token. |

### B. Endpoint 9Router Lokal (Gratis & Bebas Kuota Eksternal)
* **Base URL:** `http://localhost:20128/v1` (Proxy Lokal)
* **Header Auth:** Token internal 9Router (`x-9r-cli-token` / API key lokal)
* **Pilihan Combo Aktif:**
  | Nama Combo | Model Unggulan | Alokasi Tugas |
  |---|---|---|
  | `ANTIGRAVITY` | `gemini-2.5-pro`, `gemini-2.5-flash` | Batch refactoring UI komponen, label kesiapan belajar, verifikasi form. |
  | `Free-AI` | `kimi-k2.5`, `deepseek-v3`, `glm-4` | Pengolahan teks deskripsi, sinkronisasi mock data, kamus indikator. |
  | `XIRO` / `ATRIA` | `claude-3-5-haiku`, `gpt-4o-mini` | Unit self-check script, sinkronisasi helper utilities. |

---

## 3. AUDIT DIFF LENGKAP: KODE SAAT INI VS KEBUTUHAN NASKAH

### PILAR 1: Nomenklatur & Variabel ("Asesmen Diagnostik" ➔ "Kesiapan Belajar Siswa")
* **Dasar Teori Naskah (BSKAP 2024):**
  Tes diagnostik di awal pembelajaran bukan untuk memberi label permanen atau vonis nilai rapor, melainkan untuk mengidentifikasi tingkat **Kesiapan Belajar Siswa (*Readiness*)** materi rasio agar guru dapat memetakan siswa ke dalam 3 kelompok pembelajaran berdiferensiasi pendekatan TaRL (*Teaching at the Right Level*).
* **Tabel Analisis Diff:**

| Berkas Sumber | Kondisi Kode Saat Ini (As-Is) | Target Sinkronisasi Naskah (To-Be) | Tindakan |
|---|---|---|---|
| `src/types/index.ts` | Tipe level: `"dasar" \| "menengah" \| "mahir"`. Tipe tes masih berlabel kaku asesmen diagnostik tanpa atribut kesiapan belajar resmi. | Tetap pertahankan enum value internal `"dasar" \| "menengah" \| "mahir"` (demi kestabilan database), namun tambahkan label kurikuler resmi BSKAP: **Perlu Bimbingan** (Dasar), **Berkembang / Cukup** (Menengah), dan **Mahir** (Lanjut). Tambahkan metadata `readiness_category`. | Tambah interface & type helper di `src/types/index.ts`. |
| `src/lib/assessment-scoring.ts` | Mengonversi skor 0–100 ke `"dasar"`, `"menengah"`, `"mahir"`. Ambang batas: `<60` dasar, `60-79` menengah, `>=80` mahir. | Rumus rentang skor sudah selaras dengan naskah Bab 2 & Instrumen 04, namun perlu menambahkan fungsi konversi ke label pedagogis resmi: `getReadinessCategory(score)` ➔ `"Perlu Bimbingan"`, `"Berkembang"`, `"Mahir"`. | Tambah helper mapping resmi kurikulum merdeka. |
| `src/components/forms/GeneratorWizard.tsx` | Label tab: `labels = { dasar: "Dasar", menengah: "Menengah", mahir: "Mahir" }`. Header masih menyebut "Asesmen Diagnostik". | Label tab diperjelas: `"Perlu Bimbingan (Dasar)"`, `"Berkembang (Menengah)"`, `"Mahir (Lanjut)"`. Judul dan konteks input diselaraskan ke "Pemetaan Kesiapan Belajar Siswa (TaRL)". | Update label UI pada wizard generator. |
| `src/app/(guru)/asesmen/hasil/page.tsx` | Judul: "Hasil Asesmen". Card ringkasan level: `dasar`, `menengah`, `mahir`. | Judul: "Profil Kesiapan Belajar Siswa". Tambahkan keterangan kurikuler: Tier 1 (Perlu Bimbingan), Tier 2 (Berkembang), Tier 3 (Mahir) beserta rekomendasi diferensiasi konten LKPD. | Update teks UI dan kartu distribusi. |
| `src/components/layout/Navbar.tsx` & Dashboard | Navigasi menyebut "Asesmen". | Sinkronkan sub-label menu: "Kesiapan Belajar (Asesmen)" agar selaras dengan terminologi skripsi. | Update navigasi. |

---

### PILAR 2: Format Prompt Generator 3 Level TaRL & Kaidah Matematika
* **Dasar Teori Naskah (Kerangka Teoretis Gambar 6.1 & Pedoman BSKAP):**
  1. **Tier 1 — Perlu Bimbingan (Dasar, Skor 0–59 / < 60%):**
     * *Karakteristik Siswa:* Belum menguasai prasyarat pecahan senilai dan perkalian/pembagian dasar rasio (IK-01/IK-02). Rawan mengalami miskonsepsi aditif (menganggap rasio bertambah dengan selisih tetap, bukan faktor pengali konstan).
     * *Format Prompt LKPD:* **High Scaffolding & Representasi Konkret**. Panduan langkah demi langkah terstruktur, penggunaan tabel rasio perbandingan bertahap, garis bilangan berpasangan atau blok visual titik (`● ● ●`). Ruang pengerjaan siswa berupa titik-titik isian terbimbing (`......`) tanpa memberi tahu jawaban langsung.
  2. **Tier 2 — Berkembang / Cukup (Menengah, Skor 60–79 / 60% s.d. 79%):**
     * *Karakteristik Siswa:* Menguasai konsep dasar pecahan dan rasio sederhana, namun memerlukan jembatan bantuan untuk menyelesaikan masalah kontekstual bertingkat atau cerita multi-tahap.
     * *Format Prompt LKPD:* **Fading Guidance & Representasi Semi-Konkret**. Bantuan panduan mulai dikurangi, fokus pada aplikasi dunia nyata sehari-hari (resep masakan, skala denah, perbandingan kecepatan dan waktu tempuh, konversi bahan).
  3. **Tier 3 — Mahir (Lanjut, Skor 80–100 / ≥ 80%):**
     * *Karakteristik Siswa:* Menguasai seluruh indikator kompetensi (IK-01 s.d. IK-05), memiliki daya abstraksi tinggi dan penalaran proporsional relasional yang matang.
     * *Format Prompt LKPD:* **Independent Learning & Tantangan HOTS**. Tidak ada scaffolding dasar. Diberikan masalah non-rutin terbuka (*open-ended problem*), perbandingan multi-variabel, analisis kritis strategi pemecahan masalah (C4–C6), serta investigasi matematis mandiri.
* **Standar Penulisan Matematika (Pedoman Human-Readable & Anti-Bocor):**
  - **Penyelesaian Bertahap Mutlak:** Setiap pembahasan/kunci guru wajib mengikuti 4 tahap runtut:
    1. Rumus umum dengan variabel: $\text{Kecepatan} = \dfrac{\text{Jarak}}{\text{Waktu}}$ atau $\dfrac{a_1}{b_1} = \dfrac{a_2}{b_2}$.
    2. Identifikasi nilai variabel yang diketahui: $a_1 = 4$, $b_1 = 6$, $a_2 = 10$.
    3. Substitusi nilai ke dalam rumus secara bertahap.
    4. Perhitungan numerik hingga jawaban akhir ditebalkan (**hasil akhir**).
  - **Larangan Kebocoran Syntax:** Dilarang keras menampilkan delimiter mentah LaTeX seperti `\frac`, `\times`, `$$` dalam teks bebas tanpa diparsing. Di web dirender KaTeX, di Word diekspor ke OMML native.

---

### PILAR 3: Pembenahan Export MathML / OMML DOCX (`src/lib/docx.ts`)
* **Kondisi Kode Saat Ini:**
  Fungsi `latexToOmml` di `src/lib/docx.ts` menggunakan pencocokan regex dan cursor kustom sederhana. Fungsi ini rentan jika menemui:
  - Spasi di antara tanda kurung kurawal `\frac { a } { b }` atau spasi setelah operator.
  - Simbol relasi/aritmatika yang sering muncul di rasio: `\approx`, `\times`, `\div`, `\pm`, `\neq`, `\le`, `\ge`, `\ratio` (titik dua $:$), `\dots`.
  - Teks deskriptif di dalam rumus seperti `\text{liter}` atau `\text{km/jam}`.
  - Pecahan bersarang atau tanda kurung proporsi.
* **Target Perbaikan:**
  - Bangun parser tokenizer yang tangguh untuk LaTeX inline `$..$` dan display `$$..$$` ke struktur OpenXML Office Math (`<m:oMath>` / `<m:oMathPara>`).
  - Mendukung struktur fraksi `<m:f>`, akar `<m:rad>`, pangkat `<m:sSup>`, indeks `<m:sSub>`, operator berjarak rapi `<m:r>`, dan teks biasa di dalam rumus.
  - Memastikan seluruh dokumen DOCX hasil ekspor valid 100% saat dibuka di Microsoft Word tanpa pesan perbaikan berkas (*corrupt document alert*).

---

## 4. BREAKDOWN PAKET KERJA (WORK PACKAGES)

### [WP-01] Standarisasi Nomenklatur & Kontrak Data Kesiapan Belajar
* **Penanggung Jawab:** Sub-Model Pelaksana (Free-AI / Gemini Flash / Claude Haiku).
* **Berkas:** `src/types/index.ts`, `src/lib/assessment-scoring.ts`.
* **Rincian Tugas:**
  1. Tambahkan konstanta kamus kurikuler resmi BSKAP 2024:
     ```typescript
     export const KESIAPAN_BELAJAR_LABELS: Record<Level, {
       kategori: string;
       tier: string;
       rentang: string;
       rekomendasiLkpd: string;
     }> = {
       dasar: {
         kategori: "Perlu Bimbingan",
         tier: "Tier 1",
         rentang: "0 - 59 Poin (< 60%)",
         rekomendasiLkpd: "LKPD Varian A (Scaffolding Tinggi & Terstruktur)"
       },
       menengah: {
         kategori: "Berkembang / Cukup",
         tier: "Tier 2",
         rentang: "60 - 79 Poin (60% s.d. 79%)",
         rekomendasiLkpd: "LKPD Varian B (Fading Guidance & Latihan Kontekstual)"
       },
       mahir: {
         kategori: "Mahir",
         tier: "Tier 3",
         rentang: "80 - 100 Poin (≥ 80%)",
         rekomendasiLkpd: "LKPD Varian C (Tantangan HOTS & Eksplorasi Mandiri)"
       }
     };
     ```
  2. Tambahkan helper `getReadinessInfo(score: number)` di `src/lib/assessment-scoring.ts`.

---

### [WP-02] Restrukturisasi Prompt Engine 3 Level TaRL di `src/lib/ai.ts`
* **Penanggung Jawab:** Sub-Model Pelaksana (Claude 3.5 Haiku via `https://ai.ipeenk.com/v1`).
* **Berkas:** `src/lib/ai.ts`.
* **Rincian Tugas:**
  1. Perbarui `levelKeterangan` pada fungsi `generateLKPD` agar mendiktekan karakteristik pedagogis TaRL:
     - `dasar`: Pendekatan konkret, scaffolding terstruktur tinggi, memecah langkah kerja menjadi isian titik-titik tanpa membocorkan jawaban, tabel perbandingan berpasangan, pencegahan miskonsepsi aditif.
     - `menengah`: Pendekatan semi-konkret, fading guidance, masalah kontekstual nyata bertingkat (resep, skala peta, konsentrasi cairan), instruksi semi-terbimbing.
     - `mahir`: Pendekatan abstrak analitis, tantangan HOTS (C4–C6), masalah terbuka (*open-ended non-routine*), penalaran matematis mendalam, tanpa scaffolding awal.
  2. Pertegas aturan penyelesaian bertahap pada sistem prompt (Rumus bervariabel ➔ Identifikasi nilai ➔ Substitusi ➔ Perhitungan hasil akhir).
  3. Perbarui `system` prompt pada generator butir soal diagnostik agar selaras dengan kisi-kisi Instrumen 04 rasio kelas VII.

---

### [WP-03] Penguatan Engine Export OMML / MathML DOCX di `src/lib/docx.ts`
* **Penanggung Jawab:** Sub-Model Pelaksana (Claude 3.5 Haiku / XIRO).
* **Berkas:** `src/lib/docx.ts`, `src/lib/docx.selfcheck.ts`.
* **Rincian Tugas:**
  1. Perluas kamus simbol dan operator matematika pada `operators` (`\approx`, `\neq`, `\times`, `\div`, `\cdot`, `\le`, `\ge`, dsb.).
  2. Perbaiki fungsi `group` dan pemotongan spasi agar tahan terhadap spasi acak pada `\frac  { ... }  { ... }` dan `\text{ ... }`.
  3. Tangani format rasio titik dua $a : b$ agar dirender sebagai operator proporsi rapi di Word Equation.
  4. Jalankan verifikasi mandiri via `docx.selfcheck.ts` untuk memastikan tidak ada tag XML yang pincang (*malformed XML*).

---

### [WP-04] Penyelarasan Antarmuka Pengguna (UI/UX Kesiapan Belajar)
* **Penanggung Jawab:** Sub-Model Pelaksana (ANTIGRAVITY / Gemini 2.5 Flash / Free-AI).
* **Berkas:** `src/components/forms/GeneratorWizard.tsx`, `src/app/(guru)/asesmen/hasil/page.tsx`, `src/app/(guru)/dashboard/page.tsx`.
* **Rincian Tugas:**
  1. Pada `GeneratorWizard.tsx`: Perbarui label tab pilihan level menjadi:
     - `"Perlu Bimbingan (Dasar)"`
     - `"Berkembang (Menengah)"`
     - `"Mahir (Lanjut)"`
  2. Pada `src/app/(guru)/asesmen/hasil/page.tsx`: Ganti judul dan header menjadi **Profil Kesiapan Belajar Siswa (TaRL)**, tampilkan kartu rekapitulasi 3 Tier dengan badge warna yang jelas.
  3. Pastikan tidak ada regresi tampilan atau *broken links*.

---

### [WP-05] Quality Assurance, Build Validation & Automated Smoke Testing
* **Penanggung Jawab:** Mandor / Arsitek Utama.
* **Berkas:** Seluruh proyek (`npm run lint`, `node check`, export sample docx).
* **Kriteria Keberhasilan:**
  1. `npm run lint` lolos 0 error.
  2. Engine generator mampu menghasilkan payload LKPD untuk ketiga level dengan pembeda karakteristik yang nyata.
  3. Dokumen Word DOCX hasil unduhan memiliki rumus matematika asli Microsoft Office Math (OMML) yang dapat diedit (*editable equation*), bukan gambar buram atau teks LaTeX mentah.

---

## 5. CATATAN KHUSUS UNTUK SUB-MODEL PELAKSANA

1. **Jaga Kebersihan Git:** Dilarang membuat file sementara di luar folder yang ditentukan. Jangan menambah dependency `package.json` baru jika fungsi native / stdlib TypeScript sudah mencukupi (prinsip YAGNI & Lazy Senior Developer).
2. **Keamanan Kunci API:** Jangan pernah mencetak isi file `.env` atau credential key apa pun ke dalam log maupun dokumen publik.
3. **Format Matematika:** Semua rumus matematika di dalam teks LKPD wajib diapit tanda dolar `$ ... $` untuk inline dan `$$ ... $$` untuk display block. Dilarang meninggalkan kode LaTeX telanjang seperti `\frac{1}{2}` di luar tanda dolar.
