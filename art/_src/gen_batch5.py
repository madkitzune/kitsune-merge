"""Партія 5: арт фестивалів (фони міні-ігор, банери, спрайти).
  python -I gen_batch5.py [фільтр...]   токен: env POLLINATIONS_TOKEN
"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_pollinations import fetch, ART, STYLE
from gen_batch2 import save

SCENE = ", " + STYLE + ", no text, no watermark, no characters"
SPR = ", single object centered, " + STYLE + ", plain pure white background, no text, no watermark"
JOBS = [
  ("ev/bg_catch.webp", "night sky over a japanese festival village, many glowing paper lanterns floating in the dark blue sky, rooftops silhouettes at the very bottom, stars, large empty sky in the center" + SCENE, 720, 1280, "scene", 501),
  ("ev/bg_memory.webp", "top-down view of dark teal koi pond water with soft light caustics, lily pads only at the edges, calm, large empty water in the center" + SCENE, 720, 1280, "scene", 502),
  ("ev/bg_rhythm.webp", "japanese temple courtyard at dusk seen from the front, wooden bell tower frame in the center with empty space inside it, stone lanterns at the sides, warm sunset glow, cherry petals in the air" + SCENE, 720, 1280, "scene", 503),
  ("ev/banner_catch.webp", "wide festival banner, glowing red paper lanterns rising into a night sky over a japanese village, magical, cozy" + SCENE, 1024, 432, "scene", 511),
  ("ev/banner_memory.webp", "wide festival banner, colorful koi fish swimming among lotus flowers in a turquoise pond, top-down, cozy" + SCENE, 1024, 432, "scene", 512),
  ("ev/banner_rhythm.webp", "wide festival banner, big bronze japanese temple bell glowing with golden sound waves, sunset temple, cozy" + SCENE, 1024, 432, "scene", 513),
  ("ev/lantern.png", "glowing red japanese paper lantern, cute game item" + SPR, 512, 512, "sprite", 521),
  ("ev/lantern_gold.png", "glowing golden japanese paper lantern with sparkles, cute game item" + SPR, 512, 512, "sprite", 522),
  ("ev/thorn.png", "spiky brown chestnut burr with angry little eyes, cute game hazard item" + SPR, 512, 512, "sprite", 523),
  ("ev/basket.png", "woven bamboo basket, front view, cute game item" + SPR, 512, 512, "sprite", 524),
  ("ev/card_back.png", "ornate japanese playing card back, red lacquer with golden koi and wave pattern, rectangular card, front view" + SPR, 512, 704, "sprite", 525),
]

def main():
    tok = os.environ.get("POLLINATIONS_TOKEN") or sys.exit("POLLINATIONS_TOKEN?")
    flt = sys.argv[1:]
    for path, prompt, w, h, kind, seed in JOBS:
        if flt and not any(f in path for f in flt): continue
        if os.path.exists(os.path.join(ART, path)): print("skip", path); continue
        print("gen", path, flush=True)
        try: save(path, fetch(prompt, w, h, seed, tok), kind)
        except Exception as e: print("FAIL", path, e, flush=True)
        time.sleep(3)
    print("DONE", flush=True)

if __name__ == "__main__":
    main()
