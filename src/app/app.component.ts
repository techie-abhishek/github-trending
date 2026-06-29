import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink],
  template: `
    <div class="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">

      <!-- Top navigation bar -->
      <nav
        class="sticky top-0 z-50 border-b border-slate-200 dark:border-slate-800
               bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm"
        aria-label="Main navigation"
      >
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">

          <!-- Brand -->
          <a
            routerLink="/dashboard"
            class="flex items-center gap-2 font-semibold text-slate-900 dark:text-white
                   hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            aria-label="GitTrend home"
          >
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z"/>
            </svg>
            GitTrend
          </a>

          <!-- Dark mode toggle -->
          <button
            class="p-2 rounded-lg text-slate-500 dark:text-slate-400
                   hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            (click)="toggleDarkMode()"
            [attr.aria-label]="isDark() ? 'Switch to light mode' : 'Switch to dark mode'"
            [attr.aria-pressed]="isDark()"
          >
            @if (isDark()) {
              <!-- Sun icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z"/>
              </svg>
            } @else {
              <!-- Moon icon -->
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"/>
              </svg>
            }
          </button>
        </div>
      </nav>

      <!-- Routed page content -->
      <router-outlet />
    </div>
  `,
})
export class AppComponent implements OnInit {
  protected readonly isDark = signal(false);

  ngOnInit(): void {
    // Restore the user's saved preference across sessions
    const saved = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const dark = saved ? saved === 'dark' : prefersDark;
    this.applyTheme(dark);
  }

  protected toggleDarkMode(): void {
    this.applyTheme(!this.isDark());
  }

  private applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    // Tailwind's `class` dark-mode strategy: adding "dark" to <html> enables dark variants
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }
}
