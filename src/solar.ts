/**
 * Sunrise and sunset, NOAA Solar Calculator algorithm (after Jean Meeus,
 * "Astronomical Algorithms"). Sunrise/sunset is when the sun's center is 0.833°
 * below the horizon (refraction + solar radius), as used by NOAA and the U.S.
 * Naval Observatory.
 */
const rad = (d: number) => (d * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Julian centuries since J2000.0 for a Julian Day. */
const century = (jd: number) => (jd - 2451545.0) / 36525.0;

function sunDeclinationAndEqTime(t: number): { dec: number; eqTime: number } {
  const L0 = (((280.46646 + t * (36000.76983 + 0.0003032 * t)) % 360) + 360) % 360; // geometric mean longitude
  const M = 357.52911 + t * (35999.05029 - 0.0001537 * t); // mean anomaly
  const e = 0.016708634 - t * (0.000042037 + 0.0000001267 * t); // orbit eccentricity
  const C =
    Math.sin(rad(M)) * (1.914602 - t * (0.004817 + 0.000014 * t)) +
    Math.sin(rad(2 * M)) * (0.019993 - 0.000101 * t) +
    Math.sin(rad(3 * M)) * 0.000289; // equation of center
  const omega = 125.04 - 1934.136 * t;
  const lambda = L0 + C - 0.00569 - 0.00478 * Math.sin(rad(omega)); // apparent longitude
  const eps0 = 23 + (26 + (21.448 - t * (46.815 + t * (0.00059 - t * 0.001813))) / 60) / 60; // mean obliquity
  const eps = eps0 + 0.00256 * Math.cos(rad(omega)); // corrected obliquity
  const dec = deg(Math.asin(Math.sin(rad(eps)) * Math.sin(rad(lambda))));
  const y = Math.tan(rad(eps / 2)) ** 2;
  const eqTime =
    4 *
    deg(
      y * Math.sin(2 * rad(L0)) -
        2 * e * Math.sin(rad(M)) +
        4 * e * y * Math.sin(rad(M)) * Math.cos(2 * rad(L0)) -
        0.5 * y * y * Math.sin(4 * rad(L0)) -
        1.25 * e * e * Math.sin(2 * rad(M)),
    ); // minutes
  return { dec, eqTime };
}

/** Minutes after 00:00 UTC of the Julian Day's date when the sun rises (or sets). */
function eventUtcMinutes(rise: boolean, jd: number, lat: number, lng: number): number {
  const { dec, eqTime } = sunDeclinationAndEqTime(century(jd));
  const cosH = Math.cos(rad(90.833)) / (Math.cos(rad(lat)) * Math.cos(rad(dec))) - Math.tan(rad(lat)) * Math.tan(rad(dec));
  const H = deg(Math.acos(Math.max(-1, Math.min(1, cosH)))) * (rise ? 1 : -1);
  return 720 - 4 * (lng + H) - eqTime;
}

/** Sunrise or sunset as a Date for the calendar date (y, m, d) at a point (longitude east-positive). */
export function sunEvent(rise: boolean, y: number, m: number, d: number, lat: number, lng: number): Date {
  const midnightUtc = Date.UTC(y, m - 1, d);
  const jd0 = midnightUtc / 86400000 + 2440587.5;
  // Two passes: estimate, then recompute at the estimated time of day.
  const first = eventUtcMinutes(rise, jd0, lat, lng);
  const minutes = eventUtcMinutes(rise, jd0 + first / 1440, lat, lng);
  return new Date(midnightUtc + minutes * 60000);
}
