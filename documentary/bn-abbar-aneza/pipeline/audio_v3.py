"""v3 sound — no music, no instruments.

The poet's voice (interview excerpts, levelled to dialogue loudness) carries
the film. Around it: room air, open wind on the map, a majlis fire under the
closing photographs, soft non-tonal air passes on transitions, a low
non-tonal impact under the title and chapter cards, and pen strokes under his
own words.

    python3 audio_v3.py out.wav
"""
import math
import os
import sys

import numpy as np

os.environ.setdefault("BNABBAR_EDIT", "film_v3")
import audio as A  # noqa: E402
from audio import SR, db, env, filt, place  # noqa: E402
import film_v3 as F  # noqa: E402

N = int(F.DURATION * SR) + SR
RNG = np.random.default_rng(1365)
VOICE_LUFS = -17.0


def noise(n):
    return RNG.standard_normal(n).astype(np.float32)


def fire(dur):
    """Crackling wood fire: sparse pops over a low, breathing roar."""
    n = int(dur * SR)
    out = np.zeros((n, 2), np.float32)
    roar = filt(A.brown(n), "lowpass", 380, 2) * A.slow_lfo(n, (0.3, 0.55, 0.9), 0.5, 1.0)
    hiss = filt(A.pink(n), "bandpass", (2500, 7000), 2) * 0.12
    bed = roar / (np.std(roar) + 1e-9) * 0.35 + hiss
    out += np.stack([bed, np.roll(bed, 211)], axis=1) * 0.5
    t = 0.0
    while t < dur:
        t += RNG.exponential(1 / 7.0)
        k = int(t * SR)
        L = int(RNG.uniform(0.002, 0.016) * SR)
        if k + L >= n:
            break
        b = filt(noise(L), "highpass", RNG.uniform(900, 2500), 2)
        b *= np.exp(-np.arange(L) / (L / RNG.uniform(3, 7)))
        a = math.exp(RNG.normal(-0.3, 0.7))
        pan = RNG.uniform(-0.6, 0.6)
        out[k:k + L, 0] += b * a * math.cos((pan + 1) * math.pi / 4)
        out[k:k + L, 1] += b * a * math.sin((pan + 1) * math.pi / 4)
    out /= (np.max(np.abs(out)) + 1e-9)
    return out * env(n, 1.2, 1.5)[:, None]


def air_pass(dur=0.7, lo=260, hi=3800):
    """A soft non-tonal whoosh: noise swept through log-spaced bands."""
    n = int(dur * SR)
    x = A.pink(n)
    bands = np.geomspace(lo, hi, 7)
    out = np.zeros(n, np.float32)
    tt = np.linspace(0, 1, n)
    for i, f in enumerate(bands):
        b = filt(x, "bandpass", (f / 1.35, f * 1.35), 2)
        c = i / (len(bands) - 1)
        out += b * np.exp(-((tt - (0.2 + 0.6 * c)) ** 2) / 0.02)
    out *= np.sin(np.pi * tt) ** 1.5
    out /= (np.max(np.abs(out)) + 1e-9)
    pan = np.linspace(-0.4, 0.4, n)
    return np.stack([out * np.cos((pan + 1) * np.pi / 4), out * np.sin((pan + 1) * np.pi / 4)],
                    axis=1) * math.sqrt(2)


def low_impact(dur=1.4):
    """Non-tonal low impact: filtered noise thump with a short transient."""
    n = int(dur * SR)
    body = filt(A.brown(n), "lowpass", 95, 4) * np.exp(-np.arange(n) / (0.32 * SR))
    tr = filt(noise(int(0.012 * SR)), "lowpass", 900, 2)
    body[:len(tr)] += tr * 0.35 * np.max(np.abs(body))
    body /= (np.max(np.abs(body)) + 1e-9)
    return body * env(n, 0.004, 0.3)


