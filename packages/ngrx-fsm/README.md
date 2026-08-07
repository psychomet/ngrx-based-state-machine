# ngrx-fsm

**NgRx-based finite state machine for Angular component UI state.**

Register allowed action → state transitions per component. As NgRx actions flow through the store, the machine validates them against that map:

- **Valid** → update the component’s state in a dedicated store slice, then optionally forward the action
- **Invalid** → drop the action (and emit a blocked-transition signal for telemetry)

This scales better than boolean flags (`isLoading`, `isOpen`, `canSubmit`, …) once components grow multiple UI modes.

## Why

At a small scale, booleans are fine. As flows grow (idle → processing → success/retry, expandable panels, parallel cards), booleans become combinatorial and easy to misuse.

`ngrx-fsm` keeps a **single current state per component** and a **transition table** so illegal actions never reach effects/reducers.

Example:

| Current state | Action  | Allowed? | Next state  |
| ------------- | ------- | -------- | ----------- |
| Idle          | Init    | yes      | Processing  |
| Processing    | Init    | no       | _(blocked)_ |
| Processing    | Success | yes      | Completed   |
| Completed     | ReIndex | yes      | Processing  |

## Concepts

| Piece                   | Role                                               |
| ----------------------- | -------------------------------------------------- |
| `ComponentStateBuilder` | Fluent API to declare transitions                  |
| `ComponentStateService` | Registers / unregisters machines; can set state    |
| `ComponentStateMachine` | Custom `ActionsSubject` that intercepts actions    |
| `componentStateReducer` | Store slice keyed by component name                |
| `ComponentStateFacade`  | Selectors helpers (e.g. `processingComponentName`) |
| `ComponentStateEnum`    | Built-in state labels                              |

### Built-in states

```ts
enum ComponentStateEnum {
  Idle = 'idle',
  Processing = 'processing',
  Completed = 'completed',
  Retry = 'retry',
  Maximised = 'maximised',
  Minimised = 'minimised',
  Success = 'success',
  Disabled = 'disabled',
}
```

You can use these as-is or treat them as conventions for your app.

### Transition modes

After a valid transition updates store state:

| Mode            | Builder method     | Behavior                                            |
| --------------- | ------------------ | --------------------------------------------------- |
| **passthrough** | `.passThrough()`   | Forward the original action to reducers/effects     |
| **terminate**   | `.terminate()`     | Update UI state only; do **not** forward the action |
| **transform**   | `.transformTo(fn)` | Dispatch a different action instead                 |

Invalid transitions emit `componentStateTransitionBlocked` (no store state change).

## Installation

```bash
yarn add ngrx-fsm @ngrx/store
# or
npm install ngrx-fsm @ngrx/store
```

Peer dependencies (see `package.json` for exact ranges): `@angular/core`, `@angular/common`, `@ngrx/store`.

## Setup

Replace NgRx’s `ActionsSubject` with `ComponentStateMachine` and register the feature reducer:

```ts
import { bootstrapApplication } from '@angular/platform-browser';
import { ActionsSubject, provideStore } from '@ngrx/store';
import {
  COMPONENT_STATE_FEATURE_KEY,
  ComponentStateBuilder,
  ComponentStateFacade,
  ComponentStateMachine,
  componentStateReducer,
  ComponentStateService,
} from 'ngrx-fsm';

bootstrapApplication(AppComponent, {
  providers: [
    provideStore({
      [COMPONENT_STATE_FEATURE_KEY]: componentStateReducer,
    }),
    ComponentStateFacade,
    ComponentStateBuilder,
    ComponentStateService,
    { provide: ActionsSubject, useClass: ComponentStateMachine },
  ],
});
```

> The machine must be provided as `ActionsSubject` so it can intercept actions before they reach the store.

## Declare transitions

```ts
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateService,
} from 'ngrx-fsm';
import * as UsersActions from './users.actions';

const componentName = 'UsersComponent';

const componentStates = this.componentStateBuilder
  .create(componentName)
  .forAction(UsersActions.initUsers.type)
  .fromState(ComponentStateEnum.Idle)
  .toState(ComponentStateEnum.Processing)
  .passThrough()
  .forAction(UsersActions.loadUsersSuccess.type)
  .fromState(ComponentStateEnum.Processing)
  .toState(ComponentStateEnum.Completed)
  .passThrough()
  .forAction(UsersActions.loadUsersFailure.type)
  .fromState(ComponentStateEnum.Processing)
  .toState(ComponentStateEnum.Idle)
  .passThrough()
  .forAction(UsersActions.reIndexUsers.type)
  .fromState(ComponentStateEnum.Completed)
  .toState(ComponentStateEnum.Processing)
  .passThrough()
  .build();

this.componentStateService.addComponentStates(componentStates);
```

