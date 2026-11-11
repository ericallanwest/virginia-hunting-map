"""Split jurisdictions that DWR divides along a road into separate polygons.

Reads public/data/jurisdictions.geojson and Census TIGER road files in
sources/geo/roads, and rewrites jurisdictions.geojson so split jurisdictions
become one feature per side, each with a `subArea` property ('east'/'west').

Lines:
  Rockingham County - Routes 613 and 731 (as used in the deer regulations).
  City of Suffolk   - the "Dismal Swamp Line", 4VAC15-20-40: State Highway 10
      from the Isle of Wight line to the (old) Suffolk corporate limits, through
      them to SR 642 (White Marsh Road), along 642 to SR 604 (Desert Road), then
      along 604 to the North Carolina line. The short hop "through the corporate
      limits" downtown is approximated by a straight segment.

Run via scripts/build-geo.sh (needs: pip install -r scripts/requirements.txt).
"""
import json
import sys

import shapefile
from shapely.geometry import LineString, MultiLineString, Point, mapping, shape
from shapely import set_precision
from shapely.ops import linemerge, nearest_points, split, substring, unary_union

JUR = sys.argv[1] if len(sys.argv) > 1 else "public/data/jurisdictions.geojson"
ROADS = "sources/geo/roads/tl_2023_{}_roads"


def road(fips, names):
    r = shapefile.Reader(ROADS.format(fips))
    parts = [shape(s.__geo_interface__) for s, rec in zip(r.shapes(), r.records()) if rec["FULLNAME"] in names]
    merged = linemerge(unary_union(parts))
    return list(merged.geoms) if isinstance(merged, MultiLineString) else [merged]


def longest(lines):
    return max(lines, key=lambda l: l.length)


def cut_at(line, pt, keep):
    """Cut `line` at the point nearest `pt`; keep the 'north' or 'south' part."""
    d = line.project(pt)
    a, b = substring(line, 0, d), substring(line, d, line.length)
    north = a if max(y for _, y in a.coords) > max(y for _, y in b.coords) else b
    return north if keep == "north" else (b if north is a else a)


def chain(*lines):
    """Join lines end-to-start (orienting each to continue from the previous end)."""
    coords = list(lines[0].coords)
    if len(lines) > 1 and Point(coords[0]).distance(lines[1]) < Point(coords[-1]).distance(lines[1]):
        coords.reverse()  # make the first line end where the second begins
    for l in lines[1:]:
        c = list(l.coords)
        if Point(c[-1]).distance(Point(coords[-1])) < Point(c[0]).distance(Point(coords[-1])):
            c.reverse()
        coords += c
    return LineString(coords)


def extend(line, dist=0.03):
    """Extend both ends a little so the line fully crosses the boundary."""
    c = list(line.coords)

    def ext(p, q):
        dx, dy = p[0] - q[0], p[1] - q[1]
        n = (dx * dx + dy * dy) ** 0.5 or 1
        return (p[0] + dx / n * dist, p[1] + dy / n * dist)

    return LineString([ext(c[0], c[1])] + c + [ext(c[-1], c[-2])])


def north_to_south(line):
    c = list(line.coords)
    return LineString(c if c[0][1] > c[-1][1] else c[::-1])


def side(line, poly):
    """'west' if the piece lies to the right of a north->south line, else 'east'."""
    p = poly.representative_point()
    d = line.project(p)
    a = line.interpolate(max(d - 0.002, 0))
    b = line.interpolate(min(d + 0.002, line.length))
    cross = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
    return "west" if cross < 0 else "east"


def rockingham():
    # 613 runs from the northeast county line to its junction with 731, then 731
    # continues to the southwest county line. 613 also continues south past the
    # junction; that part is not the dividing line.
    r613 = longest(road("51165", {"State Rte 613"}))
    r731 = longest(road("51165", {"State Rte 731"}))
    junction = nearest_points(r731, r613)[1]
    return chain(cut_at(r613, junction, "north"), r731)


def suffolk():
    r10 = linemerge(unary_union(road("51800", {"State Rte 10"})))
    r10 = LineString([c for g in getattr(r10, "geoms", [r10]) for c in g.coords])
    r10 = LineString(sorted(r10.coords, key=lambda c: -c[1]))  # north -> south
    r642 = longest(road("51800", {"Co Rd 642", "White Marsh Rd"}))
    r604 = [l for l in road("51800", {"Co Rd 604", "Desert Rd"}) if min(y for _, y in l.coords) < 36.6]
    r604 = longest(r604)
    junction = nearest_points(r642, r604)[0]
    return chain(r10, cut_at(r642, junction, "north"), cut_at(r604, junction, "south"))


LINES = {"county:Rockingham": rockingham, "city:Suffolk": suffolk}


def main():
    fc = json.load(open(JUR))
    out = []
    for f in fc["features"]:
        jid = f["properties"]["id"]
        if jid not in LINES:
            out.append(f)
            continue
        line = north_to_south(LINES[jid]()).simplify(0.0002)  # ~20 m; matches the map's detail
        poly = shape(f["geometry"])
        pieces = split(poly, extend(line)).geoms
        by_side = {}
        for piece in pieces:
            by_side.setdefault(side(line, piece), []).append(piece)
        if set(by_side) != {"east", "west"}:
            sys.exit(f"{jid}: split produced sides {sorted(by_side)}")
        for s, polys in sorted(by_side.items()):
            g = set_precision(unary_union(polys), 1e-5)
            out.append({"type": "Feature", "properties": {**f["properties"], "subArea": s}, "geometry": mapping(g)})
            print(f"{jid} {s}: {len(polys)} piece(s), {g.area / poly.area:.0%} of area")
    fc["features"] = out
    json.dump(fc, open(JUR, "w"), separators=(",", ":"))


if __name__ == "__main__":
    main()
