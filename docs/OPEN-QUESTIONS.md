# Open questions about the regulations (2026–27)

Places where the published text is ambiguous, or where the app had to make an assumption. Each is
encoded with the literal reading noted. Resolve these (ideally with DWR), then add a scenario test.

1. **Late muzzleloader, cities and towns east of the Blue Ridge.** The either-sex list includes
   "all cities and towns that allow muzzleloader hunting", but the late muzzleloader *season*
   list east of the Blue Ridge does not include them. *Encoded:* no separate late-muzzleloader
   season. In practice their Nov 14 – Jan 2 firearms season covers the same dates, so the map is
   unaffected.

2. **Early muzzleloader, cities/towns and unlisted public land west of the Blue Ridge.** The
   either-sex lists name private lands in specific counties plus a few properties; independent
   cities west (e.g. Staunton, Winchester) and unlisted state parks are not named. *Encoded:*
   antlered only.

3. **"No late archery/late muzzleloader on private lands in Carroll, Frederick, …".** Does this
   cover independent cities inside those counties (Galax, Winchester, Radford, Salem, Roanoke)?
   *Encoded:* no — those cities fall under "all areas west of the Blue Ridge" and get the season.

4. **Towns inside restrictive counties.** The "any city or town that allows firearms deer hunting:
   Nov 14 – Jan 2, either sex full season" rule, read literally, gives a town in Buchanan County
   (antlered only) a full either-sex season. *Encoded:* literally (both rules apply).

5. **Independent city ↔ county.** Rules phrased "counties (including the cities and towns within)"
   need to know which county each city is in. Assignments are in `src/regs/virginia.ts`
   (`CITY_PARENT`); the ones that matter are the NOVA cities (Alexandria, Fairfax, Falls Church,
   Manassas, Manassas Park), Covington, Norton, Bristol, Buena Vista, Lexington.

6. **National Forest land inside cities** (Buena Vista, Norton, Waynesboro) — *encoded:* uses the
   surrounding county's row in the National Forest table.

7. **Dates without years.** The web page lists most dates without a year. *Encoded:* Jul–Dec →
   2026, Jan–Jun → 2027 (explicit years on the page agree).

8. **Unlisted public lands.** The page says public lands not in its tables follow private-land
   seasons, except DWR properties (refer to posted rules). *Encoded:* state forests, Army Corps,
   and National Forest not in the table → private-land seasons; unlisted WMAs → "check posted
   rules" for firearms; state parks other than those named → "check" for everything (most parks
   are closed or special-hunt only).

9. **Department of Defense lands** are mapped (src/regs/military.ts): the five bases DWR lists with hunting
   programs show their own 2026-27 seasons where encoded (src/regs/military-2026.ts: Quantico, A.P. Hill,
   Pickett, Belvoir), otherwise the state framework as "check posted rules"; other DoD land is closed.
   Open points:
   - A.P. Hill's Controlled Access Area either-sex days are only in a note.
   - Species the bases say "follow the state" keep the state framework, so base day closures and
     Belvoir's archery-only rule show only in the note.
   - Quantico's bulletin is a scan.
   - Fauquier fox open on Quantico is shown as text.
   - Camp Peary's longer fall turkey season isn't encoded (no public access).
   **Refuges** (src/regs/refuges.ts) and **other public land** (src/regs/other-lands.ts, state-parks.ts)
   have their doubts in sources/refuges/README.md and sources/lands/README.md.

10. **Name matching.** DCR's layer names some state forests without "State Forest" ("Cumberland",
    "Big Woods", "The Channels", "Prince Edward-Gallion"); these are assumed to be the forests in
    DWR's table. "Thompson WMA" = G. Richard Thompson WMA; "Turkeycock Mountain WMA" = Turkeycock.

11. **Split lines.** Rockingham (Rts. 613/731) and Suffolk (Dismal Swamp line, 4VAC15-20-40) are
    split in the map data from Census TIGER roads (`scripts/split-jurisdictions.py`). In Suffolk, the
    stretch "through the corporate limits of the City of Suffolk" between Route 10 and White Marsh
    Road is approximated by a straight segment downtown. Campbell and Pittsylvania are split along the
    Norfolk Southern main line (Lynchburg–Altavista–Chatham–Danville), traced from Census TIGER rails
    as the shortest path through NS track between Lynchburg and Danville. Other NS lines in those
    counties run east–west, so "west of the Norfolk Southern Railroad" is read as the main line.
    Amherst is split along US 29 and Nelson along State Rt. 151. **"Rt. 29" in Amherst is read as
    today's US 29 (the bypass east of Amherst town and Madison Heights)**, not Business 29 (the old
    route through them). If DWR means Business 29, the strip between the two roads, including
    Madison Heights, would move to the east side.

