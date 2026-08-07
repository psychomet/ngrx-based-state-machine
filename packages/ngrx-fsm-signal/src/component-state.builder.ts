import { Injectable } from '@angular/core';

import { ComponentStateEnum } from './component-state.enum';
import { FsmEvent, passthroughComponentState } from './component-state.models';

export interface ComponentState {
  id?: string | number;
  name: string;
  disableWhenProcessing: boolean;
  showProgressBar: boolean;
  states: { [action: string]: ActionState };
}

export interface ActionState {
  [state: string]: Transition;
}

export interface Transition {
  to?: ComponentStateEnum;
  action?: (...args: unknown[]) => FsmEvent | { type: string };
  terminate?: boolean;
}

@Injectable()
export class ComponentStateBuilder {
  private _componentStates!: ComponentState;
  private _currentAction!: string;
  private _currentFromState!: ComponentStateEnum;

  public create(componentName: string) {
    this._currentAction = undefined as never;
    this._currentFromState = undefined as never;
    this._componentStates = {
      name: componentName,
      disableWhenProcessing: false,
      showProgressBar: true,
      states: {},
    };
    return this;
  }

  public withId(id: string | number) {
    this._componentStates.id = id;
    return this;
  }

  public disableWhenProcessing() {
    this._componentStates.disableWhenProcessing = true;
    return this;
  }

  public showProgressBar(showProgressbar: boolean) {
    this._componentStates.showProgressBar = showProgressbar;
    return this;
  }

  public forAction(actionType: string) {
    this._componentStates.states[actionType] = {};
    this._currentAction = actionType;
    return this;
  }

  public fromState(fromState: ComponentStateEnum) {
    this._componentStates.states[this._currentAction][fromState] = {};
    this._currentFromState = fromState;
    return this;
  }

  public toState(toState: ComponentStateEnum) {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].to = toState;
    return this;
  }

  public passThrough() {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].action = passthroughComponentState as Transition['action'];
    return this;
  }

  public terminate() {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].terminate = true;
    return this;
  }

  public transformTo(
    action: (...args: unknown[]) => FsmEvent | { type: string },
  ) {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].action = action;
    return this;
  }

  public build() {
    this.validate(this._componentStates.states);
    return this._componentStates;
  }

  public validate(states: Record<string, ActionState>) {
    for (const [key, value] of Object.entries(states)) {
      for (const actionValue of Object.values(value)) {
        if (!actionValue.action && !actionValue.terminate) {
          throw new Error(
            `The component state change for ${key} is missing a passthrough, transform, or terminate flag`,
          );
        }
      }
    }
  }
}
