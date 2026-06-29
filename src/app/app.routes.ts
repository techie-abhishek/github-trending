import { Routes } from '@angular/router';

export const routes: Routes = [

  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },


  {
    path: 'dashboard',
    loadComponent: () =>
      import('./features/dashboard/dashboard.component').then(
        m => m.DashboardComponent
      ),
    title: 'Trending Repositories · GitTrend',
  },



  {
    path: 'repos/:owner/:name',
    loadComponent: () =>
      import('./features/project-details/project-details.component').then(
        m => m.ProjectDetailsComponent
      ),
    title: 'Repository Details · GitTrend',
  },


  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
