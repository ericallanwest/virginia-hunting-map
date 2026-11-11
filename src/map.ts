import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { placeForJurisdiction, placeForPublic, placeForTown, jurisdictionLabel, type Layers, type Poly } from './geo';
import { categoryOf, cssColor, type Category, type View } from './legend';
import { evaluate } from './regs/engine';
import type { Place, Species, SpeciesRegs } from './regs/types';

export interface StyleState {
  regs?: SpeciesRegs;
  species: Species;
  iso: string;
  view: View;
  includeYouth: boolean;
}

interface Entry {
  layer: L.Path;
  feature: Poly;
  place: Place;
  title: string;
  cat?: Category;
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
  const layersControl = L.control.layers(basemaps, undefined, { position: 'topright' }).addTo(map);

  // Regulation layers draw in their own panes (counties < towns < public lands), so the
  // regulations opacity slider can fade all of them with one CSS property.
  for (const [pane, z] of REG_PANES) map.createPane(pane).style.zIndex = z;
  addOpacitySliders(map, layersControl, Object.values(basemaps));
  map.fitBounds([[36.54, -83.68], [39.47, -75.24]]);
  return map;
}

const REG_PANES: [string, string][] = [['jur', '410'], ['town', '420'], ['pub', '430']];

/**
 * "Basemap" and "Regulations" opacity sliders inside the layers control (with the
 * basemap picker). Basemap opacity fades the tiles; regulations opacity fades the
 * regulation panes as a whole. Values are remembered per browser.
 */
function addOpacitySliders(map: L.Map, control: L.Control.Layers, tiles: L.TileLayer[]) {
  const list = control.getContainer()!.querySelector('.leaflet-control-layers-list')!;
  const box = L.DomUtil.create('div', 'opacity-sliders', list as HTMLElement);
  box.innerHTML = `<div class="leaflet-control-layers-separator"></div>
    <label>Basemap<input type="range" min="0" max="100" step="5" data-k="basemap" aria-label="Basemap opacity"></label>
    <label>Regulations<input type="range" min="10" max="100" step="5" data-k="regs" aria-label="Regulations opacity"></label>`;
  // Dragging a slider must not pan the map.
  L.DomEvent.disableClickPropagation(box);
  L.DomEvent.disableScrollPropagation(box);

  const apply: Record<string, (v: number) => void> = {
    basemap: (v) => tiles.forEach((t) => t.setOpacity(v)),
    regs: (v) => REG_PANES.forEach(([pane]) => (map.getPane(pane)!.style.opacity = String(v))),
  };
  box.querySelectorAll<HTMLInputElement>('input[type=range]').forEach((input) => {
    const k = input.dataset.k!;
    const key = `va-hunt-map:opacity:${k}`;
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(key);
    } catch {
      /* storage unavailable: use the default */
    }
    input.value = stored ?? '100';
    apply[k](Number(input.value) / 100);
    input.addEventListener('input', () => {
      apply[k](Number(input.value) / 100);
      try {
        localStorage.setItem(key, input.value);
      } catch {
        /* not remembered, still applied */
      }
    });
  });
}

export class RegulationLayers {
  private entries: Entry[] = [];
  readonly groups: Record<'jurisdictions' | 'towns' | 'publicLands', L.LayerGroup>;

  constructor(map: L.Map, layers: Layers) {
    const add = (features: Poly[], kind: keyof Layers, pane: string) => {
      const group = L.layerGroup();
      for (const f of features) {
        const layer = L.geoJSON(f as any, { pane, interactive: true }).getLayers()[0] as L.Path;
        const entry: Entry = { layer, feature: f, ...describe(f, kind) };
        layer.bindTooltip(() => `<strong>${entry.title}</strong><br>${entry.cat?.label ?? ''}`, { sticky: true, className: 'reg-tip' });
        group.addLayer(layer);
        this.entries.push(entry);
      }
      return group;
    };
    this.groups = {
      jurisdictions: add(layers.jurisdictions, 'jurisdictions', 'jur').addTo(map),
      towns: add(layers.towns, 'towns', 'town').addTo(map),
      publicLands: add(layers.publicLands, 'publicLands', 'pub').addTo(map),
    };
  }

  update(s: StyleState) {
    for (const e of this.entries) {
      e.cat = s.regs
        ? categoryOf(evaluate(s.regs, e.place, s.iso, { includeYouth: s.includeYouth }).summary, s.species, s.view)
        : { key: 'none', label: 'No data', color: 'var(--c-closed)' };
      const kind = e.feature.properties.land ? 'pub' : e.feature.properties.jurisdiction ? 'town' : 'jur';
      const closed = e.cat.key === 'closed' || e.cat.key === 'none';
      e.layer.setStyle({
        fillColor: cssColor(e.cat.color),
        fillOpacity: closed ? 0.25 : kind === 'pub' ? 0.75 : 0.55,
        color: kind === 'pub' ? '#1d3b2a' : kind === 'town' ? '#4b5563' : '#ffffff',
        weight: kind === 'jur' ? 1 : 0.8,
        opacity: kind === 'jur' ? 0.9 : 0.8,
        dashArray: kind === 'town' ? '2 2' : undefined,
      });
    }
  }
}

function describe(f: Poly, kind: keyof Layers): Pick<Entry, 'place' | 'title'> {
  const p = f.properties;
  if (kind === 'publicLands') {
    return { title: `${p.name}<br><small>${jurisdictionLabel(p.jurisdiction, p.subArea)}</small>`, place: placeForPublic(f) };
  }
  if (kind === 'towns') return { title: `Town of ${p.name}`, place: placeForTown(f) };
  return { title: jurisdictionLabel(p.id, p.subArea), place: placeForJurisdiction(p.id, { subArea: p.subArea }) };
}
