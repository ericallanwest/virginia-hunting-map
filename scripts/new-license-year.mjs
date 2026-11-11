#!/usr/bin/env node
/**
 * Scaffold a new license year as a DRAFT copy of the latest one.
 *
 *   node scripts/new-license-year.mjs 2027          # copies src/regs/*-2026.ts -> *-2027.ts
 *
 * For every src/regs/<name>-<prev>.ts it writes <name>-<new>.ts with:
 * - imports of other <x>-<prev> files pointed at <x>-<new>;
 * - every exported name renamed for the new year (deer2026 -> deer2027,
 *   SMALL_GAME -> SMALL_GAME_2027, BEAR_GROUPS_2025-style names keep the pattern);
 * - `licenseYear: <prev>` -> `licenseYear: <new>`;
 * - a DRAFT header: every date is still LAST YEAR'S until checked against the new digest.
 *
 * It then registers each file's SpeciesRegs exports in DRAFT_REGS (src/regs/registry.ts),
 * so the year shows only with ?draft=1 under a draft banner. Nothing else changes.
 * See docs/NEW-LICENSE-YEAR.md for the full checklist.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const next = Number(process.argv[2]);
if (!Number.isInteger(next) || next < 2027) {
  console.error('usage: node scripts/new-license-year.mjs <new license year, e.g. 2027>');
  process.exit(1);
}
const prev = next - 1;
const dir = join(import.meta.dirname, '..', 'src', 'regs');
const label = (y) => `${y}-${String((y + 1) % 100).padStart(2, '0')}`;

const files = readdirSync(dir).filter((f) => f.endsWith(`-${prev}.ts`));
if (!files.length) throw new Error(`no src/regs/*-${prev}.ts files to copy`);
const already = files.filter((f) => existsSync(join(dir, f.replace(`-${prev}.ts`, `-${next}.ts`))));
if (already.length) throw new Error(`already exists for ${next}: ${already.join(', ')}`);

// Exported names across the year's files, and their new-year names.
const rename = new Map();
const exportRe = /^export\s+(?:const|function|let)\s+([A-Za-z_$][\w$]*)/gm;
for (const f of files) {
  for (const [, name] of readFileSync(join(dir, f), 'utf8').matchAll(exportRe)) {
    rename.set(name, name.includes(String(prev)) ? name.replaceAll(String(prev), String(next)) : `${name}_${next}`);
  }
}
// Whole identifiers only, never inside paths or URLs (e.g. the `regs` helper vs sources/regs/).
const word = (name) => new RegExp(`(?<![\\w$/.-])${name.replace(/\$/g, '\\$')}(?![\\w$/-])`, 'g');

const draftExports = [];
const today = new Date().toISOString().slice(0, 10);
for (const f of files) {
  const out = f.replace(`-${prev}.ts`, `-${next}.ts`);
  let src = readFileSync(join(dir, f), 'utf8');
  src = src.replace(new RegExp(`(from\\s+'\\./[\\w-]+)-${prev}'`, 'g'), `$1-${next}'`);
  for (const [from, to] of rename) src = src.replace(word(from), to);
  src = src.replace(new RegExp(`licenseYear:\\s*${prev}\\b`, 'g'), `licenseYear: ${next}`);
  const header =
    `// DRAFT ${label(next)}: copied from ${f} by scripts/new-license-year.mjs on ${today}.\n` +
    `// Every date, county list, and limit below is still ${label(prev)}'s until checked against\n` +
    `// the ${label(next)} digest. Weekday-anchored dates (opening Saturdays, youth weekends)\n` +
    `// almost always move. Remove this header when the file has been fully verified.\n`;
  writeFileSync(join(dir, out), header + src);

  // SpeciesRegs exports: `export const x: SpeciesRegs`, `= regs(`, `= deriveElk(`, and arrays of them.
  for (const m of src.matchAll(/^export const ([\w$]+)(?::\s*SpeciesRegs\b|\s*=\s*(?:regs\w*|deriveElk)\(|\s*=\s*\[)/gm)) {
    const isArray = /=\s*\[/.test(m[0]);
    // Arrays of regs (FURBEARERS, SMALL_GAME) cover their members; skip members also listed in one.
    draftExports.push({ name: m[1], file: out.replace(/\.ts$/, ''), isArray });
  }
  console.log(`wrote src/regs/${out}`);
}

// Register arrays of regs (SMALL_GAME, FURBEARERS) and the regs not already in one of them.
const regsNames = new Set(draftExports.filter((e) => !e.isArray).map((e) => e.name));
const members = (e) =>
  readFileSync(join(dir, `${e.file}.ts`), 'utf8')
    .match(new RegExp(`export const ${e.name}\\s*=\\s*\\[([^\\]]*)\\]`))?.[1]
    .split(/[,\s.]+/)
    .filter((n) => regsNames.has(n)) ?? [];
const regsArrays = draftExports.filter((e) => e.isArray && members(e).length);
const covered = new Set(regsArrays.flatMap(members));
const entries = [...regsArrays, ...draftExports.filter((e) => !e.isArray && !covered.has(e.name))];

const reg = join(dir, 'registry.ts');
let registry = readFileSync(reg, 'utf8');
const byFile = new Map();
for (const e of entries) byFile.set(e.file, [...(byFile.get(e.file) ?? []), e.name]);
const imports = [...byFile].map(([file, names]) => `import { ${names.join(', ')} } from './${file}';`).join('\n');
const list = entries.map((e) => (e.isArray ? `...${e.name}` : e.name)).join(', ');
registry = registry
  .replace('// DRAFT-IMPORTS (managed by scripts/new-license-year.mjs)', `// DRAFT-IMPORTS (managed by scripts/new-license-year.mjs)\n${imports}`)
  .replace('  // DRAFT-ENTRIES', `  // DRAFT-ENTRIES\n  // ${label(next)} (draft)\n  ${list},`);
writeFileSync(reg, registry);
console.log(`registered in DRAFT_REGS: ${list}`);
console.log(`\nNext: npx tsc, then open the app with ?draft=1 and a ${label(next)} date. See docs/NEW-LICENSE-YEAR.md.`);
