import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { delay, map, of, switchMap } from 'rxjs';
import * as FormActions from './form.actions';

@Injectable()
export class FormEffects {
  private readonly actions$ = inject(Actions);

  submit$ = createEffect(() =>
    this.actions$.pipe(
      ofType(FormActions.submitForm, FormActions.retryForm),
      switchMap(({ name, email, forceFail }) =>
        of(null).pipe(
          delay(900),
          map(() => {
            if (forceFail || email.toLowerCase().includes('fail')) {
              return FormActions.submitFormFailure({
                error: 'Simulated API failure. Fix the email or retry.',
              });
            }
            return FormActions.submitFormSuccess({ name, email });
          }),
        ),
      ),
    ),
  );
}
