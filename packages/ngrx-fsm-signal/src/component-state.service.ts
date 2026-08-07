import { inject, Injectable } from '@angular/core';

import { ComponentState } from './component-state.builder';
import { ComponentStateEnum } from './component-state.enum';
import { ComponentStateStore } from './component-state.store';

@Injectable()
export class ComponentStateService {
  private readonly store = inject(ComponentStateStore);

  /** actionType → componentName → transition map (+ optional id) */
  public componentStates: Record<
    string,
    Record<string, Record<string, unknown> & { id?: string | number }>
  > = {};

  public addComponentStates(componentStateData: ComponentState) {
    this.deleteComponentState(componentStateData.name);
    for (const [key, value] of Object.entries(componentStateData.states) as [
      string,
      Record<string, unknown> & { id?: string | number },
    ][]) {
      if (!this.componentStates[key]) {
        this.componentStates[key] = {};
      }
      if (!this.componentStates[key][componentStateData.name]) {
        if (componentStateData.id != null) {
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
    componentState: ComponentStateEnum,
  ) {
    this.store.updateComponentState(componentName, componentState);
  }

  public deleteComponentState(componentName: string) {
    this.store.deleteComponentState(componentName);
  }
}
