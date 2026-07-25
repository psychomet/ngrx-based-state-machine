import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateService,
  ComponentStateState,
} from 'ngrx-fsm';
import { map, Observable } from 'rxjs';
import * as CardsActions from '../+state/cards.actions';
import * as CardsSelectors from '../+state/cards.selectors';
import { CardsEntity } from '../+state/cards.reducer';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cards.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardsComponent implements OnDestroy {
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>
  );
  private readonly componentStateService = inject(ComponentStateService);
  private readonly componentStateBuilder = inject(ComponentStateBuilder);

  readonly ComponentStateEnum = ComponentStateEnum;
  readonly cardIds = [1, 2, 3];
  private readonly machineNames = this.cardIds.map((id) => `UserCard-${id}`);

  constructor() {
    for (const id of this.cardIds) {
      const name = `UserCard-${id}`;
      const states = this.componentStateBuilder
        .create(name)
        .withId(id)
        .forAction(CardsActions.loadCard.type)
        .fromState(ComponentStateEnum.Idle)
        .toState(ComponentStateEnum.Processing)
        .passThrough()
        .forAction(CardsActions.retryCard.type)
        .fromState(ComponentStateEnum.Retry)
        .toState(ComponentStateEnum.Processing)
        .passThrough()
        .forAction(CardsActions.loadCardSuccess.type)
        .fromState(ComponentStateEnum.Processing)
        .toState(ComponentStateEnum.Success)
        .passThrough()
        .forAction(CardsActions.loadCardFailure.type)
        .fromState(ComponentStateEnum.Processing)
        .toState(ComponentStateEnum.Retry)
        .passThrough()
        .build();

      this.componentStateService.addComponentStates(states);
    }
  }

  ngOnDestroy(): void {
    for (const name of this.machineNames) {
      this.componentStateService.removeComponentStates(name);
    }
  }

  state$(id: number): Observable<ComponentStateEnum> {
    const name = `UserCard-${id}`;
    return this.store.pipe(
      map((state) => state.componentState?.[name] ?? ComponentStateEnum.Idle)
    );
  }

  user$(id: number): Observable<CardsEntity | null> {
    return this.store.select(CardsSelectors.selectCardById(id));
  }

  error$(id: number): Observable<string | null> {
    return this.store.select(CardsSelectors.selectCardError(id));
  }

  load(id: number): void {
    this.store.dispatch(CardsActions.loadCard({ componentStateId: id }));
  }

  retry(id: number): void {
    this.store.dispatch(CardsActions.retryCard({ componentStateId: id }));
  }
}
