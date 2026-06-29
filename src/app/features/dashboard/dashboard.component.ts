import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  resource,
  signal,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { GithubService } from '../../core/services/github.service';
import { RateLimitService } from '../../core/interceptors/rate-limit.service';
import { TrendingPeriod } from '../../core/models/repository.model';
import { RepoCardComponent } from '../../shared/repo-card/repo-card.component';
import { SkeletonLoaderComponent } from '../../shared/skeleton-loader/skeleton-loader.component';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';

const PERIOD_LABELS: Record<TrendingPeriod, string> = {
  daily: 'Today',
  weekly: 'This Week',
  monthly: 'This Month',
};

const SKELETON_ITEMS = Array.from({ length: 20 });

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RepoCardComponent, SkeletonLoaderComponent, ErrorStateComponent],
  template: `

    @if (rateLimitService.isLow()) {
      <div
        class="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200
               dark:border-amber-700 text-amber-800 dark:text-amber-300
               text-sm px-4 py-2.5 text-center"
        role="alert"
      >
        ⚠️ GitHub API rate limit low —
        {{ rateLimitService.remaining() }} requests remaining this hour.
      </div>
    }

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <div class="mb-8">
        <h1 class="text-2xl font-bold text-slate-900 dark:text-white mb-1">
          Trending Repositories
        </h1>
        <p class="text-sm text-slate-500 dark:text-slate-400">
          The most-starred projects on GitHub right now.
        </p>
      </div>

      <div
        class="inline-flex rounded-lg border border-slate-200 dark:border-slate-700
               bg-slate-50 dark:bg-slate-800/50 p-1 mb-8"
        role="group"
        aria-label="Filter by time period"
      >
        @for (entry of periodEntries; track entry.period) {
          <button
            class="px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-150"
            [class]="activePeriod() === entry.period
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'"
            (click)="setPeriod(entry.period)"
            [attr.aria-pressed]="activePeriod() === entry.period"
            [attr.aria-label]="'Show trending for ' + entry.label"
          >
            {{ entry.label }}
          </button>
        }
      </div>

      @defer (on immediate) {
        @if (trendingData.isLoading()) {
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Loading repositories"
            aria-busy="true"
          >
            @for (item of skeletonItems; track $index) {
              <app-skeleton-loader />
            }
          </div>
        } @else if (trendingData.error()) {
          <app-error-state
            [title]="errorTitle()"
            [message]="errorMessage()"
            (retry)="trendingData.reload()"
          />
        } @else {
          <div
            class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            aria-label="Trending repositories"
          >
            @for (repo of trendingData.value()?.items ?? []; track repo.id) {
              <app-repo-card [repo]="repo" />
            }
          </div>

          <p class="text-xs text-slate-400 dark:text-slate-500 text-center mt-8">
            Showing top {{ trendingData.value()?.items?.length ?? 0 }} repositories
            · Data from GitHub Search API
          </p>
        }
      } @placeholder {
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (item of skeletonItems; track $index) {
            <app-skeleton-loader />
          }
        </div>
      }
    </main>
  `,
})
export class DashboardComponent {
  protected readonly rateLimitService = inject(RateLimitService);
  private readonly githubService = inject(GithubService);

  protected readonly activePeriod = signal<TrendingPeriod>('weekly');

  protected readonly periodEntries = (
    Object.entries(PERIOD_LABELS) as [TrendingPeriod, string][]
  ).map(([period, label]) => ({ period, label }));

  protected readonly skeletonItems = SKELETON_ITEMS;

  protected readonly trendingData = resource({
    request: () => this.activePeriod(),
    loader: ({ request: period }) =>
      firstValueFrom(this.githubService.getTrendingRepos(period)),
  });

  protected readonly errorTitle = computed(() => {
    const err = String(this.trendingData.error() ?? '');
    return err.includes('403') ? 'Rate limit reached' : 'Failed to load repositories';
  });

  protected readonly errorMessage = computed(() => {
    const err = String(this.trendingData.error() ?? '');
    if (err.includes('403')) {
      return 'GitHub API rate limit exceeded. Wait an hour or configure a GITHUB_TOKEN.';
    }
    return err || 'An unexpected error occurred. Please try again.';
  });

  protected setPeriod(period: TrendingPeriod): void {
    this.activePeriod.set(period);
  }
}
