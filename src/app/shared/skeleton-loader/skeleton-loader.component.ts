import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Animated placeholder card shown while the real repo data is loading.
 * The pulse animation is handled entirely by Tailwind's `animate-pulse` class —
 * no JavaScript timers needed.
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200
             dark:border-slate-700 rounded-xl p-5 animate-pulse"
      aria-hidden="true"
    >
      <!-- Avatar + owner row -->
      <div class="flex items-center gap-3 mb-3">
        <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700"></div>
        <div class="h-3 w-24 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <!-- Repo name -->
      <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700 mb-2"></div>

      <!-- Description lines -->
      <div class="space-y-1.5 flex-1 mb-4">
        <div class="h-3 w-full rounded bg-slate-200 dark:bg-slate-700"></div>
        <div class="h-3 w-5/6 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>

      <!-- Stats row -->
      <div class="flex gap-4">
        <div class="h-3 w-16 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div class="h-3 w-10 rounded bg-slate-200 dark:bg-slate-700"></div>
        <div class="h-3 w-10 rounded bg-slate-200 dark:bg-slate-700"></div>
      </div>
    </div>
  `,
})
export class SkeletonLoaderComponent {}
