# Atypical Backlog Management Frontend

> **LLM assistance disclaimer:** Parts of this codebase were written with LLM assistance (Cursor, various models). Even though this was manually reviewed and tested, generated or assisted code may contain errors, omissions, or security issues. Review, test, and validate all behavior before relying on it in production. Use this software at your own risk.

React single-page application for **Atypical Backlog**: a personal gaming backlog tracker with library browsing, playthrough management, reviews, statistics, and a public-facing landing experience.

This frontend is designed to work with the [Atypical Backlog backend](https://github.com/atypicalbacklog). The live public site is intended as a showcase; full self-hosted tracking requires running both frontend and backend locally.

## Tech Stack

- React 18
- TypeScript
- Vite 5
- React Router 6
- Material UI (MUI) 5 + MUI X Charts
- Emotion (MUI styling)

## What This Application Does

Core UI capabilities include:

- **Library** — browse games and instances with filters (platform, completion, playtype, DLC, search, sort)
- **Backlog** — filtered backlog overview with list and minimized card views
- **Backlog completion overview** — yearly completion progress across the backlog
- **Backlog submissions** — community backlog recommendations (search, upvote, comment) in public mode
- **Reviews** — review browsing, yearly review presentation, tier lists (management mode)
- **Statistics** — dashboards and charts (playtime, completions, backlog changes, console breakdowns)
- **Game instances** — detailed instance overview (covers, playthroughs, DLC, reviews, time bookings)
- **Landing page** — public feed galleries (recent activity, backlog picks, S-tier reviews, submissions)
- **Static pages** — imprint, FAQ & glossary

Management-only surfaces (hidden when the backend runs in `PUBLIC` mode):

- Add/edit games, instances, DLC, images
- Active playthroughs and playthrough completion editing
- Review and yearly review editing
- Game import staging admin

## Runtime Modes

Mode is determined by the backend via `GET /api/app-config` (`mode: MANAGEMENT | PUBLIC`). The UI adapts automatically:

| Mode | Home (`/`) | Management routes |
|------|------------|-------------------|
| `PUBLIC` | Public landing page | Redirect to `/` |
| `MANAGEMENT` | Active playthroughs dashboard | Full access |

`ManagementOnly` route wrappers enforce this on the client. The backend must still enforce authorization and write restrictions in public deployments.

## Setup

### 1) Prerequisites

- Node.js 18+ (20+ recommended)
- npm
- Running [Atypical Backlog backend](https://github.com/atypicalbacklog) (default: `http://localhost:8080`)

### 2) Install

```bash
npm install
```

### 3) Run (development)

```bash
npm run dev
```

Vite serves the app (default `http://localhost:5173`) and proxies `/api` to `http://localhost:8080` (see `vite.config.ts`).

The app **fails fast on startup** if `/api/app-config` cannot be loaded.

### 4) Build & preview

```bash
npm run build
npm run preview
```

Production build output is written to `dist/`. Serve `dist/` behind your reverse proxy and ensure `/api` routes to the backend.

### 5) Lint

```bash
npm run lint
```

## Configuration

This frontend does not use committed `.env` files for secrets. Runtime behavior depends on:

1. **Backend `app.mode`** — returned from `/api/app-config`
2. **API base path** — relative `/api/...` requests (same origin in production, Vite proxy in dev)

To point the dev proxy at a different backend, adjust `server.proxy` / `preview.proxy` in `vite.config.ts`.

Do **not** commit API keys, IGDB credentials, or other secrets in this repository. External integrations (IGDB, Google Calendar, etc.) are configured on the backend.

## Project Structure (overview)

```
src/
  app/           # Shell, routing, theme, mode guards
  features/      # Feature modules (library, backlog, reviews, statistics, …)
  services/      # API clients
  referenceData/ # Shared reference data (platforms, consoles, completion states, …)
  types/         # Shared TypeScript types
```

## Public Deployment Notes

For internet-facing use with the backend in `PUBLIC` mode:

- Build the frontend (`npm run build`) and serve static files from `dist/`
- Reverse-proxy `/api` to the Spring Boot backend over HTTPS
- Rely on backend public profile hardening (no admin/import/write surfaces)
- The UI hides management routes in `PUBLIC` mode; treat that as UX only, not security

## Related Repositories

- **Organization:** [github.com/atypicalbacklog](https://github.com/atypicalbacklog)
- **Backend:** companion Spring Boot API (see backend README in that repository for database setup, profiles, and endpoint contracts)

## License

MIT License

Copyright (c) 2026 Atypical Backlog

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
