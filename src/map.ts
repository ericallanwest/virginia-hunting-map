import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { placeForJurisdiction, placeForPublic, placeForTown, jurisdictionLabel, type Layers, type Poly } from './geo';
import { categoryOf, cssColor, type Category, type View } from './legend';
import { evaluate } from './regs/engine';
import type { Place, SpeciesRegs } from './regs/types';
import { SPLITS } from './regs/virginia';

/** Splits that change season dates (the others only affect EAB/dog rules). */
const SEASON_SPLITS = new Set(['county:Rockingham', 'city:Suffolk']);

export interface StyleState {
  regs?: SpeciesRegs;
  iso: string;
  view: View;
  includeYouth: boolean;
}

interface Entry {
  layer: L.Path;
  feature: Poly;
  /** One place per side of a split line (usually just one). */
  variants: { label?: string; place: Place }[];
  title: string;
  cats: Category[];
}

export function createMap(el: HTMLElement): L.Map {
  const map = L.map(el, { zoomControl: false, minZoom: 6, maxBounds: [[34.5, -86], [41.5, -73]] });
  L.control.zoom({ position: 'topright' }).addTo(map);
  const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services';
  // CARTO's light basemap needs an API key, supplied at build time (VITE_CARTO_KEY; see README).
  const cartoKey = import.meta.env.VITE_CARTO_KEY as string | undefined;
  const basemaps: Record<string, L.TileLayer> = {
    ...(cartoKey
      ? {
          Light: L.tileLayer(`https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png?key=${encodeURIComponent(cartoKey)}`, {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }),
        }
      : {}),
    Streets: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }),
    Topo: L.tileLayer(`${esri}/World_Topo_Map/MapServer/tile/{z}/{y}/{x}`, {
      attribution: 'Tiles &copy; Esri and contributors',
      maxZoom: 19,
    }),
    Satellite: L.tileLayer(`${esri}/World_Imagery/MapServer/tile/{z}/{y}/{x}`, {
      attribution: 'Imagery &copy; Esri, Maxar, Earthstar Geographics',
      maxZoom: 19,
    }),
  };
  (basemaps.Light ?? basemaps.Streets).addTo(map);
  L.control.layers(basemaps, undefined, { position: 'topright' }).addTo(map);
  map.fitBounds([[36.54, -83.68], [39.47, -75.24]]);
  return map;
}

export class RegulationLayers {
  private entries: Entry[] = [];
  readonly groups: Record<'jurisdictions' | 'towns' | 'publicLands', L.LayerGroup>;
  private defs: SVGDefsElement;

  constructor(private map: L.Map, layers: Layers) {
    this.defs = makeDefs();
    const add = (features: Poly[], kind: keyof Layers, pane: string) => {
      const group = L.layerGroup();
      for (const f of features) {
        const layer = L.geoJSON(f as any, { pane, interactive: true }).getLayers()[0] as L.Path;
        const entry: Entry = { layer, feature: f, ...describe(f, kind), cats: [] };
        layer.bindTooltip(() => this.tooltip(entry), { sticky: true, className: 'reg-tip' });
        group.addLayer(layer);
        this.entries.push(entry);
      }
      return group;
    };
    map.createPane('jur').style.zIndex = '410';
    map.createPane('town').style.zIndex = '420';
    map.createPane('pub').style.zIndex = '430';
    this.groups = {
      jurisdictions: add(layers.jurisdictions, 'jurisdictions', 'jur').addTo(map),
      towns: add(layers.towns, 'towns', 'town').addTo(map),
      publicLands: add(layers.publicLands, 'publicLands', 'pub').addTo(map),
    };
  }

  update(s: StyleState) {
    for (const e of this.entries) {
      e.cats = e.variants.map((v) =>
        s.regs ? categoryOf(evaluate(s.regs, v.place, s.iso, { includeYouth: s.includeYouth }).summary, s.view) : { key: 'none', label: 'No data', color: 'var(--c-closed)' },
      );
      const colors = [...new Set(e.cats.map((c) => cssColor(c.color)))];
      const fill = colors.length > 1 ? `url(#${this.stripes(colors[0], colors[1])})` : colors[0];
      const kind = e.feature.properties.land ? 'pub' : e.feature.properties.jurisdiction ? 'town' : 'jur';
      const closed = e.cats.every((c) => c.key === 'closed' || c.key === 'none');
      e.layer.setStyle({
        fillColor: fill,
        fillOpacity: closed ? 0.25 : kind === 'pub' ? 0.75 : 0.55,
        color: kind === 'pub' ? '#1d3b2a' : kind === 'town' ? '#4b5563' : '#ffffff',
        weight: kind === 'jur' ? 1 : 0.8,
        opacity: kind === 'jur' ? 0.9 : 0.8,
        dashArray: kind === 'town' ? '2 2' : undefined,
      });
    }
  }

  private tooltip(e: Entry): string {
    const status = e.variants
      .map((v, i) => `${v.label ? `<em>${v.label}:</em> ` : ''}${e.cats[i]?.label ?? ''}`)
      .join('<br>');
    return `<strong>${e.title}</strong><br>${status}`;
  }

  private stripes(a: string, b: string): string {
    const id = `stripe-${(a + b).replace(/[^a-z0-9]/gi, '')}`;
    if (!this.defs.querySelector(`#${id}`)) {
      this.defs.insertAdjacentHTML(
        'beforeend',
        `<pattern id="${id}" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(45)">
          <rect width="6" height="12" fill="${a}"/><rect x="6" width="6" height="12" fill="${b}"/></pattern>`,
      );
    }
    return id;
  }
}

function describe(f: Poly, kind: keyof Layers): Pick<Entry, 'variants' | 'title'> {
  const p = f.properties;
  if (kind === 'publicLands') {
    return { title: `${p.name}<br><small>${jurisdictionLabel(p.jurisdiction)}</small>`, variants: [{ place: placeForPublic(f) }] };
  }
  if (kind === 'towns') {
    return { title: `Town of ${p.name}`, variants: [{ place: placeForTown(f) }] };
  }
  const split = SPLITS.find((s) => s.jurisdiction === p.id);
  const base = placeForJurisdiction(p.id);
  const variants =
    split && SEASON_SPLITS.has(p.id)
      ? Object.entries(split.parts).map(([k, label]) => ({ label, place: { ...base, subArea: k } }))
      : [{ place: base }];
  return { title: jurisdictionLabel(p.id), variants };
}

function makeDefs(): SVGDefsElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  svg.appendChild(defs);
  document.body.appendChild(svg);
  return defs;
}
