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
- Clickable evolution chain, shiny toggle, Pokémon cry, and random Pokémon
- Compare up to 4 Pokémon (stat table + radar chart); filter by type and generation with pagination
- Bilingual UI (PT-BR / EN); favorites and theme persisted locally
- Download the static image (PNG) and the animated GIF
- Shareable deep links (`?pokemon=ID`), installable PWA with offline support
- Responsive: single column on mobile, three columns on desktop

> The PokéAPI has no Portuguese localization, so in PT mode API text (description, genus,
> abilities) falls back to Spanish as the closest approximation; the UI and type names are fully translated.

## Tech stack

TypeScript · Vite · vite-plugin-pwa · Vitest · ESLint + Prettier · PokéAPI.
CI (GitHub Actions) runs lint, typecheck, tests, and build on every push and PR.

## Getting started

Requires [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/Franklyn-R-Silva/Pokedex.git
cd Pokedex
npm install
npm run dev
```

Open the URL printed in the terminal (default `http://localhost:5173`).

| Script              | Description                               |
| ------------------- | ----------------------------------------- |
| `npm run dev`       | Development server with hot reload        |
| `npm run build`     | Typecheck + production build into `dist/` |
| `npm run preview`   | Preview the production build              |
| `npm run typecheck` | Type-check with `tsc --noEmit`            |
| `npm run test`      | Run unit tests (Vitest)                   |
| `npm run lint`      | Lint with ESLint                          |
| `npm run format`    | Format with Prettier                      |

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
  features/              # autocomplete · filter · compare · radar
  styles/style.css
  __tests__/*.test.ts    # Vitest
public/                  # Static assets, PWA icons, 404.html
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for details.

## Deployment

Deployed on **Cloudflare Pages** — build command `npm run build`, output directory `dist`.

## License

[MIT](./LICENSE) © Franklyn — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva).
Data from the [PokéAPI](https://pokeapi.co/); Pokémon © Nintendo / Game Freak.
