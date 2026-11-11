"""Партія 3: декор галявини (m_*) і ставка (p_reeds) під id гри."""
import os, sys, time
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from gen_batch2 import save, fetch, STYLE, NOBG, ART

DEC = {
  "m_cushion": "round soft red and gold floor cushion zabuton, top 3/4 view",
  "m_lantern": "small glowing japanese paper lantern on a short wooden pole, top 3/4 view",
  "m_berry": "round bush with red and blue berries, top 3/4 view",
  "m_burrow": "cozy fox burrow hole under big tree roots with a little moss, top 3/4 view",
  "p_reeds": "clump of green water reeds and cattails, top 3/4 view",
}
def main():
    tok = os.environ.get("POLLINATIONS_TOKEN") or sys.exit("POLLINATIONS_TOKEN?")
    for k, d in DEC.items():
        for sd in (71, 172):
            p = f"decor/{k}_s{sd}.png"
            if os.path.exists(os.path.join(ART, p)): continue
            print("gen", p, flush=True)
            try: save(p, fetch(f"{d}, game decoration icon, {STYLE}{NOBG}", 512, 512, sd, tok), "sprite")
            except Exception as e: print("FAIL", p, e, flush=True)
            time.sleep(3)
    print("DONE", flush=True)
if __name__ == "__main__":
    main()
