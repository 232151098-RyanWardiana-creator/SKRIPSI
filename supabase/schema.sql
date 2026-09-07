-- ==============================================================================
-- SKEMA DATABASE SUPABASE: GENERATOR LKPD MATEMATIKA BERDIFERENSIASI
-- Pengembang: Ryan Wardiana (232151098) - Pendidikan Matematika FKIP UNSIL
--
-- MODEL KEAMANAN (baca sebelum mengubah):
--   1. RLS aktif di semua tabel. Tidak ada satu pun policy untuk role `anon`.
--      Artinya kunci NEXT_PUBLIC_SUPABASE_ANON_KEY yang terekspos di browser
--      TIDAK bisa membaca maupun menulis data apa pun. Database bersifat privat.
--   2. Guru mengakses data sebagai role `authenticated` (login Supabase Auth).
--   3. Siswa TIDAK memakai kunci Supabase sama sekali. Seluruh lalu lintas siswa
--      lewat route handler Next.js (`/api/siswa/*`) yang memakai service role di
--      sisi server. Identitas siswa diambil dari cookie httpOnly, bukan dari
--      input klien, sehingga siswa A tidak dapat menulis atas nama siswa B.
--
-- Script ini idempoten: aman dijalankan berulang di SQL Editor Supabase.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROFIL GURU (terhubung ke Supabase Auth)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    nama TEXT NOT NULL,
    gelar TEXT,
    nip TEXT,
    sekolah TEXT,
    mata_pelajaran TEXT DEFAULT 'Matematika',
    fase_jenjang TEXT DEFAULT 'Fase D (SMP Kelas VII)',
    kurikulum TEXT DEFAULT 'Kurikulum Merdeka',
    alamat_sekolah TEXT,
    no_hp TEXT,
    model_ai TEXT DEFAULT 'cx/gpt-5.6-sol (9Router Lokal)',
    export_format TEXT DEFAULT 'word',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 2. KELAS
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    kode_undangan TEXT UNIQUE NOT NULL,
    guru_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wali_kelas TEXT,
    jumlah_siswa INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 3. SISWA
--    pin_hash: PIN 4-6 digit milik siswa, di-hash scrypt di sisi server.
--    Nama diklaim sekali pada login pertama, lalu terkunci oleh PIN tersebut.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    nama TEXT NOT NULL,
    no_absen INTEGER,
    nisn TEXT,
    level TEXT CHECK (level IN ('dasar', 'menengah', 'mahir')),
    gaya_belajar TEXT CHECK (gaya_belajar IN ('visual', 'auditory', 'kinestetik')),
    pin_hash TEXT,
    pin_diperbarui_pada TIMESTAMPTZ,
    bergabung TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_hash TEXT;
ALTER TABLE students ADD COLUMN IF NOT EXISTS pin_diperbarui_pada TIMESTAMPTZ;

-- Kolom turunan agar layar guru bisa tahu siapa yang sudah punya PIN tanpa
-- pernah mengirim hash PIN ke browser.
ALTER TABLE students ADD COLUMN IF NOT EXISTS punya_pin BOOLEAN
    GENERATED ALWAYS AS (pin_hash IS NOT NULL) STORED;

