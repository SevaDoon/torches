"""The edit: every shot, element and timing of the film, as data.

Times are absolute seconds on the film's timeline and match the script in
02_PREPRODUCTION.md §3. Change the film here; the renderers only execute it.
"""
import os

import numpy as np
from PIL import Image, ImageDraw

import cartography as carto
from config import ASH, BLACK, INK, IVORY, OXIDE, SLOTS, FPS, W, H
from gfx import (blit, clamp01, ease_in_out, ease_out, layout_words,
                 paper_texture, place_run, render_run, smootherstep, solid,
                 text_advance)

DURATION = 208.0


# ====================================================================== elements
class El:
    def __init__(self, t_in, t_out=None, fin=0.7, fout=0.6, dims=()):
        self.t_in, self.t_out, self.fin, self.fout = t_in, t_out, fin, fout
        self.dims = sorted(dims)            # [(t, level, dur)] opacity changes

    def opacity(self, t):
        if t < self.t_in:
            return 0.0
        a = ease_out((t - self.t_in) / self.fin) if self.fin > 0 else 1.0
        if self.t_out is not None and t >= self.t_out:
            a *= 1.0 - ease_in_out((t - self.t_out) / self.fout)
        level = 1.0
        for (td, lv, dur) in self.dims:
            if t >= td:
                p = ease_in_out((t - td) / dur)
                level = level + (lv - level) * p
        return a * level

    def rise(self, t, px):
        return px * (1.0 - ease_out((t - self.t_in) / self.fin)) if t < self.t_in + self.fin else 0.0


class Run(El):
    """A run of text placed by its left edge and baseline."""

    def __init__(self, text, key, size, color, x_left, baseline, t_in, rise_px=6,
                 alpha=1.0, **kw):
        super().__init__(t_in, **kw)
        self.g = render_run(text, key, size, tuple(color))
        self.x, self.b, self.rise_px, self.alpha = x_left, baseline, rise_px, alpha

    def draw(self, frame, t):
        o = self.opacity(t) * self.alpha
        if o > 0:
            place_run(frame, self.g, self.x, self.b + self.rise(t, self.rise_px), o)


def line(text, key, size, color, baseline, t_in, cx=W / 2, **kw):
    """A centred single line."""
    adv = text_advance(text, key, size)
    return Run(text, key, size, color, cx - adv / 2, baseline, t_in, **kw)


def words(tokens, key, size, color, baseline, times, cx=W / 2, joiners=(), **kw):
    """Word-by-word RTL line. `times` is one t_in per token (or a scalar)."""
    if not isinstance(times, (list, tuple)):
        times = [times] * len(tokens)
    out = []
    for (tok, x_left, wd), t in zip(layout_words(tokens, key, size, cx, joiners), times):
        r = Run(tok, key, size, color, x_left, baseline, t, **kw)
        r.width = wd
        out.append(r)
    return out


def card(lines_, baselines, times, t_out, size=42, key="sans_light", color=IVORY, **kw):
    return [line(tx, key, size, color, b, t, t_out=t_out, **kw)
            for tx, b, t in zip(lines_, baselines, times)]


class Rule(El):
    """A hairline drawn right-to-left (the way an Arabic hand moves)."""

    def __init__(self, x_right, x_left, y, t_in, draw_dur, color=INK, thick=2.0,
                 alpha=1.0, **kw):
        super().__init__(t_in, fin=0.01, **kw)
        self.xr, self.xl, self.y, self.dur = x_right, x_left, y, draw_dur
        self.col = np.array(color, np.float32) / 255.0
        self.thick, self.alpha = thick, alpha

    def draw(self, frame, t):
        if t < self.t_in:
            return
        o = self.opacity(t) * self.alpha
        p = ease_in_out((t - self.t_in) / self.dur)
        x_end = self.xr - (self.xr - self.xl) * p
        x0, x1 = int(np.floor(x_end)), int(np.ceil(self.xr))
        if x1 <= x0:
            return
        cov = np.ones(x1 - x0, np.float32)
        cov[0] = 1.0 - (x_end - x0)
        # tapered ends, slight pressure variation — a pen, not a vector stroke
        n = x1 - x0
        u = np.linspace(0, 1, n, dtype=np.float32)
        cov *= np.clip(np.minimum(u, 1 - u) * n / 6.0, 0.25, 1.0)
        y0 = self.y - self.thick / 2
        for row in range(int(np.floor(y0)), int(np.ceil(y0 + self.thick)) + 1):
            vc = clamp01(min(row + 1, y0 + self.thick) - max(row, y0))
            if vc <= 0 or not (0 <= row < H):
                continue
            a = (cov * vc * o)[:, None]
            seg = frame[row, x0:x1]
            seg *= (1 - a)
            seg += a * self.col


