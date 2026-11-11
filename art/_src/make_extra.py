"""Улюбленці, їжа, скіни + інлайн-превʼю всього арту. Запуск після make_sprites.py.
id — за art/НУЖЕН_АРТ.md (гра)."""
import os, math
from make_sprites import S, O, HL, spark, flower, ART, THEMES

def svg128(s, body): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>{"".join(s.defs)}</defs>{body}</svg>'

FOX = {  # main, dark, belly, tail tip, outline
  "fox_gather": ("#ffb168", "#f06a1e", "#fff6ea", "#ffffff", "#7a3510"),
  "fox_sleepy": ("#b7c6dc", "#6a7f9e", "#f2f6fb", "#ffffff", "#2f3d55"),
  "fox_luck": ("#bfe9a0", "#5fae4a", "#fbfff4", "#ffffff", "#2f5e22"),
  "fox_star": ("#c7a6f0", "#6a3fb5", "#f6efff", "#ffe57f", "#2e1660"),
  "fox_fire": ("#ff8a5c", "#d32f2f", "#ffe9d6", "#ffd54f", "#6d0f0f"),
  "fox_nine": ("#ffffff", "#d6def0", "#ffffff", "#ffd180", "#4a556b"),
}

def tail_main(fur, tipg, o):
    return (f'<path d="M84 100 C112 104 122 78 110 60 C104 52 94 58 98 68 C102 80 96 90 82 90Z" fill="{fur}" {O(o)}/>'
            f'<path d="M110 60 C104 52 94 58 98 68 C99 71 100 74 100 77 C108 74 114 68 110 60Z" fill="{tipg}"/>')

