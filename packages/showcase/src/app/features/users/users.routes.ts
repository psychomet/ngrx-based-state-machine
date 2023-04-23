import { Route } from '@angular/router';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import * as fromUsers from './+state/users.reducer';
import { UsersEffects } from './+state/users.effects';
import { UsersService } from './providers';

export const usersRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components').then((c) => c.UsersComponent),
    providers: [
      UsersService,
      provideState(fromUsers.USERS_FEATURE_KEY, fromUsers.usersReducer),
      provideEffects(UsersEffects),
    ],
  },
];
