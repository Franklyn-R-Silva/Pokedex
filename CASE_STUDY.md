# Pokédex — Case Study

> Snippet pronto para o portfólio (devfrs.com). Copie a seção que precisar.

**Live:** https://pokedex.devfrs.com · **Código:** https://github.com/Franklyn-R-Silva/Pokedex

---

## Resumo (pt-br)

Pokédex web progressiva (PWA) que consome a PokéAPI. Comecei de um starter
vanilla-JS e evoluí para uma aplicação TypeScript com arquitetura modular,
i18n pt-br/en, tema claro/escuro, busca com autocomplete tolerante a erros,
comparação de Pokémon, montador de time com cálculo de fraquezas, quiz
"Quem é esse Pokémon?" e download de sprite/GIF. Publicada na Cloudflare
com deploy contínuo e coberta por testes unitários, E2E e auditoria de
acessibilidade automatizada.

## Summary (en)

Progressive web Pokédex powered by the PokéAPI. I took a vanilla-JS starter
and grew it into a modular TypeScript app: pt-br/en i18n, light/dark theme,
typo-tolerant autocomplete search, side-by-side comparison, a team builder
that aggregates type weaknesses, a "Who's that Pokémon?" quiz, and
sprite/GIF download. Shipped on Cloudflare with CI, unit + E2E tests, and an
automated accessibility audit.

---

## Destaques técnicos

- **TypeScript estrito** com `tsc --noEmit` no CI; helper `qs<T>()` para DOM
  tipado e um `Translation` interface para i18n type-safe.
- **Arquitetura por camadas** — `services/` (PokéAPI, sprites, storage,
  tradução), `domain/` (regras de tipos e formatação), `features/`
  (autocomplete, filtro, comparação, radar, time, quiz), `i18n/`.
- **PWA** com vite-plugin-pwa (Workbox `generateSW`), precache dos assets e
  fallback offline.
- **Tradução real pt-br**: a PokéAPI não tem português, então textos livres
  (descrição, gênero, habilidades) são traduzidos EN→PT via MyMemory e
  cacheados em `localStorage`; termos finitos usam mapas curados.
- **Acessibilidade**: abas com semântica ARIA (`role="tab"`/`tabpanel`,
  `aria-selected`), foco gerenciado nos modais (focus-trap + Escape),
  atalhos `/` e ←/→, e **auditoria axe-core no E2E** que falha o build em
  qualquer violação crítica WCAG 2 A/AA.
- **Qualidade automatizada**: Vitest (unit), Playwright + @axe-core/playwright
  (E2E + a11y), ESLint (typescript-eslint flat config) e Prettier — tudo no
  GitHub Actions.
- **Deploy**: Cloudflare Workers Static Assets via `wrangler.jsonc`.

## Stack

`TypeScript` · `Vite 6` · `vite-plugin-pwa / Workbox` · `Vitest` ·
`Playwright` · `axe-core` · `ESLint` · `Prettier` · `Cloudflare Workers` ·
`PokéAPI`

## Decisões técnicas

- Bundlar a imagem do device via `import` (hash + precache) em vez de caminho
  fixo em `public/` resolveu um bug de service worker servindo asset velho no
  Edge — cache-busting de graça.
- Guardar traduções em `localStorage` evita estourar a cota da API gratuita e
  deixa a segunda visita instantânea.
- Um teste axe no pipeline transforma acessibilidade de "intenção" em
  invariante: regressões de ARIA quebram o CI.

## Cards curtos (para grid de projetos)

**pt-br:** Pokédex PWA em TypeScript — i18n pt/en, tema, comparação, montador
de time e quiz. CI com testes unitários, E2E e auditoria de acessibilidade.
Deploy na Cloudflare.

**en:** TypeScript PWA Pokédex — pt/en i18n, theming, comparison, team builder
and quiz. CI with unit, E2E and accessibility audits. Deployed on Cloudflare.
