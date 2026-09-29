"""Sound: room tone, wind, foley, the score, archive slots, and the mix.

Score: three sampled instruments in maqam Bayati on D — cello pedal, sparse
harp, three frame-drum strokes at chapter heads — plus one bowed-psaltery
shimmer. The Bayati second degree (E half-flat) is tuned for real, a
quarter-tone below E, by resampling.

    python3 audio.py out.wav
"""
import math
import os
import subprocess
import sys
from fractions import Fraction

import numpy as np
from scipy.signal import butter, fftconvolve, resample_poly, sosfilt

from config import SAMPLES, SLOTS, SR
from film import DURATION

N = int(DURATION * SR)
SCORE_GAIN = 13.5          # score bus trim (dB) — music bed ≈ -27…-21 LUFS short-term
TARGET_LUFS = -20.0        # whole-programme target; archive dialogue sits at ≈ -16
RNG = np.random.default_rng(1405)


def db(x):
    return 10 ** (x / 20.0)


# ------------------------------------------------------------------ io
def load(path, mono=True):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1" if mono else "2",
                        "-ar", str(SR), "-f", "f32le", "-"], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, np.float32).copy()
    return x if mono else x.reshape(-1, 2)


def sample(rel):
    return load(os.path.join(SAMPLES, rel))


def write_wav(path, x):
    x = np.clip(x, -1, 1)
    p = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "f32le", "-ar", str(SR),
                          "-ac", "2", "-i", "-", "-c:a", "pcm_s24le", path],
                         stdin=subprocess.PIPE)
    p.stdin.write(x.astype(np.float32).tobytes())
    p.stdin.close()
    p.wait()


# ------------------------------------------------------------------ dsp
def sos(kind, f, order=2):
    return butter(order, f, btype=kind, fs=SR, output="sos")


def filt(x, kind, f, order=2):
    return sosfilt(sos(kind, f, order), x, axis=0)


def pink(n):
    X = np.fft.rfft(RNG.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    X[1:] /= np.sqrt(f[1:])
    X[0] = 0
    y = np.fft.irfft(X, n)
    return (y / (np.std(y) + 1e-9)).astype(np.float32)


def brown(n):
    y = np.cumsum(RNG.standard_normal(n)).astype(np.float64)
    y = filt(y, "highpass", 20)
    return (y / (np.std(y) + 1e-9)).astype(np.float32)


def slow_lfo(n, rates=(0.07, 0.13, 0.21, 0.34), lo=0.25, hi=1.0):
    t = np.arange(n) / SR
    v = sum(np.sin(2 * np.pi * r * t + RNG.uniform(0, 2 * np.pi)) / (i + 1)
            for i, r in enumerate(rates))
    v = (v - v.min()) / (np.ptp(v) + 1e-9)
    return (lo + (hi - lo) * v ** 1.6).astype(np.float32)


def pitch(x, cents):
    """Resample to shift pitch by `cents` (duration changes accordingly)."""
    if abs(cents) < 0.5:
        return x
    ratio = Fraction(2 ** (-cents / 1200)).limit_denominator(400)
    return resample_poly(x, ratio.numerator, ratio.denominator).astype(np.float32)


def env(n, a, r, curve=2.0):
    """Attack/release envelope in seconds, equal-power-ish curves."""
    e = np.ones(n, np.float32)
    na, nr = min(n, int(a * SR)), min(n, int(r * SR))
    if na:
        e[:na] = np.sin(np.linspace(0, np.pi / 2, na)) ** curve
    if nr:
        e[n - nr:] *= np.cos(np.linspace(0, np.pi / 2, nr)) ** curve
    return e


def place(bus, x, t, gain=1.0, pan=0.0):
    """Mix mono/stereo x into stereo bus at time t (s), constant-power pan."""
    i = int(t * SR)
    if i >= len(bus):
        return
    if x.ndim == 1:
        l, r = math.cos((pan + 1) * math.pi / 4), math.sin((pan + 1) * math.pi / 4)
        x = np.stack([x * l * math.sqrt(2), x * r * math.sqrt(2)], axis=1)
    j = min(len(bus), i + len(x))
    bus[i:j] += x[:j - i] * gain


def reverb_ir(rt60=2.7, pre=0.022, seed=9):
    rng = np.random.default_rng(seed)
    n = int((rt60 * 1.3) * SR)
    t = np.arange(n) / SR
    ir = np.zeros((n, 2), np.float32)
    for ch in range(2):
        noise = rng.standard_normal(n).astype(np.float32)
        bands = [("lowpass", 700, rt60 * 1.15), (("bandpass"), (700, 3500), rt60 * 0.85),
                 ("highpass", 3500, rt60 * 0.45)]
        acc = np.zeros(n, np.float32)
        for kind, f, rt in bands:
            b = filt(noise, kind, f, 2)
            acc += b * np.exp(-6.91 * t / rt)
        # a few early reflections
        for d, g in ((0.011, 0.5), (0.019, 0.35), (0.029, 0.3), (0.041, 0.22)):
            k = int((d + rng.uniform(0, 0.004)) * SR)
            acc[k] += g * rng.choice([-1, 1])
        ir[:, ch] = np.concatenate([np.zeros(int(pre * SR), np.float32), acc])[:n]
    ir /= np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))
    return ir


