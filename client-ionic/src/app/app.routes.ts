import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadChildren: () =>
      import('./features/tabs/tabs.routes').then((m) => m.routes),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'sign-in',
    loadComponent: () =>
      import('./features/sign-in/sign-in.page').then((m) => m.SignInPage),
  },
  {
    path: 'new-player',
    loadComponent: () =>
      import('./features/new-player/new-player.page').then(
        (m) => m.NewPlayerPage,
      ),
  },
  {
    path: 'player-detail',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then(
        (m) => m.PlayerDetailPage,
      ),
  },
  {
    path: 'new-players-news',
    loadComponent: () =>
      import('./features/new-players-news/new-players-news.page').then(
        (m) => m.NewPlayersNewsPage,
      ),
  },
  {
    path: 'create-players-news',
    loadComponent: () =>
      import('./features/create-players-news/create-players-news.page').then(
        (m) => m.CreatePlayersNewsPage,
      ),
  },
];
