import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import * as fromPanel from './+state/panel.reducer';
import { PanelEffects } from './+state/panel.effects';

export const panelRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/panel.component').then((c) => c.PanelComponent),
    providers: [
      provideState(fromPanel.PANEL_FEATURE_KEY, fromPanel.panelReducer),
      provideEffects(PanelEffects),
    ],
  },
];
