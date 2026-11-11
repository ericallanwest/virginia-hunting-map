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

9. **Department of Defense lands** (Prince William exceptions, EAB exception) are not mapped yet.

10. **Name matching.** DCR's layer names some state forests without "State Forest" ("Cumberland",
    "Big Woods", "The Channels", "Prince Edward-Gallion"); these are assumed to be the forests in
    DWR's table. "Thompson WMA" = G. Richard Thompson WMA; "Turkeycock Mountain WMA" = Turkeycock.

11. **Split lines.** Rockingham (Rts. 613/731) and Suffolk (Dismal Swamp line, 4VAC15-20-40) are
    split in the map data from Census TIGER roads (`scripts/split-jurisdictions.py`). In Suffolk, the
    stretch "through the corporate limits of the City of Suffolk" between Route 10 and White Marsh
    Road is approximated by a straight segment downtown. Amherst (Rt. 29), Campbell/Pittsylvania
    (Norfolk Southern RR), and Nelson (Rt. 151) only affect Earn-a-Buck/dog rules, so the user still
    picks the side for those.

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
