# Kitsune Merge — hybrid-casual merge prototype

Mobile web game (HTML5, works offline in phone browser). Built with Claude Code.

**Design pack:** [docs/DESIGN.md](docs/DESIGN.md): one-pager, core loop, economy model (with [tools/economy_sim.py](tools/economy_sim.py)), FTUE, metrics, A/B plan, AI workflow.

## Core loop
Summon (energy) → merge identical items up to 10 tiers → fill orders for coins + XP → coins buy upgrades → level up unlocks harder, richer orders.

## Systems (5 features)
1. **Merge board + orders** — core loop, drag or tap-tap to merge.
2. **Energy economy** — cap, regen timer, out-of-energy offer (ad / gems).
3. **Meta progression** — XP levels, coin upgrades with exponential cost curves.
4. **Monetisation** — rewarded ad stub (daily cap), gem boosters, IAP packs incl. one-time starter pack (demo, no payments).
5. **Retention + analytics** — 7-day daily reward streak; local event log with sessions, playtime, D1/D7 return, merges, orders, ad views, IAP.

All balance values live in one `CFG` object, mirrored in `balance.csv`.

## Hypotheses and metrics
- Orders that ask for 1 item early, 3 items from level 6, keep the first session > 5 min → playtime, level reached in session 1.
- Starter pack shown only in the shop converts better after first energy-empty → `energy_empty` → `iap_demo` funnel.
- Daily streak with gems on day 3/6/7 lifts D1 and D7 return.

## Who did what
- **Me:** concept, core loop, economy and formulas, balance table, metrics and hypotheses, testing, decisions.
- **AI (Claude Code):** code from my spec, bug-fix passes, layout.
- **Time:** ~__ h. Flow: spec → AI build → playtest on phone → tune CFG → repeat.

## v2 (after playtest feedback: "want to choose theme, more interaction")
- 4 themes (palette + item set + hero): Fox Shrine, Sakura, Deep Sea, Night Forest; `theme` event tracked.
- Juice: particles, combo chain with coin bonus, screen shake on high tiers, coin fly-to-counter, haptics, procedural WebAudio SFX.
- Chests drop from tier 5+ merges (tap to open).
- Story tutorial with narrator Hoshi + story chapters on levels 3/5/8/10; voiced lines via ElevenLabs (`voice/`), text fallback.

## v1.0 (release candidate)
Files: `index.html` (shell), `style.css`, `temple.css`, `pets.css`, `game.js` (core, temple), `pets.js` (pets, story/weekly quests), `manifest.json` + `sw.js` (PWA, offline), `icons/`.
Run locally over http (service worker and file loading need it): `python -m http.server 8765`.

- **Meta: temple restoration** — a living full-screen scene, 8 buildings bought with stars (from orders) + coins; each one is a story beat from Grandma Hoshi. Built objects are interactive with cooldowns in `CFG.temple`: bell (sound + waves → coins), lanterns (tap cascade → energy), sacred tree (shakes, drops items to the board + food), koi pond (ripple/jump → coins/gem/food), fire altar (offer a board item → ×2 order coins for N min), wandering spirits drop coins/chests, Grandma says context lines (progress, time of day). Real-time day/night sky. Build animation with dust, glow and shock-wave.
- **Pets collection** — 6 foxes (active team 1–3, slots grow with the temple) and 6 koi (live in the pond, slots grow with buildings), 4 rarities, each with a passive. Food (6 kinds, favourites ×2) from orders/chests/tree/pond; satiety decays slowly, hungry pet just loses its bonus; friendship levels 1–5 scale the passive. Drag food onto a pet in the temple or feed from its card. Cosmetic skins (quests / 30 gems). Album screen.
- **Quests** — 13-step story chain (unlocks pets), 2 weekly quests (pet / skin / food), 3 daily quests + all-done chest.
- **Generator on the board** (tap the fox tile; items fly to the nearest free cell) + summon button.
- **FTUE** — voiced story tutorial, then soft idle hints (pair wobble after 5 s).
- **Splash/loading screen**, pause/settings, custom confirm dialogs.
- **PWA** — manifest, offline cache, iOS meta, fullscreen, safe-area insets; icons generated.
- **Analytics** — `tutorial_step_N`, `first_order`, `first_upgrade`, `temple_build_N`, `temple_tap`, `temple_reward`, `offering`, `spirit_pickup`, `quest_done{kind}`, `pet_unlock`, `pet_feed`, `pet_levelup`, `skin_equip`, `hint_shown`, … ; JSON export from the stats screen.
- **Balance** — energy 40 / 30 s regen, +15 energy per level, upgrades start at 120 coins (first one ≈ minute 3), combo bonus capped; first-30-minute model in `balance.csv`.
- Art contract: `art/<theme>/<n>.svg`, `art/bg/<theme>.svg`, `art/hoshi(_talk).svg`, `art/ui/*.svg`, `art/pets/<id>.svg`, `art/food/<id>.svg` — emoji fallback for anything missing. Missing pet/food art listed in `art/НУЖЕН_АРТ.md`.
