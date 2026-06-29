import { Routes } from '@angular/router';

export const routes: Routes = [
  // Redirect bare root to /dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },

  // Dashboard: lazy-loaded so it's its own JS chunk
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
    title: 'Trending Repositories · GitTrend',
  },

  // Project details: :owner and :name become signal inputs on the component
  // via withComponentInputBinding() configured in app.config.ts
  {
    path: 'repos/:owner/:name',
    loadComponent: () =>
      import('./features/project-details/project-details.component').then(
        m => m.ProjectDetailsComponent
      ),
    title: 'Repository Details · GitTrend',
  },

  // Catch-all: anything unknown goes back to the dashboard
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