def chibi_fox(pid):
    s = S(pid + "_"); m, d, b, tp, o = FOX[pid]
    fur = s.rg("f", m, d, .4, .3, .85); bel = s.lg("b", b, m); tipg = s.lg("t", tp, d)
    back = front = ""
    tail = tail_main(fur, tipg, o)
    eyes = (f'<ellipse cx="46" cy="52" rx="7" ry="9" fill="#2a1a2a"/><ellipse cx="78" cy="52" rx="7" ry="9" fill="#2a1a2a"/>'
            f'<circle cx="44" cy="48" r="3" fill="#fff"/><circle cx="76" cy="48" r="3" fill="#fff"/>')
    if pid == "fox_fire":
        tail = tail_main(fur, s.lg("t2", "#fff59d", "#ff6d00"), o)
        back = f'<path d="M112 50 C98 60 106 70 98 76 C116 74 124 60 112 50Z" fill="{s.lg("fl", "#fff59d", "#ff3d00")}" {O("#8a1a00", 2.5)}/>'
        front = f'<path d="M58 18 C52 8 62 0 62 0 C64 8 72 10 66 18Z" fill="#ffca28" {O("#8a1a00", 2)}/>'
    elif pid == "fox_star":
        tail += "".join(spark(x, y, r, "#fff59d") for x, y, r in [(104, 70, 5), (110, 84, 4), (96, 92, 3.5)])
        front = spark(16, 30, 5, "#fff59d") + spark(112, 22, 4, "#fff59d")
    elif pid == "fox_nine":
        aura = s.rg("au", "#fff6c8", "#fff6c8", .5, .5, .5, 0)
        back = f'<circle cx="64" cy="66" r="62" fill="{aura}" opacity=".9"/>'
        for k in range(12):
            a = math.radians(k * 30)
            back += f'<path d="M64 66 L{64+62*math.cos(a-.08):.1f} {66+62*math.sin(a-.08):.1f} L{64+62*math.cos(a+.08):.1f} {66+62*math.sin(a+.08):.1f}Z" fill="#fff" opacity=".18"/>'
        tail = ""
        for i, ang in enumerate(range(-100, 101, 25)):
            tail += (f'<g transform="rotate({ang} 62 92)"><path d="M62 92 C52 72 48 50 54 26 C58 16 70 16 72 26 C76 50 72 72 64 92Z" fill="{fur}" {O(o, 2.5)}/>'
                     f'<path d="M54 26 C58 16 70 16 72 26 C70 32 58 32 54 26Z" fill="{tipg}"/></g>')
        front = spark(14, 26, 7) + spark(114, 22, 6) + spark(112, 104, 5) + spark(16, 100, 5)
    elif pid == "fox_sleepy":
        eyes = f'<path d="M39 54 q7 6 14 0 M71 54 q7 6 14 0" fill="none" {O("#2a1a2a", 3)}/>'
        cap = s.lg("cap", "#7986cb", "#283593")
        front = (f'<path d="M30 30 C40 6 70 0 96 8 C104 12 110 22 112 34 C100 26 90 24 84 26 C70 18 46 20 30 30Z" fill="{cap}" {O("#1a237e", 3)}/>'
                 + "".join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#fff59d"/>' for x, y in [(52, 14), (72, 10), (88, 18)])
                 + f'<circle cx="112" cy="38" r="7" fill="#fff" {O("#9fa8da", 2)}/>'
                 f'<path d="M28 30 C46 22 76 20 98 30" fill="none" {O("#ffffff", 7)}/>'
                 f'<text x="100" y="64" font-family="Arial" font-weight="900" font-size="16" fill="#9fa8da">z</text><text x="110" y="52" font-family="Arial" font-weight="900" font-size="11" fill="#c5cae9">z</text>')
    body = (back + tail +
        f'<ellipse cx="62" cy="98" rx="26" ry="20" fill="{fur}" {O(o)}/>'
        f'<ellipse cx="62" cy="102" rx="14" ry="12" fill="{bel}"/>'
        f'<ellipse cx="50" cy="116" rx="8" ry="5" fill="{fur}" {O(o, 3)}/><ellipse cx="74" cy="116" rx="8" ry="5" fill="{fur}" {O(o, 3)}/>'
        f'<path d="M30 34 L28 6 L52 22Z M94 34 L96 6 L72 22Z" fill="{fur}" {O(o)}/>'
        f'<path d="M34 26 L33 13 L45 22Z M90 26 L91 13 L79 22Z" fill="#ff9eb5"/>'
        f'<path d="M22 54 C22 30 40 18 62 18 C84 18 102 30 102 54 C102 72 84 82 62 82 C40 82 22 72 22 54Z" fill="{fur}" {O(o)}/>'
        f'<path d="M36 66 C44 80 80 80 88 66 C80 72 44 72 36 66Z" fill="{bel}"/>'
        + eyes +
        f'<ellipse cx="62" cy="62" rx="4" ry="3" fill="#2a1a2a"/><path d="M56 66 q6 5 12 0" fill="none" {O("#2a1a2a", 2.5)}/>'
        f'<circle cx="34" cy="62" r="6" fill="#ff8a80" opacity=".55"/><circle cx="90" cy="62" r="6" fill="#ff8a80" opacity=".55"/>'
        f'{HL(42, 30, 10, 4)}')
    if pid == "fox_luck":
        lf = s.lg("c", "#c8f7a0", "#2e8b3a")
        front = "".join(f'<circle cx="{x}" cy="{y}" r="5.5" fill="{lf}" {O("#1b5e20", 2)}/>' for x, y in [(86, 14), (96, 14), (86, 24), (96, 24)]) + f'<path d="M91 26 L88 36" {O("#1b5e20", 2.5)}/>'
    elif pid == "fox_gather":
        front = (f'<path d="M40 80 L82 104" {O("#4a2a10", 4)}/><rect x="74" y="96" width="24" height="20" rx="5" fill="{s.lg("bag", "#c98a52", "#6b3a16")}" {O("#3a1d08", 3)}/>'
                 f'<path d="M74 104 L98 104" {O("#3a1d08", 2)}/><circle cx="86" cy="104" r="3" fill="#ffca28" {O("#6b4400", 1.5)}/>'
                 f'<circle cx="80" cy="95" r="4" fill="#e53935" {O("#7f0000", 1.5)}/><circle cx="90" cy="94" r="4" fill="#8bc34a" {O("#33691e", 1.5)}/>')
    return svg128(s, body + front)

