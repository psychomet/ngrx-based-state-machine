import { createEntityAdapter, EntityAdapter, EntityState } from '@ngrx/entity';
import { createReducer, on } from '@ngrx/store';
import { UserInterface } from '../../users/types';
import * as CardsActions from './cards.actions';

export const CARDS_FEATURE_KEY = 'cards';

export interface CardsEntity extends UserInterface {
  componentStateId: number;
}

export interface CardsState extends EntityState<CardsEntity> {
  errors: Record<number, string | null>;
}

export const cardsAdapter: EntityAdapter<CardsEntity> =
  createEntityAdapter<CardsEntity>({
    selectId: (entity) => entity.componentStateId,
  });

export const initialCardsState: CardsState = cardsAdapter.getInitialState({
  errors: {},
});

export const cardsReducer = createReducer(
  initialCardsState,
  on(
    CardsActions.loadCard,
    CardsActions.retryCard,
    (state, { componentStateId }) => ({
      ...state,
      errors: { ...state.errors, [componentStateId]: null },
    })
  ),
  on(CardsActions.loadCardSuccess, (state, { componentStateId, user }) =>
    cardsAdapter.upsertOne(
      { ...user, componentStateId },
      {
        ...state,
        errors: { ...state.errors, [componentStateId]: null },
      }
    )
  ),
  on(CardsActions.loadCardFailure, (state, { componentStateId, error }) => ({
    ...state,
    errors: {
      ...state.errors,
      [componentStateId]:
        error instanceof Error ? error.message : 'Failed to load user',
    },
  }))
);
