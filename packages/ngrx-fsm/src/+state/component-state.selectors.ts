import { createFeatureSelector, createSelector } from '@ngrx/store';
import {
  COMPONENT_STATE_FEATURE_KEY,
  ComponentStateState,
} from './component-state.reducer';

// Lookup the 'ComponentState' feature state managed by NgRx
export const selectComponentStateState =
  createFeatureSelector<ComponentStateState>(COMPONENT_STATE_FEATURE_KEY);

// const { selectAll, selectEntities } = componentStateAdapter.getSelectors();

export const selectComponentState = createSelector(
  selectComponentStateState,
  (state: ComponentStateState) => state
);
