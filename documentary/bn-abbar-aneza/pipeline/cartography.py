"""Engraved-style map of Arabia built from Natural Earth 1:10m data.

Conventions borrowed from 19th-century engraved maps: water-lining along the
coasts, stippled sand seas, a light graticule, Arabic place names — and no
modern political borders, because the geography the poet writes predates them.
Nothing here is an image of a real old map; it is a new map drawn from real
data, and it is presented as such.
"""
import json
import math
import os

import numpy as np
from PIL import Image, ImageDraw, ImageFilter
from shapely.geometry import shape, box, LineString, Polygon, MultiPolygon
from shapely.ops import unary_union, transform as shp_transform

from config import CACHE, GEO, INK, OXIDE, W, H
from gfx import paper_texture, render_run

LON0, LON1, LAT0, LAT1 = 18.0, 66.0, 6.0, 44.0
STD_PAR = 27.0
K = 120.0                                   # px per degree of latitude
KX = K * math.cos(math.radians(STD_PAR))
CW = int((LON1 - LON0) * KX)
CH = int((LAT1 - LAT0) * K)

LAND = (216, 203, 170)
SEA = (228, 222, 208)

# Colour schemes: "light" = engraved paper map (v1/v2); "dark" = v3 night map.
STYLES = {
    "light": dict(land=LAND, sea=SEA, ink=INK, water=(95, 108, 104), sea_label=(70, 78, 80),
                  accent=OXIDE, tex=1.0),
    "dark": dict(land=(46, 42, 37), sea=(17, 18, 20), ink=(214, 204, 184),
                 water=(120, 124, 120), sea_label=(140, 146, 146), accent=(212, 175, 106),
                 tex=0.35),
}
STYLE = "light"


def _st():
    return STYLES[STYLE]


def proj(lon, lat):
    return (lon - LON0) * KX, (LAT1 - lat) * K


def _proj_geom(g):
    return shp_transform(lambda x, y, z=None: ((np.asarray(x) - LON0) * KX,
                                               (LAT1 - np.asarray(y)) * K), g)


def _load(name):
    with open(os.path.join(GEO, f"arabia_{name}.geojson"), encoding="utf-8") as f:
        return json.load(f)["features"]


def _polys(g):
    if isinstance(g, Polygon):
        return [g]
    if isinstance(g, MultiPolygon):
        return list(g.geoms)
    if hasattr(g, "geoms"):
        out = []
        for gg in g.geoms:
            out += _polys(gg)
        return out
    return []


def _lines(g):
    if g.is_empty:
        return []
    if isinstance(g, LineString):
        return [g]
    if isinstance(g, Polygon):
        return [LineString(g.exterior.coords)] + [LineString(i.coords) for i in g.interiors]
    if hasattr(g, "geoms"):
        out = []
        for gg in g.geoms:
            out += _lines(gg)
        return out
    return []


def _draw_lines(d, geoms, fill, width):
    for ln in geoms:
        pts = list(ln.coords)
        if len(pts) > 1:
            d.line(pts, fill=fill, width=width, joint="curve")


# Arabic labels: (text, lon, lat, size, rotation_deg, kind)
REGION_LABELS = [
    ("الحجاز", 40.4, 23.4, 60, 0, "region"),
    ("نجد", 44.6, 24.6, 72, 0, "region"),
    ("النفود", 41.3, 28.35, 56, 0, "region"),
    ("بادية الشام", 39.6, 32.9, 70, 0, "region"),
    ("العراق", 45.6, 31.4, 64, 0, "region"),
    ("الربع الخالي", 50.5, 20.2, 70, 0, "region"),
    ("البحر الأحمر", 38.3, 21.0, 54, -58, "sea"),
    ("الخليج العربي", 51.0, 27.35, 52, -26, "sea"),
    ("البحر المتوسط", 31.4, 33.4, 52, 0, "sea"),
]
PLACES = [
    # (text, lon, lat, label dx, label dy) — dx/dy in canvas px from the dot
    ("خيبر", 39.29, 25.70, 20, 8),
    ("العُلا", 37.92, 26.61, -22, 8),
    ("حوران", 36.30, 32.70, 16, -44),
]
KHAYBAR = (39.29, 25.70)
# Generalised northward movement (a direction, not a surveyed road): Khaybar →
# Tayma → Wadi al-Sirhan → Hawran, with a branch into the central Syrian steppe.
ROUTE_MAIN = [(39.29, 25.70), (38.95, 26.70), (38.55, 27.63), (38.30, 29.10),
              (37.90, 30.40), (37.20, 31.60), (36.55, 32.45)]
