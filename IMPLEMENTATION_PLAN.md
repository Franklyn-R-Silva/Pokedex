# Plano de Implementação — Portal de Cartas (Supabase)

> Direção: portal comunitário estilo LigaPokémon, **sem venda/marketplace**.
> Cartas e preços vêm da **Pokémon TCG API** (frontend); **contas, coleção,
> decks e comunidade** vão para o **Supabase** (Postgres + Auth + RLS).
> Base: branch `migrate/react` (React 19 + Vite). O site é estático na
> Cloudflare + Supabase como backend gerenciado (sem servidor próprio).

## 0. Escopo

**Entra:** login/perfil, Minha Coleção, Wishlist, decks na nuvem (salvar/
compartilhar/decks públicos), sincronizar favoritos/time da Pokédex, valor
total da coleção, (opcional) curtidas/top decks. **Não entra:** vender cartas,
carrinho, pagamentos, estoque de vendedores, pedidos.

## 1. Fundação Supabase

- Criar projeto no Supabase → pegar **Project URL** + **anon/publishable key**.
- Instalar `@supabase/supabase-js`.
- `src/services/supabase.ts`:
  ```ts
  import { createClient } from '@supabase/supabase-js';
  export const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  );
  ```
- **Env**: `.env.local` (dev) + variáveis no build da Cloudflare. A chave
  publishable/anon **pode** ir no frontend — a segurança real é o **RLS**.
- Tipos: gerar com `supabase gen types typescript` → `src/types/supabase.ts`.

## 2. Autenticação

- **Métodos:** e-mail/senha (com confirmação por e-mail) + OAuth (Google e/ou
  Discord — bom para o público gamer).
- `src/context/AuthContext.tsx`: `session`/`user`, `signIn`, `signUp`,
  `signInWithOAuth`, `signOut`; escuta `supabase.auth.onAuthStateChange`.
- UI: modal de login/cadastro (reusa `ModalContext`), avatar/menu no header.
- **Offline-first:** deslogado, tudo continua no `localStorage` (como hoje);
  ao logar, sincroniza para a nuvem e passa a usar o Supabase como fonte.

## 3. Banco de dados (schema + RLS)

**Convenções:** toda tabela começa com **`poke_`**; as migrations ficam em
`supabase/migrations/` numeradas **`00001_`, `00002_`, …** (uma por tabela/
assunto). Guardamos **referências** de cartas (`card_id` da TCG API), não as
cartas em si.

Tabelas: `poke_profiles`, `poke_collection`, `poke_wishlist`, `poke_decks`,
`poke_favorites`, `poke_deck_likes`. Cada uma com RLS `auth.uid() = user_id`
(perfis e decks públicos têm leitura pública). O SQL completo está nos arquivos
de migration:

| Migration | Tabela |
| --- | --- |
| `00001_profiles.sql` | `poke_profiles` (perfil; leitura pública) |
| `00002_collection.sql` | `poke_collection` (cartas que o usuário tem) |
| `00003_wishlist.sql` | `poke_wishlist` (lista de desejos) |
| `00004_decks.sql` | `poke_decks` (decks; `is_public` → leitura pública) |
| `00005_favorites.sql` | `poke_favorites` (favoritos da Pokédex) |
| `00006_deck_likes.sql` | `poke_deck_likes` (curtidas em decks públicos) |

Exemplo do padrão "dono" (RLS):

```sql
alter table poke_collection enable row level security;
create policy "own rows" on poke_collection
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```

## 4. Camada React

- `context/AuthContext.tsx` — sessão + ações de auth.
- `services/supabase.ts` — cliente único.
- Hooks (padrão: nuvem se logado, `localStorage` se não):
  - `useCollection()` — `add(card)`, `remove(id)`, `setQuantity`, `list`,
    `totalValue` (soma `priceUsd`).
  - `useWishlist()` — `toggle(card)`, `has(id)`, `list`.
  - `useCloudDecks()` — `save`, `load`, `list`, `setPublic`, `remove`.
  - Refatorar `useDeck`/favoritos para ler/gravar da nuvem quando logado.
- Componentes:
  - `auth/AuthModal`, `auth/ProfileMenu`.
  - `collection/CollectionView` (`?view=collection`): grade da coleção +
    **valor total**; abas Coleção / Wishlist.
  - Botões "＋ Coleção" e "♡ Wishlist" no `CardDetail` e no `CardBrowser`.
  - `deck/MyDecks` (lista de decks salvos) + "Salvar deck" no `DeckBuilder`.
  - `deck/PublicDecks` (`?view=decks`): explorar decks públicos + curtir.

## 5. Fases (ordem sugerida)

1. **Auth + perfil** — cliente Supabase, `AuthContext`, modal login/OAuth,
   menu no header. (base de tudo)
2. **Coleção + Wishlist** — schema + hooks + `CollectionView` + botões no
   navegador/detalhe + valor total.
3. **Decks na nuvem** — salvar/carregar/renomear; migrar `useDeck` para o
   Supabase quando logado; "Meus decks".
4. **Decks públicos** — flag `is_public`, explorar + abrir + clonar; curtidas.
5. **Sync + perfil público** — subir favoritos/time do `localStorage` ao logar;
   página de perfil (`?u=username`) com coleção/decks públicos.
6. **Polish** — realtime opcional (decks/curtidas ao vivo), top decks, contagem
   de cartas do usuário, avatar (Supabase Storage).

## 6. Segurança & operação

- Só a **anon/publishable key** no frontend; nada de service_role. RLS é a
  trava real — testar cada policy.
- Confirmação de e-mail ligada; rate-limit padrão do Supabase.
- Deep-links continuam: `?view=cards|deck|collection|decks`, `?pokemon=`,
  `?deck=<id>` (deck público).
- PWA: manter offline via `localStorage`; sincronizar quando online + logado.

## 7. O que continua frontend puro

Cartas, preços e busca (Pokémon TCG API) e a Pokédex (PokéAPI) **não** vão para
o Supabase — só as referências (`card_id`/`pokemon_id`) que o usuário salvar.

## 8. Estimativa de esforço

Fase 1–2: núcleo (auth + coleção/wishlist). Fase 3–4: decks nuvem/públicos.
Fase 5–6: comunidade/polish. Cada fase é entregável e verificável isoladamente.
