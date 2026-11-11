import { describe, expect, it } from 'vitest';
import { bobcat2026 } from '../src/regs/furbearer-2026';
import { crow2026, squirrel2026 } from '../src/regs/small-game-2026';
import { deer2026 } from '../src/regs/deer-2026';
import { turkey2026 } from '../src/regs/turkey-2026';
import { fmtTime, hoursFor, legalWindow, sunDay, zoneName } from '../src/sun';

// Reference values: U.S. Naval Observatory (aa.usno.navy.mil, the source DWR's
// regulations page links to), retrieved 2026-11-11, local times.
const USNO = [
  { place: 'Richmond', lat: 37.5407, lng: -77.436, iso: '2026-11-11', rise: '6:45 AM', set: '5:02 PM', zone: 'EST' },
  { place: 'Bristol', lat: 36.596, lng: -82.1885, iso: '2026-06-21', rise: '6:11 AM', set: '8:51 PM', zone: 'EDT' },
  { place: 'Virginia Beach', lat: 36.8529, lng: -75.978, iso: '2026-12-21', rise: '7:13 AM', set: '4:51 PM', zone: 'EST' },
  { place: 'Winchester', lat: 39.1857, lng: -78.1633, iso: '2027-04-15', rise: '6:36 AM', set: '7:50 PM', zone: 'EDT' },
];


describe('sunrise and sunset', () => {
  it.each(USNO)('$place $iso matches the Naval Observatory to the minute', ({ lat, lng, iso, rise, set, zone }) => {
    const sun = sunDay(iso, lat, lng);
    expect(fmtTime(sun.sunrise)).toBe(rise);
    expect(fmtTime(sun.sunset)).toBe(set);
    expect(zoneName(sun.sunrise)).toBe(zone);
  });
});

describe('legal hunting hours (DWR General Regulations)', () => {
  const richmond = sunDay('2026-11-11', 37.5407, -77.436);
  it('game animals: half an hour before sunrise to half an hour after sunset', () => {
    const w = legalWindow('half-hour', '2026-11-11', richmond);
    if (w === 'any') throw new Error('expected a window');
    expect(fmtTime(w.start)).toBe('6:15 AM'); // sunrise 6:45
    expect(fmtTime(w.end)).toBe('5:32 PM'); // sunset 5:02
  });
  it('spring turkey until noon (local time, in daylight saving time)', () => {
    const w = legalWindow('until-noon', '2027-04-15', sunDay('2027-04-15', 39.1857, -78.1633));
    if (w === 'any') throw new Error('expected a window');
    expect(fmtTime(w.end)).toBe('12:00 PM');
  });
  it('which rule applies', () => {
    const rule = (regs: { seasons: { id: string }[] }, id: string) => regs.seasons.find((s) => s.id === id) as never;
    expect(hoursFor(rule(turkey2026, 'turkey-spring-noon'))).toBe('until-noon');
    expect(hoursFor(rule(turkey2026, 'turkey-spring-allday'))).toBe('until-sunset');
    expect(hoursFor(rule(turkey2026, 'turkey-youth-spring'))).toBe('until-sunset');
    expect(hoursFor(deer2026.seasons[0])).toBe('half-hour');
    expect(hoursFor(squirrel2026.seasons[0])).toBe('half-hour');
    expect(hoursFor(bobcat2026.seasons[0])).toBe('any-time');
    expect(hoursFor(crow2026.seasons[0])).toBeUndefined(); // federally regulated; DWR gives no hours
  });
});
