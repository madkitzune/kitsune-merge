"""Храм (8 будівель × built/ruin), лиса-генератор, логотип. viewBox храму 0 0 160 160."""
import os
from make_sprites import S, O, HL, spark, flower, fox, ART

def svg(s, body, vb=160): return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {vb} {vb}"><defs>{"".join(s.defs)}</defs>{body}</svg>'

# палітри: built — тепла, ruin — приглушена
def P(r):
    return dict(
        red=("#8a7f80", "#4e4648") if r else ("#ff7a55", "#b71c1c"),
        redo="#2e2628" if r else "#5a0808",
        wood=("#8d8478", "#4f4a44") if r else ("#c98a52", "#6b3a16"),
        woodo="#2a2622" if r else "#3a1d08",
        stone=("#9aa0a6", "#55595e") if r else ("#d9d4c8", "#8a8478"),
        stoneo="#2e3134" if r else "#4a4438",
        gold=("#a69a7a", "#6a604a") if r else ("#fff0a0", "#c88a00"),
        goldo="#3a3428" if r else "#6b4400",
        leaf=("#7a7f62", "#4a4e38") if r else ("#a5e887", "#2e7d32"),
        water=("#6f7c80", "#3f4a4e") if r else ("#b3ecff", "#1e88e5"),
    )

def moss(xs):
    return "".join(f'<ellipse cx="{x}" cy="{y}" rx="{w}" ry="{w*.45}" fill="#5f7a3a" opacity=".85"/><circle cx="{x-w*.4}" cy="{y-2}" r="{w*.25}" fill="#7d9a4a"/>' for x, y, w in xs)

def crack(d): return f'<path d="{d}" fill="none" stroke="#1d1a1a" stroke-width="2" stroke-linecap="round" opacity=".7"/>'

def glow(s, x, y, r, c="#ffd166", op=.6):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{s.rg("gl" + str(x) + str(y), c, c, .5, .5, .5, 0)}" opacity="{op}"/>'

def ground(s, r):
    return f'<ellipse cx="80" cy="146" rx="66" ry="10" fill="#000" opacity=".22"/>'

def bridge(s, r):
    p = P(r); red = s.lg("r", *p["red"]); ro = p["redo"]
    deck = f'<path d="M8 120 Q80 70 152 120 L152 132 Q80 84 8 132Z" fill="{red}" {O(ro)}/>'
    posts = "".join(f'<rect x="{x-4}" y="{y}" width="8" height="{26}" rx="2" fill="{red}" {O(ro, 3)}/>' for x, y in [(22, 94), (52, 74), (80, 68), (108, 74), (138, 94)] if not (r and x == 108))
    rail = f'<path d="M14 98 Q80 50 146 98" fill="none" {O(ro, 9)}/><path d="M14 98 Q80 50 146 98" fill="none" stroke="{p["red"][0]}" stroke-width="4" stroke-linecap="round"/>'
    if r: rail = f'<path d="M14 98 Q50 62 96 64" fill="none" {O(ro, 9)}/><path d="M14 98 Q50 62 96 64" fill="none" stroke="{p["red"][0]}" stroke-width="4"/><path d="M122 80 Q136 88 146 98" fill="none" {O(ro, 6)}/>'
    water = f'<path d="M10 140 Q40 132 80 140 T150 140" fill="none" stroke="{p["water"][1]}" stroke-width="4" opacity=".6"/>'
    extra = (moss([(30, 126, 10), (130, 124, 9)]) + crack("M60 98 L66 108 L62 116")) if r else (glow(s, 80, 70, 40, "#ffe082", .35) + HL(56, 88, 16, 3, -25))
    caps = "".join(f'<circle cx="{x}" cy="{y}" r="5" fill="{s.lg("g", *p["gold"])}" {O(p["goldo"], 2)}/>' for x, y in [(22, 92), (52, 72), (80, 66), (138, 92)] + ([] if r else [(108, 72)]))
    return ground(s, r) + water + posts + deck + rail + caps + extra

