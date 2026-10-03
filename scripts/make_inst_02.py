import os, sys
sys.path.append('.')
import docx
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from scripts.generate_all_instruments import (
    create_base_doc, add_header_kop, add_doc_title, add_section_heading,
    add_body_p, format_cell, set_table_borders, OUT_DIR
)

def build_instrument_02():
    doc = create_base_doc()
    add_header_kop(doc)
    add_doc_title(
        doc,
        "LEMBAR VALIDASI AHLI MATERI PEMBELAJARAN MATEMATIKA",
        "Penilaian Kelayakan Produk E-LKPD Berdiferensiasi dan Asesmen Diagnostik Kesiapan Belajar Siswa pada Materi Rasio Fase D"
    )
    
    # Bagian A: Identitas Validator
    add_section_heading(doc, "A. Identitas Validator Ahli Materi")
    tbl_id = doc.add_table(rows=5, cols=3)
    tbl_id.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_id, "E2E8F0")
    col_widths = [Inches(0.4), Inches(2.3), Inches(3.8)]
    fields = [
        ("1", "Nama Lengkap & Gelar", ": ....................................................................................."),
        ("2", "NIP / NIDN", ": ....................................................................................."),
        ("3", "Instansi / Perguruan Tinggi", ": ....................................................................................."),
        ("4", "Keahlian / Pengalaman", ": Dosen Pembelajaran Matematika / Guru Penggerak"),
        ("5", "Hari, Tanggal Penilaian", ": .....................................................................................")
    ]
    for r_idx, (no, label, val) in enumerate(fields):
        row = tbl_id.rows[r_idx]
        for c_idx, w in enumerate(col_widths):
            row.cells[c_idx].width = w
        format_cell(row.cells[0], no, size=11, align=WD_ALIGN_PARAGRAPH.CENTER)
        format_cell(row.cells[1], label, bold=True, size=11)
        format_cell(row.cells[2], val, size=11)
    
    # Bagian B: Petunjuk Penilaian
    add_section_heading(doc, "B. Petunjuk Pengisian Lembar Validasi")
    add_body_p(doc, "Lembar validasi ini bertujuan untuk menghimpun data pertimbangan para ahli mengenai kevalidan isi, kelayakan materi matematika, dan ketepatan pedagogis produk pembelajaran yang dikembangkan.", "1. Tujuan: ")
    add_body_p(doc, "Bapak/Ibu dimohon memberikan tanda centang (✓) pada kolom skala nilai (1–5) yang paling mencerminkan penilaian objektif Bapak/Ibu terhadap setiap butir pernyataan.", "2. Cara Penilaian: ")
    add_body_p(doc, "Kriteria skala penilaian: 5 = Sangat Baik (SB); 4 = Baik (B); 3 = Cukup (C); 2 = Kurang (K); 1 = Sangat Kurang (SK).", "3. Kategori Skala: ")
    add_body_p(doc, "Bapak/Ibu dimohon memberikan catatan koreksi, kritik, atau saran perbaikan secara spesifik pada kolom yang disediakan demi penyempurnaan kualitas produk.", "4. Catatan Revisi: ")
    
    # Bagian C: Tabel Penilaian 40 Butir (Tabel 7.3)
    add_section_heading(doc, "C. Penilaian Kelayakan Materi dan Pedagogis")
    
    items_data = [
        # Aspek 1: Kurikulum & Tujuan (1-4)
        ("I. Aspek Kurikulum dan Tujuan Pembelajaran", [
            ("1", "Materi rasio yang disajikan selaras dengan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) Fase D SMP Kelas VII."),
            ("2", "Perumusan lima Indikator Ketercapaian (IK-01 s.d. IK-05) jelas dan merefleksikan hierarki pemahaman materi rasio secara utuh."),
            ("3", "Keluasan dan kedalaman cakupan konsep rasio sesuai dengan tingkat perkembangan kognitif peserta didik usia kelas VII."),
            ("4", "Materi dan stimulus lembar kerja memfasilitasi ketercapaian dimensi Profil Pelajar Pancasila (bernalar kritis dan mandiri).")
        ]),
        # Aspek 2: Kebenaran Konsep & Prosedur Matematika (5-9)
        ("II. Aspek Kebenaran Konsep dan Prosedur Matematika", [
            ("5", "Ketepatan definisi konseptual rasio sebagai perbandingan dua besaran sejenis atau berlainan satuan."),
            ("6", "Ketepatan prosedur matematika dalam menyederhanakan rasio dan menentukan rasio ekuivalen (senilai)."),
            ("7", "Ketepatan pembedaan konsep, karakteristik, dan prosedur perbandingan senilai vs perbandingan berbalik nilai."),
            ("8", "Kebenaran kunci jawaban, contoh penyelesaian, dan langkah-langkah kalkulasi aljabar yang disajikan."),
            ("9", "Ketepatan dan konsistensi penggunaan simbol, notasi matematika, variabel, serta penulisan satuan besaran.")
        ]),
        # Aspek 3: Asesmen Diagnostik Kognitif (10-14)
        ("III. Aspek Asesmen Diagnostik Kognitif", [
            ("10", "Kemampuan butir tes diagnostik mendeteksi penguasaan materi prasyarat (operasi hitung pecahan, desimal, dan FPB)."),
            ("11", "Kemampuan butir tes mendeteksi miskonsepsi umum peserta didik (seperti penalaran aditif keliru pada konteks multiplikatif)."),
            ("12", "Keseimbangan proporsi butir tes yang mengukur pemahaman konsep konseptual dan keterampilan prosedural."),
            ("13", "Kejelasan rubrik penskoran dan kriteria ketercapaian untuk setiap indikator kompetensi (IK-01 s.d. IK-05)."),
            ("14", "Ketepatan penerapan batas ambang penguasaan kompetensi (passing threshold) sebesar 60% per indikator.")
        ]),
        # Aspek 4: Aturan Klasifikasi Kesiapan Belajar (15-19)
        ("IV. Aspek Aturan Klasifikasi Kesiapan Belajar", [
            ("15", "Ketepatan logika pengelompokan siswa ke kategori 'Perlu Bimbingan' jika belum menguasai indikator dasar (IK-01/IK-02)."),
            ("16", "Ketepatan logika pengelompokan siswa ke kategori 'Berkembang' jika telah menguasai konsep dasar namun belum tuntas pada soal aplikatif."),
            ("17", "Ketepatan logika pengelompokan siswa ke kategori 'Mahir' jika telah menguasai seluruh indikator termasuk masalah kontekstual HOTS."),
            ("18", "Ketepatan aturan sistem dalam menangani kasus siswa dengan profil skor tidak merata (edge cases/inconsistent pattern)."),
            ("19", "Kesesuaian hasil visualisasi pemetaan kesiapan kelas sebagai dasar pembagian kelompok belajar diferensiasi.")
        ]),
        # Aspek 5: Pembelajaran Berdiferensiasi dan TaRL (20-23)
        ("V. Aspek Pembelajaran Berdiferensiasi dan TaRL", [
            ("20", "Kesesuaian variasi konten bahan ajar matematika dengan profil tiga tingkat kesiapan belajar peserta didik."),
            ("21", "Kesesuaian variasi proses belajar dan alur penemuan konsep yang disediakan pada masing-masing draf LKPD."),
            ("22", "Kesesuaian variasi tuntutan produk/tugas akhir yang diharapkan dari peserta didik sesuai level kesiapannya."),
            ("23", "Efektivitas desain pembelajaran dalam mengimplementasikan prinsip Teaching at the Right Level (TaRL).")
        ]),
        # Aspek 6: Scaffolding dan HOTS (24-27)
        ("VI. Aspek Scaffolding dan HOTS", [
            ("24", "Penyediaan bantuan belajar terstruktur (material scaffold) yang kuat dan eksplisit pada varian Perlu Bimbingan."),
            ("25", "Penerapan pengurangan bantuan secara bertahap (fading guidance) yang runtut menuju varian Berkembang."),
            ("26", "Pemberian tantangan masalah kontekstual bernalar tinggi (Higher Order Thinking Skills) pada varian Mahir."),
            ("27", "Keefektifan struktur scaffolding dalam menjembatani Zone of Proximal Development (ZPD) peserta didik.")
        ]),
        # Aspek 7: Struktur dan Komponen LKPD (28-31)
        ("VII. Aspek Struktur dan Komponen LKPD", [
            ("28", "Kelengkapan komponen identitas, capaian pembelajaran, petunjuk belajar, serta stimulus masalah kontekstual."),
            ("29", "Kejelasan alur penyajian aktivitas belajar, mulai dari pengamatan kontekstual, pemodelan, hingga refleksi."),
            ("30", "Kecukupan dan proporsionalitas ruang respons bagi peserta didik untuk menuliskan proses berpikir dan coretan hitung."),
            ("31", "Ketersediaan pertanyaan refleksi diri peserta didik di akhir lembar kerja untuk mengevaluasi pemahaman pribadi.")
        ]),
        # Aspek 8: Bahasa dan Keterbacaan Kontekstual (32-35)
        ("VIII. Aspek Bahasa dan Keterbacaan Kontekstual", [
            ("32", "Kejelasan dan keterbacaan instruksi tugas sehingga tidak menimbulkan penafsiran ganda (ambiguitas)."),
            ("33", "Kesesuaian pilihan kata, struktur kalimat, dan istilah matematika dengan kaidah bahasa baku EYD V."),
            ("34", "Kesesuaian narasi masalah kontekstual dengan situasi nyata kehidupan sehari-hari peserta didik kelas VII SMP."),
            ("35", "Keefektifan kalimat tanya dalam memantik rasa ingin tahu dan mendorong proses bernalar kritis peserta didik.")
        ]),
        # Aspek 9: Mutu Keluaran GenAI dan Kontrol Guru (36-38)
        ("IX. Aspek Mutu Keluaran GenAI dan Kontrol Guru", [
            ("36", "Keselarasan materi LKPD hasil generasi AI dengan instruksi pedagogis dan prompt sistem yang dirancang."),
            ("37", "Kebebasan konten matematika dari halusinasi kecerdasan artifisial, kesalahan fakta ilmiah, atau distorsi rumus."),
            ("38", "Ketersediaan fasilitas kendali guru (human-in-the-loop) untuk menelaah, mengoreksi, dan menyunting draf AI.")
        ]),
        # Aspek 10: Representasi Formula Matematika dan OMML (39-40)
        ("X. Aspek Representasi Formula Matematika dan OMML", [
            ("39", "Ketepatan representasi formula matematika, pecahan, perbandingan bertingkat, dan persamaan aljabar."),
            ("40", "Keterbacaan, kerapian tipografi, dan konsistensi objek rumus hasil konversi OMML di dokumen Microsoft Word.")
        ])
    ]
    
    # Create table for 40 items
    tbl_eval = doc.add_table(rows=1, cols=8)
    tbl_eval.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_eval, "94A3B8")
    
    col_w = [Inches(0.4), Inches(3.4), Inches(0.4), Inches(0.4), Inches(0.4), Inches(0.4), Inches(0.4), Inches(1.3)]
    headers = ["No.", "Indikator Penilaian Materi & Pedagogis", "1", "2", "3", "4", "5", "Catatan / Koreksi"]
    
    for c_idx, h in enumerate(headers):
        tbl_eval.rows[0].cells[c_idx].width = col_w[c_idx]
        format_cell(tbl_eval.rows[0].cells[c_idx], h, bold=True, size=10, align=WD_ALIGN_PARAGRAPH.CENTER, color="F1F5F9")
    
    for group_title, items in items_data:
        # Group header row
        hdr_row = tbl_eval.add_row()
        hdr_cell = hdr_row.cells[1]
        # merge cells 0 to 7
        for c in hdr_row.cells:
            for w_idx, w in enumerate(col_w):
                hdr_row.cells[w_idx].width = w
        format_cell(hdr_row.cells[0], "", bold=True, size=10, color="E2E8F0")
        format_cell(hdr_row.cells[1], group_title, bold=True, size=10, color="E2E8F0")
        for c_idx in range(2, 8):
            format_cell(hdr_row.cells[c_idx], "", color="E2E8F0")
            
        for num, text in items:
            r = tbl_eval.add_row()
            for w_idx, w in enumerate(col_w):
                r.cells[w_idx].width = w
            format_cell(r.cells[0], num, size=10, align=WD_ALIGN_PARAGRAPH.CENTER)
            format_cell(r.cells[1], text, size=10)
            for c_idx in range(2, 7):
                format_cell(r.cells[c_idx], "[  ]", size=9, align=WD_ALIGN_PARAGRAPH.CENTER)
            format_cell(r.cells[7], "", size=9)
            
    # Bagian D: Catatan dan Saran Umum
    add_section_heading(doc, "D. Catatan dan Saran Perbaikan Umum")
    tbl_notes = doc.add_table(rows=1, cols=1)
    tbl_notes.alignment = WD_TABLE_ALIGNMENT.CENTER
    tbl_notes.rows[0].cells[0].width = Inches(7.1)
    format_cell(tbl_notes.rows[0].cells[0], "\n\n\n\n\n\n", size=11)
    set_table_borders(tbl_notes, "94A3B8")
    
    # Bagian E: Kesimpulan Rekomendasi
    add_section_heading(doc, "E. Rekomendasi Kelayakan Materi")
    add_body_p(doc, "Berdasarkan penilaian menyeluruh terhadap aspek kurikulum, materi matematika, pedagogi diferensiasi, asesmen diagnostik, dan keluaran AI, produk pembelajaran ini dinyatakan:")
    add_body_p(doc, "Layak digunakan untuk uji coba lapangan tanpa revisi.", "[   ] A. ")
    add_body_p(doc, "Layak digunakan untuk uji coba lapangan dengan revisi sesuai catatan.", "[   ] B. ")
    add_body_p(doc, "Tidak layak digunakan / membutuhkan revisi konseptual menyeluruh.", "[   ] C. ")
    
    # Tanda tangan
    p_space = doc.add_paragraph()
    p_space.paragraph_format.space_before = Pt(8)
    
    tbl_sign = doc.add_table(rows=3, cols=2)
    tbl_sign.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(tbl_sign, "FFFFFF")
    for r in tbl_sign.rows:
        r.cells[0].width = Inches(3.5)
        r.cells[1].width = Inches(3.5)
        
    format_cell(tbl_sign.rows[0].cells[0], "", size=11)
    format_cell(tbl_sign.rows[0].cells[1], "Tasikmalaya, .................................... 2026\nValidator Ahli Materi,", size=11, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    format_cell(tbl_sign.rows[1].cells[0], "", size=11)
    format_cell(tbl_sign.rows[1].cells[1], "\n\n\n", size=11, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    format_cell(tbl_sign.rows[2].cells[0], "", size=11)
    format_cell(tbl_sign.rows[2].cells[1], "( .............................................................. )\nNIP/NIDN. ...............................................", bold=True, size=11, align=WD_ALIGN_PARAGRAPH.CENTER)
    
    out_docx = os.path.join(OUT_DIR, "02_Lembar_Validasi_Ahli_Materi.docx")
    doc.save(out_docx)
    print("Saved:", out_docx)

if __name__ == "__main__":
    build_instrument_02()
