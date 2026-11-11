# Kitsune Merge: design pack

Game designer: Myroslav Khmelnytsky. This is a playable HTML5 prototype of a casual F2P merge game. Code, art, voice and text were made with AI tools. This document holds the design side: the loop, the economy model, the metrics and the test plan. It also says what I would do next if real players' numbers came in.

> Status: prototype, not tested on real players. All KPI numbers below are **targets and hypotheses**, not measured results.

---

## 1. One-pager

| | |
|---|---|
| **Genre** | Merge-2 + light meta (decorate a place). Casual F2P, portrait, sessions of 3–8 min |
| **Audience** | 25–45, mostly women. Players of Travel Town, Merge Mansion, Gossip Harbor: people who want a cozy story with steady progress and no fail state |
| **Fantasy** | "I bring a forgotten fox temple back to life together with Grandma Hoshi" |
| **Hook** | Every merge is a step toward rebuilding the temple. The temple is a living scene that plays back to you: the bell rings, the lanterns light up, the foxes wait for food |
| **Pillars** | 1. Cozy, never punishing. 2. Visible progress every session. 3. Small rituals worth coming back for (feed the foxes, ring the bell, collect the daily gift) |
| **Monetisation** | Hybrid. Rewarded ads for energy (opt-in, daily cap) + IAP for gems (energy, boosters, cosmetics) + a one-time starter pack |

### Market references, and what I take from each
- **Travel Town / Merge Mansion.** Board, generator, orders and energy. This is the proven merge-2 core, so I keep it as is and don't reinvent it.
- **Gardenscapes / Fishdom.** Meta as "restore a place", plus a pets aquarium (Fishdom). That is where the foxes' meadow and the koi spring come from.
- **Hidden City.** Narrative voice and atmosphere bring players back better than rewards alone. Grandma Hoshi is the narrator, and her lines are voiced.

---

## 2. Core loop and meta

```
            ┌────────────── energy (regen 30 s, cap 40) ──────────────┐
            ▼                                                         │
  SUMMON (1 energy) → MERGE 2→1 up to tier 10 → FILL ORDER → coins + stars + XP
                                                         │        │       │
                                    upgrades (shop) ◄────┘        │       └─► level → bigger orders,
                                                                  ▼            +energy, +gems
                                             TEMPLE: 8 buildings (stars + coins)
                                             └─ each one unlocks a ritual and a pet slot
                                                  ├─ Meadow: foxes (passives; need food)
                                                  └─ Spring: koi (passives; need food)
```

- **Session loop (3–8 min).** Spend the energy, fill 3–6 orders, and either build something or get close to it.
- **Daily loop.** Daily gift streak, 3 daily quests, feed the pets, ring the bell and light the lanterns (cooldowns of 3–5 min fit naturally into the next session).
- **Long loop.** 8 buildings in chapter 1, a 13-step story quest chain that unlocks pets, and collections (6 foxes, 6 koi, skins).

### What I cut while narrowing the scope (v1.4)
A first build of a prototype tends to collect features. On a review pass I asked of every system: "does it serve the session loop or the daily loop?"

| System | Decision | Why |
|---|---|---|
| Boosters as a separate tab in the main navigation | **Moved into the shop tab** | They are a gem sink, not a destination of their own. One fewer button on the main screen |
| Wandering spirits in the temple | **Removed visually.** Coins now drop from built buildings | They read as noise on the scene and did not add to the "living temple" feeling |
| Analytics screen | **Debug only** (`?debug`) | Developer tool, not a player feature |
| 4 visual themes | Kept, but settings only | Cheap personalisation, kept off the critical path |

---

## 3. Economy

### Currencies

| Currency | Sources | Sinks | Role |
|---|---|---|---|
| **Energy** | regen 1 / 30 s (cap 40), level-up +15, daily gift, rewarded ad +10 (5/day), chests, lanterns | 1 per summon | Session pacing, the main monetisation lever |
| **Coins** | orders (3·2.3^(t−1) per item), combo, chests, bell, spirits / buildings | upgrades, temple buildings, decor | Soft currency |
| **Stars** | orders | temple buildings | Meta progress gate |
| **Gems** | level-up +3, buildings, daily, quests, IAP | boosters, energy refill, skins | Hard currency |
| **Food** | orders, chests, tree, pond | feeding pets (keeps their passives on) | Return driver for the daily loop |

