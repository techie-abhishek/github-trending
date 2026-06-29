import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withViewTransitions,
} from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { githubInterceptor } from './core/interceptors/github.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    // eventCoalescing batches multiple zone.js events into a single change-detection cycle
    provideZoneChangeDetection({ eventCoalescing: true }),

    provideRouter(
      routes,
      // Binds :owner and :name route params as @Input() / input() on components
      withComponentInputBinding(),
      // Uses the browser's native View Transitions API for cross-route animations
      withViewTransitions()
    ),

    // Register HttpClient with our functional interceptor
    provideHttpClient(withInterceptors([githubInterceptor])),
  ],
};
