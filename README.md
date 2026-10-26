# ClaudeCodes

A website for faceless videos made end to end by Claude, with a gallery of every video style Claude can make.

The styles come from [lemomo-ai/lemo-opuscar](https://github.com/lemomo-ai/lemo-opuscar) by LemoLab: 59 styles, each with a demo film, a still and a style guide. Code there is MIT; demo films and stills are CC BY 4.0, credited on every page.

## Run it

Needs Node 22.5 or newer (uses the built-in `node:sqlite`).

```sh
npm install
npm start            # http://localhost:3000
npm test             # API tests: sign up, log in, sessions, saved styles, styles API
```

Set `PORT`, `DB_PATH` (default `data/claudecodes.db`) and `NODE_ENV=production` (secure cookies, needs HTTPS) as needed.

## What's here

| Path | What it does |
|---|---|
| `server/index.js` | Express app: styles API, saved styles, page routes |
| `server/auth.js` | Sign up, log in, log out, `/api/auth/me`. Passwords hashed with scrypt; sessions are random tokens in an httpOnly cookie, only their SHA-256 stored |
| `server/db.js` | SQLite tables: `users`, `sessions`, `favorites` |
| `scripts/import-styles.js` | Rebuilds `data/styles.json`, `data/guides/*.md` and `public/styles-img/*.jpg` from a lemo-opuscar checkout |
| `public/` | Home page with the styles gallery, style pages, log in, sign up, account |

## Access rules

- Anyone can browse the gallery and watch every demo film.
- A free account unlocks each style's full guide and lets people save styles to their account.

## Updating the styles

```sh
git clone --depth 1 https://github.com/lemomo-ai/lemo-opuscar ../lemo-opuscar
npm run import-styles -- ../lemo-opuscar
```

Demo films stream from that repo's `films` GitHub release, so they aren't copied here.

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/api/auth/signup` `{name, email, password}` | |
| POST | `/api/auth/login` `{email, password}` | |
| POST | `/api/auth/logout` | |
| GET | `/api/auth/me` | |
| GET | `/api/styles` | |
| GET | `/api/styles/:slug` (guide included when logged in) | |
| GET | `/api/me/favorites` | required |
| POST / DELETE | `/api/me/favorites/:slug` | required |
