# Conoid project guide

This repository is the source for Conoid, an interactive Jackson Cross Cylinder refraction simulation built as a static GitHub Pages app.

## Project goal

Conoid helps teach and explore the optics of refraction during JCC refinement. The application simulates:

- patient and correction prescription inputs
- residual astigmatism calculations
- JCC axis and power adjustments
- conoid / Sturm visualization and power-wave behavior
- preset cases for common clinical scenarios

## Deployment model

This repo is intentionally browser-only.

- GitHub Pages is the production deployment target.
- There is no server runtime, database, or auth layer in the published build.
- The static output lives in `dist/` and is served as a GitHub Pages artifact.
- The app uses relative asset paths and a hash-based router to remain stable under a repo subpath.

## Core commands

```bash
npm install
npm run dev
npm run typecheck
npm run build:pages
```

## Verification and release

Use the Pages build as the release artifact:

```bash
npm run build:pages
```

That command emits the static bundle into `dist/` and adds `.nojekyll` so GitHub Pages preserves underscore-based asset paths. The repo also includes a Pages deploy workflow that uploads the built artifact automatically.

## Important project rules

When editing this repo, keep the app static and GitHub Pages-safe:

- do not reintroduce SSR, Nitro, or Vercel-specific server behavior
- do not add auth, database, or API routes to the published app
- keep asset URLs relative or base-aware
- preserve static routing compatibility for GitHub Pages
- prefer client-only state via React/Zustand rather than server persistence

## Key files

- `src/components/workbench.tsx` — app shell and visual simulation
- `src/lib/optics.ts` — optical calculations and Rx logic
- `src/lib/store.ts` — interactive state, presets, and adjustments
- `src/router.tsx` — router configuration for static hosting
- `vite.config.ts` — static Vite build configuration
- `index.html` — root entry for the static bundle
- `dist/` — generated Pages-ready output

## Do not do

- restore TanStack Start server mode
- reintroduce Vercel/Nitro deployment assumptions
- create backend database or auth flows for the published site
- use root-absolute asset links that break on a GitHub Pages repo subpath
- remove the static build workflow or the hash-routing compatibility

This project is a static teaching app, not a server-rendered application.
