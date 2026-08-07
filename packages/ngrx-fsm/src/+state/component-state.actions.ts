import { createAction, props } from '@ngrx/store';
import { ComponentStateEnum } from '../component-state.enum';

export type ComponentStateTransitionMode =
  | 'passthrough'
  | 'terminate'
  | 'transform'
  | 'ignored'
  | 'unknown';

export const updateComponentState = createAction(
  '[ComponentState/API] Update ComponentState',
  props<{
    componentName: string;
    componentState: ComponentStateEnum | string;
    previousState?: ComponentStateEnum | string;
    triggeredBy?: string;
    mode?: ComponentStateTransitionMode;
    componentStateId?: string | number;
  }>(),
);

export const componentStateTransitionBlocked = createAction(
  '[ComponentState] Transition Blocked',
  props<{
    componentName: string;
    previousState: ComponentStateEnum | string;
    triggeredBy: string;
    componentStateId?: string | number;
  }>(),
);

export const passthroughComponentState = createAction(
  '[ComponentState/API] Passthrough ComponentState',
);

export const deleteComponentState = createAction(
  '[ComponentState/API] Delete ComponentState',
  props<{ componentName: string }>(),
);
