# Roadmap — o que falta no projeto

Plano consolidado do que resta para concluir o portal (Pokédex + Cartas +
Decks + Comunidade), **sem venda/marketplace**. Detalhes do backend estão em
[IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md).

Legenda: ✅ feito · 🔜 próximo · ⏳ depois

---

## A. Migração React (branch `migrate/react`)

- ✅ Fundação, card de detalhes completo, painéis, deck builder, navegador de
  cartas, card 3D, otimizações, CSS modular, testes (18 unit + 4 E2E).
- 🔜 **Decisão de publicação:** abrir PR `migrate/react → main` ou fazer merge
  (deploy Cloudflare) quando você validar. Hoje o site no ar ainda é o vanilla.
- ⏳ Remover restos vanilla já 100% portados que sobraram (se houver).

## B. Segurança / configuração (bloqueia o backend)

- 🔜 Trocar a chave do Supabase para a **`anon`** e **rotacionar a service_role**.
- 🔜 Variáveis `VITE_SUPABASE_*` no build da **Cloudflare** (não só no `.env`).
- ✅ `.env` no `.gitignore` · `.env.example` documentado · migrations `poke_*`.

## C. Backend Supabase (ver IMPLEMENTATION_PLAN.md)

- 🔜 **Fase 1 — Auth + perfil:** `@supabase/supabase-js`, `services/supabase.ts`,
  `AuthContext`, modal login/cadastro (e-mail + OAuth), menu/avatar no header.
- 🔜 **Fase 2 — Coleção + Wishlist:** hooks `useCollection`/`useWishlist`,
  botões "＋ Coleção"/"♡ Wishlist" no navegador e no detalhe, `CollectionView`
  (`?view=collection`) com **valor total**.
- ⏳ **Fase 3 — Decks na nuvem:** salvar/carregar/renomear; migrar `useDeck`
  para o Supabase quando logado; "Meus decks".
- ⏳ **Fase 4 — Decks públicos:** `is_public`, explorar + abrir + clonar + curtir.
- ⏳ **Fase 5 — Sync + perfil público:** subir favoritos/time do `localStorage`
  ao logar; página de perfil (`?u=username`).
- ⏳ **Fase 6 — Polish comunidade:** realtime, top decks, avatar (Storage).

## D. Frontend (não depende de backend)

- ✅ Navegador de cartas com filtros + preços + paginação.
- 🔜 **Top-nav de portal** (Pokédex · Cartas · Decks · Coleção) para dar cara
  de portal, com destaque da view ativa e responsivo/menu no celular.
- 🔜 **Compartilhar/exportar deck** — deep-link `?deck=<id>` e/ou código do deck.
- ⏳ **Página da carta** compartilhável (`?card=<id>` abrindo o detalhe 3D).
- ⏳ **Filtro por coleção/set** no navegador (dropdown de sets da TCG API).

## E. Qualidade

- 🔜 **Testes** das features novas: unit para deck/tcg helpers e regras de
  coleção; E2E para navegador de cartas, deck builder e (depois) auth/coleção.
- 🔜 **E2E cross-browser** no CI (adicionar Firefox/WebKit ao job — hoje só
  Chromium) e manter a auditoria **axe** verde.
- ⏳ Testar cada **policy RLS** (um usuário não lê linha de outro).

## F. Documentação

- 🔜 Atualizar `README`/`CLAUDE`/`ARCHITECTURE` com: navegador de cartas, card
  3D, Supabase (auth/coleção/decks), variáveis de ambiente e como rodar as
  migrations.
- ✅ `IMPLEMENTATION_PLAN.md` (backend) · este `ROADMAP.md`.

## G. Deploy

- 🔜 Cloudflare: setar `VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` /
  `VITE_POKEMONTCG_KEY` nas env vars do build.
- 🔜 Supabase: rodar as migrations `00001..00006`, configurar **OAuth**
  (Google/Discord) e a **URL de redirect** do Auth para o domínio do site.
- ⏳ Merge da branch → deploy do React em produção.

---

## Ordem recomendada

1. **B** (chave anon + rotacionar) — destrava o backend.
2. **C Fase 1** (Auth) → **C Fase 2** (Coleção/Wishlist).
3. **D** (top-nav + compartilhar deck) em paralelo.
4. **C Fase 3–4** (decks nuvem/públicos).
5. **E/F/G** (testes, docs, deploy) e o **merge para `main`**.