ROUTE_BRANCH = [(37.90, 30.40), (38.60, 31.90), (38.90, 33.30), (39.30, 34.40)]


def build(force=False):
    """Return (canvas uint8 HxWx3, labels uint8 HxWx4). Cached on disk."""
    sfx = "" if STYLE == "light" else "_" + STYLE
    cpath = os.path.join(CACHE, f"map_canvas{sfx}.npy")
    lpath = os.path.join(CACHE, f"map_labels{sfx}.npy")
    st = _st()
    if not force and os.path.exists(cpath) and os.path.exists(lpath):
        return np.load(cpath), np.load(lpath)
    os.makedirs(CACHE, exist_ok=True)

    # ------------------------------------------------ paper + land tint
    paper = paper_texture(seed=11, size=(CH, CW), falloff=False)
    paper = paper / (np.array([230, 222, 205], np.float32) / 255.0)  # relative texture
    paper = 1.0 + (paper - 1.0) * st["tex"]

    land = unary_union([_proj_geom(shape(f["geometry"])).simplify(0.6)
                        for f in _load("land")])
    lakes = [_proj_geom(shape(f["geometry"])).simplify(0.5) for f in _load("lakes")]

    mask = Image.new("L", (CW, CH), 0)
    dm = ImageDraw.Draw(mask)
    for p in _polys(land):
        dm.polygon(list(p.exterior.coords), fill=255)
        for hole in p.interiors:
            dm.polygon(list(hole.coords), fill=0)
    for lk in lakes:
        for p in _polys(lk):
            dm.polygon(list(p.exterior.coords), fill=0)
    mask = mask.filter(ImageFilter.GaussianBlur(1.2))
    m = np.asarray(mask, np.float32)[..., None] / 255.0
    col = (np.array(st["land"], np.float32) * m + np.array(st["sea"], np.float32) * (1 - m)) / 255.0
    base = np.clip(col * paper, 0, 1)
    img = Image.fromarray((base * 255).astype(np.uint8)).convert("RGBA")

    ink = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    d = ImageDraw.Draw(ink)
    ink_rgb = tuple(st["ink"])

    # ------------------------------------------------ graticule (5°)
    for lon in range(25, 62, 5):
        x, _ = proj(lon, 0)
        d.line([(x, 0), (x, CH)], fill=ink_rgb + (26,), width=2)
    for lat in range(10, 41, 5):
        _, y = proj(0, lat)
        d.line([(0, y), (CW, y)], fill=ink_rgb + (26,), width=2)

    # ------------------------------------------------ water-lining
    sea_region = box(0, 0, CW, CH).difference(land)
    for i, dist in enumerate([7, 15, 25, 37, 51, 67]):
        ring = land.buffer(dist, resolution=4).boundary.intersection(sea_region)
        alpha = int(118 * (1 - i / 6.5))
        _draw_lines(d, _lines(ring.simplify(0.8)), WATERLINE_RGBA(alpha), 2)

    # ------------------------------------------------ stippled sand seas
    rng = np.random.default_rng(5)
    for f in _load("geography_regions_polys"):
        name = (f["properties"].get("name") or f["properties"].get("NAME") or "").lower()
        dens = {"an nafud desert": 0.009, "rub’ al khali": 0.005}.get(name)
        if not dens:
            continue
        g = _proj_geom(shape(f["geometry"])).intersection(land)
        gmask = Image.new("L", (CW, CH), 0)
        gd = ImageDraw.Draw(gmask)
        for p in _polys(g):
            gd.polygon(list(p.exterior.coords), fill=255)
        ga = np.asarray(gmask) > 0
        ys, xs = np.nonzero(ga)
        if len(xs) == 0:
            continue
        n = int(len(xs) * dens)
        idx = rng.choice(len(xs), size=n, replace=False)
        for x, y in zip(xs[idx], ys[idx]):
            r = rng.uniform(0.8, 1.7)
            d.ellipse([x - r, y - r, x + r, y + r], fill=ink_rgb + (int(rng.uniform(40, 90)),))

    # ------------------------------------------------ rivers
    for f in _load("rivers_lake_centerlines"):
        nm = (f["properties"].get("name") or "")
        if not any(k in nm for k in ("Euphrates", "Tigris", "Nile", "Jordan", "Orontes")):
            continue
        g = _proj_geom(shape(f["geometry"])).simplify(0.6)
        _draw_lines(d, _lines(g), ink_rgb + (150,), 3)

    # ------------------------------------------------ coastline + lakes
    for f in _load("coastline"):
        g = _proj_geom(shape(f["geometry"])).simplify(0.5)
        _draw_lines(d, _lines(g), ink_rgb + (225,), 4)
    for lk in lakes:
        _draw_lines(d, _lines(lk.boundary), ink_rgb + (190,), 3)

    ink = ink.filter(ImageFilter.GaussianBlur(0.5))
    img = Image.alpha_composite(img, ink).convert("RGB")
    canvas = np.asarray(img, np.uint8)

    # ------------------------------------------------ labels layer (parallax)
    labels = Image.new("RGBA", (CW, CH), (0, 0, 0, 0))
    for txt, lon, lat, size, rot, kind in REGION_LABELS:
        colr = tuple(st["ink"]) if kind == "region" else tuple(st["sea_label"])
        g = render_run(txt, "verse", size, colr)
        a = np.clip(g.rgba[..., 3] * (0.62 if kind == "region" else 0.55), 0, 1)
        rgb = np.array(colr, np.float32)
        tile = np.dstack([np.broadcast_to(rgb, a.shape + (3,)), a * 255]).astype(np.uint8)
        im = Image.fromarray(tile, "RGBA")
        if rot:
            im = im.rotate(rot, resample=Image.BICUBIC, expand=True)
        x, y = proj(lon, lat)
        labels.alpha_composite(im, (int(x - im.width / 2), int(y - im.height / 2)))
    dl = ImageDraw.Draw(labels)
    for txt, lon, lat, dx, dy in PLACES:
        x, y = proj(lon, lat)
        if txt != "خيبر":            # Khaybar's marker is drawn live, in oxide
            dl.ellipse([x - 5, y - 5, x + 5, y + 5], fill=tuple(st["ink"]) + (235,))
        g = render_run(txt, "verse", 46, tuple(st["ink"]))
        a = (g.rgba[..., 3] * 255).astype(np.uint8)
        tile = np.dstack([np.broadcast_to(np.array(st["ink"], np.uint8), a.shape + (3,)), a])
        im = Image.fromarray(tile, "RGBA")
        lx = x + dx if dx > 0 else x + dx - g.advance
        labels.alpha_composite(im, (int(lx - g.pad), int(y + dy - g.pad - g.ascent + 30)))
    labels = np.asarray(labels, np.uint8)

    np.save(cpath, canvas)
    np.save(lpath, labels)
    return canvas, labels


