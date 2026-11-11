"""Split jurisdictions that DWR divides along a road into separate polygons.

Reads public/data/jurisdictions.geojson and Census TIGER road files in
sources/geo/roads, and rewrites jurisdictions.geojson so split jurisdictions
become one feature per side, each with a `subArea` property: a token per
line, joined with '+' when a county is cut by two lines (e.g. 's81+w16').

Lines (see PARTITIONS at the bottom):
  Rockingham County - Routes 613 and 731 (as used in the deer regulations).
  I-81              - Montgomery, Pulaski, Roanoke, Washington, Smyth (bear hound rules).
  State Rt. 16      - Grayson, Smyth. New River - Carroll, Grayson.
  Campbell, Pittsylvania - the Norfolk Southern main line (Lynchburg-Danville).
  Amherst, Nelson   - US 29 and State Rt. 151.
  I-95              - every jurisdiction it crosses (grouse is open only west of I-95).
  Wythe             - the area bounded by Rt. 21, I-81, the New River and Cripple Creek,
                      plus land southeast of the New River.
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


# ---------------------------------------------------------------------------
# I-95 (grouse season is "west of I-95"): one route from the Woodrow Wilson Bridge
# to the North Carolina line, traced through TIGER primary roads.
# ---------------------------------------------------------------------------
PRIMARY = "sources/geo/roads/tl_2023_us_primaryroads"
_i95 = None


def shortest_path(segments, start, goal, join=0.002):
    """Shortest path through a network of line segments ((coords, cost-multiplier) pairs)."""
    import heapq

    key = lambda c: (round(c[0], 5), round(c[1], 5))
    graph, ends = {}, []
    for coords, mult in segments:
        pts = [key(c) for c in coords]
        for a, b in zip(pts, pts[1:]):
            d = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5 * mult
            graph.setdefault(a, []).append((b, d))
            graph.setdefault(b, []).append((a, d))
        ends += [pts[0], pts[-1]]
    for i, a in enumerate(ends):  # join segment ends that stop just short of each other
        for b in ends[i + 1 :]:
            d = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
            if 0 < d < join:
                graph[a].append((b, d * 3))
                graph[b].append((a, d * 3))
    nodes = list(graph)
    near = lambda p: min(nodes, key=lambda n: (n[0] - p[0]) ** 2 + (n[1] - p[1]) ** 2)
    s, g = near(start), near(goal)
    dist, prev, heap = {s: 0}, {}, [(0, s)]
    while heap:
        d, n = heapq.heappop(heap)
        if n == g:
            break
        if d > dist[n]:
            continue
        for m, w in graph[n]:
            if d + w < dist.get(m, 1e9):
                dist[m], prev[m] = d + w, n
                heapq.heappush(heap, (d + w, m))
    if g not in prev:
        sys.exit(f"no path from {start} to {goal}")
    path, n = [g], g
    while n != s:
        n = prev[n]
        path.append(n)
    return LineString(path[::-1])


def i95():
    global _i95
    if _i95 is None:
        r = shapefile.Reader(PRIMARY)
        segs = []
        for s, rec in zip(r.shapes(), r.records()):
            if rec["FULLNAME"] != "I- 95":
                continue
            x0, y0, x1, y1 = s.bbox
            if x1 < -78.5 or x0 > -76.5 or y1 < 36.4 or y0 > 39.0:
                continue
            segs.append((s.points, 1))
        _i95 = shortest_path(segs, (-77.04, 38.795), (-77.53, 36.545))  # Wilson Bridge -> NC line
    return _i95


def by_i95(poly):
    """west/east of I-95 ('w95'/'e95'), by side of the north->south route."""
    line = north_to_south(i95()).simplify(0.0002)
    return [("w95" if side(line, pc) == "west" else "e95", pc) for pc in split(poly, extend(line)).geoms]


I95_JURISDICTIONS = [
    "city:Alexandria", "city:Colonial Heights", "city:Emporia", "city:Fredericksburg", "city:Petersburg",
    "city:Richmond", "county:Caroline", "county:Chesterfield", "county:Fairfax", "county:Greensville",
    "county:Hanover", "county:Henrico", "county:Prince George", "county:Prince William", "county:Spotsylvania",
    "county:Stafford", "county:Sussex",
]

# ---------------------------------------------------------------------------
# Generic lines: a named road (TIGER roads) or river (TIGER linear water).
# Where a river widens, TIGER stores it as area water and the line has gaps;
# parts are joined in order along the line's main direction, bridging gaps.
# ---------------------------------------------------------------------------
WATER = "sources/geo/water/tl_2023_{}_linearwater"


def features(path, names):
    r = shapefile.Reader(path)
    return [shape(s.__geo_interface__) for s, rec in zip(r.shapes(), r.records()) if rec["FULLNAME"] in names]


def joined(parts):
    merged = linemerge(unary_union(parts)) if len(parts) > 1 else parts[0]
    lines = list(merged.geoms) if isinstance(merged, MultiLineString) else [merged]
    xs = [c[0] for l in lines for c in l.coords]
    ys = [c[1] for l in lines for c in l.coords]
    axis = 0 if max(xs) - min(xs) >= max(ys) - min(ys) else 1
    # Divided highways have a line per direction: keep only parts that extend
    # the stretch already covered (one carriageway), longest first.
    span = lambda l: (min(c[axis] for c in l.coords), max(c[axis] for c in l.coords))
    kept = []
    for l in sorted(lines, key=lambda l: -l.length):
        lo, hi = span(l)
        covered = sum(max(0, min(hi, khi) - max(lo, klo)) for klo, khi in map(span, kept))
        if covered < 0.5 * (hi - lo):
            kept.append(l)
    kept.sort(key=lambda l: span(l)[0])
    return chain(*kept) if len(kept) > 1 else kept[0]


def route(fips, *names):
    return joined(features(ROADS.format(fips), set(names)))


def river(fips, *names):
    return joined(features(WATER.format(fips), set(names)))


def sign(line, poly):
    p = poly.representative_point()
    d = line.project(p)
    a = line.interpolate(max(d - 0.002, 0))
    b = line.interpolate(min(d + 0.002, line.length))
    return (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x) > 0


def by_line(line, refs):
    """Partition by one line. `refs` maps two tokens to a (lon, lat) known to be on that side."""
    line = line.simplify(0.0002)

    def part(poly):
        pieces = list(split(poly, extend(line, 0.05)).geoms)
        sign_of = {}
        for tok, pt in refs.items():
            hit = next((pc for pc in pieces if pc.contains(Point(pt))), None)
            if hit is None:
                sys.exit(f"reference point for {tok} not inside the jurisdiction")
            sign_of[sign(line, hit)] = tok
        if len(sign_of) != 2:
            sys.exit(f"reference points {refs} fell on the same side")
        return [(next(t for t, pt in refs.items() if pc.contains(Point(pt))) if any(pc.contains(Point(pt)) for pt in refs.values()) else sign_of[sign(line, pc)], pc) for pc in pieces]

    return part


def to_boundary(line, poly, reach=0.03):
    """Connect each loose end of `line` to the county border when it stops just short of it."""
    c = list(line.coords)
    border = poly.boundary
    for i in (0, -1):
        end = Point(c[i])
        if 0 < border.distance(end) < reach:
            pt = nearest_points(end, border)[1].coords[0]
            c = [pt] + c if i == 0 else c + [pt]
    return LineString(c)


def by_line_lazy(line_fn, refs):
    """by_line, building the line only when the partition is used."""
    return lambda poly: by_line(line_fn(), refs)(poly)


def by_faces(lines, token, refs, other):
    """Partition by several lines: faces containing a reference point get `token`, the rest `other`."""
    lines = [l.simplify(0.0002) for l in lines]

    def part(poly):
        faces = [poly]
        for l in lines:
            l = to_boundary(l, poly)
            faces = [f for face in faces for f in split(face, extend(l, 0.003)).geoms]
        return [(token if any(f.contains(Point(pt)) for pt in refs) else other, f) for f in faces]

    return part


def by_side_ew(line_fn):
    """Original east/west split (Rockingham, Suffolk): side of a north->south line."""

    def part(poly):
        line = north_to_south(line_fn()).simplify(0.0002)  # ~20 m; matches the map's detail
        return [(side(line, pc), pc) for pc in split(poly, extend(line)).geoms]

    return part


I81 = lambda fips: route(fips, "I- 81")

RAILS = "sources/geo/rails/tl_2023_us_rails"
_ns_main = None


def ns_mainline():
    """Norfolk Southern main line Lynchburg -> Altavista -> Chatham -> Danville.

    Campbell and Pittsylvania have several NS lines; the one "west of the Norfolk
    Southern Railroad" refers to is the north-south main line. It is found as the
    shortest path through the NS track network between Lynchburg and Danville.
    """
    global _ns_main
    if _ns_main:
        return _ns_main
    import heapq

    bbox = (-79.8, 36.5, -78.8, 37.5)
    r = shapefile.Reader(RAILS)
    graph = {}
    key = lambda c: (round(c[0], 5), round(c[1], 5))
    # Prefer Norfolk Southern track; unnamed track segments may fill gaps at a high cost.
    cost = {"Norfolk Southern Rlwy": 1, "Southern Rlwy": 1, "Railway": 5, "": 5}
    ends = []
    for s, rec in zip(r.shapes(), r.records()):
        if rec["FULLNAME"] not in cost:
            continue
        x0, y0, x1, y1 = s.bbox
        if x1 < bbox[0] or x0 > bbox[2] or y1 < bbox[1] or y0 > bbox[3]:
            continue
        pts = [key(c) for c in s.points]
        for a, b in zip(pts, pts[1:]):
            d = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5 * cost[rec["FULLNAME"]]
            graph.setdefault(a, []).append((b, d))
            graph.setdefault(b, []).append((a, d))
        ends += [pts[0], pts[-1]]
    # Segments often stop a few meters short of each other: join ends within ~200 m.
    for i, a in enumerate(ends):
        for b in ends[i + 1 :]:
            d = ((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2) ** 0.5
            if 0 < d < 0.002:
                graph[a].append((b, d * 3))
                graph[b].append((a, d * 3))
    nodes = list(graph)
    near = lambda p: min(nodes, key=lambda n: (n[0] - p[0]) ** 2 + (n[1] - p[1]) ** 2)
    start, goal = near((-79.17, 37.39)), near((-79.40, 36.59))  # Lynchburg, Danville
    dist, prev, heap = {start: 0}, {}, [(0, start)]
    while heap:
        d, n = heapq.heappop(heap)
        if n == goal:
            break
        if d > dist[n]:
            continue
        for m, w in graph[n]:
            if d + w < dist.get(m, 1e9):
                dist[m], prev[m] = d + w, n
                heapq.heappush(heap, (d + w, m))
    if goal not in prev:
        sys.exit("no Norfolk Southern path from Lynchburg to Danville")
    path, n = [goal], goal
    while n != start:
        n = prev[n]
        path.append(n)
    _ns_main = LineString(path[::-1])
    return _ns_main


def cripple_to_new_river():
    """Cripple Creek flows into the New River; TIGER's creek line stops just short of it."""
    creek, nr = river("51197", "Cripple Crk"), river("51197", "New Riv")
    c = list(creek.coords)
    if c[0][0] > c[-1][0]:
        c.reverse()  # west -> east, ending at the confluence
    mouth = nearest_points(Point(c[-1]), nr)[1]
    return LineString(c + [mouth.coords[0]])

