# Open questions about the deer regulations (2026–27)

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

9. **Department of Defense lands** (Prince William exceptions, EAB exception) are not mapped yet.

10. **Name matching.** DCR's layer names some state forests without "State Forest" ("Cumberland",
    "Big Woods", "The Channels", "Prince Edward-Gallion"); these are assumed to be the forests in
    DWR's table. "Thompson WMA" = G. Richard Thompson WMA; "Turkeycock Mountain WMA" = Turkeycock.

11. **Split lines without geometry.** Rockingham (Rts. 613/731), Suffolk (Dismal Swamp line),
    Amherst (Rt. 29), Campbell/Pittsylvania (Norfolk Southern RR), Nelson (Rt. 151). The user picks
    the side; the map stripes jurisdictions whose sides differ.

12. **NPS land.** Shown closed. Assateague Island National Seashore and Appalachian Trail corridor
    lands are excluded from the layer because hunting rules there vary.
