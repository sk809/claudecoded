# ClaudeCodes

A website for faceless videos made end to end by Claude, with a gallery of every video style Claude can make.

Built with React, Vite, TypeScript and Tailwind, with Supabase for accounts, so it runs in [Lovable](https://lovable.dev).

The styles come from [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) by LemoLab: 59 styles, each with a demo film, a still and a style guide. Code there is MIT; demo films and stills are CC BY 4.0, credited on every page.

## Turn on accounts (once)

1. In Lovable, connect Supabase (the Supabase button at the top right). Lovable adds `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for you.
2. Run the SQL in `supabase/migrations/20261026000000_saved_styles.sql` (Lovable offers to, or paste it into the Supabase SQL editor). It creates the `saved_styles` table with row-level security so each person only sees their own saved styles.
3. Optional: in Supabase, Authentication > Providers > Email, turn off "Confirm email" if you want people logged in straight after signing up.

Until Supabase is connected, the site works for browsing and the login pages say accounts aren't switched on yet.

## Run locally

```sh
npm install
cp .env.example .env   # add your Supabase URL and anon key
npm run dev            # http://localhost:8080
```

## What's where

| Path | What it does |
|---|---|
| `src/pages/Home.tsx` | Landing page and the styles gallery (one box per style, filters, search) |
| `src/pages/StylePage.tsx` | One style: demo film, summary, full guide for logged-in users, save button |
| `src/pages/AuthPage.tsx` | Log in and sign up |
| `src/pages/Account.tsx` | Profile, saved styles, log out |
| `src/hooks/useAuth.tsx` | Supabase session for the whole app |
| `src/hooks/useSavedStyles.ts` | Reads and changes the `saved_styles` table |
| `src/data/styles.json`, `src/data/guides/` | Imported style catalogue and guides |
| `public/styles-img/` | Preview stills |
| `src/index.css` | Design tokens (colours, fonts) and all component styles |

## Access rules

- Anyone can browse the gallery and watch every demo film.
- A free account unlocks each style's full guide and lets people save styles.

The guide text ships with the site, so hiding it is a nudge to sign up rather than real protection.

## Updating the styles

```sh
git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar ../lemo-opuscar
npm run import-styles -- ../lemo-opuscar
```

Demo films stream from that repo's `films` GitHub release, so they aren't copied here.

The earlier version with its own Node server is on the `node-server` branch.
