"""Watch the rule sources outside DWR's regulation pages for changes and newer sheets.

sources/rule-sources.json lists each source (refuge, base, state park, PALS, POWRR, preserve
pages and rule sheets), the license year its rules are for, and optionally URL patterns for
next year's sheet. For each source this script:

- compares the page's readable text (or a file's bytes) with sources/rule-sources-baseline.json;
- probes the `next` patterns for every license year after `year`, up to next year, to find a
  newer sheet that has been posted;
- lists sources still on an older license year's rules, as a reminder.

Writes a Markdown report and sets `changed=true` in GITHUB_OUTPUT when a source changed or a
newer sheet exists. Used by .github/workflows/watch-rule-sources.yml.

Usage: python3 scripts/check-rule-sources.py [--report report.md] [--update]
  --update  record the current content as the new baseline (after you've reviewed changes)
"""
import argparse
import datetime as dt
import difflib
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "sources/rule-sources.json"
BASELINE = ROOT / "sources/rule-sources-baseline.json"
UA = "Mozilla/5.0 (compatible; virginia-hunting-map rule-source watcher)"


def license_year(today: dt.date) -> int:
    return today.year if today.month >= 7 else today.year - 1


def fetch(url: str, method: str = "GET") -> tuple[int, bytes, str]:
    req = urllib.request.Request(url, method=method, headers={"User-Agent": UA, "Accept": "*/*"})
    for attempt in range(3):
        try:
            with urllib.request.urlopen(req, timeout=60) as r:
                return r.status, (r.read() if method == "GET" else b""), r.headers.get("Content-Type", "")
        except urllib.error.HTTPError as e:
            if e.code in (404, 410) or attempt == 2:
                return e.code, b"", ""
        except Exception:
            if attempt == 2:
                raise
        time.sleep(5 * (attempt + 1))
    raise RuntimeError("unreachable")


def page_text(html: str) -> str:
    """Readable text of a page's main content, ignoring scripts, navigation and markup."""
    from bs4 import BeautifulSoup

    soup = BeautifulSoup(html, "html.parser")
    main = soup.find("main") or soup.body or soup
    for t in main(["script", "style", "nav", "footer", "header", "noscript", "form", "iframe", "svg"]):
        t.decompose()
    lines = (re.sub(r"\s+", " ", ln).strip() for ln in main.get_text("\n").split("\n"))
    return "\n".join(ln for ln in lines if ln)


def fill(pattern: str, y: int) -> str:
    return pattern.format(y=y, y1=y + 1, yy=f"{y % 100:02d}", yy1=f"{(y + 1) % 100:02d}")


def exists(url: str) -> bool:
    status, _, ctype = fetch(url, "HEAD")
    if status in (403, 405):  # some servers refuse HEAD
        status, _, ctype = fetch(url)
    # Some sites answer a missing file with an HTML page and status 200.
    return status == 200 and not (url.lower().endswith(".pdf") and "html" in ctype)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--report", default="rule-sources.md")
    ap.add_argument("--update", action="store_true")
    args = ap.parse_args()

    sources = json.loads(MANIFEST.read_text(encoding="utf-8"))["sources"]
    baseline = json.loads(BASELINE.read_text(encoding="utf-8")) if BASELINE.exists() else {}
    ly = license_year(dt.date.today())

    changed, newer, failed, new_base = [], [], [], {}
    for s in sources:
        url = s["url"]
        try:
            status, body, ctype = fetch(url)
        except Exception as e:
            failed.append(f"- [{s['what']}]({url}): {e}")
            new_base[url] = baseline.get(url, {})
            continue
        if status != 200:
            failed.append(f"- [{s['what']}]({url}): HTTP {status}")
            new_base[url] = baseline.get(url, {})
            continue
        if "html" in ctype:
            text = page_text(body.decode("utf-8", "replace"))
            entry = {"sha256": hashlib.sha256(text.encode()).hexdigest(), "text": text}
        else:
            entry = {"sha256": hashlib.sha256(body).hexdigest(), "bytes": len(body)}
        old = baseline.get(url)
        if old and old.get("sha256") != entry["sha256"]:
            diff = []
            if "text" in old and "text" in entry:
                diff = list(difflib.unified_diff(old["text"].splitlines(), entry["text"].splitlines(), "baseline", "now", n=1, lineterm=""))
            changed.append((s, diff))
        new_base[url] = entry if (args.update or not old) else old

        for pattern in s.get("next", []):
            for y in range(s["year"] + 1, ly + 2):
                cand = fill(pattern, y)
                if cand != url and exists(cand):
                    newer.append(f"- **{s['what']}** ({s['used_in']}): {y}-{(y + 1) % 100:02d} sheet posted: {cand}")
        time.sleep(0.5)

    stale = [s for s in sources if s["year"] < ly]
    out = [f"Checked {len(sources)} rule sources listed in `sources/rule-sources.json` (license year {ly}-{(ly + 1) % 100:02d}).\n"]
    if newer:
        out.append(f"**Newer rule sheets posted ({len(newer)}):** update the rules and the source's `url` and `year`.\n")
        out += newer
        out.append("")
    if changed:
        out.append(f"**{len(changed)} source(s) changed** since the baseline. Review them, update the rules if needed, then run `python3 scripts/check-rule-sources.py --update` and commit the baseline.\n")
        for s, diff in changed:
            out.append(f"### [{s['what']}]({s['url']}) — `{s['used_in']}`\n")
            if diff:
                body = "\n".join(diff[:80]) + ("\n… (diff truncated)" if len(diff) > 80 else "")
                out.append(f"```diff\n{body}\n```\n")
            else:
                out.append("The file's contents changed.\n")
    if not newer and not changed:
        out.append("No changes and no newer sheets.\n")
    if stale:
        out.append(f"Still on an older year's rules ({len(stale)}):\n")
        out += [f"- {s['what']} ({s['year']}-{(s['year'] + 1) % 100:02d}): {s['url']}" for s in stale]
        out.append("")
    if failed:
        out.append("Could not fetch:\n" + "\n".join(failed) + "\n")
    Path(args.report).write_text("\n".join(out), encoding="utf-8")

    if args.update or any(u not in baseline for u in new_base):
        BASELINE.write_text(json.dumps(new_base, indent=1, ensure_ascii=False) + "\n", encoding="utf-8")

    if os.environ.get("GITHUB_OUTPUT"):
        with open(os.environ["GITHUB_OUTPUT"], "a", encoding="utf-8") as f:
            f.write(f"changed={'true' if (changed or newer) else 'false'}\n")
    print(f"{len(changed)} changed, {len(newer)} newer sheets, {len(stale)} on older rules, {len(failed)} failed of {len(sources)}")


if __name__ == "__main__":
    sys.exit(main())
