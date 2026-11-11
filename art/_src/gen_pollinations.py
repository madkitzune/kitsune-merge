"""Растровий арт через Pollinations (flux). Токен лише з env POLLINATIONS_TOKEN.
  python -I gen_pollinations.py                 # усе, чого ще нема (за пріоритетом)
  python -I gen_pollinations.py hoshi -f        # ассети, чий шлях містить 'hoshi', перезаписати
  python -I gen_pollinations.py scene --seeds 3 # кілька seed -> файли *_s<seed>.ext для вибору
Спрайти: білий фон -> прозорість (flood-fill від країв + чистка ореолу) -> PNG.
Сцени: WebP.
"""
import io, os, sys, time, urllib.parse, urllib.request, urllib.error
from collections import deque
from PIL import Image, ImageFilter

ART = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STYLE = "vibrant painterly anime gacha mobile game art, soft cel shading, bright saturated colors, clean outlines, high detail"
SPRITE = ", single object centered, full body, plain pure white background, no text, no watermark"
CHAR = ", single cute chibi character centered, full body, plain pure white background, no text, no watermark"
SCENE = ", no text, no watermark, no characters"

def P(desc, kind="sprite"):
    tail = {"sprite": SPRITE, "char": CHAR, "scene": SCENE}[kind]
    return f"{desc}, {STYLE}{tail}"

ASSETS = []  # (path, prompt, w, h, kind, seed)
def add(path, desc, w=512, h=512, kind="sprite", seed=7):
    ASSETS.append((path, P(desc, kind), w, h, kind, seed))

# 1. сцена храму
add("scene/temple_bg.webp", "top-down 3/4 view fantasy map of an empty green hill in japanese style, morning light, winding stone paths, large empty grassy clearings and bare stone foundations, ABSOLUTELY NO buildings, no houses, no temples, no roofs, only nature, paths, rocks and trees, small stream at the bottom, cherry trees at the edges, mobile city builder empty map", 720, 1280, "scene", 27)
add("scene/temple_bg_night.webp", "top-down 3/4 view fantasy map of a japanese fox shrine on a green hill at night, moonlight, fireflies, winding stone paths, several empty flat clearings and stone foundations ready for buildings, small stream at the bottom, mobile city builder map", 720, 1280, "scene", 11)
# 2. постройки
B = {
  "bridge": "small arched red wooden japanese bridge over a stream",
  "lanterns": "pair of japanese stone toro lanterns",
  "torii": "red japanese torii gate",
  "tree": "huge sacred tree with shimenawa rope and pink blossoms",
  "spring": "stone water basin spring with bamboo spout and lotus",
  "bell": "bronze temple bell hanging in a wooden frame with roof",
  "altar": "wooden offering altar with candles and fruit",
  "shrine": "small japanese shinto shrine building with curved roof",
}
for k, d in B.items():
    add(f"temple/{k}.png", f"{d}, isometric 3/4 top view game building, warm glowing lights, restored, beautiful", seed=21)
    add(f"temple/{k}_ruin.png", ("dead withered leafless gray tree with broken branches and torn shimenawa rope" if k=="tree" else f"ruined broken {d}")+", isometric 3/4 top view game building, overgrown with moss, cracked, faded colors, abandoned, unlit", seed=21)
# 3. бабуся Хоші
HOSHI = "kind old grandmother fox spirit kitsune, white silver fur, four fluffy tails with orange tips, red and white shrine maiden clothes, round glasses, holding a glowing paper lantern, warm smile, facing right"
add("hoshi.png", HOSHI, 512, 768, "char", 5)
add("hoshi_talk.png", HOSHI + ", mouth open speaking", 512, 768, "char", 5)
# 4. улюбленці, їжа
PETS = {
  "fox_gather": "orange baby fox with a small basket of berries", "fox_sleepy": "sleepy blue-grey baby fox wearing a nightcap",
  "fox_luck": "light green baby fox with a four-leaf clover on its ear", "fox_star": "purple baby fox with little stars in its tail",
  "fox_fire": "red-orange baby fox whose tail tip is a living flame", "fox_nine": "glowing white baby fox with nine small tails, legendary golden aura",
  "koi_red": "cute red and white koi fish", "koi_white": "cute white koi fish with blue shimmer", "koi_gold": "cute golden koi fish with coin scales",
  "koi_sage": "cute old koi fish with long whiskers wearing glasses", "koi_moon": "cute dark blue koi fish with a crescent moon mark, glowing",
  "koi_dragon": "cute jade green koi fish with a dragon head and small horns",
}
for k, d in PETS.items(): add(f"pets/{k}.png", d, kind="char", seed=3)
FOOD = {"rice": "bowl of white rice with chopsticks", "senbei": "japanese rice cracker senbei with nori", "onigiri": "triangular white onigiri rice ball wrapped with a black nori seaweed strip at the bottom, cute",
        "tempura": "shrimp tempura", "naruto": "narutomaki fish cake slice with pink spiral", "inari": "inari sushi"}
