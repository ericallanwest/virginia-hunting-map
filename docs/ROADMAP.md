# Roadmap

## Phase 1 — Deer (done: first working version)

- [x] 2026–27 deer regulations encoded as rules: archery, urban archery, NOVA late archery,
      muzzleloader (with either-sex day groups), private-land firearms groups, city/town firearms,
      antlerless-only firearms, youth weekend, and the National Forest / state forest / state park /
      Army Corps / WMA tables.
- [x] Place facts: bag limits (incl. unlimited-daily and 1-per-day public-land exceptions),
      Earn-a-Buck, antler point restriction, bonus permits, dogs, local firearm ordinances.
- [x] Map coloured by status for any date; two views ("open weapon", "antlered/antlerless").
- [x] Public lands split by county so each piece gets its own rules; NPS land shown closed.
- [x] Rockingham (Rts. 613/731) and Suffolk (Dismal Swamp line) split along the real roads.
- [x] Search counties/cities/towns/public lands locally, addresses via Nominatim; "use my location".
- [x] Date picker + license-year slider; shareable URLs (`?date=…&at=lat,lng&view=…`).
- [x] Season timeline per location.

### Phase 1 follow-ups (most valuable first)

1. **Verify the encoding against the regulations.** Walk through docs/OPEN-QUESTIONS.md, ideally
   with DWR. Add a scenario test for each answer.
2. ~~Real geometry for split lines~~ — done for Rockingham and Suffolk (the two that change season
   dates). Amherst, Campbell, Pittsylvania, and Nelson splits (EAB/dog rules only) still ask the user.
3. **Missing land types:** military installations (DoD rules, PW exceptions), National Wildlife
   Refuges, Virginia National Guard lands, city-owned public hunting lands, DCR state park hunt
   lists (which parks open which dates).
4. **Sunday hunting & houses of worship** (no hunting within 200 yards) — informational note.
5. **Quota/managed hunts** — link out per property.
6. Offline/PWA support (hunters are often out of signal), and a "plan a trip" view: pick a place
   and see every legal day in the season as a calendar.

## Phase 2 — Bear

Bear seasons follow a similar structure (archery, muzzleloader, firearms with hound/non-hound
variants, county groups, youth weekend). Expected new needs:
- Season "modes" (with or without dogs) as a dimension alongside weapon.
- Bear-specific bag limits and "bear hound training season".
- Add `src/regs/bear-2026.ts`; enable in `src/regs/index.ts`.

## Phase 3 — Turkey

- Fall turkey (county-specific, some closed) and spring gobbler (statewide, different hours).
- New concept: legal hunting hours differ (spring: until 1 p.m. early in the season).
- License year spans two seasons (fall + spring) — the slider already covers Jul–Jun.

## Phase 4 — Elk

- Limited-entry (lottery) hunt in the elk zone (Buchanan, Dickenson, Wise) plus elk taken
  incidentally during deer seasons elsewhere. Mostly a zone map + dates.

## Later ideas

- Bring in DWR's annual regulation PDF and diff it automatically each year to flag changed rules.
- "Why?" explanations: each status links to the exact rule/sentence it came from.
- Compare two dates or two places side by side.
