#!/usr/bin/env bash
# Builds the simplified GeoJSON layers the app loads from public/data/.
# Inputs live in sources/geo (see scripts/fetch-sources.sh).
set -euo pipefail
cd "$(dirname "$0")/.."
SRC=sources/geo
OUT=public/data
MS="npx mapshaper"
mkdir -p "$OUT"

# 1. Counties + independent cities (Census county equivalents). LSAD 06 = county, 25 = city.
$MS "$SRC/cb_2023_us_county_500k/cb_2023_us_county_500k.shp" \
  -filter "STATEFP === '51'" \
  -each "type = LSAD === '25' ? 'city' : 'county'; name = NAME.replace(/ city$/, ''); id = type + ':' + name; fips = GEOID" \
  -filter-fields id,name,type,fips \
  -simplify 12% keep-shapes \
  -o "$OUT/jurisdictions.geojson" precision=0.00001 format=geojson

# Split counties along the lines the regulations use (Rts. 613/731, Dismal Swamp line, I-81,
# State Rt. 16, the New River, the Norfolk Southern main line, US 29, Rt. 151, and the Wythe hound area); see scripts/split-jurisdictions.py.
python3 scripts/split-jurisdictions.py "$OUT/jurisdictions.geojson"
python3 scripts/i95-sides.py

# Virginia outline used to clip statewide layers.
$MS "$OUT/jurisdictions.geojson" -dissolve -o "$SRC/va-outline.geojson" format=geojson

# 2. Incorporated towns (place LSAD 43).
$MS "$SRC/cb_2023_51_place_500k/cb_2023_51_place_500k.shp" \
  -filter "LSAD === '43'" \
  -each "name = NAME; id = 'town:' + NAME; fips = GEOID" \
  -filter-fields id,name,fips \
  -simplify 20% keep-shapes \
  -o "$OUT/towns.geojson" precision=0.00001 format=geojson

# 3. Public lands with their own deer rules.
#    land: national_forest | dwr | state_forest | state_park | army_corps | nps
$MS "$SRC/usfs.geojson" -clip "$SRC/va-outline.geojson" \
  -each "land = 'national_forest'; name = 'George Washington & Jefferson National Forest'" \
  -filter-fields land,name -o "$SRC/_nf.geojson" format=geojson

$MS "$SRC/wma.geojson" \
  -filter "Property_Type === 'WMA' || WMA_NAME === 'Crooked Creek' || WMA_NAME === 'Lake Robertson'" \
  -each "land = 'dwr'; name = WMA_NAME.replace('Mountian','Mountain').replace(/^Coastal Forest - .*/, 'Coastal Forest').replace(/^Mockhorn$/, 'Mockhorn Island') + ' WMA'" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_wma.geojson" format=geojson

$MS "$SRC/statelands.geojson" \
  -filter "MATYPE !== 'Military Recreation Area' && !/water/.test(MANAME)" \
  -each "land = MATYPE === 'State Park' ? 'state_park' : MATYPE === 'State Forest' ? 'state_forest' : 'army_corps'; name = land === 'army_corps' ? MANAME.replace(/ - .*/, '') : MANAME" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_state.geojson" format=geojson

# National Park Service units (hunting generally prohibited). Trail corridors and
# Assateague (mixed rules) are left out rather than shown as closed.
$MS "$SRC/nps.geojson" -clip "$SRC/va-outline.geojson" \
  -filter "!/Trail|Assateague/.test(UNIT_NAME)" \
  -each "land = 'nps'; name = UNIT_NAME" \
  -dissolve fields=name copy-fields=land \
  -o "$SRC/_nps.geojson" format=geojson

$MS -i "$SRC/_nf.geojson" "$SRC/_wma.geojson" "$SRC/_state.geojson" "$SRC/_nps.geojson" combine-files \
  -merge-layers force \
  -filter-fields land,name \
  -o "$SRC/_public.geojson" format=geojson

# Split each public property by county/city: deer rules on National Forest (and
# a few other properties) depend on which jurisdiction the land is in.
$MS -i "$SRC/_public.geojson" "$OUT/jurisdictions.geojson" combine-files \
  -union target=* \
  -filter "!!land && !!id" \
  -each "jurisdiction = id; name = name_1; subArea = subArea || null" \
  -dissolve fields=name,jurisdiction,subArea copy-fields=land \
  -simplify 25% keep-shapes \
  -filter "this.area > 20000" \
  -o "$OUT/public-lands.geojson" precision=0.00001 format=geojson

# 4. Local-ordinance areas (zoning districts, subdivisions, road-bounded areas, public
#    property), split by jurisdiction like public lands so each piece knows its side.
python3 scripts/build-local-areas.py
$MS -i "$SRC/_local_areas.geojson" "$OUT/jurisdictions.geojson" combine-files \
  -union target=* \
  -filter "!!area && !!id" \
  -each "jurisdiction = id; subArea = subArea || null; name = name_1 || ''" \
  -dissolve fields=area,name,jurisdiction,subArea \
  -simplify 30% keep-shapes \
  -filter "this.area > 2000" \
  -o "$OUT/local-areas.geojson" precision=0.00001 format=geojson

ls -la "$OUT"
