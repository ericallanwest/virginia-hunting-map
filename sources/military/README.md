# Military installations

`military.geojson`: Department of Defense installations in Virginia (EPSG:4326), used as
public-land type `military` (rules in `src/regs/military.ts`).

- **Source:** DoD "Military Installations, Ranges, and Training Areas" (MIRTA), FY2020
  installation layer, from OSD's REPI map server. Compared with Census TIGER 2025: the 18
  largest sites overlap 0.91–1.00 by area (Naval Station Norfolk 0.77). Camp Peary and the
  Radford AAP New River Unit are in neither layer and come from OpenStreetMap (New River:
  2,785 ac vs the Army's 2,821).
- **Processing:** clipped to Virginia, simplified at ~15 m, coordinates rounded to 5 decimals.
- **Names:** current official names. The Army restored Fort A.P. Hill, Fort Pickett and Fort Lee
  in 2025; DWR's 2026–27 pages use these.
- **Left out:**
  - Camp Pendleton (state-owned, not DoD).
  - Sandston Army Aviation Support Facility (ownership unverified).
  - Navy Wallops Island (the polygon is mostly NASA land).
  - Fort Monroe (closed 2011).
  - Leased office buildings.
- **Fort Pickett** is Army-owned and licensed to the Virginia National Guard; its regulations say
  to check deer as "Federal Land", so it is treated as DoD land.
