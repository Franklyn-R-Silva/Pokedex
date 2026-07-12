-- 00002 — Coleção do usuário (poke_collection): cartas que ele possui
create table if not exists poke_collection (
  user_id uuid references auth.users on delete cascade,
  card_id text not null,          -- id da Pokémon TCG API (ex.: "base1-4")
  quantity int not null default 1 check (quantity > 0),
  condition text default 'NM',
  price_usd numeric,              -- snapshot opcional do preço de mercado
  added_at timestamptz default now(),
  primary key (user_id, card_id)
);

alter table poke_collection enable row level security;

create policy "poke_collection own rows" on poke_collection
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