All formulas live in one `CFG` object (`game.js`) and are mirrored in [`balance.csv`](../balance.csv).

### Model: how much play does chapter 1 cost?
Temple costs (v1.6.1, after a playtest note that buildings came too fast): stars 6 / 14 / 24 / 36 / 50 / 66 / 84 / 105 and coins 60 → 3 500. Pacing by the model: building 1 after about 6 orders, building 2 after 11, then 17 / 23 / 30 / 40 / 53 / 70.

[`tools/economy_sim.py`](../tools/economy_sim.py) is a Monte Carlo over orders with the same formulas as the game (300 runs, median values).

| Variant | Energy to finish chapter 1 | Orders | Level | Coins earned (needed: 9 990) |
|---|---:|---:|---:|---:|
| **v1.0** | **41 104** | 134 | 22 | 383 708 |
| **v1.6 (current):** order tier cap 6, stars = ⌈tier/2⌉ per item | **2 010** | 70 | 14 | 10 723 |

**What the model found.**
- In v1.0 the maximum order tier grows with level (up to tier 10 = 512 summons per item), while each item gives only 1 star.
- Stars become a hard bottleneck. Chapter 1 would cost about 41k energy, which is about 340 hours of regen.
- At the same time coins pile up roughly 40× beyond what there is to spend them on.
- A player would feel this as "the orders got huge and the temple stopped moving" somewhere around level 10. That is a typical churn point.

**Fix proposal.**
- Cap the order tier at 6 for chapter 1.
- Give stars per item based on its tier: ⌈tier/2⌉.
- Stars and coins then run out at about the same time, so neither currency is dead.
- Chapter 1 drops to about 2k energy. At about 300 energy per day for a typical 3–4 sessions (regen between sessions, level-ups, the daily gift and some ads), that is **about 6–7 days**. This matches the chapter length I would aim for in a casual merge game: the first goal is reachable inside the D7 window.
- **Applied in v1.6** (`CFG.orderMaxTier`, `CFG.orderStars`). In a live test the v1.0 values would be kept as the control arm of A/B #1 (§6), to confirm with players what the model predicts.

### Pets from shards (v1.9)
Foxes and koi no longer appear all at once from a quest. Each one is assembled from **shards**, so a collection grows a little in almost every session.

| Rarity | Shards to unlock | Roll weight |
|---|---:|---:|
| Common | 6 | 6 |
| Rare | 12 | 3 |
| Epic | 20 | 1.5 |
| Legendary | 30 | 0.6 |

- **Sources.** 35% chance of 1 shard per order, 2–3 shards per chest. A story-quest step gives 60% of that pet's shards, and the rest comes from play. Shards also come from the pass, offers and one free pouch per day for a rewarded ad. Pets cannot be bought with gems: every pet is assembled only from its own shards, so the collection is earned, never skipped.
- **Duplicates are never wasted.** A shard of a pet you already own turns into friendship (+15), which levels up its passive.
- **Album.** A locked pet shows as a silhouette with a shard bar, and its name appears after the first shard. This is the "almost there" pull that card collections use, without needing a server for trading.

