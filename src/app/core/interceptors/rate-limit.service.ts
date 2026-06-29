import { Injectable, signal, computed } from '@angular/core';

// Show a warning banner when this many API calls remain
const RATE_LIMIT_WARNING_THRESHOLD = 10;

@Injectable({ providedIn: 'root' })
export class RateLimitService {
  // The raw remaining count (-1 = unknown, not yet seen in a response header)
  private readonly _remaining = signal<number>(-1);

  /** How many API calls remain this hour. */
  readonly remaining = this._remaining.asReadonly();

  /** True when we're close to exhausting the rate limit. */
  readonly isLow = computed(() =>
    this._remaining() >= 0 && this._remaining() <= RATE_LIMIT_WARNING_THRESHOLD
  );

  /** Called by the interceptor after every GitHub API response. */
  setRemaining(value: number): void {
    this._remaining.set(value);
  }
}
