import { Route } from '@angular/router';

export const usersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components').then((c) => c.UsersComponent),
  },
];
