-- Fix RLS policies that were created without an explicit role, defaulting to public.
-- Drop and recreate all non-books policies with `to authenticated`.

-- ─── user_books ──────────────────────────────────────────────────────────────────
drop policy "user_books_select" on user_books;
drop policy "user_books_insert" on user_books;
drop policy "user_books_update" on user_books;
drop policy "user_books_delete" on user_books;

create policy "user_books_select" on user_books
  for select to authenticated using (auth.uid() = user_id);

create policy "user_books_insert" on user_books
  for insert to authenticated with check (auth.uid() = user_id);

create policy "user_books_update" on user_books
  for update to authenticated using (auth.uid() = user_id);

create policy "user_books_delete" on user_books
  for delete to authenticated using (auth.uid() = user_id);

-- ─── shelf_log ───────────────────────────────────────────────────────────────────
drop policy "shelf_log_select" on shelf_log;
drop policy "shelf_log_insert" on shelf_log;

create policy "shelf_log_select" on shelf_log
  for select to authenticated using (auth.uid() = user_id);

create policy "shelf_log_insert" on shelf_log
  for insert to authenticated with check (auth.uid() = user_id);

-- ─── ratings ─────────────────────────────────────────────────────────────────────
drop policy "ratings_select" on ratings;
drop policy "ratings_insert" on ratings;
drop policy "ratings_update" on ratings;

create policy "ratings_select" on ratings
  for select to authenticated using (auth.uid() = user_id);

create policy "ratings_insert" on ratings
  for insert to authenticated with check (auth.uid() = user_id);

create policy "ratings_update" on ratings
  for update to authenticated using (auth.uid() = user_id);

-- ─── dnf_entries ─────────────────────────────────────────────────────────────────
drop policy "dnf_select" on dnf_entries;
drop policy "dnf_insert" on dnf_entries;
drop policy "dnf_update" on dnf_entries;

create policy "dnf_select" on dnf_entries
  for select to authenticated using (auth.uid() = user_id);

create policy "dnf_insert" on dnf_entries
  for insert to authenticated with check (auth.uid() = user_id);

create policy "dnf_update" on dnf_entries
  for update to authenticated using (auth.uid() = user_id);

-- ─── taste_profile ───────────────────────────────────────────────────────────────
drop policy "taste_profile_select" on taste_profile;
drop policy "taste_profile_insert" on taste_profile;
drop policy "taste_profile_update" on taste_profile;

create policy "taste_profile_select" on taste_profile
  for select to authenticated using (auth.uid() = user_id);

create policy "taste_profile_insert" on taste_profile
  for insert to authenticated with check (auth.uid() = user_id);

create policy "taste_profile_update" on taste_profile
  for update to authenticated using (auth.uid() = user_id);
