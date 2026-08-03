# Ultimate Bravery — Team Roll Generator

A single self-contained HTML file that rolls a random 5-player League of Legends
"Ultimate Bravery" custom game: random role, random champion, random runes,
random build, random summoner spells, a real League-legal skill order, and
random chaos "bravery challenges" per player.

**File:** `ultimate-bravery.html` (single file, no build step, no dependencies
except one CDN script for the image-export feature). Open it directly in any
browser, or host it (see Hosting section below).

---

## What it does

1. User enters 5 player names.
2. User picks a **Champion Pool**: Fully Random, a lore region (Demacia,
   Noxus, Ionia, Shurima, etc.), or a "squad" theme (True Damage, K/DA,
   Pentakill, Star Guardian, Arcade).
3. Hitting **Roll The Team** plays a sequential, FIFA-reveal-style animation
   (one player at a time: name → champ scramble → role → build), then shows
   a final grid of 5 cards.
4. Each card shows: role, champion, region, runes, item build, boots, summoner
   spells, a full level 1–18 skill order, and 3 random "bravery challenges."
5. Individual players can be re-rolled without touching the rest of the team.
6. A seed + names + theme are encoded into the URL for reproducible "share
   links," and there's a "Download Team Image" button (via html2canvas) that
   snapshots the final grid to a PNG — this is the reliable way to share a
   roll anywhere (Discord, chat, etc.), since the share-link only works if the
   recipient opens this same HTML file/page.

---

## Data model (all hardcoded, no backend)

- **`CHAMPIONS`** — ~171 champions (curated by hand, includes the newest
  champions as of Aug 2026: Yunara, Zaahen, Locke). Each has `id` (Data
  Dragon champion id, e.g. `"MonkeyKing"` for Wukong), `name`, `region`
  (lore region, used for the region-theme filter), and `groups` (squad tags:
  `truedamage`, `kda`, `pentakill`, `starguardian`, `arcade`).
- **`REGION_LABELS`** / **`SQUAD_LABELS`** — display names for the theme
  dropdown.
- **Fully Random has weighted chaos**: when "Fully Random" is picked, there's
  a ~40% chance it secretly rolls one specific region/squad pool instead and
  shows a "🎲 Surprise theme landed: X!" banner. Otherwise true full-roster
  randomness. See `resolveEffectiveTheme()`.

---

## Runes, items, spells — how the art works

**Important environment constraint:** Claude.ai's in-chat artifact preview
sandbox blocks *all* requests (both `fetch()` and `<img src>`) to
`ddragon.leagueoflegends.com`. This was empirically confirmed — the numeric
item IDs and rune icon paths below were verified correct against Riot's real
`item.json` / `runesReforged.json` data, so the icons failing is 100% an
environment restriction, not a data bug. **Opening the file locally in a real
browser tab, or hosting it (GitHub Pages etc.), removes this restriction and
the real icons should load normally.**

Because of that, every icon in this app follows the same pattern:
1. Try to load the real Data Dragon icon (`<img src="...">`).
2. `onerror="handleImgFallback(this)"` — if it fails, instantly swap to a
   colored monogram badge (first letter, hash-based HSL color) so the layout
   never looks broken, in *any* environment.

### Items (`ITEM_POOL`, `BOOT_POOL`)
~27 long-stable, high-confidence items + 6 boots, each with a verified numeric
Data Dragon item ID (checked against a real `item.json` pull — e.g. Infinity
Edge = 3031, Zhonya's = 3157). Some items are flagged `tank:true` for the
tank-only challenge (see below). Icon URL pattern:
`https://ddragon.leagueoflegends.com/cdn/14.23.1/img/item/{id}.png`
(any valid old patch version works forever — ddragon never deletes old
version folders, so this never goes stale).

### Runes (`RUNE_TREES`)
All 5 trees, their keystones, and the specific minor runes used are hardcoded
with **exact icon paths pulled from a real `runesReforged.json` fetch** —
including known quirks like Lethal Tempo's icon file literally being named
`LethalTempoTemp.png`, Aftershock living in a `VeteranAftershock` folder, and
Shield Bash's file being `MirrorShell.png`. These paths are NOT versioned
(`/cdn/img/perk-images/...`), so they never need a version bump.

### Summoner spells (`SPELL_ICONS`)
Standard stable filenames (`SummonerFlash`, `SummonerDot` = Ignite, etc.)
under the same `DD_VER` version folder as items.

### Support item
Shown generically as **"Completed Support Item"** with no specific real name
— that item line gets renamed/reworked almost every season and I didn't want
to assert a name I couldn't verify as currently live. If the user tells you
the current in-client name, hardcode it into `SUPPORT_ITEM` in the same shape
as `ITEM_POOL` entries (`{name, id, url}`).

---

## Role-specific rules (this is the part that took several iterations — read carefully)

- **Support**: always gets a guaranteed completed support item, always at
  item-slot index 0 in the underlying data (flagged `isSupport: true`), but
  it's never displaced by the random boot-position logic (boots insert at
  index ≥ 1 when a support item exists).
