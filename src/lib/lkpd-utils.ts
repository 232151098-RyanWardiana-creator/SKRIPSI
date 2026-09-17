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

  let text = content;

  // 1. Sembuhkan artefak cacat "ext..." dan "dfracext..." yang dihasilkan LLM tertentu tanpa backslash
  // Contoh: "dfracextairextcat" -> "\dfrac{\text{air}}{\text{cat}}", "ext1bagian" -> "\text{1 bagian}"
  text = text.replace(/\\?dfracext([a-zA-Z]+)ext([a-zA-Z]+)/gi, "\\dfrac{\\text{$1}}{\\text{$2}}");
  text = text.replace(/\bext1bagian\b/gi, "\\text{1 bagian}");
  text = text.replace(/\bextsepakbola\b/gi, "\\text{sepak bola}");
  text = text.replace(/\bextbijijagung\b/gi, "\\text{biji jagung}");
  text = text.replace(/\bextbulutangkis\b/gi, "\\text{bulu tangkis}");
  text = text.replace(/\bextbasket\b/gi, "\\text{basket}");
  text = text.replace(/\bextgandum\b/gi, "\\text{gandum}");
  text = text.replace(/\bextkacang\b/gi, "\\text{kacang}");
  text = text.replace(/(?:\$|\b)ext([a-zA-Z]{3,})\b/g, (_m, word) => `\\text{${word}}`);

  // 2. Perbaiki artefak subscript markdown: e.g. "t $_ $a" -> "$t_a$", "v $_ $2" -> "$v_2$"
  text = text.replace(/([a-zA-Z])\s*\$_\s*\$([a-zA-Z0-9]+)/g, "$$$1_{$2}$");
  text = text.replace(/([a-zA-Z])\s*\\_\s*([a-zA-Z0-9]+)/g, "$$$1_{$2}$");

  // 3. Perbaiki tanda bintang atau format markdown di dalam \text{...}, dan bersihkan $ liar di dalam \text{...}
  // Contoh: \text{Konsentrasi *TangkiA*} -> \text{Konsentrasi Tangki A}, \text{Banyak $paket} -> \text{Banyak paket}
  text = text.replace(/\\text\{([^}]*)\}/g, (_m, inner) => {
    const cleanInner = inner.replace(/\*/g, " ").replace(/\$/g, "").replace(/\s{2,}/g, " ");
    return `\\text{${cleanInner}}`;
  });

  // 4. Bersihkan notasi mata uang Rupiah LaTeX yang sering dirusak AI
  text = text.replace(/\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  text = text.replace(/\$?\\mathbf\{\\text\{Rp\}\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  text = text.replace(/\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  text = text.replace(/\$?\\text\{Rp\}\s*([\d.,]+)\$?/gi, "Rp$1");
  text = text.replace(/\\mathbf\{Rp\s*([\d.,]+)\}\$?/gi, "**Rp$1**");
  text = text.replace(/\$\s*Rp\s*([\d.,]+)\s*\$/gi, "**Rp$1**");

  // Normalisasi mata uang di dalam rumus matematika: \text{Rp16.000.000} -> \text{Rp } 16.000.000
  text = text.replace(/\\text\{Rp\s*(\d[\d.,]*)\}/gi, "\\text{Rp } $1");

  // 5. Hilangkan backticks di sekeliling math delimiter: `$...$` -> $...$
  text = text.replace(/`(\$[^`\n]+\$)`/g, "$1");

  // 6. Normalisasi karakter diagram balok hitam padat (seperti [■■■■■], [█████]) menjadi representasi rasio titik/lingkaran berjarak rapi
  text = text.replace(/\[\s*([■█\s]+)\s*\]/g, (_m, inner) => {
    const dots = inner.replace(/[■█]/g, "● ").replace(/\s{2,}/g, " ").trim();
    return `[ ${dots} ]`;
  });
  text = text.replace(/([■█]{2,})/g, (match) => {
    return Array.from(match).map(() => "●").join(" ");
  });

  // 7. Pemrosesan per baris (linear time, bebas ReDoS) untuk memastikan keselarasan delimiter
  const lines = text.split("\n");
  const processedLines = lines.map((line) => {
    let l = line.trimEnd();

    const hasLatex = /\\(?:d?frac|text|times|div|cdot|pm|sqrt|approx|ne|le|ge)\b/.test(l);
    if (!hasLatex) {
      return l.replace(/(\$(?!\$)[^\$\n]*?)\\frac\{/g, "$1\\dfrac{");
    }

    const trimmed = l.trim();

    // Pola 1: Baris diawali $$ namun hanya ditutup single $ atau lupa ditutup sama sekali
    if (trimmed.startsWith("$$") && !trimmed.slice(2).includes("$$")) {
      if (trimmed.endsWith("$")) {
        l = l.replace(/\$\s*$/, () => "$$");
      } else {
        l = l + " $$";
      }
    }

    // Pola 2: Rumus diawali bare LaTeX tanpa pembuka $, namun diakhiri $
    if (l.includes("$") && !l.trimStart().startsWith("$$")) {
      const parts = l.split("$");
      if (parts.length >= 2 && /\\(?:d?frac|text)\b/.test(parts[0])) {
        const match = parts[0].match(/((?:\\text\{[^{}]*\}|[a-zA-Z0-9\s()=+\-*\/])*(?:\\(?:d?frac|text))\b[\s\S]*)$/);
        if (match && match.index !== undefined) {
          const prefix = parts[0].slice(0, match.index);
          const mathStart = match[1];
          parts[0] = prefix + "$" + mathStart;
          l = parts.join("$");
        }
      }
    }

    // Pola 3: Rumus matematika bare tanpa tanda $ sama sekali
    // Contoh: "b. \text{Rasio} = \dfrac{...}{...}" atau "(Tulis rumus: \text{1 bagian} = ...... kg)"
    if (!l.includes("$") && /\\(?:d?frac|text)\b/.test(l)) {
      const eqStartMatch = l.match(/^(.*?(?:\([Tt]ulis rumus:\s*|[:=]\s*|\badalah\s*))(\\.*)$/);
      if (eqStartMatch) {
        let prefix = eqStartMatch[1];
        let mathPart = eqStartMatch[2];
        let suffix = "";
        if (mathPart.endsWith(")") && !mathPart.endsWith("\\)")) {
          mathPart = mathPart.slice(0, -1);
          suffix = ")";
        }
        l = `${prefix}$${mathPart}$${suffix}`;
      } else {
        const prefixMatch = l.match(/^(\s*(?:[-*]|\d+\.|\([a-z0-9]+\)|[a-z]\.)\s*(?:[A-Za-z\s]+[:=])?\s*)([\s\S]+)$/);
        if (prefixMatch) {
          l = `${prefixMatch[1]}$${prefixMatch[2]}$`;
        } else {
          l = `$${l}$`;
        }
      }
    }

    // Naikkan \frac menjadi \dfrac agar spasi pembilang-penyebut lapang
    l = l.replace(/\\frac\{/g, "\\dfrac{");

    return l;
  });

  return processedLines.join("\n");
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
