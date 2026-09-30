"""Helpers for cutting the interview ("لقاء بن عبار") into the film.

    python3 interview_tools.py probe            # duration, size, speech map, contact sheets
    python3 interview_tools.py snap             # snap cuts.json in/out points to pauses

The speech map (slots/speech.json) lists speech runs separated by pauses of at
least 0.35 s, so every excerpt starts and ends on a breath, never mid-word.
"""
import json
import os
import re
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from config import SLOTS  # noqa: E402

SR = 16000


def source():
    for e in (".mp4", ".mov", ".mkv", ".m4v", ".webm"):
        p = os.path.join(SLOTS, "interview" + e)
        if os.path.exists(p):
            return p
    sys.exit("slots/interview.* not found")


def probe(path):
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", path], capture_output=True, text=True)
    dur = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stderr)
    size = re.search(r"Video:.*?(\d{2,5})x(\d{2,5})", r.stderr)
    fps = re.search(r"([\d.]+) fps", r.stderr)
    d = int(dur.group(1)) * 3600 + int(dur.group(2)) * 60 + float(dur.group(3))
    return d, (int(size.group(1)), int(size.group(2))) if size else None, \
        float(fps.group(1)) if fps else None


def speech_map(path, min_pause=0.35):
    r = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR),
                        "-f", "f32le", "-"], capture_output=True, check=True)
    x = np.frombuffer(r.stdout, np.float32)
    hop = int(0.02 * SR)
    frames = x[:len(x) // hop * hop].reshape(-1, hop)
    db = 20 * np.log10(np.sqrt((frames ** 2).mean(axis=1)) + 1e-9)
    floor = np.percentile(db, 12)
    thr = floor + max(8.0, (np.percentile(db, 90) - floor) * 0.28)
    voiced = db > thr
    # close tiny gaps, then find runs
    k = int(min_pause / 0.02)
    runs, start, gap = [], None, 0
    for i, v in enumerate(voiced):
        if v:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= k:
                runs.append((start * 0.02, (i - gap + 1) * 0.02))
                start, gap = None, 0
    if start is not None:
        runs.append((start * 0.02, len(voiced) * 0.02))
    return [(round(a, 2), round(b, 2)) for a, b in runs if b - a > 0.25]


def contact_sheets(path, dur, every=5.0, out_dir=None):
    from PIL import Image, ImageDraw
    out_dir = out_dir or os.path.join(SLOTS, "..", ".cache", "interview_sheets")
    os.makedirs(out_dir, exist_ok=True)
    times = np.arange(0, dur, every)
    thumbs = []
    for t in times:
        r = subprocess.run(["ffmpeg", "-v", "error", "-ss", f"{t:.2f}", "-i", path, "-frames:v",
                            "1", "-vf", "scale=320:-2", "-f", "image2pipe", "-vcodec", "png",
                            "-"], capture_output=True)
        if r.stdout:
            import io
            thumbs.append((t, Image.open(io.BytesIO(r.stdout)).convert("RGB")))
    cols, per = 6, 36
    paths = []
    for s in range(0, len(thumbs), per):
        part = thumbs[s:s + per]
        tw, th = part[0][1].size
        sheet = Image.new("RGB", (cols * tw, ((len(part) + cols - 1) // cols) * (th + 18)),
                          (20, 20, 20))
        d = ImageDraw.Draw(sheet)
        for i, (t, im) in enumerate(part):
            x, y = (i % cols) * tw, (i // cols) * (th + 18)
            sheet.paste(im, (x, y))
            d.text((x + 4, y + th + 2), f"{int(t // 60)}:{t % 60:04.1f}", fill=(255, 220, 0))
        p = os.path.join(out_dir, f"sheet_{s // per:02d}.png")
        sheet.save(p)
        paths.append(p)
    return paths


def snap(cuts, runs, slack=0.12):
    """Move each in-point to the start of its speech run and each out-point to
    the end of its run, plus a little air."""
    def nearest_start(t):
        return min((a for a, b in runs), key=lambda a: abs(a - t))

    def nearest_end(t):
        return min((b for a, b in runs), key=lambda b: abs(b - t))
    for c in cuts.values():
        c["in"] = round(max(0.0, nearest_start(float(c["in"])) - slack), 2)
        c["out"] = round(nearest_end(float(c["out"])) + slack * 2, 2)
    return cuts


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else "probe"
    src = source()
    if cmd == "probe":
        d, size, fps = probe(src)
        runs = speech_map(src)
        json.dump({"duration": d, "size": size, "fps": fps, "speech": runs},
                  open(os.path.join(SLOTS, "speech.json"), "w"), indent=1)
        print(f"duration {d:.1f}s size {size} fps {fps}; {len(runs)} speech runs")
        for p in contact_sheets(src, d):
            print("sheet", p)
    elif cmd == "snap":
        cp = os.path.join(SLOTS, "cuts.json")
        cuts = json.load(open(cp, encoding="utf-8"))
        runs = json.load(open(os.path.join(SLOTS, "speech.json")))["speech"]
        json.dump(snap(cuts, runs), open(cp, "w", encoding="utf-8"), ensure_ascii=False,
                  indent=1)
        print("snapped", list(cuts))