def WATERLINE_RGBA(alpha):
    return tuple(_st()["water"]) + (alpha,)


class MapCamera:
    """Maps (center lon/lat, visible height in degrees) to a 1920x1080 view."""

    def __init__(self, canvas, labels):
        self.canvas = Image.fromarray(canvas)
        self.labels = Image.fromarray(labels, "RGBA")

    def affine(self, lon, lat, height_deg, parallax=0.0):
        cx, cy = proj(lon, lat)
        s = (height_deg * K) / H * (1.0 - parallax)       # canvas px per screen px
        return (s, 0, cx - s * W / 2, 0, s, cy - s * H / 2), s

    def view(self, lon, lat, height_deg):
        coeffs, s = self.affine(lon, lat, height_deg)
        base = self.canvas.transform((W, H), Image.AFFINE, coeffs, resample=Image.BICUBIC)
        lc, _ = self.affine(lon, lat, height_deg, parallax=0.03)
        lab = self.labels.transform((W, H), Image.AFFINE, lc, resample=Image.BICUBIC)
        base = base.convert("RGBA")
        base.alpha_composite(lab)
        return np.asarray(base.convert("RGB"), np.float32) / 255.0, s

    def to_screen(self, lon, lat, clon, clat, height_deg):
        cx, cy = proj(clon, clat)
        s = (height_deg * K) / H
        x, y = proj(lon, lat)
        return (x - cx) / s + W / 2, (y - cy) / s + H / 2


