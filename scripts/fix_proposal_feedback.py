import docx
from docx.oxml import parse_xml
from docx.shared import Pt, Inches
import xml.etree.ElementTree as ET
import os

w_ns = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"

def set_run_props(run, italic=False, bold=False, font_name="Times New Roman", size_pt=12):
    run.font.name = font_name
    run.font.size = Pt(size_pt)
    run.italic = italic
    run.bold = bold

def fix_italics(doc):
    # 1. P16: KATA PENGANTAR (italicize Generative Artificial Intelligence in title)
    p16 = doc.paragraphs[16]
    p16_text = p16.text
    if "Generative Artificial Intelligence" in p16_text:
        p16.clear()
        parts = p16_text.split("Generative Artificial Intelligence")
        r0 = p16.add_run(parts[0])
        set_run_props(r0, italic=False)
        r1 = p16.add_run("Generative Artificial Intelligence")
        set_run_props(r1, italic=True)
        r2 = p16.add_run(parts[1])
        set_run_props(r2, italic=False)

    # 2. P51: Rumusan Masalah 1
    p51 = doc.paragraphs[51]
    p51_text = p51.text
    # We want: Bagaimana desain dan pengembangan *web application* berbasis *generative artificial intelligence* untuk menghasilkan LKPD matematika berdiferensiasi berdasarkan kesiapan belajar siswa pada materi Rasio dengan model ADDIE?
    p51.clear()
    r0 = p51.add_run("Bagaimana desain dan pengembangan ")
    set_run_props(r0, italic=False)
    r1 = p51.add_run("web application")
    set_run_props(r1, italic=True)
    r2 = p51.add_run(" berbasis ")
    set_run_props(r2, italic=False)
    r3 = p51.add_run("generative artificial intelligence")
    set_run_props(r3, italic=True)
    r4 = p51.add_run(" untuk menghasilkan LKPD matematika berdiferensiasi berdasarkan kesiapan belajar siswa pada materi Rasio dengan model ADDIE?")
    set_run_props(r4, italic=False)

    # 3. P57: Definisi Operasional 3.1
    p57 = doc.paragraphs[57]
    p57.clear()
    r0 = p57.add_run("Web application")
    set_run_props(r0, italic=True)
    r1 = p57.add_run(" LKPD berbasis ")
    set_run_props(r1, italic=False)
    r2 = p57.add_run("Generative Artificial Intelligence")
    set_run_props(r2, italic=True)
    r3 = p57.add_run(" (GenAI) merupakan perangkat lunak interaktif berbasis peramban (")
    set_run_props(r3, italic=False)
    r4 = p57.add_run("browser")
    set_run_props(r4, italic=True)
    r5 = p57.add_run(") yang mengotomatisasi alur kerja penyusunan bahan ajar tanpa memerlukan instalasi lokal yang rumit. Pada penelitian ini, ")
    set_run_props(r5, italic=False)
    r6 = p57.add_run("web application")
    set_run_props(r6, italic=True)
    r7 = p57.add_run(" dikembangkan menggunakan model ADDIE dengan mengintegrasikan modul tes diagnostik daring materi rasio kelas VII, kalkulasi pemetaan kesiapan belajar siswa secara otomatis, serta pembuatan tiga varian dokumen LKPD (Perlu Bimbingan, Berkembang, Mahir). Artefak teknologi ini menjembatani data empiris siswa di kelas dengan penyediaan sumber belajar yang terpersonalisasi, menjadi produk utama yang diuji kelayakan dan kepraktisannya pada penelitian ini.")
    set_run_props(r7, italic=False)

    # 4. P69: Definisi Operasional 3.7
    p69 = doc.paragraphs[69]
    p69_text = p69.text
    if "berbasis Generative AI yang dikembangkan" in p69_text:
        p69.clear()
        prefix = p69_text.split("berbasis Generative AI yang dikembangkan")[0]
        # split prefix by web application if present
        if "web application" in prefix:
            pre_parts = prefix.split("web application")
            r0 = p69.add_run(pre_parts[0])
            set_run_props(r0, italic=False)
            r1 = p69.add_run("web application")
            set_run_props(r1, italic=True)
            r2 = p69.add_run(pre_parts[1])
            set_run_props(r2, italic=False)
        else:
            r0 = p69.add_run(prefix)
            set_run_props(r0, italic=False)
        r_ai0 = p69.add_run("berbasis ")
        set_run_props(r_ai0, italic=False)
        r_ai1 = p69.add_run("Generative AI")
        set_run_props(r_ai1, italic=True)
        r_ai2 = p69.add_run(" yang dikembangkan peneliti.")
        set_run_props(r_ai2, italic=False)

    # 5. P102: Kajian Teori 6.1.3 (Mathematical Markup Language & intent annotation)
    p102 = doc.paragraphs[102]
    p102_text = p102.text
    if "Mathematical Markup Language" in p102_text and "intent annotation" in p102_text:
        p102.clear()
        p102_runs_data = [
            ("Tesis standardisasi formula matematika digital modern diatur oleh konsorsium World Wide Web Consortium (W3C) melalui ", False),
            ("Mathematical Markup Language", True),
            (" (MathML), format penanda berbasis XML yang menjadi standar global penyajian matematika pada peramban web dan pembaca layar digital (Carlisle et al., 2024). Penerapan MathML 4 dengan anotasi maksud semantik (", False),
            ("intent annotation", True),
            (") telah terbukti mampu memproses korpus matematika berskala masif secara akurat, sebagaimana diterapkan pada naskah ilmiah digital arXiv (Ginev et al., 2026). Sementara itu, pada ekosistem pengolah kata luring yang menjadi standar kerja guru di sekolah, Microsoft mengembangkan ", False),
            ("Office Math Markup Language", True),
            (" (OMML), yaitu skema XML bawaan Microsoft Word (*.docx) yang memungkinkan formula matematika dirender sebagai objek interaktif yang dapat disunting secara langsung melalui fitur ", False),
            ("Equation", True),
            (" (Mittelbach et al., 2024).", False)
        ]
        for t, it in p102_runs_data:
            r = p102.add_run(t)
            set_run_props(r, italic=it)

    # 6. P106: Kajian Teori 6.1.4 (one-size-fits-all & readiness)
    p106 = doc.paragraphs[106]
    p106_text = p106.text
    if "one-size-fits-all" in p106_text:
        p106.clear()
        p106_runs_data = [
            ("Akar teoretis diferensiasi instruksional berakar dari kritik filosofis terhadap paradigma pembelajaran klasikal seragam (", False),
            ("one-size-fits-all", True),
            (") yang mengabaikan keragaman modalitas dan kecepatan belajar siswa. Pendekatan pembelajaran berdiferensiasi yang dipelopori oleh Carol Ann Tomlinson (2014, 2017) memformulasikan penyesuaian proaktif pada empat elemen inti pembelajaran: konten, proses, produk, dan lingkungan belajar berdasarkan profil kesiapan (", False),
            ("readiness", True),
            ("), minat, dan preferensi belajar siswa (Insorio, 2024; Setambah et al., 2025). Gagasan ini berpadu secara sinergis dengan gerakan global ", False),
            ("Teaching at the Right Level", True),
            (" (TaRL) yang diinisiasi oleh organisasi Pratham, yang menegaskan bahwa pengelompokan instruksi wajib didasarkan pada tingkat capaian belajar aktual siswa saat ini, bukan berdasarkan usia biologis atau tingkatan kelas administratif (Angrist, Bergman, & Matsheng, 2022; TaRL Africa, n.d.).", False)
        ]
        for t, it in p106_runs_data:
            r = p106.add_run(t)
            set_run_props(r, italic=it)

    # 7. P112: Kajian Teori 6.1.5 (readiness)
    p112 = doc.paragraphs[112]
    p112_text = p112.text
    if "kesiapan belajar (readiness)" in p112_text:
        p112.clear()
        parts = p112_text.split("kesiapan belajar (readiness)")
        r0 = p112.add_run(parts[0] + "kesiapan belajar (")
        set_run_props(r0, italic=False)
        r1 = p112.add_run("readiness")
        set_run_props(r1, italic=True)
        r2 = p112.add_run(")" + parts[1])
        set_run_props(r2, italic=False)

    # 8. P185: Subbab 7.6 (Bring Your Own Device)
    p185 = doc.paragraphs[185]
    p185.clear()
    p185_runs_data = [
        ("d. Optimalisasi Literasi Digital melalui Kebijakan Gawai Mandiri (", False),
        ("Bring Your Own Device", True),
        (" / BYOD): Sekolah menerapkan kebijakan yang mendukung pemanfaatan teknologi secara positif dan edukatif di lingkungan kelas, di mana peserta didik diperkenankan menggunakan gawai mandiri (", False),
        ("smartphone", True),
        (") secara terarah di bawah bimbingan guru. Kebijakan ini mendukung operasionalisasi sistem ", False),
        ("web application", True),
        (", di mana siswa dapat mengakses instrumen asesmen diagnostik daring dan dasbor pengisian LKPD interaktif secara langsung dan fleksibel tanpa bergantung penuh pada laboratorium komputer sekolah, sekaligus melatih kemandirian dan literasi digital siswa.", False)
    ]
    for t, it in p185_runs_data:
        r = p185.add_run(t)
        set_run_props(r, italic=it)

    print("SUCCESS: Fixed all italics in body paragraphs!")

