import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/store/users',
  },
  // Back-compat redirects from previous flat routes
  { path: 'users', redirectTo: '/store/users' },
  { path: 'cards', redirectTo: '/store/cards' },
  { path: 'form', redirectTo: '/store/form' },
  { path: 'panel', redirectTo: '/store/panel' },
  {
    path: 'store/users',
    loadChildren: () =>
      import('./features/users/users.routes').then((r) => r.usersRoutes),
  },
  {
    path: 'store/cards',
    loadChildren: () =>
      import('./features/cards/cards.routes').then((r) => r.cardsRoutes),
  },
  {
    path: 'store/form',
    loadChildren: () =>
      import('./features/form/form.routes').then((r) => r.formRoutes),
  },
  {
    path: 'store/panel',
    loadChildren: () =>
      import('./features/panel/panel.routes').then((r) => r.panelRoutes),
  },
  {
    path: 'signal/users',
    loadChildren: () =>
      import('./features/signal/users/signal-users.routes').then(
        (r) => r.signalUsersRoutes,
      ),
  },
  {
    path: 'signal/cards',
    loadChildren: () =>
      import('./features/signal/cards/signal-cards.routes').then(
        (r) => r.signalCardsRoutes,
      ),
  },
  {
    path: 'signal/form',
    loadChildren: () =>
      import('./features/signal/form/signal-form.routes').then(
        (r) => r.signalFormRoutes,
      ),
  },
  {
    path: 'signal/panel',
    loadChildren: () =>
      import('./features/signal/panel/signal-panel.routes').then(
        (r) => r.signalPanelRoutes,
      ),
  },
];
