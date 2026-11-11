"""Генератор SVG-спрайтів Kitsune Merge (векторний арт без зовнішніх API).
python make_sprites.py  -> art/<theme>/<n>.svg, art/hoshi*.svg, art/bg/*.svg, art/ui/*.svg, art/_preview.html
"""
import math, os

ART = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class S:
    """Контекст одного файлу: унікальний префікс id, накопичення defs."""
    def __init__(s, p): s.p, s.defs = p, []
    def lg(s, n, c1, c2, x1=0, y1=0, x2=0, y2=1, mid=None):
        i = f"{s.p}{n}"
        stops = f'<stop offset="0" stop-color="{c1}"/>' + (f'<stop offset=".5" stop-color="{mid}"/>' if mid else '') + f'<stop offset="1" stop-color="{c2}"/>'
        s.defs.append(f'<linearGradient id="{i}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{stops}</linearGradient>')
        return f"url(#{i})"
    def rg(s, n, c1, c2, cx=.35, cy=.3, r=.8, o2=1):
        i = f"{s.p}{n}"
        s.defs.append(f'<radialGradient id="{i}" cx="{cx}" cy="{cy}" r="{r}"><stop offset="0" stop-color="{c1}"/><stop offset="1" stop-color="{c2}" stop-opacity="{o2}"/></radialGradient>')
        return f"url(#{i})"
    def raw(s, d): s.defs.append(d)

def O(c, w=4):
    return f'stroke="{c}" stroke-width="{w}" stroke-linejoin="round" stroke-linecap="round"'

def HL(x, y, rx, ry, rot=-30, op=.55):
    return f'<ellipse cx="{x}" cy="{y}" rx="{rx}" ry="{ry}" transform="rotate({rot} {x} {y})" fill="#fff" opacity="{op}"/>'

def spark(x, y, r, c="#fff"):
    return (f'<path d="M{x} {y-r} Q{x+r*.18} {y-r*.18} {x+r} {y} Q{x+r*.18} {y+r*.18} {x} {y+r} '
            f'Q{x-r*.18} {y+r*.18} {x-r} {y} Q{x-r*.18} {y-r*.18} {x} {y-r}Z" fill="{c}"/>')

def flower(s, n, cx, cy, r, c1, c2, out, center="#ffd54a", petals=5, notch=True, rot=0):
    g = s.rg(n, c1, c2, .5, .8, .9)
    out_s = ""
    for k in range(petals):
        a = rot + k * 360 / petals
        px, py = cx, cy - r * .52
        if notch:
            d = (f"M{cx} {cy} C{cx-r*.55} {cy-r*.35} {cx-r*.5} {cy-r*.95} {cx-r*.16} {cy-r*1.02} "
                 f"L{cx} {cy-r*.86} L{cx+r*.16} {cy-r*1.02} C{cx+r*.5} {cy-r*.95} {cx+r*.55} {cy-r*.35} {cx} {cy}Z")
        else:
            d = (f"M{cx} {cy} C{cx-r*.62} {cy-r*.3} {cx-r*.56} {cy-r*1.05} {cx} {cy-r*1.05} "
                 f"C{cx+r*.56} {cy-r*1.05} {cx+r*.62} {cy-r*.3} {cx} {cy}Z")
        out_s += f'<path d="{d}" fill="{g}" {O(out, 3)} transform="rotate({a} {cx} {cy})"/>'
    out_s += f'<circle cx="{cx}" cy="{cy}" r="{r*.2}" fill="{center}" {O(out, 2.5)}/>'
    for k in range(petals):
        a = math.radians(rot + k * 360 / petals - 90)
        out_s += f'<circle cx="{cx+math.cos(a)*r*.32:.1f}" cy="{cy+math.sin(a)*r*.32:.1f}" r="{r*.05:.1f}" fill="#c2185b"/>'
    return out_s

GLOW = {5: ("#ffe9a8", .35), 6: ("#ffe08a", .45), 7: ("#fff1b8", .55), 8: ("#e6f3ff", .6), 9: ("#c8f4ff", .7), 10: ("#fff3a0", .85)}

def item(s, tier, body, glow=None):
    pre = ""
    if tier >= 5:
        c, op = GLOW[tier]
        if glow: c = glow
        g = s.rg("halo", c, c, .5, .5, .5, 0)
        pre += f'<circle cx="64" cy="64" r="62" fill="{g}" opacity="{op}"/>'
    if tier >= 8:
        for k in range(12):
            a = k * 30
            pre += f'<path d="M64 64 L{64+60*math.cos(math.radians(a-5)):.1f} {64+60*math.sin(math.radians(a-5)):.1f} L{64+60*math.cos(math.radians(a+5)):.1f} {64+60*math.sin(math.radians(a+5)):.1f}Z" fill="#fff" opacity=".12"/>'
    post = ""
    if tier >= 7:
        pts = [(18, 24, 7), (110, 20, 6), (112, 100, 5), (16, 96, 5)][: tier - 5]
        for x, y, r in pts: post += spark(x, y, r)
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>{"".join(s.defs)}</defs>{pre}{body}{post}</svg>'

# ---------------------------------------------------------------- KITSUNE
def k1(s):
    g = s.lg("g", "#9be86a", "#2e8b3a")
    leaf = "M64 12 L73 38 L98 28 L90 53 L116 60 L93 72 L101 96 L74 87 L67 110 L61 110 L54 87 L27 96 L35 72 L12 60 L38 53 L30 28 L55 38Z"
    return (f'<path d="{leaf}" fill="{g}" {O("#1f5d27")}/>'
            f'<path d="M64 112 L64 40 M64 74 L40 56 M64 74 L88 56 M64 90 L44 84 M64 90 L84 84" fill="none" {O("#1f5d27", 3)} opacity=".7"/>'
            f'{HL(48, 42, 10, 5)}'
            f'<path d="M86 84 C86 76 94 70 94 70 C94 70 102 76 102 84 A8 8 0 0 1 86 84Z" fill="{s.rg("d", "#ffffff", "#7fd3ff")}" {O("#2a7bb0", 2.5)}/>')

def k2(s):
    return (f'<path d="M14 112 C40 96 60 80 76 50 C84 36 96 26 110 20 M58 84 C72 82 84 86 96 96" fill="none" {O("#4a2b1a", 9)}/>'
            f'<path d="M14 112 C40 96 60 80 76 50 C84 36 96 26 110 20 M58 84 C72 82 84 86 96 96" fill="none" stroke="#8a5a3a" stroke-width="4" stroke-linecap="round"/>'
            + flower(s, "a", 42, 70, 20, "#ffffff", "#ff9ec4", "#b8486f")
            + flower(s, "b", 84, 40, 22, "#ffffff", "#ff8fbb", "#b8486f", rot=20)
            + flower(s, "c", 96, 92, 15, "#ffffff", "#ffb3cf", "#b8486f", rot=10))

def k3(s):
    a = s.rg("a", "#ffe0ec", "#f48fb1"); b = s.rg("b", "#ffffff", "#e8e0d0"); c = s.rg("c", "#d7f5b0", "#7cc35a")
    return (f'<path d="M30 118 L100 14" fill="none" {O("#6b4423", 8)}/><path d="M30 118 L100 14" stroke="#c9955c" stroke-width="4" stroke-linecap="round"/>'
            f'<circle cx="82" cy="40" r="20" fill="{a}" {O("#b0476f")}/>{HL(76, 33, 7, 4)}'
            f'<circle cx="64" cy="66" r="20" fill="{b}" {O("#8a7a66")}/>{HL(58, 59, 7, 4)}'
            f'<circle cx="46" cy="92" r="20" fill="{c}" {O("#3f7a2d")}/>{HL(40, 85, 7, 4)}'
            f'<path d="M76 28 q6 -6 12 0" fill="none" {O("#b0476f", 2)}/>')