12. **NPS land.** Shown closed. Assateague Island National Seashore and Appalachian Trail corridor
    lands are excluded from the layer because hunting rules there vary.

## Bear

13. **Cities and towns.** "Any lawful weapon … within the incorporated limits of any town or city that
    allows bear hunting from October 3 through January 2." Read literally, a town inside a county
    with a shorter season (e.g. a town in Rockingham, where archery opens Oct 17) gets Oct 3 – Jan 2.
    *Encoded:* literally.

14. **Hound restrictions for part of a county** are mapped (`scripts/split-jurisdictions.py`) from
    Census TIGER roads and rivers: I-81 (Montgomery, Pulaski, Roanoke, Washington, Smyth), State Rt. 16
    (Grayson, Smyth), the New River (Carroll, Grayson), and the Wythe area bounded by Rt. 21, I-81,
    the county line, the New River, and Cripple Creek, plus land southeast of the river. Assumptions:
    - Where the New River widens, TIGER has no centerline; those gaps are bridged with straight
      segments, and Cripple Creek is joined to the river at its mouth.
    - **Grayson "east of the New River"** is taken as the river's east/south bank, which includes the
      strip between the river and the North Carolina line west of where the river turns north.
      If DWR means only the area east of the northward stretch (toward Galax), that strip should
      flip sides.

15. **"Counties west of the Blue Ridge"** (no hounds Nov 23–29). *Encoded:* the 31 western counties
    and the towns in them; independent cities in the west are not included.

16. **Hound training seasons that exclude Sundays** (Nov 30 – Dec 19). The timeline shows the full
    range; the exclusion is in the note.

## Turkey

17. **Independent cities not named in any fall group** (e.g. Richmond, Lynchburg, Roanoke,
    Charlottesville). *Encoded:* no fall firearms season; fall archery open (archery is "statewide
    except where there is a closed firearm season", and only Arlington, Chesapeake, Norfolk,
    Portsmouth, and Virginia Beach are named as closed).

18. **Camp Peary** (York County) has the longer fall season but isn't mapped; noted in York's facts.

## Elk

19. **Norton.** The Elk Management Zone is "Buchanan, Dickenson, and Wise counties"; the independent
    city of Norton (inside Wise) is treated as outside the zone. *Encoded:* literally.

## Local ordinances

The text of all 101 DWR local ordinance pages is in `src/regs/local-ordinances.json` and shown in the
location panel. Only the hand-reviewed entries in `src/regs/local-effects.ts` change the map. Readings
to confirm:

20. **Muzzleloaders count as firearms**, so "no firearm discharge" (Arlington and ~25 cities/towns) makes
    muzzleloader and firearms seasons archery-only there.
21. **Rifles "larger than .22" + the state .23-caliber minimum** = no legal rifle for deer, bear, or elk
    (Charles City, Southampton, Virginia Beach, Caroline [bear/elk], York, Poquoson, Prince William,
    King and Queen, Franklin city, Fairfax County). Turkey can still be hunted with a .22.
22. **Virginia Beach Sec. 38-3(c)** bans firearms "greater than .22-caliber" citywide. Read literally that
    includes shotguns; it is read as rifles/pistols because 38-3(a) expressly allows shotguns.
23. **Fairfax County 6-1-2(e)**: nothing larger than .224 caliber, and no slugs; firearm deer hunting only
    with buckshot on Appendix J exempted parcels. Shown as "firearms, no rifles"; muzzleloader seasons
    show as archery-only.
24. **Buchanan County Sec. 22-28** bans killing elk with any weapon, which conflicts with DWR's lottery
    elk hunt in the county. Shown as a warning, not applied.
