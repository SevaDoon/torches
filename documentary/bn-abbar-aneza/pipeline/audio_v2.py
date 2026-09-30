"""v2 sound: a pulse. Frame drum (doum/tak patterns) at 72 BPM, a Bayati harp
ostinato under the album montage and the chapters, cello pedal, album-page
foley on photo changes, silence for the poet's voice.

    python3 audio_v2.py out.wav
"""
import math
import os
import sys

import numpy as np

import audio as A
from audio import SR, db, env, filt, harp, place, sustained

os.environ.setdefault("BNABBAR_EDIT", "film_v2")
from film_v2 import DURATION  # noqa: E402

N = int(DURATION * SR)
BEAT = 60.0 / 72
BAR = BEAT * 4
TARGET_LUFS = -19.0
RNG = np.random.default_rng(72)

FD = "vcsl/Membranophones/Struck Membranophones/Frame Drum/"
_drums = {}


def drum(kind):
    """doum = large drum open; tak = small drum; ghost = small muted/hand."""
    names = {
        "doum": ["HDrumL_Hit_v3_rr1_Sum", "HDrumL_Hit_v3_rr2_Sum"],
        "doum_soft": ["HDrumL_Hit_v2_rr1_Sum", "HDrumL_Hit_v2_rr2_Sum"],
        "doum_muted": ["HDrumL_HitMuted_v3_rr1_Sum", "HDrumL_HitMuted_v3_rr2_Sum"],
        "tak": ["HDrumS_Hit_v2_rr1_Sum", "HDrumS_Hit_v2_rr2_Sum"],
        "ghost": ["HDrumS_HitMuted_v2_rr1_Sum", "HDrumS_HitMuted_v2_rr2_Sum",
                  "HDrumS_Hand_v1_rr1_Sum"],
    }[kind]
    n = names[int(RNG.integers(len(names)))]
    if n not in _drums:
        x = A.sample(FD + n + ".wav")
        _drums[n] = x / (np.max(np.abs(x)) + 1e-9)
    return _drums[n]


PATTERNS = {   # (beat offset within the bar, kind, gain dB)
    "drive": [(0.0, "doum", -13), (0.5, "ghost", -27), (1.5, "tak", -22),
              (2.0, "doum_soft", -16), (3.0, "ghost", -26), (3.5, "tak", -24)],
    "sparse": [(0.0, "doum", -15), (2.0, "doum_muted", -20)],
    "heart": [(0.0, "doum", -16), (0.28, "doum_muted", -21)],
}


def drums(bus, pattern, t0, t1, level=0.0):
    t = t0
    while t < t1 - 0.05:
        for off, kind, g in PATTERNS[pattern]:
            at = t + off * BEAT + RNG.normal(0, 0.006)          # a human hand
            if at < t1:
                place(bus, drum(kind), at, db(g + level + RNG.normal(0, 0.8)),
                      pan=RNG.uniform(-0.15, 0.15))
        t += BAR


OSTINATO = ["D4", "A4", "G4", "A4", "F4", "G4", "Eb4q", "D4"]


def ostinato(bus, t0, t1, level=-24.0):
    """Eighth-note Bayati figure, qanun-like, on the harp."""
    t, i = t0, 0
    while t < t1 - 0.05:
        n = OSTINATO[i % len(OSTINATO)]
        accent = 1.5 if i % 8 == 0 else (0.0 if i % 2 == 0 else -2.5)
        place(bus, harp(n, 1.3), t + RNG.normal(0, 0.005), db(level + accent),
              pan=0.25 if i % 2 else -0.15)
        t += BEAT / 2
        i += 1


