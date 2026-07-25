import { createFeatureSelector, createSelector } from '@ngrx/store';
import { PANEL_FEATURE_KEY, PanelState } from './panel.reducer';

export const selectPanelState =
  createFeatureSelector<PanelState>(PANEL_FEATURE_KEY);

export const selectPanelQuote = createSelector(
  selectPanelState,
  (state) => state.quote
);
