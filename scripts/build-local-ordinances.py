"""Build src/regs/local-ordinances.json from reviewed extraction files.

Input: one or more JSON arrays (one object per DWR locality page) produced by
reading sources/regs/local-ordinances/*.html, with fields documented in
src/regs/local.ts. This script validates them against the map data and the
saved pages, then writes the app's data file.

Usage: python3 scripts/build-local-ordinances.py extracted/*.json
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "src/regs/local-ordinances.json"
PAGES = ROOT / "sources/regs/local-ordinances"

KINDS = {
    "no_firearm_discharge", "no_rifles", "rifle_caliber_limit", "shotgun_only", "shot_type", "no_hunting",
    "archery_restriction", "air_gun_restriction", "setback", "parcel_size", "permit_required", "dogs", "sunday", "other",
}
WEAPONS = {"all_firearms", "rifle", "pistol", "shotgun", "muzzleloader", "air_gun", "archery", "any"}
SPECIES = {"deer", "bear", "turkey", "elk", "all"}


def known_jurisdictions():
    ids = set()
    for f in json.load(open(ROOT / "public/data/jurisdictions.geojson"))["features"]:
        ids.add(f["properties"]["id"])
    for f in json.load(open(ROOT / "public/data/towns.geojson"))["features"]:
        ids.add(f["properties"]["id"])
    return ids


def page_text(slug):
    raw = (PAGES / f"{slug}.html").read_text()
    text = html.unescape(re.sub(r"<[^>]+>", " ", raw))
    return re.sub(r"\s+", " ", text)


def main(paths):
    known = known_jurisdictions()
    out, problems = [], []
    for p in paths:
        for loc in json.load(open(p)):
            jid = loc["jurisdiction"]
            if jid not in known:
                problems.append(f"{loc['slug']}: unknown jurisdiction {jid}")
            text = page_text(loc["slug"])
            rs = []
            for r in loc["restrictions"]:
                if r["kind"] not in KINDS:
                    problems.append(f"{loc['slug']}: bad kind {r['kind']}")
                if r["scope"] not in ("entire", "partial"):
                    problems.append(f"{loc['slug']}: bad scope {r['scope']}")
                if not set(r["species"]) <= SPECIES or not set(r["weapons"]) <= WEAPONS:
                    problems.append(f"{loc['slug']}: bad species/weapons {r['species']} {r['weapons']}")
                # The quote must really be on the page (whitespace-insensitive, ignoring ellipses).
                for piece in [q.strip() for q in re.split(r"\.\.\.|…", r["quote"]) if len(q.strip()) > 15]:
                    if re.sub(r"\s+", " ", piece) not in text:
                        problems.append(f"{loc['slug']}: quote not found on page: {piece[:60]!r}")
                rs.append({k: r.get(k, "") for k in ("kind", "scope", "area", "species", "weapons", "exceptions", "dates", "summary", "quote", "section")})
            out.append({
                "slug": loc["slug"],
                "jurisdiction": jid,
                "url": f"https://dwr.virginia.gov/local-ordinances/{loc['slug']}/",
                "restrictions": rs,
                "conflicts": loc.get("conflicts", []),
                "notes": loc.get("notes", ""),
            })
    out.sort(key=lambda l: l["jurisdiction"])
    for msg in problems:
        print("PROBLEM:", msg)
    json.dump(out, open(OUT, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    entire = sum(1 for l in out for r in l["restrictions"] if r["scope"] == "entire")
    print(f"{len(out)} localities, {sum(len(l['restrictions']) for l in out)} restrictions ({entire} locality-wide) -> {OUT}")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
