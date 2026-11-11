"""Партія 4: предмети тем sakura / ocean / forest (10 рівнів кожна) у стилі kitsune/*.png.
  python -I gen_batch4.py [фільтр...]   токен: env POLLINATIONS_TOKEN
"""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_pollinations import fetch, save, P, ART

ITEMS = {
  "sakura": ["tiny green sprout in soil", "small leafy herb sprig", "pink tulip flower", "pink cherry blossom branch", "red hibiscus flower",
             "bouquet of pink flowers wrapped in paper", "green bamboo stalks with leaves", "pair of japanese hina dolls", "small japanese castle pagoda", "mount fuji with snow cap and cherry blossoms"],
  "ocean":  ["single shiny water droplet", "pink spiral seashell", "small pink shrimp", "colorful tropical clownfish", "cute round pufferfish",
             "red crab", "purple octopus", "friendly blue dolphin", "big blue whale", "golden trident with gems"],
  "forest": ["red mushroom with white dots", "brown acorn", "orange autumn leaf", "glowing blue butterfly", "cute brown owl",
             "lit candle with warm glow", "old rolled parchment scroll with ribbon", "glowing purple crystal ball", "glowing crescent moon with stars", "small green dragon coiled"],
}

def main():
    tok = os.environ.get("POLLINATIONS_TOKEN") or sys.exit("POLLINATIONS_TOKEN?")
    flt = sys.argv[1:]
    for theme, items in ITEMS.items():
        for i, d in enumerate(items, 1):
            p = f"{theme}/{i}.png"
            if flt and not any(f in p for f in flt): continue
            if os.path.exists(os.path.join(ART, p)): print("skip", p); continue
            print("gen", p, flush=True)
            try: save(p, fetch(P(d + ", merge game item icon, cute, glossy"), 512, 512, 40 + i, tok), "sprite")
            except Exception as e: print("FAIL", p, e, flush=True)
            time.sleep(3)
    print("DONE", flush=True)

if __name__ == "__main__":
    main()
