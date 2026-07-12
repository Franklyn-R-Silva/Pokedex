# Contributing

Thanks for your interest in improving the Pokédex! This is an open-source project
and contributions of all kinds are welcome — bug reports, features, documentation,
tests, and translations. This guide explains how to get set up and what we expect
from a pull request.

> By participating, you agree to keep the community welcoming and respectful.

## Ways to contribute

- **Report a bug** — open an [issue](https://github.com/Franklyn-R-Silva/Pokedex/issues)
  with clear steps to reproduce, what you expected, and what happened (screenshots help).
- **Suggest a feature** — open an issue describing the idea and the problem it solves.
- **Send a pull request** — fix a bug, add a feature, improve docs or tests.
- **Improve translations** — the UI is bilingual (PT-BR / EN); see `src/i18n/`.

If you're planning a large change, please open an issue first so we can align on
the approach before you invest time in it.

## Getting started

Requires [Node.js](https://nodejs.org/) 18 or newer.

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/Pokedex.git
cd Pokedex

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

The app runs without any configuration. The optional Supabase and TCG API keys
are only needed for the account/collection features — see
[Configuration](./README.md#configuration) in the README.

## Development workflow

1. Create a branch from `migrate/react`:
   ```bash
   git checkout -b feat/short-description
   ```
   Use a descriptive prefix: `feat/`, `fix/`, `docs/`, `refactor/`, `test/`, `chore/`.
2. Make your change, keeping commits focused and the diff minimal.
3. Run the full check suite locally (see below) — everything must pass.
4. Push your branch and open a pull request against `migrate/react`.

## Quality checks

CI runs these on every pull request, so run them locally first:

```bash
npm run lint        # ESLint
npm run typecheck   # tsc --noEmit (strict)
npm run test        # Vitest (unit)
npm run build       # typecheck + production build
npm run test:e2e    # Playwright E2E + axe accessibility audit
npm run format      # Prettier (auto-fix formatting)
```

The accessibility audit **fails the build on any critical WCAG 2 A/AA violation**,
so please keep new UI accessible (semantic HTML, ARIA where needed, keyboard
support, sufficient contrast).

## Coding guidelines

- **TypeScript strict** — no `any` escape hatches; type the code properly.
- **Match the surrounding style** — follow existing naming, structure, and idioms.
  Prettier and ESLint are the source of truth for formatting.
- **Keep the layers clean** — put IO in `services/`, pure logic in `domain/`,
  UI in `components/`, and reusable stateful logic in `hooks/`. See
  [ARCHITECTURE.md](./ARCHITECTURE.md).
- **Add tests** for new pure logic (`src/__tests__/*.test.ts`) and meaningful UI
  flows (`e2e/`).
- **Keep it bilingual** — user-facing strings go through `src/i18n/`; add both the
  PT-BR and EN entries.

## Pull request checklist

Before requesting review, make sure:

- [ ] `lint`, `typecheck`, `test`, and `build` all pass locally.
- [ ] New or changed behavior is covered by tests.
- [ ] User-facing text is added to both language dictionaries.
- [ ] The PR description explains **what** changed and **why**, and links any
      related issue.
- [ ] The change is scoped to a single concern (split unrelated changes into
      separate PRs).

## Versioning & releases

This project follows [Semantic Versioning](https://semver.org/) (`MAJOR.MINOR.PATCH`)
and keeps a human-readable [CHANGELOG.md](./CHANGELOG.md) in the
[Keep a Changelog](https://keepachangelog.com/) format:

- **MAJOR** — incompatible or breaking changes
- **MINOR** — new features, backwards-compatible
- **PATCH** — backwards-compatible bug fixes

Please add an entry under the `## [Unreleased]` section of the changelog for any
user-facing change in your pull request.

Maintainers cut a release by moving the `Unreleased` notes into a new version
section, then bumping and tagging:

```bash
npm version patch      # or "minor" / "major" — updates package.json + creates a git tag
git push --follow-tags # pushes the commit and the v* tag
```

Pushing a `v*.*.*` tag triggers the [release workflow](./.github/workflows/release.yml),
which runs the full check suite, builds the app, and publishes a GitHub Release
(with generated notes and the build artifact attached).

## Reporting security issues

Please **do not** open a public issue for security vulnerabilities. Instead,
report them privately to the maintainer so they can be addressed before disclosure.

## License

By contributing, you agree that your contributions will be licensed under the
[MIT License](./LICENSE) that covers this project.
