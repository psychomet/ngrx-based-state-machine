import { createReducer, on } from '@ngrx/store';
import * as PanelActions from './panel.actions';

export const PANEL_FEATURE_KEY = 'panel';

export interface PanelState {
  quote: string;
}

export const initialPanelState: PanelState = {
  quote: 'Expand the panel, then refresh to load a quote.',
};

export const panelReducer = createReducer(
  initialPanelState,
  on(PanelActions.refreshPanelSuccess, (state, { quote }) => ({
    ...state,
    quote,
  })),
);
