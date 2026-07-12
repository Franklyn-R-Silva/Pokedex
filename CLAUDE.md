# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page Pokédex that fetches data from the public [PokéAPI](https://pokeapi.co/) and lets the user search by name/number and page through Pokémon with Prev/Next buttons (and arrow keys). Built with **React 19 + TypeScript** (strict mode), bundled with **Vite**. Live site: https://pokedex.devfrs.com/ (deployed on Cloudflare; build `npm run build`, output `dist`). Unknown routes fall back to `public/404.html`. Bilingual UI (PT-BR/EN) via `src/i18n/`. PokéAPI has no Portuguese, so in PT mode the API prose (description/genus/abilities) is machine-translated EN→PT via `src/services/translate.ts` (MyMemory API, cached in `localStorage`); finite terms (growth/egg/habitat) use curated maps in `src/domain/pokemonInfo.ts`.

> **Note on the React migration:** the `main` branch is the original vanilla-TS build; the `migrate/react` branch ports the UI to React while reusing all the framework-agnostic logic. This file describes the React architecture (the branch). Beyond the base Pokédex, the app also has a **TCG cards** tab (Pokémon TCG API — content, rarity, market price, 3D holo tilt), a turn-based **team battle** mini-game, and a **TCG deck builder** view (`?view=deck`) with charts and a deck-health score.

## Commands

- `npm install` — install dependencies (required first).
- `npm run dev` — Vite dev server with hot reload (default http://localhost:5173).
- `npm run build` — `tsc --noEmit` typecheck **then** production build into `dist/`.
- `npm run preview` — serve the production build (default http://localhost:4173).
- `npm run typecheck` — `tsc --noEmit` (strict; config in `tsconfig.json`).
- `npm run lint` — ESLint (flat config in `eslint.config.js`, typescript-eslint).
- `npm run format` — Prettier across the repo.
- `npm run test` — Vitest (jsdom env, configured under `test` in `vite.config.js`). Test files are `src/__tests__/*.test.ts`.
- `npm run test:e2e` — Playwright E2E (`e2e/app.spec.ts`), including an axe accessibility audit. Config in `playwright.config.ts`; the `webServer` runs `npm run build && npm run preview`, so kill any stale server on port 4173 before re-running (Playwright reuses an existing server locally and would skip the rebuild). Browsers: `npx playwright install chromium`.

CI (`.github/workflows/ci.yml`) runs lint → typecheck → test → build (job `build`) plus a separate `e2e` job (installs Chromium, runs `npm run test:e2e`) on every push/PR. The axe audit fails CI on any critical WCAG 2 A/AA violation. PWA (service worker + offline caching of PokéAPI/sprites) is generated at build time by `vite-plugin-pwa` in `vite.config.js`.

## Architecture (React branch)

Vite treats `index.html` (a single `<div id="root">`) as the entry; it loads `src/main.tsx`, which mounts `<App/>` inside the i18n/favorites/modal providers. The **pure logic is reused unchanged** from the vanilla build — `services/` (data & IO), `domain/` (pure domain logic incl. `deck.ts`), `i18n/`, and the container-based `features/*` widgets (radar, moves list, autocomplete, filter, compare, team, quiz, battle). The UI is React components; global CSS in `src/styles/style.css` is shared, keyed by the same class names.

- `src/main.tsx` — entry: `createRoot` + providers (`I18nProvider`, `FavoritesProvider`, `ModalProvider`). No StrictMode, because the reused imperative `setup*` widgets don't tolerate the dev double-mount.
- `src/App.tsx` — composition root. State (`query`, `shiny`, `view`), `usePokemon(query)`, `--type-color`/URL/SEO sync, `←/→` + `/` keyboard nav, deep-link `?pokemon=ID`, Pokémon-of-the-day default, and the `?view=deck` route. Renders `Header`, `PokedexDevice`, `DetailsCard`, the panels column, or the `DeckBuilder`.
- `src/components/` — `Header` (deck/install/info/lang/theme), `PokedexDevice` (sprite, search + autocomplete, Prev/Next, cry, share, lightbox), `DetailsCard` (5 tabs) with `details/` subcomponents (`About`, `Abilities`+`AbilityDetail`, `Effectiveness`, `Evolution`, `Moves`+`MoveDetail`, `Cards`+`CardDetail`), `DetailsActions` (favorite + download), `TypeBadge`, `StatsList`, `Lightbox`, `InfoModal`; `panels/` (Favorites, Filter, Compare, Team+battle, Quiz) mount the reused `setup*` widgets into React refs; `deck/` (DeckBuilder, Catalog, DeckList, DeckAnalysis + `labels.ts`).
- `src/context/` — `ModalContext` (generic `open(<Node/>)` modal), `FavoritesContext`.
- `src/hooks/` — `usePokemon` (fetch + neighbor prefetch), `useSpecies`, `useTheme`, `useTranslatedText` (async EN→PT), `useDeck` (deck state + localStorage).
- Reused feature note: panels/device wrap the existing `setup*(container, …)` functions in a `useEffect` with refs, so their behavior is preserved without a rewrite (React leaves the imperatively-managed subtree alone).
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

Favicons and PWA icons live in `public/` (root-absolute paths like `/favicons/...`, `/icons/...`); Vite copies `public/` to the build root. The Pokédex device image is bundled via `import ... from './assets/pokedex.png'` in `main.ts` (hashed URL, precached by the SW, cache-busted on change) instead of a fixed `public/` path — this avoids stale-service-worker issues where a fixed asset path serves a broken cached copy.

## PokéAPI notes

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{name-or-id}`. Height is in decimetres and weight in hectograms — divide by 10 for m/kg (done in `renderDetails`). Base stats can reach ~255; stat bars normalize against 255 and cap at 100%.
