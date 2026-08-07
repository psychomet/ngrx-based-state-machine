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

const EVENTS = {
  expand: 'signal/panel/expand',
  collapse: 'signal/panel/collapse',
  refresh: 'signal/panel/refresh',
  refreshSuccess: 'signal/panel/refreshSuccess',
  lock: 'signal/panel/lock',
  unlock: 'signal/panel/unlock',
} as const;

interface DummyJsonQuote {
  id: number;
  quote: string;
  author: string;
}

@Component({
  standalone: true,
  templateUrl: './signal-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalPanelComponent implements OnDestroy {
  private readonly http = inject(HttpClient);
  private readonly builder = inject(ComponentStateBuilder);
  private readonly service = inject(ComponentStateService);
  private readonly machine = inject(ComponentStateMachine);
  private readonly facade = inject(ComponentStateFacade);

  readonly machineName = 'SignalPanel';
  readonly ComponentStateEnum = ComponentStateEnum;
  readonly state = this.facade.stateOf(this.machineName);
  readonly quote = signal('Expand the panel, then refresh for a quote.');

  constructor() {
    const states = this.builder
      .create(this.machineName)
      .forAction(EVENTS.expand)
      .fromState(ComponentStateEnum.Minimised)
      .toState(ComponentStateEnum.Maximised)
      .terminate()
      .forAction(EVENTS.collapse)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Minimised)
      .terminate()
      .forAction(EVENTS.refresh)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .forAction(EVENTS.refreshSuccess)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Maximised)
      .passThrough()
      .forAction(EVENTS.lock)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Disabled)
      .terminate()
      .fromState(ComponentStateEnum.Minimised)
      .toState(ComponentStateEnum.Disabled)
      .terminate()
      .forAction(EVENTS.unlock)
      .fromState(ComponentStateEnum.Disabled)
      .toState(ComponentStateEnum.Minimised)
      .terminate()
      .build();

    this.service.addComponentStates(states);
    this.service.updateComponentState(
      this.machineName,
      ComponentStateEnum.Minimised,
    );
  }

  ngOnDestroy(): void {
    this.service.removeComponentStates(this.machineName);
  }

  expand(): void {
    this.machine.dispatch({ type: EVENTS.expand });
  }

  collapse(): void {
    this.machine.dispatch({ type: EVENTS.collapse });
  }

  refresh(): void {
    this.machine.run({ type: EVENTS.refresh }, () => {
      this.http
        .get<{
          quotes: DummyJsonQuote[];
        }>('https://dummyjson.com/quotes?limit=30')
        .subscribe({
          next: (response) => {
            const item =
              response.quotes[
                Math.floor(Math.random() * response.quotes.length)
              ];
            this.quote.set(`"${item.quote}" — ${item.author}`);
            this.machine.dispatch({ type: EVENTS.refreshSuccess });
          },
          error: () => {
            this.quote.set('Could not load quote. Try again.');
            this.machine.dispatch({ type: EVENTS.refreshSuccess });
          },
        });
    });
  }

  lock(): void {
    this.machine.dispatch({ type: EVENTS.lock });
  }

  unlock(): void {
    this.machine.dispatch({ type: EVENTS.unlock });
  }
}
