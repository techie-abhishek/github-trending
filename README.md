# GitTrend — Trending GitHub Repositories

A public Angular 19 web app that shows the top 20 trending GitHub repositories,
built as a technical assignment demonstrating modern Angular architecture.

**Live demo:** `https://<your-username>.github.io/github-trending/`

---

## Getting Started

```bash
# Install dependencies
pnpm install

# Start the development server
pnpm start
# → http://localhost:4200
```

## Available Scripts

| Command | Description |
|---|---|
| `pnpm start` | Start dev server at `localhost:4200` |
| `pnpm run build` | Production build to `dist/` |
| `pnpm test` | Run Karma tests in watch mode |
| `pnpm run test:ci` | Run tests once headlessly (CI mode) |

## Features

- **Dashboard** — top 20 trending repos with Today / This Week / This Month filter
- **Details page** — per-repo stats, topics, license, metadata
- **Dark mode** — toggles via the navbar button, persisted to `localStorage`
- **Skeleton loaders** — animated placeholders while data loads
- **Rate-limit banner** — warns when the GitHub API quota is running low
- **Browser back button** — always returns to the dashboard instantly (cached)

## Tech Stack

| Concern | Technology |
|---|---|
| Framework | Angular 19 (standalone components, Signals, `resource()`) |
| Styling | TailwindCSS v3 (dark mode `class` strategy) |
| Package manager | pnpm |
| HTTP | Angular `HttpClient` with functional interceptor |
| Tests | Karma + Jasmine (5 component tests) |
| Hosting | GitHub Pages via GitHub Actions |

## Architecture

```
src/app/
├── core/
│   ├── models/        → TypeScript interfaces (Repository, SearchResult)
│   ├── services/      → GithubService (API + shareReplay cache)
│   └── interceptors/  → Auth token injection + rate-limit tracking
├── features/
│   ├── dashboard/     → Period filter, resource()-driven grid
│   └── project-details/ → Signal inputs from route params
└── shared/
    ├── repo-card/     → Presentational card (input() signal, OnPush)
    ├── skeleton-loader/ → Animated loading placeholder
    └── error-state/   → Error UI with retry button
```

See [`FUNCTIONAL_GUIDE.md`](./FUNCTIONAL_GUIDE.md) for the full architecture walkthrough
and [`CONCEPTS.md`](./CONCEPTS.md) for an explanation of every Angular concept used.

## GitHub API

GitHub has no official "trending" endpoint. The app uses the Search API:

```
GET /search/repositories?q=created:>YYYY-MM-DD&sort=stars&order=desc&per_page=20
```

Where `YYYY-MM-DD` is today minus the selected period (1 / 7 / 30 days).

**Rate limit:** 60 requests/hour unauthenticated. To raise this, set `GITHUB_TOKEN`
in the environment and the interceptor will inject it as a Bearer token.

## Deploying to GitHub Pages

```bash
# Build with the correct base href for your repo name
pnpm run build -- --base-href /github-trending/

# Or push to main — the GitHub Actions workflow deploys automatically
git push origin main
```