def fix_bookmarks_and_hyperlinks(doc):
    # Collect 42 headings
    headings = []
    for i, par in enumerate(doc.paragraphs):
        if par.style.name.startswith('Heading') or par.style.name in ['Title', 'No Spacing'] and any(k in par.text for k in ['LEMBAR PENGESAHAN', 'KATA PENGANTAR', 'DAFTAR ISI', 'DAFTAR TABEL', 'DAFTAR GAMBAR']):
            headings.append(par)

    print(f"Total target headings found: {len(headings)}")
    assert len(headings) == 42, f"Expected 42 headings, found {len(headings)}"

    # Get max existing bookmark ID
    bm_ids = []
    for b in doc._body._element.iter(f'{{{w_ns}}}bookmarkStart'):
        v = b.attrib.get(f'{{{w_ns}}}id')
        if v and v.isdigit():
            bm_ids.append(int(v))
    start_id = (max(bm_ids) if bm_ids else 0) + 10

    # Clean existing _Toc bookmarks on headings and inject unified, bulletproof bookmarks
    for idx, par in enumerate(headings, 1):
        bm_name = f"_Toc_Sec_{idx:02d}"
        cur_id = start_id + idx
        p_elm = par._p

        # Remove existing bookmarkStart and bookmarkEnd with _Toc
        to_remove = []
        for child in list(p_elm):
            if child.tag.endswith('bookmarkStart') and child.attrib.get(f'{{{w_ns}}}name', '').startswith('_Toc'):
                to_remove.append(child)
            elif child.tag.endswith('bookmarkEnd'):
                # check if matches
                pass
        for r_elm in to_remove:
            p_elm.remove(r_elm)

        # Prepend new bookmarkStart and append bookmarkEnd
        bm_start = parse_xml(f'<w:bookmarkStart xmlns:w="{w_ns}" w:id="{cur_id}" w:name="{bm_name}"/>')
        bm_end = parse_xml(f'<w:bookmarkEnd xmlns:w="{w_ns}" w:id="{cur_id}"/>')
        
        # Insert bm_start after pPr if pPr exists, else at index 0
        pPr = p_elm.find(f'{{{w_ns}}}pPr')
        if pPr is not None:
            p_elm.insert(p_elm.index(pPr) + 1, bm_start)
        else:
            p_elm.insert(0, bm_start)
        p_elm.append(bm_end)

    print("Injected unified bookmarks _Toc_Sec_01 to _Toc_Sec_42 into body headings.")

    # Now synchronize DAFTAR ISI in <w:sdt>
    sdt_elem = doc._body._element.find(f'.//{{{w_ns}}}sdt')
    toc_paras = list(sdt_elem.iter(f'{{{w_ns}}}p'))[1:43]
    assert len(toc_paras) == 42, f"Expected 42 TOC paragraphs, found {len(toc_paras)}"

    # Verified page numbers map
    page_numbers = [
        "ii", "iii", "iv", "vi", "vii", # 1..5
        "1", "3", "3", "4", "4", "4", "5", "5", "5", "6", # 6..15
        "6", "7", "7", "7", # 16..19
        "8", "8", "8", "10", "11", "13", "14", "16", "18", # 20..28
        "19", "21", # 29..30
        "22", "22", "22", "22", "23", "23", "24", # 31..37
        "24", "26", "26", "32", "33" # 38..42
    ]

    for idx, (toc_p, p_num) in enumerate(zip(toc_paras, page_numbers), 1):
        target_bm = f"_Toc_Sec_{idx:02d}"
        
        # 1. Update w:hyperlink w:anchor
        h = toc_p.find(f'.//{{{w_ns}}}hyperlink')
        if h is not None:
            h.attrib[f'{{{w_ns}}}anchor'] = target_bm
            h.attrib[f'{{{w_ns}}}history'] = "1"
        
        # 2. Update w:instrText inside hyperlink
        for instr in toc_p.iter(f'{{{w_ns}}}instrText'):
            instr.text = f" PAGEREF {target_bm} \\h "

        # 3. Update the page number run (the run right after fldChar type="separate")
        # In our XML structure, the separate is followed by a run with the page number
        runs = list(toc_p.iter(f'{{{w_ns}}}r'))
        found_sep = False
        for r in runs:
            if r.find(f'{{{w_ns}}}fldChar[@{{{w_ns}}}fldCharType="separate"]') is not None:
                found_sep = True
                continue
            if found_sep:
                t = r.find(f'{{{w_ns}}}t')
                if t is not None:
                    t.text = str(p_num)
                    break

    print("SUCCESS: Synchronized all 42 TOC hyperlinks, PAGEREF instructions, and page numbers!")

    # Fix Tabel 7.7 and Tabel 7.8 bookmarks and DAFTAR TABEL
    p176 = doc.paragraphs[176] # Tabel 7.7
    t7_start = parse_xml(f'<w:bookmarkStart xmlns:w="{w_ns}" w:id="{start_id+50}" w:name="_Ref_Tabel_7_7"/>')
    t7_end = parse_xml(f'<w:bookmarkEnd xmlns:w="{w_ns}" w:id="{start_id+50}"/>')
    p176._p.insert(0, t7_start)
    p176._p.append(t7_end)

    p189 = doc.paragraphs[189] # Tabel 7.8
    t8_start = parse_xml(f'<w:bookmarkStart xmlns:w="{w_ns}" w:id="{start_id+51}" w:name="_Ref_Tabel_7_8"/>')
    t8_end = parse_xml(f'<w:bookmarkEnd xmlns:w="{w_ns}" w:id="{start_id+51}"/>')
    p189._p.insert(0, t8_start)
    p189._p.append(t8_end)
    print("SUCCESS: Injected bookmarks for Tabel 7.7 and Tabel 7.8!")

def main():
    docx_path = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\Proposal_Skripsi_Ryan_Wardiana_Revisi_Bimbingan_2_Draft.docx"
    doc = docx.Document(docx_path)
    
    fix_italics(doc)
    fix_bookmarks_and_hyperlinks(doc)
    
    doc.save(docx_path)
    print(f"SUCCESS: Successfully saved updated document to {docx_path}")

if __name__ == "__main__":
    main()
