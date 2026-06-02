import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';

export const routes: Routes = [
  {
    path: 'tabs',
    component: TabsPage,
    children: [
      {
        path: 'my-team',
        loadComponent: () =>
          import('./my-team/my-team.page').then((m) => m.MyTeamPage),
      },
      {
        path: 'players',
        loadComponent: () =>
          import('./players/players.page').then((m) => m.PlayersPage),
      },
      {
        path: 'news',
        loadComponent: () => import('./news/news.page').then((m) => m.NewsPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('./settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: '/tabs/players',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/tabs/players',
    pathMatch: 'full',
  },
  {
    path: 'news',
    loadComponent: () => import('./news/news.page').then((m) => m.NewsPage),
  },
];
