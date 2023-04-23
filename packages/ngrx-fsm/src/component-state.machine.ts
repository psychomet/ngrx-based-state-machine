import { Injectable, Injector } from '@angular/core';
import { Store, ActionsSubject } from '@ngrx/store';
import { forOwn, filter } from 'lodash';
import { take } from 'rxjs/operators';

import { ComponentStateService } from './component-state.service';
import { ComponentStateState } from './+state/component-state.reducer';
import * as ComponentStateActions from './+state/component-state.actions';
import { ComponentStateEnum } from './component-state.enum';

@Injectable()
export class ComponentStateMachine extends ActionsSubject {
  private _store!: Store<{ componentState: ComponentStateState }>;
  private _componentStateService!: ComponentStateService;

  constructor(private _injector: Injector) {
    super();
  }
  public override next(action: any) {
    if (!this._store) {
      this._store = <Store<{ componentState: ComponentStateState }>>(
        this._injector.get(Store)
      );
      this._componentStateService = <ComponentStateService>(
        this._injector.get(ComponentStateService)
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
        forOwn(stateMachine, (value, key) => {
          // for each entry check what the current state of the component is
          const currentState = componentState[key]
            ? componentState[key]
            : ComponentStateEnum.Idle;
          const stateTransition = stateMachine[key][currentState];
          if (
            stateTransition &&
            this.checkValidTransition(action.payload, value.id)
          ) {
            // set the new state from the given component
            const newState = stateTransition.to;
            super.next(
              ComponentStateActions.updateComponentState({
                componentName: key,
                componentState: newState,
              })
            );
            if (stateTransition.action) {
              // process the action by either transforming to another action or passing through
              const args = filter(action, (param: any, paramKey: any) => {
                return paramKey !== 'type';
              });

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
          }
        });
      });
  }

  private checkValidTransition(actionPayload: any, transitionId: number) {
    return (
      !actionPayload ||
      !actionPayload.componentStateId ||
      (actionPayload.componentStateId && !transitionId) ||
      (actionPayload.componentStateId &&
        transitionId === actionPayload.componentStateId)
    );
  }
}
