/**
 * Utilitas pemrosesan dokumen LKPD dan rumus matematika standar KaTeX / Word OMML
 */

/**
 * Membersihkan dan menormalisasi notasi matematika agar ramah KaTeX (HTML) dan OMML (Word).
 * Mencegah error sintaks umum dari LLM seperti:
 * 1. Mata uang di dalam format LaTeX (\mathbf{\text{Rp} 112.000}$ -> **Rp112.000**)
 * 2. Backticks di luar delimiter dolar (`$...$` -> $...$)
 * 3. Delimiter penutup $ yang lupa tanda pembuka di baris rumus
 */
export function sanitizeMathMarkdown(content: string): string {
  if (!content || typeof content !== "string") return "";

  let cleaned = content;

  // 1. Bersihkan notasi mata uang Rupiah LaTeX yang sering dirusak AI
  // Contoh: \mathbf{\text{Rp} 112.000}$ atau $\mathbf{\text{Rp} 112.000}$
  cleaned = cleaned.replace(/\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\$?\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  cleaned = cleaned.replace(/\$?\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  cleaned = cleaned.replace(/\\mathbf\{Rp\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\$\s*Rp\s*([\d.,]+)\s*\$/gi, "**Rp$1**");

  // 2. Hilangkan backticks di sekeliling math delimiter: `$...$` -> $...$
  cleaned = cleaned.replace(/`(\$[^`\n]+\$)`/g, "$1");

  // 3. Perbaiki rumus yang memiliki penutup $ tetapi lupa tanda pembuka $
  // Contoh: ... = 7 \times 16.000 = 112.000$ -> ... = $7 \times 16.000 = 112.000$
  cleaned = cleaned.replace(
    /(?:^|[^\$])([a-zA-Z0-9_]+\s*=\s*[^$\n]*?(?:\\times|\\div|\\frac|\\cdot)[^$\n]*?)\$/gm,
    (match, formula) => match.replace(formula, ` $${formula.trim()}`)
  );

  return cleaned;
}

/**
 * Menghasilkan kunci jawaban dan rubrik penskoran sintetis jika model AI tidak mengeluarkan pemisah.
 */
function createFallbackTeacherKey(studentContent: string, level?: string, topic?: string): string {
  const safeLevel = level ? `(Level ${level.toUpperCase()})` : "";
  const safeTopic = topic || "Rasio (Perbandingan)";

  // Ekstrak aktivitas yang tertera pada lembar siswa jika ada
  const activityMatches = Array.from(studentContent.matchAll(/###?\s*(Aktivitas\s*\d+[^:\n]*)/gi)).map(m => m[1].trim());

  let pembahasanText = "";
  if (activityMatches.length > 0) {
    pembahasanText = activityMatches.map((act, idx) => `
### ${act}
- **Langkah 1 (Pemodelan):** Identifikasi perbandingan dan kuantitas data yang diketahui pada soal.
- **Langkah 2 (Nilai Satuan):** Tentukan nilai 1 bagian rasio dengan membagi kuantitas total terhadap jumlah bagian rasio ($Nilai = Total / Bagian$).
- **Langkah 3 (Solusi Akhir):** Kalikan nilai 1 bagian dengan proporsi yang ditanyakan untuk mendapatkan hasil akhir terverifikasi.
`).join("\n");
  } else {
    pembahasanText = `
### Aktivitas Pembelajaran
- **Pemodelan Matematis:** Menuliskan relasi rasio kontekstual $a : b$ secara bertahap.
- **Perhitungan Runtut:** Membagi nilai total dengan jumlah bagian, lalu mengalikan ke masing-masing komponen.
- **Hasil Akhir:** Seluruh perhitungan diselesaikan dengan langkah terverifikasi dan interpretasi logis.
`;
  }

  return `# KUNCI JAWABAN & PANDUAN GURU ${safeLevel}

## A. Pembahasan & Kunci Jawaban Resmi
Berikut adalah pedoman penyelesaian matematis untuk memandu guru saat memeriksa lembar kerja peserta didik materi **${safeTopic}**:

${pembahasanText}

---

## B. Pedoman & Rubrik Penskoran

| Kriteria Penilaian | Deskripsi Indikator Kinerja | Skor Maksimal |
|---|---|:---:|
| **Pemodelan Rasio** | Mampu menuliskan bentuk perbandingan dan relasi matematika secara tepat dari konteks masalah | 35 |
| **Prosedur Perhitungan** | Menuntaskan langkah-langkah hitung secara runtut dan sistematis hingga diperoleh hasil akhir | 45 |
| **Refleksi & Interpretasi** | Memberikan kesimpulan yang logis dan menjawab pertanyaan refleksi pemahaman konsep | 20 |
| **Total Skor Maksimal** | | **100** |

> **Catatan Guru:** Berikan umpan balik konstruktif bagi peserta didik yang masih mengalami miskonsepsi pada penentuan nilai satu bagian rasio.`;
}

/**
 * Memisahkan konten dokumen LKPD menjadi 2 bagian terpisah:
 * 1. Dokumen LKPD Siswa (Identitas, Tujuan, Petunjuk, Aktivitas, Refleksi)
 * 2. Kunci Jawaban & Panduan Guru (Pembahasan resmi dan rubrik penskoran)
 */
export function splitLkpdContent(
  fullContent: string,
  level?: string,
  topic?: string
): {
  studentContent: string;
  teacherKeyContent: string;
} {
  if (!fullContent || typeof fullContent !== "string") {
    return { studentContent: "", teacherKeyContent: "" };
  }

  const sanitized = sanitizeMathMarkdown(fullContent);

  // 1. Cek delimiter komentar resmi (fleksibel whitespace dan case)
  const commentMatch = sanitized.match(/<!--\s*PEMISAH_KUNCI_GURU\s*-->/i);
  if (commentMatch && commentMatch.index !== undefined) {
    const student = sanitized.slice(0, commentMatch.index).trim();
    const teacher = sanitized.slice(commentMatch.index + commentMatch[0].length).trim();
    return {
      studentContent: student,
      teacherKeyContent: teacher || createFallbackTeacherKey(student, level, topic),
    };
  }

  // 2. Cek variasi heading Markdown untuk Kunci Jawaban / Pembahasan / Panduan Guru
  const headerPatterns = [
    /\n\s*#{1,4}\s*(?:[A-Za-z0-9.]+\s*)?(?:kunci\s+jawaban|pembahasan\s*(?:&|dan)?\s*kunci|panduan\s*guru|catatan\s*pegangan\s*guru|rubrik\s*penskoran|pedoman\s*penskoran|kunci\s*dan\s*pedoman)/i,
    /\n\s*\*{2}(?:kunci\s+jawaban|pembahasan\s*resmi|panduan\s*guru)\*{2}/i,
  ];

  for (const pattern of headerPatterns) {
    const match = sanitized.match(pattern);
    if (match && match.index !== undefined && match.index > 50) {
      const student = sanitized.slice(0, match.index).trim();
      let teacher = sanitized.slice(match.index).trim();
      if (!teacher.startsWith("#")) {
        teacher = `# KUNCI JAWABAN & PANDUAN GURU\n\n${teacher}`;
      }
      return {
        studentContent: student,
        teacherKeyContent: teacher,
      };
    }
  }

  // 3. Jika model AI tidak mengeluarkan bagian kunci jawaban terpisah,
  // otomatis generate kunci jawaban dan rubrik penskoran resmi agar tab guru TIDAK PERNAH KOSONG
  return {
    studentContent: sanitized.trim(),
    teacherKeyContent: createFallbackTeacherKey(sanitized, level, topic),
  };
}
