import L from 'leaflet';
import './style.css';
import { renderDetails, fmtDate } from './details';
import { jurisdictionLabel, loadLayers, locate, placeForJurisdiction, placeForPublic, placeForTown, type Layers, type Located, type Poly } from './geo';
import { legendFor, type View } from './legend';
import { createMap, RegulationLayers } from './map';
import { dayOfLicenseYear, licenseYearOf, resolve, todayISO } from './regs/dates';
import { nextDay } from './regs/engine';
import { availableYears, GROUPS, regsFor, SPECIES, speciesInfo, yearLabel, type Group } from './regs/index';
import type { Species } from './regs/types';

// ---------------------------------------------------------------------------
// State (mirrored in the URL so views can be shared)
// ---------------------------------------------------------------------------
const params = new URLSearchParams(location.search);
const state = {
  species: (params.get('species') as Species) || 'deer',
  iso: params.get('date') || todayISO(),
  // 'antlerless' was the deer take view's name in early links.
  view: ((params.get('view') === 'antlerless' ? 'take' : params.get('view')) as View) || 'weapon',
  includeYouth: params.get('youth') === '1',
  subArea: params.get('side') || undefined,
  selected: undefined as Located | undefined,
  point: params.get('at')?.split(',').map(Number) as [number, number] | undefined,
  /** Where to compute sun times when a place was picked from search (no clicked point). */
  center: undefined as [number, number] | undefined,
};

const $ = <T extends HTMLElement = HTMLElement>(sel: string) => document.querySelector(sel) as T;

