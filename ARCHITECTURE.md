# Arquitetura

Este documento descreve a organização técnica da Pokédex.

## Visão geral

Aplicação single-page, sem framework, escrita em **TypeScript** (modo strict) e empacotada com **Vite**. Todo o estado vive no cliente; os dados vêm da [PokéAPI](https://pokeapi.co/) sob demanda. O código é organizado por responsabilidade.

```
Navegador
   │
   ├── index.html ──► carrega src/main.ts (type="module")
   │
   └── src/main.ts ── composition root: DOM, render e eventos
            │
            ├── src/types.ts ─────────► tipos compartilhados da PokéAPI
            ├── src/services/
            │      ├── pokeapi.ts ─────► fetch + cache (pokemon/species/type/ability)
            │      ├── sprites.ts ─────► resolução de imagem (puro)
            │      └── storage.ts ─────► tema e favoritos (localStorage)
            ├── src/domain/
            │      └── pokemonTypes.ts ► cores/labels dos tipos
            ├── src/i18n/
            │      ├── index.ts ───────► t()/getLang/setLang/contentLang
            │      └── translations.ts ► dicionários PT-BR / EN (tipados)
            ├── src/features/
            │      ├── autocomplete.ts ► sugestões por substring
            │      ├── filter.ts ──────► filtro por tipo / geração (paginado)
            │      ├── compare.ts ─────► comparação de até 4 Pokémon
            │      └── radar.ts ───────► gráfico de radar (SVG)
            │
            └── src/styles/style.css ── tokens de design + layout responsivo
```

## Padrão de pastas

- **`services/`** — acesso a dados e IO: chamadas à PokéAPI (com cache) e `localStorage`.
- **`domain/`** — lógica de domínio pura (cores/labels dos tipos).
- **`i18n/`** — internacionalização (dicionários tipados + helpers).
- **`features/`** — widgets de UI autocontidos, cada um com uma função `setup*` que recebe seus elementos e devolve uma pequena API de controle.
- **`types.ts`** — interfaces compartilhadas para os campos da PokéAPI usados pelo app.
- **`__tests__/`** — testes unitários (Vitest). Os testes E2E ficam em `e2e/` (Playwright).

## Módulos

### `src/services/pokeapi.ts` — camada de dados

- `fetchPokemon(idOrName)`: retorna `null` em respostas não-200 e **lança** em falha de rede. Memoriza em `Map` (por nome e id).
- `fetchAllPokemonNames()`: lista completa de nomes (autocomplete), com cache em `localStorage`.
- `fetchSpecies` (com cache) + `getFlavorText`/`getGenus`/`getAbilityName`: conteúdo textual no idioma pedido (fallback en).
- `fetchEvolutionChain(speciesUrl)`: percorre `species → evolution_chain` em BFS (inclui ramificações como a do Eevee); o id vem da URL, evitando requisições extras.
- `fetchWeaknesses(types)`: combina as `damage_relations` (cache por tipo).
- `fetchByType`/`fetchByGeneration`: alimentam o filtro. `MAX_POKEMON` (1025) limita o Next.

### `src/services/sprites.ts` — imagens (puro)

`getPokemonSprite(data, shiny)` resolve via cadeia de fallback — **animado (Gen V) → artwork oficial → dream world → padrão** — necessário porque o animado é `null` na API para gerações novas. Também `getStaticImage`, `getAnimatedGif` e `getArtworkById(id)`.

### `src/services/storage.ts` — persistência

Camada fina sobre `localStorage`: tema (`getTheme`/`setTheme`) e favoritos (`[{ id, name }]`).

### `src/domain/pokemonTypes.ts` — tipos

`TYPE_COLORS`/`TYPE_LABELS`/`TYPE_NAMES` (18 tipos) e getters. A cor do tipo primário alimenta a variável CSS `--type-color`.

### `src/domain/pokemonInfo.ts` — dados derivados

Helpers puros para o conteúdo extra da PokéAPI: `aboutRows` (XP base, captura, felicidade, crescimento, gênero, grupos de ovo, ciclos de choco, habitat, geração), `speciesFlags` (lendário/mítico/bebê), `groupMoves` (golpes agrupados por método, sem duplicatas) e formatadores (`formatGeneration`, `formatGender`, `titleize`). A busca de locais usa `fetchEncounters` (endpoint `/pokemon/{id}/encounters`).

### `src/i18n/` — internacionalização

`translations.ts` define a interface `Translation` e os dicionários PT/EN (incluindo os `StatMap` de `statLabels`/`statNames`). `index.ts` expõe `t(key)` (tipado pela chave), `getLang`/`setLang` e `contentLang()` (`pt`→`es`, pois a PokéAPI não tem português). Textos estáticos usam `data-i18n` / `data-i18n-ph` / `data-i18n-aria`.

### `src/features/` — widgets

- **`autocomplete.ts`**: `setupAutocomplete(...)` + `filterNames()` puro. Dropdown por **substring** (prefixo primeiro, com destaque, navegável por teclado). Usado na busca e no comparador.
- **`filter.ts`**: `setupFilter(...)` monta um grid **paginado** (24/página) por tipo e/ou geração. Devolve `{ refresh, setType }` (os badges de tipo chamam `setType`).
- **`compare.ts`**: `setupCompare(...)` gerencia até **4 Pokémon** (chips) → radar + tabela de N colunas destacando o maior valor. Devolve `{ add, refresh }`.
- **`radar.ts`**: `radarSvg(list, colors)` — radar SVG puro dos 6 stats, compartilhado pelo card de detalhes (1) e pelo comparador (até 4).
- **`team.ts`**: `setupTeam(...)` monta um time de até **6 Pokémon** (persistido em `localStorage`) e agrega as fraquezas de tipo do time, mostrando badges com contagem.
- **`quiz.ts`**: `setupQuiz(...)` — "Quem é esse Pokémon?", com silhueta, 4 alternativas e placar.

### `src/main.ts` — composition root

Referências do DOM tipadas (`qs<T>()`), o pipeline de render, os event listeners e o estado (`searchPokemon`, `currentPokemon`, `currentImages`, `currentCry`, `shiny`). Um token `requestId` descarta renders assíncronos obsoletos. Deep link lê `?pokemon=ID` e o espelha via `history.replaceState`.

## Contrato entre arquivos

Os elementos são selecionados por **classe CSS** — o nome da classe é o contrato entre `index.html`, `src/styles/style.css` e os módulos. Ao renomear uma classe, atualize os três.

## Build e qualidade

- **Vite** gera o bundle em `dist/`. Deploy no **Cloudflare Workers (Static Assets)** via `wrangler.jsonc` (`assets.directory: ./dist`). Rotas desconhecidas caem em `public/404.html`.
- **TypeScript** (strict) via `tsc --noEmit` no `build`, `typecheck` e no CI.
- **vite-plugin-pwa** gera o service worker e o manifest (instalável + cache offline `CacheFirst` da PokéAPI e sprites).
- **Vitest** cobre a lógica pura (`filterNames`, sprites, favoritos/tema). **Playwright** roda os testes E2E em `e2e/`, incluindo uma auditoria de acessibilidade com **@axe-core/playwright** que falha em qualquer violação crítica WCAG 2 A/AA. **ESLint** (typescript-eslint) e **Prettier** garantem consistência. O CI roda **lint → typecheck → test → build** e um job **e2e** separado (instala o Chromium e roda `npm run test:e2e`).

## Dados da PokéAPI

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`. Altura em decímetros e peso em hectogramas (÷10 para m/kg). Stats base chegam a ~255; as barras normalizam por 255.
