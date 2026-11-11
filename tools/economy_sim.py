"""Economy model for Kitsune Merge, chapter 1 (8 temple buildings).

Monte Carlo over orders using the same formulas as CFG in game.js.
Question it answers: how much energy (= play) does chapter 1 cost,
and which currency is the bottleneck: stars or coins?

  python tools/economy_sim.py

Simplifications: every item is summoned at tier 1 (no luck upgrade, chests,
pets, boosters, combos); coins from combos/chests/temple are ignored.
So the numbers are an upper bound on energy and a lower bound on coins.
"""
import math
import random
import statistics

TEMPLE_STARS = [6, 14, 24, 36, 50, 66, 84, 105]          # CFG TEMPLE[].st
TEMPLE_COINS = [60, 190, 420, 720, 1100, 1600, 2400, 3500]  # CFG TEMPLE[].co
NEED_STARS, NEED_COINS = sum(TEMPLE_STARS), sum(TEMPLE_COINS)

xp_to_level = lambda l: round(20 * 1.45 ** (l - 1))
item_value = lambda t: round(3 * 2.3 ** (t - 1))
order_size = lambda l: 1 if l < 3 else (2 if l < 6 else 3)
energy_for = lambda t: 2 ** (t - 1)                       # tier-1 summons per tier-t item
merge_xp_for = lambda t: sum(k * 2 ** (t - k) for k in range(2, t + 1))

VARIANTS = {
    "v1.0 (before)":            (lambda l: min(10, 3 + l // 2), lambda need: len(need)),
    "v1.6: cap 6, stars t/2": (lambda l: min(6, 3 + l // 3), lambda need: sum(math.ceil(t / 2) for t in need)),
}


def chapter_run(seed, max_tier, stars_for):
    rnd = random.Random(seed)
    lv, xp, stars, coins, energy, orders = 1, 0, 0, 0, 0, 0
    while stars < NEED_STARS or coins < NEED_COINS:
        mx = max_tier(lv)
        need = [max(2, math.ceil(rnd.random() ** 0.8 * mx)) for _ in range(order_size(lv))]
        for t in need:
            energy += energy_for(t)
            xp += merge_xp_for(t) + t * 2
        coins += sum(item_value(t) for t in need)
        stars += stars_for(need)
        orders += 1
        while xp >= xp_to_level(lv):
            xp -= xp_to_level(lv)
            lv += 1
    return energy, orders, lv, coins


if __name__ == "__main__":
    print(f"chapter 1 needs {NEED_STARS} stars and {NEED_COINS} coins\n")
    print(f"{'variant':30} {'energy':>8} {'orders':>7} {'level':>6} {'coins':>8}")
    for name, (mt, sf) in VARIANTS.items():
        runs = [chapter_run(s, mt, sf) for s in range(300)]
        med = [round(statistics.median(r[i] for r in runs)) for i in range(4)]
        print(f"{name:30} {med[0]:>8} {med[1]:>7} {med[2]:>6} {med[3]:>8}")
