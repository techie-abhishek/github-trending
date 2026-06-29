import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  resource,
} from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Location } from '@angular/common';
import { GithubService } from '../../core/services/github.service';
import { getLanguageColor, formatCount } from '../../shared/language-colors';
import { ErrorStateComponent } from '../../shared/error-state/error-state.component';

@Component({
  selector: 'app-project-details',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ErrorStateComponent],
  template: `
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      <button
        class="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400
               hover:text-slate-700 dark:hover:text-slate-200 mb-8 transition-colors"
        (click)="goBack()"
        aria-label="Go back to dashboard"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/>
        </svg>
        Back to Dashboard
      </button>

      @if (repoData.isLoading()) {

        <div class="space-y-4">
          <div class="h-8 w-1/2 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div class="h-4 w-3/4 rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
          <div class="h-4 w-full rounded bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
        </div>
      } @else if (repoData.error()) {
        <app-error-state
          title="Repository not found"
          message="We couldn't load this repository. It may have been deleted or you may have followed a broken link."
          (retry)="repoData.reload()"
        />
      } @else {
        @let repo = repoData.value()!;

        <div class="flex items-start gap-4 mb-8">
          <img
            [src]="repo.owner.avatar_url"
            [alt]="repo.owner.login + ' avatar'"
            class="w-16 h-16 rounded-xl ring-1 ring-slate-200 dark:ring-slate-700 flex-shrink-0"
          />
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap mb-1">
              <a
                [href]="repo.owner.html_url"
                target="_blank"
                rel="noopener noreferrer"
                class="text-sm text-slate-500 dark:text-slate-400 hover:underline"
              >
                {{ repo.owner.login }}
              </a>
              <span class="text-slate-300 dark:text-slate-600">/</span>
              <h1 class="text-xl font-bold text-slate-900 dark:text-white">
                {{ repo.name }}
              </h1>
            </div>
            @if (repo.description) {
              <p class="text-slate-600 dark:text-slate-300 text-sm">
                {{ repo.description }}
              </p>
            }
          </div>
        </div>

        <div class="flex flex-wrap gap-3 mb-8">
          <div class="stat-chip">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
            </svg>
            <span>{{ starsFormatted() }} stars</span>
          </div>

          <div class="stat-chip">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
            </svg>
            <span>{{ forksFormatted() }} forks</span>
          </div>

          <div class="stat-chip">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/>
            </svg>
            <span>{{ issuesFormatted() }} open issues</span>
          </div>

          @if (repo.language) {
            <div class="stat-chip">
              <span
                class="w-3 h-3 rounded-full flex-shrink-0"
                [style.background-color]="languageColor()"
              ></span>
              <span>{{ repo.language }}</span>
            </div>
          }

          @if (repo.license) {
            <div class="stat-chip">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 0 0 6.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 0 0 6.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
              </svg>
              <span>{{ repo.license.name }}</span>
            </div>
          }
        </div>

        @if (repo.topics && repo.topics.length) {
          <div class="mb-8">
            <h2 class="text-xs font-semibold uppercase tracking-wider text-slate-500
                       dark:text-slate-400 mb-3">
              Topics
            </h2>
            <div class="flex flex-wrap gap-2">
              @for (topic of repo.topics; track topic) {
                <span
                  class="px-3 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/30
                         text-blue-700 dark:text-blue-300 rounded-full border
                         border-blue-200 dark:border-blue-700"
                >
                  {{ topic }}
                </span>
              }
            </div>
          </div>
        }

        <div class="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 dark:bg-slate-800/50
                    rounded-xl p-5 mb-8 text-sm">
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Default branch</dt>
            <dd class="font-medium text-slate-900 dark:text-white">{{ repo.default_branch }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Created</dt>
            <dd class="font-medium text-slate-900 dark:text-white">{{ createdDate() }}</dd>
          </div>
          <div>
            <dt class="text-xs text-slate-500 dark:text-slate-400 mb-0.5">Last updated</dt>
            <dd class="font-medium text-slate-900 dark:text-white">{{ updatedDate() }}</dd>
          </div>
        </div>

        <a
          [href]="repo.html_url"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white
                 text-white dark:text-slate-900 text-sm font-semibold rounded-lg
                 hover:bg-slate-700 dark:hover:bg-slate-100 transition-colors"
        >
          <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
          </svg>
          View on GitHub
        </a>
      }
    </main>
  `,
})
export class ProjectDetailsComponent {

  readonly owner = input.required<string>();
  readonly name = input.required<string>();

  private readonly githubService = inject(GithubService);
  private readonly location = inject(Location);

  protected readonly repoData = resource({
    request: () => ({ owner: this.owner(), name: this.name() }),
    loader: ({ request }) =>
      firstValueFrom(this.githubService.getRepoDetails(request.owner, request.name)),
  });

  protected readonly languageColor = computed(() =>
    getLanguageColor(this.repoData.value()?.language ?? null)
  );

  protected readonly starsFormatted = computed(() =>
    formatCount(this.repoData.value()?.stargazers_count ?? 0)
  );

  protected readonly forksFormatted = computed(() =>
    formatCount(this.repoData.value()?.forks_count ?? 0)
  );

  protected readonly issuesFormatted = computed(() =>
    formatCount(this.repoData.value()?.open_issues_count ?? 0)
  );

  protected readonly createdDate = computed(() =>
    this.formatDate(this.repoData.value()?.created_at)
  );

  protected readonly updatedDate = computed(() =>
    this.formatDate(this.repoData.value()?.updated_at)
  );

  protected goBack(): void {
    this.location.back();
  }

  private formatDate(iso?: string): string {
    if (!iso) return '—';
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(iso));
  }
}
