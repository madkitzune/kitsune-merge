"""Партія 2: широка сцена храму, постройки без плит, галявина, ставок, декор, коропи зверху.
Токен: env POLLINATIONS_TOKEN. Результат: <name>_s<seed>.<ext> (вибір потім).
  python -I gen_batch2.py [фільтр...]
"""
import os, sys, time
from PIL import Image
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_pollinations import fetch, cut_white, STYLE, ART
import io

NOBG = ", plain pure white background, no text, no watermark"
JOBS = []  # (path, prompt, w, h, kind, seeds)
def job(path, prompt, w, h, kind, seeds): JOBS.append((path, prompt, w, h, kind, seeds))

job("scene/temple_wide.webp",
    "wide panoramic top-down 3/4 view fantasy game map of a peaceful japanese valley, green meadow hills, winding dirt and stone paths connecting eight empty grassy clearings, a small stream with rocks crossing the valley, cherry blossom trees and bushes only at the edges, NO buildings, NO houses, NO temples, empty land, mobile city builder map, "
    + STYLE + ", no text, no watermark", 1536, 1024, "scene", [11, 112, 213])
B = {
  "bridge": "small arched red wooden japanese bridge", "lanterns": "pair of japanese stone toro lanterns",
  "torii": "red japanese torii gate", "tree": "huge sacred tree with shimenawa rope",
  "spring": "small stone water basin spring with bamboo spout and lotus", "bell": "bronze temple bell hanging in a small wooden frame with roof",
  "altar": "small wooden offering altar with candles and fruit", "shrine": "small japanese shinto shrine building with curved roof",
}
GROUND = ", isometric 3/4 top view game building, standing directly on grass, no base platform, no tile, no floor slab, soft ground shadow"
for k, d in B.items():
    job(f"temple/{k}.png", f"{d}{GROUND}, restored, warm glowing lights, beautiful, {STYLE}{NOBG}", 512, 512, "sprite_hard", [21, 122])
    rd = "ruined broken " + d + (" with dead bare branches, no leaves, no flowers" if k == "tree" else "")
    job(f"temple/{k}_ruin.png", f"{rd}{GROUND}, overgrown with moss, cracked, faded dull colors, abandoned, unlit, {STYLE}{NOBG}", 512, 512, "sprite_hard", [21, 122])
job("scene/fox_meadow.webp",
    "wide cozy forest glade home for little fox cubs seen from 3/4 top view, fox burrows under big tree roots at the edges, soft cushions, small campfire, paper lanterns, berry bushes, flowers, large empty open grass area in the center, warm evening light, "
    + STYLE + ", no characters, no animals, no text, no watermark", 1536, 1024, "scene", [31, 132])
job("scene/koi_pond.webp",
    "top-down view of a beautiful japanese koi pond like an aquarium game background, clear turquoise water filling most of the image, water lilies and lotus leaves near the edges, smooth stones and moss on the borders, small wooden bridge on one edge, water plants, large empty open water in the center, "
    + STYLE + ", no fish, no animals, no text, no watermark", 720, 1280, "scene", [41, 142])
DEC = {"lily": "single floating water lily pad with a pink flower, top-down view", "stone_lantern": "small japanese stone lantern standing in water, top 3/4 view",
       "lotus": "single pink lotus flower on a leaf, top-down view", "bridge_arch": "small red arched wooden footbridge, top 3/4 view",
       "pearl": "open seashell with a glowing pearl", "waterfall_rock": "mossy rock with a tiny waterfall, top 3/4 view"}
for k, d in DEC.items(): job(f"decor/{k}.png", f"{d}, game decoration icon, {STYLE}{NOBG}", 512, 512, "sprite", [51, 152])
KOI = {"koi_red": "red and white kohaku koi fish", "koi_white": "white koi fish with blue shimmer", "koi_gold": "golden koi fish with shiny coin-like scales",
       "koi_sage": "old wise koi fish with very long whiskers", "koi_moon": "dark blue koi fish with a glowing crescent moon mark on its back",
       "koi_dragon": "jade green koi fish with a small dragon head and horns"}
for k, d in KOI.items():
    job(f"pets/{k}.png", f"cute {d}, top-down view swimming koi seen from directly above, body curved, fins spread, single fish centered, {STYLE}{NOBG}", 512, 512, "sprite", [61, 162])

def strip_white_global(im, thr=242):
    px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and min(r, g, b) > thr: px[x, y] = (255, 255, 255, 0)
    return im

def save(path, data, kind):
    out = os.path.join(ART, path); os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(io.BytesIO(data))
    if kind == "scene":
        im.convert("RGB").save(out, "WEBP", quality=86); return
    im = cut_white(im)
    if kind == "sprite_hard": im = strip_white_global(im)
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    im.thumbnail((512, 512), Image.LANCZOS); im.save(out, "PNG", optimize=True)

def main():
    tok = os.environ.get("POLLINATIONS_TOKEN") or sys.exit("POLLINATIONS_TOKEN?")
    flt = sys.argv[1:]
    for path, prompt, w, h, kind, seeds in JOBS:
        if flt and not any(f in path for f in flt): continue
        for sd in seeds:
            p = path.replace(".", f"_s{sd}.", 1)
            if os.path.exists(os.path.join(ART, p)): print("skip", p); continue
            print("gen", p, flush=True)
            try: save(p, fetch(prompt, w, h, sd, tok), kind)
            except Exception as e: print("FAIL", p, e, flush=True)
            time.sleep(3)
    print("DONE", flush=True)

if __name__ == "__main__":
    main()