function syncUrl() {
  const p = new URLSearchParams();
  if (state.species !== 'deer') p.set('species', state.species);
  if (state.iso !== todayISO()) p.set('date', state.iso);
  if (state.view !== 'weapon') p.set('view', state.view);
  if (state.includeYouth) p.set('youth', '1');
  if (state.point) p.set('at', state.point.map((n) => n.toFixed(5)).join(','));
  if (state.subArea) p.set('side', state.subArea);
  history.replaceState(null, '', `${location.pathname}${p.size ? '?' + p : ''}`);
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------
const map = createMap($('#map'));
let layers: Layers;
let regLayers: RegulationLayers;
let marker: L.CircleMarker | undefined;

buildSpeciesPicker();
wireDateControls();
wireViewControls();
buildViewPicker();
wireSearch();

loadLayers().then((l) => {
  layers = l;
  regLayers = new RegulationLayers(map, l);
  map.on('click', (e: L.LeafletMouseEvent) => selectPoint(e.latlng.lat, e.latlng.lng));
  wireLayerToggles();
  refresh();
  if (state.point) {
    map.setView(state.point, 11);
    selectPoint(state.point[0], state.point[1], false);
  }
  $('#loading').remove();
});

function refresh() {
  const regs = regsFor(state.species, state.iso);
  const ly = licenseYearOf(state.iso);
  const banner = $('#banner');
  banner.className = 'banner';
  if (!regs) {
    // Any date can be chosen; say plainly when the app has no regulations for its license year.
    const years = availableYears(state.species);
    const covers = years.length ? ` The app currently covers ${years.map(yearLabel).join(', ')}.` : '';
    banner.hidden = false;
    banner.innerHTML = years.length && ly < Math.min(...years)
      ? `<strong>Prior-year regulations (${yearLabel(ly)}) aren’t available in this app.</strong>${covers}`
      : `<strong>${yearLabel(ly)} regulations aren’t available in this app yet.</strong> DWR usually posts a new license year’s regulations in early summer — check <a href="https://dwr.virginia.gov/hunting/regulations/" target="_blank" rel="noopener">DWR’s regulations page</a>.${covers}`;
  } else if (ly < licenseYearOf(todayISO())) {
    // A past license year that is loaded (once more than one year is in the app).
    banner.hidden = false;
    banner.className = 'banner archived';
    banner.innerHTML = `<strong>Archived: ${yearLabel(ly)} regulations.</strong> You’re viewing a past license year (Jul 1, ${ly} – Jun 30, ${ly + 1}). Local ordinances shown are the current ones.`;
  } else banner.hidden = true;

  ($('#date') as HTMLInputElement).value = state.iso;
  const slider = $('#date-slider') as HTMLInputElement;
  slider.value = String(dayOfLicenseYear(state.iso));
  $('#date-label').textContent = fmtDate(state.iso);

  regLayers?.update({ regs, species: state.species, iso: state.iso, view: state.view, includeYouth: state.includeYouth });
  renderPanel();
  syncUrl();
}

function renderPanel() {
  const panel = $('#details');
  const regs = regsFor(state.species, state.iso);
  if (!state.selected) {
    panel.innerHTML = `<p class="hint">Click the map or search for a county, city, town, public land, or address to see the ${label(state.species).toLowerCase()} regulations for that spot.</p>`;
    return;
  }
  if (!regs) {
    // No regulations for this species in the date's license year (e.g. migratory birds before 2026–27).
    const years = availableYears(state.species);
    panel.innerHTML = `<p class="hint">This app has no ${label(state.species).toLowerCase()} regulations for the ${yearLabel(licenseYearOf(state.iso))} license year${
      years.length ? ` (it covers ${years.map(yearLabel).join(', ')})` : ''
    }. See <a href="https://dwr.virginia.gov/hunting/regulations/" target="_blank" rel="noopener">DWR’s regulations</a>.</p>`;
    return;
  }
  panel.innerHTML = renderDetails({
    located: state.selected,
    regs,
    iso: state.iso,
    includeYouth: state.includeYouth,
    subArea: state.subArea,
    latLng: state.point ?? state.center,
  });
  panel.querySelectorAll<HTMLButtonElement>('[data-subarea]').forEach((b) =>
    b.addEventListener('click', () => {
      state.subArea = b.dataset.subarea;
      renderPanel();
      syncUrl();
    }),
  );
}

const label = (s: Species) => SPECIES.find((x) => x.id === s)!.label;

// ---------------------------------------------------------------------------
// Selection
// ---------------------------------------------------------------------------
function selectPoint(lat: number, lng: number, pan = true) {
  const loc = locate(layers, lng, lat);
  if (!loc) return;
  if (loc.jurisdiction?.properties.id !== state.selected?.jurisdiction?.properties.id) state.subArea = undefined;
  state.selected = loc;
  state.point = [lat, lng];
  marker?.remove();
  marker = L.circleMarker([lat, lng], { radius: 7, color: '#111', weight: 2, fillColor: '#fff', fillOpacity: 1, pane: 'markerPane' }).addTo(map);
  if (pan && !map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
  openSheet();
  renderPanel();
  syncUrl();
}

function selectFeature(f: Poly, kind: keyof Layers) {
  const jur = (id: string) => layers.jurisdictions.find((j) => j.properties.id === id);
  const loc: Located =
    kind === 'jurisdictions'
      ? { place: placeForJurisdiction(f.properties.id, { subArea: f.properties.subArea }), jurisdiction: f }
      : kind === 'towns'
        ? { place: placeForTown(f), town: f, jurisdiction: jur(f.properties.jurisdiction) }
        : { place: placeForPublic(f), publicLand: f, jurisdiction: jur(f.properties.jurisdiction) };
  state.selected = loc;
  state.point = undefined;
  state.subArea = undefined;
  marker?.remove();
  const bounds = L.geoJSON(f as any).getBounds();
  state.center = [bounds.getCenter().lat, bounds.getCenter().lng];
  map.fitBounds(bounds, { maxZoom: 12, padding: [20, 20] });
  openSheet();
  renderPanel();
  syncUrl();
}

function openSheet() {
  document.body.classList.add('has-selection');
  // On phones the details sit below the controls; bring them into view.
  if (matchMedia('(max-width: 760px)').matches) requestAnimationFrame(() => $('.details-wrap').scrollIntoView({ behavior: 'smooth' }));
}

// ---------------------------------------------------------------------------
// Controls
// ---------------------------------------------------------------------------
/** Group row (Big Game / Small Game / Furbearer / Migratory Birds) above that group's species buttons. */
function buildSpeciesPicker() {
  const groupEl = $('#group');
  const speciesEl = $('#species');
  // Remember the last species chosen in each group so switching groups back restores it.
  const lastInGroup: Partial<Record<Group, Species>> = { [speciesInfo(state.species).group]: state.species };

  const render = () => {
    const group = speciesInfo(state.species).group;
    groupEl.innerHTML = GROUPS.map(
      (g) => `<button type="button" role="radio" data-group="${g.id}" aria-checked="${g.id === group}">${g.label}</button>`,
    ).join('');
    speciesEl.innerHTML = SPECIES.filter((s) => s.group === group)
      .map(
        (s) =>
          `<button type="button" role="radio" data-species="${s.id}" aria-checked="${s.id === state.species}" ${s.available ? '' : 'disabled title="Coming soon"'}>${s.label}${s.available ? '' : '<small>soon</small>'}</button>`,
      )
      .join('');
  };
  const choose = (species: Species) => {
    state.species = species;
    lastInGroup[speciesInfo(species).group] = species;
    render();
    buildViewPicker();
    refresh();
  };

  groupEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-group]');
    if (!b) return;
    const g = b.dataset.group as Group;
    if (g === speciesInfo(state.species).group) return;
    choose(lastInGroup[g] ?? SPECIES.find((s) => s.group === g && s.available)!.id);
  });
  speciesEl.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-species]');
    if (b && !b.disabled) choose(b.dataset.species as Species);
  });
  render();
}

