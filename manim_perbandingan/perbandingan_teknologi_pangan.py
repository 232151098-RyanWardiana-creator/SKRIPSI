from manim import *

# ==========================================
# PALET WARNA & KONFIGURASI GLOBAL (@librayn)
# ==========================================
BG_COLOR = "#0b141a"
TEXT_WHITE = "#f8fafc"
TEXT_MUTED = "#64748b"
CYAN_ACCENT = "#38bdf8"
ORANGE_ACCENT = "#f97316"
GOLD_ACCENT = "#facc15"
GREEN_ACCENT = "#22c55e"
CARD_BG = "#13222d"
CARD_BORDER = "#233948"
FONT_MONO = "Consolas"

config.background_color = BG_COLOR
config.media_dir = "C:/manim_out"


class Scene1_Pengantar(Scene):
    """
    Bagian 1: Pengantar Konseptual Perbandingan Senilai vs Berbalik Nilai
    dalam konteks industri Teknologi Pangan.
    """
    def construct(self):
        self.camera.background_color = BG_COLOR

        # Watermark @librayn
        watermark = Text("@librayn", font=FONT_MONO, font_size=18, color=TEXT_MUTED)
        watermark.to_corner(UR, buff=0.35)
        self.add(watermark)

        # Header Title
        title = Text("MATEMATIKA FASE D: RASIO & PERBANDINGAN", font=FONT_MONO, font_size=26, weight=BOLD, color=GOLD_ACCENT)
        title.to_edge(UP, buff=0.6)
        subtitle = Text("Aplikasi Nyata pada Industri Teknologi Pangan", font=FONT_MONO, font_size=19, color=TEXT_WHITE)
        subtitle.next_to(title, DOWN, buff=0.2)

        self.play(Write(title), run_time=1.2)
        self.play(FadeIn(subtitle, shift=UP * 0.15), run_time=0.8)
        self.wait(1.0)

        # Dua Card Komparasi Awal
        card_w, card_h = 5.8, 4.2

        # Card Kiri: Perbandingan Senilai
        card_left = RoundedRectangle(corner_radius=0.2, width=card_w, height=card_h, fill_color=CARD_BG, fill_opacity=0.9, stroke_color=CYAN_ACCENT, stroke_width=2.5)
        card_left.move_to(LEFT * 3.3 + DOWN * 0.6)

        c1_title = Text("1. Perbandingan Senilai", font=FONT_MONO, font_size=19, weight=BOLD, color=CYAN_ACCENT)
        c1_title.move_to(card_left.get_top() + DOWN * 0.45)

        c1_sub = Text("Studi Kasus: Ekstraksi Sari Buah", font=FONT_MONO, font_size=14, color=TEXT_MUTED)
        c1_sub.next_to(c1_title, DOWN, buff=0.15)

        c1_rule = MathTex(r"\frac{y}{x} = k \quad \text{(Konstan)}", font_size=24, color=TEXT_WHITE)
        c1_rule.next_to(c1_sub, DOWN, buff=0.4)

        c1_desc = Text(
            "Massa buah jeruk (x) bertambah\n"
            "--> Hasil sari buah (y) bertambah\n\n"
            "Grafik berupa GARIS LURUS\n"
            "yang melalui titik asal (0,0)",
            font=FONT_MONO, font_size=13.5, color="#cbd5e1", line_spacing=1.3
        )
        c1_desc.next_to(c1_rule, DOWN, buff=0.35)

        group_left = VGroup(card_left, c1_title, c1_sub, c1_rule, c1_desc)

        # Card Kanan: Perbandingan Berbalik Nilai
        card_right = RoundedRectangle(corner_radius=0.2, width=card_w, height=card_h, fill_color=CARD_BG, fill_opacity=0.9, stroke_color=ORANGE_ACCENT, stroke_width=2.5)
        card_right.move_to(RIGHT * 3.3 + DOWN * 0.6)

        c2_title = Text("2. Perbandingan Berbalik Nilai", font=FONT_MONO, font_size=19, weight=BOLD, color=ORANGE_ACCENT)
        c2_title.move_to(card_right.get_top() + DOWN * 0.45)

        c2_sub = Text("Studi Kasus: Mesin Pengemas Susu", font=FONT_MONO, font_size=14, color=TEXT_MUTED)
        c2_sub.next_to(c2_title, DOWN, buff=0.15)

        c2_rule = MathTex(r"x \cdot y = k \quad \text{(Konstan)}", font_size=24, color=TEXT_WHITE)
        c2_rule.next_to(c2_sub, DOWN, buff=0.4)

        c2_desc = Text(
            "Jumlah mesin pengemas (x) bertambah\n"
            "--> Waktu pengerjaan (y) berkurang\n\n"
            "Grafik berupa KURVA HIPERBOLA\n"
            "yang melengkung turun",
            font=FONT_MONO, font_size=13.5, color="#cbd5e1", line_spacing=1.3
        )
        c2_desc.next_to(c2_rule, DOWN, buff=0.35)

        group_right = VGroup(card_right, c2_title, c2_sub, c2_rule, c2_desc)

        self.play(
            FadeIn(group_left, shift=RIGHT * 0.3),
            FadeIn(group_right, shift=LEFT * 0.3),
            run_time=1.5
        )
        self.wait(2.5)

        # Transisi Keluar
        self.play(
            FadeOut(title), FadeOut(subtitle),
            FadeOut(group_left), FadeOut(group_right),
            run_time=0.8
        )