def voice_clips(bus):
    """Place interview excerpts (J-cut: voice leads picture by 0.35 s)."""
    if F.INTERVIEW is None:
        return []
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    placed = []
    src = A.load(F.INTERVIEW, mono=True)
    for s in F.build_shots():
        code = getattr(s, "clip", None)
        if not code:
            continue
        c = F.CUTS[code]
        pre = 0.35 if s.start > 0.5 else 0.0
        a = int((float(c["in"]) - pre) * SR)
        b = int(float(c["out"]) * SR)
        x = src[max(0, a):b].copy()
        x = filt(x, "highpass", 80, 2)
        lufs = meter.integrated_loudness(np.stack([x, x], 1)) if len(x) > SR * 0.5 else -30
        x *= db(VOICE_LUFS - lufs)
        x *= env(len(x), 0.12, 0.3)
        place(bus, x, s.start - pre)
        placed.append(code)
    return placed


def limit(x, thr, look=0.004):
    """Look-ahead peak limiter (gain dip centred on each peak, ~8 ms ramps)."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    L = 2 * int(look * SR) + 1
    g = np.minimum(1.0, thr / (np.max(np.abs(x), axis=1) + 1e-9))
    g = uniform_filter1d(minimum_filter1d(g, L), L)
    return (x * g[:, None]).astype(np.float32)


def mix():
    shots = F.build_shots()
    amb = np.zeros((N, 2), np.float32)
    # air of the room under everything
    rt = np.stack([A.pink(N), A.pink(N)], axis=1)
    rt = filt(filt(rt, "lowpass", 1400, 2), "highpass", 50, 2)
    amb += rt / (np.std(rt) + 1e-9) * db(-55)
    fx = np.zeros((N, 2), np.float32)
    for s in shots:
        if s.bg == "map":
            n = int((s.end - s.start + 1.0) * SR)
            place(amb, A.wind(n, -35) * env(n, 0.9, 0.9)[:, None], s.start - 0.3)
        if s.name.startswith("chapter"):
            place(fx, air_pass(0.8), s.start - 0.45, db(-27))
            place(fx, low_impact(), s.start + 0.02, db(-17))
    first = shots[0]
    n = int(9.5 * SR)
    place(amb, A.wind(n, -45) * env(n, 2.0, 2.5)[:, None], first.start)
    title = shots[1]
    place(fx, air_pass(1.0, 200, 3000), title.start - 0.6, db(-25))
    place(fx, low_impact(1.8), title.start + 0.25, db(-15))
    # his written words: pen strokes under the three underlined words
    for s in shots:
        for el in s.els:
            if isinstance(el, F.Rule) and el.thick >= 3.0:
                place(fx, A.pen_stroke(0.34), el.t_in, db(-30), pan=RNG.uniform(-0.1, 0.1))
    # majlis fire under the closing photographs and the final verse
    closing = [s for s in shots if any(isinstance(e, F.BlurFill) and e.name in ("p05", "p02")
                                       for e in s.els)]
    if closing:
        a = closing[0].start - 0.4
        b = shots[-2].end
        place(amb, fire(b - a), a, db(-37))
    # photo changes in the opening montage: a whisper of air, nothing more
    for s in shots[2:10]:
        if getattr(s, "xfade", 0) > 0 and s.bg == "black" and any(
                isinstance(e, F.BlurFill) for e in s.els):
            place(fx, air_pass(0.5, 400, 5000), s.start - 0.25, db(-38))
    voice = np.zeros((N, 2), np.float32)
    placed = voice_clips(voice)
    # keep ambience under the voice
    if placed:
        for s in shots:
            if getattr(s, "clip", None):
                i, j = int(s.start * SR), int(s.end * SR)
                amb[i:j] *= db(-6)
    m = amb * db(5.0) + fx * db(3.0) + voice
    m = m[:int(F.DURATION * SR)]
    m = limit(m, db(-1.5))
    return m, placed


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "mix_v3.wav"
    m, placed = mix()
    A.write_wav(out, m)
    print("wrote", out, "voice clips:", placed or "none (interview not provided)")
