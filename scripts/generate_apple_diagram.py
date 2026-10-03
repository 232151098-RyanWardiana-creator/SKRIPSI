import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.font_manager import FontProperties
from matplotlib.textpath import TextPath

_MEASURE_CACHE = {}

def measure_w(text, fontsize, family='serif', weight='normal'):
    key = (text, fontsize, family, weight)
    if key in _MEASURE_CACHE:
        return _MEASURE_CACHE[key]
    fp = FontProperties(family=family, size=fontsize, weight=weight)
    tp = TextPath((0, 0), text, prop=fp)
    w_pts = tp.get_extents().width
    # Canvas width = 8.27 * 72 points = 595.44 points -> 100 data units
    w_data = (w_pts / (8.27 * 72.0)) * 100.0
    _MEASURE_CACHE[key] = w_data
    return w_data

def draw_justified_text(ax, text, x, y, width, fontsize, line_height, 
                        color='#1E293B', fontfamily='serif', weight='normal'):
    """
    Merender teks justify (rata kanan-kiri) presisi tinggi tanpa risiko text-overflow.
    Baris terakhir selalu rata kiri natural menggunakan ax.text penuh (tanpa gap buatan).
    """
    words = text.split()
    lines = []
    curr_line = []
    for word in words:
        test_line = curr_line + [word]
        if measure_w(' '.join(test_line), fontsize, fontfamily, weight) <= width or not curr_line:
            curr_line.append(word)
        else:
            lines.append(curr_line)
            curr_line = [word]
    if curr_line:
        lines.append(curr_line)

    cur_y = y
    for l_idx, line in enumerate(lines):
        is_last = (l_idx == len(lines) - 1)
        if is_last or len(line) == 1:
            ax.text(x, cur_y, ' '.join(line), fontsize=fontsize,
                    fontfamily=fontfamily, weight=weight, color=color,
                    va='top', ha='left', zorder=6)
        else:
            word_widths = [measure_w(w, fontsize, fontfamily, weight) for w in line]
            total_words_w = sum(word_widths)
            avail_space = width - total_words_w
            gap = avail_space / (len(line) - 1) if len(line) > 1 else 0
            cur_x = x
            for word, ww in zip(line, word_widths):
                ax.text(cur_x, cur_y, word, fontsize=fontsize,
                        fontfamily=fontfamily, weight=weight, color=color,
                        va='top', ha='left', zorder=6)
                cur_x += ww + gap
        cur_y -= line_height
    return cur_y

