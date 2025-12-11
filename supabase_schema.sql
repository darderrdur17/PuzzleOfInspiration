-- Supabase schema for Puzzle of Inspiration
-- Safe to run on a fresh Supabase project. Uses a single public session id ("default") for class play.

-- Sessions (game config)
create table if not exists public.sessions (
  id text primary key,
  is_game_active boolean default false not null,
  time_limit integer not null,
  max_quotes integer not null,
  game_start_time bigint,
  game_end_time bigint,
  session_name text,
  theme_id text not null,
  challenge_mode text not null default 'normal',
  rapid_fire_question jsonb,
  active_hint jsonb,
  board_layout text,
  updated_at timestamptz not null default now()
);

-- Active players (presence)
create table if not exists public.active_players (
  session_id text not null references public.sessions(id) on delete cascade,
  name text not null,
  points integer not null default 0,
  score integer not null default 0,
  start_time bigint,
  last_update bigint not null,
  primary key (session_id, name)
);

-- Leaderboard
create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  session_id text not null references public.sessions(id) on delete cascade,
  name text not null,
  points integer not null,
  score integer not null,
  time integer not null,
  timestamp bigint not null
);

-- Custom quotes (shared library)
create table if not exists public.custom_quotes (
  id text primary key,
  session_id text default 'default',
  theme_id text not null,
  phase text not null,
  text text not null,
  author text not null,
  created_at timestamptz not null default now()
);

-- Simple RLS (adjust as needed; these allow anonymous classroom clients)
alter table public.sessions enable row level security;
alter table public.active_players enable row level security;
alter table public.leaderboard enable row level security;
alter table public.custom_quotes enable row level security;

-- Allow anyone with the anon key to read/write rows for a given session id
create policy "sessions rw" on public.sessions for all using (true) with check (true);
create policy "active_players rw" on public.active_players for all using (true) with check (true);
create policy "leaderboard rw" on public.leaderboard for all using (true) with check (true);
create policy "custom_quotes rw" on public.custom_quotes for all using (true) with check (true);

-- Realtime
alter publication supabase_realtime add table public.sessions;
alter publication supabase_realtime add table public.active_players;
alter publication supabase_realtime add table public.leaderboard;
alter publication supabase_realtime add table public.custom_quotes;

