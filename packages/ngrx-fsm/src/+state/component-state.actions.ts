import { createAction, props } from '@ngrx/store';

export const updateComponentState = createAction(
  '[ComponentState/API] Update ComponentState',
  props<any>()
);

export const passthroughComponentState = createAction(
  '[ComponentState/API] Passthrough ComponentState'
);

export const deleteComponentState = createAction(
  '[ComponentState/API] Delete ComponentState',
  props<any>()
);
