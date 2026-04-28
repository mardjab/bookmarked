# Shelf — product spec

## Problem
Three apps (Goodreads, Fable, Kindle) each do one thing well. This replaces all three
for tracking, with smarter AI recommendations and Kindle-specific alerts no other app provides.

## Rating system
Two-axis, not stars. Stored as integers 1–4 each.

Enjoyment axis:
  1 = Struggled through it
  2 = It was fine
  3 = Enjoyed it
  4 = Couldn't put it down

Recommendability axis:
  1 = No
  2 = To the right person
  3 = To most people
  4 = To everyone

Optional notes field (freetext) — Claude parses this for trope/theme/style signals.
Both axes required to save a rating. Notes optional.

DNF is separate: stored in dnf_entries with:
  - reasons: text[] (e.g. ["Too slow", "Writing style not for me"])
  - progress: enum (first_10, around_25, around_50, over_50)
  - notes: text (optional)

## Shelves
- Want to Read
- Reading (currently)
- Finished
- DNF
Books can only be in one shelf at a time. Moving shelves is logged.

## Recommendation engine (Phase 3)
Signals used by Claude to generate recs:
  - Positive: high enjoyment + high recommendability books
  - Niche faves: high enjoyment + low recommendability (match on tropes, not popularity)
  - Respected-not-for-me: low enjoyment + high recommendability (keep genre, avoid style)
  - Negative: DNF reasons (strongest anti-signal — down-rank style + structure, not just genre)
  - Notes: parsed for themes/tropes/POV/pacing preferences
  - Mood: user-selectable at rec time (light/heavy, escapist/literary)
Recs are bucketed by genre. User can filter by genre.
Each rec includes a Claude-written explanation of why it was suggested.

## Kindle alerts (Phase 2)
- KU availability: scrape Amazon product page, check for "Read for Free" button
- Price alert: scrape Kindle price, compare to user threshold
- Scraper runs on cron (daily), updates kindle_data table
- Alert sent via email (Resend) when:
    - A want-to-read book enters KU
    - A book price drops below user threshold
- ASIN stored on book record (user confirms/enters manually if auto-match fails)

## New release radar (Phase 4)
- Upcoming books matched to taste profile
- Sources: Open Library upcoming, scraping (TBD)
- Alert on release date
- Shown in dedicated "Coming up" section of rec screen

## Reading stats (Phase 1)
- Books finished per month (bar chart)
- Books finished per year (number)
- Current reading streak (days with reading activity logged)
- Genre breakdown (pie/donut — % of finished books by genre)
- DNF rate (% of started books not finished)
- Average enjoyment by genre

## Data model (Phase 1 — Supabase)

books
  id, ol_id (Open Library), title, author, cover_url,
  genre text[], page_count, published_year, description,
  asin (nullable, for Amazon scraping)

user_books (join: user <> book + shelf status)
  id, user_id, book_id, shelf, added_at, updated_at

ratings
  id, user_id, book_id, enjoyment int (1-4),
  recommendability int (1-4), notes text, created_at

dnf_entries
  id, user_id, book_id, reasons text[],
  progress text, notes text, created_at

taste_profile
  id, user_id, signals jsonb, updated_at
  (updated by server action on every rating/dnf save)

kindle_data (Phase 2)
  id, book_id, asin, ku_available bool,
  kindle_price numeric, last_checked_at

## Build phases
Phase 1 — Core tracker (NOW)
  Supabase setup, auth, schema, book search, shelves,
  rating modal, DNF modal, stats dashboard, Goodreads import

Phase 2 — Kindle alerts
  Amazon scraper, KU badge on shelf, price alerts, email via Resend

Phase 3 — AI recommendations
  Taste profile builder, Claude rec engine, genre filter, rec explanations

Phase 4 — New release radar
  Upcoming books feed, release alerts, rec refinement loop

## UI
- Fable-inspired: dark, editorial, cover art forward
- Web-first, desktop layout, no mobile optimization in v1
- Tailwind dark mode via class strategy
- No component library — build from scratch with Tailwind
