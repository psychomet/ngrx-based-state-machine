import { inject, Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import * as ComponentStateActions from './+state/component-state.actions';
import { ComponentStateState } from './+state/component-state.reducer';
import { ComponentStateEnum } from './component-state.enum';

@Injectable()
export class ComponentStateService {
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>
  );
  public componentStates: any = {};

  public addComponentStates(componentStateData: any) {
    this.deleteComponentState(componentStateData.name);
    for (const [key, value] of Object.entries(componentStateData.states) as [
      string,
      any
    ][]) {
      if (!this.componentStates[key]) {
        this.componentStates[key] = {};
      }
      if (!this.componentStates[key][componentStateData.name]) {
        if (componentStateData.id) {
          value.id = componentStateData.id;
        }
        this.componentStates[key][componentStateData.name] = value;
      }
    }
  }

  public removeComponentStates(componentName: string) {
    for (const key of Object.keys(this.componentStates)) {
      const value = this.componentStates[key];
      if (value[componentName]) {
        delete this.componentStates[key][componentName];
      }
      if (Object.keys(this.componentStates[key]).length === 0) {
        delete this.componentStates[key];
      }
    }
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
