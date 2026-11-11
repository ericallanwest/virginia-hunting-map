# Adding a new license year

Virginia's license year runs July 1 – June 30. The app keeps every year it has encoded
(older ones show an "Archived" banner), so adding a year never removes one.

The rule throughout: **hunters must never see last year's dates presented as this year's.**
A new year is built as a *draft* that only appears with `?draft=1` in the URL, under a red
"DRAFT" banner, until every file has been checked and the year is published.

## 1. Know when to start (April–August)

- The **Watch DWR regulation pages** workflow runs every Monday, April through September, and
  opens or updates a GitHub issue when DWR's regulation pages change. That issue is the signal.
- DWR usually posts the new digest (PDF and eRegulations web copy) in early summer.
- Migratory bird seasons (dove, waterfowl, woodcock, snipe) follow the federal frameworks and
  are set separately, usually in late summer. Expect a second pass for those.

## 2. Archive the sources

1. Download the digest PDF and record its sha256 (`Get-FileHash` / `sha256sum`).
2. Upload it to the `source-digests` GitHub release (it's too large for the repo):
   `gh release upload source-digests <file>.pdf` and add a line to the release notes.
3. Snapshot DWR's pages: `scripts/fetch-sources.sh` saves them under `sources/regs/`. Move the
   previous year's snapshots to `sources/regs/<YYYY-YY>/` first so both are kept.

## 3. Scaffold the draft

```sh
node scripts/new-license-year.mjs 2027
npx tsc
```

This copies every `src/regs/*-2026.ts` to `*-2027.ts`, renames the exports
(`deer2026` → `deer2027`, `SMALL_GAME` → `SMALL_GAME_2027`), sets `licenseYear`, adds a DRAFT
header to each file, and registers them in `DRAFT_REGS` in `src/regs/registry.ts`.

Open the app with `?draft=1` and a date in the new year to preview it.

## 4. Update every file against the new digest

Go through each `*-2027.ts` file section by section against the digest, citing page numbers in
comments as the existing files do. Things that almost always change:

- **Weekday-anchored dates:** opening Saturdays, youth/apprentice weekends, the Saturday before
  the third Monday in November, the last 20 days of spring turkey, and so on.
- County and city lists for either-sex days, antlerless-only days, bear and fall turkey groups.
- WMA, state forest, state park and National Forest tables.
- Bag limits, Earn-a-Buck and antler-point-restriction counties.
- Elk: the lottery hunt dates in `elk-2027.ts`.
- Spring turkey rule ids must stay `turkey-youth-spring`, `turkey-spring-noon` and
  `turkey-spring-allday` so the legal-hours rules in `src/sun.ts` keep working.

Write `docs/changes-2027.md` listing every difference from the previous year (see
`docs/changes-2025.md` for the format). It doubles as a review checklist.

Remove each file's DRAFT header once it has been fully verified.

## 5. Tests

Add `tests/year-2027.test.ts` with place × date checks that cite digest pages (see
`tests/year-2025.test.ts`). Cover at least the changed items from `docs/changes-2027.md` and
one check per county group. Run `npx tsc` and `npx vitest run`.

## 6. Publish

1. In `src/regs/registry.ts`, move the year's entries from `DRAFT_REGS` to `PUBLISHED` (newest
   first) and its imports out of the DRAFT-IMPORTS block.
2. Update the footer in `index.html` ("Regulations summarized from Virginia DWR's published
   2026–27 ...").
3. Check local ordinances: rerun `scripts/build-local-ordinances.py` after refreshing the
   snapshots, and review any changes in `src/regs/local-effects.ts`.
4. Push. The deploy runs the tests; check the live site on a few dates in the new year and in
   the previous year (which now shows the "Archived" banner after July 1).
