# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Shelf — book tracking app

Personal reading tracker. Web-first, single user, no social layer in v1.
Full feature spec: see SPEC.md

## Stack
- Next.js 14 App Router + TypeScript + Tailwind CSS
- Supabase: Postgres, Auth (magic link only — no password auth), Realtime
- Open Library API (book search + cover art)
- Claude API (claude-sonnet-4) for recommendations
- Playwright (cron scraper for KU/price — Phase 2)
- Resend for email alerts (Phase 2+)

## Commands
- `npm run dev` — start dev server (port 3000)
- `npm run build` — production build
- `npm run typecheck` — tsc --noEmit
- `npm run lint` — eslint
- `supabase start` — local Supabase stack
- `supabase db push` — apply migrations

## Environment variables
Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-only, never expose to client
```

## Project structure
src/
  app/          # Next.js App Router pages + layouts
  components/   # Reusable UI components
  lib/          # Supabase client, API helpers, utils
  types/        # Shared TypeScript types
supabase/
  migrations/   # SQL migration files — named `{timestamp}_{description}.sql`, never edit manually
  seed.sql      # Dev seed data

## Auth flow
Magic link only. `src/middleware.ts` guards all routes and redirects unauthenticated users to `/login`. The Supabase client in `src/lib/supabase/server.ts` uses `createServerClient` (cookies); the client-side version in `src/lib/supabase/client.ts` uses `createBrowserClient`.

## Code conventions
- ES modules only (import/export), no require()
- Tailwind for all styling — no CSS modules, no inline style={}
- Server Components by default; use 'use client' only when needed
- All Supabase queries go through src/lib/supabase/ helpers, never inline
- TypeScript strict mode — no `any`, no type assertions without comment
- Run typecheck after every set of changes

## Key domain rules (do not deviate)
- Rating system is TWO-AXIS: enjoyment (1–4) + recommendability (1–4) + optional notes
- DNF is a shelf status, NOT a rating — stored in `dnf_entries` with `reason[]` and `progress`
- Taste profile is derived/updated on every rating save via server action, never manually edited
- Book metadata comes from Open Library; ASIN is stored separately for Amazon scraping
- Never store star ratings — the old 1-5 system is explicitly replaced
- A book can only be in one shelf at a time; every shelf change is logged in `shelf_log`

## What Claude gets wrong on this project
- Do not use react-query — use Next.js server actions + Supabase Realtime instead
- Do not create a separate CSS file — Tailwind only
- Always handle Goodreads import nulls gracefully (dates, page counts often missing)
- Do not add password-based auth — magic link only
