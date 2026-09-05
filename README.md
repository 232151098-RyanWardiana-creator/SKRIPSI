# LKPD-AI — Generator LKPD Matematika Berdiferensiasi Berbantuan AI

Web-app untuk menyusun Lembar Kerja Peserta Didik (LKPD) matematika SMP Kelas VII
berbasis **Teaching at the Right Level (TaRL)**, terintegrasi **asesmen diagnostik**
dan **gaya belajar VAK (Visual–Auditory–Kinestetik)**.

## Fitur

- **Asesmen diagnostik** — guru membuat soal per indikator (IK-01 s.d. IK-05), siswa
  mengerjakan dengan timer, sistem menskor otomatis.
- **Pemetaan TaRL berbasis indikator** — level Dasar/Menengah/Mahir ditentukan dari
  penguasaan indikator prasyarat (IK-01, IK-02) dan jumlah indikator yang dikuasai
  (ambang 60%), bukan hanya persentase skor total.
- **Generator LKPD 3 level** — AI (via 9Router) menyusun LKPD per level dengan
  penyesuaian VAK dan target indikator lemah, plus fallback offline.
- **Ekspor Word `.docx`** — persamaan matematika dikonversi ke **OMML** sehingga
  terbaca sebagai *Equation* native di Microsoft Word.
- **Rekap CSV** — unduh nilai per indikator + level TaRL untuk pengolahan data Bab IV.
- **Multi-device sync** — data kelas/asesmen/submission disinkronkan ke Supabase
  dengan cache lokal sebagai fallback offline.

## Tech Stack

- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (PostgreSQL, RLS, Realtime)
- Tailwind CSS 4, KaTeX, react-markdown
- 9Router (OpenAI-compatible) untuk generasi AI

## Persiapan

```bash
npm install
cp .env.example .env.local   # isi NINEROUTER_* dan NEXT_PUBLIC_SUPABASE_*
npm run dev
```

### Database (Supabase)

Jalankan `supabase/schema.sql` sekali untuk membuat tabel. Untuk upgrade dari skema
lama, jalankan migrasi berikut di SQL Editor:

```sql
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tanggal_mulai TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tanggal_selesai TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deskripsi TEXT;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS selesai BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS diperbarui_pada TIMESTAMPTZ;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_kelas_nama_unique') THEN
    ALTER TABLE students ADD CONSTRAINT students_kelas_nama_unique UNIQUE (kelas_id, nama);
  END IF;
END $$;
ALTER PUBLICATION supabase_realtime ADD TABLE classes, students, assessments, submissions;
```

Catatan: hapus baris duplikat `(kelas_id, nama)` di `students` sebelum constraint
unique, dan jalankan `ALTER PUBLICATION` per tabel bila ada error "already member".

Tanpa konfigurasi Supabase, aplikasi berjalan penuh dalam mode offline (localStorage).

## Skrip

```bash
npm run dev       # server pengembangan
npm run build     # build produksi
npm run lint      # ESLint
npx tsx --test src/lib/assessment-scoring.test.ts   # test formula TaRL
npx tsx src/lib/docx.selfcheck.ts                    # self-check generator .docx
```

## Struktur

- `src/app/api/ai/*` — endpoint generasi LKPD/soal + status AI.
- `src/app/api/export-docx` — konversi Markdown → `.docx` (OMML).
- `src/lib/*-store.ts` — data store (Supabase + localStorage fallback).
- `src/lib/assessment-scoring.ts` — formula TaRL per indikator.
- `src/lib/docx.ts` — generator `.docx` (ZIP + WordprocessingML + OMML).
- `src/lib/submission-csv.ts` — rekap CSV.
