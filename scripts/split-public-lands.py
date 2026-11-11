"""Split each public property by county/city, keeping overlapping properties.

Deer rules on National Forest (and a few other properties) depend on which jurisdiction
the land is in, so every property is cut along jurisdiction lines. Unlike a flat union,
properties that overlap (a state park inside a state forest, a preserve inside a park)
each keep their own pieces; the app picks the smallest one at a point.

Usage: python3 scripts/split-public-lands.py <public.geojson> <jurisdictions.geojson> <out.geojson>
Output properties: land, name, jurisdiction, subArea.
"""
import json
import sys

from shapely.geometry import mapping, shape
from shapely.ops import unary_union
from shapely.strtree import STRtree
from shapely.validation import make_valid

src, jur_path, out = sys.argv[1:4]
public = json.load(open(src, encoding="utf-8"))["features"]
jur = json.load(open(jur_path, encoding="utf-8"))["features"]
jur_geoms = [make_valid(shape(f["geometry"])) for f in jur]
tree = STRtree(jur_geoms)

# Dissolve each property (same land + name) first.
props: dict[tuple[str, str], list] = {}
for f in public:
    p = f["properties"]
    if not p.get("land") or not f.get("geometry"):
        continue
    props.setdefault((p["land"], p.get("name") or ""), []).append(make_valid(shape(f["geometry"])))

features = []
for (land, name), geoms in props.items():
    g = unary_union(geoms)
    for i in tree.query(g):
        piece = g.intersection(jur_geoms[i])
        piece = unary_union([p for p in getattr(piece, "geoms", [piece]) if p.geom_type in ("Polygon", "MultiPolygon")]) if not piece.is_empty else piece
        if piece.is_empty or piece.area < 1e-9:
            continue
        jp = jur[i]["properties"]
        features.append({
            "type": "Feature",
            "properties": {"land": land, "name": name, "jurisdiction": jp["id"], "subArea": jp.get("subArea")},
            "geometry": mapping(piece),
        })

json.dump({"type": "FeatureCollection", "features": features}, open(out, "w", encoding="utf-8"))
print(f"{len(props)} properties -> {len(features)} pieces")