def k4(s):
    red = s.rg("r", "#ff8a65", "#c62828", .4, .35, .75); gold = s.lg("g", "#ffe082", "#c88a12")
    return (f'<path d="M64 6 L64 18" {O("#5d3a1a", 4)}/>'
            f'<rect x="44" y="16" width="40" height="12" rx="4" fill="{gold}" {O("#7a4f0a")}/>'
            f'<ellipse cx="64" cy="64" rx="38" ry="38" fill="{red}" {O("#7f1212")}/>'
            f'<ellipse cx="64" cy="64" rx="24" ry="38" fill="none" {O("#7f1212", 2.5)} opacity=".55"/>'
            f'<ellipse cx="64" cy="64" rx="9" ry="38" fill="none" {O("#7f1212", 2.5)} opacity=".55"/>'
            f'<path d="M28 52 Q64 46 100 52 M27 76 Q64 82 101 76" fill="none" {O("#7f1212", 2.5)} opacity=".55"/>'
            f'<ellipse cx="64" cy="64" rx="16" ry="20" fill="#ffd54f" opacity=".35"/>'
            f'{HL(46, 44, 10, 6)}'
            f'<rect x="44" y="98" width="40" height="12" rx="4" fill="{gold}" {O("#7a4f0a")}/>'
            f'<path d="M64 110 L64 118" {O("#c88a12", 4)}/><path d="M58 116 L70 116 L68 126 L60 126Z" fill="#ffca28" {O("#7a4f0a", 2.5)}/>')

def k5(s):
    gold = s.lg("g", "#fff3b0", "#d18f0f", mid="#ffcf40")
    return (f'<path d="M64 4 L64 18" {O("#8e1b1b", 6)}/><path d="M50 4 Q64 12 78 4" fill="none" {O("#c62828", 5)}/>'
            f'<circle cx="64" cy="20" r="7" fill="none" {O("#8a5a00", 5)}/>'
            f'<path d="M64 24 C42 24 36 44 36 64 C36 82 28 90 22 96 L106 96 C100 90 92 82 92 64 C92 44 86 24 64 24Z" fill="{gold}" {O("#7a4a00")}/>'
            f'<path d="M30 86 Q64 94 98 86" fill="none" {O("#a86b00", 3)}/>'
            f'<rect x="20" y="94" width="88" height="10" rx="5" fill="{gold}" {O("#7a4a00")}/>'
            f'<circle cx="64" cy="112" r="9" fill="{gold}" {O("#7a4a00")}/>'
            f'{HL(50, 44, 7, 16, 20, .6)}')

def k6(s):
    red = s.lg("r", "#ff6e50", "#b71c1c", 0, 0, 1, 0); blk = s.lg("b", "#5a3a4a", "#1d1020")
    moss = s.rg("m", "#b6f07a", "#3f8f2f")
    return (f'<rect x="32" y="40" width="13" height="76" rx="3" fill="{red}" {O("#6d0f0f")}/>'
            f'<rect x="83" y="40" width="13" height="76" rx="3" fill="{red}" {O("#6d0f0f")}/>'
            f'<rect x="20" y="58" width="88" height="10" rx="3" fill="{red}" {O("#6d0f0f")}/>'
            f'<rect x="58" y="44" width="12" height="16" rx="2" fill="#ffd54f" {O("#6d0f0f", 3)}/>'
            f'<rect x="22" y="36" width="84" height="10" rx="3" fill="{red}" {O("#6d0f0f")}/>'
            f'<path d="M8 26 Q64 14 120 26 L116 38 Q64 28 12 38Z" fill="{blk}" {O("#140810")}/>'
            f'<ellipse cx="38" cy="116" rx="16" ry="7" fill="{moss}" {O("#2b5e20", 3)}/>'
            f'<ellipse cx="90" cy="116" rx="16" ry="7" fill="{moss}" {O("#2b5e20", 3)}/>'
            f'{HL(36, 54, 2, 10, 0, .4)}{HL(87, 54, 2, 10, 0, .4)}')

def fox(s, x=0, y=0, sc=1):
    w = s.rg("w", "#ffffff", "#cfd8e6", .4, .3, .8); o = s.lg("o", "#ffb74d", "#f4511e")
    return (f'<g transform="translate({x} {y}) scale({sc})">'
            f'<path d="M80 100 C116 100 120 64 104 46 C98 40 90 44 96 54 C104 70 96 86 78 88Z" fill="{w}" {O("#5b6b85")}/>'
            f'<path d="M104 46 C98 40 90 44 96 54 C98 58 100 62 100 66 C108 60 110 52 104 46Z" fill="{o}" {O("#5b6b85", 3)}/>'
            f'<path d="M36 112 C30 90 38 70 56 66 C76 64 86 84 82 112Z" fill="{w}" {O("#5b6b85")}/>'
            f'<path d="M50 112 L50 98 M68 112 L68 98" {O("#5b6b85", 3)}/>'
            f'<path d="M36 30 L42 6 L56 26Z M80 30 L76 6 L62 26Z" fill="{w}" {O("#5b6b85")}/>'
            f'<path d="M41 24 L43 12 L50 24Z M76 24 L75 12 L68 24Z" fill="{o}"/>'
            f'<path d="M30 46 C30 28 44 20 59 20 C74 20 88 28 88 46 C88 60 74 70 59 72 C44 70 30 60 30 46Z" fill="{w}" {O("#5b6b85")}/>'
            f'<path d="M42 44 q6 -5 12 0 M64 44 q6 -5 12 0" fill="none" {O("#3a2a3a", 3)}/>'
            f'<path d="M36 38 L44 40 M82 38 L74 40" {O("#e53935", 3)}/>'
            f'<circle cx="59" cy="58" r="4" fill="#3a2a3a"/><path d="M53 62 q6 5 12 0" fill="none" {O("#3a2a3a", 2.5)}/>'
            f'<circle cx="40" cy="54" r="5" fill="#ff8a80" opacity=".6"/><circle cx="78" cy="54" r="5" fill="#ff8a80" opacity=".6"/>'
            f'{HL(46, 30, 8, 4)}</g>')

def k7(s): return fox(s)

def k8(s):
    m = s.rg("m", "#fffbe6", "#f2c94c", .4, .35, .8)
    return (f'<circle cx="64" cy="62" r="46" fill="{m}" {O("#b07a10")}/>'
            f'<circle cx="44" cy="44" r="7" fill="#e0b040" opacity=".35"/><circle cx="86" cy="52" r="5" fill="#e0b040" opacity=".35"/><circle cx="76" cy="86" r="8" fill="#e0b040" opacity=".3"/>'
            f'<path d="M44 104 C40 88 46 76 56 72 L54 60 L62 68 L70 60 L70 72 C80 76 86 88 82 104 C92 102 100 92 96 80 C104 88 102 104 86 108Z" fill="#4a2d6b" opacity=".9"/>'
            f'{HL(42, 34, 14, 7)}')

def k9(s):
    j = s.rg("j", "#ffffff", "#2f7fe0", .45, .4, .8); f = s.lg("f", "#ffffff", "#7fe7ff")
    return (f'<path d="M64 8 C64 8 102 50 102 80 A38 38 0 0 1 26 80 C26 50 64 8 64 8Z" fill="{j}" {O("#123a8a")}/>'
            f'<path d="M64 40 C54 56 44 68 46 84 C48 100 80 102 82 84 C84 72 74 66 76 54 C68 62 68 72 62 76 C58 64 64 52 64 40Z" fill="{s.rg("fl", "#ffffff", "#40c4ff", .5, .7, .7)}" {O("#0277bd", 2.5)}/>'
            f'<ellipse cx="64" cy="82" rx="8" ry="10" fill="#fff"/>{spark(64, 64, 6)}'
            f'<path d="M40 78 Q64 60 88 78" fill="none" stroke="#fff" stroke-width="2" opacity=".5"/>'
            f'{HL(48, 52, 6, 14, 30, .7)}'
            f'<path d="M40 104 Q64 124 88 104 L84 116 Q64 128 44 116Z" fill="{s.lg("g", "#ffe082", "#b07a10")}" {O("#6b4400", 3)}/>'
            f'<circle cx="64" cy="120" r="4" fill="#e53935" {O("#7f0000", 1.5)}/>')

