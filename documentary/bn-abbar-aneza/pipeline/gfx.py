"""Typography, textures and compositing primitives.

Frames are float32 arrays (H, W, 3) in 0..1 sRGB. Text is rendered once with
PIL + libraqm (proper Arabic shaping and bidi) and cached as premultiplied
RGBA so per-frame work is only an alpha blend over a bounding box.
"""
import os
from functools import lru_cache

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

from config import (ASH, BLACK, CACHE, FPS, H, INK, IVORY, PAPER, W,
                    font_path)


# ---------------------------------------------------------------- easing
def clamp01(x):
    return 0.0 if x < 0 else 1.0 if x > 1 else x


def ease_out(x):
    x = clamp01(x)
    return 1 - (1 - x) ** 3


def ease_in_out(x):
    x = clamp01(x)
    return x * x * (3 - 2 * x)


def smootherstep(x):
    x = clamp01(x)
    return x * x * x * (x * (x * 6 - 15) + 10)


# ---------------------------------------------------------------- fonts
@lru_cache(maxsize=None)
def font(key, size):
    return ImageFont.truetype(font_path(key), size)


def text_advance(txt, key, size):
    return font(key, size).getlength(txt, direction="rtl", language="ar")


class Glyphs:
    """A rendered run of text: premultiplied RGBA + placement metrics."""

    def __init__(self, rgba, advance, ascent, pad):
        self.rgba = rgba            # float32 (h, w, 4), premultiplied
        self.advance = advance      # typographic width in px
        self.ascent = ascent        # baseline offset from top of run box
        self.pad = pad


@lru_cache(maxsize=None)
def render_run(txt, key, size, color):
    """Render a single run (word or line) of RTL text."""
    f = font(key, size)
    ascent, descent = f.getmetrics()
    adv = f.getlength(txt, direction="rtl", language="ar")
    pad = int(size * 0.6)
    w = int(adv) + 2 * pad
    h = ascent + descent + 2 * pad
    im = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(im)
    d.text((pad, pad + ascent), txt, font=f, fill=255, anchor="ls",
           direction="rtl", language="ar")
    a = np.asarray(im, dtype=np.float32) / 255.0
    col = np.array(color, dtype=np.float32) / 255.0
    rgba = np.empty((h, w, 4), dtype=np.float32)
    rgba[..., :3] = a[..., None] * col
    rgba[..., 3] = a
    return Glyphs(rgba, adv, ascent, pad)


def blit(frame, rgba, x, y, opacity=1.0):
    """Premultiplied-over blend of rgba at integer top-left (x, y)."""
    if opacity <= 0.001:
        return
    h, w = rgba.shape[:2]
    x0, y0 = max(0, x), max(0, y)
    x1, y1 = min(frame.shape[1], x + w), min(frame.shape[0], y + h)
    if x1 <= x0 or y1 <= y0:
        return
    src = rgba[y0 - y:y1 - y, x0 - x:x1 - x]
    dst = frame[y0:y1, x0:x1]
    a = src[..., 3:4] * opacity
    dst *= (1.0 - a)
    dst += src[..., :3] * opacity


def place_run(frame, g, x_left, baseline, opacity=1.0):
    blit(frame, g.rgba, int(round(x_left - g.pad)),
         int(round(baseline - g.pad - g.ascent)), opacity)


# ---------------------------------------------------------------- layout
def layout_words(words, key, size, cx, joiners=()):
    """Lay out words right-to-left, centred on cx. Returns [(word, x_left)].

    `joiners` holds indices of tokens that attach to the previous token with
    no space (e.g. an ellipsis)."""
    space = text_advance(" ", key, size)
    widths = [text_advance(w, key, size) for w in words]
    total = sum(widths) + space * (len(words) - 1 - len(joiners))
    cursor = cx + total / 2.0            # right edge
    out = []
    for i, (w, wd) in enumerate(zip(words, widths)):
        if i > 0 and i not in joiners:
            cursor -= space
        cursor -= wd
        out.append((w, cursor, wd))
    return out


