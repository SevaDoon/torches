"""Shared constants for the «ماذا قال بن عبار عن عنزة؟» render pipeline."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.path.join(ROOT, "assets")
FONTS = os.path.join(ASSETS, "fonts")
GEO = os.path.join(ASSETS, "geo")
SLOTS = os.path.join(ROOT, "slots")
RENDERS = os.path.join(ROOT, "renders")
# Large intermediates (textures, map canvas, stems, samples) live outside the repo.
CACHE = os.environ.get("BNABBAR_CACHE", os.path.join(ROOT, ".cache"))
SAMPLES = os.environ.get("BNABBAR_SAMPLES", os.path.join(CACHE, "samples"))

W, H = 1920, 1080
FPS = 25
SR = 48000

# Palette (see 02_PREPRODUCTION.md §8)
BLACK = (14, 13, 11)
IVORY = (232, 226, 212)
ASH = (154, 147, 133)
PAPER = (230, 222, 205)
INK = (34, 30, 24)
OXIDE = (138, 51, 36)
SAND = (214, 199, 164)
SEA = (226, 220, 206)
WATERLINE = (150, 158, 152)

FONT_FILES = {
    "verse": "Amiri-Regular.ttf",
    "verse_bold": "Amiri-Bold.ttf",
    "sans_thin": "IBMPlexSansArabic-Thin.ttf",
    "sans_light": "IBMPlexSansArabic-Light.ttf",
    "sans": "IBMPlexSansArabic-Regular.ttf",
    "sans_medium": "IBMPlexSansArabic-Medium.ttf",
}


def font_path(key):
    return os.path.join(FONTS, FONT_FILES[key])
