# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page Pokédex that fetches data from the public [PokéAPI](https://pokeapi.co/) and lets the user search by name/number and page through Pokémon with Prev/Next buttons (and arrow keys). Built with **TypeScript** (ES modules, strict mode), bundled with **Vite**. Live site: https://pokedex.devfrs.com/ (deployed on Cloudflare Pages; build `npm run build`, output `dist`). Unknown routes fall back to `public/404.html`. Bilingual UI (PT-BR/EN) via `src/i18n/`; in PT mode, API text (description/genus/abilities) uses Spanish as the closest approximation since PokéAPI has no Portuguese.

## Commands

- `npm install` — install dependencies (required first).
- `npm run dev` — Vite dev server with hot reload (default http://localhost:5173).
- `npm run build` — `tsc --noEmit` typecheck **then** production build into `dist/`.
- `npm run preview` — serve the production build (default http://localhost:4173).
- `npm run typecheck` — `tsc --noEmit` (strict; config in `tsconfig.json`).
- `npm run lint` — ESLint (flat config in `eslint.config.js`, typescript-eslint).
- `npm run format` — Prettier across the repo.
- `npm run test` — Vitest (jsdom env, configured under `test` in `vite.config.js`). Test files are `src/__tests__/*.test.ts`.

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build on every push/PR. PWA (service worker + offline caching of PokéAPI/sprites) is generated at build time by `vite-plugin-pwa` in `vite.config.js`.

## Architecture

Vite treats `index.html` at the repo root as the entry; it loads `src/main.ts` as an ES module. Elements are targeted from TS by CSS class — the class name is the contract between `index.html`, `src/styles/style.css`, and the modules, so change them together. Code is organized by concern: `services/` (data & IO), `domain/` (pure domain logic), `i18n/`, `features/` (self-contained UI widgets), with shared types in `src/types.ts`.

- `src/main.ts` — composition root. Typed DOM refs via a `qs<T>()` helper, the render pipeline (`renderPokemon` → `renderDetails` → `renderTypes`/`renderStats`/`renderAbilities`/`renderSpeciesInfo`/`renderWeaknesses`/`renderEvolution` + `radarSvg`), all event listeners (form submit, Prev/Next, arrow-key nav, `/` focus, random, shiny, cry, share, download PNG/GIF, favorite, theme/lang toggle, stats-legend), and module state: `searchPokemon`, `currentPokemon`, `currentImages`, `currentCry`, `shiny`. A `requestId` token drops stale async renders. Deep-linking reads `?pokemon=ID` and mirrors it back via `history.replaceState`. Imports `./styles/style.css`.
- `src/types.ts` — shared interfaces for the PokéAPI fields the app reads (`Pokemon`, `Species`, `TypeData`, `RefItem`, `Favorite`, `Lang`, …).
- `src/services/pokeapi.ts` — fetch layer + in-memory `Map` caches (pokemon/species/type/ability). `fetchPokemon` returns `null` on non-200 (throws on network error). `fetchEvolutionChain` BFS-walks the tree (handles branches like Eevee). `fetchWeaknesses` combines type damage relations. `fetchByType`/`fetchByGeneration` back the filter. `getFlavorText`/`getGenus`/`getAbilityName` take a language. `MAX_POKEMON` (1025) bounds Next.
- `src/services/sprites.ts` — pure image helpers. `getPokemonSprite(data, shiny)` resolves via a fallback chain (Gen-V animated → official artwork → dream world → default) — the fix for Gen VI+ Pokémon whose `generation-v` animated sprite is `null`. Also `getStaticImage`, `getAnimatedGif`, `getArtworkById`.
- `src/services/storage.ts` — thin `localStorage` layer: theme + favorites (`[{id, name}]`). Dark mode toggles the `dark` class on `<html>`; CSS overrides live under `html.dark …`.
- `src/domain/pokemonTypes.ts` — `TYPE_COLORS`/`TYPE_LABELS`/`TYPE_NAMES` (+ getters). The primary type color is written to the `--type-color` CSS custom property that themes the whole UI.
- `src/domain/pokemonInfo.ts` — pure helpers for the extra PokéAPI data: `aboutRows` (base XP, capture rate, happiness, growth, gender, egg groups, hatch cycles, habitat, generation), `speciesFlags` (legendary/mythical/baby), `groupMoves` (moves grouped by learn method, deduped), plus formatters. `main.ts` renders these into the details card (About grid, held items, collapsible moves, and encounter locations via `fetchEncounters`).
- `src/i18n/` — `translations.ts` holds the typed `Translation` dictionaries (PT/EN, incl. `statLabels`/`statNames` `StatMap`s); `index.ts` exposes `t(key)` (typed by key), `getLang`/`setLang`, and `contentLang()` (`pt`→`es`). Static text uses `data-i18n`/`data-i18n-ph`/`data-i18n-aria` attributes applied by `applyStaticI18n()`.
- `src/features/autocomplete.ts` — `setupAutocomplete(...)` + pure `filterNames()`: a **substring** suggestion dropdown (prefix matches first, highlighted, keyboard-navigable). Used by both the main search and the compare input.
- `src/features/filter.ts` — `setupFilter(...)`: paginated (24/page) clickable grid filtered by type and/or generation. Returns `{ refresh, setType }` (type badges call `setType`).
- `src/features/compare.ts` — `setupCompare(...)`: up to **4 Pokémon** (removable chips) → radar + N-column stat table. Returns `{ add, refresh }`.
- `src/features/radar.ts` — `radarSvg(list, colors)`: pure SVG radar of the 6 base stats; shared by the details card (1 Pokémon) and compare (up to 4).
- `src/styles/style.css` — all styling, driven by design tokens (`:root` + `html.dark`). The `.pokedex-device` overlay uses percentage-based absolute positioning tuned to `pokedex.png`; the device name auto-shrinks (`fitPokemonName`) to fit long form names.

## Static assets

Images and favicons live in `public/` and are referenced with root-absolute paths (`/images/pokedex.png`, `/favicons/...`). Vite copies `public/` to the build root — put new static assets there, not in `src/`.

## PokéAPI notes

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{name-or-id}`. Height is in decimetres and weight in hectograms — divide by 10 for m/kg (done in `renderDetails`). Base stats can reach ~255; stat bars normalize against 255 and cap at 100%.
