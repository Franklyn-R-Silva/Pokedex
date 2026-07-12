-- 00001 — Perfil público do usuário (poke_profiles)
create table if not exists poke_profiles (
  id uuid primary key references auth.users on delete cascade,
  username text unique,
  avatar_url text,
  bio text,
  updated_at timestamptz default now()
);

alter table poke_profiles enable row level security;

create policy "poke_profiles read (public)" on poke_profiles
  for select using (true);
create policy "poke_profiles insert own" on poke_profiles
  for insert with check (auth.uid() = id);
create policy "poke_profiles update own" on poke_profiles
  for update using (auth.uid() = id);

-- Cria o perfil automaticamente quando um usuário se cadastra.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.poke_profiles (id, username)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
