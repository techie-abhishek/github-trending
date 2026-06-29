# GitTrend — Concepts Guide

> A topic-by-topic explanation of every key technique used in this project, written
> for a 5-year Angular developer preparing to walk through the code in an interview.
> Each section follows: **What it is → Why we use it → Where in this codebase → Code snippet**.

---

## 1. Angular Signals (`signal`, `computed`, `effect`, `toSignal`, `resource`)

### What it is
Signals are Angular's built-in **reactive primitive** (stable since Angular 17).
A signal is a wrapper around a value that notifies Angular when the value changes —
without needing Zone.js, `ChangeDetectorRef`, or RxJS subscriptions in the component.

### Why we use it
- **Fine-grained reactivity**: only the parts of the template that *read* a signal re-render.
- **No manual subscriptions or unsubscriptions** — no memory leak risk.
- **Simpler mental model** than observables for local UI state.

### Where in this codebase

**`activePeriod` signal in DashboardComponent** (`dashboard.component.ts`):
```typescript
// signal() creates a reactive value. Setting it triggers re-renders in any
// template or computed that reads it.
protected readonly activePeriod = signal<TrendingPeriod>('weekly');

// Updating it is explicit and synchronous:
protected setPeriod(period: TrendingPeriod): void {
  this.activePeriod.set(period);   // tells Angular "this value changed"
}
```

**`computed()` for derived values in RepoCardComponent** (`repo-card.component.ts`):
```typescript
// computed() re-runs automatically when its dependencies change.
// languageColor is re-computed whenever repo() changes.
readonly languageColor = computed(() => getLanguageColor(this.repo().language));
readonly starsFormatted = computed(() => formatCount(this.repo().stargazers_count));
```

**`resource()` for async data fetching** (Angular 19, `dashboard.component.ts`):
```typescript
// resource() is the signal-native data-fetching primitive.
// • request: a function that returns the "key" — signals read here are tracked.
//   When activePeriod() changes, the loader re-runs automatically.
// • loader: returns a Promise with the data.
// • Exposes .isLoading(), .value(), .error(), .reload() as signals.
protected readonly trendingData = resource({
  request: () => this.activePeriod(),
  loader: ({ request: period }) =>
    firstValueFrom(this.githubService.getTrendingRepos(period)),
});
```

**`RateLimitService`** (`rate-limit.service.ts`):
```typescript
private readonly _remaining = signal<number>(-1);

// asReadonly() exposes the signal without allowing external writes
readonly remaining = this._remaining.asReadonly();

// computed() — derived boolean, updates automatically
readonly isLow = computed(() =>
  this._remaining() >= 0 && this._remaining() <= 10
);
```

---

## 2. Standalone Components (No NgModule)

### What it is
Before Angular 14, every component had to be declared in an `NgModule`.
Standalone components (default in Angular 19) declare their own imports directly
in the `@Component` decorator — no module required.

### Why we use it
- Less boilerplate: no `declarations`, `imports` arrays in a separate module file.
- Tree-shaking: Angular can statically analyse which components are used per route.
- Aligns with the future direction of Angular (NgModules are being phased out).

### Where in this codebase
Every component in the project is standalone. Example (`repo-card.component.ts`):
```typescript
@Component({
  selector: 'app-repo-card',
  standalone: true,           // ← no NgModule needed
  imports: [RouterLink],      // ← dependencies declared right here
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `...`,
})
export class RepoCardComponent { ... }
```

Lazy loading works at the component level (`app.routes.ts`):
```typescript
{
  path: 'dashboard',
  // loadComponent() replaces loadChildren() from the NgModule era
  loadComponent: () =>
    import('./features/dashboard/dashboard.component')
      .then(m => m.DashboardComponent),
}
```

---

## 3. `inject()` — Modern Dependency Injection

### What it is
`inject()` is a function that retrieves a service from Angular's DI system.
It replaces constructor injection and can be called anywhere within an injection context
(component/service constructor, field initialiser, `runInInjectionContext`).

### Why we use it
- More readable: no long constructor parameter lists.
- Works in field initialisers — you can assign a service to a `readonly` field without a constructor.
- Required for functional patterns like interceptors.

### Where in this codebase
All services and components use `inject()` (`github.service.ts`):
```typescript
@Injectable({ providedIn: 'root' })
export class GithubService {
  // inject() in a field initialiser — no constructor needed
  private readonly http = inject(HttpClient);
  ...
}
```

Functional interceptor (`github.interceptor.ts`):
```typescript
export const githubInterceptor: HttpInterceptorFn = (req, next) => {
  // inject() works here because the interceptor runs in an injection context
  const rateLimitService = inject(RateLimitService);
  ...
};
```

