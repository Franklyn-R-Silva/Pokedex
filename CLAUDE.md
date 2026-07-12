# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A single-page Pokédex that fetches data from the public [PokéAPI](https://pokeapi.co/) and lets the user search by name/number and page through Pokémon with Prev/Next buttons (and arrow keys). Built with vanilla JavaScript ES modules, bundled with **Vite**. Live site: https://pokedex-franklyn.netlify.app/ (deployed on Netlify).

## Commands

- `npm install` — install dependencies (required first).
- `npm run dev` — Vite dev server with hot reload (default http://localhost:5173).
- `npm run build` — production build into `dist/`.
- `npm run preview` — serve the production build (default http://localhost:4173).
- `npm run lint` — ESLint (flat config in `eslint.config.js`).
- `npm run format` — Prettier across the repo.

There is no test suite.

## Architecture

Vite treats `index.html` at the repo root as the entry; it loads `src/main.js` as an ES module (`<script type="module">`). Elements are still targeted from JS by CSS class — the class name is the contract between `index.html`, `src/style.css`, and the JS modules, so change them together.

- `src/main.js` — orchestration. Holds DOM references, the render pipeline (`renderPokemon` → `renderDetails` → `renderTypes`/`renderStats`/`renderAbilities`/`renderEvolution`), all event listeners (form submit, Prev/Next, arrow-key nav, download, favorite, theme toggle), and module-level state: `searchPokemon` (current ID, clamped to `[1, MAX_POKEMON]`), `currentPokemon` (full data, for favoriting), `currentSprite` (for download). A `requestId` token guards against race conditions — async renders (evolution) are dropped if a newer navigation started. `downloadSprite()` fetches the sprite as a blob and triggers a download (falls back to opening the URL). `populateNameList()` fills the `#pokemon-list` datalist for autocomplete. Imports `./style.css`.
- `src/api.js` — data layer. `fetchPokemon(idOrName)` returns JSON or `null` on non-200 (throws on network failure, caught in `main.js`) and memoizes results in an in-module `Map` (keyed by both name and id) so Prev/Next doesn't refetch. `fetchAllPokemonNames()` returns the full name list for autocomplete. `fetchEvolutionChain(speciesUrl)` follows `species → evolution_chain` and BFS-walks the tree (handles branches like Eevee), returning `[{name, id}]` with ids parsed from resource URLs (so `getArtworkById(id)` builds thumbnails without extra requests). `getPokemonSprite(data)` resolves the image via a fallback chain (Gen-V animated → official artwork → dream world → default) — the fix for Gen VI+ Pokémon whose `generation-v` animated sprite is `null`. `MAX_POKEMON` (1025) bounds the Next button.
- `src/pokemonTypes.js` — `TYPE_COLORS` / `TYPE_LABELS` maps (+ getters) for the 18 types. The primary type's color is written to the `--type-color` CSS custom property, which themes the body gradient, details panel border, and stat bars.
- `src/storage.js` — thin `localStorage` layer: theme (`getTheme`/`setTheme`) and favorites (`getFavorites`/`isFavorite`/`toggleFavorite`, stored as `[{id, name}]`). Dark mode toggles the `dark` class on `<html>`; CSS overrides live under `html.dark …`.
- `src/autocomplete.js` — `setupAutocomplete({input, container, getNames, onSelect})` replaces the native `<datalist>` (prefix-only) with a **substring** dropdown so partial-name searches work. Prefix matches rank first, the matched span is highlighted, and it's keyboard-navigable (↑/↓, Enter, Esc). The full name list is loaded once into `allNames` in `main.js` and passed via `getNames`.
- `src/style.css` — all styling. The `.pokedex-device` wrapper is `position: relative` and the search/buttons/name/image overlay it with percentage-based absolute positioning tuned to the `pokedex.png` device image; the `.details` panel below shows types, height, weight, and stat bars.

## Static assets

Images and favicons live in `public/` and are referenced with root-absolute paths (`/images/pokedex.png`, `/favicons/...`). Vite copies `public/` to the build root — put new static assets there, not in `src/`.

## PokéAPI notes

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{name-or-id}`. Height is in decimetres and weight in hectograms — divide by 10 for m/kg (done in `renderDetails`). Base stats can reach ~255; stat bars normalize against 255 and cap at 100%.
