create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text,
  wisdom_points integer default 0,
  created_at timestamp default now()
);

create table if not exists public.game_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id),
  status text default 'in_progress',
  difficulty text default 'medium',
  duration_seconds integer,
  hints_used integer default 0,
  undos_used integer default 0,
  tiles_count integer default 0,
  finished_at timestamp,
  started_at timestamp default now()
);

create table if not exists public.daily_challenges (
  id uuid default gen_random_uuid() primary key,
  date date unique,
  title text,
  description text,
  difficulty text default 'medium',
  bonus_points integer default 100,
  seed text
);

create table if not exists public.leaderboard (
  user_id uuid primary key,
  username text,
  total_score integer default 0,
  games_played integer default 0,
  games_won integer default 0
);

create table if not exists public.skins (
  id uuid default gen_random_uuid() primary key,
  name text,
  description text,
  price_cents integer,
  category text default 'tiles'
);

create table if not exists public.user_skins (
  user_id uuid,
  skin_id uuid,
  is_equipped boolean default false,
  primary key (user_id, skin_id)
);

create table if not exists public.daily_rewards (
  user_id uuid,
  day_number integer,
  claimed_at timestamp default now(),
  unique(user_id, day_number)
);

alter table public.profiles enable row level security;
alter table public.game_sessions enable row level security;
alter table public.skins enable row level security;
alter table public.user_skins enable row level security;
alter table public.daily_challenges enable row level security;
alter table public.leaderboard enable row level security;
alter table public.daily_rewards enable row level security;

create policy "all" on public.profiles for all using (true);
create policy "all" on public.game_sessions for all using (true);
create policy "all" on public.skins for all using (true);
create policy "all" on public.user_skins for all using (true);
create policy "all" on public.daily_challenges for all using (true);
create policy "all" on public.leaderboard for all using (true);
create policy "all" on public.daily_rewards for all using (true);

INSERT INTO public.skins (name, description, price_cents, category) VALUES
  ('Классический', 'Стандартные тайлы', 0, 'tiles'),
  ('Нефрит', 'Зелёные тайлы', 299, 'tiles'),
  ('Сакура', 'Розовые тайлы', 399, 'tiles')
ON CONFLICT DO NOTHING;