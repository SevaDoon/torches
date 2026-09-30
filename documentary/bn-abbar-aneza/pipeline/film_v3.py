"""v3 — the final cut. No music. Modern, smooth, and in the poet's honour.

The film is assembled on a running clock: every block starts where the last
one ended, so the interview excerpts (slots/interview.* + slots/cuts.json)
can be any length and the edit re-flows around them.

cuts.json:
{
  "I1": {"in": 83.2, "out": 101.0,
         "subs": [[0.0, 4.1, "…"], [4.1, 9.0, "…"]]},     # optional subtitles
  ...
}
Slots I1–I5; a slot missing from cuts.json is skipped. With no interview
file at all, each slot shows a labelled placeholder so the cut can be judged.
"""
import json
import os
import subprocess

import numpy as np
from PIL import Image, ImageFilter

import cartography as carto
from archive import Photo, load_photo, tone
from config import BLACK, FPS, H, IVORY, SLOTS, W
from film import El, Rule, Run, Shot, line, words
import film
from gfx import ease_in_out, ease_out, clamp01, push, solid, text_advance

carto.STYLE = "dark"
LOOK = "modern"
GRAIN = 1.6
GOLD = (212, 175, 106)
SOFT = (196, 188, 172)
V = "verse"
L_CX, R_CX = 560, 1350
SH = 0.75                        # text shadow strength over photographs

# ---------------------------------------------------------------- interview source
INTERVIEW = next((os.path.join(SLOTS, "interview" + e) for e in (".mp4", ".mov", ".mkv", ".m4v",
                                                                 ".webm")
                  if os.path.exists(os.path.join(SLOTS, "interview" + e))), None)
_cp = os.path.join(SLOTS, "cuts.json")
CUTS = json.load(open(_cp, encoding="utf-8")) if os.path.exists(_cp) else {}
PLACEHOLDER_LEN = 14.0


def clip_len(code):
    if INTERVIEW is None:
        return PLACEHOLDER_LEN
    c = CUTS.get(code)
    return None if c is None else float(c["out"]) - float(c["in"])


# ---------------------------------------------------------------- elements
class BlurFill(El):
    """Modern full-frame backdrop: the same photograph, enlarged, blurred and
    dimmed, drifting slowly — gives colour and depth behind the sharp print."""
    _cache = {}

    def __init__(self, name, t_in, t_end, dim=0.36, drift=0.06, **kw):
        super().__init__(t_in, fin=0.0, **kw)
        self.name, self.t_end, self.drift = name, t_end, drift
        if name not in BlurFill._cache:
            im = tone(load_photo(name), name)
            s = max(W / im.width, H / im.height) * 1.02
            im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1), Image.BICUBIC)
            l, t = (im.width - W) // 2, (im.height - H) // 2
            im = im.crop((l, t, l + W, t + H)).filter(ImageFilter.GaussianBlur(38))
            a = np.asarray(im, np.float32) / 255.0
            g = a.mean(axis=2, keepdims=True)
            BlurFill._cache[name] = np.clip((a * 0.7 + g * 0.3) * dim, 0, 1)
        self.base = BlurFill._cache[name]

    def draw(self, frame, t):
        p = clamp01((t - self.t_in) / max(0.1, self.t_end - self.t_in))
        frame[:] = push(self.base, self.drift * p)


class DarkBand(El):
    """Bottom gradient so captions read cleanly over the map."""

    def __init__(self, y0, t_in, **kw):
        super().__init__(t_in, fin=0.8, **kw)
        self.y0 = y0
        self.a = (np.clip(np.arange(H - y0, dtype=np.float32) / 220.0, 0, 1) ** 1.3
                  * 0.85)[:, None, None]

    def draw(self, frame, t):
        o = self.opacity(t)
        if o > 0:
            frame[self.y0:] *= (1 - self.a * o)


class GoldRule(Rule):
    def __init__(self, cx, y, width, t_in, dur=0.5, **kw):
        super().__init__(cx + width / 2, cx - width / 2, y, t_in, dur, color=GOLD, thick=1.6,
                         **kw)


