# Arquitetura

Este documento descreve a organização técnica da Pokédex.

## Visão geral

Aplicação single-page, sem framework, escrita em **JavaScript (ES modules)** e empacotada com **Vite**. Todo o estado vive no cliente; os dados vêm da [PokéAPI](https://pokeapi.co/) sob demanda.

```
Navegador
   │
   ├── index.html ──► carrega src/main.js (type="module")
   │
   ├── src/main.js  ── orquestra DOM, render e eventos
   │        │
   │        ├── src/api.js ─────► fetch na PokéAPI (+ cache), sprite, evolução, fraquezas
   │        ├── src/i18n.js ────► traduções PT-BR / EN
   │        ├── src/pokemonTypes.js ─► cores/labels dos tipos
   │        ├── src/storage.js ─► tema e favoritos (localStorage)
   │        ├── src/autocomplete.js ─► sugestões de busca por substring
   │        ├── src/filter.js ──► filtro por tipo / geração
   │        └── src/compare.js ─► comparação lado a lado
   │
   └── src/style.css ── tema (--type-color) e layout responsivo (3 colunas no desktop)
```

## Módulos

### `src/api.js` — camada de dados

- `fetchPokemon(idOrName)`: busca um Pokémon. Retorna `null` em respostas não-200 (ex.: 404) e **lança** em falha de rede, para o chamador tratar.
- **Cache em memória** (`Map`): cada Pokémon buscado é memorizado por nome e por id, evitando refetch ao navegar com Prev/Next.
- `fetchAllPokemonNames()`: carrega a lista completa de nomes (usada no autocomplete da busca).
- `getPokemonSprite(data)`: resolve a imagem via cadeia de fallback — **animado (Gen V) → artwork oficial → dream world → sprite padrão**. Necessário porque o sprite animado é `null` na API para Pokémon de gerações mais novas.
- `fetchEvolutionChain(speciesUrl)`: segue `species → evolution_chain` e percorre a árvore (incluindo ramificações, como a do Eevee), retornando `[{ name, id }]`. O id é extraído da URL da espécie, evitando requisições extras para montar as imagens (via `getArtworkById`).
- `fetchSpecies(url)` (com cache) + `getFlavorText`/`getGenus`: descrição e categoria da espécie. O mesmo cache serve à evolução, evitando refetch.
- `fetchWeaknesses(types)`: combina as `damage_relations` de cada tipo (com cache por tipo) e retorna os tipos com multiplicador > 1.
- `getPokemonSprite`/`getStaticImage`/`getAnimatedGif` aceitam um flag `shiny` para alternar entre normal e brilhante.
- `fetchAllPokemonNames()` memoriza a lista em `localStorage` para não rebaixar 1025 nomes a cada visita.
- `MAX_POKEMON`: total de Pokémon; limita o botão Next.

### `src/pokemonTypes.js` — tipos

Mapas `TYPE_COLORS` e `TYPE_LABELS` (18 tipos) e seus getters. A cor do tipo primário alimenta a variável CSS `--type-color`.

### `src/storage.js` — persistência

Camada fina sobre `localStorage`: tema (`getTheme`/`setTheme`) e favoritos (`getFavorites`/`isFavorite`/`toggleFavorite`). Os favoritos são armazenados como `[{ id, name }]`.

### `src/autocomplete.js` — sugestões de busca

`setupAutocomplete({ input, container, getNames, onSelect })` substitui o `<datalist>` nativo (que só sugere por prefixo) por um dropdown que casa por **substring** — permite achar o Pokémon sabendo só parte do nome. Prioriza correspondências no início, destaca o trecho encontrado e é navegável por teclado (↑/↓, Enter, Esc).

### `src/i18n.js` — internacionalização

Dicionários PT-BR/EN. `t(key)` devolve o texto da UI no idioma atual; `contentLang()` mapeia o idioma da UI para o do conteúdo da API (`pt`→`es`, `en`→`en`), porque a PokéAPI não tem português — o espanhol é a aproximação mais próxima. O idioma persiste em `localStorage`; textos estáticos usam atributos `data-i18n` / `data-i18n-ph`.

### `src/filter.js` — filtro

`setupFilter(...)` monta um grid clicável filtrando por tipo e/ou geração (interseção por id quando ambos são escolhidos). Devolve `{ refresh }` para re-rotular ao trocar de idioma.

### `src/compare.js` — comparação

`setupCompare(...)` busca dois Pokémon e monta uma tabela lado a lado (tipos, altura, peso, stats e total), destacando o maior valor de cada linha. Devolve `{ refresh }`.

### `src/main.js` — orquestração

- Referências do DOM e o pipeline de render (`renderPokemon` → `renderDetails` → `renderTypes`/`renderStats`/`renderAbilities`/`renderEvolution`).
- Estado: `searchPokemon` (id atual, limitado a `[1, MAX_POKEMON]`), `currentPokemon` (dados completos, para favoritar) e `currentSprite` (para download).
- **Guarda de corrida**: `requestId` é incrementado a cada busca; renders assíncronos (evolução) são descartados se um novo já começou, evitando exibir dados obsoletos.
- Eventos: formulário, Prev/Next, setas do teclado, download, favoritar e alternância de tema.
- Efeitos colaterais: escreve `--type-color` na raiz do documento (temando fundo, painel e barras) e alterna a classe `dark` no `<html>`.

## Contrato entre arquivos

Os elementos são selecionados por **classe CSS**. O nome da classe é o contrato entre `index.html`, `src/style.css` e os módulos JS — ao renomear uma classe, atualize os três.

## Assets estáticos

Imagens e favicons ficam em `public/` e são referenciados por caminho absoluto (`/images/...`). O Vite copia `public/` para a raiz do build.

## Build e qualidade

- **Vite** gera o bundle otimizado em `dist/`. Deploy no **Cloudflare Pages** (build: `npm run build`, saída: `dist`). Rotas desconhecidas caem em `public/404.html` (a app usa apenas query string `?pokemon=ID` na raiz, então não precisa de fallback de SPA).
- **vite-plugin-pwa** gera o service worker e o manifest: a app é instalável e faz cache offline da PokéAPI e dos sprites (estratégia `CacheFirst`).
- **Vitest** cobre a lógica pura (`filterNames`, resolução de sprites, favoritos/tema). **ESLint** (flat config) e **Prettier** garantem consistência; rodam no CI (GitHub Actions) a cada push/PR.

## Dados da PokéAPI

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`. Altura vem em decímetros e peso em hectogramas (divididos por 10 para m/kg). Stats base chegam a ~255; as barras normalizam por 255 e limitam a 100%.
