# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio single-page site ("Web Emme 25"). React 18 + TypeScript + Vite, styled with Tailwind, animated with Framer Motion, and featuring an interactive 3D guitar built on React Three Fiber. UI copy is in Spanish. Deployed on Vercel.

## Commands

```bash
npm run dev      # Vite dev server on http://localhost:3000 (strictPort, host 0.0.0.0)
npm run build    # tsc type-check, then vite build
npm run preview  # serve the production build locally
npm run lint     # eslint over src/**/*.{ts,tsx}
```

There is no test runner configured.

To test on other devices, the dev server allows tunneling: `npx localtunnel --port 3000` (an allowed host is hardcoded in `vite.config.ts`).

## Architecture

- **Routing** (`src/App.tsx`): `createBrowserRouter` + `RouterProvider` (React Router v7 future flags). Two routes, both `lazy`-loaded behind a shared `<Suspense>` fallback: `/` → `pages/Home`, `/about` → `pages/About`.

- **Navigation** (`src/hooks/useSiteNav.ts`): single source of truth (`navItems`) shared by `Header` and `Footer`. Items are either route links (`to`, e.g. `/about`, `/about#skills`) or Home section scrolls (`section`). Section clicks scroll directly when on Home, otherwise navigate to `/#section`; `useHashScroll` (`src/hooks/useHashScroll.ts`) finishes the scroll once the target page mounts.

- **Pages**: `Home` renders Hero (3D), Projects (hardcoded external links), Contact, and the audio player. `About` renders the `About` and `Skills` components (these were moved off Home). Section reveal animations use Framer Motion's `useInView`.

- **3D scene** (`src/components/Hero/`): `HeroScene.tsx` hosts the `<Canvas>` (transparent/`alpha`, `dpr={[1,2]}`, no OrbitControls) over the 2D `MatrixRain` backdrop, with `CursorParticles` on top. `SpaceScene.tsx` (lazy, behind a console-style `<Html>` Suspense loader) composes 4 objects loaded from S3 and a curve-driven camera:
  - **`sceneObjects.ts`** — the config you edit: `S3_BASE` + the 4 objects (2 `single`, 2 `instanced`) with positions/scale. URL pattern `{S3_BASE}/{name}/{name}.obj` (+ `.mtl` + `.png`).
  - **`Model.tsx`** — the *format boundary*. `useObjModel` loads OBJ+MTL+texture (`MTLLoader.setResourcePath` for the png, `setCrossOrigin('anonymous')` for S3 CORS). `Model` renders a unique clone; `InstancedModel` extracts geometry+material and renders many copies via drei `<Instances>` (one draw call — instances cost no extra download). `ModelBoundary` (error boundary) isolates a failed/placeholder URL so it renders null instead of crashing. **To migrate OBJ→GLB, change only `useObjModel`** to `useGLTF`.
  - **`WanderingCamera.tsx`** — drives the default camera along a closed Catmull-Rom loop looking at centre (no user controls).
  - **`ExplosionParticles.tsx`** — clicking the hero (`exploded`) swaps the models for one `InstancedMesh` of debris bursting from every object position (one draw call; do not regress to a mesh per particle).

- **Contact form** (`src/components/Contact/Contact.tsx`): sends mail via `@emailjs/browser`. Requires env vars `VITE_APP_EMAILJS_SERVICE_ID`, `VITE_APP_EMAILJS_TEMPLATE_ID`, `VITE_APP_EMAILJS_PUBLIC_KEY` (the form shows a config error if any are missing).

## Conventions

- Path alias `@/` → `src/` (configured in both `vite.config.ts` and `tsconfig.json`). The codebase mixes `@/...` and relative imports.
- **Component folders:** each component lives in its own folder under `src/components/` (e.g. `Header/Header.tsx`) with a barrel `index.ts` (`export { default } from './Header'`), so imports reference the folder (`@/components/Header`). Files specific to one component go in that folder — the Hero's pieces (`SpaceScene`, `Model`, `WanderingCamera`, `ExplosionParticles`, `MatrixRain`, `CursorParticles`) live in `components/Hero/`; `Loader/` holds `Spinner.tsx` + its CSS module.
- TypeScript is `strict` with `noUnusedLocals`/`noUnusedParameters`, so `npm run build` fails on unused symbols — clean up rather than leaving dead locals.
- Tailwind utility classes are the styling default; shared classes like `btn-primary`, `btn-ghost`, `panel`, `card`, `section-title`, and `matrix-input` are defined in `src/styles/global.css`.
- **Theme:** "Matrix console" — dark-green base with shiny-orange accents, monospace (`Share Tech Mono`) everywhere. Use the Tailwind palette tokens (`matrix-black/panel/line/dim/green/text`, `neon-orange/amber/ember`) and the `shadow-glow-green` / `shadow-glow-orange` / `text-glow-*` helpers rather than raw hex or the old purple/indigo/gray classes.

## Assets & build output

- Runtime assets (3D model `.gltf`/`.bin`, sounds, images, CV PDFs, logos) are served from the web root and must live under `public/` to be picked up by the dev server and build. `vite.config.ts` adds `.gltf`/`.bin` to `assetsInclude`. `public/` is the source of truth and is tracked by git (it was previously gitignored, which broke clones/deploys — keep it tracked).
- `npm run build` outputs to `dist/` (Vite default; gitignored). `docs/` is a separate, older committed build (hashed `assets/`, model, sounds, CV PDFs) — treat it as generated output, not source; don't hand-edit it.
