"""v2 edit — shorter (2:23), direct, archival.

Built on the family's photographs (assets/archive, supplied by the poet's son
with the poet's permission) and cut to a 72 BPM pulse: 1 bar = 3.333 s.
Same rules as v1: every quotation is sourced; unverified text is flagged.
"""
import numpy as np

from archive import Photo
from config import ASH, BLACK, INK, IVORY, OXIDE, W, H
from film import (Band, Box, Rule, Run, Shot, card, chapter, line, slot_card, words,
                  wip_flag)
import film
from film import SlotReader  # noqa: F401  (used by the renderer)
from gfx import paper_texture, solid, text_advance

LOOK = "vintage"
BAR = 60.0 / 72 * 4          # 3.333 s
DURATION = 143.3

L_CX = 540                   # text column centre when a photo holds the right side
R_CX = 1330                  # photo centre on the right
V = "verse"


def portrait_right(name, t0, t1, h=900, rot=-1.2, **kw):
    return Photo(name, R_CX, H / 2 + 6, h, t0, t_out=t1, rot=rot, **kw)


def build_shots():
    S = []
    # ------------------------------------------------------------ 01 — hook (0–13.3)
    hook = [portrait_right("p10", 0.8, 9.0, h=930, rot=-1.0, push=0.05, fin=0.9, fout=0.8)]
    hook += words(["اعتزي", "بأهل", "المهابه"], V, 100, IVORY, 470, [1.6, 2.4, 2.9],
                  cx=L_CX, fin=0.7, t_out=9.0, fout=0.8)
    hook += words(["ربعي", "هم", "عز", "القرابه"], V, 100, IVORY, 600, [4.2, 4.7, 5.0, 5.4],
                  cx=L_CX, fin=0.7, t_out=9.0, fout=0.8)
    hook += [line("عبدالله بن عبار — من دحّة «حمران النواظر»", "sans", 26, ASH, 720, 6.6,
                  cx=L_CX, t_out=9.0, fout=0.8, rise_px=0)]
    S.append(Shot(0.0, 10.0, "album", hook, push=0.012, name="01 hook"))
    S.append(Shot(10.0, 13.3, "black",
                  [line("ماذا قال بن عبار عن عنزة؟", "sans_light", 70, IVORY, 560, 10.15,
                        fin=0.9, t_out=12.6, fout=0.6, rise_px=0)],
                  push=0.012, name="01 title"))

    # ------------------------------------------------------------ 02 — who (13.3–33.3)
    b = 13.3
    montage = []
    seq = [("p01", 0.0, 3.33, -1.5), ("p04", 3.33, 5.0, 1.2), ("p17", 5.0, 6.67, -0.8),
           ("p14", 6.67, 8.33, 1.0)]
    for name, a, z, rot in seq:
        montage.append(Photo(name, 1340, H / 2 + 8, 860, b + a, t_out=b + z, rot=rot,
                             push=0.03, fin=0.18, fout=0.12, max_w=680))
    montage += [
        line("عبدالله بن دهيمش بن عبّار العنزي", V, 54, IVORY, 468, b + 0.3, cx=L_CX,
             t_out=b + 8.1, fin=0.8),
        line("شاعر ونسّابة، ومؤرخ لعنزة وقبائل ربيعة", "sans_light", 38, IVORY, 548, b + 1.4,
             cx=L_CX, t_out=b + 8.1, alpha=0.9),
        line("وُلد عام ١٣٦٥هـ في شمال الجزيرة، ونشأ في البادية", "sans_light", 30, IVORY, 604,
             b + 3.3, cx=L_CX, t_out=b + 8.1, alpha=0.7),
    ]
    S.append(Shot(b, b + 8.33, "album", montage, push=0.01, name="02 montage"))
    b = 21.63
    S.append(Shot(b, b + 5.0, "album", [
        Photo("p16", 1250, H / 2 + 10, 700, b + 0.1, rot=-0.8, push=0.03, fin=0.3, max_w=1000),
        line("التحق بالوظيفة عام ١٣٨٥هـ", "sans_light", 40, IVORY, 500, b + 0.7, cx=470),
        line("وخدم ستةً وعشرين عاماً", "sans_light", 40, IVORY, 566, b + 1.5, cx=470),
    ], push=0.01, name="02 service"))
    b = 26.63
    S.append(Shot(b, b + 3.34, "album", [
        Photo("p11", 1320, H / 2 + 10, 940, b + 0.05, t_out=b + 1.62, rot=0.8, push=0.04,
              border=False, corners=False, fin=0.25, fout=0.12),
        Photo("p03", 1320, H / 2 + 6, 900, b + 1.67, rot=-1.3, push=0.04, border=False,
              corners=False, fin=0.15),
        line("وكتب في الصحافة…", "sans_light", 44, IVORY, 540, b + 0.5, cx=L_CX),
    ], push=0.01, name="02 press"))
    b = 29.97
    S.append(Shot(b, 33.3, "album", [
        Photo("p13", 1300, H / 2 + 10, 700, b + 0.05, rot=-1.0, push=0.04, border=False,
              fin=0.25),
        line("…وأصدر كتباً في الأنساب والشعر", "sans_light", 44, IVORY, 540, b + 0.4, cx=L_CX),
    ], push=0.01, name="02 books"))

    # ------------------------------------------------------------ 03 — his count (33.3–50)
    S.append(Shot(33.3, 36.63, "black", [
        line("٥٠٬٠٠٠ بيت", "sans_light", 150, IVORY, 580, 33.45, fin=0.5, rise_px=0),
        line("مجمل شعره — بحسب سيرته المنشورة", "sans_light", 30, ASH, 680, 33.8, rise_px=0),
    ], push=0.015, name="03 50k"))
    S.append(Shot(36.63, 40.0, "black", [
        line("٣٠٠٠ بيت", "sans_light", 150, IVORY, 580, 36.7, fin=0.5, rise_px=0),
        line("عن عنزة — بحسب قوله", "sans_light", 30, ASH, 680, 37.0, rise_px=0),
    ], push=0.015, name="03 3000"))
    q1 = words(["كتبت", "اكثر", "من", "3000", "بيت", "من", "الشعر"], V, 70, INK, 470,
               40.3, fin=0.6, dims=[(43.2, 0.16, 0.6)])
    q2 = words(["في", "الفخر", "والدفاع", "والرد", "…"], V, 70, INK, 570, 41.0, fin=0.6,
               joiners=(4,))
    for i, w_ in enumerate(q2):
        if i in (0, 4):
            w_.dims = [(43.2, 0.16, 0.6)]
    qsrc = line("عبدالله بن عبار — حسابه على منصة X، ٦ أبريل ٢٠٢٠", "sans", 26, INK, 690,
                41.8, alpha=0.6, dims=[(43.2, 0.4, 0.6)])
    unders = []
    for w_, t in zip(q2[1:4], (44.0, 44.7, 45.4)):
        xr = w_.x + w_.width
        xl = w_.x if w_ is not q2[3] else xr - text_advance("والرد", V, 70)
        unders.append(Rule(xr + 4, xl - 4, 598, t, 0.38, color=OXIDE, thick=3.4, alpha=0.95))
    S.append(Shot(40.0, 50.0, "paper", q1 + q2 + [qsrc] + unders, push=0.025,
                  fade_out=0.3, name="03 quote"))

    # ------------------------------------------------------------ 04 — pride (50–70)
    S.append(short_chapter(50.0, 51.67, "١", "الفخر"))
    b = 51.67
    S.append(Shot(b, b + 6.66, "album", [
        portrait_right("p18", b + 0.05, None, h=900, rot=1.0, push=0.04, fin=0.3),
        line("اعتزي", V, 150, IVORY, 470, b + 0.3, cx=L_CX, fin=0.7, t_out=b + 3.0, fout=0.5),
        line("اعتزى إلى القوم: انتسب إليهم — لسان العرب", "sans_light", 28, ASH, 560, b + 0.9,
             cx=L_CX, t_out=b + 3.0, fout=0.5, rise_px=0),
        line("في دحّته للفدعان،", "sans_light", 42, IVORY, 500, b + 3.7, cx=L_CX),
        line("يبدأ بإعلان الانتماء.", "sans_light", 42, IVORY, 566, b + 4.4, cx=L_CX),
    ], push=0.01, name="04 i'tazi"))
    b = 58.33
    S.append(Shot(b, b + 6.67, "map", [
        Band(860, b + 0.4, fin=0.6),
        line("من خيبر والعُلا… إلى بادية الشام والعراق.", "sans_light", 42, INK, 985, b + 0.9),
    ], map_=dict(k0=(b, 41.0, 27.6, 17.0), k1=(b + 6.67, 38.3, 28.6, 13.5),
                 marker=b + 0.5, route=(b + 1.2, b + 5.6)), name="04 map"))
    b = 65.0
    S.append(Shot(b, 70.0, "paper", [
        line("الملحمة الوائلية الكبرى", V, 88, INK, 420, b + 0.2, fin=0.6),
        line("نحو ٥٠٠ بيت · سُجّلت على أشرطة قبل نحو أربعين عاماً", "sans_light", 34, INK,
             520, b + 1.0),
        line("ولم يُنشر منها إلا بعضها.", "sans_light", 40, INK, 600, b + 2.2),
    ], push=0.02, fade_out=0.3, name="04 epic"))

    # ------------------------------------------------------------ 05 — defence (70–88.3)
    S.append(short_chapter(70.0, 71.67, "٢", "الدفاع"))
    b = 71.67
    S.append(Shot(b, b + 3.33, "black", [
        line("عَنَزَة", V, 170, IVORY, 500, b + 0.1, fin=0.6),
        line("عصا في قدر نصف الرمح، فيها سنانٌ مثل سنان الرمح — لسان العرب", "sans_light", 30,
             IVORY, 620, b + 0.8, alpha=0.8),
    ], push=0.015, name="05 anaza"))
    b = 75.0
    chain = words(["عامر", "بن", "أسد", "بن", "ربيعة", "بن", "نزار"], V, 92, IVORY, 460,
                  [b + 0.1, b + 0.9, b + 0.9, b + 1.6, b + 1.6, b + 2.3, b + 2.3])
    amer = chain[0]
    S.append(Shot(b, b + 6.67, "black", chain + [
        line("«عنزة»", "sans_light", 32, IVORY, 540, b + 3.0, cx=amer.x + amer.width / 2,
             alpha=0.8),
        line("يعود بن عبار إلى الجدّ الأول، الذي طعن رجلاً بالعَنَزة فلُقّب بها.",
             "sans_light", 36, IVORY, 680, b + 3.5, alpha=0.9),
    ], push=0.015, name="05 lineage"))
    b = 81.67
    S.append(Shot(b, 88.33, "paper", [
        line("أصدق الدلائل في أنساب بني وائل", V, 80, INK, 450, b + 0.2, fin=0.6),
        line("ثلاثون عاماً من البحث", "sans_light", 42, INK, 560, b + 1.2),
        line("أكثر من ٦٠٠ صفحة — صحيفة الجزيرة، ٢٠٠٠", "sans", 26, INK, 640, b + 2.0,
             alpha=0.55, rise_px=0),
    ], push=0.02, fade_out=0.3, name="05 book"))

    # ------------------------------------------------------------ 06 — reply (88.3–105)
    S.append(short_chapter(88.33, 90.0, "٣", "الرد"))
    b = 90.0
    S.append(Shot(b, b + 4.17, "paper", [
        line("الى من حرّف نسبنا وعاب جدنا", V, 84, INK, 510, b + 0.2, fin=0.6),
        line("عبدالله بن عبار — منصة X، ١٦ مايو ٢٠٢٥", "sans", 26, INK, 610, b + 1.0,
             alpha=0.55, rise_px=0),
    ], push=0.02, name="06 post"))
    b = 94.17
    S.append(Shot(b, b + 5.83, "black",
                  words(["ياللي", "عن", "الأنساب", "تكتب", "مهازل"], V, 100, IVORY, 520,
                        [b + 0.2, b + 0.8, b + 1.2, b + 2.0, b + 2.5], fin=0.6)
                  + [line("ويطالب من يخالفه بأن يأتي بمصدره.", "sans_light", 40, IVORY, 660,
                          b + 3.4)],
                  push=0.015, overlays=wip_flag(b + 0.2, b + 5.8), name="06 verse"))
    b = 100.0
    S.append(Shot(b, 105.0, "black", [
        line("لآرائه في النسب منتقدون، وبينه وبينهم ردود.", "sans_light", 36, IVORY, 500,
             b + 0.2, alpha=0.8),
        line("هذا الفيلم لا يحكم في النسب… بل يُصغي إلى الشاعر.", "sans_light", 42, IVORY,
             590, b + 1.6),
    ], push=0.012, fade_out=0.4, name="06 balance"))

    # ------------------------------------------------------------ 07 — his voice (105–120)
    S.append(Shot(105.0, 120.0, "slot", [
        Photo("p15", W / 2, H / 2 - 20, 860, 105.0, rot=0.0, push=0.05, fin=0.6),
        line("هنا يُدرج مقطع صوته — من المقطع المنشور على يوتيوب (094HmCY__1E)",
             "sans_light", 24, ASH, 1040, 105.2, rise_px=0, alpha=0.9),
    ], slot="A3", name="07 voice"))

    # ------------------------------------------------------------ 08 — ending (120–143.3)
    b = 120.0
    S.append(Shot(b, b + 6.67, "album", [
        Photo("p05", 1260, H / 2 + 10, 640, b + 0.1, rot=-1.0, push=0.04, fin=0.5, max_w=900),
        line("في شعره، لا تظهر عنزة", "sans_light", 44, IVORY, 500, b + 0.6, cx=470),
        line("خبراً من الماضي…", "sans_light", 44, IVORY, 570, b + 1.4, cx=470),
    ], push=0.01, name="08 majlis"))
    b = 126.67
    S.append(Shot(b, b + 5.0, "album", [
        Photo("p02", 1360, H / 2 + 8, 880, b + 0.1, rot=1.2, push=0.03, fin=0.4),
        line("بل اسماً يُحفظ،", "sans_light", 46, IVORY, 440, b + 0.3, cx=L_CX),
        line("ونسباً يُدافع عنه،", "sans_light", 46, IVORY, 510, b + 1.1, cx=L_CX),
        line("وصيحةً يُعتزى بها.", "sans_light", 46, IVORY, 580, b + 1.9, cx=L_CX),
    ], push=0.01, name="08 idea"))
    b = 131.67
    S.append(Shot(b, 138.33, "album",
                  [portrait_right("p10", b + 0.05, 137.4, h=930, rot=-1.0, push=0.04,
                                  fin=0.6, fout=0.8)]
                  + words(["اعتزي", "بأهل", "المهابه"], V, 100, IVORY, 470, b + 0.3, cx=L_CX,
                          fin=1.0, t_out=137.4, fout=0.8)
                  + words(["ربعي", "هم", "عز", "القرابه"], V, 100, IVORY, 600, b + 0.3,
                          cx=L_CX, fin=1.0, t_out=137.4, fout=0.8),
                  push=0.012, name="08 verse"))
    credits = [line("عبدالله بن دهيمش بن عبّار العنزي", V, 52, IVORY, 400, 138.5, fin=0.6,
                    t_out=142.6, fout=0.7)]
    rows = [
        "صور الأرشيف: أسرة الشاعر، وبطلبٍ منه",
        "المصادر: حسابه على منصة X ‏(‎@bnabbar) · bnabar.com · صحيفة الجزيرة · لسان العرب · Natural Earth",
        "الموسيقى: تشيلو — Freesound/flcellogrl · هارب وكونترباص — VSO2 (CC BY 3.0) · دفّ — VCSL (CC0)",
    ]
    for i, r in enumerate(rows):
        credits.append(line(r, "sans_light", 24, ASH, 500 + i * 44, 138.9, t_out=142.6,
                            fout=0.7, rise_px=0))
    S.append(Shot(138.33, DURATION, "black", credits, name="08 credits"))
    for s in S:
        for el in s.els:
            if isinstance(el, Photo):
                el.span = (s.start, s.end)
    return S


def short_chapter(start, end, num, name):
    els = [line(num, "sans_light", 96, IVORY, 500, start + 0.05, fin=0.35, alpha=0.75,
                rise_px=0),
           Rule(W / 2 + 45, W / 2 - 45, 546, start + 0.2, 0.4, color=IVORY, thick=1.2,
                alpha=0.5),
           line(name, "sans_light", 60, IVORY, 632, start + 0.3, fin=0.4, rise_px=0)]
    return Shot(start, end, "black", els, push=0.01, fade_in=0.15, fade_out=0.15,
                name=f"chapter {num}")


class Backgrounds(film.Backgrounds):
    def __init__(self):
        super().__init__()
        rel = paper_texture(seed=7) / (np.array([230, 222, 205], np.float32) / 255.0)
        # older, yellower paper for v2
        self.paper = np.clip(rel * (np.array([226, 211, 180], np.float32) / 255.0), 0, 1)
        # black album page: same fibres, very dark warm base
        self.album = np.clip(((rel - 1.0) * 2.2 + 1.0) *
                             (np.array([26, 23, 20], np.float32) / 255.0), 0, 1)
        self.black = solid(BLACK)
