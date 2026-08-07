import { computed } from '@angular/core';
import {
  patchState,
  signalStore,
  withComputed,
  withMethods,
  withState,
} from '@ngrx/signals';

import { ComponentStateEnum } from './component-state.enum';
import {
  BlockedTransitionMeta,
  ComponentStateMap,
  TransitionMeta,
} from './component-state.models';

type ComponentStateStoreState = {
  components: ComponentStateMap;
  lastTransition: TransitionMeta | null;
  lastBlocked: BlockedTransitionMeta | null;
};

const initialState: ComponentStateStoreState = {
  components: {},
  lastTransition: null,
  lastBlocked: null,
};

export const ComponentStateStore = signalStore(
  withState(initialState),
  withComputed(({ components }) => ({
    componentState: computed(() => components()),
  })),
  withMethods((store) => ({
    updateComponentState(
      componentName: string,
      componentState: ComponentStateEnum | string,
      meta?: TransitionMeta,
    ) {
      patchState(store, (state) => ({
        components: {
          ...state.components,
          [componentName]: componentState,
        },
        lastTransition: meta ?? null,
      }));
    },

    deleteComponentState(componentName: string) {
      patchState(store, (state) => {
        if (!(componentName in state.components)) {
          return state;
        }
        const rest = { ...state.components };
        delete rest[componentName];
        return {
          components: rest,
          lastTransition: null,
        };
      });
    },

    recordBlocked(meta: BlockedTransitionMeta) {
      patchState(store, { lastBlocked: meta });
    },

    clearTelemetry() {
      patchState(store, { lastTransition: null, lastBlocked: null });
    },
  })),
);
