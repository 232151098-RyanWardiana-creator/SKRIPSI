import matplotlib.pyplot as plt
import matplotlib.patches as patches
import numpy as np

def create_kerangka_diagram(out_path):
    fig, ax = plt.subplots(figsize=(8.2, 11.2), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')
    
    fig.patch.set_facecolor('#ffffff')
    ax.set_facecolor('#ffffff')
    
    # Fonts & styling
    font_main = 'Arial'
    c_dark = '#0f172a'         # Slate 900
    c_card_bg = '#ffffff'
    
    # ----------------------------------------------------
    # 1. HEADER TITLE (Top Banner)
    # ----------------------------------------------------
    ax.text(50.0, 98.2, "BAGAN KERANGKA TEORETIS PENGEMBANGAN PLATFORM LKPD-AI", 
            ha='center', va='center', fontsize=11, fontweight='bold', family=font_main, color=c_dark)
    ax.text(50.0, 96.6, "Sintesis Kebutuhan Empiris, Landasan Pedagogis, Rekayasa Web AI, dan Evaluasi Kelayakan", 
            ha='center', va='center', fontsize=8.5, family=font_main, color='#475569')
    
    # ----------------------------------------------------
    # 2. ROW 1: KONDISI EMPIRIS & LANDASAN TEORETIS (Y: 82.5 s.d. 95.0)
    # ----------------------------------------------------
    y_r1 = 82.5
    h_r1 = 12.5
    w_card = 43.0
    x_c1 = 5.0
    x_c2 = 52.0
    
    # Card 1A: Problematika Empiris
    ax.add_patch(patches.FancyBboxPatch(
        (x_c1, y_r1), w_card, h_r1, boxstyle="round,pad=0,rounding_size=1.2",
        edgecolor='#cbd5e1', facecolor=c_card_bg, linewidth=1.2
    ))
    ax.add_patch(patches.Rectangle(
        (x_c1, y_r1 + h_r1 - 2.8), w_card, 2.8,
        edgecolor='none', facecolor='#fee2e2', linewidth=0
    ))
    ax.text(x_c1 + w_card/2, y_r1 + h_r1 - 1.4, "PROBLEMATIKA EMPIRIS DI KELAS",
            ha='center', va='center', fontsize=8.8, fontweight='bold', family=font_main, color='#991b1b')
    desc_1a = (
        "• Heterogenitas kesiapan belajar matematika siswa Fase D sangat tinggi.\n"
        "• Keterbatasan waktu guru menyusun 3 varian bahan ajar berdiferensiasi.\n"
        "• Kerumitan teknis pengetikan formula matematika pada Equation Editor.\n"
        "• Praktik pembelajaran cenderung klasikal dan seragam (one-size-fits-all)."
    )
    ax.text(x_c1 + 1.8, y_r1 + (h_r1 - 2.8)/2, desc_1a,
            ha='left', va='center', fontsize=7.6, family=font_main, color='#334155', linespacing=1.35)
            
    # Card 1B: Landasan Teoretis & Kurikulum
    ax.add_patch(patches.FancyBboxPatch(
        (x_c2, y_r1), w_card, h_r1, boxstyle="round,pad=0,rounding_size=1.2",
        edgecolor='#cbd5e1', facecolor=c_card_bg, linewidth=1.2
    ))
    ax.add_patch(patches.Rectangle(
        (x_c2, y_r1 + h_r1 - 2.8), w_card, 2.8,
        edgecolor='none', facecolor='#e0e7ff', linewidth=0
    ))
    ax.text(x_c2 + w_card/2, y_r1 + h_r1 - 1.4, "LANDASAN TEORETIS & KURIKULUM",
            ha='center', va='center', fontsize=8.8, fontweight='bold', family=font_main, color='#3730a3')
    desc_1b = (
        "• Kurikulum Merdeka: Pembelajaran Berdiferensiasi (Tomlinson, 2017).\n"
        "• Prinsip Teaching at the Right Level (TaRL) berbasis level kognitif aktual.\n"
        "• Scaffolding bergradasi dalam Zone of Proximal Development (Vygotsky).\n"
        "• Kerangka Asesmen Diagnostik Atribut Kognitif (Herliana et al., 2026)."
    )
    ax.text(x_c2 + 1.8, y_r1 + (h_r1 - 2.8)/2, desc_1b,
            ha='left', va='center', fontsize=7.6, family=font_main, color='#334155', linespacing=1.35)

    # Arrows Row 1 -> Row 2
    ax.annotate('', xy=(26.5, 78.5), xytext=(26.5, y_r1),
                arrowprops=dict(facecolor='#64748b', edgecolor='#64748b', width=1.5, headwidth=5, headlength=5))
    ax.annotate('', xy=(73.5, 78.5), xytext=(73.5, y_r1),
                arrowprops=dict(facecolor='#64748b', edgecolor='#64748b', width=1.5, headwidth=5, headlength=5))

    # ----------------------------------------------------
    # 3. ROW 2: SOLUSI INTI - ARSITEKTUR PLATFORM WEB LKPD-AI
    # ----------------------------------------------------
    y_r2 = 33.0
    h_r2 = 45.0
    w_r2 = 90.0
    x_r2 = 5.0
    
    # Outer Web Browser Container
    ax.add_patch(patches.FancyBboxPatch(
        (x_r2, y_r2), w_r2, h_r2, boxstyle="round,pad=0,rounding_size=1.5",
        edgecolor='#3b82f6', facecolor='#f8fafc', linewidth=1.5
    ))
    # Browser Window Bar
    ax.add_patch(patches.Rectangle(
        (x_r2, y_r2 + h_r2 - 3.2), w_r2, 3.2,
        edgecolor='none', facecolor='#1e293b', linewidth=0
    ))
    # Window Buttons (Red, Yellow, Green)
    for idx_dot, color_dot in enumerate(['#ef4444', '#f59e0b', '#10b981']):
        ax.add_patch(patches.Circle((x_r2 + 2.5 + (idx_dot * 1.8), y_r2 + h_r2 - 1.6), 0.55, facecolor=color_dot, edgecolor='none'))
        
    # URL address bar
    ax.add_patch(patches.FancyBboxPatch(
        (x_r2 + 9.0, y_r2 + h_r2 - 2.5), 45.0, 1.8, boxstyle="round,pad=0,rounding_size=0.6",
        edgecolor='none', facecolor='#334155', linewidth=0
    ))
    ax.text(x_r2 + 10.0, y_r2 + h_r2 - 1.6, "https://platform-lkpd-ai.unsil.ac.id/studio-generator",
            ha='left', va='center', fontsize=6.8, family=font_main, color='#94a3b8')
    
    ax.text(x_r2 + w_r2 - 2.5, y_r2 + h_r2 - 1.6, "SISTEM WEB LKPD-AI (ADDIE)",
            ha='right', va='center', fontsize=7.8, fontweight='bold', family=font_main, color='#38bdf8')

    # --- INSIDE WEB BROWSER: 4 ALUR PIPELINE ---
    
    # PIPELINE 1: ASESMEN DIAGNOSTIK KOGNITIF (Y: 66.2 s.d. 73.4)
    y_p1 = 66.2
    h_p1 = 7.2
    w_sub = 86.0
    x_sub = 7.0
    
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub, y_p1), w_sub, h_p1, boxstyle="round,pad=0,rounding_size=1.0",
        edgecolor='#cbd5e1', facecolor='#ffffff', linewidth=1.1
    ))
    # Icon/badge
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub + 1.5, y_p1 + 1.2), 18.0, 4.8, boxstyle="round,pad=0,rounding_size=0.6",
        edgecolor='#0284c7', facecolor='#e0f2fe', linewidth=1.0
    ))
    ax.text(x_sub + 10.5, y_p1 + 4.1, "1. Asesmen Diagnostik", ha='center', va='center', fontsize=7.8, fontweight='bold', family=font_main, color='#0369a1')
    ax.text(x_sub + 10.5, y_p1 + 2.3, "Daring (Web) / BYOD Gawai", ha='center', va='center', fontsize=6.8, family=font_main, color='#0284c7')
    
    desc_p1 = (
        "• Formulir responsif daring diakses siswa via smartphone kelas / lembar cetak.\n"
        "• 10 butir soal tes diagnostik mengukur 5 Indikator Ketercapaian (IK-01 s.d. IK-05) materi Rasio.\n"
        "• Evaluasi otomatis deteksi miskonsepsi penalaran proporsional & ambang batas tuntas (≥ 60%)."
    )
    ax.text(x_sub + 21.5, y_p1 + 3.6, desc_p1, ha='left', va='center', fontsize=7.4, family=font_main, color='#334155', linespacing=1.3)

    # Arrow P1 -> P2
    ax.annotate('', xy=(50.0, 62.5), xytext=(50.0, y_p1),
                arrowprops=dict(facecolor='#0284c7', edgecolor='#0284c7', width=1.5, headwidth=5, headlength=5))

    # PIPELINE 2: MESIN PEMETAAN KESIAPAN BELAJAR (TaRL TIERING) (Y: 53.0 s.d. 62.0)
    y_p2 = 53.0
    h_p2 = 9.0
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub, y_p2), w_sub, h_p2, boxstyle="round,pad=0,rounding_size=1.0",
        edgecolor='#cbd5e1', facecolor='#ffffff', linewidth=1.1
    ))
    ax.text(50.0, y_p2 + h_p2 - 1.5, "2. Algoritma Klasifikasi Kesiapan Belajar Siswa (Pedoman BSKAP 2024)",
            ha='center', va='center', fontsize=8.0, fontweight='bold', family=font_main, color='#1e293b')
            
    # 3 Tier Cards side by side
    w_tier = 26.5
    gap_tier = 2.0
    x_t1 = x_sub + 2.5
    x_t2 = x_t1 + w_tier + gap_tier
    x_t3 = x_t2 + w_tier + gap_tier
    y_t_box = y_p2 + 1.2
    h_t_box = 5.2
    
    # Tier 1
    ax.add_patch(patches.FancyBboxPatch((x_t1, y_t_box), w_tier, h_t_box, boxstyle="round,pad=0,rounding_size=0.8",
                                        edgecolor='#fca5a5', facecolor='#fff1f2', linewidth=1.0))
    ax.text(x_t1 + w_tier/2, y_t_box + 3.8, "PERLU BIMBINGAN (Skor < 60%)", ha='center', va='center', fontsize=7.2, fontweight='bold', family=font_main, color='#b91c1c')
    ax.text(x_t1 + w_tier/2, y_t_box + 1.8, "Belum tuntas konsep dasar IK-01/02.\nScaffolding konseptual intensif.", ha='center', va='center', fontsize=6.6, family=font_main, color='#475569')

    # Tier 2
    ax.add_patch(patches.FancyBboxPatch((x_t2, y_t_box), w_tier, h_t_box, boxstyle="round,pad=0,rounding_size=0.8",
                                        edgecolor='#fcd34d', facecolor='#fefce8', linewidth=1.0))
    ax.text(x_t2 + w_tier/2, y_t_box + 3.8, "BERKEMBANG (Skor 60%–79%)", ha='center', va='center', fontsize=7.2, fontweight='bold', family=font_main, color='#b45309')
    ax.text(x_t2 + w_tier/2, y_t_box + 1.8, "Tuntas dasar, belum terbiasa soal aplikasi.\nFading guidance terstruktur.", ha='center', va='center', fontsize=6.6, family=font_main, color='#475569')

    # Tier 3
    ax.add_patch(patches.FancyBboxPatch((x_t3, y_t_box), w_tier, h_t_box, boxstyle="round,pad=0,rounding_size=0.8",
                                        edgecolor='#86efac', facecolor='#f0fdf4', linewidth=1.0))
    ax.text(x_t3 + w_tier/2, y_t_box + 3.8, "MAHIR (Skor ≥ 80%)", ha='center', va='center', fontsize=7.2, fontweight='bold', family=font_main, color='#15803d')
    ax.text(x_t3 + w_tier/2, y_t_box + 1.8, "Tuntas seluruh indikator kompetensi.\nTantangan kontekstual HOTS & mandiri.", ha='center', va='center', fontsize=6.6, family=font_main, color='#475569')

    # Arrow P2 -> P3
    ax.annotate('', xy=(50.0, 49.5), xytext=(50.0, y_p2),
                arrowprops=dict(facecolor='#0284c7', edgecolor='#0284c7', width=1.5, headwidth=5, headlength=5))

    # PIPELINE 3: PROMPT ENGINE GENAI & HUMAN-IN-THE-LOOP (Y: 42.0 s.d. 49.0)
    y_p3 = 42.0
    h_p3 = 7.0
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub, y_p3), w_sub, h_p3, boxstyle="round,pad=0,rounding_size=1.0",
        edgecolor='#cbd5e1', facecolor='#ffffff', linewidth=1.1
    ))
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub + 1.5, y_p3 + 1.1), 18.0, 4.8, boxstyle="round,pad=0,rounding_size=0.6",
        edgecolor='#7c3aed', facecolor='#f5f3ff', linewidth=1.0
    ))
    ax.text(x_sub + 10.5, y_p3 + 4.0, "3. GenAI Engine &", ha='center', va='center', fontsize=7.8, fontweight='bold', family=font_main, color='#6d28d9')
    ax.text(x_sub + 10.5, y_p3 + 2.2, "Human-in-the-Loop", ha='center', va='center', fontsize=7.0, fontweight='bold', family=font_main, color='#7c3aed')

    desc_p3 = (
        "• Prompt Pedagogis Terstruktur: Menginjeksi profil 3 tier kesiapan, indikator, & konteks lokal.\n"
        "• Generasi Serentak 3 Draf: Sintesis konten materi Rasio dengan gradasi scaffolding adaptif.\n"
        "• Kendali Guru Penuh: Guru menelaah, mengedit formula, menyaring halusinasi, & menyetujui draf."
    )
    ax.text(x_sub + 21.5, y_p3 + 3.5, desc_p3, ha='left', va='center', fontsize=7.4, family=font_main, color='#334155', linespacing=1.3)

    # Arrow P3 -> P4
    ax.annotate('', xy=(50.0, 39.2), xytext=(50.0, y_p3),
                arrowprops=dict(facecolor='#0284c7', edgecolor='#0284c7', width=1.5, headwidth=5, headlength=5))

    # PIPELINE 4: OUTPUT EKSPOR DOKUMEN BER-OMML NATIVE (Y: 34.0 s.d. 39.0)
    y_p4 = 34.2
    h_p4 = 4.8
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub, y_p4), w_sub, h_p4, boxstyle="round,pad=0,rounding_size=1.0",
        edgecolor='#cbd5e1', facecolor='#ffffff', linewidth=1.1
    ))
    ax.add_patch(patches.FancyBboxPatch(
        (x_sub + 1.5, y_p4 + 0.8), 18.0, 3.2, boxstyle="round,pad=0,rounding_size=0.6",
        edgecolor='#2563eb', facecolor='#eff6ff', linewidth=1.0
    ))
    ax.text(x_sub + 10.5, y_p4 + 2.4, "4. Ekspor Word .docx", ha='center', va='center', fontsize=7.6, fontweight='bold', family=font_main, color='#1d4ed8')
    ax.text(x_sub + 10.5, y_p4 + 1.2, "Formula Native OMML", ha='center', va='center', fontsize=6.8, family=font_main, color='#2563eb')

    desc_p4 = (
        "• Transformasi formula matematika web menjadi Office Math Markup Language (OMML) Word native.\n"
        "• Dokumen hasil ekspor siap cetak (print-ready) dan rumus dapat disunting bebas oleh guru."
    )
    ax.text(x_sub + 21.5, y_p4 + 2.4, desc_p4, ha='left', va='center', fontsize=7.4, family=font_main, color='#334155', linespacing=1.3)

    # Arrow Row 2 -> Row 3
    ax.annotate('', xy=(50.0, 29.5), xytext=(50.0, y_r2),
                arrowprops=dict(facecolor='#64748b', edgecolor='#64748b', width=1.5, headwidth=5, headlength=5))

    # ----------------------------------------------------
    # 4. ROW 3: EVALUASI KELAYAKAN (VALIDITAS & KEPRAKTISAN) (Y: 17.5 s.d. 29.0)
    # ----------------------------------------------------
    y_r3 = 17.5
    h_r3 = 11.5
    
    # Card 3A: Validasi Kevalidan Ahli
    ax.add_patch(patches.FancyBboxPatch(
        (x_c1, y_r3), w_card, h_r3, boxstyle="round,pad=0,rounding_size=1.2",
        edgecolor='#cbd5e1', facecolor=c_card_bg, linewidth=1.2
    ))
    ax.add_patch(patches.Rectangle(
        (x_c1, y_r3 + h_r3 - 2.8), w_card, 2.8,
        edgecolor='none', facecolor='#f1f5f9', linewidth=0
    ))
    ax.text(x_c1 + w_card/2, y_r3 + h_r3 - 1.4, "1. UJI KEVALIDAN AHLI (EXPERT JUDGMENT)",
            ha='center', va='center', fontsize=8.2, fontweight='bold', family=font_main, color='#1e293b')
    desc_3a = (
        "• Validitas Isi Butir Tes Diagnostik: Koefisien Aiken's V\n"
        "  oleh panel ahli matematika (standar valid V ≥ 0,80).\n"
        "• Validitas Produk E-LKPD & Web AI: Telaah kelayakan\n"
        "  ahli materi dan ahli media (kriteria Akbar, 2013 ≥ 70%)."
    )
    ax.text(x_c1 + 1.8, y_r3 + (h_r3 - 2.8)/2, desc_3a,
            ha='left', va='center', fontsize=7.4, family=font_main, color='#334155', linespacing=1.35)

    # Card 3B: Uji Kepraktisan Respon Pengguna
    ax.add_patch(patches.FancyBboxPatch(
        (x_c2, y_r3), w_card, h_r3, boxstyle="round,pad=0,rounding_size=1.2",
        edgecolor='#cbd5e1', facecolor=c_card_bg, linewidth=1.2
    ))
    ax.add_patch(patches.Rectangle(
        (x_c2, y_r3 + h_r3 - 2.8), w_card, 2.8,
        edgecolor='none', facecolor='#f1f5f9', linewidth=0
    ))
    ax.text(x_c2 + w_card/2, y_r3 + h_r3 - 1.4, "2. UJI KEPRAKTISAN PENGGUNAAN",
            ha='center', va='center', fontsize=8.2, fontweight='bold', family=font_main, color='#1e293b')
    desc_3b = (
        "• Kepraktisan Guru Matematika: Angket 30 butir (Tabel 7.5)\n"
        "  mengukur kemudahan, efisiensi waktu, & fleksibilitas.\n"
        "• Kepraktisan Siswa Kelas VII: Angket 25 butir (Tabel 7.6)\n"
        "  mengukur keterbacaan, kejelasan scaffolding, & respon.\n"
        "• Kriteria praktis mengacu interval persentase (≥ 61%)."
    )
    ax.text(x_c2 + 1.8, y_r3 + (h_r3 - 2.8)/2, desc_3b,
            ha='left', va='center', fontsize=7.4, family=font_main, color='#334155', linespacing=1.35)

    # Arrows Row 3 -> Row 4
    ax.annotate('', xy=(26.5, 13.5), xytext=(26.5, y_r3),
                arrowprops=dict(facecolor='#64748b', edgecolor='#64748b', width=1.5, headwidth=5, headlength=5))
    ax.annotate('', xy=(73.5, 13.5), xytext=(73.5, y_r3),
                arrowprops=dict(facecolor='#64748b', edgecolor='#64748b', width=1.5, headwidth=5, headlength=5))

    # ----------------------------------------------------
    # 5. ROW 4: LUARAN AKHIR PENELITIAN (Y: 2.5 s.d. 13.0)
    # ----------------------------------------------------
    y_r4 = 2.5
    h_r4 = 10.5
    ax.add_patch(patches.FancyBboxPatch(
        (x_r2, y_r4), w_r2, h_r4, boxstyle="round,pad=0,rounding_size=1.2",
        edgecolor='#16a34a', facecolor='#f0fdf4', linewidth=1.4
    ))
    ax.add_patch(patches.Rectangle(
        (x_r2, y_r4 + h_r4 - 2.6), w_r2, 2.6,
        edgecolor='none', facecolor='#15803d', linewidth=0
    ))
    ax.text(50.0, y_r4 + h_r4 - 1.3, "LUARAN PRODUK AKHIR PENELITIAN (MEMENUHI KUALITAS VALID & PRAKTIS)",
            ha='center', va='center', fontsize=8.8, fontweight='bold', family=font_main, color='#ffffff')
            
    desc_r4 = (
        "1. Web Application LKPD-AI berbasis Next.js & Supabase yang teruji fungsional, andal, dan ramah pengguna.\n"
        "2. Instrumen Asesmen Diagnostik Kognitif 10 butir terstandarisasi validitas isi Aiken's V pada materi Rasio Fase D.\n"
        "3. Tiga Varian E-LKPD Matematika Berdiferensiasi (Perlu Bimbingan, Berkembang, Mahir) dengan formula OMML native siap pakai.\n"
        "4. Panduan Implementasi Pembelajaran Berdiferensiasi TaRL yang aplikatif dan efisien bagi guru matematika SMP."
    )
    ax.text(x_r2 + 3.0, y_r4 + (h_r4 - 2.6)/2, desc_r4,
            ha='left', va='center', fontsize=7.5, family=font_main, color='#14532d', linespacing=1.35)

    plt.tight_layout(pad=0.2)
    plt.savefig(out_path, dpi=300, bbox_inches='tight', facecolor='#ffffff')
    plt.close()
    print("SUCCESS: Rendered refined diagram to", out_path)

if __name__ == "__main__":
    out_img = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\gambar_6_1_kerangka_teoretis.png"
    create_kerangka_diagram(out_img)