def k10(s):
    g = s.lg("g", "#fff6b0", "#c27c00", mid="#ffcc33"); o = s.lg("o", "#ffcc80", "#ff6d00")
    tails = "".join(f'<path d="M{x} 44 C{x-10} 30 {x+4} 18 {x+10} 10 C{x+6} 22 {x+16} 30 {x+8} 44Z" fill="{o}" {O("#a33d00", 2.5)}/>' for x in (24, 46, 66, 86))
    return (tails +
            f'<path d="M16 50 L38 74 L64 38 L90 74 L112 50 L102 104 L26 104Z" fill="{g}" {O("#7a4a00")}/>'
            f'<rect x="24" y="96" width="80" height="16" rx="5" fill="{g}" {O("#7a4a00")}/>'
            f'<circle cx="16" cy="48" r="6" fill="{g}" {O("#7a4a00", 3)}/><circle cx="64" cy="36" r="7" fill="{g}" {O("#7a4a00", 3)}/><circle cx="112" cy="48" r="6" fill="{g}" {O("#7a4a00", 3)}/>'
            f'<circle cx="64" cy="76" r="9" fill="#e53935" {O("#7f0000", 3)}/><circle cx="40" cy="84" r="6" fill="#29b6f6" {O("#01579b", 3)}/><circle cx="88" cy="84" r="6" fill="#66bb6a" {O("#1b5e20", 3)}/>'
            f'{HL(61, 72, 3, 2)}{HL(36, 64, 4, 10, 30, .5)}')

# ---------------------------------------------------------------- SAKURA
def s1(s):
    soil = s.rg("s", "#a1785a", "#5d3b25", .5, .2); l = s.lg("l", "#c5f59a", "#4caf50")
    return (f'<ellipse cx="64" cy="102" rx="40" ry="16" fill="{soil}" {O("#3b2416")}/>'
            f'<path d="M64 98 C64 80 62 66 64 54" fill="none" {O("#2e7d32", 6)}/>'
            f'<path d="M64 60 C50 64 34 56 30 40 C46 36 60 44 64 60Z" fill="{l}" {O("#2e7d32")}/>'
            f'<path d="M64 56 C76 58 92 48 96 30 C80 28 66 38 64 56Z" fill="{l}" {O("#2e7d32")}/>'
            f'{HL(42, 44, 6, 3)}{HL(82, 36, 6, 3)}')

def s2(s):
    l = s.lg("l", "#b9f6a0", "#388e3c")
    leaves = ""
    for (x, y, a) in [(52, 92, -50), (78, 78, 40), (50, 62, -40), (78, 50, 45), (60, 30, -10)]:
        leaves += f'<ellipse cx="{x}" cy="{y}" rx="12" ry="22" transform="rotate({a} {x} {y})" fill="{l}" {O("#1b5e20")}/>'
    return f'<path d="M62 120 C60 90 66 60 62 22" fill="none" {O("#1b5e20", 6)}/>' + leaves + HL(50, 26, 4, 8, -10)

def s3(s):
    p = s.lg("p", "#ffd1e3", "#e91e63"); l = s.lg("l", "#b9f6a0", "#388e3c")
    return (f'<path d="M64 120 L64 76" {O("#2e7d32", 6)}/>'
            f'<path d="M64 110 C44 104 34 86 36 70 C52 76 62 90 64 110Z" fill="{l}" {O("#1b5e20")}/>'
            f'<path d="M40 30 L52 48 L64 24 L76 48 L88 30 C94 64 82 82 64 82 C46 82 34 64 40 30Z" fill="{p}" {O("#8e1546")}/>'
            f'<path d="M64 24 L64 80" fill="none" {O("#8e1546", 2)} opacity=".4"/>{HL(50, 46, 4, 10, 10)}')

def s4(s): return flower(s, "f", 64, 64, 54, "#ffffff", "#ff7fae", "#a3305c") + HL(46, 30, 8, 4)

def s5(s):
    return (flower(s, "f", 64, 66, 54, "#ff8a80", "#c2185b", "#6d0a2c", center="#ffeb3b", notch=False)
            + f'<path d="M64 66 C70 50 76 40 84 30" fill="none" {O("#ffeb3b", 4)}/>'
            + "".join(f'<circle cx="{x}" cy="{y}" r="3.5" fill="#ffeb3b" {O("#b28704", 1.5)}/>' for x, y in [(84, 28), (90, 32), (80, 24)]))

def s6(s):
    paper = s.lg("w", "#fff7e6", "#e8c9a0"); rib = s.lg("r", "#ff8fb8", "#d81b60")
    return (f'<path d="M30 50 L98 50 L70 122 L58 122Z" fill="{paper}" {O("#8a6a45")}/>'
            + flower(s, "a", 44, 44, 18, "#ffffff", "#ff80ab", "#a3305c")
            + flower(s, "b", 84, 44, 18, "#fff9c4", "#ffb300", "#a36a00", center="#ff7043", notch=False)
            + flower(s, "c", 64, 28, 20, "#f8bbd0", "#c2185b", "#6d0a2c", notch=False)
            + f'<path d="M64 92 C48 80 40 98 52 100 C58 100 62 96 64 92 C66 96 70 100 76 100 C88 98 80 80 64 92Z" fill="{rib}" {O("#880e4f", 3)}/>'
            f'<path d="M62 94 L54 116 M66 94 L74 116" {O("#d81b60", 4)}/>')

def s7(s):
    b = s.lg("b", "#a5e887", "#2e7d32", 0, 0, 1, 0)
    stalk = lambda x: (f'<rect x="{x}" y="10" width="14" height="110" rx="6" fill="{b}" {O("#1b5e20")}/>'
                       + "".join(f'<path d="M{x} {y} L{x+14} {y}" {O("#1b5e20", 3)}/>' for y in (40, 72, 100)))
    papers = "".join(f'<rect x="{x}" y="{y}" width="10" height="22" rx="2" fill="{c}" {O("#5d4037", 2.5)} transform="rotate({a} {x+5} {y})"/>'
                     for x, y, c, a in [(22, 46, "#ff8a80", 8), (86, 36, "#80d8ff", -6), (96, 70, "#ffe57f", 10), (14, 78, "#b388ff", -8)])
    return (stalk(44) + stalk(68)
            + f'<path d="M58 40 C70 30 86 28 100 30 C88 36 74 40 58 40Z M58 72 C44 62 30 60 16 62 C28 68 44 72 58 72Z" fill="{b}" {O("#1b5e20", 3)}/>'
            + papers)

def doll(s, n, x, robe1, robe2, crown):
    r = s.lg(n, robe1, robe2)
    return (f'<path d="M{x} 50 L{x+28} 116 L{x-28} 116Z" fill="{r}" {O("#3e1f3a")} />'
            f'<path d="M{x-14} 82 L{x+14} 82" {O("#ffd54f", 4)}/>'
            f'<circle cx="{x}" cy="40" r="17" fill="#fff8f0" {O("#5d4037", 3)}/>'
            f'<path d="M{x-17} 40 C{x-18} 24 {x+18} 24 {x+17} 40 C{x+10} 30 {x-10} 30 {x-17} 40Z" fill="#2b1d2e"/>'
            f'<path d="M{x-6} 42 q2 -2 4 0 M{x+2} 42 q2 -2 4 0" fill="none" {O("#2b1d2e", 2)}/>'
            f'<circle cx="{x}" cy="49" r="2" fill="#e53935"/>'
            + (f'<path d="M{x-8} 22 L{x} 6 L{x+8} 22Z" fill="#2b1d2e"/>' if crown else
               f'<path d="M{x-12} 26 L{x-6} 18 L{x} 24 L{x+6} 18 L{x+12} 26Z" fill="#ffd54f" {O("#8a5a00", 2)}/>'))

def s8(s): return doll(s, "a", 40, "#9575cd", "#4527a0", True) + doll(s, "b", 88, "#ff8a80", "#c62828", False)

