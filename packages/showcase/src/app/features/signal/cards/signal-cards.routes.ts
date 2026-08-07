import { Route } from '@angular/router';

export const signalCardsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./signal-cards.component').then((c) => c.SignalCardsComponent),
  },
];
