# 2024–25 license year vs. 2026–27

Source: [2024–2025 Hunting & Trapping in Virginia digest](https://dwr.virginia.gov/wp-content/uploads/media/2024-2025-Virginia-Hunting-and-Trapping-Regulations-Digest.pdf)
(sha256 `5174144546ede3b1249c77ba8fff93c0c22600ffaf95aad70d35594924d7bdda`). The page numbers below are the digest's printed page numbers. The 2024 rules are in `src/regs/*-2024.ts` and the tests in `tests/year-2024.test.ts`.

## Structural differences

- **Deer firearms: no public-lands table.** In 2024–25 each firearms county group applies "in all areas" and lists public-land exceptions to its either-sex days (pp. 40–41). Each group is encoded as one season over private, National Forest, DWR, state forest and Army Corps land, with its own `esGroup`. State parks are covered only where the digest names them (Hungry Mother, Grayson Highlands, Fairy Stone). Other state parks fall back to "check".
- **Bear archery and muzzleloader were statewide** (Oct 5 – Nov 15 and Nov 9 – 15, pp. 28–29). Only the firearms seasons were set by county group, and those groups were different, with several counties split at I-81 (p. 30).
- **Turkey bag limit:** 3 per year, no more than 2 of them in the fall. Fall birds could be either sex. Spring birds had to be bearded (pp. 46–47). The 2026 rule is "only 1 may be beardless, fall only".

## Deer (pp. 34–45)

- **Dates:**
  - Youth weekend: Sep 28–29.
  - Early archery: Oct 5 – Nov 15.
  - Early muzzleloader: Nov 2–15.
  - Firearms: Nov 16 – Nov 30, Dec 14 or Jan 4, depending on the group.
  - Late muzzleloader: Dec 14 – Jan 4.
  - Urban archery and antlerless-only firearms: Sep 7 – Oct 4 and Jan 5 – Mar 30. Bedford antlerless-only: Sep 7 – Oct 4 and Jan 5 – Jan 31.
  - NOVA late archery: Mar 31 – Apr 27.
  - Chesapeake, Suffolk east and Virginia Beach: firearms Oct 1 – Nov 30; late archery Dec 1 – Jan 4.
- **Late archery:**
  - All of the west from Dec 1, except Clarke, Floyd, and private land in Carroll, Frederick, Montgomery and Pulaski. This includes Rockingham east and Shenandoah, Warren, Page and Roanoke, which are excluded in 2026.
  - National Forest and DWR land in the west, C.F. Phelps WMA, and National Forest in Amherst, Bedford and Nelson: from Dec 1.
  - Amherst west, Bedford, Carroll, Floyd, Franklin, Henry, Montgomery, Nelson west, Patrick and Pulaski: from Dec 15.
- **Late muzzleloader east** covers all of Amherst west, Bedford, Franklin, Henry, Nelson west and Patrick. Either sex is allowed all season except on National Forest land. In 2026 it covers only Henry, Patrick, and public land in Franklin.
- **Late muzzleloader west** is closed only in Clarke and on private land in Frederick. The 2026 exclusion list is longer.
- **Firearms groups:**
  - The west is split into 5 Nov 16–30 groups: full either-sex; Nov 23/29/30; Scott and Washington Nov 23 + Nov 25–30; antlered-only Buchanan, Dickenson and Wise; and APR counties with Nov 23/30 on private land.
  - Amherst west, Bedford, Carroll, Floyd, Franklin, Montgomery, Nelson west, Pulaski and Roanoke run Nov 16 – Dec 14. Their National Forest (and Carroll/Roanoke DWR) land closes Nov 30.
  - Henry and Patrick run Nov 16 – Dec 14 with either-sex days Nov 23, Nov 30 and Dec 2–14.
  - East of the Blue Ridge there are 4 Nov 16 – Jan 4 groups: full season; Nov 23/30 + Dec 30 – Jan 4; Nov 23/30 + Dec 23 – Jan 4; and Nov 23/30 + Dec 9 – Jan 4. Amherst, Campbell, Nelson and Pittsylvania are split between groups along Rt. 29, the Norfolk Southern Railroad, and Rt. 151.
- **Per-property either-sex days come from the group exceptions:**
  - Featherfin: Nov 23, Nov 30, Dec 7 – Jan 4.
  - Amelia WMA: Dec 30 – Jan 4 plus Nov 23 and Nov 30.
  - Thompson, Oakley Forest, Powhatan and Rapidan WMAs: Nov 23, Nov 30, Dec 23 – Jan 4.
  - C.F. Phelps WMA: Nov 16–30, either sex Nov 23.
  - Hardware River, James River, Tye River and White Oak Mountain WMAs: see the ambiguities below.
  - Ragged Island, Chickahominy, and the Carlisle and Stewart tracts of Hog Island: antlered only.
- **Earn a Buck, private land:** Chesterfield, Craig, Giles and Spotsylvania are not EAB counties in 2024.
- **Antlerless-only firearms:** Greene, Hanover, Henrico and James City are not included in 2024.
- **Urban archery:** Williamsburg is included. Newport News and the town of Cedar Bluff are not.
- **Madison and Greene:** no deer dogs Nov 16–29.
- **Cities and towns:** either sex all season during the muzzleloader seasons, both early and late, and during firearms Nov 16 – Jan 4.
- **Added info:** a year-round deer-feeding ban by county (p. 45) and the youth/apprentice antlerless regulation.

## Bear (pp. 28–32)

- **Youth weekend:** Oct 12–13.
- **Firearms:**
  - Early firearms, Sep 30 – Oct 2: Bland, Buchanan, Craig, Dickenson, Giles, Lee, Roanoke, Russell, Scott, Tazewell and Wise, plus the parts of Montgomery, Pulaski, Smyth, Washington and Wythe northwest of I-81. There is no Clinch Mountain WMA exclusion.
  - Nov 25 – Jan 4: west and north group, including Arlington, Caroline, Chesterfield, Fluvanna, Goochland, Hanover, Henrico, Louisa, Orange, Powhatan, Prince William, Spotsylvania and Stafford, plus Clinch Mountain and Hidden Valley WMAs and the Channels.
  - Dec 2 – Jan 4: Southside, Tidewater, and the parts of five counties southeast of I-81.
  - Chesapeake, Suffolk and Virginia Beach: Oct 1 – Jan 4.
  - Cities and towns: Oct 5 – Jan 4.
  - Accomack and Northampton: closed to firearms.
- **Hounds:**
  - No hounds Nov 25 – Dec 1 in the west, Bedford, Amherst west and Nelson west.
  - No hounds Nov 25–29 in Madison and Greene.
  - The firearms no-dog areas are the same as 2026.
- **Hound training** (map, p. 31):
  - Aug 1 – Sep 28 in the western and southwestern counties, plus Albemarle, Culpeper, Greene, Madison, Rappahannock, Nelson, Amherst, Bedford, Franklin, Floyd, Charlotte, Lunenburg, Mecklenburg, Brunswick, Greensville, Chesapeake, Suffolk and Virginia Beach. Excluded parts: Grayson west of Rt. 16, Smyth south of I-81 and west of Rt. 16, and Roanoke and Washington south of I-81.
  - Nov 16–30 east of the Norfolk Southern Railroad. This covers the 35 counties of Southside, the Peninsula and the Northern Neck, including the east halves of Campbell and Pittsylvania.
  - Cavalier WMA: Aug 10–24.
  - There is no Nov 30 – Dec 19 training season.

## Turkey (pp. 46–47)

- The county groups are identical to 2026.
- **Fall dates:**
  - Archery: Oct 5 – Nov 15.
  - Youth weekend: Oct 12–13.
  - Firearms: Oct 19 – Nov 1 and Nov 27–28. Group 1 has Nov 28 only.
  - Additional firearms dates by group: Dec 2–28 + Jan 11–25 (group 2), Dec 2–14 (group 3), Dec 2–14 + Jan 11–25 (group 4).
- **Spring dates:**
  - Youth weekend: Apr 5–6.
  - Until noon: Apr 12–27 (`turkey-spring-noon`).
  - All day: Apr 28 – May 17 (`turkey-spring-allday`).

## Elk (p. 33)

- The Elk Management Zone lottery hunt was Oct 12–18, 2024, with six bull licenses.

## Small game (pp. 48–49)

- Squirrel: Sep 7 – Feb 28. Fox squirrel: Sep 7 – Jan 31. Spring squirrel: Jun 7–21, 2025.
- Rabbit: Nov 2 – Feb 28.
- Grouse: Oct 26 – Feb 8.
- Quail and pheasant: Nov 9 – Jan 31.
- Crow: Aug 17 – Mar 21. National Forest and DWR land: Sep 2 – Mar 10.
- Groundhog and the other species that follow the spring seasons on National Forest and DWR land use spring turkey Apr 12 – May 17 and spring squirrel Jun 7–21.

## Furbearers (pp. 50–52)

- Bobcat archery: Oct 5–31.
- Raccoon chase on National Forest and western DWR land: Aug 1 – Sep 28.
- Coyote and striped skunk: spring windows are Apr 12 – May 17 and Jun 7–21.
- Everything else is unchanged.

## Ambiguities in the 2024–25 text (literal reading encoded)

1. **Nov 16 – Dec 14 group (Amherst west, Bedford, …).** The digest lists either-sex days as "November 16 through December 4 (full season)" for a season that ends Dec 14. Dec 4 is encoded literally, so Dec 5–14 shows as antlered only. A season note tells hunters to confirm with DWR. This is probably a misprint for Dec 14.
2. **White Oak Mountain WMA.** The digest lists either-sex days "November 25, and January 4, 5 and 6", but the season ends Jan 4. Jan 5–6 are encoded but have no effect.
3. **Properties that span two county groups** take the either-sex days of the group they are in. The digest names Thompson WMA only in the Jan 4 group, so its Warren County part follows Warren's full-season days. Likewise, the Powhatan County part of Amelia WMA follows Powhatan, and the Buckingham part of Cumberland State Forest follows Buckingham.
4. **Hog Island WMA.** Only the Carlisle and Stewart tracts are listed as antlered only. The tracts are not mapped, so the whole WMA is encoded as antlered only, with a `partialNote`.
5. **Grayson Highlands State Park.** Either sex is allowed Nov 30 "on portions". Fairy Stone State Park lists "designated areas". Both are encoded with a `partialNote`.
6. **Wythe bear seasons.** Wythe is split at I-81, which is not mapped in Wythe. The Sep 30 early season and the Nov 25 / Dec 2 firearms seasons carry a `partialNote` saying which side each applies to.
7. **Late archery for independent cities inside excluded counties** (Radford, Galax). The Dec 1 "all areas west" rule and the Dec 15 "counties including cities" rule both match, so both seasons are listed.
8. **Bear hound training counties** come from the p. 31 maps, not from text. Read at high resolution, Suffolk is shaded for Aug 1 – Sep 28 in full on both sides of the Dismal Swamp line. Smyth is shaded except the part south of I-81 and west of Rt. 16.
9. **Camp Peary (York) turkey season** is not mapped. As in 2026, York uses the group 3 dates, with an info note about Camp Peary.
10. **Integrity test.** The existing `tests/all-years.test.ts` deer check probes only Rockingham's sides. In 2024–25, Amherst, Campbell, Nelson and Pittsylvania are split between deer firearms groups along mapped lines, so that check would report them with 0 groups when the side is unknown. `tests/year-2024.test.ts` checks every mapped side and confirms each is in exactly one group.