def s9(s):
    roof = s.lg("r", "#ff8fb8", "#ad1457"); wall = s.lg("w", "#ffffff", "#f0d9e2")
    out = f'<rect x="54" y="4" width="20" height="10" fill="#ffd54f" {O("#8a5a00", 2)}/><path d="M64 0 L64 8" {O("#8a5a00", 3)}/>'
    for i, (y, w) in enumerate([(16, 34), (46, 46), (78, 58)]):
        out += (f'<rect x="{64-w/2+6}" y="{y+10}" width="{w-12}" height="22" fill="{wall}" {O("#7a3a55", 3)}/>'
                f'<rect x="{60}" y="{y+16}" width="8" height="16" fill="#7a3a55"/>'
                f'<path d="M{64-w/2-12} {y+14} Q{64-w/2} {y+10} {64-w/2+6} {y} L{64+w/2-6} {y} Q{64+w/2} {y+10} {64+w/2+12} {y+14}Z" fill="{roof}" {O("#6d0a3a")}/>')
    out += f'<rect x="20" y="110" width="88" height="10" rx="3" fill="#cfa98a" {O("#6d4c41", 3)}/>'
    return out

def s10(s):
    sun = s.rg("s", "#fff3b0", "#ff7043", .5, .5, .6); mt = s.lg("m", "#7aa7e8", "#2b4c8c"); sn = s.lg("n", "#ffffff", "#dfe9ff")
    return (f'<circle cx="64" cy="54" r="36" fill="{sun}"/>'
            f'<path d="M6 112 L50 40 C56 32 72 32 78 40 L122 112Z" fill="{mt}" {O("#1a2f5c")}/>'
            f'<path d="M38 60 L50 40 C56 32 72 32 78 40 L90 60 L80 56 L72 64 L64 54 L56 64 L48 56Z" fill="{sn}" {O("#1a2f5c", 3)}/>'
            + flower(s, "a", 20, 36, 10, "#fff", "#ff8fbb", "#a3305c") + flower(s, "b", 108, 30, 9, "#fff", "#ff8fbb", "#a3305c", rot=30)
            + flower(s, "c", 100, 96, 8, "#fff", "#ff8fbb", "#a3305c", rot=15))

# ---------------------------------------------------------------- OCEAN
def drop(s, n, x, y, sc, c1, c2, out):
    g = s.rg(n, c1, c2, .4, .45, .8)
    return f'<path transform="translate({x} {y}) scale({sc})" d="M0 -46 C0 -46 34 -8 34 16 A34 34 0 0 1 -34 16 C-34 -8 0 -46 0 -46Z" fill="{g}" {O(out, 4/sc)}/>'

def o1(s): return drop(s, "d", 64, 66, 1.2, "#e3f8ff", "#1e88e5", "#0d3c7a") + HL(52, 74, 6, 14, 20, .7)

def o2(s):
    g = s.lg("g", "#ffe3d0", "#f48a6a")
    ribs = "".join(f'<path d="M64 108 L{64+52*math.cos(math.radians(a)):.1f} {96-62*math.sin(math.radians(a)):.1f}" {O("#b5523a", 2.5)} opacity=".6"/>' for a in range(30, 160, 20))
    return (f'<path d="M64 110 L14 66 C14 30 40 14 64 14 C88 14 114 30 114 66Z" fill="{g}" {O("#8a3a24")}/>' + ribs
            + f'<path d="M48 108 L44 120 L84 120 L80 108Z" fill="{g}" {O("#8a3a24")}/>{HL(44, 36, 8, 5)}')

def o3(s):
    g = s.lg("g", "#ffccbc", "#ff5722")
    seg = "".join(f'<path d="M{x} {y} q8 6 0 14" fill="none" {O("#a83a12", 2.5)} opacity=".6"/>' for x, y in [(72, 34), (84, 50), (86, 70), (78, 88)])
    return (f'<path d="M30 30 C60 14 104 30 100 70 C98 96 72 110 50 104 C44 98 52 92 60 92 C78 90 86 74 82 60 C78 44 58 40 40 46Z" fill="{g}" {O("#8a2a08")}/>'
            f'<path d="M50 104 L28 96 L34 112 L24 120 L46 116Z" fill="{g}" {O("#8a2a08", 3)}/>'
            f'<path d="M34 34 C20 26 12 14 8 6 M38 36 C30 22 30 12 32 4" fill="none" {O("#8a2a08", 2.5)}/>'
            f'<circle cx="44" cy="38" r="5" fill="#222"/><circle cx="43" cy="36" r="1.5" fill="#fff"/>' + seg + HL(64, 28, 10, 4, -10))

def o4(s):
    g = s.lg("g", "#ffb74d", "#ef6c00"); clip = f"{s.p}c"
    s.raw(f'<clipPath id="{clip}"><ellipse cx="58" cy="64" rx="42" ry="30"/></clipPath>')
    return (f'<path d="M96 64 L122 40 L118 64 L122 88Z" fill="{g}" {O("#3e1a00")}/>'
            f'<path d="M50 36 C58 22 74 24 78 36Z M52 92 C58 104 70 102 72 92Z" fill="{g}" {O("#3e1a00", 3)}/>'
            f'<ellipse cx="58" cy="64" rx="42" ry="30" fill="{g}"/>'
            f'<g clip-path="url(#{clip})"><rect x="34" y="20" width="12" height="90" fill="#fff" stroke="#222" stroke-width="3"/><rect x="66" y="20" width="12" height="90" fill="#fff" stroke="#222" stroke-width="3"/></g>'
            f'<ellipse cx="58" cy="64" rx="42" ry="30" fill="none" {O("#3e1a00")}/>'
            f'<circle cx="28" cy="58" r="6" fill="#fff" {O("#222", 2)}/><circle cx="27" cy="58" r="3" fill="#222"/>{HL(50, 44, 12, 4, -5)}')

def o5(s):
    g = s.rg("g", "#fff59d", "#f9a825", .4, .35); out = "#7a5200"
    spikes = "".join(f'<path d="M{64+40*math.cos(math.radians(a)):.1f} {64+40*math.sin(math.radians(a)):.1f} L{64+54*math.cos(math.radians(a)):.1f} {64+54*math.sin(math.radians(a)):.1f}" {O(out, 4)}/>' for a in range(0, 360, 30))
    return (spikes + f'<circle cx="64" cy="64" r="42" fill="{g}" {O(out)}/>'
            f'<path d="M30 76 Q64 100 98 76 Q90 104 64 106 Q38 104 30 76Z" fill="#fffde7" opacity=".9"/>'
            f'<circle cx="50" cy="54" r="9" fill="#fff" {O("#222", 2)}/><circle cx="52" cy="55" r="5" fill="#222"/>'
            f'<circle cx="80" cy="54" r="9" fill="#fff" {O("#222", 2)}/><circle cx="82" cy="55" r="5" fill="#222"/>'
            f'<ellipse cx="66" cy="76" rx="6" ry="4" fill="#e65100"/>'
            f'<circle cx="40" cy="70" r="5" fill="#ff8a80" opacity=".6"/><circle cx="92" cy="70" r="5" fill="#ff8a80" opacity=".6"/>{HL(46, 36, 10, 5)}')

def o6(s):
    g = s.rg("g", "#ff8a65", "#c62828", .4, .3); out = "#5d0d0d"
    legs = "".join(f'<path d="M{x} 84 L{x+d*16} 104 L{x+d*20} 116" fill="none" {O(out, 4)}/>' for x, d in [(40, -1), (50, -1), (78, 1), (88, 1)])
    claw = lambda x, f: (f'<path d="M{x} 54 C{x-f*20} 50 {x-f*24} 30 {x-f*14} 22 L{x-f*6} 34 L{x} 24 C{x+f*8} 34 {x+f*4} 48 {x} 54Z" fill="{g}" {O(out)}/>')
    return (legs + claw(26, 1) + claw(102, -1)
            + f'<path d="M30 60 L40 70 M98 60 L88 70" {O(out, 5)}/>'
            + f'<ellipse cx="64" cy="76" rx="36" ry="24" fill="{g}" {O(out)}/>'
            f'<path d="M54 54 L52 42 M74 54 L76 42" {O(out, 4)}/><circle cx="52" cy="40" r="7" fill="#fff" {O(out, 2.5)}/><circle cx="76" cy="40" r="7" fill="#fff" {O(out, 2.5)}/>'
            f'<circle cx="53" cy="41" r="3.5" fill="#222"/><circle cx="77" cy="41" r="3.5" fill="#222"/><path d="M56 84 q8 6 16 0" fill="none" {O(out, 3)}/>{HL(50, 64, 10, 4, -10)}')

