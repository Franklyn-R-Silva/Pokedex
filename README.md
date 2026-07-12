<h1 align="center">Pokédex</h1>

<p align="center">
  A fast, installable Pokédex built with vanilla JavaScript and the
  <a href="https://pokeapi.co/">PokéAPI</a> — search, compare, and explore Pokémon in PT-BR or EN.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" />
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

## Features

- Search by name (substring suggestions) or number, with Prev/Next and keyboard arrows
- Types, base stats (with radar chart), abilities (hidden ones flagged), type weaknesses, and description
- Rich data: base XP, capture rate, happiness, growth, gender ratio, egg groups, hatch cycles, habitat, generation, held items, full move list, encounter locations, and legendary/mythical flags
- Clickable evolution chain (with methods), alternate forms, EV yield, shiny toggle, cry, and random
- Image lightbox with a full sprite gallery (artwork, shiny, animated, front/back)
- Compare up to 4 Pokémon (stat table + radar chart); filter by type and generation with pagination
- Bilingual UI (PT-BR / EN); favorites and theme persisted locally
- Download the static image (PNG) and the animated GIF
- Shareable deep links (`?pokemon=ID`), installable PWA with offline support
- Responsive: single column on mobile, three columns on desktop

> The PokéAPI has no Portuguese, so in PT mode the API prose (description, genus, abilities) is
> machine-translated EN→PT (MyMemory, cached in `localStorage`); the UI, type names, and finite
> terms (growth rate, egg groups, habitat) are translated directly.

## Tech stack

TypeScript · Vite · vite-plugin-pwa · Vitest · Playwright + axe-core · ESLint + Prettier · PokéAPI.
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
index.html               # Entry point (loads src/main.ts)
src/
  main.ts                # Composition root: DOM refs, render pipeline, events
  types.ts               # Shared PokéAPI types
  services/              # Data & IO
    pokeapi.ts           # fetch + in-memory cache
    sprites.ts           # image/sprite helpers
    storage.ts           # theme & favorites (localStorage)
  domain/
    pokemonTypes.ts      # type colors & labels
  i18n/
    index.ts             # getLang / setLang / t / contentLang
    translations.ts      # PT-BR / EN dictionaries
  features/              # autocomplete · filter · compare · radar · team · quiz
  styles/style.css
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
