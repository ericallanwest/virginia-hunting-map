"""Check every link the app shows or cites, and report the broken ones.

Collects http(s) URLs from src/ (TypeScript and JSON: regulation sources, local
ordinance pages, installation and refuge sites) and index.html, requests each
one, and writes a Markdown report of the links that fail.

- Broken: DNS/connection errors, timeouts, or HTTP 404/410/5xx after retries.
- Blocked: HTTP 401/403/429 (often bot protection); listed separately, since
  the page usually works in a browser.

Used by .github/workflows/check-links.yml (weekly) to open a GitHub issue.

Usage: python3 scripts/check-links.py [--report links.md]
"""
import argparse
import os
import re
import sys
import time
import urllib.error
import urllib.request
from collections import defaultdict
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parent.parent
URL_RE = re.compile(r"https?://[^\s'\"`<>)\]\\]+")
# Templates and API endpoints, not pages a hunter opens.
SKIP = re.compile(r"\$\{|\{[a-z]\}|nominatim\.openstreetmap\.org/search|basemaps\.cartocdn\.com|tile\.openstreetmap\.org")
UA = "Mozilla/5.0 (compatible; virginia-hunting-map link checker)"


def collect() -> dict[str, set[str]]:
    files = [*ROOT.glob("src/**/*.ts"), *ROOT.glob("src/**/*.json"), ROOT / "index.html"]
    found: dict[str, set[str]] = defaultdict(set)
    for f in files:
        for url in URL_RE.findall(f.read_text(encoding="utf-8")):
            url = url.rstrip(".,;:'")
            if not SKIP.search(url) and urlsplit(url).hostname:
                found[url].add(str(f.relative_to(ROOT)).replace("\\", "/"))
    return found


def check(url: str) -> tuple[str, str]:
    """('ok' | 'broken' | 'blocked', detail)."""
    last = ""
    for attempt in range(3):
        for method in ("HEAD", "GET"):
            req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Accept": "*/*"})
            try:
                with urllib.request.urlopen(req, timeout=30) as r:
                    return "ok", str(r.status)
            except urllib.error.HTTPError as e:
                if e.code in (405, 501) and method == "HEAD":
                    continue  # server doesn't do HEAD; try GET
                if e.code in (401, 403, 429):
                    last = f"HTTP {e.code}"
                    if method == "GET":
                        return "blocked", last
                    continue
                last = f"HTTP {e.code}"
                if e.code in (404, 410):
                    if method == "GET":
                        return "broken", last
                    continue
            except Exception as e:  # DNS, TLS, timeout
                last = type(e).__name__ + (f": {e.reason}" if hasattr(e, "reason") else "")
        time.sleep(3 * (attempt + 1))
    return "broken", last


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", default="links.md")
    args = ap.parse_args()

    found = collect()
    urls = sorted(found)
    # A few hosts at a time, so no one site gets hammered.
    with ThreadPoolExecutor(max_workers=6) as pool:
        results = dict(zip(urls, pool.map(check, urls)))

    broken = [(u, d) for u, (s, d) in results.items() if s == "broken"]
    blocked = [(u, d) for u, (s, d) in results.items() if s == "blocked"]
    out = [f"Checked {len(urls)} links in `src/` and `index.html`.\n"]
    if broken:
        out.append(f"**{len(broken)} broken link(s)** — fix or replace them:\n")
        out += [f"- {u} — {d} (in {', '.join(sorted(found[u]))})" for u, d in broken]
        out.append("")
    else:
        out.append("No broken links.\n")
    if blocked:
        out.append(f"<details><summary>{len(blocked)} link(s) refused the checker (usually bot protection; check in a browser)</summary>\n")
        out += [f"- {u} — {d}" for u, d in blocked]
        out.append("\n</details>\n")
    Path(args.report).write_text("\n".join(out), encoding="utf-8")

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"broken={'true' if broken else 'false'}\n")
    print(f"{len(broken)} broken, {len(blocked)} blocked, {len(urls)} checked")


if __name__ == "__main__":
    sys.exit(main())
