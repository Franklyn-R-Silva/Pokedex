<h1 align="center">Pokédex</h1>

<p align="center">
  A fast, installable Pokédex built with React 19 + TypeScript and the
  <a href="https://pokeapi.co/">PokéAPI</a> — search, compare, and explore Pokémon in PT-BR or EN.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PWA-5A0FC8?style=flat&logo=pwa&logoColor=white" alt="PWA" />
  <img src="https://img.shields.io/badge/Vitest-6E9F18?style=flat&logo=vitest&logoColor=white" alt="Vitest" />
  <img src="https://img.shields.io/badge/Cloudflare%20Pages-F38020?style=flat&logo=cloudflare&logoColor=white" alt="Cloudflare Pages" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="MIT" />
</p>

<p align="center">
  <strong>English</strong> · <a href="README.pt-br.md">Português</a>
  &nbsp;|&nbsp;
  <a href="https://pokedex.devfrs.com/">Live demo</a>
</p>

---

## About

**Pokédex** is a single-page web app that consumes the public [PokéAPI](https://pokeapi.co/)
to search, browse, and deep-dive into all 1025 Pokémon. Beyond the classic Pokédex, it adds
a **TCG cards** explorer (real trading cards, rarity, and market price), a turn-based **team
battle** mini-game, and a **TCG deck builder** with analytics and legality checks.

The framework-agnostic logic (data services, domain rules, i18n, feature widgets) is shared
with the original vanilla build; this branch ports the UI to **React 19 + TypeScript** (strict).
The interface is fully bilingual (PT-BR / EN) — since the PokéAPI has no Portuguese, prose is
machine-translated on the fly and cached locally. Ships as an installable **PWA** with offline
support and is deployed on **Cloudflare Pages**.

## Features

- Search by name (substring suggestions) or number, with Prev/Next and keyboard arrows
- Types, base stats (with radar chart), abilities (hidden ones flagged), type weaknesses, and description
- Rich data: base XP, capture rate, happiness, growth, gender ratio, egg groups, hatch cycles, habitat, generation, held items, full move list, encounter locations, and legendary/mythical flags
- Clickable evolution chain (with methods), alternate forms, EV yield, shiny toggle, cry, and random
- Image lightbox with a full sprite gallery (artwork, shiny, animated, front/back)
- Compare up to 4 Pokémon (stat table + radar chart); filter by type and generation with pagination
- **TCG cards** tab: browse a Pokémon's real trading cards with rarity, market price, and a 3D holo tilt effect (Pokémon TCG API)
- **Team battle** mini-game: build a team and play a turn-based battle (items, win record)
- **Deck builder** (`?view=deck`): assemble TCG decks with charts, a deck-health score, Standard/Expanded legality checks, and meta-deck import
- Bilingual UI (PT-BR / EN); favorites and theme persisted locally
- Download the static image (PNG) and the animated GIF
- Shareable deep links (`?pokemon=ID`), installable PWA with offline support
- Responsive: single column on mobile, three columns on desktop

> The PokéAPI has no Portuguese, so in PT mode the API prose (description, genus, abilities) is
> machine-translated EN→PT (MyMemory, cached in `localStorage`); the UI, type names, and finite
> terms (growth rate, egg groups, habitat) are translated directly.

## Tech stack

React 19 · TypeScript · Vite · vite-plugin-pwa · Vitest · Playwright + axe-core · ESLint + Prettier · PokéAPI · Pokémon TCG API.
CI (GitHub Actions) runs lint, typecheck, unit tests, and build, plus an E2E
job with an automated accessibility audit (fails on any critical WCAG 2 A/AA violation).

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/Franklyn-R-Silva/Pokedex.git
cd Pokedex
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

| Script              | Description                                      |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Development server with hot reload               |
| `npm run build`     | Typecheck + production build into `dist/`        |
| `npm run preview`   | Preview the production build                     |
| `npm run typecheck` | Type-check with `tsc --noEmit`                   |
| `npm run test`      | Run unit tests (Vitest)                          |
| `npm run test:e2e`  | Run E2E + accessibility tests (Playwright + axe) |
| `npm run lint`      | Lint with ESLint                                 |
| `npm run format`    | Format with Prettier                             |

## Project structure

```
index.html               # Entry point (single #root div, loads src/main.tsx)
src/
  main.tsx               # createRoot + i18n / favorites / modal providers
  App.tsx                # Composition root: state, routing, keyboard nav, SEO sync
  types.ts               # Shared PokéAPI types
  components/            # UI: Header, PokedexDevice, DetailsCard (+ details/),
                         #   cards/, deck/, panels/, auth/, InfoModal, Lightbox…
  context/               # ModalContext, FavoritesContext
  hooks/                 # usePokemon · useSpecies · useTheme · useDeck · useTranslatedText
  services/              # Data & IO
    pokeapi.ts           # fetch + in-memory cache
    sprites.ts           # image/sprite helpers
    storage.ts           # theme & favorites (localStorage)
    translate.ts         # EN→PT machine translation (MyMemory, cached)
  domain/                # pokemonTypes · pokemonInfo · deck (pure logic)
  i18n/                  # t / getLang / setLang / contentLang + PT-BR/EN dicts
  features/              # autocomplete · filter · compare · radar · team · quiz · battle
  styles/                # tokens + per-area CSS (layout, device, cards, deck, …)
  __tests__/*.test.ts    # Vitest (unit)
e2e/app.spec.ts          # Playwright E2E + axe accessibility audit
public/                  # Static assets, PWA icons, 404.html
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Deployment

Deployed on **Cloudflare Pages** — build command `npm run build`, output directory `dist`.

## License

[MIT](./LICENSE) © Franklyn — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva).
Data from the [PokéAPI](https://pokeapi.co/); Pokémon © Nintendo / Game Freak.