KOI = {  # body light, body dark, fin, outline, spot
  "koi_red": ("#ffffff", "#e8e8e8", "#ffcdd2", "#7a1a1a", "#e53935"),
  "koi_white": ("#ffffff", "#cfe6f7", "#e3f2fd", "#4a6a8a", None),
  "koi_gold": ("#fff6b0", "#e0a400", "#ffe082", "#7a4a00", None),
  "koi_sage": ("#e9f7f0", "#9fcfb8", "#d6f2e4", "#2f5e4a", "#3f8f6a"),
  "koi_moon": ("#7f8fd6", "#1f2a66", "#b3bff0", "#0d1440", None),
  "koi_dragon": ("#a7f0c8", "#1f8a5a", "#c8f7dc", "#0b4a2c", None),
}

def koi(pid):
    s = S(pid + "_"); c1, c2, fn, o, spot = KOI[pid]
    g = s.lg("b", c1, c2, 0, 0, 1, 1); fin = s.lg("f", fn, c2)
    pre = ""
    if pid in ("koi_gold", "koi_moon", "koi_dragon"):
        hc = {"koi_gold": "#fff3a0", "koi_moon": "#c5cae9", "koi_dragon": "#b9f6ca"}[pid]
        pre = f'<circle cx="62" cy="70" r="58" fill="{s.rg("h", hc, hc, .5, .5, .5, 0)}" opacity=".75"/>'
    body = (pre +
            f'<path d="M96 70 C110 58 122 54 124 60 C120 68 118 76 124 86 C118 90 108 84 96 78Z" fill="{fin}" {O(o, 3)}/>'
            f'<path d="M48 44 C54 30 66 28 72 40Z M54 92 C56 104 68 104 70 92Z" fill="{fin}" {O(o, 3)}/>'
            f'<path d="M10 70 C10 50 34 40 62 42 C84 44 100 58 100 72 C100 86 84 98 62 98 C34 100 10 90 10 70Z" fill="{g}" {O(o)}/>')
    if spot:
        body += f'<path d="M44 46 C54 44 64 50 62 60 C58 68 44 64 40 56Z" fill="{spot}" opacity=".9"/>'
        if pid == "koi_red": body += f'<ellipse cx="74" cy="78" rx="11" ry="8" fill="{spot}" opacity=".9"/>'
    if pid == "koi_white": body += f'<path d="M30 56 C50 48 76 50 92 62" fill="none" stroke="#81d4fa" stroke-width="5" stroke-linecap="round" opacity=".6"/>'
    if pid == "koi_gold":
        body += "".join(f'<circle cx="{x}" cy="{y}" r="6" fill="#ffd54f" {O("#a06a00", 2)}/><rect x="{x-2}" y="{y-2}" width="4" height="4" fill="#a06a00"/>' for x, y in [(56, 62), (70, 58), (68, 76), (82, 68), (54, 80)])
    else:
        body += "".join(f'<path d="M{x} {y} q5 4 0 8" fill="none" {O(o, 1.5)} opacity=".35"/>' for x, y in [(60, 64), (70, 60), (70, 72), (80, 66), (80, 78)])
    if pid == "koi_dragon":
        body += (f'<path d="M22 50 L14 30 L28 44Z M34 46 L32 24 L42 42Z" fill="#fff59d" {O("#8a6a00", 2.5)}/>'
                 f'<path d="M48 44 C52 36 58 40 62 34 C64 42 70 40 74 36 C76 44 82 44 86 42" fill="none" {O("#0b4a2c", 3)}/>'
                 f'<path d="M14 80 C2 90 4 104 0 112 M20 82 C16 94 22 104 18 116" fill="none" {O("#0b4a2c", 5)}/><path d="M14 80 C2 90 4 104 0 112 M20 82 C16 94 22 104 18 116" fill="none" stroke="#fff59d" stroke-width="2" stroke-linecap="round"/>'
                 f'<path d="M12 72 L24 74 L14 80" fill="#fff" {O("#0b4a2c", 1.5)}/>')
    else:
        body += f'<path d="M12 76 C8 84 4 88 2 94 M16 78 C14 88 12 92 12 100" fill="none" {O(o, 2)}/>'
    body += (f'<circle cx="26" cy="64" r="6" fill="#fff" {O(o, 2)}/><circle cx="25" cy="64" r="3.5" fill="{"#c62828" if pid == "koi_dragon" else "#222"}"/><circle cx="24" cy="62" r="1.2" fill="#fff"/>'
             f'<circle cx="34" cy="78" r="5" fill="#ff8a80" opacity=".5"/>{HL(40, 52, 14, 4, -8)}')
    if pid == "koi_sage":
        body += (f'<path d="M14 62 C0 50 2 36 10 30 M18 60 C10 44 16 34 24 30" fill="none" {O("#4a7a64", 6)}/><path d="M14 62 C0 50 2 36 10 30 M18 60 C10 44 16 34 24 30" fill="none" stroke="#f5f7fb" stroke-width="3" stroke-linecap="round"/>'
                 f'<circle cx="26" cy="64" r="10" fill="#fff" fill-opacity=".2" {O("#7a5a2a", 3)}/><path d="M36 62 L44 58" {O("#7a5a2a", 2.5)}/>')
    if pid == "koi_moon": body += f'<path d="M60 52 C52 54 50 64 56 68 C48 68 44 60 48 54 C50 50 56 50 60 52Z" fill="#fff59d"/>' + spark(110, 26, 6, "#fff59d")
    if pid == "koi_gold": body += spark(108, 30, 7) + spark(20, 30, 5)
    if pid == "koi_dragon": body += spark(110, 28, 7) + spark(104, 108, 5)
    return svg128(s, body)

