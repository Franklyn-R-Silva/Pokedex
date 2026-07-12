-- 00006 — Curtidas em decks públicos (poke_deck_likes)
create table if not exists poke_deck_likes (
  deck_id uuid references poke_decks on delete cascade,
  user_id uuid references auth.users on delete cascade,
  created_at timestamptz default now(),
  primary key (deck_id, user_id)
);

alter table poke_deck_likes enable row level security;

-- Contagem de curtidas é pública; curtir/descurtir só o próprio usuário.
create policy "poke_deck_likes read (public)" on poke_deck_likes
  for select using (true);
create policy "poke_deck_likes like own" on poke_deck_likes
  for insert with check (auth.uid() = user_id);
create policy "poke_deck_likes unlike own" on poke_deck_likes
  for delete using (auth.uid() = user_id);
