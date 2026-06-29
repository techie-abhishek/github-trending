import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { RateLimitService } from './rate-limit.service';

// Only intercept calls to the GitHub API
const GITHUB_API_HOST = 'api.github.com';

/**
 * Functional HTTP interceptor (Angular 15+ pattern — no class, no NgModule).
 *
 * Responsibilities:
 *  1. Inject the GitHub token from the environment (if configured) to raise the rate limit
 *     from 60 req/hour (unauthenticated) to 5,000 req/hour (authenticated).
 *  2. Read X-RateLimit-Remaining from every response and notify RateLimitService
 *     so the UI can show a warning banner when we're running low.
 */
export const githubInterceptor: HttpInterceptorFn = (req, next) => {
  const rateLimitService = inject(RateLimitService);

  // Skip requests that are not targeting the GitHub API
  if (!req.url.includes(GITHUB_API_HOST)) {
    return next(req);
  }

  // Read optional token from env — injected at build time via angular.json fileReplacements.
  // If not set, we send no auth header (still works, just with lower rate limits).
  const token = (window as any).__GITHUB_TOKEN__ ?? null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    tap(event => {
      // Only inspect full HTTP responses (not progress events)
      if (event instanceof HttpResponse) {
        const remaining = event.headers.get('X-RateLimit-Remaining');
        if (remaining !== null) {
          rateLimitService.setRemaining(Number(remaining));
        }
      }
    })
  );
};
