#!/usr/bin/env bash
# Builds the simplified GeoJSON layers the app loads from public/data/.
# Inputs live in sources/geo (see scripts/fetch-sources.sh).
set -euo pipefail
# Git Bash on Windows rewrites arguments that look like Unix paths (e.g. the regex
# "!/Trail|.../.test(...)") before passing them to node; turn that off. No effect elsewhere.
export MSYS_NO_PATHCONV=1
cd "$(dirname "$0")/.."
SRC=sources/geo
OUT=public/data
MS="npx mapshaper"
mkdir -p "$OUT"

# Simplification tolerance (meters) for all map layers: fine enough that boundaries
# match parcel- and road-based ordinance areas, small enough to load quickly.
TOL=${TOL:-15}

# 1. Counties + independent cities (Census county equivalents). LSAD 06 = county, 25 = city.
#    Detailed TIGER/Line boundaries, coast clipped to the 1:500k shoreline (see the script).
python3 scripts/build-county-outlines.py
$MS "$SRC/_counties_detailed.geojson" \
  -each "type = LSAD === '25' ? 'city' : 'county'; name = NAME.replace(/ city$/, ''); id = type + ':' + name; fips = GEOID" \
  -filter-fields id,name,type,fips \
  -simplify interval=$TOL keep-shapes \
  -clean \
  -o "$OUT/jurisdictions.geojson" precision=0.00001 format=geojson

# Split counties along the lines the regulations use (Rts. 613/731, Dismal Swamp line, I-81,
# State Rt. 16, the New River, the Norfolk Southern main line, US 29, Rt. 151, and the Wythe hound area); see scripts/split-jurisdictions.py.
python3 scripts/split-jurisdictions.py "$OUT/jurisdictions.geojson"
python3 scripts/i95-sides.py

# Virginia outline used to clip statewide layers.
$MS "$OUT/jurisdictions.geojson" -dissolve -o "$SRC/va-outline.geojson" format=geojson

# 2. Incorporated towns (place LSAD 43), detailed TIGER/Line boundaries.
$MS "$SRC/tl_2023_51_place/tl_2023_51_place.shp" \
  -filter "LSAD === '43'" \
  -each "name = NAME; id = 'town:' + NAME; fips = GEOID" \
  -filter-fields id,name,fips \
  -simplify interval=$TOL keep-shapes \
  -o "$OUT/towns.geojson" precision=0.00001 format=geojson

# 3. Public lands with their own deer rules.
#    land: national_forest | dwr | state_forest | state_park | army_corps | nps | military | refuge
$MS "$SRC/usfs.geojson" -clip "$SRC/va-outline.geojson" \
  -each "land = 'national_forest'; name = 'George Washington & Jefferson National Forest'" \
  -filter-fields land,name -o "$SRC/_nf.geojson" format=geojson

# Bear Garden is a Wildlife Conservation Site (WCS) that DWR lists and hunts as part of Cavalier
# WMA ("Cavalier WMA/Bear Garden WCS"); other WCSs are in sources/lands (see its README).
$MS "$SRC/wma.geojson" \
  -filter "Property_Type === 'WMA' || WMA_NAME === 'Crooked Creek' || WMA_NAME === 'Lake Robertson' || WMA_NAME === 'Bear Garden'" \
  -each "land = 'dwr'; name = WMA_NAME.replace(/^Bear Garden$/, 'Cavalier').replace('Mountian','Mountain').replace(/^Coastal Forest - .*/, 'Coastal Forest').replace(/^Mockhorn$/, 'Mockhorn Island') + ' WMA'" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_wma.geojson" format=geojson

$MS "$SRC/statelands.geojson" \
  -filter "MATYPE !== 'Military Recreation Area' && !/water/.test(MANAME)" \
  -each "land = MATYPE === 'State Park' ? 'state_park' : MATYPE === 'State Forest' ? 'state_forest' : 'army_corps'; name = land === 'army_corps' ? MANAME.replace(/ - .*/, '') : MANAME" \
  -filter-fields land,name \
  -o "$SRC/_state.geojson" format=geojson
