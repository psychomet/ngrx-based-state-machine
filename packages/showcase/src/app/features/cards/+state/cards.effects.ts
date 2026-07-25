import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, mergeMap, of } from 'rxjs';
import * as CardsActions from './cards.actions';
import { UserInterface } from '../../users/types';

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

@Injectable()
export class CardsEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  loadCard$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CardsActions.loadCard, CardsActions.retryCard),
      mergeMap(({ componentStateId }) =>
        this.http
          .get<DummyJsonUser>(
            `https://dummyjson.com/users/${componentStateId}?select=id,firstName,lastName,username,email`
          )
          .pipe(
            map((user) => {
              const mapped: UserInterface = {
                id: user.id,
                first_name: user.firstName,
                last_name: user.lastName,
                username: user.username,
                email: user.email,
              };
              return CardsActions.loadCardSuccess({
                componentStateId,
                user: mapped,
              });
            }),
            catchError((error) =>
              of(CardsActions.loadCardFailure({ componentStateId, error }))
            )
          )
      )
    )
  );
}
