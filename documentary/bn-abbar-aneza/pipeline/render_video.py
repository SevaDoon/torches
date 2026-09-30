"""Render the picture: executes film.py frame by frame, in parallel chunks.

    python3 render_video.py out.mp4 [--workers 4] [--from 0 --to 208]
    python3 render_video.py --stills dir/   # one still per shot, for review
"""
import argparse
import os
import subprocess
import sys
import time
from multiprocessing import Process

import numpy as np
from PIL import Image

import importlib

from config import BLACK, FPS, H, W
from gfx import Grain, push, to_uint8

# Which edit to render: film (v1) or film_v2. Set with --edit or BNABBAR_EDIT.
EDIT = os.environ.get("BNABBAR_EDIT", "film")
film = importlib.import_module(EDIT)


class Renderer:
    def __init__(self):
        self.shots = film.build_shots()
        self.bg = film.Backgrounds()
        self.vintage = getattr(film, "LOOK", None) == "vintage"
        self.grain = Grain(sigma=(3.0 if self.vintage else 2.4) / 255.0)
        self.slots = {}
        self.black = np.array(BLACK, np.float32) / 255.0
        if self.vintage:
            from look import Vintage
            self.look = Vintage()

    def shot_at(self, t):
        for s in self.shots:
            if s.start <= t < s.end:
                return s
        return self.shots[-1]

    def slot(self, shot):
        if shot.slot not in self.slots:
            self.slots[shot.slot] = film.SlotReader(shot.slot, shot.start)
        return self.slots[shot.slot]

    def frame(self, fi):
        t = fi / FPS
        s = self.shot_at(t)
        archival = None
        if s.bg == "slot":
            rd = self.slot(s)
            archival = rd.frame(t) if rd.available else None
        if archival is not None:
            # Real archive: shown as-is — no push, no grain, no text on faces.
            f = archival
            g = s.gain(t)
            return to_uint8(self.black + (f - self.black) * g)
        if s.bg == "black":
            f = self.bg.black.copy()
        elif s.bg == "paper":
            f = self.bg.paper.copy()
        elif s.bg == "album" or (s.bg == "slot" and self.vintage):
            f = self.bg.album.copy()
        elif s.bg == "map":
            f = self.bg.map_view(s.map, t)
        else:                                   # empty archive slot: placeholder card
            f = self.bg.slot_bg.copy()
            f *= (1 - self.bg.slot_frame)
            f += self.bg.slot_frame * np.array([0.9, 0.87, 0.8], np.float32)
        for el in s.els:
            if s.bg == "slot" and el.t_in == 0:
                el.t_in = s.start               # slot-card text is laid out at t=0
            el.draw(f, t)
        if self.vintage:
            f = push(f, max(0.003, s.push_at(t)), s.anchor, self.look.weave(t))
        else:
            f = push(f, s.push_at(t), s.anchor)
        g = s.gain(t)
        if g < 1.0:
            f = self.black + (f - self.black) * g
        if self.vintage:
            self.look.apply(f, fi, t)
        self.grain.apply(f, fi)
        for el in s.overlays:
            el.draw(f, t)
        return to_uint8(f)


def encode(path, f0, f1, crf):
    r = Renderer()
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24",
           "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
           "-c:v", "libx264", "-preset", "slow", "-crf", str(crf), "-tune", "grain",
           "-pix_fmt", "yuv420p", "-colorspace", "bt709", "-color_primaries", "bt709",
           "-color_trc", "bt709", "-movflags", "+faststart", path]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    t0 = time.time()
    for fi in range(f0, f1):
        p.stdin.write(r.frame(fi).tobytes())
        if (fi - f0) % 250 == 0:
            done = fi - f0 + 1
            el = time.time() - t0
            print(f"[{os.path.basename(path)}] {done}/{f1 - f0} "
                  f"({el / done:.3f}s/frame)", flush=True)
    p.stdin.close()
    p.wait()


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out", nargs="?")
    ap.add_argument("--workers", type=int, default=4)
    ap.add_argument("--from", dest="t0", type=float, default=0.0)
    ap.add_argument("--to", dest="t1", type=float, default=film.DURATION)
    ap.add_argument("--crf", type=int, default=17)
    ap.add_argument("--stills")
    ap.add_argument("--at", type=float, nargs="*")
    ap.add_argument("--edit", help="film (v1) or film_v2; overrides BNABBAR_EDIT")
    a = ap.parse_args()
    if a.edit and a.edit != EDIT:
        os.environ["BNABBAR_EDIT"] = a.edit
        os.execv(sys.executable, [sys.executable] + sys.argv)

    if a.stills:
        os.makedirs(a.stills, exist_ok=True)
        r = Renderer()
        times = a.at or [s.start + (s.end - s.start) * 0.72 for s in r.shots]
        for t in times:
            im = Image.fromarray(r.frame(int(round(t * FPS))))
            im.save(os.path.join(a.stills, f"{t:07.2f}.png"))
        print("stills:", len(times))
        return

    f0, f1 = int(round(a.t0 * FPS)), int(round(a.t1 * FPS))
    n = max(1, a.workers)
    bounds = np.linspace(f0, f1, n + 1).astype(int)
    parts = [f"{a.out}.part{i}.mp4" for i in range(n)]
    procs = [Process(target=encode, args=(parts[i], bounds[i], bounds[i + 1], a.crf))
             for i in range(n)]
    for p in procs:
        p.start()
    for p in procs:
        p.join()
    if any(p.exitcode for p in procs):
        sys.exit("a render worker failed")
    lst = a.out + ".txt"
    with open(lst, "w") as fh:
        for p in parts:
            fh.write(f"file '{os.path.abspath(p)}'\n")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst,
                    "-c", "copy", a.out], check=True)
    for p in parts + [lst]:
        os.remove(p)
    print("wrote", a.out)


if __name__ == "__main__":
    main()