def draw_apple_diagram(out_path):
    fig, ax = plt.subplots(figsize=(8.27, 11.69), dpi=300)
    ax.set_xlim(0, 100)
    ax.set_ylim(0, 100)
    ax.axis('off')

    # Background canvas: Off-white elegan khas Apple
    bg_canvas = patches.Rectangle((0, 0), 100, 100, facecolor='#F8FAFC', zorder=0)
    ax.add_patch(bg_canvas)

    # Palette Warna Apple Modern Minimalist
    BORDER_MAIN = '#CBD5E1'
    BORDER_LIGHT = '#E2E8F0'
    CARD_BG = '#FFFFFF'
    TEXT_MAIN = '#0F172A'
    TEXT_MUTED = '#475569'

    # Palette 3 Kategori Diferensiasi (Muted Pastel)
    C_RED_BG = '#FFF1F2'
    C_RED_BRD = '#FDA4AF'
    C_RED_TXT = '#9F1239'
    C_RED_ACC = '#E11D48'

    C_BLU_BG = '#EFF6FF'
    C_BLU_BRD = '#93C5FD'
    C_BLU_TXT = '#1E40AF'
    C_BLU_ACC = '#2563EB'

    C_GRN_BG = '#F0FDF4'
    C_GRN_BRD = '#86EFAC'
    C_GRN_TXT = '#166534'
    C_GRN_ACC = '#16A34A'

    # =========================================================================
    # HEADER UTAMA (SUBTITLE DIHAPUS TOTAL SESUAI PERMINTAAN EKSPLISIT RYAN)
    # =========================================================================
    ax.text(50, 97.4, "KERANGKA TEORETIS PENELITIAN DAN PENGEMBANGAN",
            fontsize=12.5, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=5)

    # =========================================================================
    # BARIS 1: PROBLEMATIKA EMPIRIS & LANDASAN TEORETIS (Y: 79.5 .. 95.5, H: 16.0)
    # Card diperbesar ke bawah (H: 16.0), teks justify dengan margin bawah luas
    # =========================================================================
    # Card Kiri: Problematika
    card_prob = patches.FancyBboxPatch((4.5, 79.5), 43.5, 16.0,
                                       boxstyle="round,pad=0,rounding_size=0.8",
                                       facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                       linewidth=1.2, zorder=2)
    ax.add_patch(card_prob)
    ax.add_patch(patches.FancyBboxPatch((4.5, 92.2), 43.5, 3.3,
                                       boxstyle="round,pad=0,rounding_size=0.8",
                                       facecolor='#F1F5F9', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=3))
    ax.text(26.25, 93.85, "PROBLEMATIKA EMPIRIS DI KELAS",
            fontsize=9.2, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    prob_text = ("Peserta didik kelas VII SMPN 3 Tasikmalaya memiliki heterogenitas "
                 "kesiapan belajar materi rasio yang tinggi. Guru menghadapi kendala alokasi "
                 "waktu dalam menyusun tiga varian LKPD secara manual, serta keterbatasan pengetikan "
                 "formula matematika pada pengolah kata standar sehingga pembelajaran cenderung klasikal.")
    draw_justified_text(ax, prob_text, x=7.0, y=90.6, width=38.5, fontsize=6.7,
                        line_height=1.65, color=TEXT_MUTED, fontfamily='serif')

    # Card Kanan: Landasan Teoretis
    card_teori = patches.FancyBboxPatch((52.0, 79.5), 43.5, 16.0,
                                        boxstyle="round,pad=0,rounding_size=0.8",
                                        facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                        linewidth=1.2, zorder=2)
    ax.add_patch(card_teori)
    ax.add_patch(patches.FancyBboxPatch((52.0, 92.2), 43.5, 3.3,
                                        boxstyle="round,pad=0,rounding_size=0.8",
                                        facecolor='#F1F5F9', edgecolor=BORDER_LIGHT,
                                        linewidth=0.8, zorder=3))
    ax.text(73.75, 93.85, "LANDASAN TEORETIS & KURIKULUM",
            fontsize=9.2, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    teori_text = ("Kurikulum Merdeka mewajibkan asesmen diagnostik awal dan pembelajaran "
                  "berdiferensiasi. Pendekatan Teaching at the Right Level (TaRL) menyesuaikan materi "
                  "dengan kesiapan aktual siswa, sedangkan scaffolding Vygotsky dalam Zone of Proximal "
                  "Development (ZPD) memandu kemandirian nalar tingkat tinggi (HOTS).")
    draw_justified_text(ax, teori_text, x=54.5, y=90.6, width=38.5, fontsize=6.7,
                        line_height=1.65, color=TEXT_MUTED, fontfamily='serif')

    # Panah Input ke Kontainer Utama
    ax.annotate("", xy=(26.25, 76.5), xytext=(26.25, 79.5),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12), zorder=5)
    ax.annotate("", xy=(73.75, 76.5), xytext=(73.75, 79.5),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12), zorder=5)

    # =========================================================================
    # KONTAINER UTAMA: SISTEM WEB APPLICATION (Y: 25.5 .. 76.5, H: 51.0)
    # =========================================================================
    container = patches.FancyBboxPatch((4.5, 25.5), 91.0, 51.0,
                                      boxstyle="round,pad=0,rounding_size=1.2",
                                      facecolor='#FAFAFA', edgecolor='#0F172A',
                                      linewidth=1.8, zorder=2)
    ax.add_patch(container)

    # Browser / App Bar Header
    bar_head = patches.FancyBboxPatch((4.5, 73.5), 91.0, 3.0,
                                      boxstyle="round,pad=0,rounding_size=1.2",
                                      facecolor='#0F172A', edgecolor='#0F172A',
                                      linewidth=1.0, zorder=3)
    ax.add_patch(bar_head)
    # Window controls
    ax.add_patch(patches.Circle((6.8, 75.0), 0.5, facecolor='#EF4444', zorder=4))
    ax.add_patch(patches.Circle((8.3, 75.0), 0.5, facecolor='#F59E0B', zorder=4))
    ax.add_patch(patches.Circle((9.8, 75.0), 0.5, facecolor='#10B981', zorder=4))

    # URL Pill - Link resmi skripsi Ryan
    ax.add_patch(patches.FancyBboxPatch((24.0, 74.0), 52.0, 2.0,
                                       boxstyle="round,pad=0,rounding_size=0.6",
                                       facecolor='#1E293B', edgecolor='#334155',
                                       linewidth=0.8, zorder=4))
    ax.text(50.0, 75.0, "https://skripsi-ryan.vercel.app  [STUDIO GENERATOR E-LKPD AI]",
            fontsize=7.8, fontweight='bold', color='#E2E8F0', ha='center', va='center',
            fontfamily='monospace', zorder=5)

    # -------------------------------------------------------------------------
    # TAHAP 1: ASESMEN DIAGNOSTIK AWAL & GAWAI SISWA (Y: 63.6 .. 72.8, H: 9.2)
    # Sub-card diperlebar vertikal (H: 5.8) agar margin bawah lapang dan tidak menabrak batas
    # -------------------------------------------------------------------------
    card_t1 = patches.FancyBboxPatch((7.0, 63.6), 86.0, 9.2,
                                     boxstyle="round,pad=0,rounding_size=0.8",
                                     facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                     linewidth=1.0, zorder=3)
    ax.add_patch(card_t1)
    ax.text(50.0, 71.2, "TAHAP 1: ASESMEN DIAGNOSTIK KOGNITIF AWAL & GAWAI SISWA",
            fontsize=8.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    # Sub-card 1: Tes Diagnostik Daring (H: 5.8)
    card_t1_a = patches.FancyBboxPatch((9.0, 64.4), 40.5, 5.8,
                                       boxstyle="round,pad=0,rounding_size=0.6",
                                       facecolor='#F8FAFC', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=4)
    ax.add_patch(card_t1_a)
    ax.text(29.25, 68.3, "Modul Tes Diagnostik Daring Siswa",
            fontsize=7.6, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=5)
    ax.text(29.25, 66.3, "5 butir tes representatif indikator materi Rasio Fase D SMP",
            fontsize=6.7, ha='center', va='center',
            color=TEXT_MUTED, fontfamily='serif', zorder=5)

    # Sub-card 2: Dukungan Gawai Mandiri (H: 5.8, teks proporsional dengan margin bawah luas)
    card_t1_b = patches.FancyBboxPatch((50.5, 64.4), 40.5, 5.8,
                                       boxstyle="round,pad=0,rounding_size=0.6",
                                       facecolor='#F8FAFC', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=4)
    ax.add_patch(card_t1_b)
    ax.text(70.75, 68.3, "Dukungan Gawai Mandiri",
            fontsize=7.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=5)
    ax.text(70.75, 66.3, "Pemanfaatan gawai mandiri siswa secara terarah di kelas",
            fontsize=6.7, ha='center', va='center',
            color=TEXT_MUTED, fontfamily='serif', zorder=5)

    # Panah Penghubung Tahap 1 -> Tahap 2
    ax.annotate("", xy=(50, 61.2), xytext=(50, 63.6),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.4, mutation_scale=11), zorder=5)

    # -------------------------------------------------------------------------
    # TAHAP 2: KLASIFIKASI KESIAPAN BELAJAR - 3 LEVEL (Y: 47.0 .. 61.2, H: 14.2)
    # Teks justify rata kanan-kiri murni, margin samping 2.0, margin bawah lega!
    # -------------------------------------------------------------------------
    card_t2 = patches.FancyBboxPatch((7.0, 47.0), 86.0, 14.2,
                                     boxstyle="round,pad=0,rounding_size=0.8",
                                     facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                     linewidth=1.0, zorder=3)
    ax.add_patch(card_t2)
    ax.text(50.0, 59.9, "TAHAP 2: KLASIFIKASI KESIAPAN BELAJAR SISWA (PRINSIP TaRL)",
            fontsize=8.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    tier_cfgs = [
        (8.5, "KELOMPOK PERLU BIMBINGAN", "Kategori Kesiapan: Skor < 60%",
         ("Belum tuntas konsep dasar rasio. Memerlukan scaffolding konseptual intensif, "
          "representasi visual konkret, dan panduan langkah bertahap terperinci."),
         C_RED_BG, C_RED_BRD, C_RED_TXT, C_RED_ACC),
        (37.0, "KELOMPOK BERKEMBANG", "Kategori Kesiapan: Skor 60% - 79%",
         ("Tuntas konsep dasar rasio. Memerlukan bantuan terarah (fading guidance), "
          "petunjuk kunci (hints), dan pemecahan soal kontekstual aplikatif."),
         C_BLU_BG, C_BLU_BRD, C_BLU_TXT, C_BLU_ACC),
        (65.5, "KELOMPOK MAHIR", "Kategori Kesiapan: Skor ≥ 80%",
         ("Tuntas seluruh indikator kognitif. Diberikan materi pengayaan mandiri, "
          "penalaran proporsional kompleks, dan soal tantangan penalaran HOTS."),
         C_GRN_BG, C_GRN_BRD, C_GRN_TXT, C_GRN_ACC),
    ]

    for (tx, title_tier, sub_tier, desc_tier, c_bg, c_brd, c_txt, c_acc) in tier_cfgs:
        ax.add_patch(patches.FancyBboxPatch((tx, 48.0), 26.0, 10.6,
                                           boxstyle="round,pad=0,rounding_size=0.6",
                                           facecolor=c_bg, edgecolor=c_brd,
                                           linewidth=1.0, zorder=4))
        ax.add_patch(patches.FancyBboxPatch((tx + 1.2, 56.4), 23.6, 1.8,
                                           boxstyle="round,pad=0,rounding_size=0.4",
                                           facecolor=c_acc, edgecolor='none', zorder=5))
        ax.text(tx + 13.0, 57.3, title_tier,
                fontsize=7.0, fontweight='bold', color='#FFFFFF', ha='center', va='center',
                fontfamily='serif', zorder=6)
        ax.text(tx + 13.0, 55.1, sub_tier,
                fontsize=6.3, fontweight='bold', color=c_txt, ha='center', va='center',
                fontfamily='serif', zorder=6)
        # Justify dengan batas lebar 22.0 (margin aman 2.0 kiri dan kanan, padding bawah luas)
        draw_justified_text(ax, desc_tier, x=tx + 2.0, y=53.8, width=22.0,
                            fontsize=6.0, line_height=1.30, color=c_txt, fontfamily='serif')

    # Panah Penghubung Tahap 2 -> Tahap 3
    ax.annotate("", xy=(50, 44.5), xytext=(50, 47.0),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.4, mutation_scale=11), zorder=5)

    # -------------------------------------------------------------------------
    # TAHAP 3: ORKESTRASI GENERATIVE AI & HASIL LUARAN (Y: 26.5 .. 44.5, H: 18.0)
    # Label "Kueri API" dan "Ekspor" DIHAPUS TOTAL sesuai instruksi eksplisit Ryan.
    # Panah konektor bersih dengan jarak lega antar-card.
    # -------------------------------------------------------------------------
    card_t3 = patches.FancyBboxPatch((7.0, 26.5), 86.0, 18.0,
                                     boxstyle="round,pad=0,rounding_size=0.8",
                                     facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                     linewidth=1.0, zorder=3)
    ax.add_patch(card_t3)
    ax.text(50.0, 43.3, "TAHAP 3: ORKESTRASI GENERATIVE AI & TRANSFORMASI FORMULA",
            fontsize=8.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    # SUB-KOMPONEN 1: PROMPT ENGINE (Kiri, X: 8.0 .. 29.5, W: 21.5, H: 14.0)
    card_prompt = patches.FancyBboxPatch((8.0, 27.5), 21.5, 14.0,
                                         boxstyle="round,pad=0,rounding_size=0.6",
                                         facecolor='#F8FAFC', edgecolor=BORDER_MAIN,
                                         linewidth=1.0, zorder=4)
    ax.add_patch(card_prompt)
    ax.add_patch(patches.FancyBboxPatch((8.0, 39.1), 21.5, 2.4,
                                       boxstyle="round,pad=0,rounding_size=0.6",
                                       facecolor='#334155', edgecolor='none', zorder=5))
    ax.text(18.75, 40.3, "PROMPT ENGINE ADAPTIF",
            fontsize=7.2, fontweight='bold', color='#FFFFFF', ha='center', va='center',
            fontfamily='serif', zorder=6)

    prompt_items = [
        "Injeksi profil kesiapan siswa",
        "Konteks lokal materi rasio",
        "Kaidah scaffolding bertingkat",
        "Standar formula matematika",
        "Aturan luaran terstruktur"
    ]
    p_y = 37.8
    for pi in prompt_items:
        ax.text(9.4, p_y, "•", fontsize=7.5, color='#334155', ha='left', va='center', zorder=6)
        ax.text(10.8, p_y, pi, fontsize=6.0, color=TEXT_MAIN, ha='left', va='center',
                fontfamily='serif', zorder=6)
        p_y -= 1.95

    # Panah Kiri -> Tengah (Ekor panah berjarak 1.5 unit dari border card kiri, tidak menempel!)
    ax.annotate("", xy=(33.8, 34.5), xytext=(31.0, 34.5),
                arrowprops=dict(arrowstyle="-|>", color='#0F172A', lw=1.8, mutation_scale=12), zorder=6)

    # SUB-KOMPONEN 2: AI GENERATOR ENGINE CORE (Tengah, X: 34.0 .. 66.0, W: 32.0, H: 14.8)
    card_engine = patches.FancyBboxPatch((34.0, 27.2), 32.0, 14.8,
                                         boxstyle="round,pad=0,rounding_size=0.8",
                                         facecolor='#0F172A', edgecolor='#000000',
                                         linewidth=1.4, zorder=4)
    ax.add_patch(card_engine)
    ax.text(50.0, 40.6, "AI GENERATOR ENGINE",
            fontsize=8.2, fontweight='bold', color='#F8FAFC', ha='center', va='center',
            fontfamily='serif', zorder=5)

    # Sub-card 1: AI Reasoning Core (PUTIH solid, lebar 29.2, teks ringkas 2 baris rapi)
    ax.add_patch(patches.FancyBboxPatch((35.4, 35.8), 29.2, 3.8,
                                       boxstyle="round,pad=0,rounding_size=0.5",
                                       facecolor='#FFFFFF', edgecolor='#38BDF8',
                                       linewidth=1.2, zorder=5))
    ax.text(50.0, 38.3, "Sintesis Materi & Penalaran AI",
            fontsize=7.3, fontweight='bold', color='#0F172A', ha='center', va='center',
            fontfamily='serif', zorder=6)
    ax.text(50.0, 36.9, "Generasi konten adaptif berbasis profil siswa",
            fontsize=6.0, color='#475569', ha='center', va='center',
            fontfamily='serif', zorder=6)

    # Sub-card 2: Human-in-the-Loop (Dua baris rapi, lebar 29.2)
    ax.add_patch(patches.FancyBboxPatch((35.4, 31.9), 29.2, 3.3,
                                       boxstyle="round,pad=0,rounding_size=0.4",
                                       facecolor='#1E293B', edgecolor='#475569',
                                       linewidth=0.8, zorder=5))
    ax.text(50.0, 34.0, "Kurasi & Validasi Guru",
            fontsize=6.8, fontweight='bold', color='#38BDF8', ha='center', va='center',
            fontfamily='serif', zorder=6)
    ax.text(50.0, 32.8, "(Prinsip Human-in-the-Loop)",
            fontsize=5.8, color='#94A3B8', ha='center', va='center',
            fontfamily='serif', zorder=6)

    # Sub-card 3: Native OMML Math Injection (Dua baris rapi, lebar 29.2)
    ax.add_patch(patches.FancyBboxPatch((35.4, 28.0), 29.2, 3.3,
                                       boxstyle="round,pad=0,rounding_size=0.4",
                                       facecolor='#1E293B', edgecolor='#475569',
                                       linewidth=0.8, zorder=5))
    ax.text(50.0, 30.1, "Injeksi Formula OMML Native (.docx)",
            fontsize=6.8, fontweight='bold', color='#4ADE80', ha='center', va='center',
            fontfamily='serif', zorder=6)
    ax.text(50.0, 28.9, "(Standar Microsoft Equation & KaTeX Web)",
            fontsize=5.8, color='#94A3B8', ha='center', va='center',
            fontfamily='serif', zorder=6)

    # Panah Tengah -> Kanan (Ekor dan kepala panah berjarak lega dari border card)
    ax.annotate("", xy=(69.5, 34.5), xytext=(67.0, 34.5),
                arrowprops=dict(arrowstyle="-|>", color='#0F172A', lw=1.8, mutation_scale=12), zorder=6)

    # SUB-KOMPONEN 3: LUARAN MULTI-FORMAT (Kanan, X: 70.5 .. 92.0, W: 21.5, H: 14.0)
    # Memuat DOCX, PDF, dan Dasbor Siswa
    doc_cfgs = [
        (70.5, 37.4, "Dokumen Word (.docx)", "Formula OMML siap cetak & edit", '#2563EB', '#DBEAFE', '#1E40AF'),
        (70.5, 32.7, "Dokumen PDF (.pdf)", "Format dokumen baku siap bagikan", '#DC2626', '#FEE2E2', '#991B1B'),
        (70.5, 28.0, "Dasbor Siswa (Interaktif)", "Pengerjaan mandiri via gawai", '#059669', '#D1FAE5', '#065F46'),
    ]
    for (dx, dy, d_title, d_sub, d_badge_bg, d_bg, d_txt) in doc_cfgs:
        ax.add_patch(patches.FancyBboxPatch((dx, dy), 21.5, 4.0,
                                           boxstyle="round,pad=0,rounding_size=0.5",
                                           facecolor=d_bg, edgecolor=d_badge_bg,
                                           linewidth=0.9, zorder=4))
        ax.text(dx + 1.2, dy + 2.6, d_title, fontsize=6.5, fontweight='bold',
                color=d_txt, ha='left', va='center', fontfamily='serif', zorder=5)
        ax.text(dx + 1.2, dy + 1.3, d_sub, fontsize=5.8,
                color=TEXT_MUTED, ha='left', va='center', fontfamily='serif', zorder=5)

    # Panah Output ke Baris Bawah (Panah bersih berjarak, tidak menusuk border card)
    ax.annotate("", xy=(26.25, 23.4), xytext=(26.25, 25.1),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12), zorder=5)
    ax.annotate("", xy=(73.75, 23.4), xytext=(73.75, 25.1),
                arrowprops=dict(arrowstyle="-|>", color='#64748B', lw=1.5, mutation_scale=12), zorder=5)

    # =========================================================================
    # BARIS 3: EVALUASI METODOLOGIS & LUARAN PRODUK (Y: 3.0 .. 23.0, H: 20.0)
    # =========================================================================
    # Card Kiri: Evaluasi Metodologis (Subbab 7.5)
    card_eval = patches.FancyBboxPatch((4.5, 3.0), 43.5, 20.0,
                                       boxstyle="round,pad=0,rounding_size=0.8",
                                       facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                       linewidth=1.2, zorder=2)
    ax.add_patch(card_eval)
    ax.add_patch(patches.FancyBboxPatch((4.5, 19.5), 43.5, 3.5,
                                       boxstyle="round,pad=0,rounding_size=0.8",
                                       facecolor='#F1F5F9', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=3))
    ax.text(26.25, 21.25, "EVALUASI METODOLOGIS (SUBBAB 7.5)",
            fontsize=8.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    # Sub-card 1: Validitas Isi Aiken's V
    ax.add_patch(patches.FancyBboxPatch((6.5, 11.8), 39.5, 7.0,
                                       boxstyle="round,pad=0,rounding_size=0.5",
                                       facecolor='#F8FAFC', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=3))
    ax.text(26.25, 17.3, "1. Validitas Isi Instrumen (Koefisien Aiken's V)",
            fontsize=7.3, fontweight='bold', color=TEXT_MAIN, ha='center', va='center',
            fontfamily='serif', zorder=4)
    v_text = ("Penilaian validator ahli terhadap 5 butir tes diagnostik materi rasio. "
              "Kriteria butir valid dan layak pakai apabila koefisien V ≥ 0,70.")
    draw_justified_text(ax, v_text, x=8.2, y=15.8, width=36.0, fontsize=6.6,
                        line_height=1.45, color=TEXT_MUTED, fontfamily='serif')

    # Sub-card 2: Kepraktisan Produk
    ax.add_patch(patches.FancyBboxPatch((6.5, 4.0), 39.5, 7.0,
                                       boxstyle="round,pad=0,rounding_size=0.5",
                                       facecolor='#F8FAFC', edgecolor=BORDER_LIGHT,
                                       linewidth=0.8, zorder=3))
    ax.text(26.25, 9.5, "2. Kepraktisan Produk (Respon Guru & Siswa)",
            fontsize=7.3, fontweight='bold', color=TEXT_MAIN, ha='center', va='center',
            fontfamily='serif', zorder=4)
    p_text = ("Pengukuran kepraktisan antarmuka studio dan bahan ajar melalui angket respon "
              "guru dan siswa dengan kriteria minimal kategori 'Praktis' (P ≥ 61%).")
    draw_justified_text(ax, p_text, x=8.2, y=8.0, width=36.0, fontsize=6.6,
                        line_height=1.45, color=TEXT_MUTED, fontfamily='serif')

    # Card Kanan: Luaran Produk & Dampak Pembelajaran
    card_luaran = patches.FancyBboxPatch((52.0, 3.0), 43.5, 20.0,
                                         boxstyle="round,pad=0,rounding_size=0.8",
                                         facecolor=CARD_BG, edgecolor=BORDER_MAIN,
                                         linewidth=1.2, zorder=2)
    ax.add_patch(card_luaran)
    ax.add_patch(patches.FancyBboxPatch((52.0, 19.5), 43.5, 3.5,
                                        boxstyle="round,pad=0,rounding_size=0.8",
                                        facecolor='#F1F5F9', edgecolor=BORDER_LIGHT,
                                        linewidth=0.8, zorder=3))
    ax.text(73.75, 21.25, "LUARAN PRODUK & DAMPAK PENELITIAN",
            fontsize=8.8, fontweight='bold', ha='center', va='center',
            color=TEXT_MAIN, fontfamily='serif', zorder=4)

    luaran_cards = [
        (13.8, "Web Application Studio E-LKPD Terpadu",
         "Platform web terpadu mencakup dasbor guru, asesmen mandiri, "
         "dan modul generator adaptif berbasis AI."),
        (8.5, "Tiga Varian E-LKPD Multi-Format",
         "Tersedia format dokumen (.docx OMML & .pdf) serta versi interaktif "
         "langsung pada dasbor gawai siswa."),
        (3.2, "Peningkatan Kualitas Pembelajaran",
         "Meringankan beban guru serta memfasilitasi scaffolding adaptif "
         "untuk melatih daya nalar proporsional siswa.")
    ]

    for (ly, l_title, l_desc) in luaran_cards:
        ax.add_patch(patches.FancyBboxPatch((53.5, ly), 40.5, 5.0,
                                           boxstyle="round,pad=0,rounding_size=0.5",
                                           facecolor='#F8FAFC', edgecolor=BORDER_LIGHT,
                                           linewidth=0.8, zorder=3))
        ax.text(55.2, ly + 3.7, "✓", fontsize=8.0, fontweight='bold', color='#10B981',
                ha='left', va='center', zorder=4)
        ax.text(57.4, ly + 3.7, l_title, fontsize=7.1, fontweight='bold',
                color=TEXT_MAIN, ha='left', va='center', fontfamily='serif', zorder=4)
        draw_justified_text(ax, l_desc, x=57.4, y=ly + 2.5, width=35.0, fontsize=6.1,
                            line_height=1.25, color=TEXT_MUTED, fontfamily='serif')

    plt.tight_layout()
    plt.savefig(out_path, dpi=300, facecolor=fig.get_facecolor(), edgecolor='none', bbox_inches='tight')
    plt.close(fig)
    print(f"SUCCESS: Rendered perfected Apple diagram to {out_path}")

if __name__ == "__main__":
    out_file = r"C:\Users\LATITUDE 3310 TOUCH\Documents\DOCUMENT RYAN\02_Kuliah\Semester_7\KF21518001 - Skripsi (Kelas A)\03_Draft Proposal (BAB 1-3)\gambar_6_1_kerangka_teoretis.png"
    draw_apple_diagram(out_file)