def lantern(s, r):
    p = P(r); st = s.lg("s", *p["stone"]); so = p["stoneo"]
    roof_t = 'transform="rotate(-14 80 50)"' if r else ""
    win = (f'<rect x="64" y="70" width="32" height="24" rx="3" fill="#2a2a2a" {O(so, 3)}/>' if r else
           glow(s, 80, 82, 46, "#ffcc66", .7) + f'<rect x="64" y="70" width="32" height="24" rx="3" fill="{s.rg("w", "#fff6c4", "#ff9800", .5, .5, .7)}" {O(so, 3)}/>')
    body = (ground(s, r) +
            f'<path d="M52 144 L108 144 L100 130 L60 130Z" fill="{st}" {O(so)}/>'
            f'<rect x="70" y="100" width="20" height="32" fill="{st}" {O(so)}/>'
            f'<path d="M50 102 L110 102 L104 94 L56 94Z" fill="{st}" {O(so)}/>'
            f'<rect x="58" y="64" width="44" height="34" rx="3" fill="{st}" {O(so)}/>' + win +
            f'<g {roof_t}><path d="M40 66 Q80 40 120 66 L112 58 Q80 30 48 58Z" fill="{st}" {O(so)}/><circle cx="80" cy="34" r="7" fill="{st}" {O(so)}/></g>')
    body += (moss([(60, 132, 9), (102, 98, 7)]) + crack("M74 104 L80 114 L76 124") + crack("M60 72 L66 80")) if r else HL(66, 106, 3, 10, 0, .4)
    return body

def torii(s, r):
    p = P(r); red = s.lg("r", *p["red"], 0, 0, 1, 0); ro = p["redo"]; blk = s.lg("b", "#6a5a5a", "#2a2020") if r else s.lg("b", "#5a3a4a", "#1d1020")
    top = f'<path d="M6 34 Q80 18 154 34 L148 48 Q80 36 12 48Z" fill="{blk}" {O("#140810")}/>'
    if r: top = f'<g transform="rotate(9 30 40)">{top}</g>'
    body = (ground(s, r) +
            f'<rect x="38" y="50" width="16" height="94" rx="3" fill="{red}" {O(ro)}/>'
            f'<rect x="106" y="50" width="16" height="94" rx="3" fill="{red}" {O(ro)}/>'
            f'<rect x="24" y="72" width="112" height="12" rx="3" fill="{red}" {O(ro)}/>'
            f'<rect x="72" y="52" width="16" height="22" rx="2" fill="{s.lg("g", *p["gold"])}" {O(ro, 3)}/>'
            f'<rect x="26" y="46" width="108" height="12" rx="3" fill="{red}" {O(ro)}/>' + top)
    body += (moss([(46, 142, 12), (114, 142, 12), (60, 76, 6)]) + crack("M44 90 L50 104 L44 118") + crack("M112 60 L118 74")) if r else (
        glow(s, 80, 62, 50, "#ffe082", .35) + HL(44, 90, 2.5, 22, 0, .4) + HL(112, 90, 2.5, 22, 0, .4))
    return body

