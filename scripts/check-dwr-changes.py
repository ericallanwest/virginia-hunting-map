"""Check DWR's regulation pages against the snapshots in sources/regs/.

Compares the readable text of each page (scripts, navigation and markup
stripped), so routine site changes don't count. Writes a Markdown report of
the pages that changed and, with --update, refreshes the snapshots.

Used by .github/workflows/watch-dwr.yml (weekly, April-September) to open a
GitHub issue when DWR publishes new or corrected regulations.

Usage: python3 scripts/check-dwr-changes.py [--report report.md] [--update]
"""
import argparse
import difflib
import os
import re
import sys
import time
import urllib.request
from pathlib import Path

from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
REGS = ROOT / "sources/regs"
BASE = "https://dwr.virginia.gov"

# snapshot file -> URL
PAGES = {
    "index.html": f"{BASE}/hunting/regulations/",
    "deer.html": f"{BASE}/hunting/regulations/deer/",
    "bear.html": f"{BASE}/hunting/regulations/bear/",
    "turkey.html": f"{BASE}/hunting/regulations/turkey/",
    "elk.html": f"{BASE}/hunting/regulations/elk/",
    "general.html": f"{BASE}/hunting/regulations/general/",
    "smallgame.html": f"{BASE}/hunting/regulations/smallgame/",
    "furbearerhunting.html": f"{BASE}/hunting/regulations/furbearerhunting/",
    "legal-use.html": f"{BASE}/hunting/regulations/legal-use-of-firearms-and-archery-tackle/",
    "local-ordinances.html": f"{BASE}/hunting/regulations/local-ordinances/",
    "elk-hunting.html": f"{BASE}/wildlife/elk/hunting/",
    "elk-lottery.html": f"{BASE}/wildlife/elk/hunting/elk-lottery/",
}
for line in (REGS / "local-ordinances/urls.txt").read_text().split():
    PAGES[f"local-ordinances/{line.rstrip('/').rsplit('/', 1)[-1]}.html"] = line


def text_of(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    main = soup.find("main") or soup.body or soup
    for t in main(["script", "style", "nav", "footer", "noscript", "form", "iframe"]):
        t.decompose()
    lines = (re.sub(r"\s+", " ", ln).strip() for ln in main.get_text("\n").split("\n"))
    return "\n".join(ln for ln in lines if ln)


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "virginia-hunting-map regulation watcher"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:
            if attempt == 2:
                raise
            time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", default="dwr-changes.md")
    ap.add_argument("--update", action="store_true", help="overwrite snapshots with the current pages")
    ap.add_argument("--only", help="check only snapshot names containing this text (e.g. deer)")
    args = ap.parse_args()
    pages = {k: v for k, v in PAGES.items() if not args.only or args.only in k}

    changed, failed = [], []
    for name, url in pages.items():
        path = REGS / name
        try:
            html = fetch(url)
        except Exception as e:  # report, don't stop the whole check
            failed.append(f"- {url}: {e}")
            continue
        old = text_of(path.read_text()) if path.exists() else ""
        new = text_of(html)
        if old != new:
            diff = list(difflib.unified_diff(old.splitlines(), new.splitlines(), "snapshot", "now", n=1, lineterm=""))
            changed.append((name, url, diff))
            if args.update:
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text(html, encoding="utf-8")
        time.sleep(0.5)  # be polite

    out = [f"Checked {len(pages)} DWR pages against the snapshots in `sources/regs/`.\n"]
    if changed:
        out.append(f"**{len(changed)} page(s) changed** — review and update the rules (see README, “Adding a license year or species”).\n")
        for name, url, diff in changed:
            body = "\n".join(diff[:120]) + ("\n… (diff truncated)" if len(diff) > 120 else "")
            out.append(f"### [{name}]({url})\n\n```diff\n{body}\n```\n")
    else:
        out.append("No changes.\n")
    if failed:
        out.append("Could not fetch:\n" + "\n".join(failed) + "\n")
    Path(args.report).write_text("\n".join(out), encoding="utf-8")

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a") as f:
            f.write(f"changed={'true' if changed else 'false'}\n")
    print(f"{len(changed)} changed, {len(failed)} failed of {len(pages)}")


if __name__ == "__main__":
    sys.exit(main())
