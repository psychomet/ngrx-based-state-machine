import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import * as fromCards from './+state/cards.reducer';
import { CardsEffects } from './+state/cards.effects';

export const cardsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/cards.component').then((c) => c.CardsComponent),
    providers: [
      provideState(fromCards.CARDS_FEATURE_KEY, fromCards.cardsReducer),
      provideEffects(CardsEffects),
    ],
  },
];
