import { Injectable, Injector, inject } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { take } from 'rxjs/operators';

import { ComponentStateService } from './component-state.service';
import { ComponentStateState } from './+state/component-state.reducer';
import * as ComponentStateActions from './+state/component-state.actions';
import { ComponentStateEnum } from './component-state.enum';

@Injectable()
export class ComponentStateMachine extends ActionsSubject {
  private readonly injector = inject(Injector);
  private _store!: Store<{ componentState: ComponentStateState }>;
  private _componentStateService!: ComponentStateService;

  public override next(action: any) {
    if (!this._store) {
      this._store = <Store<{ componentState: ComponentStateState }>>(
        this.injector.get(Store)
      );
      this._componentStateService = <ComponentStateService>(
        this.injector.get(ComponentStateService)
      );
    }
    // check if the any components have registered an interest in this component
    if (this._componentStateService.componentStates[action.type]) {
      this.processAction(action);
    } else {
      // no components are interested in this action so just pass on
      super.next(action);
    }
  }

  private processAction(action: any) {
    // a the current slice of the ui state from the store
    this._store
      .select((state) => state.componentState)
      .pipe(take(1))
      .subscribe((componentState: ComponentStateState) => {
        // now get the details from the stateMachine service about which components
        // are interested in this action
        const stateMachine =
          this._componentStateService.componentStates[action.type];
        let actionForwarded = false;
        for (const [key, value] of Object.entries(stateMachine) as [
          string,
          any
        ][]) {
          // for each entry check what the current state of the component is
          const currentState = componentState[key]
            ? componentState[key]
            : ComponentStateEnum.Idle;
          const stateTransition = stateMachine[key][currentState];
          if (stateTransition && this.checkValidTransition(action, value.id)) {
            const newState = stateTransition.to;
            const mode = stateTransition.terminate
              ? 'terminate'
              : stateTransition.action ===
                ComponentStateActions.passthroughComponentState
              ? 'passthrough'
              : stateTransition.action
              ? 'transform'
              : 'unknown';

            super.next(
              ComponentStateActions.updateComponentState({
                componentName: key,
                componentState: newState,
                previousState: currentState,
                triggeredBy: action.type,
                mode,
                componentStateId: value.id ?? action.componentStateId,
              })
            );
            if (stateTransition.action) {
              // process the action by either transforming to another action or passing through
              const args = Object.keys(action)
                .filter((paramKey) => paramKey !== 'type')
                .map((paramKey) => action[paramKey]);

              const transitionAction = stateTransition.action(...args);
              if (
                transitionAction.type ===
                ComponentStateActions.passthroughComponentState.type
              ) {
                if (!actionForwarded) {
                  super.next(action);
                  actionForwarded = true;
                }
              } else {
                super.next(transitionAction);
              }
            }
          } else if (this.checkValidTransition(action, value.id)) {
            super.next(
              ComponentStateActions.componentStateTransitionBlocked({
                componentName: key,
                previousState: currentState,
                triggeredBy: action.type,
                componentStateId: value.id ?? action.componentStateId,
              })
            );
          }
        }
      });
  }

  private checkValidTransition(action: any, transitionId?: string | number) {
    const componentStateId =
      action?.componentStateId ?? action?.payload?.componentStateId;

    return (
      componentStateId == null ||
      transitionId == null ||
      transitionId === componentStateId
    );
  }
}