def food(n):
    s = S(f"food_{n}_")
    if n == "rice":
        b = (f'<path d="M84 18 L118 6 M90 26 L122 16" {O("#5a3416", 7)}/><path d="M84 18 L118 6 M90 26 L122 16" stroke="#c9955c" stroke-width="3" stroke-linecap="round"/>'
             f'<path d="M20 62 C20 100 40 116 64 116 C88 116 108 100 108 62Z" fill="{s.lg("b", "#ef5350", "#8e1b1b")}" {O("#4a0a0a")}/>'
             f'<path d="M30 76 Q64 86 98 76" fill="none" {O("#ffd54f", 3)}/>'
             f'<path d="M18 62 C18 40 40 26 64 26 C88 26 110 40 110 62Z" fill="{s.rg("r", "#ffffff", "#e6e2d8", .4, .3)}" {O("#8a8070")}/>'
             + "".join(f'<ellipse cx="{x}" cy="{y}" rx="4" ry="2.5" transform="rotate({a} {x} {y})" fill="#d8d2c4"/>' for x, y, a in [(44, 46, 20), (64, 38, -30), (82, 50, 40), (56, 56, 10), (74, 56, -20)])
             + HL(44, 38, 10, 4))
    elif n == "onigiri":
        b = (f'<path d="M64 12 C80 12 116 80 112 100 C108 116 20 116 16 100 C12 80 48 12 64 12Z" fill="{s.rg("r", "#ffffff", "#e8e2d4", .4, .3)}" {O("#8a8070")}/>'
             f'<path d="M36 84 L92 84 L96 114 L32 114Z" fill="{s.lg("n", "#3a5a3a", "#0e1f12")}" {O("#071008", 3)}/>'
             f'<ellipse cx="50" cy="66" rx="3" ry="4" fill="#2a1a2a"/><ellipse cx="78" cy="66" rx="3" ry="4" fill="#2a1a2a"/>'
             f'<path d="M58 74 q6 5 12 0" fill="none" {O("#2a1a2a", 2.5)}/><circle cx="42" cy="74" r="4" fill="#ff8a80" opacity=".5"/><circle cx="86" cy="74" r="4" fill="#ff8a80" opacity=".5"/>{HL(50, 36, 8, 4, -40)}')
    elif n == "senbei":
        g = s.rg("g", "#f6d29a", "#b8752e", .4, .35)
        b = (f'<circle cx="64" cy="66" r="48" fill="{g}" {O("#5a3410")}/>'
             f'<path d="M64 18 A48 48 0 0 1 112 66 L64 66Z" fill="#3a2a1a" opacity=".15"/>'
             f'<path d="M40 30 L96 30 L96 74 L40 74Z" fill="{s.lg("n", "#2e4a2e", "#0e1f12")}" {O("#071008", 3)} transform="rotate(8 64 52)"/>'
             + "".join(f'<circle cx="{x}" cy="{y}" r="2" fill="#8a5420" opacity=".6"/>' for x, y in [(34, 90), (52, 100), (76, 98), (94, 86), (30, 70), (98, 50)])
             + HL(40, 44, 10, 5))
    elif n == "tempura":
        bat = s.rg("t", "#fff3c4", "#e0a030", .4, .35)
        b = (f'<path d="M94 30 L118 14 L114 34 L122 44Z" fill="{s.lg("tl", "#ff8a65", "#d84315")}" {O("#7a1f00", 3)}/>'
             f'<path d="M22 108 C14 86 34 60 60 46 C76 38 90 32 98 38 C104 46 96 58 82 66 C62 80 46 98 22 108Z" fill="{bat}" {O("#7a4a10")}/>'
             + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="#fff8dc" {O("#b07a2a", 1.5)}/>' for x, y, r in [(40, 84, 5), (56, 70, 6), (72, 60, 5), (86, 48, 4), (30, 98, 4), (62, 84, 4)])
             + f'<ellipse cx="88" cy="110" rx="34" ry="8" fill="#eceff1" {O("#607d8b", 3)}/>{HL(56, 58, 12, 4, -35)}')
    elif n == "naruto":
        b = (f'<path d="M64 14 L72 22 L82 16 L86 26 L98 24 L98 36 L110 38 L106 50 L116 56 L108 64 L116 72 L106 78 L110 90 L98 92 L98 104 L86 102 L82 112 L72 106 L64 114 L56 106 L46 112 L42 102 L30 104 L30 92 L18 90 L22 78 L12 72 L20 64 L12 56 L22 50 L18 38 L30 36 L30 24 L42 26 L46 16 L56 22Z" fill="{s.rg("w", "#ffffff", "#ece6f0", .4, .35)}" {O("#8a7a90")}/>'
             f'<path d="M64 64 C64 58 72 58 72 64 C72 74 56 76 54 64 C52 50 76 46 80 62 C84 80 52 86 46 66 C40 46 66 34 84 46" fill="none" stroke="#ec407a" stroke-width="6" stroke-linecap="round"/>'
             + HL(42, 36, 10, 5))
    else:  # inari
        b = (f'<path d="M14 70 C14 46 34 34 64 34 C94 34 114 46 114 70 C114 96 94 108 64 108 C34 108 14 96 14 70Z" fill="{s.rg("a", "#f7c46c", "#b0661e", .4, .35)}" {O("#5a2e08")}/>'
             f'<path d="M24 52 C40 30 88 30 104 52 C88 46 40 46 24 52Z" fill="{s.rg("r", "#ffffff", "#e6e0d4", .5, .3)}" {O("#8a8070", 2.5)}/>'
             + "".join(f'<path d="M{x} {y} q6 -3 12 0" fill="none" {O("#8a4a14", 2)} opacity=".5"/>' for x, y in [(34, 72), (56, 84), (78, 74), (46, 94), (70, 96), (88, 88)])
             + f'<circle cx="58" cy="44" r="2.5" fill="#212121"/><circle cx="72" cy="42" r="2.5" fill="#212121"/>{HL(36, 64, 10, 5)}')
    return svg128(s, b)