def o7(s):
    g = s.rg("g", "#e1bee7", "#7b1fa2", .4, .3); out = "#38006b"
    ten = "".join(f'<path d="M{x} 74 C{x+dx} 96 {x-dx} 104 {x+dx*1.4} 118" fill="none" {O(out, 13)}/><path d="M{x} 74 C{x+dx} 96 {x-dx} 104 {x+dx*1.4} 118" fill="none" stroke="{g}" stroke-width="7" stroke-linecap="round"/>'
                  for x, dx in [(30, -10), (48, 8), (66, -8), (84, 10), (100, 12)])
    return (ten + f'<path d="M22 76 C18 40 38 14 64 14 C90 14 110 40 106 76 C90 86 38 86 22 76Z" fill="{g}" {O(out)}/>'
            f'<ellipse cx="48" cy="56" rx="9" ry="11" fill="#fff" {O(out, 2)}/><circle cx="50" cy="58" r="5" fill="#222"/>'
            f'<ellipse cx="80" cy="56" rx="9" ry="11" fill="#fff" {O(out, 2)}/><circle cx="82" cy="58" r="5" fill="#222"/>'
            f'<path d="M58 72 q6 5 12 0" fill="none" {O(out, 3)}/><circle cx="40" cy="30" r="4" fill="#fff" opacity=".4"/><circle cx="84" cy="28" r="3" fill="#fff" opacity=".4"/>{HL(46, 30, 12, 6)}')

def o8(s):
    g = s.lg("g", "#90caf9", "#1565c0"); b = s.lg("b", "#ffffff", "#cfe8ff"); out = "#0b2a5c"
    return (f'<path d="M18 96 C24 54 60 26 98 30 C108 32 116 38 116 44 C110 44 104 46 104 50 C108 76 78 102 40 104 L24 118 L20 104 L6 100Z" fill="{g}" {O(out)}/>'
            f'<path d="M40 104 C70 100 98 78 102 52 C90 72 64 90 34 92Z" fill="{b}" opacity=".9"/>'
            f'<path d="M66 32 L60 12 L82 30Z" fill="{g}" {O(out, 3)}/>'
            f'<circle cx="94" cy="42" r="4" fill="#222"/><circle cx="93" cy="41" r="1.4" fill="#fff"/>'
            f'<path d="M8 120 q8 -8 16 0 q8 -8 16 0 M84 118 q8 -8 16 0 q8 -8 16 0" fill="none" {O("#4fc3f7", 4)}/>{HL(60, 44, 14, 5, -20)}')

def o9(s):
    g = s.lg("g", "#64b5f6", "#0d47a1"); b = s.lg("b", "#e3f2fd", "#90caf9"); out = "#06204d"
    return (f'<path d="M58 30 C54 20 46 14 40 16 M60 30 C60 18 66 10 74 10 M60 30 C62 20 54 8 48 6" fill="none" {O("#81d4fa", 5)}/>'
            f'<path d="M10 74 C10 44 40 34 70 36 C98 38 108 56 110 70 L124 56 L122 84 L106 84 C98 104 70 110 46 108 C24 106 10 94 10 74Z" fill="{g}" {O(out)}/>'
            f'<path d="M14 84 C30 100 64 104 92 92 C70 98 36 96 14 84Z" fill="{b}"/>'
            + "".join(f'<path d="M{x} {y} L{x+4} {y+12}" {O("#5b8fcf", 2)}/>' for x, y in [(30, 88), (44, 92), (58, 94), (72, 92)])
            + f'<circle cx="36" cy="66" r="5" fill="#222"/><circle cx="35" cy="64" r="1.6" fill="#fff"/><path d="M28 78 q10 6 22 2" fill="none" {O(out, 3)}/>{HL(46, 48, 16, 5, -10)}')

def o10(s):
    g = s.lg("g", "#fff6b0", "#c27c00", 0, 0, 1, 0, mid="#ffcc33"); out = "#6b4200"
    return (f'<rect x="58" y="44" width="12" height="80" rx="5" fill="{g}" {O(out)}/>'
            f'<path d="M30 14 L36 50 Q64 66 92 50 L98 14 L88 22 L86 44 Q64 54 42 44 L40 22Z" fill="{g}" {O(out)}/>'
            f'<path d="M64 4 L72 22 L68 48 L60 48 L56 22Z" fill="{g}" {O(out)}/>'
            f'<circle cx="64" cy="56" r="8" fill="{s.rg("p", "#ffffff", "#c9b8ff")}" {O("#5e4a9a", 2.5)}/>'
            f'<circle cx="64" cy="84" r="5" fill="#80deea" {O("#00838f", 2)}/><circle cx="64" cy="100" r="5" fill="#ff8a80" {O("#b71c1c", 2)}/>'
            f'{HL(61, 70, 2, 10, 0, .6)}')

# ---------------------------------------------------------------- FOREST
def f1(s):
    c = s.rg("c", "#ff8a80", "#c62828", .4, .3); st = s.lg("s", "#fffaf0", "#e3d2b6")
    return (f'<path d="M48 70 C46 92 44 106 50 116 L78 116 C84 106 82 92 80 70Z" fill="{st}" {O("#7a5a3a")}/>'
            f'<path d="M12 72 C12 36 36 14 64 14 C92 14 116 36 116 72 C100 80 28 80 12 72Z" fill="{c}" {O("#6d0d0d")}/>'
            + "".join(f'<ellipse cx="{x}" cy="{y}" rx="{r}" ry="{r*.8}" fill="#fff"/>' for x, y, r in [(40, 40, 7), (66, 28, 6), (88, 44, 8), (56, 58, 5), (30, 62, 4), (98, 64, 4)])
            + HL(36, 30, 10, 4))

def f2(s):
    n = s.lg("n", "#e0a86a", "#8d5524", 0, 0, 1, 0); c = s.lg("c", "#9c6b3c", "#4e2f14")
    return (f'<path d="M30 56 C28 92 46 116 64 118 C82 116 100 92 98 56Z" fill="{n}" {O("#4a2a10")}/>'
            f'<path d="M20 58 C20 34 40 22 64 22 C88 22 108 34 108 58 C90 66 38 66 20 58Z" fill="{c}" {O("#2e1a08")}/>'
            + "".join(f'<path d="M{x} {y} l6 6 M{x+6} {y} l-6 6" {O("#2e1a08", 2)} opacity=".5"/>' for x, y in [(36, 38), (52, 32), (68, 32), (84, 38), (44, 50), (60, 46), (76, 50)])
            + f'<path d="M64 22 C64 14 68 8 74 6" fill="none" {O("#2e1a08", 5)}/>{HL(46, 80, 5, 14, 15)}')

def f3(s):
    g = s.lg("g", "#ffcc80", "#e65100", 0, 0, 1, 1)
    return (f'<path d="M20 108 C10 70 40 24 108 14 C112 70 80 112 20 108Z" fill="{g}" {O("#7a2800")}/>'
            f'<path d="M14 116 L100 22 M44 82 L40 58 M44 82 L68 84 M66 58 L62 38 M66 58 L86 58" fill="none" {O("#7a2800", 3)} opacity=".7"/>{HL(46, 52, 12, 5, -45)}')

def f4(s):
    w = s.rg("w", "#e1f5fe", "#7c4dff", .3, .3, .9); w2 = s.rg("v", "#e0f7fa", "#26c6da", .3, .3, .9); out = "#2a1060"
    return (f'<path d="M62 62 C40 30 14 22 10 40 C6 60 30 70 62 66Z" fill="{w}" {O(out)}/>'
            f'<path d="M66 62 C88 30 114 22 118 40 C122 60 98 70 66 66Z" fill="{w}" {O(out)}/>'
            f'<path d="M62 68 C40 72 24 88 32 104 C42 116 58 96 62 72Z" fill="{w2}" {O(out)}/>'
            f'<path d="M66 68 C88 72 104 88 96 104 C86 116 70 96 66 72Z" fill="{w2}" {O(out)}/>'
            f'<circle cx="30" cy="44" r="6" fill="#fff" opacity=".8"/><circle cx="98" cy="44" r="6" fill="#fff" opacity=".8"/>'
            f'<ellipse cx="64" cy="70" rx="6" ry="26" fill="#3a2060" {O(out, 2)}/><circle cx="64" cy="42" r="7" fill="#3a2060"/>'
            f'<path d="M60 36 C56 26 50 22 46 22 M68 36 C72 26 78 22 82 22" fill="none" {O(out, 2.5)}/>')

