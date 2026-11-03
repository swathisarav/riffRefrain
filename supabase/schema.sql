-- RiffRefrain database schema.
-- Run this once in Supabase: Dashboard → SQL Editor → New query → paste → Run.
-- Every table uses Row Level Security so each user can only see and change their own rows.

-- ───────────────────────── Riffs / songs being learned ─────────────────────────
create table if not exists public.riffs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title        text not null check (char_length(title) between 1 and 200),
  artist       text,
  status       text not null default 'learning'
                 check (status in ('want_to_learn', 'learning', 'learned')),
  tuning       text,
  current_bpm  integer check (current_bpm between 1 and 400),
  target_bpm   integer check (target_bpm between 1 and 400),
  notes        text,
  created_at   timestamptz not null default now()
);

-- ───────────────────────── Practice sessions ─────────────────────────
create table if not exists public.practice_sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null default auth.uid() references auth.users (id) on delete cascade,
  practiced_on     date not null default current_date,
  duration_minutes integer not null check (duration_minutes between 1 and 1440),
  focus            text not null default 'technique',
  riff_id          uuid references public.riffs (id) on delete set null,
  tempo_bpm        integer check (tempo_bpm between 1 and 400),
  rating           integer check (rating between 1 and 5),
  notes            text,
  created_at       timestamptz not null default now()
);

-- ───────────────────────── Goals ─────────────────────────
create table if not exists public.goals (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  title       text not null check (char_length(title) between 1 and 300),
  due_date    date,
  done        boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists practice_sessions_user_date_idx on public.practice_sessions (user_id, practiced_on desc);
create index if not exists riffs_user_idx on public.riffs (user_id);
create index if not exists goals_user_idx on public.goals (user_id);

-- ───────────────────────── Row Level Security ─────────────────────────
alter table public.riffs             enable row level security;
alter table public.practice_sessions enable row level security;
alter table public.goals             enable row level security;

do $$
declare t text;
begin
  foreach t in array array['riffs', 'practice_sessions', 'goals'] loop
    execute format('drop policy if exists "own rows: select" on public.%I', t);
    execute format('drop policy if exists "own rows: insert" on public.%I', t);
    execute format('drop policy if exists "own rows: update" on public.%I', t);
    execute format('drop policy if exists "own rows: delete" on public.%I', t);

    execute format('create policy "own rows: select" on public.%I for select to authenticated using ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows: insert" on public.%I for insert to authenticated with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows: update" on public.%I for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t);
    execute format('create policy "own rows: delete" on public.%I for delete to authenticated using ((select auth.uid()) = user_id)', t);
  end loop;
end $$;
