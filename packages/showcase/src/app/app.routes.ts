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
];
