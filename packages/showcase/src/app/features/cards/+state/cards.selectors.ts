import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CARDS_FEATURE_KEY, cardsAdapter, CardsState } from './cards.reducer';

export const selectCardsState =
  createFeatureSelector<CardsState>(CARDS_FEATURE_KEY);

const { selectEntities } = cardsAdapter.getSelectors();

export const selectCardEntities = createSelector(
  selectCardsState,
  selectEntities,
);

export const selectCardById = (id: number) =>
  createSelector(selectCardEntities, (entities) => entities[id] ?? null);

export const selectCardError = (id: number) =>
  createSelector(selectCardsState, (state) => state.errors[id] ?? null);
