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
    path: 'sign-up',
    loadComponent: () =>
      import('./features/sign-up/sign-up.page').then((m) => m.SignUpPage),
  },
  {
    path: 'new-player',
    loadComponent: () =>
      import('./features/new-player/new-player.page').then(
        (m) => m.NewPlayerPage
      ),
  },
  {
    path: 'player-detail/:id',
    loadComponent: () =>
      import('./features/player-detail/player-detail.page').then(
        (m) => m.PlayerDetailPage
      ),
  },
  {
    path: 'new-players-news',
    loadComponent: () =>
      import('./features/new-players-news/new-players-news.page').then(
        (m) => m.NewPlayersNewsPage
      ),
  },
  {
    path: 'players-news',
    loadComponent: () =>
      import('./features/players-news/players-news.page').then(
        (m) => m.PlayersNewsPage
      ),
  },
  {
    path: 'import-players',
    loadComponent: () =>
      import('./features/import-players/import-players.page').then(
        (m) => m.ImportPlayersPage
      ),
  },
  {
    path: 'switch-back',
    loadComponent: () =>
      import('./features/switch-back/switch-back.page').then(
        (m) => m.SwitchBackPage
      ),
  },
];
