import { inject, Injectable } from '@angular/core';

import { ComponentStateService } from './component-state.service';
import { ComponentStateEnum } from './component-state.enum';
import {
  BlockedTransitionMeta,
  DispatchResult,
  FsmEvent,
  PASSTHROUGH_EVENT_TYPE,
  TransitionMeta,
} from './component-state.models';
import { ComponentStateStore } from './component-state.store';

type TransitionDef = {
  to?: ComponentStateEnum;
  action?: (...args: unknown[]) => { type: string };
  terminate?: boolean;
};

@Injectable()
export class ComponentStateMachine {
  private readonly store = inject(ComponentStateStore);
  private readonly componentStateService = inject(ComponentStateService);

  /**
   * Process an event through registered transition tables.
   * Callers invoke this explicitly (no ActionsSubject interception).
   */
  public dispatch(event: FsmEvent): DispatchResult {
    const interested = this.componentStateService.componentStates[event.type];

    if (!interested) {
      return {
        allowed: true,
        forwarded: true,
        event,
        transitions: [],
        blocked: [],
      };
    }

    const components = this.store.components();
    const transitions: TransitionMeta[] = [];
    const blocked: BlockedTransitionMeta[] = [];
    let forwardedEvent: FsmEvent | undefined;
    let actionForwarded = false;
    let allowed = false;

    for (const [componentName, value] of Object.entries(interested)) {
      const machine = value as TransitionDef & {
        id?: string | number;
        [state: string]: unknown;
      };

      if (!this.checkValidTransition(event, machine.id)) {
        continue;
      }

      const currentState = (components[componentName] ??
        ComponentStateEnum.Idle) as ComponentStateEnum | string;
      const stateTransition = machine[currentState as string] as
        | TransitionDef
        | undefined;

      if (stateTransition?.to) {
        allowed = true;

        let mode: TransitionMeta['mode'] = 'unknown';
        let nextForward: FsmEvent | undefined;

        if (stateTransition.terminate) {
          mode = 'terminate';
        } else if (stateTransition.action) {
          const args = Object.keys(event)
            .filter((paramKey) => paramKey !== 'type')
            .map((paramKey) => event[paramKey]);
          const transitionAction = stateTransition.action(...args) as FsmEvent;

          if (transitionAction.type === PASSTHROUGH_EVENT_TYPE) {
            mode = 'passthrough';
            nextForward = event;
          } else {
            mode = 'transform';
            nextForward = transitionAction;
          }
        }

        const meta: TransitionMeta = {
          componentName,
          previousState: currentState,
          componentState: stateTransition.to,
          triggeredBy: event.type,
          mode,
          componentStateId: machine.id ?? event.componentStateId,
        };

        this.store.updateComponentState(
          componentName,
          stateTransition.to,
          meta,
        );
        transitions.push(meta);

        if (nextForward && !actionForwarded) {
          forwardedEvent = nextForward;
          actionForwarded = true;
        }
      } else {
        const blockedMeta: BlockedTransitionMeta = {
          componentName,
          previousState: currentState,
          triggeredBy: event.type,
          componentStateId: machine.id ?? event.componentStateId,
        };
        this.store.recordBlocked(blockedMeta);
        blocked.push(blockedMeta);
      }
    }

    return {
      allowed,
      forwarded: actionForwarded,
      event: forwardedEvent,
      transitions,
      blocked,
    };
  }

  /**
   * Dispatch and run `handler` only when the event is forwarded
   * (passthrough or transform).
   */
  public run<T>(
    event: FsmEvent,
    handler: (event: FsmEvent) => T,
  ): T | undefined {
    const result = this.dispatch(event);
    if (result.forwarded && result.event) {
      return handler(result.event);
    }
    return undefined;
  }

  private checkValidTransition(
    event: FsmEvent,
    transitionId?: string | number,
  ) {
    const payload = event['payload'] as
      | { componentStateId?: string | number }
      | undefined;
    const componentStateId =
      event.componentStateId ?? payload?.componentStateId;

    return (
      componentStateId == null ||
      transitionId == null ||
      transitionId === componentStateId
    );
  }
}
