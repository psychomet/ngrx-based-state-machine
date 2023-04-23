import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { forOwn, isEmpty } from 'lodash';
import * as ComponentStateActions from './+state/component-state.actions';
import { ComponentStateState } from './+state/component-state.reducer';
import { ComponentStateEnum } from './component-state.enum';

@Injectable()
export class ComponentStateService {
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>
  );
  public componentStates: any = {};

  constructor() {}

  public addComponentStates(componentStateData: any) {
    this.deleteComponentState(componentStateData.name);
    forOwn(componentStateData.states, (value: any, key: string) => {
      if (!this.componentStates[key]) {
        this.componentStates[key] = {};
      }
      if (!this.componentStates[key][componentStateData.name]) {
        if (componentStateData.id) {
          value.id = componentStateData.id;
        }
        this.componentStates[key][componentStateData.name] = value;
      }
    });
  }

  public removeComponentStates(componentName: string) {
    forOwn(this.componentStates, (value: any, key: string) => {
      if (value[componentName]) {
        delete this.componentStates[key][componentName];
      }
      if (isEmpty(this.componentStates[key])) {
        delete this.componentStates[key];
      }
    });
    this.deleteComponentState(componentName);
  }

  public updateComponentState(
    componentName: string,
    componentState: ComponentStateEnum
  ) {
    this.store.dispatch(
      ComponentStateActions.updateComponentState({
        componentName,
        componentState,
      })
    );
  }

  public deleteComponentState(componentName: string) {
    this.store.dispatch(
      ComponentStateActions.deleteComponentState({ componentName })
    );
  }
}