def tree(s, r):
    p = P(r); bark = s.lg("t", *p["wood"], 0, 0, 1, 0); bo = p["woodo"]
    trunk = (f'<path d="M66 146 C70 120 68 96 62 80 L98 80 C92 96 90 120 94 146Z" fill="{bark}" {O(bo)}/>'
             f'<path d="M64 146 C54 140 46 142 40 146 M96 146 C106 140 114 142 122 146" fill="none" {O(bo, 5)}/>')
    rope = (f'<path d="M64 104 Q80 112 96 104" fill="none" {O("#8a7a50" if r else "#e8d29a", 6)}/>'
            + "".join(f'<path d="M{x} 108 l4 6 l-4 4 l4 6" fill="none" stroke="{"#9a9a9a" if r else "#fff"}" stroke-width="3" stroke-linecap="round"/>' for x in (70, 86)))
    if r:
        crown = (f'<path d="M78 82 C70 60 54 52 40 40 M80 80 C84 56 96 44 112 30 M74 70 C64 66 54 70 44 66 M90 64 C100 62 112 66 122 60 M80 80 C80 60 78 40 80 22" fill="none" {O(bo, 7)}/>'
                 f'<path d="M78 82 C70 60 54 52 40 40 M80 80 C84 56 96 44 112 30 M74 70 C64 66 54 70 44 66 M90 64 C100 62 112 66 122 60 M80 80 C80 60 78 40 80 22" fill="none" stroke="{p["wood"][0]}" stroke-width="3" stroke-linecap="round"/>'
                 + "".join(f'<ellipse cx="{x}" cy="{y}" rx="5" ry="3" fill="#8a7a4a" opacity=".8"/>' for x, y in [(44, 136), (116, 138), (90, 132)]) + moss([(70, 140, 8)]))
    else:
        lf = s.rg("l", p["leaf"][0], p["leaf"][1], .4, .3, .8)
        crown = ("".join(f'<circle cx="{x}" cy="{y}" r="{rr}" fill="{lf}" {O("#1b5e20")}/>' for x, y, rr in [(46, 62, 28), (114, 62, 28), (80, 40, 34), (60, 34, 22), (102, 34, 22), (80, 70, 26)])
                 + "".join(flower(s, f"f{i}", x, y, 6, "#ffffff", "#ff8fbb", "#a3305c") for i, (x, y) in enumerate([(50, 50), (92, 26), (110, 60), (70, 56), (36, 70), (98, 78)]))
                 + HL(66, 22, 12, 5))
    return ground(s, r) + trunk + crown + rope

def spring(s, r):
    p = P(r); st = s.lg("s", *p["stone"]); so = p["stoneo"]
    basin = (f'<ellipse cx="80" cy="118" rx="66" ry="26" fill="{st}" {O(so)}/>'
             f'<ellipse cx="80" cy="112" rx="54" ry="18" fill="{s.lg("w", *p["water"])}" {O(so, 3)}/>')
    spout = (f'<rect x="102" y="54" width="14" height="52" rx="3" fill="{st}" {O(so)}/>'
             f'<path d="M100 60 L72 70" {O("#3a5a2a" if r else "#2e7d32", 8)}/><path d="M100 60 L72 70" stroke="{"#7a8a5a" if r else "#9be15d"}" stroke-width="4" stroke-linecap="round"/>')
    if r:
        extra = (crack("M40 110 L56 118 L50 124") + crack("M100 108 L112 116") + moss([(30, 124, 10), (124, 120, 9), (108, 60, 6)])
                 + f'<path d="M40 112 Q80 104 120 112" fill="none" stroke="#2a2a2a" stroke-width="2" opacity=".4"/>')
    else:
        extra = (f'<path d="M72 70 C68 82 70 96 72 108" fill="none" stroke="#b3ecff" stroke-width="5" stroke-linecap="round" opacity=".9"/>'
                 f'<ellipse cx="72" cy="110" rx="12" ry="4" fill="none" stroke="#fff" stroke-width="2" opacity=".8"/><ellipse cx="72" cy="110" rx="22" ry="7" fill="none" stroke="#fff" stroke-width="1.5" opacity=".5"/>'
                 f'<ellipse cx="46" cy="114" rx="10" ry="4" fill="#66bb6a" {O("#1b5e20", 2)}/>' + flower(s, "lo", 46, 110, 7, "#ffffff", "#ff8fbb", "#a3305c")
                 + f'<path d="M96 116 q8 -4 14 0 q-6 4 -14 0Z" fill="#ff7043" {O("#8a2a08", 1.5)}/>' + HL(60, 106, 16, 3, 0, .5))
    return ground(s, r) + basin + spout + extra

