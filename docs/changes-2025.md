# 2025–26 license year: differences from 2026–27

Source: 2025–2026 Virginia Hunting & Trapping Regulations digest
(<https://www.eregulations.com/assets/docs/guides/25VAHD_LR.pdf>, sha256
`19e03a913e95ac37bef013418087802de23e8726d6c321c82d6c2390b65c7075`), cross-checked with the
eRegulations web copy in `sources/regs/2025-26/eregulations/`. Page numbers are PDF pages
(printed page = PDF page − 2).

Files: `src/regs/{deer,bear,turkey,elk,small-game,furbearer}-2025.ts`, tests in `tests/year-2025.test.ts`.

## Calendar shift (applies everywhere)

Most 2025–26 dates are the 2026–27 dates moved one day later, because the opening days are tied to
weekdays (e.g. firearms opens Sat Nov 15, 2025 vs Sat Nov 14, 2026). Examples: early archery
Oct 4 – Nov 14; early muzzleloader Nov 1–14; firearms Nov 15 – Dec 13 / Jan 3; late muzzleloader
Dec 13 – Jan 3; urban archery Sep 6 – Oct 3 and Jan 4 – Mar 29; NOVA late archery Mar 30 – Apr 26;
youth deer weekend Sep 27–28; either-sex Saturdays Nov 22 and 29 (Fri Nov 28 after Thanksgiving).
Bear, turkey, small game, and furbearer seasons shift the same way. The rest of this list is the
differences that are *not* just the calendar.

## Deer

- **Late muzzleloader, east (p. 39):** full-season either-sex only in Henry and Patrick. Federal and
  DWR lands in Franklin County (e.g. Philpott Reservoir) have the season but **no either-sex days**
  in 2025–26 (2026–27: full season).
- **National Forest table (p. 42):** "All counties unless otherwise noted" Nov 15–29, either-sex
  Nov 29. So **Wythe** National Forest is either-sex Nov 29 only (2026–27: Nov 21, 27, 28 with
  Bland/Craig/Giles), **Wise** National Forest is either-sex Nov 29 (2026–27: antlered only), and
  National Forest land in counties not named in 2026–27's list also follows the table instead of
  private-land seasons. Antlered only: Dickenson, Lee, Scott.
- **WMA table (p. 43):** Coastal Forest, Game Farm Marsh, Guinea Marsh, Mockhorn Island, Saxis,
  Smith Mountain Cooperative, and Ware Creek WMAs are **not listed** in 2025–26, so they fall back
  to "check the property's posted rules".
- **Princess Anne WMA:** Oct 1 – Nov 30, quota the first 2 weeks of November, either-sex
  Oct 4 – Nov 30 (2026–27: Nov 14 – Jan 2, quota hunt only).
- **Urban archery towns (p. 38):** no Cedar Bluff (added in 2026–27). Newport News is open (new in
  2025–26).
- **Early muzzleloader west, Nov 8 list (p. 39):** also names Craig and Giles (already full season,
  so no effect).
- **Fairy Stone State Park:** "designated areas" note added.
- **Encoding change:** the "Muzzleloader either-sex for incorporated cities and towns" rule (p. 39,
  "full season during the muzzleloader seasons") is applied to *both* muzzleloader seasons for
  cities/towns west of the Blue Ridge. The 2026–27 file applies it only to the late season (its
  OPEN-QUESTIONS #2).
- Unchanged in substance: private-land county groups and either-sex patterns, antlerless-only
  seasons (Bedford ends Jan 31), EAB counties, bag limits, APR, bonus permits, deer dog rules
  (Madison/Greene no dogs Nov 15–28).

## Bear

- **Accomack and Northampton: closed season** (p. 30). 2026–27 has archery and muzzleloader
  seasons there.
- **Southwest early firearms (Sep 29 – Oct 1):** no Clinch Mountain WMA exception printed in
  2025–26.
- Hound training "excluding Sundays" (Dec 1–20) is now encoded with weekdays rather than only a note.
- Mange text follows the 2025–26 page (report to bearmange@dwr.virginia.gov with photo and
  confirmation number).
- Groups, hound restrictions (Nov 24–30 west; Madison/Greene Nov 24–28; firearms-season bans incl.
  split counties), youth weekend (Oct 11–12) and training seasons otherwise match 2026–27's structure.

## Turkey

- **Bag limit (p. 48):** 3 per license year, **no more than 2 in the fall** (2026–27: only 1
  beardless, fall only).
- Spring: youth Apr 4–5; noon Apr 11–26; all day Apr 27 – May 16, 2026. Groups unchanged.

## Elk

- EMZ lottery hunt **Oct 11–17, 2025** (p. 33). The digest does not state the number of licenses or
  "antlered bulls only", so those 2026–27 notes are not carried over.

## Small game and furbearers

- Dates shift only: squirrel Sep 6 – Feb 28 (fox squirrel to Jan 31), spring squirrel Jun 6–20, 2026;
  rabbit Nov 1 – Feb 28; grouse Oct 25 – Feb 14; quail/pheasant Nov 8 – Jan 31; crow Aug 16 – Mar 20
  (National Forest/DWR Sep 1 – Mar 9); bobcat archery Oct 4–31. Spring turkey window for groundhog,
  coyote, and skunk on National Forest/DWR land is Apr 11 – May 16, 2026.
- The new continuous opossum/raccoon season on private land with landowner permission (What's New,
  p. 8) is a **trapping** season and is not encoded.

## Ambiguities in the 2025–26 text

1. **Bear, "a week added southeast of I-81" (What's New, p. 8)** for Montgomery, Pulaski, Wythe,
   Smyth, and Washington. The season table (p. 30) lists these counties whole (Washington in the
   southwest group, the others in the Nov 24 group), so the counties are encoded whole. The What's
   New item reads as a change from 2024–25 that now makes each county uniform.
2. **Princess Anne WMA:** season opens Oct 1 but either-sex starts Oct 4; Oct 1–3 is encoded as
   antlered only. The Virginia Beach city-wide firearms season (Oct 1 – Nov 30, either sex) also
   matches the WMA, as in 2026–27.
3. **Bear in Eastern Shore towns:** the "any town or city that allows bear hunting, Oct 4 – Jan 3"
   rule is encoded literally, so towns in Accomack/Northampton show that season even though the
   counties are closed. Confirm with DWR.
4. **Late muzzleloader west exception (p. 39)** names Franklin County (east of the Blue Ridge); no
   effect.
5. **Camp Peary** (York County, longer fall turkey season) and **Department of Defense land** (Prince
   William urban archery exception) are not mapped; they are notes only.
6. The eRegulations web pages are marked "Last Updated: March 2026" but match the PDF on every date
   checked.