### Monetisation systems (v1.9, demo payments)
| System | Rules | Why it is there |
|---|---|---|
| **Season pass "Temple Path"** | 14-day season, 30 tiers × 100 points. Points: order 10, quest 30, daily gift 20, building 60. Free track: coins, energy, food, shards, gems. Premium ($4.99): gems, shards, a skin every 10 tiers | Steady revenue that rewards the play the player already does. Main payer conversion beyond the first purchase |
| **Piggy bank** | +2 gems per order, +1 per 5 merges, cap 150. Can be broken from 50 gems for $1.99 | Cheapest first purchase. The player can see what they have "earned", which turns non-payers into payers |
| **Triggered offers** | One at a time, with a timer. Energy-empty → 120⚡ + 15💎 ($0.99, 30 min). Stars ready but coins short → builder pack ($1.99, 60 min). Every 3rd level → level gift ($2.99, 45 min). Each trigger fires once (per day / per building / per level) | Sells at the moment of need. The highest-converting tool in F2P, and easy to A/B |
| **Subscription "Hoshi's Blessing"** | $4.99 / week: 10💎 + 20⚡ daily, +10 max energy, ads without waiting | Recurring revenue for engaged players |
| **Rewarded ads** (cap 8/day) | ×2 coins for an order (button for 5 s), ×2 daily gift, free shard pouch daily, energy | Opt-in value for non-payers. No interstitials |
| Starter pack, gem packs, gem sinks | As before: $1.99 once / $0.99 / $4.99; refill, boosters, skins | Baseline store |

Guardrails I would watch: D1/D7 retention (offers must not feel pushy, hence one at a time and a fixed set of moments), the share of payers whose first purchase is the piggy bank, and ad views per DAU against session length.

---

## 4. First session (FTUE)

