import { ComponentStateEnum } from './component-state.enum';

export type ComponentStateTransitionMode =
  | 'passthrough'
  | 'terminate'
  | 'transform'
  | 'blocked'
  | 'ignored'
  | 'unknown';

/** Event shape processed by the signal FSM (action-type based). */
export interface FsmEvent {
  type: string;
  componentStateId?: string | number;
  [key: string]: unknown;
}

export interface TransitionMeta {
  componentName: string;
  previousState: ComponentStateEnum | string;
  componentState: ComponentStateEnum | string;
  triggeredBy: string;
  mode: ComponentStateTransitionMode;
  componentStateId?: string | number;
}

export interface BlockedTransitionMeta {
  componentName: string;
  previousState: ComponentStateEnum | string;
  triggeredBy: string;
  componentStateId?: string | number;
}

export interface ComponentStateMap {
  [componentName: string]: ComponentStateEnum | string;
}

export interface DispatchResult {
  /** True when at least one registered machine accepted the event. */
  allowed: boolean;
  /** True when the original (or transformed) event should be executed by the caller. */
  forwarded: boolean;
  /** Event to run when `forwarded` is true (passthrough or transform). */
  event?: FsmEvent;
  transitions: TransitionMeta[];
  blocked: BlockedTransitionMeta[];
}

export const PASSTHROUGH_EVENT_TYPE =
  '[ComponentState/API] Passthrough ComponentState';

export function passthroughComponentState(...args: unknown[]): {
  type: string;
} {
  void args;
  return { type: PASSTHROUGH_EVENT_TYPE };
}