def bell(s, r):
    p = P(r); wood = s.lg("w", *p["wood"], 0, 0, 1, 0); wo = p["woodo"]; gold = s.lg("g", *p["gold"], mid=None if r else "#ffcf40")
    frame = (f'<rect x="22" y="40" width="12" height="104" rx="3" fill="{wood}" {O(wo)}/>'
             f'<rect x="126" y="40" width="12" height="104" rx="3" fill="{wood}" {O(wo)}/>')
    roof = f'<path d="M6 44 Q80 14 154 44 L146 52 Q80 30 14 52Z" fill="{s.lg("rf", "#6a6a6a", "#3a3a3a") if r else s.lg("rf", "#5a3a4a", "#1d1020")}" {O("#140810")}/>'
    b = (f'<path d="M80 62 C62 62 56 80 56 96 C56 110 50 116 46 120 L114 120 C110 116 104 110 104 96 C104 80 98 62 80 62Z" fill="{gold}" {O(p["goldo"])}/>'
         f'<rect x="44" y="118" width="72" height="9" rx="4" fill="{gold}" {O(p["goldo"])}/>'
         f'<path d="M62 92 L98 92 M64 104 L96 104" {O(p["goldo"], 2.5)} opacity=".6"/>')
    if r:
        return (ground(s, r) + f'<g transform="rotate(-10 80 80)">{frame}</g>' + f'<g transform="translate(6 18) rotate(28 80 120)">{b}</g>'
                + f'<g transform="rotate(-12 80 40)">{roof}</g>' + moss([(30, 140, 9), (110, 144, 10)]) + crack("M70 110 L76 118"))
    return (ground(s, r) + glow(s, 80, 96, 50, "#ffe082", .45) + frame + f'<path d="M80 50 L80 62" {O("#8e1b1b", 5)}/>' + b + roof
            + f'<path d="M134 70 L134 100" {O("#c62828", 4)}/><circle cx="134" cy="104" r="5" fill="#e53935" {O("#7f0000", 2)}/>' + HL(68, 80, 4, 12, 15, .6))

def altar(s, r):
    p = P(r); wood = s.lg("w", *p["wood"]); wo = p["woodo"]
    tbl = (f'<rect x="24" y="96" width="112" height="14" rx="4" fill="{wood}" {O(wo)}/>'
           f'<rect x="34" y="108" width="12" height="36" fill="{wood}" {O(wo)}/><rect x="114" y="108" width="12" height="36" fill="{wood}" {O(wo)}/>'
           f'<rect x="40" y="124" width="80" height="8" fill="{wood}" {O(wo, 3)}/>')
    if r:
        return (ground(s, r) + f'<g transform="rotate(4 80 110)">{tbl}</g>' + crack("M60 98 L66 106 L60 110")
                + f'<rect x="56" y="84" width="10" height="14" rx="2" fill="#9a9a90" {O("#3a3a3a", 2.5)} transform="rotate(70 61 91)"/>'
                + f'<ellipse cx="102" cy="94" rx="14" ry="4" fill="#6a6a60" {O("#2a2a2a", 2.5)}/>' + moss([(40, 142, 8), (128, 140, 8)]))
    candle = lambda x: (glow(s, x, 62, 18, "#ffcc66", .7) + f'<rect x="{x-5}" y="70" width="10" height="26" rx="2" fill="#fffaf0" {O("#8a7350", 2.5)}/>'
                        f'<path d="M{x} 54 C{x+6} 62 {x+5} 68 {x} 70 C{x-5} 68 {x-6} 62 {x} 54Z" fill="{s.rg("fl" + str(x), "#ffffff", "#ff9800", .5, .7, .7)}" {O("#e65100", 2)}/>')
    fruit = (f'<ellipse cx="80" cy="94" rx="22" ry="5" fill="{s.lg("pl", *p["gold"])}" {O(p["goldo"], 2.5)}/>'
             f'<circle cx="72" cy="84" r="9" fill="#ff7043" {O("#8a2a08", 2.5)}/><circle cx="88" cy="84" r="9" fill="#ffca28" {O("#8a5a00", 2.5)}/><circle cx="80" cy="74" r="9" fill="#ef5350" {O("#7f0000", 2.5)}/>'
             f'<path d="M80 66 L82 60" {O("#2e7d32", 2.5)}/>')
    return ground(s, r) + tbl + candle(40) + candle(120) + fruit + HL(50, 100, 18, 2, 0, .4)

