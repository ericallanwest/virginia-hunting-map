"""Combine mapped local-ordinance areas into one layer + metadata.

Inputs: sources/local-areas/<id>.geojson and <id>.json (committed; manifest with the
ordinance wording, method, sources, confidence, and notes), produced by reading
each locality's ordinance and its county/city GIS (see the manifests).

Outputs:
  sources/geo/_local_areas.geojson  every area as features with an `area` id
                                    (scripts/build-geo.sh splits them by
                                    jurisdiction into public/data/local-areas.geojson)
  src/regs/local-areas.json         per-area metadata shown in the location panel

Derived area: Petersburg bans firearm discharge everywhere except agricultural
zoning (Sec. 74-208/209), so the restricted area is the city minus that zoning.
"""
import json
import sys
from pathlib import Path

from shapely import set_precision
from shapely.geometry import mapping, shape
from shapely.ops import unary_union

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "sources/local-areas"
OUT_GEO = ROOT / "sources/geo/_local_areas.geojson"
OUT_META = ROOT / "src/regs/local-areas.json"


def jurisdiction_shape(jid):
    feats = json.load(open(ROOT / "public/data/jurisdictions.geojson"))["features"]
    return unary_union([shape(f["geometry"]) for f in feats if f["properties"]["id"] == jid])


def main():
    features, meta = [], []
    for mf in sorted(SRC.glob("*.json")):
        m = json.load(open(mf))
        gf = mf.with_suffix(".geojson")
        if m.get("confidence") == "none" or not gf.exists():
            print(f"skip {m['id']}: no geometry ({m.get('confidence')})")
            continue
        fc = json.load(open(gf))
        for f in fc["features"]:
            features.append({"type": "Feature", "properties": {"area": m["id"], "name": f["properties"].get("name") or ""}, "geometry": f["geometry"]})
        meta.append({
            "id": m["id"],
            "jurisdiction": m["jurisdiction"],
            "section": m.get("section", ""),
            "text": m.get("ordinance_area_text", ""),
            "method": m.get("method", ""),
            "confidence": m["confidence"],
            "notes": m.get("notes", ""),
        })

    # Petersburg: everything outside agricultural zoning.
    ag = [f for f in features if f["properties"]["area"] == "petersburg-city--agricultural-zoning"]
    if ag:
        city = jurisdiction_shape("city:Petersburg")
        rest = city.difference(unary_union([shape(f["geometry"]) for f in ag]).buffer(0))
        rest = set_precision(rest.buffer(0), 1e-5)
        features.append({"type": "Feature", "properties": {"area": "petersburg-city--non-agricultural", "name": ""}, "geometry": mapping(rest)})
        src = next(x for x in meta if x["id"] == "petersburg-city--agricultural-zoning")
        meta.append({**src, "id": "petersburg-city--non-agricultural",
                     "method": "City outline minus the agricultural zoning area", "notes": "Derived: " + src["notes"]})

    json.dump({"type": "FeatureCollection", "features": features}, open(OUT_GEO, "w", encoding="utf-8"))
    json.dump(sorted(meta, key=lambda x: x["id"]), open(OUT_META, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    print(f"{len(meta)} areas, {len(features)} features -> {OUT_GEO.name}, {OUT_META.name}")


if __name__ == "__main__":
    sys.exit(main())