function buildLegend() {
  $('#legend').innerHTML = legendFor(state.species, state.view)
    .map((c) => `<li><i style="background:${c.color}"></i>${c.label}</li>`)
    .join('');
}

/** Map views depend on the species (e.g. bear has a hounds view, elk has only weapons). */
function buildViewPicker() {
  const views = speciesInfo(state.species).views;
  if (!views.some((v) => v.id === state.view)) state.view = views[0].id;
  const seg = $('#view');
  seg.hidden = views.length < 2;
  seg.innerHTML = views
    .map((v) => `<button type="button" role="radio" data-view="${v.id}" aria-checked="${v.id === state.view}">${v.label}</button>`)
    .join('');
  buildLegend();
}

function setDate(iso: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return;
  state.iso = iso;
  refresh();
}

function wireDateControls() {
  const input = $('#date') as HTMLInputElement;
  input.addEventListener('change', () => setDate(input.value));
  $('#prev-day').addEventListener('click', () => {
    const [y, m, d] = state.iso.split('-').map(Number);
    setDate(new Date(Date.UTC(y, m - 1, d - 1)).toISOString().slice(0, 10));
  });
  $('#next-day').addEventListener('click', () => setDate(nextDay(state.iso)));
  $('#today').addEventListener('click', () => setDate(todayISO()));

  // Slider scrubs through the license year (Jul 1 - Jun 30).
  const slider = $('#date-slider') as HTMLInputElement;
  slider.addEventListener('input', () => {
    const ly = licenseYearOf(state.iso);
    const start = new Date(`${resolve('07-01', ly)}T00:00:00Z`);
    start.setUTCDate(start.getUTCDate() + Number(slider.value));
    setDate(start.toISOString().slice(0, 10));
  });
}

function wireViewControls() {
  const seg = $('#view');
  seg.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-view]');
    if (!b) return;
    state.view = b.dataset.view as View;
    seg.querySelectorAll('[data-view]').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    buildLegend();
    refresh();
  });
  const youth = $('#youth') as HTMLInputElement;
  youth.checked = state.includeYouth;
  youth.addEventListener('change', () => {
    state.includeYouth = youth.checked;
    refresh();
  });
  $('#close-details').addEventListener('click', () => {
    document.body.classList.remove('has-selection');
    state.selected = undefined;
    state.point = undefined;
    marker?.remove();
    renderPanel();
    syncUrl();
  });
}

function wireLayerToggles() {
  for (const key of ['towns', 'publicLands', 'localAreas'] as const) {
    const cb = $(`#show-${key}`) as HTMLInputElement;
    cb.addEventListener('change', () => (cb.checked ? regLayers.groups[key].addTo(map) : regLayers.groups[key].remove()));
  }
}

