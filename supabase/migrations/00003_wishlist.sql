-- 00003 — Lista de desejos (poke_wishlist)
create table if not exists poke_wishlist (
  user_id uuid references auth.users on delete cascade,
  card_id text not null,          -- id da Pokémon TCG API
  added_at timestamptz default now(),
  primary key (user_id, card_id)
);

alter table poke_wishlist enable row level security;

create policy "poke_wishlist own rows" on poke_wishlist
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
