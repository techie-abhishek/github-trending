import { Injectable, signal, computed } from '@angular/core';

const RATE_LIMIT_WARNING_THRESHOLD = 10;

@Injectable({ providedIn: 'root' })
export class RateLimitService {

  private readonly _remaining = signal<number>(-1);

  readonly remaining = this._remaining.asReadonly();

  readonly isLow = computed(() =>
    this._remaining() >= 0 && this._remaining() <= RATE_LIMIT_WARNING_THRESHOLD
  );

  setRemaining(value: number): void {
    this._remaining.set(value);
  }
}