def wet(bus, ir, mix):
    out = np.stack([fftconvolve(bus[:, c], ir[:, c])[:len(bus)] for c in range(2)], axis=1)
    return bus * (1 - mix) + out.astype(np.float32) * mix


# ------------------------------------------------------------------ instruments
TUNE = {"harp/D4": 16, "harp/F4": -6, "harp/A4": 14, "harp/C5": 5}   # measured offsets
HARP_SRC = {  # note -> (sample, semitone shift)
    "D4": ("harp/D4", 0), "Eb4q": ("harp/D4", 1.5), "F4": ("harp/F4", 0),
    "G4": ("harp/F4", 2), "A4": ("harp/A4", 0), "C5": ("harp/C5", 0),
    "D5": ("harp/C5", 2), "A3": ("harp/A4", -12),
}
_cache = {}


def harp(note, dur=6.0):
    key = ("harp", note)
    if key not in _cache:
        src, semis = HARP_SRC[note]
        x = sample(f"samples/{src}.wav")
        x = pitch(x, semis * 100 + TUNE.get(src, 0))
        _cache[key] = x
    x = _cache[key][:int(dur * SR)].copy()
    return x * env(len(x), 0.004, min(2.5, dur * 0.5))


def sustained(rel, dur, attack, release, loop=(0.7, 3.4), xfade=0.9, cents=0.0,
              grain_len=1.6):
    """Arbitrarily long bowed note from a short sample: attack portion, then
    overlapping grains of the sustain region with long equal-power crossfades."""
    x = pitch(sample(rel), cents)
    n = int(dur * SR)
    a0, a1 = int(loop[0] * SR), int(min(loop[1], len(x) / SR - 0.1) * SR)
    # Flatten the natural decay of the recorded bow stroke inside the loop
    # region, otherwise every grain restarts loud and the pedal "pulses".
    win = int(0.25 * SR)
    rms = np.sqrt(np.convolve(x ** 2, np.ones(win) / win, "same") + 1e-12)
    ref = np.median(rms[a0:a1])
    flat = x.copy()
    k0 = max(0, a0 - int(0.3 * SR))
    blend = np.clip((np.arange(len(x)) - k0) / max(1, a0 - k0), 0, 1)
    flat = x * (1 - blend) + (x / rms * ref) * blend
    x = flat.astype(np.float32)
    if n <= a1:                              # short note: the sample itself is enough
        y = x[:n]
        return y * env(len(y), attack, release)
    out = np.zeros(n + SR * 4, np.float32)
    head = x[:a1]
    out[:len(head)] += head
    fade = int(xfade * SR)
    glen = min(int(grain_len * SR) + fade, a1 - a0)
    fade = min(fade, glen // 2)
    pos = a1 - fade
    ramp = np.sin(np.linspace(0, np.pi / 2, fade)) ** 2       # sin²+cos² = 1
    out[pos:pos + fade] *= ramp[::-1]                          # fade the head's tail
    prev_src = pos                    # where, in the sample, the outgoing audio is
    L = 2048
    while pos < n:
        target = int(RNG.uniform(a0, max(a0 + 1, a1 - glen)))
        # phase-align the incoming grain with the outgoing audio (search ±1
        # period around the random target) so the crossfade sums coherently
        ref_seg = x[prev_src:prev_src + L]
        lo, hi = max(a0, target - 900), min(a1 - glen, target + 900)
        if hi > lo and len(ref_seg) == L:
            region = x[lo:hi + L]
            c = np.correlate(region, ref_seg, "valid")
            e = np.sqrt(np.convolve(region ** 2, np.ones(L), "valid") + 1e-12)
            g0 = lo + int(np.argmax(c / e))
        else:
            g0 = target
        grain = x[g0:g0 + glen].copy()
        prev_src = g0 + glen - fade
        if len(grain) < glen:
            break
        grain[:fade] *= ramp
        grain[-fade:] *= ramp[::-1]
        out[pos:pos + glen] += grain[:len(out) - pos]
        pos += glen - fade
    out = out[:n]
    return out * env(n, attack, release)


def frame_drum(muted=False):
    f = ("HDrumL_HitMuted_v3_rr1_Sum.wav" if muted else "HDrumL_Hit_v3_rr1_Sum.wav")
    return sample(f"vcsl/Membranophones/Struck Membranophones/Frame Drum/{f}")


def psaltery_d(dur):
    x = sample("vcsl/Chordophones/Zithers/Psaltery, Bowed and Plucked/LongBow/"
               "BowedPsaltery_D4_Main_LongBow_rr1.wav")
    x = x[:int(min(dur, len(x) / SR) * SR)]
    return x * env(len(x), 1.8, 2.2)


# ------------------------------------------------------------------ score
def score():
    bus = np.zeros((N + SR * 6, 2), np.float32)
    C = -25.0          # cello pedal level (dB)
    H = -21.0          # harp level
    # 01 — hook: cello pedal enters under the second hemistich
    place(bus, sustained("samples/cello/D2.wav", 14.0, 5.0, 3.5), 7.3, db(C - 5))
    place(bus, sustained("samples/contrabass/D2.wav", 5.0, 2.5, 2.0,
                         loop=(1.0, 15.0)), 16.3, db(-27))
    # 02 — who
    for t, n in ((28.3, "D4"), (29.6, "F4"), (31.0, "Eb4q"), (33.2, "D4")):
        place(bus, harp(n), t, db(H - 2), pan=RNG.uniform(-0.25, 0.25))
    place(bus, sustained("samples/cello/A2.wav", 12.0, 3.0, 2.0), 35.5, db(C - 8))
    place(bus, harp("A4"), 45.1, db(H - 1), pan=0.1)
    # 03 — his own words
    place(bus, sustained("samples/cello/D2.wav", 16.5, 3.0, 2.5), 49.0, db(C - 4))
    for t, n in ((66.4, "F4"), (67.9, "Eb4q"), (69.5, "D4")):
        place(bus, harp(n), t, db(H - 1), pan=RNG.uniform(-0.2, 0.2))
    # 04 — pride
    place(bus, frame_drum(), 72.3, db(-17))
    place(bus, harp("D4"), 75.8, db(H), pan=-0.1)
    place(bus, harp("G4"), 80.9, db(H - 2), pan=0.15)
    place(bus, harp("A4"), 82.8, db(H - 2), pan=-0.15)
    place(bus, sustained("samples/cello/D2.wav", 33.4, 4.0, 0.5), 76.0, db(C))
    place(bus, sustained("samples/cello/A2.wav", 13.0, 3.0, 2.0), 86.3, db(C - 4))
    for t, n in ((88.0, "D4"), (90.0, "A4"), (92.5, "G4"), (94.0, "F4"),
                 (95.5, "Eb4q"), (97.2, "D4")):
        place(bus, harp(n), t, db(H - 1), pan=RNG.uniform(-0.35, 0.35))
    place(bus, psaltery_d(7.0), 99.6, db(-15), pan=0.2)
    # "…لا تُنشر." — everything stops (the cello note above releases at 109.4)
    # 05 — defence
    place(bus, frame_drum(), 113.3, db(-18))
    place(bus, harp("D4"), 116.8, db(H), pan=0.05)
    place(bus, sustained("samples/cello/D2.wav", 24.5, 3.0, 2.5), 117.0, db(C - 1))
    for t, n in ((124.3, "A4"), (125.3, "G4"), (126.3, "F4"), (127.3, "D4")):
        place(bus, harp(n, 5.0), t, db(H - 2), pan=RNG.uniform(-0.2, 0.2))
    # 06 — reply: the Bayati second rubbing against the tonic
    place(bus, frame_drum(muted=True), 142.3, db(-15))
    place(bus, sustained("samples/cello/D3.wav", 12.5, 3.5, 2.5, loop=(0.5, 3.1),
                    xfade=0.6, grain_len=0.9),
          146.0, db(C - 8), pan=-0.2)
    place(bus, sustained("samples/cello/D3.wav", 11.0, 4.0, 2.5, loop=(0.5, 3.1),
                         xfade=0.6, grain_len=0.9, cents=150), 147.5, db(C - 11), pan=0.25)
    place(bus, sustained("samples/cello/D2.wav", 7.0, 2.0, 2.0), 159.5, db(C - 5))
    # 07 — his voice: no music at all
    # 08 — ending
    place(bus, sustained("samples/cello/D2.wav", 21.0, 4.0, 3.0), 180.3, db(C))
    for t, n in ((180.5, "D4"), (185.5, "F4"), (187.0, "G4"), (189.0, "A4")):
        place(bus, harp(n), t, db(H - 1), pan=RNG.uniform(-0.25, 0.25))
    for t, n in ((192.4, "A4"), (193.6, "G4"), (194.6, "F4"), (195.6, "Eb4q"),
                 (197.0, "D4")):
        place(bus, harp(n, 7.0), t, db(H), pan=RNG.uniform(-0.2, 0.2))
    place(bus, sustained("samples/contrabass/D2.wav", 8.5, 3.0, 3.0, loop=(1.0, 15.0)),
          192.0, db(-26))
    bus = filt(bus, "highpass", 48, 2)
    return wet(bus, reverb_ir(2.8), 0.34)[:N] * db(SCORE_GAIN)


# ------------------------------------------------------------------ ambience
# (start, end, flavour)
ROOMS = [(0, 21, "dark"), (21, 27, "slot"), (27, 35, "paper"), (35, 48, "dark"),
         (48, 66, "paper"), (66, 99, "dark"), (99, 107.2, "paper"), (107.2, 135, "dark"),
         (135, 142, "paper"), (142, 145.5, "dark"), (145.5, 151, "paper"),
         (151, 168, "dark"), (168, 180, "slot"), (180, DURATION, "dark")]


def room_tone():
    out = np.zeros((N, 2), np.float32)
    flav = {"dark": (1100, db(-54)), "paper": (4800, db(-52)), "slot": (2400, db(-57))}
    beds = {}
    for k, (lp, g) in flav.items():
        x = np.stack([pink(N), pink(N)], axis=1)
        x = filt(filt(x, "lowpass", lp, 2), "highpass", 45, 2)
        beds[k] = x / (np.std(x) + 1e-9) * g
    xf = int(0.08 * SR)
    for (a, b, k) in ROOMS:
        i, j = int(a * SR), min(N, int(b * SR))
        seg = beds[k][max(0, i - xf):min(N, j + xf)].copy()
        e = env(len(seg), 0.08 if i > 0 else 2.5, 0.08 if j < N else 3.0, 1.0)
        out[max(0, i - xf):min(N, j + xf)] += seg * e[:, None]
    return out


def wind(n, level):
    lo = filt(brown(n), "bandpass", (160, 1100), 2) * slow_lfo(n)
    hi = filt(pink(n), "bandpass", (900, 2600), 2) * slow_lfo(n, (0.11, 0.19, 0.31), 0.0, 1.0)
    x = lo / (np.std(lo) + 1e-9) + 0.35 * hi / (np.std(hi) + 1e-9)
    y = np.stack([x, np.roll(x, int(0.013 * SR))], axis=1) / 1.2
    return y * db(level)


def pen_stroke(dur=0.42):
    n = int(dur * SR)
    base = filt(RNG.standard_normal(n).astype(np.float32), "bandpass", (1800, 6500), 2)
    grain = np.zeros(n, np.float32)
    t = 0
    while t < n:
        grain[t] = RNG.uniform(0.4, 1.0)
        t += int(SR / RNG.uniform(45, 95))
    grain = np.convolve(grain, np.exp(-np.arange(int(0.004 * SR)) / (0.0012 * SR)), "same")
    x = base * (0.35 + grain) * env(n, 0.02, 0.07)
    return x / (np.max(np.abs(x)) + 1e-9)


def paper_move(dur=0.7):
    n = int(dur * SR)
    shape = np.sin(np.linspace(0, np.pi, n)) ** 1.5
    clicks = np.zeros(n, np.float32)
    rate = 40 + 260 * shape
    p = 0.0
    for i in range(n):
        p += rate[i] / SR
        if p >= 1.0:
            clicks[i] = RNG.uniform(-1, 1)
            p -= 1.0 + RNG.uniform(-0.3, 0.3)
    crackle = filt(np.convolve(clicks, np.exp(-np.arange(90) / 18.0), "same"), "highpass", 900)
    air = filt(RNG.standard_normal(n).astype(np.float32), "bandpass", (300, 2800)) * shape
    x = 0.6 * crackle / (np.max(np.abs(crackle)) + 1e-9) + 0.5 * air / (np.max(np.abs(air)) + 1e-9)
    return x * env(n, 0.05, 0.15)


def ambience():
    out = room_tone()
    place(out, wind(int(17 * SR), -60) * env(int(17 * SR), 4.0, 3.0)[:, None], 0.0)
    wn = int(14.5 * SR)
    place(out, wind(wn, -36) * env(wn, 1.4, 0.5)[:, None], 85.2)
    for t in (61.0, 61.9, 62.8):
        place(out, pen_stroke(), t, db(-31), pan=RNG.uniform(-0.15, 0.15))
    place(out, paper_move(0.55), 27.0, db(-36), pan=0.2)
    place(out, paper_move(0.8), 135.0, db(-33), pan=-0.2)
    return out


# ------------------------------------------------------------------ archive slots
SLOT_TIMES = {"A1": (2.5, 14.0), "A2": (21.0, 6.0), "A3": (168.0, 12.0)}


def slots():
    """Original recordings, when present in slots/. Returns (bus, found)."""
    import json
    trims = {}
    tp = os.path.join(SLOTS, "trims.json")
    if os.path.exists(tp):
        trims = json.load(open(tp))
    out = np.zeros((N, 2), np.float32)
    found = []
    for code, (t, dur) in SLOT_TIMES.items():
        path = next((os.path.join(SLOTS, code + e) for e in
                     (".wav", ".mp3", ".m4a", ".mp4", ".mov", ".mkv")
                     if os.path.exists(os.path.join(SLOTS, code + e))), None)
        if not path:
            continue
        x = load(path, mono=False)
        s0 = int(float(trims.get(code, 0.0)) * SR)
        x = x[s0:s0 + int(dur * SR)]
        rms = np.sqrt(np.mean(x ** 2)) + 1e-9
        target = db(-30 if code == "A1" else -20)      # A1 sits under typography
        x = x / rms * target * env(len(x), 0.03, 0.25)[:, None]
        place(out, x, t)
        found.append(code)
    return out, found


def mix():
    amb = ambience()
    mus = score()
    arch, found = slots()
    if "A1" in found:
        mus[: int(21 * SR)] *= db(-4)     # duck the pedal under the original dahha
    m = amb + mus + arch
    import pyloudnorm as pyln
    lufs = pyln.Meter(SR).integrated_loudness(m)
    g = TARGET_LUFS - lufs
    peak = 20 * math.log10(np.max(np.abs(m)) + 1e-9)
    g = min(g, -1.5 - peak)                  # never push the sample peak above -1.5 dBFS
    m *= db(g)
    return m, found


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "mix.wav"
    m, found = mix()
    write_wav(out, m)
    print("wrote", out, "slots:", found or "none")
