# Other public lands

These layers are used as public-land types `other_public` and `state_park`. Each `.geojson`
has a matching `.json` with hunting status, species, method, dates, URLs and sources. All
were researched on 2026-11-11 (banshee-reeks, fairfax-deer-program, dwr-wcs and The Channels
on 2026-11-12), are in EPSG:4326, simplified at ~15 m and rounded to 5 decimals. The rules
are in `src/regs/other-lands.ts` and `src/regs/state-parks.ts`.

| File | What | Source |
|---|---|---|
| army-corps | John H. Kerr Reservoir (Corps land, minus lake water, flowage easements, state parks and developed recreation areas) | DCR Conservation Lands + DWR management units |
| kerr-recreation-areas | 19 developed recreation areas at Kerr in Virginia (campgrounds, day-use areas, ramps, marinas, visitor centers), cut from army-corps and mapped as closed land ("<name> (Kerr Reservoir recreation area)") | USACE Recreation Areas layer (researched 2026-11-12) |
| powrr | CF Highlands Breaks, Dante, Vansant; TNC Big Caney; no-hunting and elk-restoration zones | DWR POWRR property pages and maps |
| pals | Coalfields PALS; James City County PALS (Jolly Pond) | DWR public lands / PALS rules |
| dof-lands | New Kent Forestry Center (quota hunts only) | DWR quota hunts |
| local-hunting | Lone Star Lakes (Suffolk), Dutch Gap (Chesterfield), Franklin city archery area | DWR quota hunts; City of Franklin |
| banshee-reeks | Banshee Reeks Nature Preserve (Loudoun County lottery deer hunts only) | Loudoun PRCS 2026 Fall Activity Guide; DCR Conservation Lands |
| fairfax-deer-program | Fairfax County deer management areas: 118 archery-program areas (approved archers only, deer), plus sharpshooter-only and no-hunting areas (closed) | Fairfax County archery program page; county FCPA/DeerManagement layer |
| dwr-wcs | DWR Wildlife Conservation Sites: Jones Cove (Mockhorn Island WMA), Goochland Marsh (Powhatan WMA tract), Weston (chase only, closed) | DWR WMA boundaries and huntable-lands layers, WMA list, WMA pages |
| natural-area-preserves | 69 DCR Natural Area Preserves (closed except lottery hunts at Crow's Nest, Dameron Marsh, Hughlett Point; The Channels is "check") | DCR Conservation Lands (MATYPE State Natural Area Preserve) |
| state-parks | Widewater State Park and Falkland State Conservation Area (missing from the main build) | DCR Conservation Lands |
| state-parks.json | 2026-27 hunting status of every state park (22 closed) and differences from the app | DCR state park hunting page and 2026-27 hunt chart |
| national-guard.json | No public hunting found on Virginia National Guard land other than Fort Pickett | — |

**Wildlife Conservation Sites (WCS)** are a DWR property class (`Property_Type = 'WCS'` in DWR's
WMA boundaries layer): 15 small DWR holdings that are not WMAs. They are not DCR's
"Conservation Sites" (biodiversity planning units, not land holdings). Lake Robertson was already
mapped as a WMA; Bear Garden is hunted as part of Cavalier WMA ("Cavalier WMA/Bear Garden WCS" in
DWR's WMA list) and is now added to Cavalier WMA in `scripts/build-geo.sh`; Jones Cove, Goochland
Marsh and Weston are in dwr-wcs. The other ten are listed in dwr-wcs.json and not mapped.

## Known doubts
- **Franklin:** the city archery area is sketched by hand from the city's map.
- **Kerr recreation areas:** boundaries are USACE's (2022 layer). Buffalo Park's polygon is
  labelled "Wildlife Areas (Gated)" in that layer. The Willow Grove Marina polygon (212 ac) also
  names Rochichi Wildlife Management Area and may cut out huntable woods. Liberty Hill, Island
  Creek, Staunton View and Clover overlap DWR WMU polygons.
- **Out-of-date rule sheets:**
  - The Coalfields PALS rules are the 2023-24 sheet.
  - Crow's Nest's rules print "2025" dates.
- **The Channels preserve** is shown as "check": it is owned and managed by DOF inside The
  Channels State Forest, and DOF's hunting map marks no closure there, but no source says outright
  that the preserve is open to hunting (DCR's no-hunting rule covers preserves DCR manages).
- **Fairfax County program:**
  - The county layer has no season field. Its clusters match the 2026-27 park list, but
    individual park boundaries could still differ from what archers are assigned.
  - Seasons there come from the state (private-land) rules shown as "check", including firearms
    seasons, though the program is archery only (the note says so).
  - Overlaps where the smaller polygon wins: Elklick Woodlands NAP (99% inside the "Elklick 1"
    archery area) stays closed; Langley Oaks overlaps the George Washington Memorial Parkway (NPS)
    and Poplar Ford overlaps Manassas National Battlefield Park's boundary.
- **Banshee Reeks:** weapons for the lottery hunts aren't stated; DWR's workshop text still has
  2023 dates.
- **WCS:** that Jones Cove is Mockhorn's GATR Tract is inferred, not stated; Goochland Marsh has
  no published rules (DWR's huntable-lands layer is the only source); Bear Garden is not named on
  DWR's Cavalier page. Ten other WCSs (see dwr-wcs.json) are unconfirmed and not mapped.
- **Lawnes Creek** (DWR lists "Hog Island WMA/Lawnes Creek WCS") is a WMA feature in DWR's layer
  and is mapped as its own "Lawnes Creek WMA", so Hog Island WMA rules keyed by name don't reach it.
- **Not mapped:** Kerr areas with no boundary found: group camps on Corps land (Camp Jean Short,
  Presbyterian Point), Hyco and Buffalo Access ramps, and the picnic area by the dam outside
  Tailrace Park.
