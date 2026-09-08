/**
 * Memisahkan konten dokumen LKPD menjadi 2 bagian terpisah:
 * 1. Dokumen LKPD Siswa (Identitas, Tujuan, Petunjuk, Aktivitas, Refleksi)
 * 2. Kunci Jawaban & Panduan Guru (Pembahasan resmi dan rubrik penskoran)
 */
export function splitLkpdContent(fullContent: string): {
  studentContent: string;
  teacherKeyContent: string;
} {
  if (!fullContent || typeof fullContent !== "string") {
    return { studentContent: "", teacherKeyContent: "" };
  }

  // 1. Cek delimiter resmi
  if (fullContent.includes("<!-- PEMISAH_KUNCI_GURU -->")) {
    const parts = fullContent.split("<!-- PEMISAH_KUNCI_GURU -->");
    return {
      studentContent: parts[0].trim(),
      teacherKeyContent: parts[1]?.trim() || "",
    };
  }

  // 2. Cek variasi heading Markdown untuk Kunci Jawaban
  const markerRegex = /(?:\n\s*#{1,3}\s*(?:[A-Za-z0-9.]+\s*)?Kunci Jawaban[\s\S]*)/i;
  const match = fullContent.match(markerRegex);
  if (match && match.index !== undefined && match.index > 50) {
    const student = fullContent.slice(0, match.index).trim();
    const teacher = fullContent.slice(match.index).trim();
    return {
      studentContent: student,
      teacherKeyContent: teacher,
    };
  }

  // 3. Fallback jika AI tidak mengeluarkan kunci jawaban
  return {
    studentContent: fullContent.trim(),
    teacherKeyContent: "",
  };
}