def shrine(s, r):
    p = P(r); red = s.lg("r", *p["red"], 0, 0, 1, 0); ro = p["redo"]; wall = s.lg("w", "#a8a49c", "#6a665e") if r else s.lg("w", "#fffaf0", "#e6d6bc")
    roof = s.lg("rf", "#6e6a6e", "#38343a") if r else s.lg("rf", "#6a4a7a", "#24142e")
    body = (ground(s, r) +
            f'<rect x="20" y="132" width="120" height="12" rx="3" fill="{s.lg("st", *p["stone"])}" {O(p["stoneo"])}/>'
            f'<rect x="36" y="74" width="88" height="60" fill="{wall}" {O(p["woodo"])}/>'
            f'<rect x="36" y="74" width="10" height="60" fill="{red}" {O(ro, 3)}/><rect x="114" y="74" width="10" height="60" fill="{red}" {O(ro, 3)}/>'
            f'<rect x="62" y="96" width="36" height="38" fill="{"#3a3434" if r else s.rg("d", "#fff3c4", "#ff8f00", .5, .4, .8)}" {O(p["woodo"], 3)}/>'
            f'<path d="M80 96 L80 134" {O(p["woodo"], 2.5)}/>'
            f'<path d="M4 80 Q24 74 36 52 L124 52 Q136 74 156 80Z" fill="{roof}" {O("#140810")}/>'
            f'<path d="M44 52 L80 24 L116 52Z" fill="{roof}" {O("#140810")}/>'
            f'<path d="M70 30 L90 30" {O(s.lg("g", *p["gold"]), 4)}/>')
    if r:
        body += (f'<path d="M96 56 L106 66 L98 72 L110 78" fill="#140810" stroke="#140810" stroke-width="3"/>'
                 + crack("M50 84 L56 96 L52 108") + crack("M110 100 L104 112") + moss([(40, 134, 10), (120, 132, 10), (130, 76, 8)]))
    else:
        body = glow(s, 80, 104, 64, "#ffe082", .5) + body + (
            f'<path d="M30 80 L30 88 M130 80 L130 88" {O("#5d3a1a", 2)}/>'
            f'<ellipse cx="30" cy="96" rx="7" ry="9" fill="{s.rg("la", "#fff3c4", "#e53935", .5, .5, .7)}" {O("#7f0000", 2)}/>'
            f'<ellipse cx="130" cy="96" rx="7" ry="9" fill="{s.rg("lb", "#fff3c4", "#e53935", .5, .5, .7)}" {O("#7f0000", 2)}/>'
            + spark(80, 12, 8, "#fff59d") + HL(60, 62, 18, 3, -8, .35))
    return body

BUILD = {"bridge": bridge, "lanterns": lantern, "torii": torii, "tree": tree, "spring": spring, "bell": bell, "altar": altar, "shrine": shrine}

def generator():
    s = S("ui_generator_")
    cush = s.rg("c", "#b388ff", "#4a148c", .4, .3)
    body = (f'<circle cx="64" cy="66" r="60" fill="{s.rg("h", "#ffe082", "#ffe082", .5, .5, .5, 0)}" opacity=".55"/>'
            f'<ellipse cx="64" cy="108" rx="54" ry="16" fill="{cush}" {O("#2a0a5a")}/>'
            f'<path d="M14 108 L6 118 M114 108 L122 118" {O("#ffca28", 4)}/>'
            f'{HL(42, 100, 14, 3, 0, .4)}'
            f'<g transform="translate(14 4) scale(.78)">{fox(s)}</g>'
            f'<path d="M86 96 C80 90 82 80 92 78 L106 78 C116 80 118 90 112 96 C106 104 92 104 86 96Z" fill="{s.lg("b", "#ff8a65", "#c62828")}" {O("#5a0808", 3)}/>'
            f'<path d="M92 78 Q99 72 106 78" fill="none" {O("#ffd54f", 3)}/>'
            + spark(100, 64, 6, "#fff59d") + spark(112, 74, 4, "#fff59d") + spark(20, 30, 5))
    return svg(s, body, 128)