25. **County ordinances are applied inside towns** in that county (plus any town ordinance).
26. **Not applied (partial or conditional):** zoning-district or subdivision bans (Albemarle, Henrico,
    Stafford, Gloucester, Warren, James City, Essex, Greene, Mecklenburg, Prince William restricted
    areas), area bans (Chesapeake north, Virginia Beach north of the trace line, eastern Loudoun),
    elevated-stand rifle rules (Caroline, Essex, Richmond County, Lancaster, Northumberland, Sussex,
    Cumberland, King George, Goochland, Dinwiddie, Hanover, Isle of Wight, Buckingham, Westmoreland,
    James City, Prince George, Surry), setbacks, and permit-only exceptions. All are listed with their
    text in the location panel.
27. **Inferred, not stated:** Lancaster and Northumberland rifle bans for bear (their ordinances list
    only the uses rifles are allowed for). Southampton bans muzzleloading *rifles*; muzzleloading
    shotguns remain, so its muzzleloader season is not closed.

## Small game and furbearers

28. **I-95 for grouse.** Mapped as one continuous route from the Woodrow Wilson Bridge to North
    Carolina, so in Fairfax and Alexandria the line follows the Capital Beltway (I-95/I-495); "west" there
    is the north/west side of the Beltway. Jurisdictions entirely west of I-95 are generated by
    `scripts/i95-sides.py`.
29. **"Within the boundaries of the George Washington/Jefferson National Forests"** (bobcat and fox dog
    rules, raccoon chase) is mapped as National Forest–owned land; private inholdings inside the
    proclamation boundary are not included.
30. **Fox chase on the National Forest and Gathright, Goshen, Highland, Little North Mountain WMAs** is
    closed during the deer firearms season; the timeline shows Nov 1 – Feb 28 with that note rather than
    subtracting each county's deer dates.
31. **Raccoon chase on DWR land west of the Blue Ridge and on National Forest land** is allowed "where
    bears can be chased" Aug 1 – Sep 27; shown for all such land with that note.
32. **"Unless otherwise posted"** (spring squirrel, coyote/skunk on DWR land in the spring squirrel
    season) is shown as a note; posted closures can't be mapped.
33. **Fauquier County fox closure "except Quantico"** — Marine Corps Base Quantico isn't mapped, so all of
    Fauquier shows closed.
34. **Lake Robertson** is stored by DWR's GIS as a "WCS" property but listed as a WMA in the squirrel
    regulations; it's included as a WMA.
35. **Local ordinances for small game and furbearers:** citywide firearm bans and "bowhunting for deer
    only" rules (e.g. Richmond, Salem) close these seasons in those cities; Buena Vista's wild-bird ban
    covers grouse, quail, pheasant, and crow, and Williamsburg's bird sanctuary covers game birds.

## Mapped local-ordinance areas

34 areas are mapped (`public/data/local-areas.geojson`; per-area source, method, confidence, and
notes in `src/regs/local-areas.json`, shown in the location panel). Effects are in
`src/regs/local-effects.ts`. Points to review:

36. **Prince William's restricted areas** (Sec. 31-26–31-28) were hand-built from the metes-and-bounds
    descriptions and county GIS (all 12; per-feature confidence is in the data). Still low: Ridgewood
    Estates ("Felkins Branch" is unnamed in every map source; if it is the stream through Section 3,
    the area is larger) and Woodbine Woods (a leg described as ~2,500 ft measures ~4,790 ft; east edge
    kept on today's Rt 234). Gainesville is medium (railroad distance 17,850-18,100 ft vs 18,401 in the text). The county's "Restricted Firearm Discharge
    Zone" GIS layer is a different rule (100-yard buffers). **Fairfax Appendix J** was traced from the
    county's 2018 "No Shooting Areas" map PDF (no vector layer is published).
    **Suffolk "densely populated areas"** (Sec. 54-122, medium) are computed from city parcels, buildings and
    address points: 5+ touching lots of 1 acre or less, each with a building, plus 200 yards. Lots across a
    street aren't counted as adjacent; the literal "adjacent to at least one other" reading would give 15%
    of the city instead of 11%. The citywide setbacks aren't mapped. **Lynchburg permitted farmland**
    (Sec. 27-67.1, low) uses the assessor's land-use (farm) program, so farms outside it are missed; the
    permit and 100-yard setback can't be mapped.
    **Not mapped:** Louisa *posted* subdivisions (no published list or GIS layer); Ashland 50-acre permitted
    parcels (Hanover parcel server unavailable); Suffolk cemeteries; Roanoke city / Portsmouth "public
    places"; Norton "in any street". All remain as text in the panel.
37. **Greene (low confidence):** Locust Lane / Midway Acres now follows full-resolution county parcels,
    but today's only R-2 district there doesn't adjoin Locust Lane (business parcels between). The 1990
    "adjoining R-2" may be the since-rezoned New Life Drive tracts (unmapped); needs the county's exhibit.
    Owner's-permission hunters are exempt, so it's information only. **Tazewell parks (medium):**
    Cavitt's Creek and the county fairgrounds, from an owner search of county assessment records; leased
    parks wouldn't appear.
38. **James City "recorded subdivisions" (medium):** county subdivision and section layers, 55 of 57
    named pre-1964 subdivisions (missing: Dandridge Davenport & Piggott; Levi & Lettie Wallace), and
    small plats from the plat index. Petitioned subdivisions can't be identified, and plat titles don't
    reliably flag excluded family subdivisions.
39. **Judgment calls:** Henrico office/mixed-use districts counted as commercial; Essex "R-2 Limited
    Residential" taken to be today's R-2 "Low Density Residential"; Petersburg agricultural zoning (city
    sources disagree, 5.6–10.8 km²); Chesapeake north boundary follows I-664 north from Bowers Hill;
    Virginia Beach "Point Creek" read as Hell Point Creek; Cumberland read as the wedge near Cartersville;
    Loudoun parks include regional-authority parks (firearm *possession* ban, so archery still allowed);
    Stafford "public property" = county and school-board land.