PARTITIONS = {
    "county:Rockingham": [by_side_ew(rockingham)],
    "city:Suffolk": [by_side_ew(suffolk)],
    # I-81
    "county:Montgomery": [by_line(I81("51121"), {"s81": (-80.40, 37.05), "n81": (-80.35, 37.25)})],
    "county:Pulaski": [by_line(I81("51155"), {"s81": (-80.75, 36.95), "n81": (-80.75, 37.10)})],
    "county:Roanoke": [by_line(I81("51161"), {"s81": (-80.05, 37.22), "n81": (-80.05, 37.38)})],
    "county:Washington": [by_line(I81("51191"), {"s81": (-81.95, 36.65), "n81": (-81.95, 36.80)})],
    # I-81 and State Rt. 16
    "county:Smyth": [
        by_line(I81("51173"), {"s81": (-81.55, 36.72), "n81": (-81.55, 36.92)}),
        by_line(route("51173", "State Rte 16"), {"e16": (-81.40, 36.95), "w16": (-81.65, 36.85)}),
    ],
    # New River and State Rt. 16
    "county:Grayson": [
        by_line(river("51077", "New Riv"), {"enr": (-80.98, 36.62), "wnr": (-81.20, 36.70)}),
        by_line(route("51077", "State Rte 16"), {"e16": (-81.20, 36.68), "w16": (-81.55, 36.65)}),
    ],
    # Norfolk Southern main line (bear hounds, hound training; deer dogs and EAB nearby)
    "county:Campbell": [by_line_lazy(ns_mainline, {"west": (-79.33, 37.20), "east": (-79.00, 37.15)})],
    "county:Pittsylvania": [by_line_lazy(ns_mainline, {"west": (-79.60, 36.85), "east": (-79.20, 36.80)})],
    # US 29 (Amherst) and State Rt. 151 (Nelson): Earn-a-Buck and deer/bear dog rules.
    # "Rt. 29" is read as today's US 29 (the bypass), not Business 29 through Madison Heights.
    "county:Amherst": [by_line(route("51009", "US Hwy 29"), {"west": (-79.30, 37.60), "east": (-79.03, 37.47)})],
    "county:Nelson": [by_line(route("51125", "State Rte 151", "State Hwy 151"), {"west": (-79.08, 37.82), "east": (-78.80, 37.75)})],
    # New River
    "county:Carroll": [by_line(river("51035", "New Riv"), {"enr": (-80.75, 36.75), "wnr": (-80.975, 36.79)})],
    # Wythe: "southeast of the New River or that part bounded by Rt. 21 on the west, I-81 on the
    # north, the county line on the east, the New River on the southeast and Cripple Creek on the south"
    "county:Wythe": [
        by_faces(
            [I81("51197"), route("51197", "US Hwy 21"), cripple_to_new_river(), river("51197", "New Riv")],
            "senr",
            [(-80.98, 36.92), (-80.86, 36.856)],  # inside the bounded area; southeast of the New River
            "other",
        )
    ],
}


