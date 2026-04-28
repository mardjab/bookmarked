-- Phase 1 schema: books, user_books, shelf_log, ratings, dnf_entries, taste_profile

-- ─── Extensions ────────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ─── Enum types ─────────────────────────────────────────────────────────────────
create type shelf_status as enum ('want_to_read', 'reading', 'finished', 'dnf');
create type dnf_progress as enum ('first_10', 'around_25', 'around_50', 'over_50');

-- ─── books ───────────────────────────────────────────────────────────────────────
-- Canonical book metadata sourced from Open Library. Shared across all users.
create table books (
  id            uuid primary key default uuid_generate_v4(),
  ol_id         text unique not null,          -- Open Library work ID, e.g. "OL45883W"
  title         text not null,
  author        text not null,
  cover_url     text,
  genre         text[] not null default '{}',
  page_count    int,
  published_year int,
  description   text,
  asin          text,                          -- nullable; populated for Phase 2 Kindle scraping
  created_at    timestamptz not null default now()
);

-- ─── user_books ──────────────────────────────────────────────────────────────────
-- One row per (user, book). Owns the shelf placement.
create table user_books (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  book_id    uuid not null references books (id) on delete cascade,
  shelf      shelf_status not null,
  added_at   timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ─── shelf_log ───────────────────────────────────────────────────────────────────
-- Append-only log of every shelf transition per user/book.
create table shelf_log (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  book_id     uuid not null references books (id) on delete cascade,
  from_shelf  shelf_status,                    -- null on first add
  to_shelf    shelf_status not null,
  changed_at  timestamptz not null default now()
);

-- ─── ratings ─────────────────────────────────────────────────────────────────────
-- Two-axis rating. One rating per (user, book); upsert on re-rate.
create table ratings (
  id                 uuid primary key default uuid_generate_v4(),
  user_id            uuid not null references auth.users (id) on delete cascade,
  book_id            uuid not null references books (id) on delete cascade,
  enjoyment          int not null check (enjoyment between 1 and 4),
  recommendability   int not null check (recommendability between 1 and 4),
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ─── dnf_entries ─────────────────────────────────────────────────────────────────
-- One DNF record per (user, book). Separate from ratings by design.
create table dnf_entries (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  book_id    uuid not null references books (id) on delete cascade,
  reasons    text[] not null default '{}',
  progress   dnf_progress not null,
  notes      text,
  created_at timestamptz not null default now(),
  unique (user_id, book_id)
);

-- ─── taste_profile ───────────────────────────────────────────────────────────────
-- One row per user. Updated by server action on every rating/dnf save.
create table taste_profile (
  id         uuid primary key default uuid_generate_v4(),
  user_id    uuid not null references auth.users (id) on delete cascade unique,
  signals    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

-- ─── Indexes ─────────────────────────────────────────────────────────────────────
create index on user_books (user_id, shelf);
create index on shelf_log  (user_id, book_id);
create index on ratings    (user_id);
create index on dnf_entries(user_id);

-- ─── updated_at triggers ────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_books_updated_at
  before update on user_books
  for each row execute function set_updated_at();

create trigger ratings_updated_at
  before update on ratings
  for each row execute function set_updated_at();

create trigger taste_profile_updated_at
  before update on taste_profile
  for each row execute function set_updated_at();

-- ─── Row Level Security ──────────────────────────────────────────────────────────
alter table books          enable row level security;
alter table user_books     enable row level security;
alter table shelf_log      enable row level security;
alter table ratings        enable row level security;
alter table dnf_entries    enable row level security;
alter table taste_profile  enable row level security;

-- books: readable by all authenticated users; insertable by any authenticated user
create policy "books_select" on books
  for select to authenticated using (true);

create policy "books_insert" on books
  for insert to authenticated with check (true);

-- user_books: users see and modify only their own rows
create policy "user_books_select" on user_books
  for select using (auth.uid() = user_id);

create policy "user_books_insert" on user_books
  for insert with check (auth.uid() = user_id);

create policy "user_books_update" on user_books
  for update using (auth.uid() = user_id);

create policy "user_books_delete" on user_books
  for delete using (auth.uid() = user_id);

-- shelf_log: users see only their own log; insert allowed, no update/delete (append-only)
create policy "shelf_log_select" on shelf_log
  for select using (auth.uid() = user_id);

create policy "shelf_log_insert" on shelf_log
  for insert with check (auth.uid() = user_id);

-- ratings: users see and modify only their own
create policy "ratings_select" on ratings
  for select using (auth.uid() = user_id);

create policy "ratings_insert" on ratings
  for insert with check (auth.uid() = user_id);

create policy "ratings_update" on ratings
  for update using (auth.uid() = user_id);

-- dnf_entries: users see and modify only their own
create policy "dnf_select" on dnf_entries
  for select using (auth.uid() = user_id);

create policy "dnf_insert" on dnf_entries
  for insert with check (auth.uid() = user_id);

create policy "dnf_update" on dnf_entries
  for update using (auth.uid() = user_id);

-- taste_profile: users see and modify only their own
create policy "taste_profile_select" on taste_profile
  for select using (auth.uid() = user_id);

create policy "taste_profile_insert" on taste_profile
  for insert with check (auth.uid() = user_id);

create policy "taste_profile_update" on taste_profile
  for update using (auth.uid() = user_id);