---

## 4. Angular Router Deep-Dive

### `withComponentInputBinding()`
Automatically maps route parameters (`:owner`, `:name`) to `@Input()` / `input()` properties.
No need to inject `ActivatedRoute` and call `this.route.snapshot.params['owner']`.

**`app.config.ts`:**
```typescript
provideRouter(routes, withComponentInputBinding(), withViewTransitions())
```

**`project-details.component.ts`:**
```typescript
// These receive their values from the URL — no ActivatedRoute injection.
readonly owner = input.required<string>();   // from :owner
readonly name  = input.required<string>();   // from :name
```

### `withViewTransitions()`
Enables the browser's native **View Transitions API** during route changes.
A single line of config; the CSS fade animation in `styles.css` handles the visual effect.

### Lazy loading with `loadComponent()`
Each route's component is in a separate JS chunk. The browser only downloads the
dashboard chunk when you navigate to `/dashboard`, and the details chunk when you
navigate to `/repos/...`. This reduces initial bundle size.

**`app.routes.ts`:**
```typescript
{
  path: 'repos/:owner/:name',
  loadComponent: () =>
    import('./features/project-details/project-details.component')
      .then(m => m.ProjectDetailsComponent),
  title: 'Repository Details · GitTrend',  // sets document.title automatically
}
```

---

## 5. Functional HTTP Interceptors

### What it is
Interceptors sit between `HttpClient` and the network. Every HTTP request passes through
them in order. Functional interceptors (Angular 15+) are plain functions — no class,
no implements.

### Why we use it
- Add the GitHub auth token to every request without touching each service method.
- Read response headers globally (rate-limit remaining) without duplicating that logic.

### Where in this codebase (`github.interceptor.ts`)
```typescript
// HttpInterceptorFn = (req, next) => Observable<HttpEvent>
export const githubInterceptor: HttpInterceptorFn = (req, next) => {
  const rateLimitService = inject(RateLimitService);

  // Only intercept GitHub API calls
  if (!req.url.includes('api.github.com')) return next(req);

  const token = (window as any).__GITHUB_TOKEN__ ?? null;
  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    tap(event => {
      if (event instanceof HttpResponse) {
        const remaining = event.headers.get('X-RateLimit-Remaining');
        if (remaining !== null) rateLimitService.setRemaining(Number(remaining));
      }
    })
  );
};
```

**Registration** (`app.config.ts`):
```typescript
provideHttpClient(withInterceptors([githubInterceptor]))
```

---

## 6. RxJS Essentials — `shareReplay`, `pipe`, `catchError`

### `shareReplay(1)` — The cache strategy
Without `shareReplay(1)`, every subscriber to an Observable triggers a new HTTP request.
With it, the last emission is **replayed** to any new subscriber — turning one network
call into a persistent in-memory cache.

**`github.service.ts`:**
```typescript
const request$ = this.http
  .get<SearchResult>(GITHUB_SEARCH_URL, { params })
  .pipe(
    // shareReplay(1): the HTTP response is made once, then cached.
    // Any later subscriber (e.g. back-navigation) gets the cached value instantly.
    shareReplay(1)
  );
this.trendingCache.set(cacheKey, request$);
```

### `firstValueFrom()` — Observable → Promise bridge
`resource()` works with Promises. `firstValueFrom(obs$)` subscribes to an Observable,
waits for the first emission, then resolves a Promise and unsubscribes automatically.

---

## 7. `@defer` / `@placeholder` — Deferred Rendering

### What it is
`@defer` is an Angular 17+ template block that delays rendering of its content.
`on immediate` means: defer until after the current frame has painted, then render.

### Why we use it
The goal is **perceived performance**: show the page shell and filter buttons immediately,
then load the card grid in the next frame. The skeleton placeholders fill the space while
the real data loads.

### Where in this codebase (`dashboard.component.ts`):
```html
<!-- The @placeholder renders for the brief moment before @defer kicks in.
     This prevents a blank-card-area flash on slow connections. -->
@defer (on immediate) {
  <!-- The real content — only rendered once the defer trigger fires -->
  @if (trendingData.isLoading()) {
    <app-skeleton-loader />  <!-- shown while API call is in flight -->
  } @else {
    <app-repo-card ... />    <!-- real cards once data arrives -->
  }
} @placeholder {
  <!-- Shown for ~1 frame before the defer triggers -->
  <app-skeleton-loader />
}
```

---

## 8. `ChangeDetectionStrategy.OnPush`

