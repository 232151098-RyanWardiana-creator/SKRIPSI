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
 * Memastikan lembar LKPD siswa selalu memiliki bagian ## E. Refleksi Diri Siswa.
 * Jika model AI terpotong atau lupa menulis refleksi setelah aktivitas panjang,
 * sistem otomatis menyematkan 2 pertanyaan refleksi konsep standar.
 */
export function ensureStudentReflection(student: string): string {
  if (!student || typeof student !== "string") return student;
  const hasRefleksi = /##\s*[A-Z]?\.?\s*Refleksi\s*Diri/i.test(student) || /\bRefleksi\s*Diri\s*Siswa\b/i.test(student);
  if (hasRefleksi) return student;

  const reflectionBlock = `\n\n---\n\n## E. Refleksi Diri Siswa\nJawablah pertanyaan refleksi berikut dengan jujur:\n1. Dari seluruh aktivitas yang telah kamu selesaikan, bagian konsep mana yang paling mudah dipahami dan bagian mana yang masih membutuhkan latihan tambahan? Jelaskan alasannya!\n   ................................................................................................................................\n   ................................................................................................................................\n\n2. Bagaimana konsep perbandingan/rasio dalam LKPD ini dapat membantumu mengambil keputusan dalam kehidupan sehari-hari?\n   ................................................................................................................................\n   ................................................................................................................................\n`;
  return student.trim() + reflectionBlock;
}

/**
 * Memastikan tabel identitas LKPD sesuai 100% dengan mode pengerjaan yang dipilih (Mandiri vs Kelompok)
 * Menjamin konsistensi di seluruh level (Dasar, Menengah, Mahir).
 */
export function ensureCorrectIdentityTable(
  content: string,
  isKelompok: boolean,
  jumlahAnggota: number = 4
): string {
  if (!content || typeof content !== "string") return "";

  const rowsAnggota = Array.from(
    { length: Math.max(2, jumlahAnggota) },
    (_, i) => `| ${i === 0 ? "**Anggota Kelompok**" : ""} | ${i + 1}. .................................................... (No: .....) |`
  ).join("\n");

  const groupTable = `| Komponen | Keterangan |
|---|---|
| **Kelompok** | Kelompok ........................................... |
| **Kelas** | VII-.... |
| **Hari / Tanggal** | .................................................... |
${rowsAnggota}`;

  const indivTable = `| Komponen | Keterangan |
|---|---|
| **Nama Siswa** | .................................................... |
| **Kelas / No. Absen** | VII-.... / ....... |
| **Hari / Tanggal** | .................................................... |`;

  const targetTable = isKelompok ? groupTable : indivTable;

  // Regex fleksibel mencakup ## A. Identitas Peserta Didik sampai heading berikutnya
  const identitasRegex = /(## A\.\s*Identitas Peserta Didik\s*[\r\n]+)([\s\S]*?)([\r\n]+(?:---[\r\n]+)?## B\.)/i;
  if (identitasRegex.test(content)) {
    return content.replace(identitasRegex, `$1${targetTable}\n\n$3`);
  }

  return content;
}

/**
 * Menjamin 100% struktur LKPD lengkap:
 * 1. Tabel identitas kelompok/individu sesuai pilihan
 * 2. Refleksi diri siswa (## E) terjamin ada sebelum pemisah kunci guru
 */
export function ensureFullLkpdStructure(
  content: string,
  isKelompok: boolean,
  jumlahAnggota: number = 4
): string {
  let res = ensureCorrectIdentityTable(content, isKelompok, jumlahAnggota);
  const splitIdx = res.indexOf("<!-- PEMISAH_KUNCI_GURU -->");
  if (splitIdx !== -1) {
    const student = res.slice(0, splitIdx).trim();
    const teacher = res.slice(splitIdx);
    res = `${ensureStudentReflection(student)}\n\n${teacher}`;
  } else {
    res = ensureStudentReflection(res);
  }
  return res;
}

/**
 * Kunci jawaban fallback minimal jika LLM terpotong sebelum bagian kunci.
 */
function createFallbackTeacherKey(studentContent: string, level?: string, topic?: string): string {
  const safeLevel = level ? `(Level ${level.toUpperCase()})` : "";

  return `# KUNCI JAWABAN & PANDUAN GURU ${safeLevel}

> **Kunci Jawaban Guru:** Kunci jawaban belum ter-generate secara utuh untuk level ini. Klik tombol **Regenerasi Level Ini** di atas untuk membuat ulang kunci jawaban lengkap dengan solusi numerik dan langkah matematis terperinci.`;
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
    const student = ensureStudentReflection(sanitized.slice(0, commentMatch.index).trim());
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
      const student = ensureStudentReflection(sanitized.slice(0, match.index).trim());
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

  // 3. Jika model AI tidak mengeluarkan bagian kunci jawaban terpisah:
  return {
    studentContent: ensureStudentReflection(sanitized.trim()),
    teacherKeyContent: createFallbackTeacherKey(sanitized, level, topic),
  };
}
