<h1 align="center">Pokédex</h1>

<p align="center">
  Uma Pokédex rápida e instalável, feita em JavaScript puro com a
  <a href="https://pokeapi.co/">PokéAPI</a> — pesquise, compare e explore Pokémon em PT-BR ou EN.
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
  <a href="README.md">English</a> · <strong>Português</strong>
  &nbsp;|&nbsp;
  <a href="https://pokedex.devfrs.com/">Demo ao vivo</a>
</p>

---

## Funcionalidades

- Busca por nome (sugestões por qualquer parte) ou número, com Prev/Next e setas do teclado
- Tipos, stats base (com gráfico de radar), habilidades (com destaque das ocultas), fraquezas e descrição
- Dados ricos: XP base, taxa de captura, felicidade, crescimento, gênero, grupos de ovo, ciclos de choco, habitat, geração, itens segurados, lista de golpes, onde encontrar e flags lendário/mítico
- Cadeia de evolução clicável (com métodos), formas alternativas, EV yield, shiny, cry e aleatório
- Lightbox da imagem com galeria de sprites (artwork, shiny, animado, frente/costas)
- Comparação de até 4 Pokémon (tabela de stats + gráfico de radar); filtro por tipo e geração com paginação
- Interface bilíngue (PT-BR / EN); favoritos e tema salvos no navegador
- Download da imagem estática (PNG) e do GIF animado
- Links compartilháveis (`?pokemon=ID`) e PWA instalável com suporte offline
- Responsivo: uma coluna no celular, três colunas no desktop

> A PokéAPI não tem português, então no modo PT os textos da API (descrição, genus, habilidades)
> são traduzidos automaticamente EN→PT (MyMemory, com cache em `localStorage`); a interface, os tipos
> e os termos finitos (crescimento, grupos de ovo, habitat) são traduzidos diretamente.

## Tecnologias

TypeScript · Vite · vite-plugin-pwa · Vitest · ESLint + Prettier · PokéAPI.
O CI (GitHub Actions) roda lint, typecheck, testes e build a cada push e PR.

## Como executar

Requer [Node.js](https://nodejs.org/) 18+.

```bash
git clone https://github.com/Franklyn-R-Silva/Pokedex.git
cd Pokedex
npm install
npm run dev
```

Acesse a URL exibida no terminal (por padrão `http://localhost:5173`).

| Script              | Descrição                                |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Servidor de desenvolvimento              |
| `npm run build`     | Typecheck + build de produção em `dist/` |
| `npm run preview`   | Pré-visualiza o build                    |
| `npm run typecheck` | Checagem de tipos (`tsc --noEmit`)       |
| `npm run test`      | Testes unitários (Vitest)                |
| `npm run lint`      | Verifica o código (ESLint)               |
| `npm run format`    | Formata o código (Prettier)              |

## Estrutura do projeto

```
index.html               # Ponto de entrada (carrega src/main.ts)
src/
  main.ts                # Composition root: DOM, render e eventos
  types.ts               # Tipos compartilhados da PokéAPI
  services/              # Dados & IO
    pokeapi.ts           # fetch + cache em memória
    sprites.ts           # helpers de imagem
    storage.ts           # tema & favoritos (localStorage)
  domain/
    pokemonTypes.ts      # cores & labels dos tipos
  i18n/
    index.ts             # getLang / setLang / t / contentLang
    translations.ts      # dicionários PT-BR / EN
  features/              # autocomplete · filter · compare · radar
  styles/style.css
  __tests__/*.test.ts    # Vitest
public/                  # Assets, ícones do PWA, 404.html
```

Detalhes em [ARCHITECTURE.md](./ARCHITECTURE.md).

## Deploy

Publicado no **Cloudflare Pages** — comando de build `npm run build`, diretório de saída `dist`.

## Licença

[MIT](./LICENSE) © Franklyn — [@Franklyn-R-Silva](https://github.com/Franklyn-R-Silva).
Dados da [PokéAPI](https://pokeapi.co/); Pokémon © Nintendo / Game Freak.
