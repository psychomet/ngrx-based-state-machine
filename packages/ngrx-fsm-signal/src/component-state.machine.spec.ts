import { TestBed } from '@angular/core/testing';

import { ComponentStateBuilder } from './component-state.builder';
import { ComponentStateEnum } from './component-state.enum';
import { ComponentStateFacade } from './component-state.facade';
import { ComponentStateMachine } from './component-state.machine';
import { ComponentStateService } from './component-state.service';
import { provideComponentStateFsm } from './provide-component-state-fsm';

describe('ngrx-fsm-signal', () => {
  let builder: ComponentStateBuilder;
  let service: ComponentStateService;
  let machine: ComponentStateMachine;
  let facade: ComponentStateFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideComponentStateFsm()],
    });
    builder = TestBed.inject(ComponentStateBuilder);
    service = TestBed.inject(ComponentStateService);
    machine = TestBed.inject(ComponentStateMachine);
    facade = TestBed.inject(ComponentStateFacade);
  });

  it('transitions Idle → Processing on passthrough and forwards the event', () => {
    const states = builder
      .create('Users')
      .forAction('users/init')
      .fromState(ComponentStateEnum.Idle)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .build();

    service.addComponentStates(states);

    const result = machine.dispatch({ type: 'users/init' });

    expect(result.allowed).toBe(true);
    expect(result.forwarded).toBe(true);
    expect(result.event?.type).toBe('users/init');
    expect(facade.stateOf('Users')()).toBe(ComponentStateEnum.Processing);
    expect(facade.processing('Users')()).toBe(true);
  });

  it('blocks illegal transitions and does not forward', () => {
    const states = builder
      .create('Users')
      .forAction('users/init')
      .fromState(ComponentStateEnum.Idle)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .build();

    service.addComponentStates(states);
    service.updateComponentState('Users', ComponentStateEnum.Processing);

    const result = machine.dispatch({ type: 'users/init' });

    expect(result.allowed).toBe(false);
    expect(result.forwarded).toBe(false);
    expect(result.blocked.length).toBe(1);
    expect(facade.stateOf('Users')()).toBe(ComponentStateEnum.Processing);
  });

  it('terminate updates state without forwarding', () => {
    const states = builder
      .create('Panel')
      .forAction('panel/close')
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Minimised)
      .terminate()
      .build();

    service.addComponentStates(states);
    service.updateComponentState('Panel', ComponentStateEnum.Maximised);

    const result = machine.dispatch({ type: 'panel/close' });

    expect(result.allowed).toBe(true);
    expect(result.forwarded).toBe(false);
    expect(facade.stateOf('Panel')()).toBe(ComponentStateEnum.Minimised);
  });
});
