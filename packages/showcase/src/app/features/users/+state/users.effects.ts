import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, delay, map, of, switchMap } from 'rxjs';
import * as UsersActions from './users.actions';
import { UsersService } from '../providers';

@Injectable()
export class UsersEffects {
  private actions$ = inject(Actions);
  private usersService = inject(UsersService);

  init$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.initUsers),
      switchMap(() =>
        this.usersService
          .getUsers()
          .pipe(map((users) => UsersActions.loadUsersSuccess({ users })))
      ),
      catchError((error) => {
        console.error('Error', error);
        return of(UsersActions.loadUsersFailure({ error }));
      })
    )
  );

  reIndex$ = createEffect(() =>
    this.actions$.pipe(
      ofType(UsersActions.reIndexUsers),
      switchMap(() =>
        this.usersService
          .getUsers()
          .pipe(map((users) => UsersActions.loadUsersSuccess({ users })))
      ),
      catchError((error) => {
        console.error('Error', error);
        return of(UsersActions.loadUsersFailure({ error }));
      })
    )
  );
}
