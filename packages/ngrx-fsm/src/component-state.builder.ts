import { forOwn } from 'lodash';
import { Injectable } from '@angular/core';

import { passthroughComponentState } from './+state/component-state.actions';
import { ComponentStateEnum } from './component-state.enum';

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
  action?: Function;
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
    ].action = passthroughComponentState;
    return this;
  }

  public terminate() {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].terminate = true;
    return this;
  }

  public transformTo(action: Function) {
    this._componentStates.states[this._currentAction][
      this._currentFromState
    ].action = action;
    return this;
  }

  public build() {
    this.validate(this._componentStates.states);
    return this._componentStates;
  }

  public validate(states: any) {
    forOwn(states, (value: any, key: string) => {
      forOwn(value, (actionValue: any, actionKey: string) => {
        if (!actionValue.action && !actionValue.terminate) {
          throw new Error(
            `The component state change for ${key} is missing a passthrough, transform, or terminate flag`
          );
        }
      });
    });
  }
}
