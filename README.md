# Conoid

Conoid is a browser-based teaching tool for simulating the optics of performing a Jackson Cross Cylinder (JCC) refinement during refraction.

It helps visualize:

- residual astigmatism
- the conoid / Sturm interval
- power-wave behavior during JCC flipping
- patient vs trial lens correction and axis/power errors

The app is intentionally static so it can be published directly to GitHub Pages without a server, database, or authentication layer.

## Features

- interactive patient and correction refraction inputs
- JCC axis/power mode controls
- flip behavior to simulate cylinder axis refinement
- residual prescription readout and spherical-equivalent guidance
- preset cases for common refraction scenarios
- responsive layout suitable for desktop and mobile

## Tech stack

- React 19
- Vite
- TanStack Router
- Tailwind CSS
- Zustand
- static deployment target: GitHub Pages

## Local development

```bash
npm install
npm run dev
```

Then open the local Vite app in the browser.

## Type-check and build

```bash
npm run typecheck
npm run build:pages
```

This creates a Pages-ready static bundle in `dist/` and writes a `.nojekyll` file so GitHub Pages will serve the generated assets correctly.

## GitHub Pages deployment

The project is configured as a static SPA. It uses relative asset paths and hash-based routing so it works correctly from a repository subpath on GitHub Pages.

The repo now includes a GitHub Actions workflow that builds and deploys the generated `dist/` output automatically. If GitHub Pages is configured to serve the repo root instead of the workflow output, the root `index.html` redirects to `./dist/` so the browser does not try to execute raw TypeScript source files.

Publish the generated `dist/` folder via GitHub Actions or by uploading it directly as the Pages artifact.

## Project notes

- No backend is required for the published site.
- No auth, database, or server functions are part of the GitHub Pages deployment path.
- The app intentionally stays browser-only; if you need server-backed persistence, that should be a separate app or backend service.

## Key files

- `src/components/workbench.tsx` — main JCC simulation shell
- `src/lib/store.ts` — UI state and preset logic
- `src/lib/optics.ts` — optical calculations and Rx logic
- `vite.config.ts` — static Vite configuration
- `src/router.tsx` — router configuration for GitHub Pages compatibility
- `dist/` — generated static site output