def f5(s):
    b = s.rg("b", "#d7a87a", "#6d4325", .4, .3); out = "#3a2210"; be = s.lg("e", "#fff3e0", "#e6c9a0")
    return (f'<path d="M34 34 L28 12 L48 26Z M94 34 L100 12 L80 26Z" fill="{b}" {O(out)}/>'
            f'<path d="M64 20 C30 20 22 50 24 78 C26 104 44 118 64 118 C84 118 102 104 104 78 C106 50 98 20 64 20Z" fill="{b}" {O(out)}/>'
            f'<path d="M44 74 C44 100 54 110 64 110 C74 110 84 100 84 74 C76 80 52 80 44 74Z" fill="{be}"/>'
            + "".join(f'<path d="M{x} {y} q4 4 8 0" fill="none" {O("#b08a60", 2)}/>' for x, y in [(52, 88), (62, 92), (68, 84), (56, 100)])
            + f'<circle cx="46" cy="52" r="15" fill="#fff8e1" {O(out, 3)}/><circle cx="82" cy="52" r="15" fill="#fff8e1" {O(out, 3)}/>'
            f'<circle cx="47" cy="53" r="8" fill="#ff9800"/><circle cx="81" cy="53" r="8" fill="#ff9800"/><circle cx="47" cy="53" r="4.5" fill="#222"/><circle cx="81" cy="53" r="4.5" fill="#222"/>'
            f'<circle cx="45" cy="50" r="1.8" fill="#fff"/><circle cx="79" cy="50" r="1.8" fill="#fff"/>'
            f'<path d="M58 64 L64 74 L70 64Z" fill="#ffb300" {O(out, 2.5)}/>{HL(44, 30, 10, 4)}')

def f6(s):
    w = s.lg("w", "#fffdf5", "#e6d8b8", 0, 0, 1, 0); fl = s.rg("f", "#ffffff", "#ff9800", .5, .7, .7); gold = s.lg("g", "#ffe082", "#b07a10")
    return (f'<ellipse cx="64" cy="114" rx="40" ry="9" fill="{gold}" {O("#6b4400")}/>'
            f'<rect x="42" y="44" width="44" height="68" rx="6" fill="{w}" {O("#8a7350")}/>'
            f'<path d="M42 52 C42 66 50 66 50 56 C50 74 58 74 58 54 L74 54 C74 64 80 64 80 52 L86 52 L86 48 L42 48Z" fill="#fffef8" {O("#8a7350", 3)}/>'
            f'<path d="M64 44 L64 34" {O("#4a3a2a", 3)}/>'
            f'<path d="M64 4 C74 18 78 26 72 34 C68 40 60 40 56 34 C50 26 56 16 64 4Z" fill="{fl}" {O("#e65100", 3)}/>'
            f'<ellipse cx="64" cy="28" rx="3.5" ry="6" fill="#fff"/>{HL(50, 70, 3, 14, 0)}')

def f7(s):
    p = s.lg("p", "#fff6dc", "#e3c48e", 0, 0, 0, 1); rod = s.lg("r", "#a1663a", "#4e2a12", 0, 0, 1, 0)
    return (f'<rect x="20" y="30" width="88" height="70" fill="{p}" {O("#7a5a2a")}/>'
            + "".join(f'<path d="M34 {y} L{94 - (i%2)*16} {y}" {O("#a0825a", 3)} opacity=".7"/>' for i, y in enumerate((46, 58, 70, 82)))
            + f'<rect x="12" y="20" width="12" height="90" rx="5" fill="{rod}" {O("#3a1d08")}/><rect x="104" y="20" width="12" height="90" rx="5" fill="{rod}" {O("#3a1d08")}/>'
            f'<path d="M60 100 L54 122 L64 116 L74 122 L68 100Z" fill="#e53935" {O("#7f0000", 3)}/><circle cx="64" cy="100" r="8" fill="#e53935" {O("#7f0000", 3)}/>'
            f'<circle cx="18" cy="16" r="6" fill="#ffca28" {O("#7a4a00", 2)}/><circle cx="110" cy="16" r="6" fill="#ffca28" {O("#7a4a00", 2)}/>')

def f8(s):
    b = s.rg("b", "#e8fff0", "#1b8f5a", .4, .35, .8); gold = s.lg("g", "#ffe082", "#9a6a00")
    return (f'<path d="M30 116 L38 94 L90 94 L98 116Z" fill="{gold}" {O("#5a3a00")}/>'
            f'<circle cx="64" cy="58" r="42" fill="{b}" {O("#0b4a2c")}/>'
            f'<path d="M38 64 C48 50 58 74 70 58 C80 46 90 62 92 56" fill="none" stroke="#c8ffd8" stroke-width="6" stroke-linecap="round" opacity=".7"/>'
            f'<path d="M42 78 C54 70 66 86 84 74" fill="none" stroke="#c8ffd8" stroke-width="4" stroke-linecap="round" opacity=".5"/>'
            f'{HL(46, 36, 14, 8)}')

def f9(s):
    g = s.rg("g", "#fffde7", "#ffca28", .3, .3)
    return (f'<path d="M78 10 C44 12 22 40 24 70 C26 100 54 120 84 116 C60 106 46 84 48 62 C50 38 62 20 78 10Z" fill="{g}" {O("#8a5a00")}/>'
            + spark(92, 40, 12, "#fff59d") + spark(104, 76, 8, "#fff59d") + spark(82, 98, 6, "#fff59d") + HL(36, 52, 4, 14, 20))

def f10(s):
    g = s.rg("g", "#b9f6ca", "#2e7d32", .4, .3); be = s.lg("b", "#fff9c4", "#ffd54f"); w = s.lg("w", "#80cbc4", "#00695c"); out = "#0b3d13"
    return (f'<path d="M86 96 C110 100 120 84 112 72 C108 66 100 70 104 78 C106 86 96 88 88 84Z" fill="{g}" {O(out)}/>'
            f'<path d="M40 60 C20 40 10 50 8 66 C20 62 26 70 30 80Z" fill="{w}" {O(out)}/>'
            f'<path d="M88 60 C108 40 118 50 120 66 C108 62 102 70 98 80Z" fill="{w}" {O(out)}/>'
            f'<path d="M36 116 C30 86 40 64 64 62 C88 64 98 86 92 116Z" fill="{g}" {O(out)}/>'
            f'<path d="M50 112 C46 92 52 76 64 74 C76 76 82 92 78 112Z" fill="{be}"/>'
            f'<path d="M48 26 L42 8 L58 20Z M80 26 L86 8 L70 20Z" fill="#fff59d" {O("#8a6a00", 3)}/>'
            f'<path d="M28 44 C28 24 44 16 64 16 C84 16 100 24 100 44 C100 62 84 70 64 70 C44 70 28 62 28 44Z" fill="{g}" {O(out)}/>'
            f'<ellipse cx="64" cy="54" rx="18" ry="10" fill="{be}"/><circle cx="58" cy="52" r="2" fill="#5a4a00"/><circle cx="70" cy="52" r="2" fill="#5a4a00"/>'
            f'<circle cx="48" cy="38" r="7" fill="#fff" {O(out, 2)}/><circle cx="80" cy="38" r="7" fill="#fff" {O(out, 2)}/><circle cx="49" cy="39" r="4" fill="#222"/><circle cx="79" cy="39" r="4" fill="#222"/>'
            f'<circle cx="38" cy="54" r="4" fill="#ff8a80" opacity=".6"/><circle cx="90" cy="54" r="4" fill="#ff8a80" opacity=".6"/>{HL(44, 26, 10, 4)}')

THEMES = {
    "kitsune": [k1, k2, k3, k4, k5, k6, k7, k8, k9, k10],
    "sakura": [s1, s2, s3, s4, s5, s6, s7, s8, s9, s10],
    "ocean": [o1, o2, o3, o4, o5, o6, o7, o8, o9, o10],
    "forest": [f1, f2, f3, f4, f5, f6, f7, f8, f9, f10],
}

