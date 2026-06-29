# GitTrend — Functional & Architecture Guide

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Browser                                                             │
│                                                                      │
│  ┌──────────────────┐      ┌──────────────────────────────────────┐ │
│  │  AppComponent    │      │  Angular Router                      │ │
│  │  (shell + nav)   │─────▶│  /dashboard  →  DashboardComponent  │ │
│  │                  │      │  /repos/:o/:n →  ProjectDetails      │ │
│  └──────────────────┘      └──────────────────────────────────────┘ │
│           │                              │                           │
│           ▼                              ▼                           │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  GithubService  (providedIn: 'root' singleton)                 │ │
│  │  getTrendingRepos(period) ──► shareReplay(1) cache             │ │
│  │  getRepoDetails(owner, name) ── shareReplay(1) cache           │ │
│  └────────────────────────────────────────────────────────────────┘ │
│           │                                                          │
│           ▼                                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  GithubInterceptor (functional)                                │ │
│  │  • Injects Bearer token if GITHUB_TOKEN is set                 │ │
│  │  • Reads X-RateLimit-Remaining → RateLimitService             │ │
│  └────────────────────────────────────────────────────────────────┘ │
│           │                                                          │
│           ▼                                                          │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │  GitHub REST API  (api.github.com)                             │ │
│  │  GET /search/repositories?q=created:>DATE&sort=stars&per_page=20│ │
│  │  GET /repos/{owner}/{name}                                     │ │
│  └────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Data Flow — Dashboard Load

```
User opens /dashboard
        │
        ▼
DashboardComponent initialised
  activePeriod signal = 'weekly'
        │
        ▼
resource({ request: () => activePeriod() })
  reads activePeriod() → 'weekly'
  calls loader: firstValueFrom(getTrendingRepos('weekly'))
        │
        ▼
GithubService.getTrendingRepos('weekly')
  builds query: created:>2024-01-XX  (7 days ago)
  checks trendingCache → miss (first load)
  returns HTTP Observable with shareReplay(1)
        │
        ▼
GithubInterceptor
  adds Authorization header (if token set)
  passes request through
        │
        ▼
GitHub API responds with SearchResult { items: Repository[20] }
        │
        ▼
GithubInterceptor taps response
  reads X-RateLimit-Remaining header
  → RateLimitService.setRemaining(N)
  → rateLimitService.isLow() updates → banner shown/hidden
        │
        ▼
resource().value() signal = SearchResult
resource().isLoading() = false
        │
        ▼
Template re-renders (OnPush: only when signal changes)
  @defer block renders 20 <app-repo-card> components
        │
        ▼
User sees 20 cards
```

---

## Data Flow — Period Filter Change

```
User clicks "This Month"
        │
        ▼
DashboardComponent.setPeriod('monthly')
  activePeriod.set('monthly')
        │
        ▼
resource() detects request() changed ('weekly' → 'monthly')
  isLoading() = true  →  skeleton grid appears
  calls loader with period = 'monthly'
        │
        ▼
GithubService.getTrendingRepos('monthly')
  key = 'monthly' → cache miss (new period)
  builds query: created:>DATE-30-days-ago
        │
        ▼
... (same HTTP flow as above) ...
        │
        ▼
20 new cards rendered for the monthly period
```

---

## Data Flow — Back Navigation (Cache Hit)

```
User clicks Back button / browser ← 
        │
        ▼
Location.back() / Router pops history
        │
        ▼
DashboardComponent re-initialises
  activePeriod signal = 'weekly' (default)
        │
        ▼
resource() calls getTrendingRepos('weekly')
  key = 'weekly' → CACHE HIT (shareReplay(1))
  Observable immediately replays the last response
  no HTTP request made
        │
        ▼
resource().value() populated synchronously
Template renders 20 cards instantly — no loading spinner
```

---

## File Responsibilities

### `src/app/core/`

| File | Responsibility |
|------|----------------|
| `models/repository.model.ts` | TypeScript interfaces: `Repository`, `SearchResult`, `TrendingPeriod`, `PERIOD_DAYS` |
| `services/github.service.ts` | All GitHub API calls; in-memory cache via `shareReplay(1)`; `getDateBefore()` helper |
| `interceptors/github.interceptor.ts` | Functional interceptor: injects auth token, taps responses for rate-limit header |
| `interceptors/rate-limit.service.ts` | Signal-based service exposing `remaining` and `isLow` to the template |

### `src/app/features/`

| File | Responsibility |
|------|----------------|
| `dashboard/dashboard.component.ts` | Period filter state signal; `resource()` for reactive data fetch; renders card grid |
| `project-details/project-details.component.ts` | Receives `owner`/`name` as signal inputs from route; `resource()` for repo fetch; stat display |

### `src/app/shared/`

| File | Responsibility |
|------|----------------|
| `repo-card/repo-card.component.ts` | Presentational card — takes a `Repository` input, formats counts, navigates on click |
| `skeleton-loader/skeleton-loader.component.ts` | Pure presentational loading placeholder; no logic |
| `error-state/error-state.component.ts` | Error screen with configurable title, message, and optional retry button |
| `language-colors.ts` | Static map of language → hex colour; `formatCount()` (12300 → "12.3k") |

### `src/app/`

| File | Responsibility |
|------|----------------|
| `app.config.ts` | Bootstraps `provideRouter`, `provideHttpClient`, interceptors |
| `app.routes.ts` | Route definitions: root redirect, `/dashboard`, `/repos/:owner/:name`, catch-all |
| `app.component.ts` | Shell: navbar, brand link, dark-mode toggle with `localStorage` persistence |

---

## State Management — Signal Map

```
AppComponent
  isDark: signal<boolean>          ← toggled by user, persisted to localStorage
  
DashboardComponent
  activePeriod: signal<TrendingPeriod>   ← 'daily' | 'weekly' | 'monthly'
  trendingData: ResourceRef<SearchResult>
    .isLoading(): Signal<boolean>
    .value():     Signal<SearchResult | undefined>
    .error():     Signal<unknown>
    
RateLimitService  (singleton)
  _remaining: signal<number>       ← written by interceptor
  remaining:  Signal<number>       ← read-only public view
  isLow:      Signal<boolean>      ← computed: remaining ≤ 10
```

---

## API Contract

### Request — Trending

```
GET https://api.github.com/search/repositories
  ?q=created:>2024-11-27   ← today minus PERIOD_DAYS[period]
  &sort=stars
  &order=desc
  &per_page=20

Headers:
  Authorization: Bearer <token>   (optional, raises rate limit)
  Accept: application/vnd.github+json
```

### Response — SearchResult

```json
{
  "total_count": 1234567,
  "incomplete_results": false,
  "items": [
    {
      "id": 123,
      "name": "awesome-lib",
      "full_name": "user/awesome-lib",
      "description": "...",
      "html_url": "https://github.com/user/awesome-lib",
      "stargazers_count": 12300,
      "forks_count": 456,
      "open_issues_count": 7,
      "language": "TypeScript",
      "topics": ["angular", "signals"],
      "owner": { "login": "user", "avatar_url": "...", "html_url": "..." },
      "license": { "name": "MIT License" },
      "default_branch": "main",
      "created_at": "2024-11-27T...",
      "updated_at": "2024-12-01T..."
    }
    // ... 19 more
  ]
}
```

### Error Handling

| HTTP Status | Cause | UI behaviour |
|---|---|---|
| 403 | Rate limit exceeded | Error state with message about rate limit |
| 404 | Repo not found (details page) | Error state with "Repository not found" |
| 5xx | GitHub outage | Generic error state with retry button |
| Network error | No internet | Generic error state with retry button |