### What it is
By default, Angular runs change detection on every component after every event.
`OnPush` changes the rule: a component only checks for changes when:
1. An `@Input` reference changes (or an `input()` signal updates), or
2. An event originates from within the component, or
3. An `async` pipe or signal read in the template emits a new value.

### Why we use it
Without `OnPush`, every click anywhere in the app would re-check every component.
With `OnPush` on all components, Angular only re-checks components whose data
has actually changed — dramatic performance improvement in large lists.

### Where in this codebase
Every component in the project has it:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  ...
})
```

**Why it works with Signals**: When a signal changes, Angular automatically marks
any `OnPush` component that reads it as "dirty" — so the component re-renders
exactly when needed, nothing more.

---

## 9. TailwindCSS in Angular

### Setup
TailwindCSS v3 is integrated via PostCSS (`postcss.config.js`).
Angular's build pipeline (via `@angular-devkit/build-angular`) runs PostCSS on CSS files,
which processes the Tailwind directives.

**`tailwind.config.js`:**
```javascript
module.exports = {
  content: ['./src/**/*.{html,ts}'],  // scan these files for class names
  darkMode: 'class',                   // dark mode via the "dark" class on <html>
  theme: { extend: {} },
};
```

**`styles.css`:**
```css
@tailwind base;        /* Preflight: CSS resets */
@tailwind components;  /* Custom component classes (e.g. .stat-chip) */
@tailwind utilities;   /* Atomic utility classes */
```

### Dark Mode Strategy
`darkMode: 'class'` means dark mode is enabled by adding `class="dark"` to `<html>`.
This is toggled in `AppComponent` and persisted to `localStorage`.
In templates: `dark:bg-slate-800` only applies when the `dark` class is on `<html>`.

### `@layer components` — Custom reusable class
```css
@layer components {
  .stat-chip {
    @apply flex items-center gap-1.5 px-3 py-1.5 text-sm
           bg-slate-100 dark:bg-slate-800
           text-slate-700 dark:text-slate-300
           rounded-full border border-slate-200 dark:border-slate-700;
  }
}
```
Instead of repeating 8 utility classes on every stat badge, `.stat-chip` encapsulates them.

---

## 10. TypeScript Strict Typing

### What it is
The project uses `strict: true` in `tsconfig.json`, which enables:
- `noImplicitAny`: every variable must be typed
- `strictNullChecks`: `null` and `undefined` are distinct types
- `strictPropertyInitialization`: class properties must be initialised

### Where in this codebase
**`repository.model.ts`** — every field is typed, nullability is explicit:
```typescript
export interface Repository {
  description: string | null;   // GitHub returns null, not ""
  language: string | null;      // repos can have no language
  license: { name: string } | null;
  topics: string[];             // always an array (never null)
}
```

**`TrendingPeriod` union type** prevents typos at the call site:
```typescript
export type TrendingPeriod = 'daily' | 'weekly' | 'monthly';
// TypeScript will error if you pass 'yearly' — caught at compile time, not runtime
```

---

## 11. Trade-offs Considered

| Decision | Alternative considered | Why we chose this |
|---|---|---|
| GitHub Search API for "trending" | Third-party scraper (e.g. github-trending-api npm package) | No external dependency; official API; scraper APIs go down |
| `resource()` for data fetching | `toSignal(obs$)` + manual loading flag | `resource()` is the Angular 19 idiomatic API; cleaner loading/error states |
| `shareReplay(1)` in-memory cache | `localStorage`/`sessionStorage` | Simpler; sufficient for a session; avoids stale-data edge cases |
| TailwindCSS v3 | TailwindCSS v4 | v4 has no `tailwind.config.js` and different Angular integration; v3 is stable and well-documented |
| Karma + Jasmine | Jest | Karma is the Angular default; Jest setup requires extra config for standalone components |
| Dark mode via `class` strategy | `media` strategy | `class` lets the user override their OS setting; `media` does not |

---

## 12. Possible Improvements

| Improvement | Effort | Value |
|---|---|---|
| Pagination / infinite scroll | Medium | Show more than 20 repos |
| GitHub OAuth login | High | Raises rate limit from 60 to 5000 req/hour |
| Language filter on dashboard | Low | Filter cards by language |
| PWA / service worker offline cache | Medium | App works without internet |
| Virtualised list (`@angular/cdk/scrolling`) | Medium | Smooth scrolling with 1000+ items |
| README preview on details page | Medium | Render the repo's README.md |
| Repo comparison mode | High | Side-by-side stats for two repos |
| Unit tests for service and interceptor | Low | `HttpTestingController` makes this straightforward |
