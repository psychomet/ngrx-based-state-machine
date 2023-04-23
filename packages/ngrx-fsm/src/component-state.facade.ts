import { Injectable, inject } from '@angular/core';
import { select, Store, Action } from '@ngrx/store';

import * as ComponentStateSelectors from './+state/component-state.selectors';
import { map } from 'rxjs/operators';
import { filter } from 'rxjs';
import { ComponentStateState } from './+state/component-state.reducer';
import { ComponentStateEnum } from './component-state.enum';

@Injectable()
export class ComponentStateFacade {
  private readonly store = inject(Store);

  /**
   * Combine pieces of state using createSelector,
   * and expose them as observables through the facade.
   */
  // loaded$ = this.store.pipe(
  //   select(ComponentStateSelectors.selectComponentStateLoaded)
  // );
  componentState$ = this.store.pipe(
    select(ComponentStateSelectors.selectComponentState)
  );
  // selectedComponentState$ = this.store.pipe(
  //   select(ComponentStateSelectors.selectEntity)
  // );

  /**
   * Use the initialization action to perform one
   * or more tasks in your Effects.
   */
  // init() {
  //   this.store.dispatch(ComponentStateActions.initComponentState());
  // }

  processingComponentName(componentName: string) {
    return this.componentState$.pipe(
      filter(
        (state: ComponentStateState) =>
          state && state[componentName] !== undefined
      ),
      map((state: ComponentStateState) => state[componentName]),
      map(
        (componentState: ComponentStateEnum) =>
          componentState === ComponentStateEnum.Processing
      )
    );
  }
}
