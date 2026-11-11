import { dayOfLicenseYear, fmt, fmtRange, resolve } from './regs/dates';
import { evaluate, nextChange, seasonsForPlace, WEAPON_OF, type DayTake, type PlaceSeason } from './regs/engine';
import type { InfoTopic, Place, SeasonRule, SpeciesRegs } from './regs/types';
import { splitFor } from './regs/virginia';
import { LOCAL_AREAS, localConflicts, localFor } from './regs/local';
import { fmtTime, hoursFor, legalWindow, sunDay, zoneName, type Hours } from './sun';
import { jurisdictionLabel, type Located } from './geo';
import { speciesInfo } from './regs/index';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const LAND_LABEL: Record<Place['land'], string> = {
  private: 'Private land',
  national_forest: 'National Forest',
  dwr: 'DWR Wildlife Management Area',
  state_forest: 'State Forest',
  state_park: 'State Park',
  army_corps: 'Army Corps of Engineers land',
  nps: 'National Park Service land',
  military: 'Military installation',
  refuge: 'National Wildlife Refuge',
  other_public: 'Public land',
};

const TAKE_LABEL: Record<DayTake, string> = {
  'either-sex': 'Either sex',
  antlered: 'Antlered only',
  antlerless: 'Antlerless only',
  any: 'Any legal animal',
  bearded: 'Bearded only',
  none: 'No take',
  quota: 'Lottery / quota',
  check: 'Check posted rules',
};

const TAKE_ANY: Partial<Record<string, string>> = { bear: 'Any legal bear', elk: 'Any elk', deer: 'Any deer', turkey: 'Any turkey' };
// Small game and furbearers have no sex/antler rules, so 'any' needs no badge there.
const takeLabel = (t: DayTake, species: string) => (t === 'any' ? TAKE_ANY[species] ?? '' : TAKE_LABEL[t]);

const LOCAL_LABEL: Record<string, string> = {
  firearms: 'Local limits apply',
  shotgun: 'Local ordinance: no rifles',
  muzzleloader: 'Local ordinance: muzzleloader/archery only',
  archery: 'Local ordinance: archery only',
  none: 'Local ordinance: no legal weapon',
};

const DOGS_LABEL = { yes: 'Dogs allowed', no: 'No dogs', varies: 'Dogs: varies by area' } as const;

const TOPIC_LABEL: Record<InfoTopic, string> = {
  zone: 'Zones',
  local: 'Local restrictions',
  access: 'Access',
  hours: 'Hunting hours',
  bag: 'Bag limits',
  license: 'Licenses, permits & stamps',
  eab: 'Earn a Buck',
  apr: 'Antler point restriction',
  bonus: 'Bonus permits',
  dogs: 'Dogs',
  methods: 'Methods & reporting',
};

export interface DetailsInput {
  located: Located;
  regs: SpeciesRegs;
  iso: string;
  includeYouth: boolean;
  subArea?: string;
  /** [lat, lng] for sunrise/sunset and legal hours. */
  latLng?: [number, number];
}

