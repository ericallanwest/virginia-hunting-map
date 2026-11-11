#!/usr/bin/env bash
# Downloads raw boundary data into sources/geo (git-ignored) and snapshots the
# DWR regulation pages into sources/regs (committed, so rule changes can be diffed).
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p sources/geo sources/regs

# --- DWR regulation pages (re-run each license year and diff) ---
for p in "" deer bear elk turkey general; do
  f=${p:-index}
  curl -sSL "https://dwr.virginia.gov/hunting/regulations/$p/" -o "sources/regs/$f.html"
done

# --- Census cartographic boundaries (counties/independent cities, places/towns) ---
cd sources/geo
for f in cb_2023_us_county_500k cb_2023_51_place_500k; do
  curl -sSLO "https://www2.census.gov/geo/tiger/GENZ2023/shp/$f.zip"
  mkdir -p "$f" && (cd "$f" && unzip -oq "../$f.zip")
done

# --- Census TIGER roads for split lines (Rockingham 51165, Suffolk 51800) ---
mkdir -p roads
for f in 51165 51800; do
  curl -sSL -o "roads/tl_2023_${f}_roads.zip" "https://www2.census.gov/geo/tiger/TIGER2023/ROADS/tl_2023_${f}_roads.zip"
  (cd roads && unzip -oq "tl_2023_${f}_roads.zip")
done

# --- DWR Wildlife Management Area boundaries ---
curl -sS "https://services.dwr.virginia.gov/arcgis/rest/services/HUB_Layers/DWR_WMA_Boundaries/FeatureServer/0/query?where=1%3D1&outFields=WMA_NAME,Tract_Name,Property_Type,Owner,Property_Class,ACRES&outSR=4326&f=geojson" -o wma.geojson

# --- National Forest (USFS basic ownership) and DCR state forests/parks/Army Corps ---
python3 - <<'EOF'
import json, urllib.request, urllib.parse

def fetch(url, params, out):
    feats, off = [], 0
    while True:
        q = dict(params, f="geojson", outSR=4326, resultOffset=off, resultRecordCount=1000)
        d = json.load(urllib.request.urlopen(url + "?" + urllib.parse.urlencode(q), timeout=300))
        fs = d.get("features", [])
        feats += fs
        if len(fs) < 1000 and not d.get("properties", {}).get("exceededTransferLimit"):
            break
        off += len(fs)
    json.dump({"type": "FeatureCollection", "features": feats}, open(out, "w"))
    print(out, len(feats))

fetch("https://apps.fs.usda.gov/arcx/rest/services/EDW/EDW_BasicOwnership_02/MapServer/0/query",
      dict(where="forestname LIKE '%Washington%' AND ownerclassification='USDA FOREST SERVICE'",
           geometry="-83.7,36.5,-75.2,39.5", geometryType="esriGeometryEnvelope", inSR=4326,
           spatialRel="esriSpatialRelIntersects", outFields="forestname,ownerclassification",
           maxAllowableOffset=0.0003), "usfs.geojson")

fetch("https://services1.arcgis.com/PxUNqSbaWFvFgHnJ/arcgis/rest/services/VAConservationLands/FeatureServer/0/query",
      dict(where="MATYPE IN ('State Park','State Forest') OR MANAME LIKE '%Philpott%' OR MANAME LIKE '%Flannagan%'",
           outFields="MANAME,MATYPE,MAAGENCY,PUBACCESS", maxAllowableOffset=0.0002), "statelands.geojson")

fetch("https://services1.arcgis.com/fBc8EJBxQRMcHlei/arcgis/rest/services/NPS_Land_Resources_Division_Boundary_and_Tract_Data_Service/FeatureServer/2/query",
      dict(where="1=1", geometry="-83.7,36.5,-75.2,39.5", geometryType="esriGeometryEnvelope", inSR=4326,
           spatialRel="esriSpatialRelIntersects", outFields="UNIT_NAME,UNIT_TYPE,STATE",
           maxAllowableOffset=0.0002), "nps.geojson")
EOF
