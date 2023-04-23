import { createReducer, on, Action } from '@ngrx/store';

import * as ComponentStateActions from './component-state.actions';

export const COMPONENT_STATE_FEATURE_KEY = 'componentState';

export interface ComponentStateState {
  [index: string]: any;
}

// export interface ComponentStatePartialState {
//   readonly [COMPONENT_STATE_FEATURE_KEY]: ComponentStateState;
// }

// export const componentStateAdapter: EntityAdapter<ComponentStateEntity> =
//   createEntityAdapter<ComponentStateEntity>();

export const initialComponentStateState: ComponentStateState = {};

const reducer = createReducer(
  initialComponentStateState,
  on(
    ComponentStateActions.updateComponentState,
    (state, { componentName, componentState }) => ({
      ...Object.assign({}, state),
      [componentName]: componentState,
    })
  ),
  on(ComponentStateActions.deleteComponentState, (state, { componentName }) => {
    const newState = Object.assign({}, state);
    if (state[componentName]) {
      delete newState[componentName];
    }
    return newState;
  })
);

export function componentStateReducer(
  state: ComponentStateState | undefined,
  action: Action
) {
  return reducer(state, action);
}
