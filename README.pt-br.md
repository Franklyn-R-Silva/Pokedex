<h1 align="center">Pokédex</h1>

<p align="center">
  Uma Pokédex rápida e instalável, feita em React 19 + TypeScript com a
  <a href="https://pokeapi.co/">PokéAPI</a> — pesquise, compare e explore Pokémon em PT-BR ou EN.
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
  <a href="README.md">English</a> · <strong>Português</strong>
  &nbsp;|&nbsp;
  <a href="https://pokedex.devfrs.com/">Demo ao vivo</a>
</p>

---

## Sobre

A **Pokédex** é um app web de página única que consome a [PokéAPI](https://pokeapi.co/)
pública para pesquisar, navegar e detalhar todos os 1025 Pokémon. Além da Pokédex clássica,
inclui um explorador de **cartas de TCG** (cartas reais, raridade e preço de mercado), um
mini-game de **batalha em equipe** por turnos e um **deck builder de TCG** com análises e
checagem de legalidade.

A lógica independente de framework (serviços de dados, regras de domínio, i18n, widgets de
funcionalidades) é compartilhada com a versão vanilla original; esta branch porta a interface
para **React 19 + TypeScript** (strict). A interface é totalmente bilíngue (PT-BR / EN) — como
a PokéAPI não tem português, os textos são traduzidos automaticamente e cacheados no navegador.
Distribuída como **PWA** instalável com suporte offline e publicada no **Cloudflare Pages**.

## Funcionalidades

- Busca por nome (sugestões por qualquer parte) ou número, com Prev/Next e setas do teclado
- Tipos, stats base (com gráfico de radar), habilidades (com destaque das ocultas), fraquezas e descrição
- Dados ricos: XP base, taxa de captura, felicidade, crescimento, gênero, grupos de ovo, ciclos de choco, habitat, geração, itens segurados, lista de golpes, onde encontrar e flags lendário/mítico
- Cadeia de evolução clicável (com métodos), formas alternativas, EV yield, shiny, cry e aleatório
- Lightbox da imagem com galeria de sprites (artwork, shiny, animado, frente/costas)
- Comparação de até 4 Pokémon (tabela de stats + gráfico de radar); filtro por tipo e geração com paginação
- Aba de **cartas de TCG**: veja as cartas reais de um Pokémon com raridade, preço de mercado e efeito holo 3D (Pokémon TCG API)
- Mini-game de **batalha em equipe**: monte um time e jogue uma batalha por turnos (itens, registro de vitórias)
- **Deck builder** (`?view=deck`): monte decks de TCG com gráficos, score de saúde do deck, checagem de legalidade Standard/Expanded e importação de meta-decks
- Interface bilíngue (PT-BR / EN); favoritos e tema salvos no navegador
- Download da imagem estática (PNG) e do GIF animado
- Links compartilháveis (`?pokemon=ID`) e PWA instalável com suporte offline
- Responsivo: uma coluna no celular, três colunas no desktop

> A PokéAPI não tem português, então no modo PT os textos da API (descrição, genus, habilidades)
> são traduzidos automaticamente EN→PT (MyMemory, com cache em `localStorage`); a interface, os tipos
> e os termos finitos (crescimento, grupos de ovo, habitat) são traduzidos diretamente.

## Tecnologias

React 19 · TypeScript · Vite · vite-plugin-pwa · Vitest · Playwright + axe-core · ESLint + Prettier · PokéAPI · Pokémon TCG API.
O CI (GitHub Actions) roda lint, typecheck, testes unitários e build, além de um
job E2E com auditoria de acessibilidade (falha em qualquer violação crítica WCAG 2 A/AA).

## Como executar

Requer [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/Franklyn-R-Silva/Pokedex.git
cd Pokedex
npm install
npm run dev
```

Acesse a URL exibida no terminal (por padrão `http://localhost:5173`).

| Script              | Descrição                                      |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento                    |
| `npm run build`     | Typecheck + build de produção em `dist/`       |
| `npm run preview`   | Pré-visualiza o build                          |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`)             |
| `npm run test`      | Testes unitários (Vitest)                      |
| `npm run test:e2e`  | Testes E2E + acessibilidade (Playwright + axe) |
| `npm run lint`      | Verifica o código (ESLint)                     |
| `npm run format`    | Formata o código (Prettier)                    |

## Estrutura do projeto

```
index.html               # Ponto de entrada (div #root, carrega src/main.tsx)
src/
  main.tsx               # createRoot + providers (i18n / favoritos / modal)
  App.tsx                # Composition root: estado, rotas, navegação e SEO
  types.ts               # Tipos compartilhados da PokéAPI
  components/            # UI: Header, PokedexDevice, DetailsCard (+ details/),
                         #   cards/, deck/, panels/, auth/, InfoModal, Lightbox…
  context/               # ModalContext, FavoritesContext
  hooks/                 # usePokemon · useSpecies · useTheme · useDeck · useTranslatedText
  services/              # Dados & IO
    pokeapi.ts           # fetch + cache em memória
    sprites.ts           # helpers de imagem
    storage.ts           # tema & favoritos (localStorage)
    translate.ts         # tradução automática EN→PT (MyMemory, com cache)
  domain/                # pokemonTypes · pokemonInfo · deck (lógica pura)
  i18n/                  # t / getLang / setLang / contentLang + dicts PT-BR/EN
  features/              # autocomplete · filter · compare · radar · team · quiz · battle
  styles/                # tokens + CSS por área (layout, device, cards, deck, …)
  __tests__/*.test.ts    # Vitest (unitário)
e2e/app.spec.ts          # Playwright E2E + auditoria de acessibilidade (axe)
public/                  # Assets, ícones do PWA, 404.html
```

Detalhes em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Deploy

Publicado no **Cloudflare Pages** — comando de build `npm run build`, diretório de saída `dist`.

## Licença

[MIT](./LICENSE) © Franklyn — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva).
Dados da [PokéAPI](https://pokeapi.co/); Pokémon © Nintendo / Game Freak.
