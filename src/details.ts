import { dayOfLicenseYear, fmt, fmtRange, resolve } from './regs/dates';
import { evaluate, nextChange, seasonsForPlace, WEAPON_OF, type DayTake, type PlaceSeason } from './regs/engine';
import type { InfoTopic, Place, SpeciesRegs } from './regs/types';
import { splitFor } from './regs/virginia';
import { jurisdictionLabel, type Located } from './geo';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);

const LAND_LABEL: Record<Place['land'], string> = {
  private: 'Private land',
  national_forest: 'National Forest',
  dwr: 'DWR Wildlife Management Area',
  state_forest: 'State Forest',
  state_park: 'State Park',
  army_corps: 'Army Corps of Engineers land',
  nps: 'National Park Service land',
};

const TAKE_LABEL: Record<DayTake, string> = {
  'either-sex': 'Either sex',
  antlered: 'Antlered only',
  antlerless: 'Antlerless only',
  quota: 'Quota hunt',
  check: 'Check posted rules',
};

const TOPIC_LABEL: Record<InfoTopic, string> = {
  local: 'Local restrictions',
  access: 'Access',
  bag: 'Bag limits',
  eab: 'Earn a Buck',
  apr: 'Antler point restriction',
  bonus: 'Bonus permits',
  dogs: 'Dogs',
};

export interface DetailsInput {
  located: Located;
  regs: SpeciesRegs;
  iso: string;
  includeYouth: boolean;
  subArea?: string;
}

export function renderDetails({ located, regs, iso, includeYouth, subArea }: DetailsInput): string {
  const jurId: string = located.jurisdiction?.properties.id;
  const split = splitFor(jurId);
  const place: Place = { ...located.place, subArea: split ? subArea ?? Object.keys(split.parts)[0] : undefined };
  const ev = evaluate(regs, place, iso, { includeYouth });
  const seasons = seasonsForPlace(regs, place).filter((s) => includeYouth || !s.rule.youthOnly);
  const next = nextChange(regs, place, iso);

  const where = [
    place.property ? `<strong>${esc(place.property)}</strong>` : '',
    place.town ? `Town of ${esc(place.town)}` : '',
    esc(jurisdictionLabel(jurId)),
  ].filter(Boolean);

  const splitHtml = split
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
          (o) => `<li class="${o.rule.youthOnly && !includeYouth ? 'muted' : ''}">
            <span class="weapon w-${WEAPON_OF[o.rule.type]}">${esc(o.rule.label)}</span>
            <span class="take t-${o.take}">${TAKE_LABEL[o.take]}</span>
            ${o.rule.youthOnly ? '<span class="tag">Youth/apprentice only</span>' : ''}
            ${o.note ? `<div class="note">${esc(o.note)}</div>` : ''}
            ${(o.rule.notes ?? []).map((n) => `<div class="note">${esc(n)}</div>`).join('')}
          </li>`,
        )
        .join('')}</ul>`
    : `<p class="closed-msg">No ${regs.species} season is open here on this date.</p>`;

  const topics = Object.keys(TOPIC_LABEL) as InfoTopic[];
  const infoHtml = topics
    .map((t) => {
      const items = ev.info.filter((i) => i.topic === t);
      return items.length
        ? `<div class="fact"><h4>${TOPIC_LABEL[t]}</h4>${items.map((i) => `<p>${esc(i.text)}</p>`).join('')}</div>`
        : '';
    })
    .join('');

  const youthReg =
    place.land !== 'state_park'
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
      ${openHtml}
      ${next ? `<p class="small">Next change: <strong>${fmtDate(next)}</strong></p>` : ''}
    </section>
    <section>
      <h3>Season at a glance</h3>
      ${timeline(seasons, iso, regs.licenseYear)}
    </section>
    <section class="facts">
      ${infoHtml}
      ${youthReg}
    </section>
    <p class="small source">Source: <a href="${regs.source}" target="_blank" rel="noopener">DWR deer regulations</a>. Always confirm with the official regulations before hunting.</p>
  `;
}

export function fmtDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

// ---------------------------------------------------------------------------
// Timeline: Sep 1 -> Apr 30 of the license year
// ---------------------------------------------------------------------------
function timeline(seasons: PlaceSeason[], iso: string, ly: number): string {
  if (!seasons.length) return '<p class="small">No seasons at this location.</p>';
  const start = dayOfLicenseYear(resolve('09-01', ly));
  const end = dayOfLicenseYear(resolve('04-30', ly)) + 1;
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
      const bars = s.dates.map((r) => span(r, `t-${base}`, `${s.rule.label}: ${fmtRange(r)} (${TAKE_LABEL[base as DayTake]})`)).join('');
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
        <div class="tl-label">${esc(s.rule.label)}<span>${dateText}${esText}</span></div>
        <div class="tl-track">${bars}${es}</div>
      </div>`;
    })
    .join('');

  const months = ['09-01', '10-01', '11-01', '12-01', '01-01', '02-01', '03-01', '04-01']
    .map((m) => `<span style="left:${pct(resolve(m, ly))}%">${fmt(m).split(' ')[0]}</span>`)
    .join('');
  const now = pct(iso);
  const marker = now >= 0 && now <= 100 ? `<div class="tl-now" style="left:${now}%"></div>` : '';

  return `<div class="timeline">
    <div class="tl-rows">${rows}<div class="tl-row tl-axis"><div class="tl-label"></div><div class="tl-track">${months}</div></div>
      <div class="tl-overlay">${marker}</div></div>
    <div class="tl-key">
      <span><i class="t-either-sex"></i>Either sex</span><span><i class="t-antlered"></i>Antlered only</span>
      <span><i class="t-antlerless"></i>Antlerless only</span><span><i class="t-check"></i>Check rules / quota</span>
    </div>
  </div>`;
}
