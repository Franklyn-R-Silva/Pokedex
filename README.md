<h1 align="center">Pokédex 🔴</h1>

<p align="center">
  Uma Pokédex web que consome a <a href="https://pokeapi.co/">PokéAPI</a> para exibir dados de Pokémon.
  Pesquise por nome (com autocomplete) ou número, veja tipos e stats, navegue e baixe a imagem.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/PokéAPI-EF5350?style=flat&logo=pokemon&logoColor=white" alt="PokéAPI" />
  <img src="https://img.shields.io/badge/deploy-Netlify-00C7B7?style=flat&logo=netlify&logoColor=white" alt="Netlify" />
  <img src="https://img.shields.io/badge/license-MIT-green?style=flat" alt="License MIT" />
</p>

<p align="center">
  <a href="https://pokedex-franklyn.netlify.app/"><strong>🌐 Acessar o demo ao vivo »</strong></a>
</p>

---

## 📸 Demonstração

> _Adicione aqui um screenshot ou GIF da aplicação em uso (ex.: `public/images/demo.gif`)._

<p align="center">
  <img src="./public/images/pokedex.png" alt="Pokédex" width="360" />
</p>

## ✨ Funcionalidades

- 🔍 Pesquisar por **nome** (sugestões por **qualquer parte** do nome, navegáveis pelo teclado) ou **número**
- ⬅️ ➡️ Navegar entre os Pokémon com os botões **Prev**/**Next** ou as **setas do teclado**
- 🏷️ Ver **tipos** (com cores oficiais), **altura**, **peso** e **stats** em barras
- 🧬 Ver **habilidades** (destacando as ocultas) e a **cadeia de evolução** (clicável)
- 🎨 **Tema por tipo**: as cores da interface mudam conforme o Pokémon
- 🌙 **Modo escuro** e ⭐ **favoritar Pokémon** (persistidos no navegador)
- ⬇️ **Baixar** a imagem estática (**PNG**) e o **GIF** animado do Pokémon
- 📱 Layout **responsivo** para celular
- ⚡ **Cache** de requisições e mensagens de erro/carregamento

## 🛠️ Tecnologias

- **HTML5** — estrutura
- **CSS3** — estilização (tema por tipo, responsivo, `clamp()` para tipografia)
- **JavaScript (ES6+)** — módulos ES, `fetch` e `async/await`
- **[Vite](https://vitejs.dev/)** — dev server e build
- **ESLint + Prettier + EditorConfig** — qualidade e consistência de código
- **GitHub Actions** — CI (lint + build) a cada push/PR
- **[PokéAPI](https://pokeapi.co/)** — fonte dos dados

## 🚀 Como executar

Requer [Node.js](https://nodejs.org/) 18+.

```bash
# 1. Clone o repositório
git clone https://github.com/Franklyn-R-Silva/Pokedex.git

# 2. Entre na pasta
cd Pokedex

# 3. Instale as dependências
npm install

# 4. Rode o servidor de desenvolvimento
npm run dev
```

Acesse o endereço exibido no terminal (por padrão `http://localhost:5173`).

### Scripts disponíveis

| Script            | Descrição                                  |
| ----------------- | ------------------------------------------ |
| `npm run dev`     | Servidor de desenvolvimento com hot reload |
| `npm run build`   | Gera a versão de produção em `dist/`       |
| `npm run preview` | Pré-visualiza o build de produção          |
| `npm run lint`    | Verifica o código com ESLint               |
| `npm run format`  | Formata o código com Prettier              |

## 📂 Estrutura do projeto

```
.
├── index.html              # Marcação da página (entrada do Vite)
├── src/
│   ├── main.js             # Orquestração: DOM, render e eventos
│   ├── api.js              # PokéAPI: fetch, cache, sprite e evolução
│   ├── pokemonTypes.js     # Cores e traduções dos tipos
│   ├── storage.js          # Tema e favoritos (localStorage)
│   ├── autocomplete.js     # Sugestões de busca por substring
│   └── style.css           # Estilos
├── public/
│   ├── images/pokedex.png  # Imagem do dispositivo
│   └── favicons/           # Favicon
├── .github/workflows/ci.yml # CI (lint + build)
├── ARCHITECTURE.md         # Documentação técnica
├── vite.config.js
└── package.json
```

Detalhes técnicos em **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## ⚙️ Como funciona

A aplicação faz uma requisição à PokéAPI a cada busca ou navegação:

```
GET https://pokeapi.co/api/v2/pokemon/{nome-ou-número}
```

O fluxo está dividido em módulos:

1. `api.js` → `fetchPokemon()` chama a API (com cache; retorna `null` em 404) e `getPokemonSprite()` resolve a melhor imagem com fallback (animado → artwork oficial).
2. `main.js` → `renderPokemon()` atualiza o DOM com imagem, tipos, altura, peso e stats, aplicando o tema de cor do tipo.
3. A variável `searchPokemon` guarda o ID atual, usada pelos botões **Prev**/**Next** (e pelas setas do teclado).

## 🗺️ Melhorias futuras

- [x] Corrigir sprites de Pokémon da Geração VI+ (fallback para artwork oficial)
- [x] Exibir **tipos**, **altura**, **peso** e **stats**
- [x] Aplicar **cores por tipo** do Pokémon
- [x] Melhorar tratamento de erros de rede e o limite do botão **Next**
- [x] Modernizar o fluxo com **Vite** e organizar o código em **módulos**
- [x] Busca por nome com **autocomplete** e **download** da imagem
- [x] Layout **responsivo** para celular
- [x] Adicionar **habilidades** e cadeia de evolução
- [x] Modo **escuro** e favoritar Pokémon

## 🙏 Créditos

Dados fornecidos pela [PokéAPI](https://pokeapi.co/). Pokémon © Nintendo / Game Freak — projeto sem fins lucrativos, apenas para fins educacionais.

## 📄 Licença

Distribuído sob a licença **MIT**. Veja [LICENSE](./LICENSE) para mais detalhes.

## 👤 Autor

Feito por **Franklyn** — [@hadesfranklyn](https://github.com/hadesfranklyn)