# ---------------------------------------------------------------- HOSHI
def hoshi(talk):
    s = S("hoshi_t_" if talk else "hoshi_")
    fur = s.rg("fur", "#ffffff", "#c9d3e3", .4, .3, .8); tip = s.lg("tip", "#ffd180", "#ff6d00")
    robe = s.lg("robe", "#ffffff", "#e6e0dc"); hak = s.lg("hak", "#ef5350", "#9a0f0f")
    lan = s.rg("lan", "#fff3c4", "#ff8f00", .5, .5, .7); glow = s.rg("glow", "#ffe082", "#ffe082", .5, .5, .5, 0)
    out = "#4a556b"
    tails = ""
    for ang in (-34, -20, -6, 8):
        tails += (f'<g transform="translate(16 0) rotate({ang} 110 300)"><path d="M110 300 C60 280 30 220 50 170 C58 150 80 150 78 172 C76 210 96 250 120 280Z" fill="{fur}" {O(out)}/>'
                  f'<path d="M50 170 C58 150 80 150 78 172 C72 172 62 176 56 186 C52 180 50 176 50 170Z" fill="{tip}"/></g>')
    mouth = (f'<path d="M196 122 C200 132 212 132 214 122 C210 126 200 126 196 122Z" fill="#7a2a3a" {O("#3a2a3a", 2.5)}/>' if talk
             else f'<path d="M196 122 q9 7 18 0" fill="none" {O("#3a2a3a", 3)}/>')
    svg = (f'<circle cx="236" cy="236" r="70" fill="{glow}" opacity=".6"/>'
           + tails +
           f'<path d="M100 388 C92 344 98 300 112 262 C120 236 132 214 144 200 C160 196 186 196 204 202 C220 226 232 262 236 300 C240 336 238 362 234 388 C200 394 136 394 100 388Z" fill="{hak}" {O("#5a0808")}/>'
           f'<path d="M168 214 C166 270 168 330 166 388 M140 250 C132 300 128 350 128 388 M196 250 C204 300 210 350 210 388" fill="none" {O("#5a0808", 3)} opacity=".45"/>'
           f'<path d="M126 158 C146 150 194 150 214 158 C230 170 238 210 236 258 C208 274 132 274 104 258 C102 214 110 172 126 158Z" fill="{robe}" {O(out)}/>'
           f'<path d="M128 220 C150 230 190 230 214 218 M120 244 C150 254 196 254 226 240" fill="none" {O("#b0b8c8", 2.5)} opacity=".7"/>'
           f'<path d="M104 250 C130 262 210 262 236 250 L236 262 C208 276 132 276 104 262Z" fill="#c62828" {O("#5a0808", 3)}/>'
           f'<path d="M140 156 L166 214 L192 156" fill="none" {O("#c62828", 6)}/>'
           f'<path d="M118 170 C94 186 78 222 82 256 C88 274 110 278 124 266 C116 240 118 208 130 186Z" fill="{robe}" {O(out)}/><path d="M92 236 C100 246 112 248 120 244" fill="none" {O("#b0b8c8", 2.5)}/>'
           f'<path d="M220 172 C246 184 264 210 262 234 C256 248 240 250 232 242 C232 222 226 202 210 188Z" fill="{robe}" {O(out)}/>'
           f'<circle cx="252" cy="236" r="11" fill="{fur}" {O(out, 3)}/>'
           f'<path d="M252 246 L252 262" {O("#5d3a1a", 3)}/>'
           f'<rect x="238" y="258" width="28" height="7" rx="2" fill="#c88a12" {O("#6b4400", 2.5)}/>'
           f'<ellipse cx="252" cy="290" rx="24" ry="28" fill="{lan}" {O("#8a3a00")}/>'
           f'<path d="M230 282 Q252 278 274 282 M230 300 Q252 304 274 300" fill="none" {O("#8a3a00", 2)} opacity=".5"/>'
           f'<rect x="238" y="316" width="28" height="7" rx="2" fill="#c88a12" {O("#6b4400", 2.5)}/>'
           f'<circle cx="98" cy="268" r="12" fill="{fur}" {O(out, 3)}/>'
           # head
           f'<path d="M142 66 L136 20 L172 50Z M220 62 L232 18 L196 46Z" fill="{fur}" {O(out)}/>'
           f'<path d="M146 54 L142 32 L162 50Z M216 52 L224 30 L204 46Z" fill="{tip}"/>'
           f'<path d="M126 104 C124 64 152 42 182 42 C214 42 238 62 240 96 C254 104 252 120 236 124 C226 146 204 156 182 156 C154 156 130 136 126 104Z" fill="{fur}" {O(out)}/>'
           f'<path d="M150 136 C130 150 128 168 150 172 C168 176 196 176 214 170 C232 162 226 146 214 138Z" fill="{fur}" {O(out, 3)}/>'
           f'<path d="M140 46 C150 30 196 26 216 44 C200 40 160 40 140 46Z" fill="#e8edf5" {O(out, 3)}/>'
           f'<path d="M150 112 L156 106 M150 120 L157 116" {O("#e53935", 3)}/>'
           f'<circle cx="174" cy="94" r="15" fill="#fff" fill-opacity=".25" {O("#7a5a2a", 3.5)}/><circle cx="214" cy="92" r="13" fill="#fff" fill-opacity=".25" {O("#7a5a2a", 3.5)}/>'
           f'<path d="M189 93 L201 92" {O("#7a5a2a", 3)}/>'
           f'<path d="M166 96 q8 -6 16 0 M207 94 q7 -5 14 0" fill="none" {O("#3a2a3a", 3)}/>'
           f'<ellipse cx="240" cy="112" rx="8" ry="6" fill="#3a2a3a"/>'
           + mouth +
           f'<circle cx="166" cy="116" r="7" fill="#ff8a80" opacity=".5"/><circle cx="226" cy="116" r="6" fill="#ff8a80" opacity=".5"/>'
           f'{HL(160, 60, 16, 6)}'
           f'<path d="M150 30 C160 20 176 20 182 28" fill="none" {O("#c62828", 5)}/><circle cx="184" cy="30" r="6" fill="#e53935" {O("#7f0000", 2)}/>')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"><defs>{"".join(s.defs)}</defs>{svg}</svg>'