class Scene2_PerbandinganSenilai(Scene):
    """
    Bagian 2: Penjelasan Mendalam Perbandingan Senilai
    Kiri: Grafik linear kartesius.
    Kanan: Kartu penurunan aljabar bertahap.
    """
    def construct(self):
        self.camera.background_color = BG_COLOR

        watermark = Text("@librayn", font=FONT_MONO, font_size=18, color=TEXT_MUTED)
        watermark.to_corner(UR, buff=0.35)
        self.add(watermark)

        # Judul Scene
        scene_title = Text("1. PERBANDINGAN SENILAI : EKSTRAKSI SARI BUAH JERUK", font=FONT_MONO, font_size=21, weight=BOLD, color=CYAN_ACCENT)
        scene_title.to_edge(UP, buff=0.45)
        self.play(FadeIn(scene_title, shift=DOWN * 0.2), run_time=0.8)

        # ----------------------------------------------------
        # KIRI: SUMBU KARTESIUS (x_length=5.0, y_length=4.4)
        # ----------------------------------------------------
        axes = Axes(
            x_range=[0, 40, 10],
            y_range=[0, 25, 5],
            x_length=5.0,
            y_length=4.3,
            axis_config={"color": "#475569", "stroke_width": 2},
            tips=True
        ).move_to(LEFT * 3.4 + DOWN * 0.5)

        x_label = Text("Massa Jeruk (x, kg)", font=FONT_MONO, font_size=13, color="#94a3b8")
        x_label.next_to(axes.x_axis, DOWN, buff=0.25)

        y_label = Text("Sari Buah (y, Liter)", font=FONT_MONO, font_size=13, color="#94a3b8")
        y_label.next_to(axes.y_axis, UP, buff=0.2)

        # Angka-angka sumbu
        x_ticks = VGroup(*[
            MathTex(str(val), font_size=18, color="#94a3b8").next_to(axes.c2p(val, 0), DOWN, buff=0.12)
            for val in [10, 20, 30, 40]
        ])
        y_ticks = VGroup(*[
            MathTex(str(val), font_size=18, color="#94a3b8").next_to(axes.c2p(0, val), LEFT, buff=0.12)
            for val in [5, 10, 15, 20, 25]
        ])

        # Garis fungsi y = 0.6 * x
        graph_line = axes.plot(lambda x: 0.6 * x, x_range=[0, 38], color=CYAN_ACCENT, stroke_width=3.5)
        graph_eq_label = MathTex(r"y = 0{,}6x", font_size=20, color=CYAN_ACCENT).next_to(axes.c2p(28, 16.8), UP, buff=0.15)

        # Titik Awal: (10, 6)
        pt1_coords = axes.c2p(10, 6)
        dot1 = Dot(pt1_coords, color=CYAN_ACCENT, radius=0.08)
        dot1_ring = Circle(radius=0.16, color=CYAN_ACCENT, stroke_width=2).move_to(pt1_coords)
        dash_x1 = DashedLine(axes.c2p(10, 0), pt1_coords, stroke_width=1.5, color=TEXT_MUTED)
        dash_y1 = DashedLine(axes.c2p(0, 6), pt1_coords, stroke_width=1.5, color=TEXT_MUTED)
        dot1_label = MathTex(r"(10,\, 6)", font_size=18, color=CYAN_ACCENT).next_to(dot1, UP + LEFT * 0.3, buff=0.1)

        # Titik Target: (35, 21)
        pt2_coords = axes.c2p(35, 21)
        dot2 = Dot(pt2_coords, color=GOLD_ACCENT, radius=0.1)
        dot2_ring = Circle(radius=0.2, color=GOLD_ACCENT, stroke_width=2.5).move_to(pt2_coords)
        dash_x2 = DashedLine(axes.c2p(35, 0), pt2_coords, stroke_width=1.5, color=GOLD_ACCENT)
        dash_y2 = DashedLine(axes.c2p(0, 21), pt2_coords, stroke_width=1.5, color=GOLD_ACCENT)
        dot2_label = MathTex(r"(35,\, 21)", font_size=20, color=GOLD_ACCENT).next_to(dot2, LEFT, buff=0.15)

        # Render Elemen Sumbu Kiri
        self.play(Create(axes), Write(x_label), Write(y_label), FadeIn(x_ticks), FadeIn(y_ticks), run_time=1.2)
        self.play(Create(graph_line), Write(graph_eq_label), run_time=1.0)
        self.play(Create(dash_x1), Create(dash_y1), Create(dot1), Create(dot1_ring), Write(dot1_label), run_time=1.0)
        self.wait(1.0)

        # ----------------------------------------------------
        # KANAN: PANEL PENURUNAN ALJABAR BERTAHAP
        # ----------------------------------------------------
        card_right = RoundedRectangle(corner_radius=0.2, width=6.2, height=5.2, fill_color=CARD_BG, fill_opacity=0.95, stroke_color=CYAN_ACCENT, stroke_width=2.0)
        card_right.move_to(RIGHT * 3.3 + DOWN * 0.5)

        card_title = Text("PERHITUNGAN TAHAP DEMI TAHAP", font=FONT_MONO, font_size=16, weight=BOLD, color=CYAN_ACCENT)
        card_title.move_to(card_right.get_top() + DOWN * 0.35)

        # Kasus Soal
        soal_text = Text(
            "Kondisi: 10 kg jeruk menghasilkan 6 L sari buah.\n"
            "Ditanyakan: Berapa liter hasil dari 35 kg jeruk?",
            font=FONT_MONO, font_size=13, color=TEXT_WHITE, line_spacing=1.2
        )
        soal_text.next_to(card_title, DOWN, buff=0.25)

        # 1. Rumus Bervariabel
        rumus_lbl = Text("1. Rumus Umum Perbandingan Senilai:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        rumus_lbl.next_to(soal_text, DOWN, buff=0.25).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        rumus_tex = MathTex(r"\frac{y_1}{x_1} = \frac{y_2}{x_2} = k \implies y_2 = \frac{y_1}{x_1} \cdot x_2", font_size=20, color=TEXT_WHITE)
        rumus_tex.next_to(rumus_lbl, DOWN, buff=0.15).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # 2. Deklarasi Variabel
        deklarasi_lbl = Text("2. Deklarasi Nilai Variabel:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        deklarasi_lbl.next_to(rumus_tex, DOWN, buff=0.2).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        deklarasi_tex = MathTex(r"x_1 = 10\text{ kg}, \quad y_1 = 6\text{ L}, \quad x_2 = 35\text{ kg}", font_size=19, color=CYAN_ACCENT)
        deklarasi_tex.next_to(deklarasi_lbl, DOWN, buff=0.12).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # 3. Substitusi & Solusi
        subst_lbl = Text("3. Substitusi Nilai:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        subst_lbl.next_to(deklarasi_tex, DOWN, buff=0.2).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        subst_tex = MathTex(
            r"y_2 = \frac{6}{10} \times 35 = 0{,}6 \times 35 = \mathbf{21\text{ Liter}}",
            font_size=20, color=GOLD_ACCENT
        )
        subst_tex.next_to(subst_lbl, DOWN, buff=0.12).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # Badge Kesimpulan
        badge_box = RoundedRectangle(corner_radius=0.15, width=5.6, height=0.68, fill_color="#064e3b", fill_opacity=0.8, stroke_color=GREEN_ACCENT, stroke_width=1.5)
        badge_box.move_to(card_right.get_bottom() + UP * 0.5)
        badge_text = Text("Rasio Tetap k = 0,6 L/kg (Massa Naik 3,5x -> Volume Naik 3,5x)", font=FONT_MONO, font_size=11.5, color=TEXT_WHITE)
        badge_text.move_to(badge_box)

        # Animasi Bagian Kanan
        self.play(FadeIn(card_right), Write(card_title), FadeIn(soal_text), run_time=1.0)
        self.wait(0.8)

        self.play(FadeIn(rumus_lbl), Write(rumus_tex), run_time=1.0)
        self.play(FadeIn(deklarasi_lbl), Write(deklarasi_tex), run_time=0.8)
        self.play(FadeIn(subst_lbl), Write(subst_tex), run_time=1.2)
        self.wait(1.0)

        # Munculkan Titik Target di Grafik bersamaan dengan Badge
        self.play(
            Create(dash_x2), Create(dash_y2),
            Create(dot2), Create(dot2_ring), Write(dot2_label),
            FadeIn(badge_box), FadeIn(badge_text),
            run_time=1.5
        )
        self.wait(3.0)

        # Bersihkan Scene
        self.play(
            FadeOut(scene_title),
            FadeOut(axes), FadeOut(x_label), FadeOut(y_label), FadeOut(x_ticks), FadeOut(y_ticks),
            FadeOut(graph_line), FadeOut(graph_eq_label),
            FadeOut(dash_x1), FadeOut(dash_y1), FadeOut(dot1), FadeOut(dot1_ring), FadeOut(dot1_label),
            FadeOut(dash_x2), FadeOut(dash_y2), FadeOut(dot2), FadeOut(dot2_ring), FadeOut(dot2_label),
            FadeOut(card_right), FadeOut(card_title), FadeOut(soal_text),
            FadeOut(rumus_lbl), FadeOut(rumus_tex),
            FadeOut(deklarasi_lbl), FadeOut(deklarasi_tex),
            FadeOut(subst_lbl), FadeOut(subst_tex),
            FadeOut(badge_box), FadeOut(badge_text),
            run_time=0.8
        )


class Scene3_PerbandinganBerbalikNilai(Scene):
    """
    Bagian 3: Penjelasan Mendalam Perbandingan Berbalik Nilai
    Kiri: Grafik kurva hiperbola kartesius.
    Kanan: Kartu penurunan aljabar bertahap.
    """
    def construct(self):
        self.camera.background_color = BG_COLOR

        watermark = Text("@librayn", font=FONT_MONO, font_size=18, color=TEXT_MUTED)
        watermark.to_corner(UR, buff=0.35)
        self.add(watermark)

        # Judul Scene
        scene_title = Text("2. PERBANDINGAN BERBALIK NILAI : MESIN PENGEMAS SUSU", font=FONT_MONO, font_size=21, weight=BOLD, color=ORANGE_ACCENT)
        scene_title.to_edge(UP, buff=0.45)
        self.play(FadeIn(scene_title, shift=DOWN * 0.2), run_time=0.8)

        # ----------------------------------------------------
        # KIRI: SUMBU KARTESIUS (x_length=5.0, y_length=4.4)
        # ----------------------------------------------------
        axes = Axes(
            x_range=[0, 8, 2],
            y_range=[0, 14, 2],
            x_length=5.0,
            y_length=4.3,
            axis_config={"color": "#475569", "stroke_width": 2},
            tips=True
        ).move_to(LEFT * 3.4 + DOWN * 0.5)

        x_label = Text("Jumlah Mesin (x, unit)", font=FONT_MONO, font_size=13, color="#94a3b8")
        x_label.next_to(axes.x_axis, DOWN, buff=0.25)

        y_label = Text("Waktu Pengemasan (y, jam)", font=FONT_MONO, font_size=13, color="#94a3b8")
        y_label.next_to(axes.y_axis, UP, buff=0.2)

        # Angka-angka sumbu
        x_ticks = VGroup(*[
            MathTex(str(val), font_size=18, color="#94a3b8").next_to(axes.c2p(val, 0), DOWN, buff=0.12)
            for val in [2, 4, 6, 8]
        ])
        y_ticks = VGroup(*[
            MathTex(str(val), font_size=18, color="#94a3b8").next_to(axes.c2p(0, val), LEFT, buff=0.12)
            for val in [2, 4, 6, 8, 10, 12, 14]
        ])

        # Kurva hiperbola y = 24 / x (rentang x dari 1.8 s.d 7.5)
        curve = axes.plot(lambda x: 24.0 / x, x_range=[1.8, 7.5], color=ORANGE_ACCENT, stroke_width=3.5)
        curve_eq_label = MathTex(r"y = \frac{24}{x}", font_size=20, color=ORANGE_ACCENT).next_to(axes.c2p(4.5, 5.3), UP + RIGHT * 0.2, buff=0.1)

        # Titik Awal: (2, 12)
        pt1_coords = axes.c2p(2, 12)
        dot1 = Dot(pt1_coords, color=ORANGE_ACCENT, radius=0.08)
        dot1_ring = Circle(radius=0.16, color=ORANGE_ACCENT, stroke_width=2).move_to(pt1_coords)
        dash_x1 = DashedLine(axes.c2p(2, 0), pt1_coords, stroke_width=1.5, color=TEXT_MUTED)
        dash_y1 = DashedLine(axes.c2p(0, 12), pt1_coords, stroke_width=1.5, color=TEXT_MUTED)
        dot1_label = MathTex(r"(2,\, 12)", font_size=18, color=ORANGE_ACCENT).next_to(dot1, UP + RIGHT * 0.2, buff=0.1)

        # Titik Target: (6, 4)
        pt2_coords = axes.c2p(6, 4)
        dot2 = Dot(pt2_coords, color=GOLD_ACCENT, radius=0.1)
        dot2_ring = Circle(radius=0.2, color=GOLD_ACCENT, stroke_width=2.5).move_to(pt2_coords)
        dash_x2 = DashedLine(axes.c2p(6, 0), pt2_coords, stroke_width=1.5, color=GOLD_ACCENT)
        dash_y2 = DashedLine(axes.c2p(0, 4), pt2_coords, stroke_width=1.5, color=GOLD_ACCENT)
        dot2_label = MathTex(r"(6,\, 4)", font_size=20, color=GOLD_ACCENT).next_to(dot2, UP + RIGHT * 0.2, buff=0.1)

        # Render Elemen Sumbu Kiri
        self.play(Create(axes), Write(x_label), Write(y_label), FadeIn(x_ticks), FadeIn(y_ticks), run_time=1.2)
        self.play(Create(curve), Write(curve_eq_label), run_time=1.0)
        self.play(Create(dash_x1), Create(dash_y1), Create(dot1), Create(dot1_ring), Write(dot1_label), run_time=1.0)
        self.wait(1.0)

        # ----------------------------------------------------
        # KANAN: PANEL PENURUNAN ALJABAR BERTAHAP
        # ----------------------------------------------------
        card_right = RoundedRectangle(corner_radius=0.2, width=6.2, height=5.2, fill_color=CARD_BG, fill_opacity=0.95, stroke_color=ORANGE_ACCENT, stroke_width=2.0)
        card_right.move_to(RIGHT * 3.3 + DOWN * 0.5)

        card_title = Text("PERHITUNGAN TAHAP DEMI TAHAP", font=FONT_MONO, font_size=16, weight=BOLD, color=ORANGE_ACCENT)
        card_title.move_to(card_right.get_top() + DOWN * 0.35)

        # Kasus Soal
        soal_text = Text(
            "Target: Mengemas 12.000 kaleng susu steril.\n"
            "Kondisi: 2 mesin pengemas butuh waktu 12 jam.\n"
            "Ditanyakan: Waktu pengerjaan jika memakai 6 mesin?",
            font=FONT_MONO, font_size=12.5, color=TEXT_WHITE, line_spacing=1.2
        )
        soal_text.next_to(card_title, DOWN, buff=0.25)

        # 1. Rumus Bervariabel
        rumus_lbl = Text("1. Rumus Perbandingan Berbalik Nilai:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        rumus_lbl.next_to(soal_text, DOWN, buff=0.25).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        rumus_tex = MathTex(r"x_1 \cdot y_1 = x_2 \cdot y_2 = k \implies y_2 = \frac{x_1 \cdot y_1}{x_2}", font_size=20, color=TEXT_WHITE)
        rumus_tex.next_to(rumus_lbl, DOWN, buff=0.15).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # 2. Deklarasi Variabel
        deklarasi_lbl = Text("2. Deklarasi Nilai Variabel:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        deklarasi_lbl.next_to(rumus_tex, DOWN, buff=0.2).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        deklarasi_tex = MathTex(r"x_1 = 2\text{ unit}, \quad y_1 = 12\text{ jam}, \quad x_2 = 6\text{ unit}", font_size=19, color=ORANGE_ACCENT)
        deklarasi_tex.next_to(deklarasi_lbl, DOWN, buff=0.12).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # 3. Substitusi & Solusi
        subst_lbl = Text("3. Substitusi Nilai:", font=FONT_MONO, font_size=12.5, color=GOLD_ACCENT)
        subst_lbl.next_to(deklarasi_tex, DOWN, buff=0.2).align_to(card_right, LEFT).shift(RIGHT * 0.4)
        subst_tex = MathTex(
            r"y_2 = \frac{2 \times 12}{6} = \frac{24}{6} = \mathbf{4\text{ Jam}}",
            font_size=20, color=GOLD_ACCENT
        )
        subst_tex.next_to(subst_lbl, DOWN, buff=0.12).align_to(card_right, LEFT).shift(RIGHT * 0.6)

        # Badge Kesimpulan
        badge_box = RoundedRectangle(corner_radius=0.15, width=5.6, height=0.68, fill_color="#451a03", fill_opacity=0.8, stroke_color=ORANGE_ACCENT, stroke_width=1.5)
        badge_box.move_to(card_right.get_bottom() + UP * 0.5)
        badge_text = Text("Hasil Kali Tetap k = 24 (Mesin Naik 3x -> Waktu Turun Menjadi 1/3x)", font=FONT_MONO, font_size=11.2, color=TEXT_WHITE)
        badge_text.move_to(badge_box)

        # Animasi Bagian Kanan
        self.play(FadeIn(card_right), Write(card_title), FadeIn(soal_text), run_time=1.0)
        self.wait(0.8)

        self.play(FadeIn(rumus_lbl), Write(rumus_tex), run_time=1.0)
        self.play(FadeIn(deklarasi_lbl), Write(deklarasi_tex), run_time=0.8)
        self.play(FadeIn(subst_lbl), Write(subst_tex), run_time=1.2)
        self.wait(1.0)

        # Munculkan Titik Target di Grafik bersamaan dengan Badge
        self.play(
            Create(dash_x2), Create(dash_y2),
            Create(dot2), Create(dot2_ring), Write(dot2_label),
            FadeIn(badge_box), FadeIn(badge_text),
            run_time=1.5
        )
        self.wait(3.0)

        # Bersihkan Scene
        self.play(
            FadeOut(scene_title),
            FadeOut(axes), FadeOut(x_label), FadeOut(y_label), FadeOut(x_ticks), FadeOut(y_ticks),
            FadeOut(curve), FadeOut(curve_eq_label),
            FadeOut(dash_x1), FadeOut(dash_y1), FadeOut(dot1), FadeOut(dot1_ring), FadeOut(dot1_label),
            FadeOut(dash_x2), FadeOut(dash_y2), FadeOut(dot2), FadeOut(dot2_ring), FadeOut(dot2_label),
            FadeOut(card_right), FadeOut(card_title), FadeOut(soal_text),
            FadeOut(rumus_lbl), FadeOut(rumus_tex),
            FadeOut(deklarasi_lbl), FadeOut(deklarasi_tex),
            FadeOut(subst_lbl), FadeOut(subst_tex),
            FadeOut(badge_box), FadeOut(badge_text),
            run_time=0.8
        )


class Scene4_MatriksKomparasi(Scene):
    """
    Bagian 4: Matriks Komparasi Akhir
    Menyandingkan Perbandingan Senilai vs Berbalik Nilai secara sistematis.
    """
    def construct(self):
        self.camera.background_color = BG_COLOR

        watermark = Text("@librayn", font=FONT_MONO, font_size=18, color=TEXT_MUTED)
        watermark.to_corner(UR, buff=0.35)
        self.add(watermark)

        # Judul Utama
        title = Text("MATRIKS PERBANDINGAN: DUA MODEL UTAMA", font=FONT_MONO, font_size=23, weight=BOLD, color=GOLD_ACCENT)
        title.to_edge(UP, buff=0.55)
        self.play(FadeIn(title, shift=DOWN * 0.15), run_time=0.8)

        # Dua Kolom Card Komparasi
        box_w, box_h = 6.2, 4.4

        # Kolom 1: Senilai
        box_senilai = RoundedRectangle(corner_radius=0.2, width=box_w, height=box_h, fill_color=CARD_BG, fill_opacity=0.9, stroke_color=CYAN_ACCENT, stroke_width=2.5)
        box_senilai.move_to(LEFT * 3.3 + DOWN * 0.4)

        b1_head = Text("PERBANDINGAN SENILAI", font=FONT_MONO, font_size=17, weight=BOLD, color=CYAN_ACCENT)
        b1_head.move_to(box_senilai.get_top() + DOWN * 0.4)

        b1_content = VGroup(
            MathTex(r"\bullet\ \text{Hubungan Aljabar: } \frac{y}{x} = k \iff y = kx", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Karakteristik: } x \uparrow \implies y \uparrow \ \text{(Searah)}", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Nilai Tetap: Hasil Bagi } (\frac{y}{x} = \text{konstan})", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Grafik: Garis lurus melalui titik } (0,0)", font_size=18, color=TEXT_WHITE),
            Text("• Kasus Pangan: Ekstraksi sari buah,\n  takaran bahan resep, hasil fermentasi.", font=FONT_MONO, font_size=13, color="#94a3b8", line_spacing=1.2)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        b1_content.next_to(b1_head, DOWN, buff=0.3).align_to(box_senilai, LEFT).shift(RIGHT * 0.35)

        group_senilai = VGroup(box_senilai, b1_head, b1_content)

        # Kolom 2: Berbalik Nilai
        box_balik = RoundedRectangle(corner_radius=0.2, width=box_w, height=box_h, fill_color=CARD_BG, fill_opacity=0.9, stroke_color=ORANGE_ACCENT, stroke_width=2.5)
        box_balik.move_to(RIGHT * 3.3 + DOWN * 0.4)

        b2_head = Text("PERBANDINGAN BERBALIK NILAI", font=FONT_MONO, font_size=17, weight=BOLD, color=ORANGE_ACCENT)
        b2_head.move_to(box_balik.get_top() + DOWN * 0.4)

        b2_content = VGroup(
            MathTex(r"\bullet\ \text{Hubungan Aljabar: } x \cdot y = k \iff y = \frac{k}{x}", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Karakteristik: } x \uparrow \implies y \downarrow \ \text{(Terbalik)}", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Nilai Tetap: Hasil Kali } (x \cdot y = \text{konstan})", font_size=18, color=TEXT_WHITE),
            MathTex(r"\bullet\ \text{Grafik: Kurva hiperbola melengkung turun}", font_size=18, color=TEXT_WHITE),
            Text("• Kasus Pangan: Mesin pengemas vs waktu,\n  laju pembekuan suhu, kapasitas produksi.", font=FONT_MONO, font_size=13, color="#94a3b8", line_spacing=1.2)
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.24)
        b2_content.next_to(b2_head, DOWN, buff=0.3).align_to(box_balik, LEFT).shift(RIGHT * 0.35)

        group_balik = VGroup(box_balik, b2_head, b2_content)

        # Bottom Takeaway Card (Safe clearance y >= -2.2)
        takeaway_card = RoundedRectangle(corner_radius=0.15, width=12.8, height=0.72, fill_color="#1e293b", fill_opacity=0.95, stroke_color=GOLD_ACCENT, stroke_width=2.0)
        takeaway_card.move_to(DOWN * 3.15)
        takeaway_text = Text(
            "KUNCI ANALISIS: Jika RASIO PEMBAGIAN (y/x) tetap = SENILAI | Jika HASIL KALI (x . y) tetap = BERBALIK NILAI",
            font=FONT_MONO, font_size=13.5, weight=BOLD, color=GOLD_ACCENT
        )
        takeaway_text.move_to(takeaway_card)

        # Animasi
        self.play(FadeIn(group_senilai, shift=RIGHT * 0.3), run_time=1.2)
        self.play(FadeIn(group_balik, shift=LEFT * 0.3), run_time=1.2)
        self.wait(1.0)
        self.play(Create(takeaway_card), Write(takeaway_text), run_time=1.2)
        self.wait(3.5)

        # FadeOut penutup
        self.play(
            FadeOut(title), FadeOut(group_senilai), FadeOut(group_balik),
            FadeOut(takeaway_card), FadeOut(takeaway_text),
            run_time=1.0
        )
