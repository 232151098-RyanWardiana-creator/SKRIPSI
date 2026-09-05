-- ==============================================================================
-- SKEMA DATABASE SUPABASE: GENERATOR LKPD MATEMATIKA BERDIFERENSIASI
-- Pengembang: Ryan Wardiana (Pendidikan Matematika)
-- ==============================================================================

-- 1. TABEL PROFIL GURU / USERS
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TABEL KELAS
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama TEXT NOT NULL,
    tahun_ajaran TEXT NOT NULL,
    kode_undangan TEXT UNIQUE NOT NULL,
    guru_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    wali_kelas TEXT,
    jumlah_siswa INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL SISWA
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    nama TEXT NOT NULL,
    no_absen INTEGER,
    nisn TEXT,
    level TEXT CHECK (level IN ('dasar', 'menengah', 'mahir')),
    gaya_belajar TEXT CHECK (gaya_belajar IN ('visual', 'auditory', 'kinestetik')),
    bergabung TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL ASESMEN DIAGNOSTIK
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
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL HASIL / SUBMISSION PENGERJAAN SISWA
CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asesmen_id UUID REFERENCES assessments(id) ON DELETE CASCADE NOT NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE CASCADE NOT NULL,
    siswa_id UUID REFERENCES students(id) ON DELETE CASCADE,
    nama_siswa TEXT NOT NULL,
    skor_total NUMERIC DEFAULT 0 NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('dasar', 'menengah', 'mahir')),
    gaya_belajar TEXT CHECK (gaya_belajar IN ('visual', 'auditory', 'kinestetik')),
    jawaban JSONB DEFAULT '{}'::jsonb NOT NULL,
    detail_per_indikator JSONB DEFAULT '{}'::jsonb NOT NULL,
    selesai BOOLEAN DEFAULT false,
    diperbarui_pada TIMESTAMP WITH TIME ZONE,
    dikerjakan_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL DOKUMEN LKPD YANG DIHASILKAN (RIWAYAT)
CREATE TABLE IF NOT EXISTS lkpd_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul TEXT NOT NULL,
    asesmen_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    kelas_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    kelas_nama TEXT,
    materi TEXT DEFAULT 'Bilangan Bulat',
    level TEXT NOT NULL CHECK (level IN ('dasar', 'menengah', 'mahir')),
    konten TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'validated')),
    is_fallback BOOLEAN DEFAULT false,
    dibuat_pada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- KEBIJAKAN KEAMANAN ROW LEVEL SECURITY (RLS) - PERMISIF UNTUK DEMO PUBLIK
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE lkpd_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Akses Publik profiles" ON profiles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Publik classes" ON classes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Publik students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Publik assessments" ON assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Publik submissions" ON submissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Akses Publik lkpd_documents" ON lkpd_documents FOR ALL USING (true) WITH CHECK (true);

-- Indeks Performa
CREATE INDEX IF NOT EXISTS idx_classes_kode ON classes(kode_undangan);
CREATE INDEX IF NOT EXISTS idx_students_kelas ON students(kelas_id);
CREATE INDEX IF NOT EXISTS idx_assessments_kelas ON assessments(kelas_id);
CREATE INDEX IF NOT EXISTS idx_submissions_asesmen ON submissions(asesmen_id);
CREATE INDEX IF NOT EXISTS idx_lkpd_asesmen ON lkpd_documents(asesmen_id);

-- Unique constraint idempotent untuk student (kelas + nama)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'students_kelas_nama_unique') THEN
        ALTER TABLE students ADD CONSTRAINT students_kelas_nama_unique UNIQUE (kelas_id, nama);
    END IF;
END $$;
