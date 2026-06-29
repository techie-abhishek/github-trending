import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-error-state',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex flex-col items-center justify-center py-24 text-center px-4">
      <svg
        class="w-16 h-16 text-slate-300 dark:text-slate-600 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="1.5"
          d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874
             1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
        />
      </svg>

      <h2 class="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
        {{ title() }}
      </h2>

      <p class="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-6">
        {{ message() }}
      </p>

      @if (showRetry()) {
        <button
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg
                 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500
                 focus:ring-offset-2 transition-colors"
          (click)="retry.emit()"
        >
          Try again
        </button>
      }
    </div>
  `,
})
export class ErrorStateComponent {
  readonly title = input<string>('Something went wrong');
  readonly message = input<string>('An error occurred while fetching data. Please try again.');
  readonly showRetry = input<boolean>(true);

  /** Emits when the user clicks "Try again". */
  readonly retry = output<void>();
}