Unregister when the component is destroyed:

```ts
ngOnDestroy(): void {
  this.componentStateService.removeComponentStates(componentName);
}
```

### Builder API

```ts
create(name: string)
withId(id: string | number)           // multi-instance machines
disableWhenProcessing()               // advisory flag for UI
showProgressBar(show: boolean)        // advisory flag for UI
forAction(actionType: string)
fromState(state: ComponentStateEnum)
toState(state: ComponentStateEnum)
passThrough() | terminate() | transformTo(fn)
build()
```

Each `fromState` entry must end with `passThrough()`, `terminate()`, or `transformTo(...)`.

**Multiple `fromState`s for the same action** — call `fromState` again without calling `forAction` again (calling `forAction` resets that action’s map):

```ts
.forAction(lockPanel.type)
.fromState(ComponentStateEnum.Maximised)
.toState(ComponentStateEnum.Disabled)
.terminate()
.fromState(ComponentStateEnum.Minimised)
.toState(ComponentStateEnum.Disabled)
.terminate()
```

### Initial state

Default current state is `Idle` when unset. For UI that starts elsewhere (e.g. minimised panel), set state **after** registration — `addComponentStates()` clears any prior store entry for that name:

```ts
this.componentStateService.addComponentStates(states);
this.componentStateService.updateComponentState(
  componentName,
  ComponentStateEnum.Minimised,
);
```

## Multi-instance machines (`withId`)

When several instances share action types (e.g. three cards), give each a unique machine name **and** an id:

```ts
this.componentStateBuilder
  .create(`UserCard-${id}`)
  .withId(id)
  .forAction(loadCard.type)
  .fromState(ComponentStateEnum.Idle)
  .toState(ComponentStateEnum.Processing)
  .passThrough()
  // ...
  .build();
```

Dispatch actions with a matching `componentStateId`:

```ts
store.dispatch(loadCard({ componentStateId: id }));
```

Only the machine whose `withId` matches will transition.

## Observe UI state

```ts
// Via facade
this.facade.processingComponentName('UsersComponent'); // Observable<boolean>
this.facade.componentState$; // full slice

// Or select the slice directly
this.store.select((s) => s.componentState?.['UsersComponent']);
```

Use that to drive progress bars, disabled buttons, expanded panels, etc.

## Telemetry hooks

Successful transitions dispatch `updateComponentState` with metadata:

- `previousState`, `componentState`
- `triggeredBy` (action type)
- `mode`: `passthrough` | `terminate` | `transform` | …
- `componentStateId` (when applicable)

Blocked transitions dispatch `componentStateTransitionBlocked` (state unchanged).

Listen with `@ngrx/effects` if you want logging, analytics, or a live debug panel (see the showcase app).

## Demo

This repo includes a **showcase** app with interactive use cases and a live FSM telemetry panel:

| Route    | Demonstrates                                   |
| -------- | ---------------------------------------------- |
| `/users` | Idle → Processing → Completed                  |
| `/cards` | Parallel machines + `withId`                   |
| `/form`  | Retry + disable while processing               |
| `/panel` | Maximised / Minimised / Disabled + `terminate` |

```bash
yarn
yarn start
# → http://localhost:4200
```

## How the machine works (summary)

```text
dispatch(action)
       │
       ▼
ComponentStateMachine (ActionsSubject)
       │
       ├─ action not registered → forward as usual
       │
       └─ registered → for each interested component:
              │
              ├─ current state allows transition + id matches
              │     → updateComponentState(...)
              │     → passThrough | terminate | transform
              │
              └─ otherwise
                    → componentStateTransitionBlocked(...)
                    → original action not forwarded
```

## API exports

```ts
// Feature
COMPONENT_STATE_FEATURE_KEY;
componentStateReducer;

// Actions
updateComponentState;
componentStateTransitionBlocked;
passthroughComponentState;
deleteComponentState;

// Runtime
ComponentStateBuilder;
ComponentStateService;
ComponentStateMachine;
ComponentStateFacade;
ComponentStateEnum;
```

## License

See the repository root for license information.
