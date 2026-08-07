import { Route } from '@angular/router';

export const signalUsersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./signal-users.component').then((c) => c.SignalUsersComponent),
  },
];