export function renderDetails({ located, regs, iso, includeYouth, subArea, latLng }: DetailsInput): string {
  const jurId: string = located.jurisdiction?.properties.id;
  const split = splitFor(jurId);
  // Mapped splits: the side comes from the map. Unmapped ones: ask (default to the first side).
  const askSide = !!split && !split.mapped;
  const place: Place = askSide
    ? { ...located.place, subArea: subArea ?? Object.keys(split!.parts)[0] }
    : { ...located.place, subArea: split ? located.place.subArea : undefined };
  const ev = evaluate(regs, place, iso, { includeYouth });
  const seasons = seasonsForPlace(regs, place).filter((s) => includeYouth || !s.rule.youthOnly);
  const next = nextChange(regs, place, iso);

  const where = [
    place.property ? `<strong>${esc(place.property)}</strong>` : '',
    place.town ? `Town of ${esc(place.town)}` : '',
    esc(jurisdictionLabel(jurId, split?.mapped ? place.subArea : undefined)),
  ].filter(Boolean);

  const splitHtml = askSide && split
    ? `<div class="split">
        <div class="split-q">This ${jurId.startsWith('city') ? 'city' : 'county'} is divided by ${esc(split.line)}. Which side?</div>
        <div class="seg" role="radiogroup">
          ${Object.entries(split.parts)
            .map(
              ([k, label]) =>
                `<button type="button" role="radio" aria-checked="${k === place.subArea}" data-subarea="${k}">${esc(label)}</button>`,
            )
            .join('')}
        </div>
      </div>`
    : '';

  const openHtml = ev.open.length
    ? `<ul class="open-list">${ev.open
        .map(
          (o) => `<li class="${(o.rule.youthOnly && !includeYouth) || o.rule.type === 'chase' ? 'muted' : ''}">
            <span class="weapon w-${WEAPON_OF[o.rule.type]}">${esc(o.rule.label)}</span>
            ${takeLabel(o.take, regs.species) ? `<span class="take t-${o.take}">${takeLabel(o.take, regs.species)}</span>` : ''}
            ${o.dogs ? `<span class="tag dogs-${o.dogs}">${DOGS_LABEL[o.dogs]}</span>` : ''}
            ${o.local.length ? `<span class="tag local">${LOCAL_LABEL[o.weapon]}</span>` : ''}
            ${o.local.map((e) => `<div class="note">${esc(e.note)} (${esc(e.jurisdiction.split(':')[1])} ${esc(e.section)})</div>`).join('')}
            ${o.rule.youthOnly ? '<span class="tag">Youth/apprentice only</span>' : ''}
            ${o.rule.partialNote ? `<div class="note"><strong>${esc(o.rule.partialNote)}</strong></div>` : ''}
            ${o.dogsNote ? `<div class="note">${esc(o.dogsNote)}</div>` : ''}
            ${o.note ? `<div class="note">${esc(o.note)}</div>` : ''}
            ${(o.rule.notes ?? []).map((n) => `<div class="note">${esc(n)}</div>`).join('')}
          </li>`,
        )
        .join('')}</ul>`
    : `<p class="closed-msg">No ${esc(speciesInfo(regs.species).label.toLowerCase())} season is open here on this date.</p>`;
  const onlyChase = ev.open.length > 0 && ev.open.every((o) => o.rule.type === 'chase');
  const chaseMsg = onlyChase ? `<p class="closed-msg">No bear may be taken today — hound training (chase) only.</p>` : '';

  const topics = Object.keys(TOPIC_LABEL) as InfoTopic[];
  const infoHtml = topics
    .map((t) => {
      const items = ev.info.filter((i) => i.topic === t);
      return items.length
        ? `<div class="fact"><h4>${TOPIC_LABEL[t]}</h4>${items.map((i) => `<p>${esc(i.text)}</p>`).join('')}</div>`
        : '';
    })
    .join('');

  const ords = localFor(place);
  const areaHtml = (place.areas ?? [])
    .map((id) => {
      const a = LOCAL_AREAS.find((x) => x.id === id);
      if (!a) return '';
      const name = located.localAreas?.find((f) => f.properties.area === id)?.properties.name;
      return `<div class="ord entire area-${a.confidence}"><span class="scope">Mapped ordinance area · ${esc(a.confidence)} confidence</span>
        <div>${esc(name || a.section)} (${esc(a.section)})</div>
        <q>${esc(a.text)}</q>
        <div class="small">${esc(a.method)}. ${esc(a.notes)}</div></div>`;
    })
    .join('');
  const conflictHtml = localConflicts(place, regs.species)
    .map((c) => `<p class="closed-msg"><strong>Local ordinance conflict:</strong> ${esc(c.note)} (${esc(c.section)})</p>`)
    .join('');
  const localHtml = ords.length || areaHtml
    ? `<div class="fact"><h4>Local ordinances</h4>${areaHtml}${ords
        .map(
          (ord) => `<p class="small">${esc(ord.jurisdiction.replace(/^(county|city|town):(.*)$/, (_, t, n) => (t === 'county' ? `${n} County` : t === 'city' ? `City of ${n}` : `Town of ${n}`)))} — <a href="${ord.url}" target="_blank" rel="noopener">DWR summary</a></p>
          ${[...ord.restrictions]
            .sort((a, b) => (a.scope === b.scope ? 0 : a.scope === 'entire' ? -1 : 1))
            .map(
              (r) => `<div class="ord ${r.scope}"><span class="scope">${r.scope === 'entire' ? 'Throughout' : esc(r.area || 'Part of locality')}</span>
                <div>${esc(r.summary)}${r.exceptions ? ` <span class="small">Exceptions: ${esc(r.exceptions)}</span>` : ''}</div>
                <q>${esc(r.quote)} — ${esc(r.section)}</q></div>`,
            )
            .join('')}`,
        )
        .join('')}</div>`
    : '';

  const youthReg =
    regs.species === 'deer' && place.land !== 'state_park'
      ? `<p class="small">Youth (15 and under) and apprentice hunters may also take one antlerless deer per license year on non-either-sex days of any muzzleloader or firearms season.</p>`
      : '';

  return `
    <div class="place">
      <div class="place-name">${where.join(' · ')}</div>
      <div class="place-meta">${LAND_LABEL[place.land]} · ${place.region === 'west' ? 'West' : 'East'} of the Blue Ridge</div>
    </div>
    ${splitHtml}
    <section>
      <h3>${fmtDate(iso)}</h3>
      ${latLng ? sunHtml(iso, latLng, ev.open.filter((o) => o.weapon !== 'none').map((o) => o.rule)) : ''}
      ${conflictHtml}
      ${chaseMsg}
      ${openHtml}
      ${next ? `<p class="small">Next change: <strong>${fmtDate(next)}</strong></p>` : ''}
    </section>
    <section>
      <h3>Season at a glance</h3>
      ${timeline(seasons, iso, regs.licenseYear, regs.species)}
    </section>
    <section class="facts">
      ${localHtml}
      ${infoHtml}
      ${youthReg}
    </section>
    <p class="small source">Source: <a href="${regs.source}" target="_blank" rel="noopener">DWR regulations</a>. Always confirm with the official regulations before hunting.</p>
  `;
}

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const weekdayText = (days: number[]) => days.map((d) => DAY[d]).join(', ');

