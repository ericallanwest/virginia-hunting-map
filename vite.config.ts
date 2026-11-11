import { readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig } from 'vite';

// base './' so the built site works from any path (e.g. GitHub Pages project sites).
export default defineConfig({
  base: './',
  plugins: [
    {
      // public/data keeps the GeoJSON the build scripts work with; the app loads only the
      // TopoJSON copies, so leave the GeoJSON out of the deployed site.
      name: 'drop-geojson',
      apply: 'build',
      closeBundle() {
        const dir = join(__dirname, 'dist', 'data');
        for (const f of readdirSync(dir)) if (f.endsWith('.geojson')) rmSync(join(dir, f));
      },
    },
  ],
});
