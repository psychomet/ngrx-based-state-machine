import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideRouter,
  withEnabledBlockingInitialNavigation,
} from '@angular/router';
import { appRoutes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { ActionsSubject, provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import {
  COMPONENT_STATE_FEATURE_KEY,
  ComponentStateBuilder,
  ComponentStateFacade,
  ComponentStateMachine,
  componentStateReducer,
  ComponentStateService,
} from 'ngrx-fsm';
import { provideComponentStateFsm } from 'ngrx-fsm-signal';
import { importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { TelemetryEffects } from './app/telemetry/telemetry.effects';
import { provideSignalTelemetryBridge } from './app/telemetry/signal-telemetry.bridge';

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideEffects(TelemetryEffects),
    provideStore({
      [COMPONENT_STATE_FEATURE_KEY]: componentStateReducer,
    }),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    importProvidersFrom(BrowserAnimationsModule, HttpClientModule),
    // Classic store-based FSM (ActionsSubject interception)
    ComponentStateFacade,
    ComponentStateBuilder,
    ComponentStateService,
    { provide: ActionsSubject, useClass: ComponentStateMachine },
    // Signal-based FSM
    provideComponentStateFsm(),
    provideSignalTelemetryBridge(),
  ],
}).catch((err) => console.error(err));
