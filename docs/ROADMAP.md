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
   dates), plus I-81, Rt. 16, the New River, Wythe, and the Norfolk Southern line in Campbell and
   Pittsylvania, US 29 in Amherst, and Rt. 151 in Nelson. Every split the regulations use is now mapped.
3. **Missing land types:** military installations (DoD rules, PW exceptions), National Wildlife
   Refuges, Virginia National Guard lands, city-owned public hunting lands, DCR state park hunt
   lists (which parks open which dates).
4. **Sunday hunting & houses of worship** (no hunting within 200 yards) — informational note.
5. **Quota/managed hunts** — link out per property.
6. Offline/PWA support (hunters are often out of signal), and a "plan a trip" view: pick a place
   and see every legal day in the season as a calendar.

## Phase 2 — Bear (done)

- [x] 2026–27 seasons by county group, early SW firearms (except Clinch Mountain WMA), Eastern Shore
      (no firearms), Chesapeake/Suffolk/Virginia Beach, cities & towns, youth weekend.
- [x] Hounds: per-season dog status (Sundays, Nov 23–29 west of the Blue Ridge, Madison/Greene,
      firearms-season counties, WMAs, Cavalier, youth-weekend exceptions); partial-county rules show
      as "varies". New "Hounds" map view.
- [x] Hound training (chase) seasons in the details/timeline (never counted as open).
- [x] Map the I-81 / New River / Rt. 16 lines (and the Wythe hound area) so hound rules resolve exactly.

## Phase 3 — Turkey (done)

- [x] Fall archery, fall firearms by county group (incl. Hampton, Newport News, Suffolk; closed areas),
      youth fall & spring weekends, spring gobbler with the noon cutoff through Apr 25.
- [x] "Either sex / bearded" map view.
- [ ] Camp Peary geometry.

## Phase 4 — Elk (done)

- [x] Outside the Elk Management Zone, derived from the deer rules (any elk on any open deer day).
- [x] Inside the zone, the Oct 10–16 lottery hunt (shown as lottery/quota).

## Phase 5 — Small game and furbearers (done)

- [x] Big Game / Small Game / Furbearer picker with per-group species buttons.
- [x] Small game: squirrel (gray/red and fox, spring season), rabbit, grouse (west of I-95, mapped),
      quail (closed on public land west of the Blue Ridge), pheasant, crow (Mon/Wed/Fri/Sat),
      groundhog (continuous on private land).
- [x] Furbearers: bobcat (archery + firearms; no dogs during deer firearms season in listed counties
      and the National Forest), coyote and skunk (continuous except NF/DWR land), red and gray fox
      (closed counties, chase seasons), raccoon (chase seasons), opossum.
- [ ] Furbearer trapping seasons (https://dwr.virginia.gov/hunting/regulations/furbearertrapping/).
- [ ] Migratory game birds (dove, waterfowl, woodcock) — federal frameworks.

## Later ideas

- Bring in DWR's annual regulation PDF and diff it automatically each year to flag changed rules.
- "Why?" explanations: each status links to the exact rule/sentence it came from.
- Compare two dates or two places side by side.
