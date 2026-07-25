import { createAction, props } from '@ngrx/store';
import { UserInterface } from '../../users/types';

export const loadCard = createAction(
  '[Cards] Load Card',
  props<{ componentStateId: number }>()
);

export const loadCardSuccess = createAction(
  '[Cards] Load Card Success',
  props<{ componentStateId: number; user: UserInterface }>()
);

export const loadCardFailure = createAction(
  '[Cards] Load Card Failure',
  props<{ componentStateId: number; error: unknown }>()
);

export const retryCard = createAction(
  '[Cards] Retry Card',
  props<{ componentStateId: number }>()
);