def score():
    bus = np.zeros((N + SR * 6, 2), np.float32)
    C = -25.0
    # 01 hook
    place(bus, drum("doum"), 0.4, db(-14))
    drums(bus, "heart", 1.6, 9.0, -2)
    for t, n in ((1.6, "D4"), (2.4, "F4"), (2.9, "Eb4q"), (4.2, "D4"), (4.7, "F4"),
                 (5.0, "G4"), (5.4, "A4")):
        place(bus, harp(n, 4.0), t, db(-22), pan=RNG.uniform(-0.2, 0.2))
    place(bus, sustained("samples/cello/D2.wav", 6.2, 2.5, 1.5), 4.2, db(C - 3))
    # title
    place(bus, drum("doum"), 10.0, db(-10))
    place(bus, sustained("samples/contrabass/D2.wav", 3.4, 0.3, 1.6, loop=(1.0, 15.0)),
          10.0, db(-23))
    # 02 album montage
    drums(bus, "drive", 13.33, 33.3)
    ostinato(bus, 13.33, 33.3)
    place(bus, sustained("samples/cello/D2.wav", 20.2, 2.0, 1.2), 13.33, db(C - 2))
    # 03 numbers + quote
    place(bus, drum("doum"), 33.3, db(-12))
    place(bus, drum("doum"), 36.63, db(-12))
    place(bus, sustained("samples/cello/A2.wav", 6.7, 0.8, 1.0), 33.3, db(C - 3))
    drums(bus, "sparse", 40.0, 50.0, -3)
    place(bus, sustained("samples/cello/D2.wav", 10.0, 1.5, 1.2), 40.0, db(C - 4))
    for t, n in ((40.3, "D4"), (41.0, "F4"), (44.0, "A4"), (44.7, "G4"), (45.4, "D5")):
        place(bus, harp(n, 3.0), t, db(-23), pan=RNG.uniform(-0.2, 0.2))
    # 04 pride
    place(bus, drum("doum"), 50.0, db(-9))
    drums(bus, "drive", 51.67, 65.0)
    ostinato(bus, 51.67, 65.0, -25)
    place(bus, sustained("samples/cello/D2.wav", 13.6, 1.0, 1.0), 51.67, db(C - 1))
    place(bus, sustained("samples/cello/A2.wav", 6.6, 2.0, 1.0), 58.33, db(C - 5))
    place(bus, A.psaltery_d(5.0), 65.1, db(-16), pan=0.2)
    drums(bus, "sparse", 65.0, 70.0, -4)
    # 05 defence
    place(bus, drum("doum"), 70.0, db(-9))
    drums(bus, "sparse", 71.67, 75.0, -3)
    place(bus, harp("D4", 4.0), 71.77, db(-21))
    drums(bus, "heart", 75.0, 81.67, -2)
    for t, n in ((75.1, "A4"), (75.9, "G4"), (76.6, "F4"), (77.3, "D4")):
        place(bus, harp(n, 3.0), t, db(-21), pan=RNG.uniform(-0.2, 0.2))
    place(bus, sustained("samples/cello/D2.wav", 16.6, 1.5, 1.0), 71.67, db(C - 2))
    drums(bus, "drive", 81.67, 88.33, -3)
    ostinato(bus, 81.67, 88.33, -26)
    # 06 reply — the Bayati second rubbing against the tonic
    place(bus, drum("doum_muted"), 88.33, db(-10))
    drums(bus, "sparse", 90.0, 100.0, -2)
    place(bus, sustained("samples/cello/D3.wav", 10.2, 1.5, 1.5, loop=(0.5, 3.1),
                         xfade=0.6, grain_len=0.9), 90.0, db(C - 6), pan=-0.2)
    place(bus, sustained("samples/cello/D3.wav", 8.5, 2.5, 1.5, loop=(0.5, 3.1),
                         xfade=0.6, grain_len=0.9, cents=150), 91.5, db(C - 9), pan=0.25)
    place(bus, sustained("samples/cello/D2.wav", 4.4, 0.6, 1.8), 100.0, db(C - 6))
    # 07 his voice: nothing
    # 08 ending
    drums(bus, "heart", 120.0, 126.67, -3)
    drums(bus, "drive", 126.67, 131.67, -2)
    ostinato(bus, 126.67, 131.67, -25)
    place(bus, sustained("samples/cello/D2.wav", 18.0, 3.0, 3.0), 120.2, db(C - 1))
    place(bus, drum("doum"), 131.67, db(-9))
    for t, n in ((131.97, "A4"), (132.8, "G4"), (133.6, "F4"), (134.4, "Eb4q"),
                 (135.4, "D4")):
        place(bus, harp(n, 6.0), t, db(-19), pan=RNG.uniform(-0.2, 0.2))
    place(bus, sustained("samples/contrabass/D2.wav", 7.0, 1.0, 3.0, loop=(1.0, 15.0)),
          131.67, db(-22))
    place(bus, harp("D4", 5.0), 138.6, db(-24))
    bus = filt(bus, "highpass", 45, 2)
    return A.wet(bus, A.reverb_ir(2.2), 0.26)[:N]


ROOMS = [(0, 10, "dark"), (10, 13.33, "dark"), (13.33, 40, "dark"), (40, 50, "paper"),
         (50, 58.33, "dark"), (58.33, 65, "dark"), (65, 70, "paper"), (70, 81.67, "dark"),
         (81.67, 94.17, "paper"), (94.17, 105, "dark"), (105, 120, "slot"),
         (120, DURATION, "dark")]


def ambience():
    A.N, A.ROOMS = N, ROOMS
    out = A.room_tone()
    wn = int(7.2 * SR)
    place(out, A.wind(wn, -37) * env(wn, 0.8, 0.5)[:, None], 58.1)
    for t in (44.0, 44.7, 45.4):
        place(out, A.pen_stroke(0.36), t, db(-31), pan=RNG.uniform(-0.15, 0.15))
    for t in (13.33, 16.63, 18.3, 19.97, 21.63, 26.63, 28.3, 29.97, 51.67, 120.0, 126.67,
              131.67):
        place(out, A.paper_move(0.32), t - 0.04, db(-35), pan=RNG.uniform(-0.3, 0.3))
    for t in (40.0, 65.0, 81.67, 90.0):
        place(out, A.paper_move(0.5), t - 0.05, db(-36), pan=RNG.uniform(-0.3, 0.3))
    return out


SLOT_TIMES = {"A1": (1.6, 8.0), "A3": (105.0, 15.0)}


def mix():
    A.N, A.SLOT_TIMES = N, SLOT_TIMES
    amb = ambience()
    mus = score()
    arch, found = A.slots()
    if "A1" in found:
        mus[: int(10 * SR)] *= db(-5)
    m = amb + mus + arch
    import pyloudnorm as pyln
    meter = pyln.Meter(SR)
    for _ in range(2):                     # limiting lowers loudness a little; iterate
        m *= db(TARGET_LUFS - meter.integrated_loudness(m))
        m = limit(m, db(-1.5))
    return m, found


def limit(x, thr, look=0.004):
    """Look-ahead peak limiter: the gain dip is centred on each peak and
    ramps over ~2*look seconds, so drum transients are tamed without clicks."""
    from scipy.ndimage import minimum_filter1d, uniform_filter1d
    L = 2 * int(look * SR) + 1
    peak = np.max(np.abs(x), axis=1)
    g = np.minimum(1.0, thr / (peak + 1e-9))
    g = uniform_filter1d(minimum_filter1d(g, L), L)
    return (x * g[:, None]).astype(np.float32)


if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "mix_v2.wav"
    m, found = mix()
    A.write_wav(out, m)
    print("wrote", out, "slots:", found or "none")