class Band(El):
    """Soft paper-coloured band so cards stay legible over the map."""

    def __init__(self, y0, t_in, **kw):
        super().__init__(t_in, **kw)
        ramp = np.clip((np.arange(H - y0, dtype=np.float32)) / 150.0, 0, 1) * 0.86
        self.y0 = y0
        self.a = ramp[:, None, None]
        self.col = np.array((226, 218, 200), np.float32) / 255.0

    def draw(self, frame, t):
        o = self.opacity(t)
        if o > 0:
            seg = frame[self.y0:]
            a = self.a * o
            seg *= (1 - a)
            seg += a * self.col


class Box(El):
    """Dashed placeholder box (unverified verse slot)."""

    def __init__(self, x0, y0, x1, y1, t_in, color=ASH, **kw):
        super().__init__(t_in, **kw)
        im = Image.new("L", (x1 - x0, y1 - y0), 0)
        d = ImageDraw.Draw(im)
        w, h = im.size
        for x in range(0, w, 14):
            d.line([(x, 0), (min(x + 7, w), 0)], fill=255)
            d.line([(x, h - 1), (min(x + 7, w), h - 1)], fill=255)
        for y in range(0, h, 14):
            d.line([(0, y), (0, min(y + 7, h))], fill=255)
            d.line([(w - 1, y), (w - 1, min(y + 7, h))], fill=255)
        a = np.asarray(im, np.float32) / 255.0 * 0.7
        rgba = np.zeros((h, w, 4), np.float32)
        rgba[..., :3] = a[..., None] * (np.array(color, np.float32) / 255.0)
        rgba[..., 3] = a
        self.rgba, self.x, self.y = rgba, x0, y0

    def draw(self, frame, t):
        blit(frame, self.rgba, self.x, self.y, self.opacity(t))


def wip_flag(t_in, t_out):
    """Burn-in marking text still awaiting verification against the source."""
    txt = "قيد المطابقة مع المصدر"
    adv = text_advance(txt, "sans", 22)
    x_right = W - 96
    return [Run(txt, "sans", 22, ASH, x_right - adv, 104, t_in, rise_px=0,
                t_out=t_out, alpha=0.85, fin=0.4, fout=0.3),
            Rule(x_right + 14, x_right - adv - 14, 116, t_in, 0.01, color=ASH,
                 thick=1.0, alpha=0.6, t_out=t_out, fout=0.3)]


# ====================================================================== shots
class Shot:
    def __init__(self, start, end, bg="black", els=(), push=0.0, anchor=(0.5, 0.5),
                 fade_in=0.0, fade_out=0.0, overlays=(), slot=None, map_=None, name=""):
        self.start, self.end, self.bg = start, end, bg
        self.els, self.push, self.anchor = list(els), push, anchor
        self.fade_in, self.fade_out = fade_in, fade_out
        self.overlays, self.slot, self.map, self.name = list(overlays), slot, map_, name

    def gain(self, t):
        g = 1.0
        if self.fade_in > 0:
            g *= ease_in_out((t - self.start) / self.fade_in)
        if self.fade_out > 0:
            g *= ease_in_out((self.end - t) / self.fade_out)
        return g

    def push_at(self, t):
        return self.push * (t - self.start) / (self.end - self.start)


def chapter(start, end, num, name):
    els = [line(num, "sans_light", 104, IVORY, 500, start + 0.3, t_out=end - 0.7,
                fin=0.9, alpha=0.75),
           Rule(W / 2 + 45, W / 2 - 45, 548, start + 0.7, 0.6, color=IVORY, thick=1.2,
                alpha=0.5, t_out=end - 0.7),
           line(name, "sans_light", 56, IVORY, 632, start + 0.9, t_out=end - 0.7, fin=0.9)]
    return Shot(start, end, "black", els, push=0.008, fade_in=0.4, fade_out=0.3,
                name=f"chapter {num}")


