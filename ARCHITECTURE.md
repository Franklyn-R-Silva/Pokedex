# Architecture

This document describes how the Pokédex is organized so you can find your way
around the codebase before contributing. For a higher-level overview and setup
instructions, see the [README](./README.md).

## Overview

A single-page application built with **React 19 + TypeScript** (strict mode) and
bundled with **Vite**. All state lives on the client; data is fetched on demand
from the [PokéAPI](https://pokeapi.co/) and the [Pokémon TCG API](https://pokemontcg.io/).
An optional [Supabase](https://supabase.com/) backend adds authentication and
cloud persistence — the app runs fully without it, falling back to `localStorage`.

The pure, framework-agnostic logic (`services/`, `domain/`, `i18n/`, and the
imperative `features/` widgets) is shared with the project's original vanilla
build; this branch ports the **UI layer** to React while reusing that logic
unchanged.

```
Browser
  │
  ├── index.html ──────────► single #root div, loads src/main.tsx
  │
  └── src/main.tsx ────────► createRoot + providers
           │                   (I18n · Auth · Favorites · Modal)
           │
           └── src/App.tsx ──► composition root: state, view routing,
                    │            keyboard nav, deep links, SEO/OG sync
                    │
                    ├── components/ ─► React UI (device, details, cards, deck, panels…)
                    ├── context/ ────► ModalContext · FavoritesContext · AuthContext
                    ├── hooks/ ──────► usePokemon · useSpecies · useTheme · useDeck …
                    ├── services/ ───► data & IO (PokéAPI, TCG, Supabase, storage…)
                    ├── domain/ ─────► pure domain logic (types, info, deck rules)
                    ├── i18n/ ───────► typed PT-BR / EN dictionaries + helpers
                    ├── features/ ───► reused imperative setup* widgets
                    └── styles/ ─────► design tokens + per-area CSS
```

## Folder layout

| Path          | Responsibility                                                                   |
| ------------- | -------------------------------------------------------------------------------- |
| `components/` | React UI, grouped by area (`details/`, `cards/`, `deck/`, `panels/`, `auth/`, …) |
| `context/`    | React context providers (modal, favorites, auth)                                 |
| `hooks/`      | Reusable stateful logic (data fetching, theme, deck, translation)                |
| `services/`   | Data access and IO — PokéAPI, TCG API, Supabase, storage, translation, download  |
| `domain/`     | Pure domain logic with no IO (type colors, derived info, deck rules)             |
| `i18n/`       | Typed translation dictionaries and helpers                                       |
| `features/`   | Self-contained imperative widgets, each a `setup*()` function mounted via a ref  |
| `types.ts`    | Shared interfaces for the PokéAPI fields the app reads                           |
| `__tests__/`  | Vitest unit tests (E2E tests live in `e2e/`, Playwright)                          |

## Rendering model

`App.tsx` holds the top-level state (`query`, `shiny`, `view`) and drives four
views selected by the `?view=` query param and rendered lazily via
`React.lazy` + `Suspense`:

- **`main`** — the Pokédex device, details card, and the side panels.
- **`cards`** (`?view=cards`) — TCG card browser (Pokémon TCG API).
- **`deck`** (`?view=deck`) — TCG deck builder with analytics.
- **`pokedex`** (`?view=pokedex`) — advanced explorer (sidebar filters + grid).

The primary type color of the current Pokémon is written to the `--type-color`
CSS custom property, which themes the entire UI. `App.tsx` also keeps the URL
(`?pokemon=ID`) and the SEO/OpenGraph meta tags in sync, and wires the `←`/`→`
and `/` keyboard shortcuts.

## Reused imperative widgets

The `features/*` widgets (`autocomplete`, `filter`, `compare`, `radar`, `team`,
`quiz`, `battle`) predate the React port and manipulate the DOM directly through
a `setup*(container, …)` function that returns a small control API. React mounts
them inside a `useEffect` against a `ref`; React then leaves that subtree alone,
so their behavior is preserved without a rewrite. This is why `main.tsx` does
**not** use `StrictMode` — the dev double-mount would break these imperative
setups.

## Modules

### `services/pokeapi.ts` — PokéAPI data layer

`fetchPokemon(idOrName)` returns `null` on non-200 responses and **throws** on
network failure; results are memoized in a `Map` (by name and id). Also:
`fetchAllPokemonNames()` (autocomplete list, cached in `localStorage`),
`fetchSpecies`, `getFlavorText`/`getGenus`/`getAbilityName` (language-aware),
`fetchEvolutionChain` (BFS-walks branches like Eevee),
`fetchWeaknesses` (combines type damage relations), and
`fetchByType`/`fetchByGeneration` (back the filter). `MAX_POKEMON` (1025) bounds Next.

### `services/sprites.ts` — image helpers (pure)

`getPokemonSprite(data, shiny)` resolves through a fallback chain — **Gen-V
animated → official artwork → dream world → default** — needed because the
animated sprite is `null` for newer generations. Also `getStaticImage`,
`getAnimatedGif`, and `getArtworkById(id)`.

### `services/tcg.ts` — Pokémon TCG API

Fetches trading cards (content, rarity, market price) for the cards browser and
deck builder. An optional `VITE_POKEMONTCG_KEY` raises the request rate limit.

### `services/supabase.ts` — optional backend

Creates a single Supabase client from `VITE_SUPABASE_*` env vars, or `null` when
they are absent (`isSupabaseConfigured`). Access is enforced by Row Level
Security on the `poke_*` tables; only the anon/publishable key is used in the
frontend. Migrations live in `supabase/migrations/`.

### `services/storage.ts` — local persistence

Thin wrapper over `localStorage` for the theme (`getTheme`/`setTheme`) and
favorites (`[{ id, name }]`). Dark mode toggles the `dark` class on `<html>`.

### `domain/`

- **`pokemonTypes.ts`** — `TYPE_COLORS` / `TYPE_LABELS` / `TYPE_NAMES` (18 types)
  and getters; the primary color feeds the `--type-color` CSS variable.
- **`pokemonInfo.ts`** — pure helpers for the extra PokéAPI data: `aboutRows`,
  `speciesFlags` (legendary/mythical/baby), `groupMoves`, and formatters.
- **`deck.ts`** — pure deck rules: composition, deck-health scoring, and
  Standard/Expanded legality checks.

### `i18n/`

`translations.ts` defines the typed `Translation` interface and the PT/EN
dictionaries (including the `StatMap`s). `I18nContext.tsx` exposes the `useI18n`
hook — `t(key)` (typed by key), `lang`, `setLang`, and `contentLang()`
(`pt`→`es`, since the PokéAPI has no Portuguese).

### Translation of API prose

The PokéAPI has no Portuguese, so in PT mode free-form text (description, genus,
abilities) is machine-translated EN→PT via `services/translate.ts` (MyMemory
API, cached in `localStorage`); finite terms (growth rate, egg groups, habitat)
use curated maps in `domain/pokemonInfo.ts`.

## Build & quality

- **Vite** bundles into `dist/`. Deployed to **Cloudflare** (build `npm run build`,
  output `dist`); unknown routes fall back to `public/404.html`.
- **TypeScript** (strict) runs via `tsc --noEmit` in `build`, `typecheck`, and CI.
- **vite-plugin-pwa** generates the service worker and manifest (installable +
  offline `CacheFirst` for PokéAPI responses and sprites).
- **Vitest** covers the pure logic; **Playwright** runs the E2E suite in `e2e/`,
  including an **@axe-core/playwright** audit that fails on any critical WCAG 2
  A/AA violation. **ESLint** (typescript-eslint) and **Prettier** enforce style.
- **CI** (`.github/workflows/ci.yml`) runs **lint → typecheck → test → build**
  plus a separate **e2e** job on every push and pull request.

## PokéAPI notes

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{name-or-id}`. Height is in
decimetres and weight in hectograms (divide by 10 for m/kg). Base stats can
reach ~255; stat bars normalize against 255 and cap at 100%.