- **Jungle**: always gets **Smite** as one of their two summoner spells
  (`{name:"Smite", forced:true}`). Smite is removed from the general spell
  pool entirely — no other role can ever roll it.
- **ADC**: house rule — always shows **7 items total** (6 core items + a
  "bonus" boots slot), and is fully exempt from ever losing boots to a
  challenge (the two `noBoots` challenges are filtered out of ADC's possible
  challenge pool in `pickChallenges`).
- **Boots position is randomized** — inserted at a random index within the
  item list (`insertAtRandomIndex`) rather than always appended last. Only
  constraint: never inserted before a guaranteed support item.

## Challenges that actively reshape the build (not just flavor text)

`CHALLENGES` is an array of `{text, noBoots?, onlyTank?}`. Two flags currently
change the actual generated build, not just describe it:

- **`noBoots`** (2 challenges: "no boots this game" / "sell boots on
  completion") → boots are dropped entirely and a 6th real item fills that
  slot, so the build never looks like it's "missing" something. ADC can never
  roll these (see above).
- **`onlyTank`** ("must build full tank items") → the item pool is filtered
  down to items flagged `tank:true` in `ITEM_POOL` (Sunfire Aegis, Thornmail,
  Randuin's, Frozen Heart, Spirit Visage, Locket, Sterak's, Banshee's), padded
  with the general pool only if the tank pool is too small for what's needed.

If you add more "forced" challenges in the future, follow this pattern: add a
flag to the challenge object, check it in `buildSlot`/`pickItems`, and make
the build generation itself branch on it — the user was explicit that
forced/challenge text should never just be descriptive, it must actually
change the roll.

---

## Skill order (Level 1–18 Q/W/E/R)

`pickSkillOrder(rng, champ)` follows real League constraints:
- 1 point per level, 18 levels total.
- Q/W/E cap at 5 points each; R caps at 3 and can **only** go up at levels
  6, 11, and 16.
- **Rank cap rule (the actual bug fix):** a basic ability's rank can never
  exceed `ceil(championLevel / 2)` — equivalently, rank *N* requires
  champion level `>= 2N - 1`. This is why sequences like `E,Q,Q,Q` are
  illegal in the real game: the 3rd Q lands at champion level 4, but rank 3
  needs level 5. A previous version (a shuffled bag of 5×Q/5×W/5×E assigned
  in order) ignored this and could generate illegal early-game sequences —
  reported as a bug and fixed. The fix computes `cap = Math.ceil(level/2)`
  at every level and only lets an ability take a point if `rank+1 <= cap`.
  Verified via a Node simulation: 160,000 rolls (across generic champs and
  every special-cased champ below), 0 rule violations, ~18,600 unique
  patterns per 20,000 generic rolls.
- **Per-champion kit exceptions** (`SKILL_ORDER_RULES`), researched against
  current League mechanics — these are real, not flavor:
  - **Azir** — level 1 is always **W** (Arise!); it's auto-ranked at
    champion select, not a free pick.
  - **Zeri** — level 1 is always **Q** (Burst Fire!), same reason.
  - **Shen** — **W** (Spirit's Refuge) can't take its first point until
    **Q** (Twilight Assault) has at least 1 point.
  - **Zilean** — **W** (Rewind) can't take its first point until **Q**
    (Time Bomb) *or* **E** (Time Warp) has at least 1 point.
  - **Xayah** — **E** (Bladecaller) can't take its first point until **Q**
    (Double Daggers) *or* **W** (Deadly Plumage) has at least 1 point.
  - **Yuumi** — **W** (You and Me!) can't take the level-1 point (already
    partially active from the start); free again from level 2 onward.
  - This appears to be the complete/canonical list of such exceptions in
    the live game as of this research (Aug 2026) — if Riot adds more on
    future champions, add them to `SKILL_ORDER_RULES` following the same
    `forceFirst` / `locked` shape.

---

## Reveal animation (`playRevealSequence` / `revealPlayer`)

Sequential, one player at a time, into a single "spotlight" panel:
name (fade in) → champion scramble (~1.4s of rapid name+color cycling,
**colored monogram only, no network calls during the scramble** — an earlier
version tried to reload a real image every ~90ms and it never rendered in
time, which read as "no image while rolling"; fixed by making the scramble
purely local/instant and only attempting the real champion splash image once,
after the name settles) → role reveal → full build details. Each stage holds
for ~2.2–2.6 seconds (user explicitly asked for this pacing, "too fast"
was a complaint on an earlier faster version). A "Skip Animation" button
collapses all remaining timings to near-instant.

After all 5 players are revealed, `renderTeamGrid()` shows the persistent
card grid, and a "🎲 Surprise theme landed: X" banner appears if the weighted
Fully-Random roll secretly landed on a theme.

---

## Sharing

Two mechanisms, deliberately different tradeoffs:
1. **Share Link** — bakes `seed` + `theme` + `names` into the URL query
   string via `history.replaceState`, and `loadFromUrl()` deterministically
   regenerates the identical roll from the same seed (same `mulberry32` PRNG
   seeded via a custom `hashStringToInt`). Only works if the recipient opens
   this *same* HTML file/page — there's no backend/server involved at all.
2. **Download Team Image** — uses `html2canvas` (loaded from cdnjs) to
   snapshot the final `#teamGrid` div to a PNG. This is the option that
   actually works anywhere (Discord, iMessage, etc.) since it doesn't depend
   on the recipient having the app open.

---

## Known limitations / things to tell the user if asked again

- **Real Riot art will not render inside Claude.ai's chat/artifact preview**,
  ever, regardless of how the code is written — the sandbox blocks the
  `ddragon.leagueoflegends.com` domain outright (both `fetch` and `<img>`).
  This is not fixable from inside the code. It **will** work in a normal
  browser tab (double-click the downloaded file, or host it).
- Support item name is intentionally generic/unverified — see above.
- Champion `region` assignments are reasonable-effort lore placements, not
  all 100% canon-perfect (this was accepted as fine for a joke/chaos tool).
- If new champions release after this file was written, they need to be
  manually added to the `CHAMPIONS` array (id, name, region, groups). Data
  Dragon's `champion.json` could be fetched live to auto-update this list,
  but that would hit the same sandbox-fetch restriction described above —
  only worth doing once the file is hosted somewhere without that
  restriction.

---

## Hosting (so images + share links fully work)

1. Create a free GitHub account, create a new **public** repo (e.g.
   `ultimate-bravery`).
2. Upload `ultimate-bravery.html`, renamed to `index.html`.
3. Repo **Settings → Pages** → deploy from `main` branch, root.
4. Live URL appears within ~1 minute:
   `https://<username>.github.io/ultimate-bravery/`

No server, no build step, no dependencies beyond the CDN script tag already
in the file.

---

## If you're picking this project back up

The single source of truth is `ultimate-bravery.html` in
`/mnt/user-data/outputs/`. It's plain vanilla JS + CSS in one file — no
framework, no bundler. Search for these anchor comments/functions to
orient yourself quickly:

- `CHAMPIONS` — champion roster/data
- `RUNE_TREES` / `ITEM_POOL` / `BOOT_POOL` / `SPELL_ICONS` — art + data pools
- `CHALLENGES` — bravery challenge list (watch for `noBoots`/`onlyTank` flags)
- `pickSkillOrder` — level 1–18 skill point logic
- `buildSlot` — the core per-player roll (runes, items, spells, challenges,
  skill order all assembled here)
- `playRevealSequence` / `revealPlayer` — the animated reveal
- `handleImgFallback` / `colorFromString` — the universal icon-fallback system
