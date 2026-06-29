import { HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { tap } from 'rxjs';
import { RateLimitService } from './rate-limit.service';

const GITHUB_API_HOST = 'api.github.com';

export const githubInterceptor: HttpInterceptorFn = (req, next) => {
  const rateLimitService = inject(RateLimitService);

  if (!req.url.includes(GITHUB_API_HOST)) {
    return next(req);
  }

  const token = (window as any).__GITHUB_TOKEN__ ?? null;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq).pipe(
    tap(event => {

      if (event instanceof HttpResponse) {
        const remaining = event.headers.get('X-RateLimit-Remaining');
        if (remaining !== null) {
          rateLimitService.setRemaining(Number(remaining));
        }
      }
    })
  );
};