40. **Fairfax Appendix J** restricted/exempt areas come from county GIS; the countywide .224-caliber rule
    is applied everywhere except the exempted parcels.

## Archived license years

41. **2025–26 and 2024–25** are encoded from DWR's digests (2025–26: eRegulations PDF; 2024–25: DWR PDF;
    URLs and sha256 in each file header). Differences from 2026–27 and that year's ambiguities are in
    `docs/changes-2025.md` and `docs/changes-2024.md`. Most notable: the 2024–25 digest gives the
    Nov 16 – Dec 14 deer group's either-sex days as "Nov 16 through Dec 4 (full season)" — probably a
    misprint for Dec 14; encoded as printed (Dec 5–14 antlered only) with a note.
42. **Local ordinances in archived years** use the current (2026) ordinance data; the archived notice
    says so.

## Migratory game birds (2026–27)

43. **Youth & veterans days, AP Zone Canada goose bag.** DWR's migratory page lists the youth/veterans
    days twice: once with "2 Canada geese in the Atlantic Population Zone", once with "1 Canada goose".
    The AP Zone daily bag is 2 (DWR and the federal memorandum MGBHM–2026–02). *Encoded:* a fact that
    says 2 and flags the discrepancy.
44. **Light goose hours when other waterfowl seasons are closed.** DWR's general "Shooting Hours"
    paragraph lists the regular light goose season (when all other waterfowl seasons are closed) as an
    exception to the sunset close, but the light goose section and the federal memorandum give
    "one half-hour before sunrise to sunset" and only allow electronic calls and unplugged shotguns.
    *Encoded:* until sunset.
45. **Tundra swan area and independent cities.** The area is "all counties and portions of counties
    lying east of I-95 and south of the Prince William/Stafford County line". *Encoded:* includes the
    independent cities east of I-95 (Chesapeake, Virginia Beach, Suffolk, …).
46. **Canada goose zone line.** Jurisdictions were classified against I-64, I-95, US 460 and VA 32 from
    Census TIGER/Line 2023 roads. Ten localities the line crosses get both zones with a note (Albemarle,
    Goochland, Henrico west of I-95, Louisa; Isle of Wight, Prince George and Sussex east of I-95,
    Southampton, Petersburg east of I-95; western Suffolk). Where the line only grazes a locality
    (Nelson at Rockfish Gap, Fluvanna near Zion Crossroads, Richmond west of I-95 near the I-64
    interchange; each under 1% of the area) it is encoded as RP with a note. US 460 has business and
    bypass routes in Petersburg and Suffolk; the mainline route was used.
47. **Hampton** bans hunting and firearm discharge except waterfowl hunting from state-licensed blinds
    over water (Sec. 40-18, 40-20). *Encoded:* ducks/geese shotgun-only with that note; all other
    migratory birds closed.