class Clip(El):
    """An excerpt of the interview, fitted to 16:9 (vertical sources get a
    blurred fill behind them). Streams frames from ffmpeg."""

    def __init__(self, code, t_in, dur):
        super().__init__(t_in, fin=0.0)
        self.code, self.dur = code, dur
        self.src_in = float(CUTS.get(code, {}).get("in", 0.0))
        self.proc, self.next_t = None, None
        self.vertical = _is_vertical(INTERVIEW) if INTERVIEW else False

    def _open(self, local):
        if self.proc:
            self.proc.kill()
        if self.vertical:
            vf = (f"split[a][b];[a]scale={W}:{H}:force_original_aspect_ratio=increase,"
                  f"crop={W}:{H},gblur=sigma=40,eq=brightness=-0.22:saturation=0.8[bg];"
                  f"[b]scale=-2:{H}[fg];[bg][fg]overlay=(W-w)/2:0,fps={FPS},format=rgb24")
        else:
            vf = (f"scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},"
                  f"fps={FPS},format=rgb24")
        self.proc = subprocess.Popen(
            ["ffmpeg", "-v", "error", "-ss", f"{self.src_in + local:.3f}", "-i", INTERVIEW,
             "-filter_complex" if self.vertical else "-vf", vf, "-an", "-f", "rawvideo", "-"],
            stdout=subprocess.PIPE)
        self.next_t = local

    def draw(self, frame, t):
        if INTERVIEW is None:
            return
        local = t - self.t_in
        if self.proc is None or abs(local - self.next_t) > 0.5 / FPS:
            self._open(local)
        buf = self.proc.stdout.read(W * H * 3)
        self.next_t += 1.0 / FPS
        if len(buf) == W * H * 3:
            frame[:] = np.frombuffer(buf, np.uint8).reshape(H, W, 3).astype(np.float32) / 255.0


def _is_vertical(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path], capture_output=True, text=True)
    import re
    m = re.search(r"Video:.*?(\d{2,5})x(\d{2,5})", r.stderr)
    rot = re.search(r"rotate\s*:\s*(-?\d+)|displaymatrix: rotation of (-?[\d.]+)", r.stderr)
    if not m:
        return False
    w, h = int(m.group(1)), int(m.group(2))
    if rot and abs(float(rot.group(1) or rot.group(2))) % 180 == 90:
        w, h = h, w
    return w / h < 1.5


def text(txt, key, size, y, t_in, cx=W / 2, color=IVORY, **kw):
    kw.setdefault("shadow", SH)
    return line(txt, key, size, color, y, t_in, cx=cx, **kw)


# ---------------------------------------------------------------- blocks
class Edit:
    def __init__(self):
        self.shots, self.t = [], 0.0

    def add(self, dur, bg, els, xfade=0.0, **kw):
        s = Shot(self.t, self.t + dur, bg, els, **kw)
        s.xfade = xfade
        for el in els:
            if isinstance(el, Photo):
                el.span = (s.start, s.end)
        self.shots.append(s)
        self.t += dur
        return s

    # A photograph on its own blurred backdrop, text column on the left.
    def photo(self, name, dur, lines_, h=880, xfade=0.5, photo_cx=R_CX, text_cx=L_CX,
              first=0.35, step=0.9, name_line=None):
        t0 = self.t
        els = [BlurFill(name, t0, t0 + dur + 0.6),
               Photo(name, photo_cx, H / 2 + 4, h, t0, rot=0.0, push=0.045, border=False,
                     corners=False, fin=0.0, max_w=720)]
        y = 540 - (len(lines_) - 1) * 34
        for i, (txt, key, size) in enumerate(lines_):
            els.append(text(txt, key, size, y + i * 68, t0 + first + i * step, cx=text_cx))
        return self.add(dur, "black", els, xfade=xfade, push=0.0)

    def card(self, dur, lines_, xfade=0.0, step=1.0, first=0.3, gap=None, fout=None):
        """Centred block; baselines spaced by the sizes of neighbouring lines."""
        t0 = self.t
        ys, y = [], 0.0
        for i, (_, key, size) in enumerate(lines_):
            if i:
                prev = lines_[i - 1][2]
                y += prev * (0.62 if lines_[i - 1][1] == V else 0.55) + size * 1.05 + 18
            ys.append(y)
        off = 560 - (ys[-1] + lines_[0][2] * 0.3) / 2
        els = []
        for i, (txt, key, size) in enumerate(lines_):
            els.append(text(txt, key, size, off + ys[i], t0 + first + i * step,
                            shadow=0.0, t_out=(t0 + dur - 0.55) if fout else None,
                            fout=0.45))
        return self.add(dur, "black", els, xfade=xfade, push=0.012)

    def chapter(self, num, name):
        t0 = self.t
        label = {"١": "الفصل الأول", "٢": "الفصل الثاني", "٣": "الفصل الثالث"}[num]
        els = [text(label, "sans", 30, 492, t0 + 0.05, color=GOLD, shadow=0.0, rise_px=0,
                    fin=0.35),
               GoldRule(W / 2, 530, 90, t0 + 0.2, 0.45),
               text(name, "sans_medium", 72, 628, t0 + 0.3, shadow=0.0, rise_px=0, fin=0.4)]
        return self.add(2.2, "black", els, push=0.01, fade_in=0.2, fade_out=0.25,
                        name=f"chapter {num}")

    def interview(self, code, lower_third=False):
        d = clip_len(code)
        if d is None:
            return None
        t0 = self.t
        els = []
        if INTERVIEW is None:          # placeholder for review only
            els = [BlurFill("p15", t0, t0 + d, dim=0.28),
                   Photo("p15", W / 2, H / 2 - 10, 760, t0, rot=0.0, push=0.04, border=False,
                         corners=False, fin=0.0),
                   text(f"مقطع من «لقاء بن عبار» — {code}", "sans_light", 30, 1010, t0 + 0.2,
                        color=SOFT, rise_px=0)]
        else:
            els = [Clip(code, t0, d)]
            for a, b, s in CUTS.get(code, {}).get("subs", []):
                els.append(text(s, "sans_medium", 40, 1000, t0 + a, t_out=t0 + b - 0.15,
                                fin=0.15, fout=0.15, rise_px=0, shadow=0.95))
        if lower_third:
            xr = W - 130
            els += [
                Rule(xr, xr - 360, 868, t0 + 0.8, 0.5, color=GOLD, thick=1.6,
                     t_out=t0 + 6.0, fout=0.5),
                Run("عبدالله بن عبار", "sans_medium", 38, IVORY,
                    xr - text_advance("عبدالله بن عبار", "sans_medium", 38), 850, t0 + 1.0,
                    t_out=t0 + 6.0, fout=0.5, shadow=0.9, rise_px=4),
                Run("شاعر ونسّابة ومؤرخ", "sans_light", 28, SOFT,
                    xr - text_advance("شاعر ونسّابة ومؤرخ", "sans_light", 28), 912, t0 + 1.3,
                    t_out=t0 + 6.0, fout=0.5, shadow=0.9, rise_px=4),
            ]
        s = self.add(d, "black", els, push=0.0)
        s.clip = code
        return s


