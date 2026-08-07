import { Route } from '@angular/router';

export const signalPanelRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./signal-panel.component').then((c) => c.SignalPanelComponent),
  },
];
