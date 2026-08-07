import { computed, inject, Injectable, Signal } from '@angular/core';

import { ComponentStateEnum } from './component-state.enum';
import {
  BlockedTransitionMeta,
  ComponentStateMap,
  TransitionMeta,
} from './component-state.models';
import { ComponentStateStore } from './component-state.store';

@Injectable()
export class ComponentStateFacade {
  private readonly store = inject(ComponentStateStore);

  /** Full component-name → state map as a signal. */
  readonly componentState: Signal<ComponentStateMap> =
    this.store.componentState;

  /** Most recent successful transition (telemetry). */
  readonly lastTransition: Signal<TransitionMeta | null> =
    this.store.lastTransition;

  /** Most recent blocked transition (telemetry). */
  readonly lastBlocked: Signal<BlockedTransitionMeta | null> =
    this.store.lastBlocked;

  /** Whether the named component is currently `Processing`. */
  processing(componentName: string): Signal<boolean> {
    return computed(
      () =>
        this.store.components()[componentName] ===
        ComponentStateEnum.Processing,
    );
  }

  /** Current state for a component (defaults to Idle when unset). */
  stateOf(componentName: string): Signal<ComponentStateEnum | string> {
    return computed(
      () => this.store.components()[componentName] ?? ComponentStateEnum.Idle,
    );
  }
}
