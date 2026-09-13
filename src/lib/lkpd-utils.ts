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

  // 1. Perbaiki artefak subscript markdown: e.g. "t $_ $a" -> "t_{a}", "v $_ $2" -> "v_{2}"
  cleaned = cleaned.replace(/([a-zA-Z])\s*\$_\s*\$([a-zA-Z0-9]+)/g, "$1_{$2}");
  cleaned = cleaned.replace(/([a-zA-Z])\s*\\_\s*([a-zA-Z0-9]+)/g, "$1_{$2}");

  // 2. Bersihkan notasi mata uang Rupiah LaTeX yang sering dirusak AI
  cleaned = cleaned.replace(/\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\$?\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  cleaned = cleaned.replace(/\$?\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  cleaned = cleaned.replace(/\\mathbf\{Rp\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  cleaned = cleaned.replace(/\$\s*Rp\s*([\d.,]+)\s*\$/gi, "**Rp$1**");

  // 3. Normalisasi mata uang di dalam rumus matematika: \text{Rp16.000.000} -> \text{Rp } 16.000.000
  cleaned = cleaned.replace(/\\text\{Rp\s*(\d[\d.,]*)\}/gi, "\\text{Rp } $1");

  // 4. Hilangkan backticks di sekeliling math delimiter: `$...$` -> $...$
  cleaned = cleaned.replace(/`(\$[^`\n]+\$)`/g, "$1");

  // 5. Bungkus formula yang diawali \text{...} atau variabel = \frac{...} dan berujung $ tanpa pembuka
  // Contoh: \text{Modal Pak Joko} = \frac{......}{......} \times \text{Rp 16.000.000} = Rp..................$
  cleaned = cleaned.replace(
    /(?:^|(?<=[:\n\s]))((?:\\text\{[^}]*\}|[a-zA-Z0-9_{}\s]+)\s*=\s*(?:\\frac\{|\\dfrac\{)[^\n$]*?)(?:\$|\n|$)/g,
    (match, formula) => {
      const clean = formula.replace(/\$/g, "").trim();
      return ` $${clean}$ `;
    }
  );

  // 6. Bungkus persamaan bare \frac{...}{...} yang sama sekali belum memiliki tanda dolar
  // Contoh: " = \frac{\dots}{\dots} = \dots\text{ jam}"
  cleaned = cleaned.replace(
    /(?:^|[^\$])((?:[a-zA-Z0-9_{}]+\s*=\s*)?(?:\\frac\{|\\dfrac\{)(?:[^{}]*|\{[^{}]*\})*\}(?:[^{}]*|\{[^{}]*\})*(?:\s*(?:=|\times|\div|\+|-)\s*(?:[^\s,;:()\[\]\n]|\s(?![a-z]{3,}))*)*)(?:\$|\n|$)/g,
    (match, formula) => {
      if (!formula || formula.includes("$")) return match;
      const clean = formula.trim();
      return match.replace(formula, ` $${clean}$ `);
    }
  );

  // 7. Ubah \frac menjadi \dfrac saat berada di dalam formula KaTeX agar pembilang & penyebut memiliki spasi vertikal lapang dan tidak menabrak garis
  cleaned = cleaned.replace(/(\$(?!\$)[^\$\n]*?)\\frac\{/g, "$1\\dfrac{");
  cleaned = cleaned.replace(/(\$\$[\s\S]*?)\\frac\{/g, "$1\\dfrac{");

  // 8. Bersihkan spasi ganda
  cleaned = cleaned.replace(/ {2,}/g, " ");

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

/**
 * Membangun draf cadangan kontekstual dinamis jika koneksi AI gagal,
 * 100% patuh pada jumlah aktivitas (1-6) dan mode pengerjaan (kelompok/individu).
 */
export function createDynamicFallbackLKPD(
  level: string,
  topik: string,
  jumlahAktivitas: number,
  modePengerjaan: "individu" | "kelompok" = "individu",
  jumlahAnggota: number = 4
): string {
  const count = Math.min(6, Math.max(1, jumlahAktivitas));
  const n1 = Math.floor(Math.random() * 4) + 2;
  const n2 = n1 + Math.floor(Math.random() * 3) + 2;
  const mult = Math.floor(Math.random() * 5) + 3;

  const allActivities = [
    {
      title: "Aktivitas 1: Resep Adonan Tradisional (target: IK-01)",
      problem: `Seorang koki membuat adonan dengan rasio bahan A dan bahan B adalah $${n1} : ${n2}$. Jika total campuran kedua bahan adalah $${(n1 + n2) * mult * 40}\\text{ gram}$, berapakah gram bahan A yang digunakan?`,
      answer: `Rasio A : B = $${n1} : ${n2}$. Total bagian = $${n1 + n2}$. Nilai 1 bagian = $${(n1 + n2) * mult * 40}\\text{ g} \\div ${n1 + n2} = ${mult * 40}\\text{ g}$. Bahan A = $${n1} \\times ${mult * 40}\\text{ g} = \\mathbf{${n1 * mult * 40}\\text{ gram}}$.`,
    },
    {
      title: "Aktivitas 2: Perbandingan Senilai Belanja Bahan (target: IK-02)",
      problem: `Untuk membeli $4\\text{ kg}$ bahan pokok, seorang pembeli membayar **Rp${(4 * (mult + 5) * 2000).toLocaleString("id-ID")}**. Berapakah biaya yang harus dibayar jika pembeli membutuhkan $7\\text{ kg}$ bahan pokok?`,
      answer: `Harga per kilogram = **Rp${(4 * (mult + 5) * 2000).toLocaleString("id-ID")}** $\\div 4$ = **Rp${((mult + 5) * 2000).toLocaleString("id-ID")}**. Biaya untuk $7\\text{ kg}$ = $7 \\times$ **Rp${((mult + 5) * 2000).toLocaleString("id-ID")}** = **Rp${(7 * (mult + 5) * 2000).toLocaleString("id-ID")}**.`,
    },
    {
      title: "Aktivitas 3: Skala Peta dan Denah Rumah (target: IK-03)",
      problem: `Pada denah berskala $1 : 200$, panjang sebuah ruang adalah $${mult + 3}\\text{ cm}$. Berapakah panjang sebenarnya ruang tersebut dalam meter?`,
      answer: `Panjang sebenarnya = $${mult + 3}\\text{ cm} \\times 200 = ${(mult + 3) * 200}\\text{ cm} = \\mathbf{${((mult + 3) * 200) / 100}\\text{ meter}}$.`,
    },
    {
      title: "Aktivitas 4: Laju Kecepatan dan Jarak Tempuh (target: IK-04)",
      problem: `Sebuah mobil melaju dengan kecepatan rata-rata $60\\text{ km/jam}$ selama $${mult - 1 || 2}\\text{ jam}$. Berapakah jarak yang ditempuh mobil tersebut?`,
      answer: `Jarak = kecepatan $\\times$ waktu = $60 \\times ${mult - 1 || 2} = \\mathbf{${60 * (mult - 1 || 2)}\\text{ km}}$.`,
    },
    {
      title: "Aktivitas 5: Eksplorasi Rasio Pupuk Tanaman (target: IK-05)",
      problem: `Petani mencampur cairan nutrisi A dan nutrisi B dengan rasio $${n1} : ${n2}$. Total volume racikan adalah $${(n1 + n2) * mult * 50}\\text{ ml}$. Tentukan volume cairan nutrisi A:`,
      answer: `Total bagian = $${n1 + n2}$. Nilai 1 bagian = $${(n1 + n2) * mult * 50}\\text{ ml} \\div ${n1 + n2} = ${mult * 50}\\text{ ml}$. Nutrisi A = $${n1} \\times ${mult * 50}\\text{ ml} = \\mathbf{${n1 * mult * 50}\\text{ ml}}$.`,
    },
    {
      title: "Aktivitas 6: Analisis Efisiensi Konsumsi Energi (target: IK-03)",
      problem: `Sebuah kendaraan menempuh $90\\text{ km}$ dengan $6\\text{ liter}$ bensin. Berapa km jarak yang ditempuh dengan $10\\text{ liter}$ bensin?`,
      answer: `Efisiensi = $90 \\div 6 = 15\\text{ km/liter}$. Jarak untuk $10\\text{ liter}$ = $10 \\times 15 = \\mathbf{150\\text{ km}}$.`,
    },
  ];

  const selectedActs = allActivities.slice(0, count);

  const activitiesContent = selectedActs
    .map(
      (act) => `### ${act.title}
${act.problem}

> **Ruang Jawaban:**
> - Bagian perbandingan / nilai per satuan = $\\dots\\dots\\dots\\dots$
> - Langkah perhitungan = $\\dots\\dots\\dots\\dots$
> - Hasil akhir = $\\dots\\dots\\dots\\dots$
`
    )
    .join("\n");

  const answersContent = selectedActs
    .map((act, idx) => `${idx + 1}. **${act.title.split("(")[0].trim()}:**\n   - ${act.answer}`)
    .join("\n");

  const raw = `# LEMBAR KERJA PESERTA DIDIK (LKPD)

## A. Identitas Peserta Didik
| Komponen | Keterangan |
|---|---|
| **Nama Siswa** | .................................................... |

## B. Tujuan Pembelajaran
1. Peserta didik dapat memahami dan memodelkan konsep ${topik} melalui masalah kontekstual.
2. Peserta didik dapat menyelesaikan masalah perbandingan secara bertahap dan tepat.

## C. Petunjuk Pengerjaan
Kerjakan setiap aktivitas secara bertahap pada ruang jawaban yang disediakan.

## D. Kegiatan Pembelajaran
${activitiesContent}

## E. Refleksi Diri Siswa
Jawablah pertanyaan refleksi berikut dengan jujur:
1. Dari seluruh aktivitas yang telah diselesaikan, konsep mana yang paling mudah dan mana yang masih menantang bagimu?
2. Bagaimana konsep rasio ini membantumu menyelesaikan masalah dalam kehidupan nyata?

<!-- PEMISAH_KUNCI_GURU -->

# KUNCI JAWABAN & PANDUAN GURU

## A. Pembahasan & Kunci Jawaban Resmi
${answersContent}

## B. Pedoman & Rubrik Penskoran
| Kriteria | Keterangan Rubrik | Skor Maks |
|---|---|:---:|
| Pemodelan Rasio | Menuliskan bentuk perbandingan secara tepat | 50 |
| Perhitungan | Menuntaskan langkah hitung hingga hasil akhir | 50 |`;

  return ensureFullLkpdStructure(raw, modePengerjaan === "kelompok", jumlahAnggota);
}