-- ------------------------------------------------------------------------------
-- 4. SESI SISWA
--    Token opaque acak yang disimpan pada cookie httpOnly. Guru dapat mencabut
--    sesi dengan menghapus baris di sini (mis. siswa lupa logout di HP orang).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_sessions (
    token TEXT PRIMARY KEY,
    siswa_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    kedaluwarsa_pada TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ------------------------------------------------------------------------------
-- 5. ASESMEN DIAGNOSTIK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    materi TEXT NOT NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    kode_kelas TEXT NOT NULL,
    durasi_menit INTEGER DEFAULT 30 NOT NULL,
    status TEXT DEFAULT 'aktif' CHECK (status IN ('draft', 'aktif', 'selesai')),
    kuesioner_aktif BOOLEAN DEFAULT true,
    soal JSONB DEFAULT '[]'::jsonb NOT NULL,
    tanggal_mulai TEXT,
    tanggal_selesai TEXT,
    deskripsi TEXT,
    dibuat_pada TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tanggal_mulai TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS tanggal_selesai TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS deskripsi TEXT;
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS kuesioner_aktif BOOLEAN DEFAULT true;

-- ------------------------------------------------------------------------------
-- 6. HASIL PENGERJAAN ASESMEN DIAGNOSTIK
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asesmen_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    siswa_id UUID REFERENCES students(id) ON DELETE CASCADE,
    nama_siswa TEXT NOT NULL,
    skor_total NUMERIC DEFAULT 0 NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('dasar', 'menengah', 'mahir')),
    gaya_belajar TEXT CHECK (gaya_belajar IN ('visual', 'auditory', 'kinestetik')),
    jawaban JSONB DEFAULT '{}'::jsonb NOT NULL,
    detail_per_indikator JSONB DEFAULT '{}'::jsonb NOT NULL,
    selesai BOOLEAN DEFAULT false,
    diperbarui_pada TIMESTAMPTZ,
    dikerjakan_pada TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE submissions ADD COLUMN IF NOT EXISTS selesai BOOLEAN DEFAULT false;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS diperbarui_pada TIMESTAMPTZ;

-- ------------------------------------------------------------------------------
-- 7. DOKUMEN LKPD HASIL GENERATE AI
--    `soal` menampung butir LKPD terstruktur agar siswa dapat mengisinya
--    langsung di aplikasi (dasbor pengisian LKPD).
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkpd_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    asesmen_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    kelas_nama TEXT,
    materi TEXT DEFAULT 'Bilangan Bulat',
    level TEXT NOT NULL CHECK (level IN ('dasar', 'menengah', 'mahir')),
    konten TEXT NOT NULL,
    soal JSONB DEFAULT '[]'::jsonb NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated')),
    dibagikan BOOLEAN DEFAULT false,
    model TEXT,
    is_fallback BOOLEAN DEFAULT false,
    divalidasi_pada TIMESTAMPTZ,
    dibuat_pada TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE lkpd_documents ADD COLUMN IF NOT EXISTS soal JSONB DEFAULT '[]'::jsonb NOT NULL;
ALTER TABLE lkpd_documents ADD COLUMN IF NOT EXISTS dibagikan BOOLEAN DEFAULT false;
ALTER TABLE lkpd_documents ADD COLUMN IF NOT EXISTS model TEXT;
ALTER TABLE lkpd_documents ADD COLUMN IF NOT EXISTS divalidasi_pada TIMESTAMPTZ;

-- ------------------------------------------------------------------------------
-- 8. PENGISIAN LKPD OLEH SISWA + PENILAIAN GURU
--
--    INTEGRITAS DATA PENELITIAN (jangan dilonggarkan):
--    `jawaban` HANYA boleh ditulis oleh siswa pemilik baris ini. AI maupun guru
--    tidak menimpanya. Koreksi/umpan balik AI ditulis ke `umpan_balik_ai`, nilai
--    dan catatan guru ke `nilai` / `catatan_guru`. Dengan begitu jawaban asli
--    siswa tetap utuh sebagai data mentah penelitian.
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS lkpd_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lkpd_id UUID REFERENCES lkpd_documents(id) ON DELETE CASCADE NOT NULL,
    siswa_id UUID REFERENCES students(id) ON DELETE CASCADE NOT NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    nama_siswa TEXT NOT NULL,
    jawaban JSONB DEFAULT '{}'::jsonb NOT NULL,
    status TEXT DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'terkirim', 'dinilai')),
    nilai NUMERIC CHECK (nilai IS NULL OR (nilai >= 0 AND nilai <= 100)),
    catatan_guru TEXT,
    umpan_balik_ai JSONB,
    dikirim_pada TIMESTAMPTZ,
    dinilai_pada TIMESTAMPTZ,
    dinilai_oleh UUID REFERENCES profiles(id) ON DELETE SET NULL,
    diperbarui_pada TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY
