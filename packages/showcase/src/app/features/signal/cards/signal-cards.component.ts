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
  load: 'signal/cards/load',
  retry: 'signal/cards/retry',
  success: 'signal/cards/success',
  failure: 'signal/cards/failure',
} as const;

interface DummyJsonUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
}

interface CardData {
  user: UserInterface | null;
  error: string | null;
}

@Component({
  standalone: true,
  templateUrl: './signal-cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalCardsComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly builder = inject(ComponentStateBuilder);
  private readonly service = inject(ComponentStateService);
  private readonly machine = inject(ComponentStateMachine);
  private readonly facade = inject(ComponentStateFacade);

  readonly ComponentStateEnum = ComponentStateEnum;
  readonly cardIds = [1, 2, 3];
  private readonly machineNames = this.cardIds.map(
    (id) => `SignalUserCard-${id}`,
  );

  private readonly cardData = signal<Record<number, CardData>>(
    Object.fromEntries(
      this.cardIds.map((id) => [id, { user: null, error: null }]),
    ),
  );

  readonly states = Object.fromEntries(
    this.cardIds.map((id) => [id, this.facade.stateOf(`SignalUserCard-${id}`)]),
  ) as Record<number, ReturnType<ComponentStateFacade['stateOf']>>;

  constructor() {
    for (const id of this.cardIds) {
      const name = `SignalUserCard-${id}`;
      const states = this.builder
        .create(name)
        .withId(id)
        .forAction(EVENTS.load)
        .fromState(ComponentStateEnum.Idle)
        .toState(ComponentStateEnum.Processing)
        .passThrough()
        .forAction(EVENTS.retry)
        .fromState(ComponentStateEnum.Retry)
        .toState(ComponentStateEnum.Processing)
        .passThrough()
        .forAction(EVENTS.success)
        .fromState(ComponentStateEnum.Processing)
        .toState(ComponentStateEnum.Success)
        .passThrough()
        .forAction(EVENTS.failure)
        .fromState(ComponentStateEnum.Processing)
        .toState(ComponentStateEnum.Retry)
        .passThrough()
        .build();

      this.service.addComponentStates(states);
    }
  }

  ngOnDestroy(): void {
    for (const name of this.machineNames) {
      this.service.removeComponentStates(name);
    }
  }

  user(id: number): UserInterface | null {
    return this.cardData()[id]?.user ?? null;
  }

  error(id: number): string | null {
    return this.cardData()[id]?.error ?? null;
  }

  load(id: number): void {
    this.machine.run({ type: EVENTS.load, componentStateId: id }, () =>
      this.fetchCard(id),
    );
  }

  retry(id: number): void {
    this.machine.run({ type: EVENTS.retry, componentStateId: id }, () =>
      this.fetchCard(id),
    );
  }

  private fetchCard(id: number): void {
    this.http
      .get<DummyJsonUser>(
        `https://dummyjson.com/users/${id}?select=id,firstName,lastName,username,email`,
      )
      .subscribe({
        next: (user) => {
          this.cardData.update((data) => ({
            ...data,
            [id]: {
              user: {
                id: user.id,
                first_name: user.firstName,
                last_name: user.lastName,
                username: user.username,
                email: user.email,
              },
              error: null,
            },
          }));
          this.machine.dispatch({
            type: EVENTS.success,
            componentStateId: id,
          });
        },
        error: () => {
          this.cardData.update((data) => ({
            ...data,
            [id]: {
              user: null,
              error: `Failed to load card #${id}`,
            },
          }));
          this.machine.dispatch({
            type: EVENTS.failure,
            componentStateId: id,
          });
        },
      });
  }
}