def slot_card(code, title, detail, source):
    return [
        Run(code, "sans_medium", 26, ASH, W - 150 - text_advance(code, "sans_medium", 26),
            196, 0, fin=0.0, rise_px=0),
        line(title, "sans_light", 40, IVORY, 520, 0, fin=0.0, rise_px=0, alpha=0.9),
        line(detail, "sans_light", 30, IVORY, 580, 0, fin=0.0, rise_px=0, alpha=0.7),
        line(source, "sans", 24, ASH, 650, 0, fin=0.0, rise_px=0),
        line(f"مادة أرشيفية أصلية — تُستبدل تلقائياً عند إضافة slots/{code}.mp4",
             "sans_light", 22, ASH, 900, 0, fin=0.0, rise_px=0, alpha=0.7),
    ]


def build_shots():
    S = []
    V, VS = "verse", 92
    # ------------------------------------------------------------ 01 — hook
    h1 = words(["اعتزي", "بأهل", "المهابه"], V, VS, IVORY, 500, [2.5, 4.3, 5.1],
               fin=0.8, t_out=14.5, fout=1.2)
    h1[0].t_out = 15.8
    h2 = words(["ربعي", "هم", "عز", "القرابه"], V, VS, IVORY, 622, [7.3, 8.1, 8.6, 9.2],
               fin=0.8, t_out=14.5, fout=1.2)
    src = line("من دحّة «حمران النواظر» — كلمات: عبدالله بن عبار", "sans", 24, ASH,
               770, 11.0, t_out=14.0, fout=0.8, rise_px=0)
    S.append(Shot(0.0, 17.0, "black", h1 + h2 + [src], push=0.018, anchor=(0.5, 0.52),
                  name="01 hook"))
    S.append(Shot(17.0, 21.0, "black",
                  [line("ماذا قال بن عبار عن عنزة؟", "sans_light", 64, IVORY, 560, 17.3,
                        fin=1.2, t_out=20.1, fout=0.8, rise_px=0)],
                  push=0.01, name="01 title"))

    # ------------------------------------------------------------ 02 — the voice
    S.append(Shot(21.0, 27.0, "slot", slot_card(
        "A2", "عبدالله بن عبار في مكتبته",
        "لقطة من زيارة «قناة الشامخ» لمكتبته، بصوته",
        "يوتيوب: a45BeaY7K4k · vQDAaqRUKTA"), slot="A2", name="02 slot A2"))
    S.append(Shot(27.0, 35.0, "paper", [
        line("عبدالله بن دهيمش بن عبّار العنزي", V, 78, INK, 468, 27.4, fin=1.0),
        Rule(W / 2 + 80, W / 2 - 80, 520, 28.3, 0.8, color=INK, thick=1.3, alpha=0.5),
        line("شاعر ونسّابة، ومؤرخ لقبائل ربيعة عامة، وعنزة خاصة", "sans_light", 38, INK,
             594, 29.2),
        line("وُلد في شمال الجزيرة العربية عام ١٣٦٥هـ، ونشأ في البادية", "sans_light", 32,
             INK, 652, 30.5, alpha=0.75),
    ], push=0.02, name="02 name"))
    S.append(Shot(35.0, 42.0, "black", card(
        ["أصدر كتباً في الأنساب والتاريخ والقصص الشعبية،",
         "ونظم — بحسب سيرته المنشورة — أكثر من خمسين ألف بيت."],
        [515, 588], [35.4, 37.0], 41.1), push=0.012, name="02 card"))
    S.append(Shot(42.0, 48.0, "black", [
        line("٥٠٬٠٠٠", "sans_light", 190, IVORY, 600, 42.2, fin=0.8, t_out=44.6, rise_px=0),
        line("بيت — مجمل شعره، بحسب سيرته", "sans_light", 30, ASH, 700, 42.6, t_out=44.6,
             rise_px=0),
        line("٣٠٠٠", "sans_light", 190, IVORY, 600, 45.1, fin=0.8, rise_px=0),
        line("بيت عن عنزة — بحسب قوله", "sans_light", 30, ASH, 700, 45.5, rise_px=0),
    ], push=0.012, name="02 numbers"))

    # ------------------------------------------------------------ 03 — his own words
    q1 = words(["كتبت", "اكثر", "من", "3000", "بيت", "من", "الشعر"], V, 66, INK, 478,
               48.6, fin=1.0, dims=[(60.0, 0.16, 0.9)])
    q2 = words(["في", "الفخر", "والدفاع", "والرد", "…"], V, 66, INK, 572, 50.3, fin=1.0,
               joiners=(4,))
    for i, w_ in enumerate(q2):
        if i in (0, 4):
            w_.dims = [(60.0, 0.16, 0.9)]
    qsrc = line("عبدالله بن عبار — حسابه على منصة X، ٦ أبريل ٢٠٢٠", "sans", 26, INK, 690,
                52.0, alpha=0.6, dims=[(60.0, 0.4, 0.9)])
    unders = []
    for w_, t in zip(q2[1:4], (61.0, 61.9, 62.8)):
        xr = w_.x + w_.width
        xl = w_.x if w_ is not q2[3] else xr - text_advance("والرد", V, 66)
        unders.append(Rule(xr + 4, xl - 4, 598, t, 0.42, color=OXIDE, thick=3.2, alpha=0.95))
    S.append(Shot(48.0, 66.0, "paper", q1 + q2 + [qsrc] + unders, push=0.02,
                  anchor=(0.5, 0.5), name="03 quote"))
    S.append(Shot(66.0, 72.0, "black", card(
        ["ثلاث كلمات من عنده: الفخر، والدفاع، والرد.", "ومنها نقرأ ما قاله عن عنزة."],
        [515, 588], [66.4, 67.9], 70.9), push=0.012, fade_out=0.5, name="03 card"))

    # ------------------------------------------------------------ 04 — pride
    S.append(chapter(72.0, 75.5, "١", "الفخر"))
    S.append(Shot(75.5, 86.0, "black", [
        line("اعتزي", V, 160, IVORY, 500, 75.8, fin=1.0, t_out=80.2),
        line("اعتزى إلى القوم: انتسب إليهم.", "sans_light", 34, IVORY, 612, 77.0,
             t_out=80.2, alpha=0.85),
        line("لسان العرب، مادة «عزا»", "sans", 24, ASH, 662, 77.6, t_out=80.2, rise_px=0),
    ] + card(["في الدحّة التي كتبها لفرعه، الفدعان، لا يبدأ بوصف القبيلة…",
              "يبدأ بإعلان الانتماء."], [515, 588], [80.9, 82.8], 85.2),
        push=0.012, name="04 i'tazi"))
    S.append(Shot(86.0, 99.0, "map", [
        Band(830, 87.4, fin=1.0),
    ] + card(["عنزة، في روايات المؤرخين: من خيبر والعُلا في شمال الحجاز…",
              "…إلى بادية الشام والعراق."], [950, 1006], [88.0, 93.4], 98.2,
             size=40, color=INK),
        map_=dict(k0=(86.0, 42.5, 27.0, 19.5), k1=(99.0, 38.3, 28.6, 13.5),
                  marker=87.2, route=(90.0, 96.5)), name="04 map"))
    S.append(Shot(99.0, 107.2, "paper", [
        line("الملحمة الوائلية الكبرى", V, 84, INK, 400, 99.4, fin=1.0, t_out=106.6),
        line("نحو ٥٠٠ بيت", "sans_light", 36, INK, 500, 101.0, t_out=106.6),
        line("سُجّلت على أشرطة قبل نحو أربعين عاماً", "sans_light", 36, INK, 560, 102.4,
             t_out=106.6),
        line("ولم يُنشر منها إلا بعضها", "sans_light", 36, INK, 620, 103.8, t_out=106.6),
    ], push=0.018, name="04 epic"))
    S.append(Shot(107.2, 113.0, "black", [
        line("يقول إن كثيراً منها يتضمن أحداثاً…", "sans_light", 42, IVORY, 515, 107.5,
             t_out=111.6, fout=0.8),
        line("لا تُنشر.", "sans_light", 56, IVORY, 610, 109.6, t_out=111.6, fout=0.8),
    ], push=0.01, overlays=wip_flag(107.5, 111.8), name="04 unpublished"))

    # ------------------------------------------------------------ 05 — defence
    S.append(chapter(113.0, 116.5, "٢", "الدفاع"))
    S.append(Shot(116.5, 124.0, "black", [
        line("عَنَزَة", V, 170, IVORY, 500, 116.8, fin=1.0, t_out=123.2),
        line("عصا في قدر نصف الرمح أو أكثر، فيها سنانٌ مثل سنان الرمح.", "sans_light", 34,
             IVORY, 618, 118.2, t_out=123.2, alpha=0.85),
        line("لسان العرب، مادة «عنز»", "sans", 24, ASH, 668, 118.8, t_out=123.2, rise_px=0),
    ], push=0.012, name="05 anaza"))
    chain = words(["عامر", "بن", "أسد", "بن", "ربيعة", "بن", "نزار"], V, 88, IVORY, 468,
                  [124.3, 125.3, 125.3, 126.3, 126.3, 127.3, 127.3], t_out=134.2)
    amer = chain[0]
    cx_amer = amer.x + amer.width / 2
    lineage = chain + [
        line("«عنزة»", "sans_light", 30, IVORY, 548, 128.4, cx=cx_amer, t_out=134.2,
             alpha=0.75),
    ] + card(["في أبياتٍ نشرها عام ٢٠٢١، يعود بن عبار إلى الجدّ الأول…",
              "…الذي طعن رجلاً بالعَنَزة، فلُقّب بها، وبقي اللقب في ذريته."],
             [676, 736], [129.3, 131.1], 134.2, size=36) + [
        Box(W // 2 - 520, 800, W // 2 + 520, 880, 132.6, t_out=134.2),
        line("[ بيت الجد عامر — يُدرج هنا بعد مطابقته بمنشوره في ٢٥ يونيو ٢٠٢١ ]",
             "sans_light", 26, ASH, 850, 132.6, t_out=134.2, rise_px=0),
    ]
    S.append(Shot(124.0, 135.0, "black", lineage, push=0.012,
                  overlays=wip_flag(132.6, 134.4), name="05 lineage"))
    S.append(Shot(135.0, 142.0, "paper", [
        line("أصدق الدلائل في أنساب بني وائل", V, 76, INK, 460, 135.4, fin=1.0),
        line("ثلاثون عاماً من البحث", "sans_light", 38, INK, 560, 136.8),
        line("أكثر من ٦٠٠ صفحة في طبعته الخامسة", "sans_light", 32, INK, 620, 137.9,
             alpha=0.75),
        line("صحيفة الجزيرة، ٤ سبتمبر ٢٠٠٠", "sans", 24, INK, 700, 138.6, alpha=0.55,
             rise_px=0),
    ], push=0.018, fade_out=0.5, name="05 book"))

    # ------------------------------------------------------------ 06 — reply
    S.append(chapter(142.0, 145.5, "٣", "الرد"))
    S.append(Shot(145.5, 151.0, "paper", [
        line("الى من حرّف نسبنا وعاب جدنا", V, 80, INK, 510, 145.9, fin=1.0),
        line("عبدالله بن عبار — منصة X، ١٦ مايو ٢٠٢٥", "sans", 26, INK, 610, 147.2,
             alpha=0.55, rise_px=0),
    ], push=0.018, name="06 post"))
    S.append(Shot(151.0, 159.0, "black",
                  words(["ياللي", "عن", "الأنساب", "تكتب", "مهازل"], V, VS, IVORY, 520,
                        [151.5, 152.3, 152.8, 153.8, 154.5], fin=0.8, t_out=158.2)
                  + [line("ويطالب من يخالفه بأن يأتي بمصدره.", "sans_light", 40, IVORY,
                          660, 155.8, t_out=158.2)],
                  push=0.014, overlays=wip_flag(151.5, 158.4), name="06 verse"))
    S.append(Shot(159.0, 168.0, "black", card(
        ["ولم يكن كل ما قاله محلّ اتفاق؛",
         "فلآرائه في النسب منتقدون، وبينه وبينهم ردود."],
        [470, 532], [159.4, 160.6], 166.8, size=36, alpha=0.85) + [
        line("هذا الفيلم لا يحكم في النسب… بل يُصغي إلى الشاعر.", "sans_light", 40, IVORY,
             652, 163.2, t_out=166.8)], push=0.01, name="06 balance"))

    # ------------------------------------------------------------ 07 — his voice
    S.append(Shot(168.0, 180.0, "slot", slot_card(
        "A3", "عبدالله بن عبار يلقي من شعره في عنزة",
        "بصوته الأصلي، دون موسيقى، ودون أي تحريك للصورة",
        "قناته على يوتيوب ‎@bnabar1 · أو حساب TikTok ‏‎@bn.abbar"), slot="A3",
        name="07 slot A3"))

    # ------------------------------------------------------------ 08 — ending
    S.append(Shot(180.0, 192.0, "black", card(
        ["في شعره، لا تظهر عنزة خبراً من الماضي…",
         "بل اسماً يُحفظ، ونسباً يُدافع عنه، وصيحةً يُعتزى بها."],
        [515, 592], [180.5, 185.5], 190.8, size=44), push=0.012, name="08 idea"))
    S.append(Shot(192.0, 201.0, "black",
                  words(["اعتزي", "بأهل", "المهابه"], V, VS, IVORY, 500, 192.4, fin=1.4,
                        t_out=199.6, fout=1.2)
                  + words(["ربعي", "هم", "عز", "القرابه"], V, VS, IVORY, 622, 192.4,
                          fin=1.4, t_out=199.6, fout=1.2),
                  push=0.012, anchor=(0.5, 0.52), name="08 verse"))
    credits = [line("المصادر", "sans_medium", 26, IVORY, 372, 201.3, t_out=207.0, fout=1.0,
                    rise_px=0, alpha=0.9)]
    rows = [
        "حساب عبدالله بن عبار على منصة X ‏(‎@bnabbar) · منتدى قبيلة عنزة (bnabar.com)",
        "صحيفة الجزيرة (٢٠٠٠) · لسان العرب · ويكيبيديا: عنزة · بيانات Natural Earth",
        "الموسيقى: تشيلو — Freesound/flcellogrl · هارب وكونترباص — VSO2 (CC BY 3.0) · دفّ — VCSL (CC0)",
        "الخطوط: Amiri · IBM Plex Sans Arabic (SIL OFL)",
    ]
    for i, r in enumerate(rows):
        credits.append(line(r, "sans_light", 24, ASH, 440 + i * 46, 201.5, t_out=207.0,
                            fout=1.0, rise_px=0))
    credits.append(line("نسخة عمل — المواد الأرشيفية الأصلية تُدرج في النسخة النهائية",
                        "sans_light", 24, IVORY, 700, 202.0, t_out=207.0, fout=1.0,
                        rise_px=0, alpha=0.7))
    S.append(Shot(201.0, DURATION, "black", credits, name="08 credits"))
    return S


# ====================================================================== backgrounds
class Backgrounds:
    def __init__(self):
        self.black = solid(BLACK)
        self.paper = paper_texture(seed=7)
        self.slot_bg = solid((20, 19, 16))
        frame = Image.new("L", (W, H), 0)
        d = ImageDraw.Draw(frame)
        d.rectangle([120, 130, W - 121, H - 131], outline=255, width=1)
        self.slot_frame = np.asarray(frame, np.float32)[..., None] / 255.0 * 0.22
        self._cam = None

    def cam(self):
        if self._cam is None:
            canvas, labels = carto.build()
            self._cam = carto.MapCamera(canvas, labels)
        return self._cam

    def map_view(self, m, t):
        t0, lo0, la0, h0 = m["k0"]
        t1, lo1, la1, h1 = m["k1"]
        p = smootherstep((t - t0) / (t1 - t0))
        lon, lat = lo0 + (lo1 - lo0) * p, la0 + (la1 - la0) * p
        # zoom in log space so the move feels even
        hd = float(np.exp(np.log(h0) + (np.log(h1) - np.log(h0)) * p))
        cam = self.cam()
        f, _ = cam.view(lon, lat, hd)
        mk = clamp01((t - m["marker"]) / 0.6)
        carto.draw_marker(f, cam, lon, lat, hd, ease_out(mk))
        r0, r1 = m["route"]
        carto.draw_route(f, cam, lon, lat, hd, ease_in_out((t - r0) / (r1 - r0)))
        return f


class SlotReader:
    """Streams frames of slots/<code>.mp4 (if present) to the film timeline."""

    def __init__(self, code, shot_start):
        self.path = next((os.path.join(SLOTS, code + e) for e in (".mp4", ".mov", ".mkv")
                          if os.path.exists(os.path.join(SLOTS, code + e))), None)
        self.code, self.shot_start = code, shot_start
        self.proc, self.next_t = None, None
        trims = os.path.join(SLOTS, "trims.json")
        self.trim = 0.0
        if os.path.exists(trims):
            import json
            self.trim = float(json.load(open(trims)).get(code, 0.0))

    @property
    def available(self):
        return self.path is not None

    def frame(self, t):
        import subprocess
        local = t - self.shot_start + self.trim
        if self.proc is None or self.next_t is None or abs(local - self.next_t) > 0.5 / FPS:
            if self.proc:
                self.proc.kill()
            vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                  f"fps={FPS},format=rgb24")
            self.proc = subprocess.Popen(
                ["ffmpeg", "-v", "error", "-ss", f"{local:.3f}", "-i", self.path,
                 "-vf", vf, "-f", "rawvideo", "-"], stdout=subprocess.PIPE)
            self.next_t = local
        buf = self.proc.stdout.read(W * H * 3)
        self.next_t += 1.0 / FPS
        if len(buf) < W * H * 3:
            return None
        return np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255.0
