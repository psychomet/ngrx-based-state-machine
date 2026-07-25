import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/users',
  },
  {
    path: 'users',
    loadChildren: () =>
      import('./features/users/users.routes').then((r) => r.usersRoutes),
  },
  {
    path: 'cards',
    loadChildren: () =>
      import('./features/cards/cards.routes').then((r) => r.cardsRoutes),
  },
  {
    path: 'form',
    loadChildren: () =>
      import('./features/form/form.routes').then((r) => r.formRoutes),
  },
  {
    path: 'panel',
    loadChildren: () =>
      import('./features/panel/panel.routes').then((r) => r.panelRoutes),
  },
];