# ---------------------------------------------------------------- BACKGROUNDS
def bg(theme):
    s = S(f"bg_{theme}_")
    W, H = 400, 800
    if theme == "kitsune":
        sky = s.lg("sky", "#4a2a6a", "#140a24"); hill = s.lg("hill", "#2a1840", "#140a20")
        body = (f'<rect width="{W}" height="{H}" fill="{sky}"/>'
                f'<circle cx="300" cy="120" r="60" fill="#ffe9b0" opacity=".25"/><circle cx="300" cy="120" r="38" fill="#fff4d6" opacity=".35"/>'
                f'<path d="M0 260 Q100 200 200 240 T400 220 L400 800 L0 800Z" fill="#2c1a45" opacity=".8"/>'
                f'<g opacity=".45" fill="#1a0e2a"><rect x="70" y="150" width="14" height="140"/><rect x="146" y="150" width="14" height="140"/>'
                f'<rect x="56" y="168" width="118" height="10"/><path d="M40 140 Q115 126 190 140 L186 154 Q115 144 44 154Z"/></g>'
                f'<path d="M0 700 Q200 640 400 700 L400 800 L0 800Z" fill="{hill}"/>'
                + "".join(f'<g opacity=".5"><line x1="{x}" y1="0" x2="{x}" y2="{y-18}" stroke="#3a2a4a" stroke-width="2"/><ellipse cx="{x}" cy="{y}" rx="12" ry="15" fill="#ff8a50"/><ellipse cx="{x}" cy="{y}" rx="26" ry="30" fill="#ff8a50" opacity=".25"/></g>'
                          for x, y in [(30, 90), (370, 300), (24, 520), (380, 640)]))
    elif theme == "sakura":
        sky = s.lg("sky", "#ffe6ef", "#f6b8cf")
        body = (f'<rect width="{W}" height="{H}" fill="{sky}"/>'
                f'<circle cx="80" cy="110" r="70" fill="#fff" opacity=".35"/>'
                f'<path d="M0 230 Q120 170 260 210 T400 190 L400 800 L0 800Z" fill="#f9c6d8" opacity=".7"/>'
                f'<path d="M0 720 Q200 660 400 720 L400 800 L0 800Z" fill="#eaa3bf" opacity=".7"/>'
                + "".join(f'<ellipse cx="{x}" cy="{y}" rx="7" ry="4" transform="rotate({a} {x} {y})" fill="#ff8fb8" opacity=".45"/>'
                          for x, y, a in [(40, 300, 20), (360, 260, -30), (320, 480, 40), (60, 600, -10), (200, 140, 60), (380, 700, 10), (20, 420, 70)]))
    elif theme == "ocean":
        sea = s.lg("sea", "#1b6f99", "#031526")
        body = (f'<rect width="{W}" height="{H}" fill="{sea}"/>'
                + "".join(f'<path d="M{x} 0 L{x+60} 0 L{x+140} 800 L{x+60} 800Z" fill="#bff3ff" opacity=".05"/>' for x in (20, 160, 280))
                + f'<path d="M0 730 Q200 690 400 730 L400 800 L0 800Z" fill="#0a2a3a"/>'
                + "".join(f'<path d="M{x} 800 C{x-20} 740 {x+20} 700 {x} 640" fill="none" stroke="#1f6b4a" stroke-width="10" stroke-linecap="round" opacity=".6"/>' for x in (24, 46, 360, 382))
                + "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="none" stroke="#bff3ff" stroke-width="2" opacity=".3"/>' for x, y, r in [(370, 520, 8), (380, 480, 5), (30, 420, 6), (40, 380, 4), (200, 120, 7)]))
    else:
        sky = s.lg("sky", "#16301f", "#050c07")
        trees = "".join(f'<path d="M{x} {y} L{x-40} {y+120} L{x+40} {y+120}Z M{x} {y+50} L{x-50} {y+180} L{x+50} {y+180}Z" fill="#0c1f12" opacity=".8"/>'
                        for x, y in [(30, 180), (380, 140), (10, 520), (390, 560)])
        body = (f'<rect width="{W}" height="{H}" fill="{sky}"/>'
                f'<circle cx="320" cy="90" r="30" fill="#f0f7c8" opacity=".35"/>' + trees
                + f'<path d="M0 720 Q200 680 400 720 L400 800 L0 800Z" fill="#0a170e"/>'
                + "".join(f'<circle cx="{x}" cy="{y}" r="3" fill="#e6f56b"/><circle cx="{x}" cy="{y}" r="10" fill="#e6f56b" opacity=".2"/>' for x, y in [(60, 300), (350, 380), (40, 660), (330, 700), (210, 110), (370, 240)]))
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid slice"><defs>{"".join(s.defs)}</defs>{body}</svg>'

# ---------------------------------------------------------------- UI
def ui(name):
    s = S(f"ui_{name}_")
    if name == "coin":
        g = s.rg("g", "#fff6b0", "#d48a00", .4, .3, .8)
        b = (f'<circle cx="64" cy="64" r="52" fill="{g}" {O("#7a4a00", 6)}/><circle cx="64" cy="64" r="38" fill="none" {O("#b07000", 4)}/>'
             f'<rect x="52" y="52" width="24" height="24" rx="3" fill="#7a4a00" opacity=".85"/>{HL(44, 36, 14, 7)}')
    elif name == "gem":
        g = s.lg("g", "#e0f7ff", "#1e88e5")
        b = (f'<path d="M30 20 L98 20 L120 48 L64 116 L8 48Z" fill="{g}" {O("#0d3c7a", 6)}/>'
             f'<path d="M8 48 L120 48 M30 20 L46 48 L64 20 L82 48 L98 20 M46 48 L64 116 L82 48" fill="none" {O("#0d3c7a", 3)} opacity=".6"/>'
             f'<path d="M30 20 L46 48 L8 48Z" fill="#fff" opacity=".45"/>')
    elif name == "energy":
        g = s.lg("g", "#fffde0", "#ffb300")
        b = f'<path d="M74 6 L22 72 L58 72 L48 122 L106 50 L68 50Z" fill="{g}" {O("#8a5000", 6)}/>{HL(56, 40, 6, 16, 35, .6)}'
    else:
        w = s.lg("w", "#c98a52", "#6b3a16"); g = s.lg("g", "#fff0a0", "#c88a00")
        b = (f'<rect x="14" y="58" width="100" height="58" rx="8" fill="{w}" {O("#3a1d08", 5)}/>'
             f'<path d="M14 62 C14 30 30 20 64 20 C98 20 114 30 114 62Z" fill="{w}" {O("#3a1d08", 5)}/>'
             f'<path d="M14 62 L114 62" {O("#3a1d08", 5)}/>'
             f'<rect x="10" y="56" width="108" height="12" rx="4" fill="{g}" {O("#6b4400", 4)}/>'
             f'<rect x="24" y="22" width="12" height="94" rx="3" fill="{g}" {O("#6b4400", 3)}/><rect x="92" y="22" width="12" height="94" rx="3" fill="{g}" {O("#6b4400", 3)}/>'
             f'<rect x="54" y="56" width="20" height="26" rx="4" fill="{g}" {O("#6b4400", 4)}/><circle cx="64" cy="68" r="4" fill="#3a1d08"/>'
             f'{HL(48, 34, 14, 5, -5)}')
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><defs>{"".join(s.defs)}</defs>{b}</svg>'

def main():
    files = []
    for th, fns in THEMES.items():
        os.makedirs(os.path.join(ART, th), exist_ok=True)
        for i, fn in enumerate(fns, 1):
            s = S(f"{th}{i}_")
            body = fn(s)
            p = os.path.join(ART, th, f"{i}.svg")
            open(p, "w", encoding="utf-8").write(item(s, i, body))
            files.append(f"{th}/{i}.svg")
    open(os.path.join(ART, "hoshi.svg"), "w", encoding="utf-8").write(hoshi(False))
    open(os.path.join(ART, "hoshi_talk.svg"), "w", encoding="utf-8").write(hoshi(True))
    os.makedirs(os.path.join(ART, "bg"), exist_ok=True); os.makedirs(os.path.join(ART, "ui"), exist_ok=True)
    for th in THEMES: open(os.path.join(ART, "bg", f"{th}.svg"), "w", encoding="utf-8").write(bg(th))
    for n in ("coin", "gem", "energy", "chest"): open(os.path.join(ART, "ui", f"{n}.svg"), "w", encoding="utf-8").write(ui(n))
    rows = ""
    for th in THEMES:
        rows += f'<h2>{th}</h2><div class="g">' + "".join(f'<figure><img src="{th}/{i}.svg"><figcaption>{i}</figcaption></figure>' for i in range(1, 11)) + "</div>"
    html = (f'<!doctype html><meta charset="utf-8"><title>Sprites preview</title><style>body{{background:#2a1b3d;color:#fff;font-family:sans-serif;padding:12px}}'
            f'.g{{display:grid;grid-template-columns:repeat(5,1fr);gap:8px;max-width:640px}}figure{{margin:0;background:#3b2756;border-radius:10px;padding:6px;text-align:center}}'
            f'img{{width:100%;max-width:110px}}.small img{{width:40px}}.bgs img{{width:120px;border-radius:8px}}</style>'
            + rows + '<h2>40px</h2><div class="small">' + "".join(f'<img src="{f}">' for f in files) + '</div>'
            '<h2>Hoshi / UI</h2><img src="hoshi.svg" width="220"><img src="hoshi_talk.svg" width="220">'
            + "".join(f'<img src="ui/{n}.svg" width="64">' for n in ("coin", "gem", "energy", "chest"))
            + '<h2>Backgrounds</h2><div class="bgs">' + "".join(f'<img src="bg/{t}.svg">' for t in THEMES) + "</div>")
    open(os.path.join(ART, "_preview.html"), "w", encoding="utf-8").write(html)
    print("ok", len(files), "items")

if __name__ == "__main__":
    main()
