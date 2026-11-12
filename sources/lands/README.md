# Other public lands

These layers are used as public-land types `other_public` and `state_park`. Each `.geojson`
has a matching `.json` with hunting status, species, method, dates, URLs and sources. All
were researched on 2026-11-11, are in EPSG:4326, simplified at ~15 m and rounded to 5
decimals. The rules are in `src/regs/other-lands.ts` and `src/regs/state-parks.ts`.

| File | What | Source |
|---|---|---|
| army-corps | John H. Kerr Reservoir (Corps land, minus lake water, flowage easements, state parks and developed recreation areas) | DCR Conservation Lands + DWR management units |
| kerr-recreation-areas | 19 developed recreation areas at Kerr in Virginia (campgrounds, day-use areas, ramps, marinas, visitor centers), cut from army-corps; not read by the build | USACE Recreation Areas layer (researched 2026-11-12) |
| powrr | CF Highlands Breaks, Dante, Vansant; TNC Big Caney; no-hunting and elk-restoration zones | DWR POWRR property pages and maps |
| pals | Coalfields PALS; James City County PALS (Jolly Pond) | DWR public lands / PALS rules |
| dof-lands | New Kent Forestry Center (quota hunts only) | DWR quota hunts |
| local-hunting | Lone Star Lakes (Suffolk), Dutch Gap (Chesterfield), Franklin city archery area | DWR quota hunts; City of Franklin |
| natural-area-preserves | 69 DCR Natural Area Preserves (closed except lottery hunts at Crow's Nest, Dameron Marsh, Hughlett Point) | DCR Conservation Lands (MATYPE State Natural Area Preserve) |
| state-parks | Widewater State Park and Falkland State Conservation Area (missing from the main build) | DCR Conservation Lands |
| state-parks.json | 2026-27 hunting status of every state park (22 closed) and differences from the app | DCR state park hunting page and 2026-27 hunt chart |
| national-guard.json | No public hunting found on Virginia National Guard land other than Fort Pickett | — |

## Known doubts
- **Franklin:** the city archery area is sketched by hand from the city's map.
- **Kerr recreation areas:** boundaries are USACE's (2022 layer). Buffalo Park's polygon is
  labelled "Wildlife Areas (Gated)" in that layer. The Willow Grove Marina polygon (212 ac) also
  names Rochichi Wildlife Management Area and may cut out huntable woods. Liberty Hill, Island
  Creek, Staunton View and Clover overlap DWR WMU polygons.
- **Out-of-date rule sheets:**
  - The Coalfields PALS rules are the 2023-24 sheet.
  - Crow's Nest's rules print "2025" dates.
- **Unconfirmed:** whether hunting is allowed in The Channels preserve, which lies inside The
  Channels State Forest.
- **Not mapped:**
  - Fairfax County's archer program (approved archers only).
  - Banshee Reeks (unconfirmed).
  - DWR Wildlife Conservation Sites (not checked).
  - Kerr areas with no boundary found: group camps on Corps land (Camp Jean Short, Presbyterian
    Point), Hyco and Buffalo Access ramps, and the picnic area by the dam outside Tailrace Park.