# (No -dissolve here: it drops parks that lie inside a state forest, e.g. Holliday Lake.
#  split-public-lands.py dissolves each property instead.)

# National Park Service units (hunting generally prohibited). Trail corridors and
# Assateague (mixed rules) are left out rather than shown as closed.
$MS "$SRC/nps.geojson" -clip "$SRC/va-outline.geojson" \
  -filter "!/Trail|Assateague/.test(UNIT_NAME)" \
  -each "land = 'nps'; name = UNIT_NAME" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_nps.geojson" format=geojson

# Military installations (committed in sources/military; see its README).
$MS sources/military/military.geojson \
  -each "land = 'military'" \
  -filter-fields land,name -o "$SRC/_mil.geojson" format=geojson

# National Wildlife Refuges (committed in sources/refuges; see its README). Rappahannock
# units are named separately because some are closed (src/regs/refuges.ts, refugeName).
$MS sources/refuges/refuges.geojson \
  -each "land = 'refuge'; name = unit ? name + ' — ' + unit + ' Unit' : name" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_nwr.geojson" format=geojson

# Other public land and state parks missing from DCR's layer (committed in sources/lands; see
# its README). Land types there: other_public, state_park.
$MS -i sources/lands/army-corps.geojson sources/lands/dof-lands.geojson sources/lands/local-hunting.geojson \
  sources/lands/pals.geojson sources/lands/powrr.geojson sources/lands/natural-area-preserves.geojson \
  sources/lands/state-parks.geojson sources/lands/banshee-reeks.geojson sources/lands/fairfax-deer-program.geojson \
  sources/lands/dwr-wcs.geojson combine-files \
  -merge-layers force \
  -each "land = land === 'state_park' ? 'state_park' : 'other_public'" \
  -filter-fields land,name -o "$SRC/_lands.geojson" format=geojson

$MS -i "$SRC/_nf.geojson" "$SRC/_wma.geojson" "$SRC/_state.geojson" "$SRC/_nps.geojson" "$SRC/_mil.geojson" "$SRC/_nwr.geojson" "$SRC/_lands.geojson" combine-files \
  -merge-layers force \
  -filter-fields land,name \
  -o "$SRC/_public.geojson" format=geojson

# Split each public property by county/city (deer rules on National Forest and a few other
# properties depend on the jurisdiction), keeping properties that overlap. Larger properties
# come first so smaller ones draw on top of them.
python3 scripts/split-public-lands.py "$SRC/_public.geojson" "$OUT/jurisdictions.geojson" "$SRC/_public_split.geojson"
$MS "$SRC/_public_split.geojson" \
  -simplify interval=$TOL keep-shapes \
  -filter "this.area > 20000" \
  -sort "this.area" descending \
  -o "$OUT/public-lands.geojson" precision=0.00001 format=geojson

# 4. Local-ordinance areas (zoning districts, subdivisions, road-bounded areas, public
#    property), split by jurisdiction like public lands so each piece knows its side.
python3 scripts/build-local-areas.py
$MS -i "$SRC/_local_areas.geojson" "$OUT/jurisdictions.geojson" combine-files \
  -union target=* \
  -filter "!!area && !!id" \
  -each "jurisdiction = id; subArea = subArea || null; name = name_1 || ''" \
  -dissolve fields=area,name,jurisdiction,subArea \
  -simplify interval=$TOL keep-shapes \
  -filter "this.area > 2000" \
  -o "$OUT/local-areas.geojson" precision=0.00001 format=geojson

# ---- 6. TopoJSON copies for the app (shared borders stored once; a 1e5 grid is ~3-7 m
#         across Virginia, well under the simplification tolerance). The GeoJSON stays as
#         the working copy for the scripts and tests; the deploy leaves it out.
for n in jurisdictions towns public-lands local-areas; do
  $MS "$OUT/$n.geojson" name="$n" -o "$OUT/$n.topojson" format=topojson quantization=100000
done

ls -la "$OUT"