def skin(n):
    s = S(f"skin_{n}_")
    if n == "kimono":
        b = (f'<path d="M38 86 C36 96 36 108 40 116 L84 116 C88 108 88 96 86 86 C76 82 48 82 38 86Z" fill="{s.lg("k", "#9575cd", "#4527a0")}" {O("#1e0f4a", 3)}/>'
             f'<path d="M48 84 L62 100 L76 84" fill="none" {O("#ffffff", 4)}/>'
             f'<rect x="38" y="98" width="48" height="8" rx="3" fill="{s.lg("o", "#ffd54f", "#c88a00")}" {O("#6b4400", 2.5)}/>'
             + "".join(f'<circle cx="{x}" cy="{y}" r="2.5" fill="#f8bbd0"/>' for x, y in [(44, 92), (80, 92), (48, 112), (76, 112)]))
    elif n == "scarf":
        r = s.lg("s", "#ff8a80", "#c62828")
        b = (f'<path d="M80 86 L92 112 L80 114 L72 90Z" fill="{r}" {O("#6d0f0f", 3)}/>'
             f'<path d="M30 76 C44 90 80 90 94 76 L96 86 C80 98 44 98 28 86Z" fill="{r}" {O("#6d0f0f", 3)}/>'
             + "".join(f'<path d="M{x} 85 L{x+2} 93" {O("#ffffff", 2.5)} opacity=".7"/>' for x in (40, 52, 64, 76)))
    elif n == "bow":
        r = s.rg("b", "#ff9ecb", "#d81b60", .4, .35)
        b = (f'<path d="M84 18 C76 4 58 10 66 24 C58 22 56 36 66 34 C72 34 76 28 80 26 C84 30 94 38 100 30 C108 20 96 12 84 18Z" fill="{r}" {O("#880e4f", 3)}/>'
             f'<path d="M80 26 C70 14 60 10 56 18 C52 28 64 34 80 26Z M80 26 C92 14 104 14 106 24 C108 34 94 36 80 26Z" fill="{r}" {O("#880e4f", 3)}/>'
             f'<circle cx="80" cy="26" r="6" fill="{r}" {O("#880e4f", 3)}/>{HL(64, 18, 4, 2)}')
    elif n == "flowers":
        b = (f'<path d="M26 30 C40 12 84 12 98 30" fill="none" {O("#558b2f", 6)}/>'
             + "".join(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="4" transform="rotate({a} {x} {y})" fill="{s.lg("l" + str(i), "#c5e1a5", "#558b2f")}" {O("#33691e", 2)}/>'
                       for i, (x, y, a) in enumerate([(30, 25, -40), (48, 15, -15), (78, 15, 15), (96, 25, 40)]))
             + flower(s, "a", 39, 20, 8, "#ffffff", "#ff8fbb", "#a3305c") + flower(s, "b", 62, 12, 9, "#fff9c4", "#ffb300", "#a36a00", center="#ff7043", notch=False)
             + flower(s, "c", 86, 20, 8, "#ffffff", "#ff8fbb", "#a3305c", rot=30))
    elif n == "maple":
        leaf = "M0 -14 L4 -5 L13 -9 L10 0 L16 3 L7 6 L9 14 L1 10 L0 16 L-1 10 L-9 14 L-7 6 L-16 3 L-10 0 L-13 -9 L-4 -5Z"
        cols = [("#ffcc80", "#e65100"), ("#ff8a65", "#c62828"), ("#ffe082", "#f57f17")]
        b = (f'<path d="M30 76 C44 90 80 90 94 76 L96 86 C80 98 44 98 28 86Z" fill="{s.lg("s", "#ffb74d", "#e65100")}" {O("#7a2800", 3)}/>'
             + "".join(f'<path d="{leaf}" transform="translate({x} {y}) rotate({a}) scale({sc})" fill="{s.lg("m" + str(i), *cols[i % 3])}" {O("#6d1a00", 2)}/>'
                       for i, (x, y, a, sc) in enumerate([(84, 20, 20, 1.1), (98, 30, -15, .8), (72, 14, -30, .7)])))
    else:  # snow
        hat = s.lg("h", "#ffffff", "#cfe3f5")
        b = (f'<path d="M30 32 C34 10 90 10 94 32Z" fill="{s.lg("c", "#64b5f6", "#1565c0")}" {O("#0d3c7a", 3)}/>'
             f'<path d="M26 34 C40 26 84 26 98 34 L98 40 C84 34 40 34 26 40Z" fill="{hat}" {O("#5a7aa0", 3)}/>'
             f'<circle cx="62" cy="10" r="8" fill="{hat}" {O("#5a7aa0", 3)}/>'
             f'<path d="M30 76 C44 90 80 90 94 76 L96 86 C80 98 44 98 28 86Z" fill="{s.lg("s", "#90caf9", "#1976d2")}" {O("#0d3c7a", 3)}/>'
             + "".join(f'<g transform="translate({x} {y})" {O("#ffffff", 2)}><path d="M-5 0 L5 0 M0 -5 L0 5 M-3.5 -3.5 L3.5 3.5 M-3.5 3.5 L3.5 -3.5"/></g>' for x, y in [(44, 88), (64, 91), (84, 86), (14, 50), (110, 60)]))
    return svg128(s, b)

