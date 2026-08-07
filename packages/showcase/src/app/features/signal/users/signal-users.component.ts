import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateFacade,
  ComponentStateMachine,
  ComponentStateService,
} from 'ngrx-fsm-signal';
import { UserInterface } from '../../users/types';

const EVENTS = {
  init: 'signal/users/init',
  success: 'signal/users/success',
  failure: 'signal/users/failure',
  reIndex: 'signal/users/reIndex',
} as const;

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

@Component({
  standalone: true,
  templateUrl: './signal-users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalUsersComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly builder = inject(ComponentStateBuilder);
  private readonly service = inject(ComponentStateService);
  private readonly machine = inject(ComponentStateMachine);
  private readonly facade = inject(ComponentStateFacade);

  readonly machineName = 'SignalUsers';
  readonly processing = this.facade.processing(this.machineName);
  readonly users = signal<UserInterface[]>([]);

  constructor() {
    const states = this.builder
      .create(this.machineName)
      .forAction(EVENTS.init)
      .fromState(ComponentStateEnum.Idle)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .forAction(EVENTS.success)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Completed)
      .passThrough()
      .forAction(EVENTS.failure)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Idle)
      .passThrough()
      .forAction(EVENTS.reIndex)
      .fromState(ComponentStateEnum.Completed)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .build();

    this.service.addComponentStates(states);
  }

  ngOnDestroy(): void {
    this.service.removeComponentStates(this.machineName);
  }

  init(): void {
    this.machine.run({ type: EVENTS.init }, () => this.fetchUsers());
  }

  reIndex(): void {
    this.machine.run({ type: EVENTS.reIndex }, () => this.fetchUsers());
  }

  private fetchUsers(): void {
    this.http
      .get<{
        users: DummyJsonUser[];
      }>('https://dummyjson.com/users?limit=3&select=id,firstName,lastName,username,email')
      .subscribe({
        next: (response) => {
          this.users.set(
            response.users.map((user) => ({
              id: user.id,
              first_name: user.firstName,
              last_name: user.lastName,
              username: user.username,
              email: user.email,
            })),
          );
          this.machine.dispatch({ type: EVENTS.success });
        },
        error: () => this.machine.dispatch({ type: EVENTS.failure }),
      });
  }
}
