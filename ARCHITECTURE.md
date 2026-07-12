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
   │        ├── src/api.js ─────► fetch na PokéAPI (+ cache) e resolução de sprite
   │        └── src/pokemonTypes.js ─► cores/labels dos tipos
   │
   └── src/style.css ── tema dirigido pela variável --type-color
```

## Módulos

### `src/api.js` — camada de dados

- `fetchPokemon(idOrName)`: busca um Pokémon. Retorna `null` em respostas não-200 (ex.: 404) e **lança** em falha de rede, para o chamador tratar.
- **Cache em memória** (`Map`): cada Pokémon buscado é memorizado por nome e por id, evitando refetch ao navegar com Prev/Next.
- `fetchAllPokemonNames()`: carrega a lista completa de nomes (usada no autocomplete da busca).
- `getPokemonSprite(data)`: resolve a imagem via cadeia de fallback — **animado (Gen V) → artwork oficial → dream world → sprite padrão**. Necessário porque o sprite animado é `null` na API para Pokémon de gerações mais novas.
- `MAX_POKEMON`: total de Pokémon; limita o botão Next.

### `src/pokemonTypes.js` — tipos

Mapas `TYPE_COLORS` e `TYPE_LABELS` (18 tipos) e seus getters. A cor do tipo primário alimenta a variável CSS `--type-color`.

### `src/main.js` — orquestração

- Referências do DOM e o pipeline de render (`renderPokemon` → `renderDetails`/`renderTypes`/`renderStats`).
- Estado: `searchPokemon` (id atual, limitado a `[1, MAX_POKEMON]`) e o sprite atual (para download).
- Eventos: envio do formulário, botões Prev/Next, setas do teclado e download da imagem.
- Efeitos colaterais: escreve `--type-color` na raiz do documento, temando fundo, painel e barras de stats.

## Contrato entre arquivos

Os elementos são selecionados por **classe CSS**. O nome da classe é o contrato entre `index.html`, `src/style.css` e os módulos JS — ao renomear uma classe, atualize os três.

## Assets estáticos

Imagens e favicons ficam em `public/` e são referenciados por caminho absoluto (`/images/...`). O Vite copia `public/` para a raiz do build.

## Build e qualidade

- **Vite** gera o bundle otimizado em `dist/` (`base: './'` para funcionar em subpastas / Netlify).
- **ESLint** (flat config) e **Prettier** garantem consistência; ambos rodam no CI (GitHub Actions) a cada push/PR.

## Dados da PokéAPI

Endpoint: `GET https://pokeapi.co/api/v2/pokemon/{nome-ou-id}`. Altura vem em decímetros e peso em hectogramas (divididos por 10 para m/kg). Stats base chegam a ~255; as barras normalizam por 255 e limitam a 100%.
