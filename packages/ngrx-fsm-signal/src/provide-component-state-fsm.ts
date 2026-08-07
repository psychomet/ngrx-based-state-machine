import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';

import { ComponentStateBuilder } from './component-state.builder';
import { ComponentStateFacade } from './component-state.facade';
import { ComponentStateMachine } from './component-state.machine';
import { ComponentStateService } from './component-state.service';
import { ComponentStateStore } from './component-state.store';

/** Registers the signal-based FSM providers (SignalStore + runtime services). */
export function provideComponentStateFsm(): EnvironmentProviders {
  return makeEnvironmentProviders([
    ComponentStateStore,
    ComponentStateBuilder,
    ComponentStateService,
    ComponentStateMachine,
    ComponentStateFacade,
  ]);
}
