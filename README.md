# Bookmarked

Personal reading tracker — replaces Goodreads, Fable, and Kindle with a single app built around a smarter two-axis rating system, AI-powered recommendations, and Kindle Unlimited alerts no other tracker provides.

## Stack

- Next.js 14 App Router · TypeScript · Tailwind CSS
- Supabase — Postgres, Auth (magic link), Realtime
- Open Library API — book search + cover art
- Claude API — recommendations (Phase 3)

## Local development

**Prerequisites:** Node 20+, Docker Desktop, Supabase CLI

```bash
cp .env.example .env.local   # fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
supabase start
npm install
npm run dev                  # http://localhost:3000
```

## Build phases

| Phase | Scope | Status |
|---|---|---|
| 1 | Core tracker — auth, shelves, two-axis ratings, DNF logging, stats, Goodreads import | In progress |
| 2 | Kindle alerts — KU availability + price drops via email | Planned |
| 3 | AI recommendations — taste profile + Claude-generated recs | Planned |
| 4 | New release radar — upcoming books matched to taste profile | Planned |
