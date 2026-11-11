# National Wildlife Refuges

`refuges.geojson`: the 15 National Wildlife Refuges with land in Virginia (EPSG:4326),
used as public-land type `refuge` (rules in `src/regs/refuges.ts`).

## Geometry
- **Source:** U.S. Fish & Wildlife Service National Realty Tracts
  (FWSInterest_Simplified_Authoritative), last edited 2026-08-24.
- **What's included:** land FWS owns outright or leases (e.g. 790 ac at Mason Neck). Easements
  are left out because the land stays private: about 4,100 ac of conservation easements at
  Rappahannock River Valley are not refuge hunting land, and the refuge's hunt acreages match
  its owned tracts only. The approved acquisition boundaries are not used, since they include
  private land.
- **Processing:** clipped to Virginia, simplified at ~15 m, coordinates rounded to 5 decimals.
- **Features:** Rappahannock River Valley is split by unit (`unit` property), because Island
  Farm, Peter and Styer/Bishop are closed. Mackay Island (a North Carolina refuge) has 887 ac
  in Virginia Beach.

## Rules
`refuges.json` holds each refuge's 2026-27 hunting status, species, permit method and sources.
They were researched from FWS refuge hunt pages, 2026-27 brochures and fact sheets, and
50 CFR 32.65 (Virginia).

## Known doubts
- Great Dismal Swamp's newest brochure online is from 2021.
- For Presquile and James River, the fact sheets and the FWS pages disagree on lottery vs
  first-come. The 2026 fact sheets were used.
- Rappahannock's Wilna and Wright units are one FWS polygon but have different rules: Wright
  needs only check-in.
- Back Bay allows a deer hunt by regulation, but none has been held 2017–2026, so it is
  shown closed.
