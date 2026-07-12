-- 00004 — Decks do usuário (poke_decks). cards = jsonb [{card_id, count}]
create table if not exists poke_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  cards jsonb not null default '[]',
  is_public boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists poke_decks_public_idx on poke_decks (is_public, created_at desc);

alter table poke_decks enable row level security;

-- Dono mexe em tudo; decks públicos são legíveis por qualquer um.
create policy "poke_decks read own or public" on poke_decks
  for select using (is_public or auth.uid() = user_id);
create policy "poke_decks insert own" on poke_decks
  for insert with check (auth.uid() = user_id);
create policy "poke_decks update own" on poke_decks
  for update using (auth.uid() = user_id);
create policy "poke_decks delete own" on poke_decks
  for delete using (auth.uid() = user_id);
