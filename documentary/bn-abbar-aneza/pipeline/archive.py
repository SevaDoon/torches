"""Family archive photographs, presented as physical prints.

Each photo becomes a print: toned (warm sepia for black-and-white, gently
faded for colour), a cream border for studio prints, paper photo-corners like
the black-page albums of the 1970s, a soft contact shadow, a slight
hand-placed rotation. Pixels of the photograph itself are never invented or
retouched — only toned and scaled.
"""
import os
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

from config import ROOT
from gfx import blit, ease_in_out, ease_out, clamp01

PHOTOS = os.path.join(ROOT, "assets", "archive", "prepared")

# manual crops (l, t, r, b) in prepared-image pixels, where autocrop can't tell
CROPS = {
    "p07": (0, 0, 590, 735),
}


def load_photo(name):
    im = Image.open(os.path.join(PHOTOS, name + ".png")).convert("RGB")
    if name in CROPS:
        im = im.crop(CROPS[name])
    return im


# hand-tinted / colour prints keep their colour; everything else is toned
COLOUR = {"p02", "p05", "p06", "p10", "p12", "p18", "p19"}


def is_mono(im, name=None):
    if name is not None:
        return name not in COLOUR
    a = np.asarray(im.resize((64, 64)), np.float32)
    return float(np.mean(a.max(axis=2) - a.min(axis=2))) < 14.0


def tone(im, name=None):
    """Warm archival toning. B&W -> sepia split-tone; colour -> faded print."""
    a = np.asarray(im, np.float32) / 255.0
    if is_mono(im, name):
        L = a.mean(axis=2)
        lo, mid, hi = (np.array(c, np.float32) / 255 for c in
                       ((30, 22, 16), (150, 122, 92), (239, 228, 204)))
        t = np.clip(L, 0, 1)[..., None]
        out = np.where(t < 0.5, lo + (mid - lo) * (t / 0.5), mid + (hi - mid) * ((t - 0.5) / 0.5))
    else:
        g = a.mean(axis=2, keepdims=True)
        out = a * 0.84 + g * 0.16                          # a little less saturation
        out = out * np.array([1.035, 1.0, 0.9], np.float32)  # warm, as prints yellow
        out = 0.05 + out * 0.93                             # lifted blacks: faded dye
    return Image.fromarray(np.clip(out * 255 + 0.5, 0, 255).astype(np.uint8))


@lru_cache(maxsize=None)
def make_print(name, height, rot=0.0, border=True, corners=True, shadow=True, max_w=None):
    """Return premultiplied RGBA float32 of the finished print (with shadow)."""
    im = tone(load_photo(name), name)
    if max_w:
        height = min(height, max_w * im.height / im.width)
    s = height / im.height
    im = im.resize((max(1, int(im.width * s)), int(height)), Image.LANCZOS)
    if border:
        b = max(8, int(height * 0.028))
        im = ImageOps.expand(im, border=b, fill=(232, 223, 203))
    rgba = im.convert("RGBA")
    if corners:
        d = ImageDraw.Draw(rgba)
        c = max(18, int(height * 0.075))
        w, h = rgba.size
        col = (18, 16, 14, 255)
        for (x, y, pts) in ((0, 0, [(0, 0), (c, 0), (0, c)]),
                            (w, 0, [(w, 0), (w - c, 0), (w, c)]),
                            (0, h, [(0, h), (c, h), (0, h - c)]),
                            (w, h, [(w, h), (w - c, h), (w, h - c)])):
            d.polygon(pts, fill=col)
    pad = int(height * 0.08)
    canvas = Image.new("RGBA", (rgba.width + 2 * pad, rgba.height + 2 * pad), (0, 0, 0, 0))
    if shadow:
        sh = Image.new("L", canvas.size, 0)
        ImageDraw.Draw(sh).rectangle([pad + 5, pad + 9, pad + rgba.width + 5,
                                      pad + rgba.height + 9], fill=150)
        sh = sh.filter(ImageFilter.GaussianBlur(max(6, height * 0.018)))
        shadow_rgba = Image.new("RGBA", canvas.size, (0, 0, 0, 0))
        shadow_rgba.putalpha(sh)
        canvas = Image.alpha_composite(canvas, shadow_rgba)
    canvas.alpha_composite(rgba, (pad, pad))
    if rot:
        canvas = canvas.rotate(rot, resample=Image.BICUBIC, expand=True)
    a = np.asarray(canvas, np.float32) / 255.0
    a[..., :3] *= a[..., 3:4]
    return a


class Photo:
    """A print placed at (cx, cy), `height` px tall, with a slow push-in."""

    def __init__(self, name, cx, cy, height, t_in, t_out=None, rot=0.0, push=0.035,
                 border=True, corners=True, fin=0.45, fout=0.35, drift=(0, 0), max_w=760):
        self.name, self.cx, self.cy, self.h = name, cx, cy, height
        self.t_in, self.t_out, self.rot, self.pushamt = t_in, t_out, rot, push
        self.border, self.corners, self.fin, self.fout = border, corners, fin, fout
        self.drift, self.max_w = drift, max_w
        self.span = None                     # set by the shot: (start, end)

    def opacity(self, t):
        if t < self.t_in:
            return 0.0
        a = ease_out((t - self.t_in) / self.fin) if self.fin > 0 else 1.0
        if self.t_out is not None and t >= self.t_out:
            a *= 1.0 - ease_in_out((t - self.t_out) / self.fout)
        return a

    def draw(self, frame, t):
        o = self.opacity(t)
        if o <= 0:
            return
        k = 1 + self.pushamt
        big = make_print(self.name, int(self.h * k), self.rot, self.border, self.corners,
                         max_w=int(self.max_w * k) if self.max_w else None)
        end = self.t_out + self.fout if self.t_out is not None else (self.span or (0, t + 1))[1]
        p = clamp01((t - self.t_in) / max(0.1, end - self.t_in))
        s = (1 + self.pushamt * p) / (1 + self.pushamt)
        hh, ww = big.shape[:2]
        if abs(s - 1) > 1e-3:
            im = Image.fromarray((np.clip(big, 0, 1) * 255).astype(np.uint8), "RGBA")
            im = im.resize((max(1, int(ww * s)), max(1, int(hh * s))), Image.BILINEAR)
            img = np.asarray(im, np.float32) / 255.0
        else:
            img = big
        x = int(round(self.cx + self.drift[0] * p - img.shape[1] / 2))
        y = int(round(self.cy + self.drift[1] * p - img.shape[0] / 2))
        blit(frame, img, x, y, o)