-- ==============================================================================

ALTER TABLE profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE students          ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_sessions  ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpd_documents    ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpd_submissions  ENABLE ROW LEVEL SECURITY;

-- Buang seluruh policy lama (termasuk policy permisif "Akses Publik ... USING (true)"
-- dari versi sebelumnya) agar tidak ada celah yang tertinggal.
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT schemaname, tablename, policyname
        FROM pg_policies
        WHERE schemaname = 'public'
          AND tablename IN ('profiles', 'classes', 'students', 'student_sessions',
                            'assessments', 'submissions', 'lkpd_documents',
                            'lkpd_submissions')
    LOOP
        EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Guru yang sudah login (role `authenticated`) mendapat akses penuh.
-- Tidak ada policy untuk `anon`: kunci publik di browser tidak bisa apa-apa.
DO $$
DECLARE
    t TEXT;
BEGIN
    FOREACH t IN ARRAY ARRAY['profiles', 'classes', 'students', 'assessments',
                             'submissions', 'lkpd_documents', 'lkpd_submissions']
    LOOP
        EXECUTE format(
            'CREATE POLICY %I ON public.%I FOR ALL TO authenticated USING (true) WITH CHECK (true)',
            'guru_akses_penuh_' || t, t
        );
    END LOOP;
END $$;

-- student_sessions sengaja tanpa policy sama sekali: hanya service role
-- (server Next.js) yang boleh menyentuhnya.

-- Cabut hak bawaan role anon pada level SQL sebagai lapis kedua di luar RLS.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;

-- Pastikan guru (authenticated) dan server Next.js (service_role) tetap punya hak
-- tabel; RLS di atas yang membatasi barisnya.
GRANT ALL ON ALL TABLES    IN SCHEMA public TO authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, service_role;

-- ==============================================================================
-- INDEKS & CONSTRAINT
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_classes_kode            ON classes(kode_undangan);
CREATE INDEX IF NOT EXISTS idx_students_kelas          ON students(kelas_id);
CREATE INDEX IF NOT EXISTS idx_sessions_siswa          ON student_sessions(siswa_id);
CREATE INDEX IF NOT EXISTS idx_sessions_kedaluwarsa    ON student_sessions(kedaluwarsa_pada);
CREATE INDEX IF NOT EXISTS idx_assessments_kelas       ON assessments(kelas_id);
CREATE INDEX IF NOT EXISTS idx_submissions_asesmen     ON submissions(asesmen_id);
CREATE INDEX IF NOT EXISTS idx_submissions_siswa       ON submissions(siswa_id);
CREATE INDEX IF NOT EXISTS idx_lkpd_asesmen            ON lkpd_documents(asesmen_id);
CREATE INDEX IF NOT EXISTS idx_lkpd_kelas_level        ON lkpd_documents(kelas_id, level);
CREATE INDEX IF NOT EXISTS idx_lkpd_sub_lkpd           ON lkpd_submissions(lkpd_id);
CREATE INDEX IF NOT EXISTS idx_lkpd_sub_siswa          ON lkpd_submissions(siswa_id);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_kelas_nama_unique') THEN
        ALTER TABLE students ADD CONSTRAINT students_kelas_nama_unique UNIQUE (kelas_id, nama);
    END IF;
    -- Satu siswa hanya punya satu baris pengerjaan per asesmen.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'submissions_asesmen_siswa_unique') THEN
        ALTER TABLE submissions ADD CONSTRAINT submissions_asesmen_siswa_unique UNIQUE (asesmen_id, siswa_id);
    END IF;
    -- Satu siswa hanya punya satu baris pengisian per LKPD.
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'lkpd_submissions_lkpd_siswa_unique') THEN
        ALTER TABLE lkpd_submissions ADD CONSTRAINT lkpd_submissions_lkpd_siswa_unique UNIQUE (lkpd_id, siswa_id);
    END IF;
END $$;
