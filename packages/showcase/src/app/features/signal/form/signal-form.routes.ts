import { Route } from '@angular/router';

export const signalFormRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./signal-form.component').then((c) => c.SignalFormComponent),
  },
];