/** Exception days (a rule's extraDays / closedDays) that fall within its dates, as text. */
function daysText(days: [string, string][] | undefined, within: [string, string][], ly: number, pre: string, post: string): string {
  const inside = (days ?? []).filter(([a, b]) =>
    within.some(([s, e]) => resolve(a, ly) <= resolve(e, ly) && resolve(b, ly) >= resolve(s, ly)),
  );
  return inside.length ? `${pre}${inside.map(fmtRange).join(', ')}${post}` : '';
}

const HOURS_LABEL: Record<Hours, string> = {
  'half-hour': '½ hour before sunrise to ½ hour after sunset',
  'until-noon': '½ hour before sunrise until noon',
  'until-sunset': '½ hour before sunrise until sunset',
  'noon-sunset': 'noon until sunset',
  'any-time': 'day or night',
};

/** Sunrise/sunset at the selected spot, and legal hunting hours for the seasons open there. */
function sunHtml(iso: string, [lat, lng]: [number, number], open: SeasonRule[]): string {
  const sun = sunDay(iso, lat, lng);
  const sunLine = `<p class="sun">Sunrise <strong>${fmtTime(sun.sunrise)}</strong> · Sunset <strong>${fmtTime(sun.sunset)}</strong> <span class="small">${zoneName(sun.sunrise)}</span></p>`;

  // Group the open seasons by their legal-hours rule.
  const groups = new Map<Hours, string[]>();
  for (const rule of open) {
    const h = hoursFor(rule);
    if (h) groups.set(h, [...(groups.get(h) ?? []), rule.label]);
  }
  if (groups.size === 0) return sunLine;
  const windowText = (h: Hours) => {
    const w = legalWindow(h, iso, sun);
    return w === 'any' ? 'Day or night' : `${fmtTime(w.start)} – ${fmtTime(w.end)}`;
  };
  const hoursLine =
    groups.size === 1
      ? `<p class="sun">Legal hours: <strong>${windowText([...groups.keys()][0])}</strong>${
          groups.has('any-time') ? '' : ` <span class="small">(${HOURS_LABEL[[...groups.keys()][0]]})</span>`
        }</p>`
      : `<p class="sun">Legal hours:</p><ul class="hours">${[...groups.entries()]
          .map(([h, labels]) => `<li><strong>${windowText(h)}</strong> — ${esc([...new Set(labels)].join(', '))}</li>`)
          .join('')}</ul>`;
  return sunLine + hoursLine;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Timeline: the full license year, Jul 1 -> Jun 30
// ---------------------------------------------------------------------------
function timeline(seasons: PlaceSeason[], iso: string, ly: number, species: string): string {
  if (!seasons.length) return '<p class="small">No seasons at this location.</p>';
  const start = dayOfLicenseYear(resolve('07-01', ly));
  const end = dayOfLicenseYear(resolve('06-30', ly)) + 1;
  const pct = (isoDay: string) => ((dayOfLicenseYear(isoDay) - start) / (end - start)) * 100;
  const span = ([a, b]: [string, string], cls: string, title: string) => {
    const l = pct(resolve(a, ly));
    const r = pct(resolve(b, ly)) + 100 / (end - start);
    return `<span class="seg-bar ${cls}" style="left:${l}%;width:${Math.max(r - l, 0.6)}%" title="${esc(title)}"></span>`;
  };

  const rows = [...seasons]
    .sort((a, b) => resolve(a.dates[0][0], ly).localeCompare(resolve(b.dates[0][0], ly)))
    .map((s) => {
      const base = s.take === 'by-days' ? 'antlered' : s.take;
      const bars = s.dates.map((r) => span(r, `t-${base}`, `${s.rule.label}: ${fmtRange(r)} (${takeLabel(base as DayTake, species)})`)).join('');
      const es =
        s.take === 'by-days' && Array.isArray(s.eitherSexDays)
          ? s.eitherSexDays.map((r) => span(r, 't-either-sex', `Either-sex: ${fmtRange(r)}`)).join('')
          : '';
      const dateText = s.dates.map(fmtRange).join(', ');
      const esText =
        s.take === 'by-days'
          ? Array.isArray(s.eitherSexDays) && s.eitherSexDays.length
            ? ` · either-sex ${s.eitherSexDays.map(fmtRange).join(', ')}`
            : ' · antlered only'
          : '';
      return `<div class="tl-row">
        <div class="tl-label">${esc(s.rule.label)}<span>${dateText}${esText}${s.rule.partialNote ? ' · part of area' : ''}${s.rule.weekdays ? ` · ${weekdayText(s.rule.weekdays)} only` : ''}${daysText(s.rule.extraDays, s.dates, ly, ' (also ', ')')}${daysText(s.rule.closedDays, s.dates, ly, ' · closed ', '')}</span></div>
        <div class="tl-track">${bars}${es}</div>
      </div>`;
    })
    .join('');

  const months = ['07-01', '09-01', '11-01', '01-01', '03-01', '05-01']
    .map((m) => `<span style="left:${pct(resolve(m, ly))}%">${fmt(m).split(' ')[0]}</span>`)
    .join('');
  const now = pct(iso);
  const marker = now >= 0 && now <= 100 ? `<div class="tl-now" style="left:${now}%"></div>` : '';

  return `<div class="timeline">
    <div class="tl-rows">${rows}<div class="tl-row tl-axis"><div class="tl-label"></div><div class="tl-track">${months}</div></div>
      <div class="tl-overlay">${marker}</div></div>
    <div class="tl-key">${[...new Set(seasons.flatMap((s) => (s.take === 'by-days' ? ['either-sex', 'antlered'] : [s.take])))]
      .map((t) => `<span><i class="t-${t}"></i>${takeLabel(t as DayTake, species) || 'Open'}</span>`)
      .join('')}</div>
  </div>`;
}
