import {
  ChangeDetectionStrategy,
  Component,
  input,
  computed,
} from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';
import { Repository } from '../../core/models/repository.model';
import { getLanguageColor, formatCount } from '../language-colors';

@Component({
  selector: 'app-repo-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article
      class="group flex flex-col h-full bg-white dark:bg-slate-800 border border-slate-200
             dark:border-slate-700 rounded-xl p-5 cursor-pointer
             hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
      (click)="navigate()"
      (keydown.enter)="navigate()"
      tabindex="0"
      [attr.aria-label]="'View details for ' + repo().full_name"
      role="button"
    >
      <!-- Owner avatar + name -->
      <div class="flex items-center gap-3 mb-3">
        <img
          [src]="repo().owner.avatar_url"
          [alt]="repo().owner.login + ' avatar'"
          class="w-8 h-8 rounded-full ring-1 ring-slate-200 dark:ring-slate-600"
          loading="lazy"
        />
        <span class="text-sm text-slate-500 dark:text-slate-400 truncate">
          {{ repo().owner.login }}
        </span>
      </div>

      <!-- Repo name -->
      <h2
        class="text-base font-semibold text-slate-900 dark:text-white mb-2
               group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate"
      >
        {{ repo().name }}
      </h2>

      <!-- Description -->
      <p class="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 flex-1 mb-4">
        {{ repo().description || 'No description provided.' }}
      </p>

      <!-- Stats row -->
      <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-auto">
        <!-- Language badge -->
        @if (repo().language) {
          <span class="flex items-center gap-1.5">
            <span
              class="w-3 h-3 rounded-full flex-shrink-0"
              [style.background-color]="languageColor()"
            ></span>
            {{ repo().language }}
          </span>
        }

        <!-- Stars -->
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Z"/>
          </svg>
          <span [attr.aria-label]="starsFormatted() + ' stars'">{{ starsFormatted() }}</span>
        </span>

        <!-- Forks -->
        <span class="flex items-center gap-1">
          <svg class="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>
          </svg>
          <span [attr.aria-label]="forksFormatted() + ' forks'">{{ forksFormatted() }}</span>
        </span>
      </div>
    </article>
  `,
})
export class RepoCardComponent {
  /** The repository to display — passed in from the parent via input() signal. */
  readonly repo = input.required<Repository>();

  private readonly router = inject(Router);

  // Derived values — recomputed automatically when repo() changes
  readonly languageColor = computed(() => getLanguageColor(this.repo().language));
  readonly starsFormatted = computed(() => formatCount(this.repo().stargazers_count));
  readonly forksFormatted = computed(() => formatCount(this.repo().forks_count));

  navigate(): void {
    const { owner, name } = this.repo();
    this.router.navigate(['/repos', owner.login, name]);
  }
}
