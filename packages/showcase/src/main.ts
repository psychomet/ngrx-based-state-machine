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
import { importProvidersFrom } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    provideEffects(),
    provideStore({
      [COMPONENT_STATE_FEATURE_KEY]: componentStateReducer,
    }),
    provideRouter(appRoutes, withEnabledBlockingInitialNavigation()),
    importProvidersFrom(BrowserAnimationsModule, HttpClientModule),
    ComponentStateFacade,
    ComponentStateBuilder,
    ComponentStateService,
    { provide: ActionsSubject, useClass: ComponentStateMachine },
  ],
}).catch((err) => console.error(err));
