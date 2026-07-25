import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import * as fromForm from './+state/form.reducer';
import { FormEffects } from './+state/form.effects';

export const formRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./components/form.component').then((c) => c.FormComponent),
    providers: [
      provideState(fromForm.FORM_FEATURE_KEY, fromForm.formReducer),
      provideEffects(FormEffects),
    ],
  },
];