def draw_route(frame, cam, clon, clat, hdeg, progress, width=3.2, dash=(18, 11)):
    """Draw the oxide route (dashed, antialiased via 2x supersampling)."""
    if progress <= 0:
        return
    ss = 2
    layer = Image.new("L", (W * ss, H * ss), 0)
    d = ImageDraw.Draw(layer)

    def polyline(pts, prog):
        scr = [cam.to_screen(lo, la, clon, clat, hdeg) for lo, la in pts]
        seg = [math.dist(scr[i], scr[i + 1]) for i in range(len(scr) - 1)]
        total = sum(seg)
        target = total * prog
        run, on, left = 0.0, True, dash[0]
        drawn_end = None
        for i in range(len(scr) - 1):
            (x0, y0), (x1, y1) = scr[i], scr[i + 1]
            L = seg[i]
            pos = 0.0
            while pos < L and run < target:
                step = min(left, L - pos, target - run)
                a = pos / L
                b = (pos + step) / L
                p0 = (x0 + (x1 - x0) * a, y0 + (y1 - y0) * a)
                p1 = (x0 + (x1 - x0) * b, y0 + (y1 - y0) * b)
                if on:
                    d.line([(p0[0] * ss, p0[1] * ss), (p1[0] * ss, p1[1] * ss)],
                           fill=255, width=int(width * ss))
                drawn_end = (p1, (x1 - x0, y1 - y0))
                pos += step
                run += step
                left -= step
                if left <= 1e-6:
                    on = not on
                    left = dash[0] if on else dash[1]
        return drawn_end

    end = polyline(ROUTE_MAIN, min(1.0, progress * 1.25))
    if progress > 0.55:
        polyline(ROUTE_BRANCH, (progress - 0.55) / 0.45)
    if progress >= 0.999 and end:
        (px, py), (vx, vy) = end
        n = math.hypot(vx, vy) or 1
        ux, uy = vx / n, vy / n
        L = 16
        a = (px - ux * L - uy * L * 0.55, py - uy * L + ux * L * 0.55)
        b = (px - ux * L + uy * L * 0.55, py - uy * L - ux * L * 0.55)
        d.polygon([(px * ss, py * ss), (a[0] * ss, a[1] * ss), (b[0] * ss, b[1] * ss)], fill=255)
    layer = layer.resize((W, H), Image.LANCZOS)
    a = np.asarray(layer, np.float32)[..., None] / 255.0 * 0.92
    frame *= (1 - a)
    frame += a * (np.array(_st()["accent"], np.float32) / 255.0)


def draw_marker(frame, cam, clon, clat, hdeg, opacity, lon=KHAYBAR[0], lat=KHAYBAR[1]):
    if opacity <= 0:
        return
    x, y = cam.to_screen(lon, lat, clon, clat, hdeg)
    ss = 4
    r = 7.5
    size = int(r * 2 + 8)
    im = Image.new("L", (size * ss, size * ss), 0)
    d = ImageDraw.Draw(im)
    c = size * ss / 2
    d.ellipse([c - r * ss, c - r * ss, c + r * ss, c + r * ss], fill=255)
    im = im.resize((size, size), Image.LANCZOS)
    a = np.asarray(im, np.float32)[..., None] / 255.0 * opacity
    x0, y0 = int(round(x - size / 2)), int(round(y - size / 2))
    if 0 <= x0 and 0 <= y0 and x0 + size <= W and y0 + size <= H:
        dst = frame[y0:y0 + size, x0:x0 + size]
        dst *= (1 - a)
        dst += a * (np.array(_st()["accent"], np.float32) / 255.0)
