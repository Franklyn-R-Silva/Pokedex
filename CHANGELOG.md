# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Advanced Pokédex explorer (`?view=pokedex`) with sidebar filters and a full grid.
- TCG deck builder: expert suggestions, meta-deck import (batched query + cache),
  and a Standard/Expanded legality validator.
- Team battle: Potion item and win record.

## [1.0.0] - 2026-07-12

First stable release.

### Added

- Search Pokémon by name (substring suggestions) or number, with Prev/Next and
  keyboard arrow navigation.
- Detailed view: types, base stats with radar chart, abilities (hidden ones
  flagged), type weaknesses, and description.
- Rich species data: base XP, capture rate, happiness, growth rate, gender ratio,
  egg groups, hatch cycles, habitat, generation, held items, full move list,
  encounter locations, and legendary/mythical flags.
- Clickable evolution chain (with methods), alternate forms, EV yield, shiny
  toggle, cry playback, and random Pokémon.
- Image lightbox with a full sprite gallery (artwork, shiny, animated, front/back)
  and PNG / animated GIF download.
- Compare up to 4 Pokémon (stat table + radar chart); filter by type and
  generation with pagination.
- TCG cards tab: real trading cards with rarity, market price, and a 3D holo tilt
  effect (Pokémon TCG API).
- Turn-based team battle mini-game and a TCG deck builder with analytics and a
  deck-health score.
- Bilingual UI (PT-BR / EN) with EN→PT machine translation of API prose, cached
  in `localStorage`; favorites and theme persisted locally.
- Optional Supabase backend for accounts and cloud persistence (falls back to
  `localStorage` when not configured).
- Installable PWA with offline support; shareable deep links (`?pokemon=ID`).
- Migrated the UI from vanilla TypeScript to React 19 + TypeScript (strict),
  reusing the framework-agnostic services, domain, i18n, and feature widgets.

[Unreleased]: https://github.com/Franklyn-R-Silva/Pokedex/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/Franklyn-R-Silva/Pokedex/releases/tag/v1.0.0
