"""The 'archival' finishing pass for v2: gentle flicker, gate weave, sparse
dust, vignette. Every value is kept small — the film should feel old, not
look like an 'old film' filter."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

from config import H, W


def _smooth_noise(t, seed, rates=(0.9, 1.7, 3.1)):
    rng = np.random.default_rng(seed)
    ph = rng.uniform(0, 2 * np.pi, len(rates))
    return sum(np.sin(2 * np.pi * r * t + p) for r, p in zip(rates, ph)) / len(rates)


class Vintage:
    def __init__(self, seed=21):
        yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
        r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
        self.vig = (1.0 - 0.20 * np.clip(r - 0.35, 0, None) ** 1.8)[..., None]
        rng = np.random.default_rng(seed)
        self.dust = []
        for _ in range(40):
            size = int(rng.integers(10, 36))
            im = Image.new("L", (size, size), 0)
            d = ImageDraw.Draw(im)
            if rng.random() < 0.8:                          # speck
                r_ = rng.uniform(0.8, 2.2)
                c = size / 2 + rng.uniform(-2, 2)
                d.ellipse([c - r_, c - r_ * rng.uniform(0.6, 1.4), c + r_, c + r_], fill=255)
            else:                                           # hair / fibre
                pts = [(rng.uniform(0, size), rng.uniform(0, size)) for _ in range(3)]
                d.line(pts, fill=255, width=1)
            im = im.filter(ImageFilter.GaussianBlur(0.6))
            self.dust.append(np.asarray(im, np.float32) / 255.0)

    def apply(self, frame, fi, t):
        frame *= self.vig
        frame *= 1.0 + 0.011 * _smooth_noise(t, 5) + 0.004 * np.sin(fi * 2.3)
        rng = np.random.default_rng(fi * 104729 + 7)
        for _ in range(rng.poisson(0.9)):
            d = self.dust[int(rng.integers(len(self.dust)))]
            h, w = d.shape
            x, y = int(rng.integers(0, W - w)), int(rng.integers(0, H - h))
            dark = rng.random() < 0.7
            a = d[..., None] * rng.uniform(0.25, 0.55)
            seg = frame[y:y + h, x:x + w]
            if dark:
                seg *= (1 - a)
            else:
                seg += a * (0.9 - seg)
        return frame

    @staticmethod
    def weave(t):
        """Sub-pixel gate weave offset (dx, dy) in px."""
        return 0.45 * _smooth_noise(t, 11, (0.7, 1.9)), 0.6 * _smooth_noise(t, 13, (0.5, 1.3, 2.9))