| Time | Beat | Goal |
|---|---|---|
| 0:00 | Splash → Hoshi's voiced intro (2 lines) | Tone and motivation in 15 s |
| 0:20 | Guided summon ×2 → guided merge → guided order | Core verbs taught in about 60 s, one action per step, nothing else on the screen |
| 1:30 | Free play. Orders of 1 item (levels 1–2) | Early wins. The first level-up comes in about 2 min |
| ~3:00 | Enough stars for the bridge → temple intro | First meta reward. The temple scene opens |
| 3–6 min | First upgrade becomes affordable (120 coins), first energy-empty | Teaches the energy economy. The first monetisation moment is soft (an ad offer, not a paywall) |
| later | Each new screen explains itself once (Hoshi's hint inside the screen) | No front-loaded tutorial for secondary systems |

---

## 5. Metrics

### Event taxonomy (already in the build, local log + JSON export)
- **Funnel:** `splash_play → tutorial_start → tutorial_step_N → tutorial_done → first_order → temple_build_1 → first_upgrade`
- **Core:** `merge{tier}`, `order_done{coins,stars}`, `level_up{lv}`, `energy_empty`, `hint_shown`
- **Meta:** `temple_open`, `temple_build_N`, `temple_tap`, `temple_reward`, `meadow_open`, `pond_open`, `pet_unlock`, `pet_feed`, `decor_buy`
- **Monetisation:** `ad_rewarded{id}`, `iap_demo{id}`, `offer_shown{id}`, `offer_buy{id}`, `piggy_break{g}`, `pass_tier{n}`, `pass_claim`, `pass_premium`, `sub_start`, `sub_daily`, `frag_pack`, `booster{k}`, `upgrade{k,lv,cost}`
- **Collection:** `frags{n,src}`, `pet_unlock{id,src}`
- **Retention:** `session_start` / `session_end` (playtime), `daily_claim{day}`, D1/D7 return computed from the active days

### KPI targets for a soft-launch test (casual merge benchmarks)

| Metric | Kill | Iterate | Go |
|---|---|---|---|
| Tutorial completion | < 70% | 70–85% | > 85% |
| D1 retention | < 30% | 30–38% | > 38% |
| D7 retention | < 8% | 8–14% | > 14% |
| Playtime D0 | < 12 min | 12–20 min | > 20 min |
| CPI (US, test creatives) | > $2.5 | $1.5–2.5 | < $1.5 |
| Early ROAS D7 | judged against CPI together with the LTV model; too early for one test | | |

### Diagnostic questions I would answer first from the data
1. **Where does the tutorial funnel break?** Look for the `tutorial_step_N` with the biggest drop.
2. **Does `energy_empty` happen in session 1?** If more than 60% of players hit it before `temple_build_1`, the first session is too tight.
3. **At what level do sessions get shorter?** This checks the model's prediction of a stall around level 10.
4. **Do players who build the spring (pets) retain better on D3?** If yes, the pet/food loop justifies its cost. If not, it is a cut candidate.

---

## 6. Hypotheses and A/B tests

| # | Hypothesis | Change (B) | Primary metric | Guardrail | Decision rule |
|---|---|---|---|---|---|
| 1 | Order tiers outgrow the star income, so the temple stalls after level 10 and players churn | Tier cap 6, stars = ⌈tier/2⌉ (§3) | D7 retention, `temple_build_N` reach by D3 | Coins/DAU (soft-currency inflation), IAP conversion | Ship B if D7 rises with p < 0.05 and IAP conversion does not drop by more than 10% relative |
| 2 | Showing the starter pack right after the first `energy_empty` converts better than only listing it in the shop | Pop-up offer on the first `energy_empty`, once | IAP conversion D3 | D1 retention (the pop-up must not hurt it) | Ship if conversion rises and D1 drops by less than 1 pp |
| 3 | Voiced narrative lifts early retention in a cozy merge game | A: voice on, B: text only | Tutorial completion, D1 | Session length | If the difference is under 1 pp, voice is not worth producing for future chapters |
| 4 | A triggered offer at the moment of need converts better than the same pack in the shop | Builder pack shown when stars are ready but coins are short | Payer conversion D7 | D1/D7 retention, sessions/DAU | Ship if conversion rises by 15% relative or more and retention drops by under 0.5 pp |
| 5 | The piggy bank is a cheaper first purchase than the starter pack | A: starter pack only, B: + piggy bank | Share of DAU who make a first purchase within D7 | ARPPU (the cheap item must not cannibalise bigger ones) | Ship if first purchases rise and ARPDAU does not fall |
| 6 | Shards keep the pet loop alive longer than whole-pet quest rewards | A: v1.8 (whole pets), B: shards | D3/D7 retention, `pet_feed`/DAU | Time to first pet (must stay under one session) | Ship if D7 rises and the first pet still arrives in session 1 |

Sample size: to detect +2 pp on D1 from a 35% baseline (α = 0.05, power 0.8) needs about 9k installs per arm. That is why test 1, the change with the biggest expected effect, goes first.

---

## 7. How it was built with AI

| Part | Me | AI | Tools |
|---|---|---|---|
| Concept, loop, economy, formulas, metrics, cut list | ✔ | discussion partner | Claude |
| Code: about 215 KB of JS/CSS, no engine, PWA/offline, 3 languages | spec, review, playtesting, bug reports | implementation, refactors, bug fixes | Claude Code (agents for sub-tasks) |
| Art: buildings, scenes, pets, food, items | art direction, prompts, choosing between variants, rejecting weak ones | generation; auto cut-out with scripts I specified | Pollinations (flux), Python/PIL pipeline in `art/_src/` |
| UI icons (29), SVG fallbacks | style brief | generated as code | Claude Code |
| Voice of Grandma Hoshi (11 lines) | casting (picked a designed voice out of the variants), script | voice design + TTS | ElevenLabs v3 |
| Localisation uk / ru / en | review | translation + i18n refactor | Claude Code subagent |

**Development flow.** Spec → AI build → play on the phone → write down what feels wrong → narrow it down to one change → AI fix → replay. Art goes through `generate N seeds → contact sheet → pick → auto-clean → in-game check`.

**What AI did badly and how I handled it.**
- Image models ignore "no base platform". I softened the plates with a mask in the engine instead of burning tokens on regeneration.
- Generated pieces drift in style between batches. I fixed one style prompt for all of them.
- The first build was feature-heavy and unpolished. The fix was not more features but a narrowing pass and a game-feel pass ([`feel.js`](../feel.js)).

---

## 8. What's next (if the test numbers come in)
1. Put the v1.0 order formulas behind a flag as the control arm and run A/B #1 on the v1.6 balance.
2. Chapter 2 only after D7 ≥ 12%. Until then, polish chapter 1 and the FTUE.
3. Replace placeholder monetisation with a real SDK: ads mediation + IAP.
4. Art pass: one consistent style bible, cleaner building sprites without plates.
