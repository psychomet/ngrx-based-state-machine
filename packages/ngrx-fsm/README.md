# ngrx-fsm

**NGRX BASED FINITE STATE MACHINE**

This library was generated with [Nx](https://nx.dev).

Creating a Finite State Machine for handling component state in an Angular app.

We were finding the use of boolean flags to dictate which state a particular component was in was ok at a very simple level, but as the app grew, and more complex components were added, it didn't scale well.

What we wanted was a way of components registering a map of valid transitions. Then as actions are emitted they are checked against this map. If valid, the components current state is updated in a special UIState slice of the store and the action is passed trough. If not a valid transition for the given component the action is dropped. For example:

- An 'Add Book' component, can be in a state of Idle, Processing, or Errored
- An AddBookAction causes it to transition from Idle to Processing.
- This transition is only allowed if the component is currently Idle. If the component is Processing then the transition should be disallowed

### 🎰 Working with a state machine

<p align="center">
  <a href="http://ng.ant.design">
    <img src="https://krasimirtsonev.com/blog/article/managing-state-in-javascript-with-state-machines-stent/assets/table.jpg">
  </a>
</p>

### 📦 Installation

**We recommend using `@angular/cli` to install**. It not only makes development easier, but also allows you to take advantage of the rich ecosystem of angular packages and tooling.

```bash
$ ng new PROJECT_NAME
$ cd PROJECT_NAME
$ yarn add @ngrx/store
$ yarn add ngrx-fsm
```

### Provide the and NgRx ActionsSubject ComponentStateBuilder

```ts
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
}).catch((err) => console.error(err));
```

### Fluent style builder setup for a given component

```ts

// With the fluent builder, component states can be specified like this ...

const componentStates = this.componentStateBuilder
    .create('userApproval')
    .forAction(actionTypes.loadUnapprovedUsers)
    .fromState(ComponentStates.Idle)
    .toState(ComponentStates.Processing
        .passThrough()
        .forAction(actionTypes.loadUnapprovedUsersSuccess)
        .fromState(ComponentStates.Processing)
        .toState(ComponentStates.Idle)
        .passThrough()
        .forAction(actionTypes.loadUnapprovedUsersError)
        .fromState(ComponentStates.Processing)
        .toState(ComponentStates.Idle)
        .terminate()

// the component uses an injected componentStateService to register its state transitions

this.componentStateService.addComponentStates(componentStates);
```

## Demo was a better approach

So, run showcase project on stackblitz WIP you can clone a repo then:

Run `yarn start` to execute the showcase demo.

[//]: # 'So, here it state machine in action at: [Stackblitz Demo](https://stackblitz.com/edit/ng-met-antd-datepicker)'
