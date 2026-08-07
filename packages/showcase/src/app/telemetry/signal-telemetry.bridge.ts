import {
  EnvironmentProviders,
  effect,
  inject,
  provideEnvironmentInitializer,
} from '@angular/core';
import { ComponentStateStore } from 'ngrx-fsm-signal';
import { TelemetryService } from './telemetry.service';
import { resolveUseCase } from './telemetry.types';

/**
 * Bridges ngrx-fsm-signal store telemetry into the shared TelemetryService.
 */
export function provideSignalTelemetryBridge(): EnvironmentProviders {
  return provideEnvironmentInitializer(() => {
    const store = inject(ComponentStateStore);
    const telemetry = inject(TelemetryService);
    let lastTransitionKey = '';
    let lastBlockedKey = '';

    effect(() => {
      const t = store.lastTransition();
      if (!t?.triggeredBy) {
        return;
      }
      const key = `${t.componentName}|${t.triggeredBy}|${t.previousState}|${t.componentState}|${t.mode}|${t.componentStateId ?? ''}`;
      if (key === lastTransitionKey) {
        return;
      }
      lastTransitionKey = key;
      telemetry.record({
        useCase: resolveUseCase(t.componentName),
        componentName: t.componentName,
        triggeredBy: t.triggeredBy,
        from: String(t.previousState),
        to: String(t.componentState),
        mode: t.mode === 'blocked' ? 'ignored' : t.mode,
        componentStateId: t.componentStateId,
      });
    });

    effect(() => {
      const b = store.lastBlocked();
      if (!b) {
        return;
      }
      const key = `${b.componentName}|${b.triggeredBy}|${b.previousState}|${b.componentStateId ?? ''}`;
      if (key === lastBlockedKey) {
        return;
      }
      lastBlockedKey = key;
      telemetry.record({
        useCase: resolveUseCase(b.componentName),
        componentName: b.componentName,
        triggeredBy: b.triggeredBy,
        from: String(b.previousState),
        to: String(b.previousState),
        mode: 'ignored',
        componentStateId: b.componentStateId,
      });
    });
  });
}