def logo():
    s = S("logo_")
    ring = s.lg("g", "#fff6b0", "#c27c00", mid="#ffcc33"); bg = s.rg("bg", "#5a3080", "#1a0a2c", .5, .4, .8)
    tails = ""
    for ang in range(-120, 121, 30):
        tails += (f'<g transform="rotate({ang} 128 150)"><path d="M128 150 C116 120 112 84 122 54 C126 44 138 44 140 54 C144 84 140 120 128 150Z" fill="{s.lg("t", "#ffffff", "#ffd8b8")}" {O("#7a3a1a", 4)}/>'
                  f'<path d="M122 54 C126 44 138 44 140 54 C136 62 126 62 122 54Z" fill="#ff8a3d"/></g>')
    face = (f'<path d="M88 112 L80 70 L112 96Z M168 112 L176 70 L144 96Z" fill="#fff" {O("#7a3a1a", 5)}/>'
            f'<path d="M92 104 L88 82 L104 98Z M164 104 L168 82 L152 98Z" fill="#ff8a3d"/>'
            f'<path d="M78 140 C78 108 102 94 128 94 C154 94 178 108 178 140 C178 168 154 190 128 196 C102 190 78 168 78 140Z" fill="{s.rg("f", "#ffffff", "#d9e1ee", .4, .3)}" {O("#7a3a1a", 5)}/>'
            f'<path d="M100 134 q10 -8 20 0 M136 134 q10 -8 20 0" fill="none" {O("#2a1a2a", 5)}/>'
            f'<path d="M96 122 L110 128 M160 122 L146 128" {O("#e53935", 5)}/>'
            f'<ellipse cx="128" cy="160" rx="7" ry="5" fill="#2a1a2a"/><path d="M118 168 q10 8 20 0" fill="none" {O("#2a1a2a", 4)}/>'
            f'<circle cx="98" cy="154" r="8" fill="#ff8a80" opacity=".6"/><circle cx="158" cy="154" r="8" fill="#ff8a80" opacity=".6"/>{HL(108, 110, 14, 6)}')
    body = (f'<circle cx="128" cy="128" r="122" fill="{ring}" {O("#6b4200", 6)}/>'
            f'<circle cx="128" cy="128" r="106" fill="{bg}" {O("#6b4200", 4)}/>'
            + "".join(spark(x, y, rr, "#fff59d") for x, y, rr in [(62, 70, 7), (196, 66, 6), (200, 190, 5), (58, 186, 5)])
            + tails + face)
    return svg(s, body, 256)

def main():
    d = os.path.join(ART, "temple"); os.makedirs(d, exist_ok=True)
    for k, fn in BUILD.items():
        for r in (False, True):
            s = S(f"temple_{k}{'_ruin' if r else ''}_")
            open(os.path.join(d, f"{k}{'_ruin' if r else ''}.svg"), "w", encoding="utf-8").write(svg(s, fn(s, r)))
    open(os.path.join(ART, "ui", "generator.svg"), "w", encoding="utf-8").write(generator())
    open(os.path.join(ART, "logo.svg"), "w", encoding="utf-8").write(logo())
    # превʼю храму
    rd = lambda rel: open(os.path.join(ART, rel), encoding="utf-8").read()
    h = "".join(f"<figure><div class='im'>{rd(f'temple/{k}_ruin.svg')}</div><div class='im'>{rd(f'temple/{k}.svg')}</div><figcaption>{k}</figcaption></figure>" for k in BUILD)
    h += f"<figure><div class='im'>{rd('ui/generator.svg')}</div><div class='im'>{rd('logo.svg')}</div><figcaption>generator / logo</figcaption></figure>"
    open(os.path.join(ART, "_preview_temple.html"), "w", encoding="utf-8").write(
        "<!doctype html><meta charset='utf-8'><title>Temple preview</title><style>body{background:#2a1b3d;color:#fff;font-family:sans-serif;padding:12px}"
        "figure{display:inline-flex;gap:6px;margin:6px;background:#3b2756;border-radius:10px;padding:6px;flex-wrap:wrap;width:300px;font-size:12px}.im{width:140px}.im svg{width:100%;height:auto;display:block}figcaption{width:100%;text-align:center}</style>" + h)
    print("ok temple", len(BUILD) * 2)

if __name__ == "__main__":
    main()