// ---------------------------------------------------------------------------
// Search: local names first, then address geocoding (OpenStreetMap Nominatim)
// ---------------------------------------------------------------------------
function wireSearch() {
  const input = $('#search') as HTMLInputElement;
  const list = $('#search-results');
  let timer: number | undefined;
  let results: { label: string; sub: string; go: () => void }[] = [];

  const show = () => {
    list.innerHTML = results
      .map((r, i) => `<li role="option" data-i="${i}"><span>${r.label}</span><small>${r.sub}</small></li>`)
      .join('');
    list.hidden = results.length === 0;
  };
  const choose = (i: number) => {
    clearTimeout(timer);
    if (!results[i]) return;
    input.value = results[i].label; // also makes any in-flight geocode stale
    results[i].go();
    list.hidden = true;
    input.blur();
  };

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase().replace(/\b(county|city of|town of|city|town)\b/g, '').trim();
    results = q.length < 2 || !layers ? [] : localMatches(q);
    show();
    clearTimeout(timer);
    if (input.value.trim().length >= 4) timer = window.setTimeout(() => geocode(input.value.trim()), 600);
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length) choose(0);
      else geocode(input.value.trim());
    } else if (e.key === 'Escape') list.hidden = true;
  });
  list.addEventListener('click', (e) => {
    const li = (e.target as HTMLElement).closest<HTMLElement>('[data-i]');
    if (li) choose(Number(li.dataset.i));
  });
  document.addEventListener('click', (e) => {
    if (!(e.target as HTMLElement).closest('.search')) list.hidden = true;
  });

  $('#locate-me').addEventListener('click', () => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 11);
        selectPoint(pos.coords.latitude, pos.coords.longitude);
      },
      () => alert('Could not get your location.'),
    );
  });

  function localMatches(q: string) {
    const out: typeof results = [];
    const seen = new Set<string>();
    const consider = (f: Poly, kind: keyof Layers, label: string, sub: string) => {
      const key = kind + label;
      if (seen.has(key) || !label.toLowerCase().includes(q)) return;
      seen.add(key);
      out.push({ label, sub, go: () => selectFeature(f, kind) });
    };
    for (const f of layers.jurisdictions) consider(f, 'jurisdictions', jurisdictionLabel(f.properties.id, f.properties.subArea), 'Virginia');
    for (const f of layers.towns) consider(f, 'towns', `Town of ${f.properties.name}`, jurisdictionLabel(f.properties.jurisdiction));
    // Public lands are split by county; offer the largest piece of each property.
    const biggest = new Map<string, Poly>();
    for (const f of layers.publicLands) {
      const cur = biggest.get(f.properties.name);
      if (!cur || JSON.stringify(f.geometry).length > JSON.stringify(cur.geometry).length) biggest.set(f.properties.name, f);
    }
    for (const f of biggest.values()) consider(f, 'publicLands', f.properties.name, 'Public land');
    return out.sort((a, b) => a.label.toLowerCase().indexOf(q) - b.label.toLowerCase().indexOf(q)).slice(0, 8);
  }

  async function geocode(q: string) {
    if (!q) return;
    const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&countrycodes=us&viewbox=-83.7,39.5,-75.2,36.5&bounded=1&q=${encodeURIComponent(q)}`;
    try {
      const res = (await (await fetch(url, { headers: { Accept: 'application/json' } })).json()) as { display_name: string; lat: string; lon: string }[];
      if (input.value.trim() !== q) return; // stale
      const addr = res.map((r) => ({
        label: r.display_name.split(',').slice(0, 2).join(','),
        sub: r.display_name.split(',').slice(2, 4).join(',').trim(),
        go: () => {
          const lat = Number(r.lat), lng = Number(r.lon);
          map.setView([lat, lng], Math.max(map.getZoom(), 12));
          selectPoint(lat, lng);
        },
      }));
      const local = results.filter((r) => r.sub === 'Virginia' || r.sub === 'Public land' || r.label.startsWith('Town'));
      results = [...local.slice(0, 4), ...addr];
      show();
    } catch {
      /* offline or rate-limited: local results still work */
    }
  }
}