def build_shots():
    E = Edit()
    # ------------------------------------------------ 01 hook
    t0 = E.t
    hook = [BlurFill("p10", t0, t0 + 9.5),
            Photo("p10", R_CX, H / 2 + 4, 900, t0 + 0.3, rot=0.0, push=0.05, border=False,
                  corners=False, fin=0.9, max_w=720)]
    hook += words(["اعتزي", "بأهل", "المهابه"], V, 104, IVORY, 480, [t0 + 1.2, t0 + 2.0,
                                                                    t0 + 2.5],
                  cx=L_CX, fin=0.7, shadow=SH)
    hook += words(["ربعي", "هم", "عز", "القرابه"], V, 104, IVORY, 612,
                  [t0 + 3.7, t0 + 4.2, t0 + 4.5, t0 + 4.9], cx=L_CX, fin=0.7, shadow=SH)
    hook += [GoldRule(L_CX, 690, 70, t0 + 6.0),
             text("عبدالله بن عبار", "sans", 30, 745, t0 + 6.3, cx=L_CX, color=GOLD,
                  rise_px=0)]
    E.add(9.0, "black", hook, push=0.0, fade_in=0.6)
    # ------------------------------------------------ title
    t0 = E.t
    E.add(3.6, "black", [
        GoldRule(W / 2, 470, 120, t0 + 0.2, 0.6),
        text("ماذا قال بن عبار عن عنزة؟", "sans_medium", 76, 570, t0 + 0.3, shadow=0.0,
             rise_px=0, fin=0.8, t_out=t0 + 3.0, fout=0.5),
        GoldRule(W / 2, 630, 120, t0 + 0.4, 0.6),
    ], xfade=0.6, push=0.012)
    # ------------------------------------------------ 02 who
    E.photo("p01", 4.2, [("عبدالله بن دهيمش بن عبّار العنزي", V, 58),
                         ("شاعرٌ ونسّابة، ومؤرخ قبيلة عنزة وقبائل ربيعة", "sans", 36)],
            xfade=0.5)
    E.photo("p04", 3.4, [("وُلد عام ١٣٦٥هـ في شمال الجزيرة العربية", "sans", 38),
                         ("ونشأ في البادية", "sans", 38)])
    E.photo("p17", 2.6, [])
    E.photo("p16", 3.8, [("خدم في الوظيفة ستةً وعشرين عاماً", "sans", 40)], h=640)
    E.photo("p11", 2.2, [("وكتب في الصحافة…", "sans", 44)])
    E.photo("p03", 1.9, [("وكتب في الصحافة…", "sans", 44)], first=-1.0, xfade=0.35)
    E.photo("p13", 3.4, [("…وألّف في الأنساب والشعر والتراث", "sans", 42)], h=660)
    # ------------------------------------------------ interview I1
    E.interview("I1", lower_third=True)
    # ------------------------------------------------ 03 numbers + his words
    t0 = E.t
    E.add(3.6, "black", [
        text("أكثر من", "sans", 34, 398, t0 + 0.1, color=SOFT, shadow=0.0, rise_px=0),
        text("٥٠٬٠٠٠", "sans_light", 170, 590, t0 + 0.15, color=IVORY, shadow=0.0, rise_px=0,
             fin=0.5),
        text("بيت من الشعر، طرق بها أبواب الشعر كلها", "sans", 34, 690, t0 + 0.6, color=SOFT,
             shadow=0.0, rise_px=0),
    ], xfade=0.4, push=0.015)
    t0 = E.t
    E.add(3.6, "black", [
        text("أكثر من", "sans", 34, 398, t0 + 0.1, color=SOFT, shadow=0.0, rise_px=0),
        text("٣٠٠٠", "sans_light", 170, 590, t0 + 0.15, color=GOLD, shadow=0.0, rise_px=0,
             fin=0.5),
        text("بيت في عنزة وحدها", "sans", 34, 690, t0 + 0.5, color=SOFT, shadow=0.0,
             rise_px=0),
    ], push=0.015)
    t0 = E.t
    q1 = words(["كتبت", "اكثر", "من", "3000", "بيت", "من", "الشعر"], V, 76, IVORY, 480,
               t0 + 0.3, fin=0.6, dims=[(t0 + 3.2, 0.25, 0.6)])
    q2 = words(["في", "الفخر", "والدفاع", "والرد", "…"], V, 76, IVORY, 588, t0 + 1.0, fin=0.6,
               joiners=(4,))
    for i, w_ in enumerate(q2):
        if i in (0, 4):
            w_.dims = [(t0 + 3.2, 0.25, 0.6)]
    unders = []
    for w_, dt in zip(q2[1:4], (4.0, 4.6, 5.2)):
        xr = w_.x + w_.width
        xl = w_.x if w_ is not q2[3] else xr - text_advance("والرد", V, 76)
        unders.append(Rule(xr + 4, xl - 4, 618, t0 + dt, 0.36, color=GOLD, thick=3.0))
    E.add(8.0, "black", q1 + q2 + unders + [
        GoldRule(W / 2, 700, 60, t0 + 1.8),
        text("عبدالله بن عبار", "sans", 30, 752, t0 + 2.0, color=GOLD, shadow=0.0, rise_px=0),
    ], push=0.02)
    # ------------------------------------------------ 04 pride
    E.chapter("١", "الفخر")
    t0 = E.t
    E.add(6.6, "black", [
        BlurFill("p18", t0, t0 + 7.2),
        Photo("p18", R_CX, H / 2 + 4, 880, t0, rot=0.0, push=0.045, border=False,
              corners=False, fin=0.4, max_w=720),
        text("اعتزي", V, 150, 470, t0 + 0.3, cx=L_CX, fin=0.7, t_out=t0 + 3.0, fout=0.45),
        text("أنتسبُ إليهم، وأفخر بهم", "sans", 34, 566, t0 + 0.9, cx=L_CX, color=SOFT,
             t_out=t0 + 3.0, fout=0.45, rise_px=0),
        text("هكذا يفتتح دحّته في الفدعان:", "sans", 40, 505, t0 + 3.6, cx=L_CX),
        text("بإعلان الانتماء.", "sans_medium", 44, 575, t0 + 4.3, cx=L_CX, color=GOLD),
    ], push=0.0)
    t0 = E.t
    E.add(7.0, "map", [
        DarkBand(780, t0 + 0.5),
        text("من خيبر والعُلا… إلى بادية الشام والعراق", "sans", 42, 1000, t0 + 0.9,
             shadow=0.95),
    ], map_=dict(k0=(t0, 41.0, 27.6, 17.0), k1=(t0 + 7.0, 38.3, 28.6, 13.5),
                 marker=t0 + 0.5, route=(t0 + 1.2, t0 + 5.8)), xfade=0.5)
    E.card(5.8, [("الملحمة الوائلية الكبرى", V, 88),
                 ("خمسمئة بيت في أمجاد عنزة ورجالها", "sans", 40),
                 ("سجّلها على أشرطة قبل أكثر من أربعين عاماً", "sans", 34)],
           xfade=0.5, step=0.9)
    E.interview("I2")
    # ------------------------------------------------ 05 defence
    E.chapter("٢", "الدفاع")
    E.card(4.2, [("عَنَزَة", V, 170),
                 ("عصا في قدر نصف الرمح، فيها سنانٌ مثل سنان الرمح", "sans", 32)],
           step=0.8)
    t0 = E.t
    chain = words(["عامر", "بن", "أسد", "بن", "ربيعة", "بن", "نزار"], V, 94, IVORY, 470,
                  [t0 + 0.1, t0 + 0.9, t0 + 0.9, t0 + 1.6, t0 + 1.6, t0 + 2.3, t0 + 2.3])
    amer = chain[0]
    E.add(7.2, "black", chain + [
        text("«عنزة»", "sans", 32, 548, t0 + 3.0, cx=amer.x + amer.width / 2, color=GOLD,
             shadow=0.0),
        text("طعن رجلاً بالعَنَزة فلُقّب بها… وبقي اللقب في ذريته إلى اليوم", "sans", 36, 680,
             t0 + 3.6, shadow=0.0, color=SOFT),
    ], push=0.015)
    E.card(5.8, [("أصدق الدلائل في أنساب بني وائل", V, 82),
                 ("ثلاثون عاماً من البحث", "sans_medium", 42),
                 ("مرجعٌ في أنساب عنزة وقبائل ربيعة، في أكثر من ٦٠٠ صفحة", "sans", 32)],
           xfade=0.4, step=0.9)
    E.interview("I3")
    # ------------------------------------------------ 06 reply
    E.chapter("٣", "الرد")
    E.card(7.2, [("الى من حرّف نسبنا وعاب جدنا", V, 88),
                 ("وقف بشعره وعلمه في وجه من عبث بنسب قبيلته", "sans", 38),
                 ("وطالب بالمصدر والدليل", "sans_medium", 40)],
           step=1.1)
    E.interview("I4")
    # ------------------------------------------------ 08 closing
    E.photo("p05", 5.2, [("في شعره، ليست عنزة", "sans", 46), ("خبراً من الماضي…", "sans", 46)],
            h=620, xfade=0.6)
    E.photo("p02", 5.6, [("بل اسمٌ يُحفظ،", "sans", 48), ("ونسبٌ يُصان،", "sans", 48),
                         ("وصيحةٌ يُعتزى بها.", "sans_medium", 50)], step=0.8)
    E.interview("I5")
    t0 = E.t
    fin = [BlurFill("p10", t0, t0 + 8.0),
           Photo("p10", R_CX, H / 2 + 4, 900, t0, rot=0.0, push=0.04, border=False,
                 corners=False, fin=0.0, max_w=720)]
    fin += words(["اعتزي", "بأهل", "المهابه"], V, 104, IVORY, 480, t0 + 0.5, cx=L_CX, fin=1.1,
                 shadow=SH)
    fin += words(["ربعي", "هم", "عز", "القرابه"], V, 104, IVORY, 612, t0 + 0.5, cx=L_CX,
                 fin=1.1, shadow=SH)
    fin += [GoldRule(L_CX, 690, 70, t0 + 1.4),
            text("عبدالله بن عبار", "sans", 30, 745, t0 + 1.6, cx=L_CX, color=GOLD, rise_px=0)]
    E.add(7.5, "black", fin, xfade=0.6, push=0.0, fade_out=0.9)
    t0 = E.t
    E.add(6.0, "black", [
        text("عبدالله بن دهيمش بن عبّار العنزي", V, 60, 450, t0 + 0.3, shadow=0.0, fin=0.8),
        text("شاعرٌ حفظ لعنزة تاريخها وأنسابها", "sans", 36, 530, t0 + 0.9, color=GOLD,
             shadow=0.0),
        text("صور الأرشيف واللقاء: أسرة الشاعر", "sans_light", 26, 640, t0 + 1.5, color=SOFT,
             shadow=0.0, rise_px=0),
        text("المصادر: حساب الشاعر على منصة X · موقع قبيلة عنزة · صحيفة الجزيرة · لسان العرب",
             "sans_light", 22, 690, t0 + 1.7, color=SOFT, shadow=0.0, rise_px=0, alpha=0.8),
    ], push=0.01, fade_out=0.8)
    return E.shots


class Backgrounds(film.Backgrounds):
    def __init__(self):
        super().__init__()
        self.black = solid((10, 10, 11))


def duration():
    s = build_shots()
    return s[-1].end


DURATION = duration()
from film import SlotReader  # noqa: E402,F401  (renderer compatibility)
