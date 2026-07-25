import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { tap } from 'rxjs';
import {
  componentStateTransitionBlocked,
  updateComponentState,
} from 'ngrx-fsm';
import { TelemetryService } from './telemetry.service';
import { resolveUseCase } from './telemetry.types';

@Injectable()
export class TelemetryEffects {
  private readonly actions$ = inject(Actions);
  private readonly telemetry = inject(TelemetryService);

  trackTransitions$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(updateComponentState),
        tap(
          ({
            componentName,
            componentState,
            previousState,
            triggeredBy,
            mode,
            componentStateId,
          }) => {
            // Skip pure registration/bootstrap writes that have no trigger metadata.
            if (!triggeredBy) {
              return;
            }

            this.telemetry.record({
              useCase: resolveUseCase(componentName),
              componentName,
              triggeredBy,
              from: String(previousState ?? 'unknown'),
              to: String(componentState),
              mode: mode ?? 'unknown',
              componentStateId,
            });
          }
        )
      ),
    { dispatch: false }
  );

  trackBlocked$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(componentStateTransitionBlocked),
        tap(
          ({ componentName, previousState, triggeredBy, componentStateId }) => {
            this.telemetry.record({
              useCase: resolveUseCase(componentName),
              componentName,
              triggeredBy,
              from: String(previousState),
              to: String(previousState),
              mode: 'ignored',
              componentStateId,
            });
          }
        )
      ),
    { dispatch: false }
  );
}
