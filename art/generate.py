"""Генерує арт предметів через Gemini (Nano Banana) і вирізає білий фон.
Ключ: змінна середовища GEMINI_API_KEY.
  python generate.py                 # усе, чого ще нема
  python generate.py kitsune         # одна тема
  python generate.py kitsune 7 -f    # один предмет, перезаписати
"""
import base64, json, os, sys, time, urllib.request, urllib.error
from collections import deque
from PIL import Image

MODEL = os.environ.get("GEMINI_IMAGE_MODEL", "gemini-2.5-flash-image")
STYLE = ("single game item icon, centered, casual mobile merge game style, soft 3D render, glossy, "
         "rounded chunky shapes, bright rim light, gentle dark outline, the object fills about 80% of the frame, "
         "isolated on a plain pure white background, no text, no ground shadow, square image")
ITEMS = {
  "kitsune": ["a single small green maple leaf with a dewdrop", "a pink sakura blossom branch with three flowers",
    "a skewer of three pastel dango rice balls", "a glowing red paper lantern with golden tassel",
    "a small golden shrine bell with red rope", "a miniature red torii gate with glowing moss",
    "a cute white fox spirit (kitsune) sitting, orange glowing tail tips", "a full moon disk with a fox silhouette, silver glow",
    "a magic teardrop-shaped fox jewel with a blue-white flame inside", "a golden crown with nine fox tails ornament and gems"],
  "sakura": ["a tiny green sprout in a bit of soil", "a sprig of green herb leaves", "a pink tulip", "a sakura flower",
    "a red hibiscus flower", "a flower bouquet with a ribbon", "a tanabata bamboo branch with paper wishes",
    "a pair of cute hina dolls", "a miniature pink pagoda castle", "mount fuji with pink sakura and sunrise"],
  "ocean": ["a water droplet", "a spiral seashell", "a pink shrimp", "a tropical clownfish", "a puffer fish",
    "a red crab", "a purple octopus", "a jumping dolphin", "a blue whale", "a golden trident with pearls"],
  "forest": ["a red spotted mushroom", "an acorn", "an orange autumn leaf", "a glowing magic feather", "a cute owl",
    "a lit candle with wax drips", "an ancient rolled scroll", "a crystal ball with green mist",
    "a crescent moon with little stars", "a small friendly green dragon"],
}
RICH = ["simple", "simple", "a little detail", "some gold accents", "gold accents and soft glow",
        "rich gold details and glow", "magical glow and sparkles", "strong magical aura", "radiant, legendary", "legendary, dazzling, the most precious"]

def gen(prompt, key):
    body = json.dumps({"contents": [{"parts": [{"text": prompt}]}],
                       "generationConfig": {"responseModalities": ["IMAGE"]}}).encode()
    req = urllib.request.Request(f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent",
                                 data=body, headers={"x-goog-api-key": key, "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=180) as r:
        data = json.load(r)
    for p in data["candidates"][0]["content"]["parts"]:
        if "inlineData" in p:
            return base64.b64decode(p["inlineData"]["data"])
    raise RuntimeError("no image in response")

def cut_white(path, tol=28):
    im = Image.open(path).convert("RGBA"); w, h = im.size; px = im.load()
    near = lambda c: c[0] > 255 - tol and c[1] > 255 - tol and c[2] > 255 - tol
    seen = set(); q = deque([(0, 0), (w-1, 0), (0, h-1), (w-1, h-1)])
    while q:
        x, y = q.popleft()
        if (x, y) in seen or not (0 <= x < w and 0 <= y < h): continue
        seen.add((x, y))
        if not near(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        q.extend(((x+1, y), (x-1, y), (x, y+1), (x, y-1)))
    bbox = im.getbbox()
    if bbox: im = im.crop(bbox)
    s = max(im.size); canvas = Image.new("RGBA", (s, s)); canvas.paste(im, ((s - im.width)//2, (s - im.height)//2))
    canvas.resize((512, 512), Image.LANCZOS).save(path)

def main():
    key = os.environ.get("GEMINI_API_KEY") or sys.exit("set GEMINI_API_KEY")
    args = [a for a in sys.argv[1:] if a != "-f"]; force = "-f" in sys.argv
    themes = [args[0]] if args else list(ITEMS)
    only = int(args[1]) if len(args) > 1 else None
    base = os.path.dirname(os.path.abspath(__file__))
    for th in themes:
        os.makedirs(os.path.join(base, th), exist_ok=True)
        for i, item in enumerate(ITEMS[th], 1):
            if only and i != only: continue
            out = os.path.join(base, th, f"{i}.png")
            if os.path.exists(out) and not force: print("skip", th, i); continue
            for attempt in range(3):
                try:
                    open(out, "wb").write(gen(f"{item}, {RICH[i-1]}. {STYLE}", key)); cut_white(out); print("ok", th, i); break
                except urllib.error.HTTPError as e:
                    print("http", e.code, e.read()[:200]); time.sleep(10)
                except Exception as e:
                    print("err", e); time.sleep(5)

if __name__ == "__main__":
    main()
