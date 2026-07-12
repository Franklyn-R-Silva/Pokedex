-- 00005 — Favoritos da Pokédex sincronizados (poke_favorites)
create table if not exists poke_favorites (
  user_id uuid references auth.users on delete cascade,
  pokemon_id int not null,
  added_at timestamptz default now(),
  primary key (user_id, pokemon_id)
);

alter table poke_favorites enable row level security;

create policy "poke_favorites own rows" on poke_favorites
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