PETS = list(FOX) + list(KOI)
FOODS = ["rice", "senbei", "onigiri", "tempura", "naruto", "inari"]
SKINS = ["scarf", "bow", "flowers", "kimono", "maple", "snow"]

def main():
    for d in ("pets", "food", "skins"):
        os.makedirs(os.path.join(ART, d), exist_ok=True)
        for f in os.listdir(os.path.join(ART, d)):  # прибрати застарілі id
            if f.endswith(".svg") and f[:-4] not in {"pets": PETS, "food": FOODS, "skins": SKINS}[d]: os.remove(os.path.join(ART, d, f))
    for p in PETS: open(os.path.join(ART, "pets", f"{p}.svg"), "w", encoding="utf-8").write(chibi_fox(p) if p.startswith("fox") else koi(p))
    for f in FOODS: open(os.path.join(ART, "food", f"{f}.svg"), "w", encoding="utf-8").write(food(f))
    for k in SKINS: open(os.path.join(ART, "skins", f"{k}.svg"), "w", encoding="utf-8").write(skin(k))
    rd = lambda rel: open(os.path.join(ART, rel), encoding="utf-8").read()
    cell = lambda rel, cap: f'<figure><div class="im">{rd(rel)}</div><figcaption>{cap}</figcaption></figure>'
    h = ""
    for th in THEMES:
        h += f"<h2>{th}</h2><div class='g'>" + "".join(cell(f"{th}/{i}.svg", i) for i in range(1, 11)) + "</div>"
    h += "<h2>40px</h2><div class='small'>" + "".join(f"<div class='im'>{rd(f'{th}/{i}.svg')}</div>" for th in THEMES for i in range(1, 11)) + "</div>"
    h += "<h2>pets</h2><div class='g'>" + "".join(cell(f"pets/{p}.svg", p) for p in PETS) + "</div>"
    h += "<h2>pets + skins</h2><div class='g'>" + "".join(f"<figure><div class='im stack'>{rd('pets/fox_gather.svg')}{rd(f'skins/{k}.svg')}</div><figcaption>{k}</figcaption></figure>" for k in SKINS) + "</div>"
    h += "<h2>food</h2><div class='g'>" + "".join(cell(f"food/{f}.svg", f) for f in FOODS) + "</div>"
    h += "<h2>ui</h2><div class='g'>" + "".join(cell(f"ui/{n}.svg", n) for n in ("coin", "gem", "energy", "chest")) + "</div>"
    h += f"<h2>Hoshi</h2><div class='row'><div class='tall'>{rd('hoshi.svg')}</div><div class='tall'>{rd('hoshi_talk.svg')}</div></div>"
    h += "<h2>backgrounds</h2><div class='row'>" + "".join(f"<div class='bg'>{rd(f'bg/{t}.svg')}</div>" for t in THEMES) + "</div>"
    css = ("body{background:#2a1b3d;color:#fff;font-family:sans-serif;padding:12px}.g{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;max-width:720px}"
           "figure{margin:0;background:#3b2756;border-radius:10px;padding:6px;text-align:center;font-size:11px}.im svg{width:100%;height:auto;display:block}"
           ".stack{position:relative}.stack svg+svg{position:absolute;inset:0}"
           ".small{display:flex;flex-wrap:wrap;gap:4px;max-width:720px}.small .im{width:40px;height:40px;background:#3b2756;border-radius:6px}"
           ".row{display:flex;gap:8px;flex-wrap:wrap}.tall{width:220px;background:#3b2756;border-radius:10px}.tall svg,.bg svg{width:100%;height:auto;display:block}.bg{width:140px;border-radius:8px;overflow:hidden}")
    open(os.path.join(ART, "_preview.html"), "w", encoding="utf-8").write(f"<!doctype html><meta charset='utf-8'><title>Sprites preview</title><style>{css}</style>{h}")
    print("ok pets", len(PETS), "food", len(FOODS), "skins", len(SKINS))

if __name__ == "__main__":
    main()