for _jid in I95_JURISDICTIONS:
    PARTITIONS.setdefault(_jid, []).append(by_i95)


def main():
    fc = json.load(open(JUR))
    out = []
    for f in fc["features"]:
        jid = f["properties"]["id"]
        if jid not in PARTITIONS:
            out.append(f)
            continue
        poly = shape(f["geometry"])
        # Intersect the partitions: each resulting piece carries one token per line, joined by '+'.
        pieces = [((), poly)]
        for part in PARTITIONS[jid]:
            # Each line partitions the whole county; intersect with the pieces so far.
            sides = {}
            for tok, sub in part(poly):
                sides[tok] = unary_union([sides[tok], sub]) if tok in sides else sub
            nxt = []
            for toks, pc in pieces:
                for tok, side_poly in sides.items():
                    sub = pc.intersection(side_poly)
                    if sub.area > 1e-6 * poly.area:
                        nxt.append((toks + (tok,), sub))
            pieces = nxt
        by_tok = {}
        for toks, pc in pieces:
            by_tok.setdefault("+".join(toks), []).append(pc)
        if len(by_tok) < 2:
            sys.exit(f"{jid}: split produced only {sorted(by_tok)}")
        for tok, polys in sorted(by_tok.items()):
            g = set_precision(unary_union(polys), 1e-5)
            out.append({"type": "Feature", "properties": {**f["properties"], "subArea": tok}, "geometry": mapping(g)})
            print(f"{jid} {tok}: {len(polys)} piece(s), {g.area / poly.area:.0%} of area")
    fc["features"] = out
    json.dump(fc, open(JUR, "w", encoding="utf-8"), separators=(",", ":"))


if __name__ == "__main__":
    main()