# ---------------------------------------------------------------- textures
def _blur_noise(rng, shape, sigma):
    """Smooth zero-mean, unit-variance noise with feature size ~sigma px.

    Built at low resolution in float and upsampled with cubic splines, so the
    result has no 8-bit plateaus (which read as blotchy rectangles)."""
    from scipy.ndimage import gaussian_filter, zoom
    f = max(1, int(sigma / 4))
    small = (shape[0] // f + 4, shape[1] // f + 4)
    n = gaussian_filter(rng.standard_normal(small).astype(np.float32), 2.0, mode="wrap")
    a = zoom(n, f, order=3)[:shape[0], :shape[1]]
    return (a - a.mean()) / (a.std() + 1e-6)


def paper_texture(seed=7, size=None, falloff=True):
    """Warm archival paper: low-frequency mottling + fibres + fine tooth.

    Deliberately restrained — no burnt edges, no coffee stains."""
    hh, ww = size or (H, W)
    path = os.path.join(CACHE, f"paper_{seed}_{ww}x{hh}.npy")
    if os.path.exists(path):
        return np.load(path)
    rng = np.random.default_rng(seed)
    base = np.array(PAPER, dtype=np.float32) / 255.0
    lum = (0.010 * _blur_noise(rng, (hh, ww), 180)
           + 0.006 * _blur_noise(rng, (hh, ww), 40)
           + 0.006 * rng.standard_normal((hh, ww)).astype(np.float32))
    # fibres: short faint strokes, some darker some lighter
    fib = Image.new("L", (ww, hh), 128)
    d = ImageDraw.Draw(fib)
    for _ in range(int(2600 * hh * ww / (H * W))):
        x, y = rng.uniform(0, ww), rng.uniform(0, hh)
        ang = rng.uniform(0, np.pi)
        ln = rng.uniform(6, 26)
        v = int(128 + rng.choice([-1, 1]) * rng.uniform(6, 14))
        d.line([(x, y), (x + np.cos(ang) * ln, y + np.sin(ang) * ln)], fill=v, width=1)
    fib = fib.filter(ImageFilter.GaussianBlur(0.6))
    lum += (np.asarray(fib, dtype=np.float32) - 128) / 255.0 * 0.5
    # very gentle falloff toward the edges (a sheet under a lamp, not a vignette)
    if falloff:
        yy, xx = np.mgrid[0:hh, 0:ww].astype(np.float32)
        r = np.sqrt(((xx - ww * 0.52) / (ww * 0.75)) ** 2 + ((yy - hh * 0.45) / (hh * 0.8)) ** 2)
        lum -= 0.035 * np.clip(r - 0.35, 0, None) ** 1.5
    img = np.clip(base[None, None, :] * (1 + lum[..., None]), 0, 1).astype(np.float32)
    os.makedirs(CACHE, exist_ok=True)
    np.save(path, img)
    return img


class Grain:
    """Luma-only film grain, a bank of frames re-used with random offsets."""

    def __init__(self, sigma=2.4 / 255.0, n=12, seed=3):
        rng = np.random.default_rng(seed)
        self.bank = []
        for _ in range(n):
            g = rng.standard_normal((H + 64, W + 64)).astype(np.float32)
            # slightly soften so grain reads as film, not sensor noise
            im = Image.fromarray(np.clip(g * 40 + 128, 0, 255).astype(np.uint8))
            im = im.filter(ImageFilter.GaussianBlur(0.55))
            g = (np.asarray(im, dtype=np.float32) - 128) / 40.0
            self.bank.append(g / (g.std() + 1e-6) * sigma)
        self.rng = np.random.default_rng(seed + 1)

    def apply(self, frame, fi):
        rng = np.random.default_rng(fi * 7919 + 13)
        g = self.bank[fi % len(self.bank)]
        ox, oy = rng.integers(0, 64, size=2)
        n = g[oy:oy + H, ox:ox + W]
        # grain is strongest in the mid-tones, faint in deep blacks
        lum = frame.mean(axis=2)
        k = 0.45 + 0.55 * np.sqrt(np.clip(lum, 0, 1))
        frame += (n * k)[..., None]


def solid(color):
    f = np.empty((H, W, 3), dtype=np.float32)
    f[:] = np.array(color, dtype=np.float32) / 255.0
    return f


def push(frame, amount, anchor=(0.5, 0.5), offset=(0.0, 0.0)):
    """Scale the frame about `anchor` by (1+amount), cropping to size;
    `offset` adds a sub-pixel translation (gate weave)."""
    if amount <= 1e-4 and abs(offset[0]) < 0.05 and abs(offset[1]) < 0.05:
        return frame
    s = 1.0 + max(0.0, amount)
    ax, ay = anchor[0] * W, anchor[1] * H
    im = Image.fromarray(np.clip(frame * 255 + 0.5, 0, 255).astype(np.uint8))
    # output pixel (u,v) samples input ((u-ax)/s+ax-dx, (v-ay)/s+ay-dy)
    coeffs = (1 / s, 0, ax - ax / s - offset[0], 0, 1 / s, ay - ay / s - offset[1])
    im = im.transform((W, H), Image.AFFINE, coeffs, resample=Image.BICUBIC)
    return np.asarray(im, dtype=np.float32) / 255.0


def to_uint8(frame):
    return np.clip(frame * 255 + 0.5, 0, 255).astype(np.uint8)


def tc(s):
    """'01:26.5' -> seconds."""
    if isinstance(s, (int, float)):
        return float(s)
    m, sec = s.split(":")
    return int(m) * 60 + float(sec)


def frames(sec):
    return int(round(sec * FPS))
