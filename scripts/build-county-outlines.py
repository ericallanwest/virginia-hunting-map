"""Detailed county / independent-city outlines for Virginia.

Census TIGER/Line counties are the most precise boundaries, but they extend over
the water each county governs (Chesapeake Bay, the ocean). The cartographic
1:500k file is shoreline-clipped but generalized. So: keep TIGER geometry and clip
it to the 1:500k land outline buffered by ~300 m. Borders between counties and
with other states stay exactly TIGER (the buffer reaches past them); only the
coast is cut, a little offshore so no land is lost.

Output: sources/geo/_counties_detailed.geojson (NAME, LSAD, GEOID), simplified
afterwards by scripts/build-geo.sh.
"""
import json
from pathlib import Path

import shapefile
from shapely import make_valid
from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources/geo"

cb = shapefile.Reader(str(SRC / "cb_2023_us_county_500k/cb_2023_us_county_500k"))
land = unary_union([make_valid(shape(s.__geo_interface__)) for s, r in zip(cb.shapes(), cb.records()) if r["STATEFP"] == "51"])
land = land.buffer(0.003)  # ~300 m

tl = shapefile.Reader(str(SRC / "tl_2023_us_county/tl_2023_us_county"))
feats = []
for s, r in zip(tl.shapes(), tl.records()):
    if r["STATEFP"] != "51":
        continue
    g = make_valid(shape(s.__geo_interface__)).intersection(land)
    feats.append({"type": "Feature", "properties": {"NAME": r["NAME"], "LSAD": r["LSAD"], "GEOID": r["GEOID"]}, "geometry": mapping(g)})

out = SRC / "_counties_detailed.geojson"
json.dump({"type": "FeatureCollection", "features": feats}, open(out, "w", encoding="utf-8"))
print(f"{len(feats)} counties/cities -> {out.name}")
