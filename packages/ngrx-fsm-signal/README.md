# ngrx-fsm-signal

**NgRx SignalStore finite state machine for Angular component UI state.**

Same idea as [`ngrx-fsm`](../ngrx-fsm): declare allowed event → state transitions per component. Instead of intercepting `@ngrx/store` actions via `ActionsSubject`, you call `ComponentStateMachine.dispatch()` / `.run()` and state lives in an `@ngrx/signals` `signalStore`.

- **Valid** → update the component’s state signal, optionally forward / transform the event for your handler
- **Invalid** → block the event and record blocked telemetry on the store

## Why signals?

Use this package when your app is on `@ngrx/signals` (or mixed) and you do not want a global `ActionsSubject` swap. The fluent builder API matches `ngrx-fsm` so migration between the two is straightforward.

## Installation

```bash
yarn add ngrx-fsm-signal @ngrx/signals
# or
npm install ngrx-fsm-signal @ngrx/signals
```

Peer dependencies: `@angular/core`, `@angular/common`, `@ngrx/signals`.

## Setup

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import {
  provideComponentStateFsm,
  ComponentStateBuilder,
  ComponentStateService,
  ComponentStateMachine,
  ComponentStateFacade,
} from 'ngrx-fsm-signal';

bootstrapApplication(AppComponent, {
  providers: [provideComponentStateFsm()],
});
```

## Declare transitions

```ts
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateService,
} from 'ngrx-fsm-signal';

const componentName = 'UsersComponent';

const componentStates = this.componentStateBuilder
  .create(componentName)
  .forAction('users/init')
  .fromState(ComponentStateEnum.Idle)
  .toState(ComponentStateEnum.Processing)
  .passThrough()
  .forAction('users/loadSuccess')
  .fromState(ComponentStateEnum.Processing)
  .toState(ComponentStateEnum.Completed)
  .passThrough()
  .build();

this.componentStateService.addComponentStates(componentStates);
```

Unregister on destroy:

```ts
ngOnDestroy(): void {
  this.componentStateService.removeComponentStates(componentName);
}
```

## Dispatch events

```ts
import { ComponentStateMachine } from 'ngrx-fsm-signal';

// Option A — inspect the result
const result = this.machine.dispatch({ type: 'users/init' });
if (result.forwarded) {
  this.loadUsers();
}

// Option B — run handler only when forwarded (passthrough / transform)
this.machine.run({ type: 'users/init' }, () => this.loadUsers());
```

### Modes

| Mode            | Builder            | Behavior                                               |
| --------------- | ------------------ | ------------------------------------------------------ |
| **passthrough** | `.passThrough()`   | Transition + `forwarded: true` with the original event |
| **terminate**   | `.terminate()`     | Transition only; do not run side effects               |
| **transform**   | `.transformTo(fn)` | Transition + forward the event returned by `fn`        |

Blocked transitions set `lastBlocked` on the signal store (state unchanged).

## Observe UI state (signals)

```ts
readonly processing = this.facade.processing('UsersComponent');
readonly state = this.facade.stateOf('UsersComponent');
readonly all = this.facade.componentState; // Signal<ComponentStateMap>

// Telemetry
readonly lastTransition = this.facade.lastTransition;
readonly lastBlocked = this.facade.lastBlocked;
```

## Multi-instance (`withId`)

```ts
this.componentStateBuilder
  .create(`UserCard-${id}`)
  .withId(id)
  .forAction('card/load')
  .fromState(ComponentStateEnum.Idle)
  .toState(ComponentStateEnum.Processing)
  .passThrough()
  .build();

this.machine.dispatch({ type: 'card/load', componentStateId: id });
```

## API exports

```ts
provideComponentStateFsm;
ComponentStateStore;
ComponentStateBuilder;
ComponentStateService;
ComponentStateMachine;
ComponentStateFacade;
ComponentStateEnum;
passthroughComponentState;
PASSTHROUGH_EVENT_TYPE;
```

## License

See the repository root for license information.