for k, d in FOOD.items(): add(f"food/{k}.png", d + ", food game icon", seed=3)
# 5. фони поля, заставка, логотип
BG = {"kitsune": "evening japanese fox shrine courtyard, purple sky, lanterns", "sakura": "pastel pink cherry blossom garden",
      "ocean": "underwater sunlit coral reef, turquoise", "forest": "night enchanted forest with fireflies"}
for k, d in BG.items(): add(f"bg/{k}.webp", d + ", soft blurred background, calm, low contrast", 720, 1280, "scene", 9)
add("scene/splash.webp", "cute chibi grandmother fox spirit and little fox kits in front of a glowing japanese shrine on a hill at sunset, magical sparkles, key art", 720, 1280, "scene", 13)
add("logo.png", "round golden emblem badge with a cute white kitsune fox face and nine tails, game logo icon", seed=17)
# 6. предмети kitsune
ITEMS = ["green maple leaf with a dewdrop", "pink sakura blossom branch", "three colorful dango balls on a wooden skewer: pink, white and green, bright saturated", "glowing red paper lantern",
         "small golden shrine bell", "single simple red torii gate, solid shapes, no text, no signs", "cute white fox spirit sitting", "full moon with fox silhouette",
         "magic fox jewel with blue flame inside", "golden crown with nine fox tails"]
for i, d in enumerate(ITEMS, 1): add(f"kitsune/{i}.png", d + ", merge game item icon", seed=30 + i)

def fetch(prompt, w, h, seed, tok):
    url = f"https://gen.pollinations.ai/image/{urllib.parse.quote(prompt)}?model=flux&width={w}&height={h}&seed={seed}&nologo=true"
    req = urllib.request.Request(url, headers={"Authorization": f"Bearer {tok}", "User-Agent": "kitsune-merge-artgen"})
    for attempt in range(5):
        try:
            with urllib.request.urlopen(req, timeout=240) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (402, 429, 500, 502, 503):
                wait = 30 * (attempt + 1); print(f"  http {e.code}, пауза {wait}s"); time.sleep(wait); continue
            raise
        except Exception as e:
            print("  err", e); time.sleep(10)
    raise RuntimeError("не вдалося")

def cut_white(im, tol=30):
    im = im.convert("RGBA"); w, h = im.size; px = im.load()
    near = lambda c: min(c[:3]) > 255 - tol
    seen = bytearray(w * h); q = deque()
    for x in range(w): q.extend(((x, 0), (x, h - 1)))
    for y in range(h): q.extend(((0, y), (w - 1, y)))
    while q:
        x, y = q.popleft(); i = y * w + x
        if seen[i]: continue
        seen[i] = 1
        if not near(px[x, y]): continue
        px[x, y] = (255, 255, 255, 0)
        if x > 0: q.append((x - 1, y))
        if x < w - 1: q.append((x + 1, y))
        if y > 0: q.append((x, y - 1))
        if y < h - 1: q.append((x, y + 1))
    # чистка ореолу: світлі пікселі на межі з прозорим -> напівпрозорі
    a = im.split()[3]; edge = a.filter(ImageFilter.MinFilter(3))
    ep = edge.load()
    for y in range(h):
        for x in range(w):
            r, g, b, al = px[x, y]
            if al and ep[x, y] == 0 and min(r, g, b) > 200: px[x, y] = (r, g, b, 90)
    bb = im.getbbox()
    if bb: im = im.crop(bb)
    return im

def save(path, data, kind):
    out = os.path.join(ART, path); os.makedirs(os.path.dirname(out), exist_ok=True)
    im = Image.open(io.BytesIO(data))
    if kind == "scene":
        im.convert("RGB").save(out, "WEBP", quality=86)
    else:
        im = cut_white(im)
        im.thumbnail((512, 768) if kind == "char" else (512, 512), Image.LANCZOS)
        im.save(out, "PNG", optimize=True)

def main():
    tok = os.environ.get("POLLINATIONS_TOKEN") or sys.exit("задай POLLINATIONS_TOKEN")
    args = sys.argv[1:]; force = "-f" in args
    seeds = int(args[args.index("--seeds") + 1]) if "--seeds" in args else 1
    flt = [a for a in args if not a.startswith("-") and not a.isdigit()]
    for path, prompt, w, h, kind, seed in ASSETS:
        if flt and not any(f in path for f in flt): continue
        for k in range(seeds):
            sd = seed + k * 101
            p = path if seeds == 1 else path.replace(".", f"_s{sd}.", 1)
            if os.path.exists(os.path.join(ART, p)) and not force: print("skip", p); continue
            print("gen", p, flush=True)
            save(p, fetch(prompt, w, h, sd, tok), kind)
            time.sleep(3)

if __name__ == "__main__":
    main()
