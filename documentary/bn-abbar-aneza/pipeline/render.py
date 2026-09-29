"""One command to rebuild the film: picture + sound + mux.

    python3 pipeline/render.py                 # full film -> renders/
    python3 pipeline/render.py --preview       # 960x540 proxy, faster

Archive slots in slots/ are picked up automatically (see slots/README.md).
"""
import argparse
import os
import subprocess
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)

from config import RENDERS, SAMPLES  # noqa: E402

VERSION = "v1"


def run(cmd):
    print("+", " ".join(cmd), flush=True)
    subprocess.run(cmd, check=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--workers", type=int, default=os.cpu_count() or 4)
    ap.add_argument("--preview", action="store_true")
    a = ap.parse_args()

    if not os.path.isdir(os.path.join(SAMPLES, "samples", "cello")):
        run(["bash", os.path.join(HERE, "fetch_assets.sh")])

    os.makedirs(RENDERS, exist_ok=True)
    pic = os.path.join(RENDERS, f".picture_{VERSION}.mp4")
    wav = os.path.join(RENDERS, f".mix_{VERSION}.wav")
    out = os.path.join(RENDERS, f"bn-abbar-aneza_{VERSION}_workingcut.mp4")

    run([sys.executable, os.path.join(HERE, "render_video.py"), pic,
         "--workers", str(a.workers)])
    run([sys.executable, os.path.join(HERE, "audio.py"), wav])

    vf = ["-vf", "scale=960:540:flags=lanczos"] if a.preview else []
    vcodec = (["-c:v", "libx264", "-crf", "23", "-preset", "medium"] if a.preview
              else ["-c:v", "copy"])
    run(["ffmpeg", "-v", "error", "-y", "-i", pic, "-i", wav, *vf, *vcodec,
         "-af", "alimiter=limit=0.891:level=false",       # true-peak safety at -1 dBFS
         "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
         "-map", "0:v:0", "-map", "1:a:0", "-shortest",
         "-metadata", "title=ماذا قال بن عبار عن عنزة؟ — نسخة عمل",
         "-movflags", "+faststart", out])
    print("wrote", out)


if __name__ == "__main__":
    main()
