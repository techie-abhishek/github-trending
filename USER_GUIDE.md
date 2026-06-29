# GitTrend — User Guide

> A visual walkthrough of every screen with numbered callout markers.

---

## Quick Start

```bash
pnpm install
pnpm start
# Open http://localhost:4200
```

---

## Screen 1 — Dashboard

```
┌─────────────────────────────────────────────────────────────────────┐
│  ①                              ②  [☀️]                            │
│  🐙 GitTrend                       (dark mode toggle)              │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Trending Repositories                                              │
│  The most-starred projects on GitHub right now.                     │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │  ③ [Today]  [This Week ✓]  [This Month]                     │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐                   │
│  │ ④          │  │            │  │            │                   │
│  │ 🖼 octocat │  │ 🖼 torvalds│  │ 🖼 google  │                   │
│  │ repo-name  │  │ linux      │  │ flutter    │                   │
│  │ Short desc │  │ Short desc │  │ Short desc │                   │
│  │ ⑤●TS ⭐12k│  │ ●C  ⭐89k  │  │ ●Dart ⭐2m │                   │
│  └────────────┘  └────────────┘  └────────────┘                   │
│  (×20 cards in a responsive 1→2→3 column grid)                    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Marker | Element | What it does |
|--------|---------|--------------|
| ① | Brand logo / "GitTrend" | Clickable — always returns to the dashboard |
| ② | Dark/light mode toggle | Persists your preference to `localStorage` |
| ③ | Period filter (Today / This Week / This Month) | Refetches the API for the selected time window; the active tab is highlighted |
| ④ | Repository card | Shows owner avatar, repo name, description, language dot, star count, fork count |
| ⑤ | Language colour dot | Matches GitHub's own language colour palette (e.g. TypeScript = blue, Python = dark blue) |

### Loading state
While the API call is in flight, each card position shows an animated **skeleton placeholder** (pulsing grey blocks that match the card layout). This prevents layout shift.

```
┌────────────┐
│ ░░░  ░░░░ │   ← owner + name (grey bars, animate-pulse)
│ ░░░░░░░░░ │
│ ░░░░░░░   │   ← description
│ ░░  ░░ ░░ │   ← stats row
└────────────┘
```

### Rate-limit warning banner
When the GitHub API rate limit drops to ≤10 calls remaining, a yellow banner appears at the top:

```
┌─────────────────────────────────────────────────────────────────────┐
│ ⚠️  GitHub API rate limit low — 8 requests remaining this hour.    │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Screen 2 — Repository Details

Click any card on the dashboard to open the details page.

```
┌─────────────────────────────────────────────────────────────────────┐
│  🐙 GitTrend                             [☀️]                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ① ← Back to Dashboard                                             │
│                                                                     │
│  ┌──┐  ② octocat / hello-world                                     │
│  │🖼│     A famous "Hello, World" example repository               │
│  └──┘                                                               │
│                                                                     │
│  ③ [⭐ 5k stars] [⑂ 900 forks] [⚠ 7 open issues] [● Go] [MIT]   │
│                                                                     │
│  Topics                                                             │
│  ④ [angular] [typescript] [open-source]                            │
│                                                                     │
│  Default branch   Created       Last updated                       │
│  main             Jan 1, 2024   Jun 1, 2024                        │
│                                                                     │
│  ⑤ [🐙 View on GitHub →]                                          │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

| Marker | Element | What it does |
|--------|---------|--------------|
| ① | Back button | Calls `Location.back()` — same as the browser's ← button; uses browser history |
| ② | Owner / Repo name heading | Owner is a link to the GitHub profile |
| ③ | Stat chips | Stars, forks, open issues, language, license — all in pill badges |
| ④ | Topic pills | Scrollable list of the repo's topics; styled like GitHub's own tags |
| ⑤ | "View on GitHub" CTA | Opens the repository on GitHub in a new tab |

---

## Screen 3 — Dark Mode

Toggle the ☀️/🌙 button in the top-right to switch themes. The preference is saved between sessions.

```
Light mode                       Dark mode
──────────────────────────────   ──────────────────────────────
White cards, slate-50 bg         slate-800 cards, slate-900 bg
Slate text colours               White/light-slate text
Border: slate-200                Border: slate-700
```

---

## Navigation Flow

```
[Dashboard /dashboard]
        │
        │  click card
        ▼
[Details /repos/:owner/:name]
        │
        │  ← back button  OR  browser back button
        ▼
[Dashboard /dashboard]   ← instant (cached, no re-fetch)
```

The browser **back** button always works — Angular's router keeps the history stack intact. The dashboard data is served from cache on return, so there's no loading spinner.

---

## Responsive Breakpoints

| Screen width | Grid columns |
|---|---|
| < 640 px (mobile) | 1 column |
| 640–1024 px (tablet) | 2 columns |
| > 1024 px (desktop) | 3 columns |
