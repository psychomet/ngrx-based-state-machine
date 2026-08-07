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
import * as PanelActions from '../+state/panel.actions';
import * as PanelSelectors from '../+state/panel.selectors';

@Component({
  standalone: true,
  imports: [CommonModule],
  templateUrl: './panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PanelComponent implements OnDestroy {
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>,
  );
  private readonly componentStateService = inject(ComponentStateService);
  private readonly componentStateBuilder = inject(ComponentStateBuilder);

  readonly machineName = PanelComponent.name;
  readonly ComponentStateEnum = ComponentStateEnum;

  readonly state$: Observable<ComponentStateEnum> = this.store.pipe(
    map(
      (state) =>
        state.componentState?.[this.machineName] ?? ComponentStateEnum.Idle,
    ),
  );
  readonly quote$ = this.store.select(PanelSelectors.selectPanelQuote);

  constructor() {
    const states = this.componentStateBuilder
      .create(this.machineName)
      .forAction(PanelActions.expandPanel.type)
      .fromState(ComponentStateEnum.Minimised)
      .toState(ComponentStateEnum.Maximised)
      .terminate()
      .forAction(PanelActions.collapsePanel.type)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Minimised)
      .terminate()
      .forAction(PanelActions.refreshPanel.type)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .forAction(PanelActions.refreshPanelSuccess.type)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Maximised)
      .passThrough()
      .forAction(PanelActions.lockPanel.type)
      .fromState(ComponentStateEnum.Maximised)
      .toState(ComponentStateEnum.Disabled)
      .terminate()
      .fromState(ComponentStateEnum.Minimised)
      .toState(ComponentStateEnum.Disabled)
      .terminate()
      .forAction(PanelActions.unlockPanel.type)
      .fromState(ComponentStateEnum.Disabled)
      .toState(ComponentStateEnum.Minimised)
      .terminate()
      .build();

    // addComponentStates() clears any prior store entry for this name,
    // so set the initial Minimised state AFTER registration.
    this.componentStateService.addComponentStates(states);
    this.componentStateService.updateComponentState(
      this.machineName,
      ComponentStateEnum.Minimised,
    );
  }

  ngOnDestroy(): void {
    this.componentStateService.removeComponentStates(this.machineName);
  }

  expand(): void {
    this.store.dispatch(PanelActions.expandPanel());
  }

  collapse(): void {
    this.store.dispatch(PanelActions.collapsePanel());
  }

  refresh(): void {
    this.store.dispatch(PanelActions.refreshPanel());
  }

  lock(): void {
    this.store.dispatch(PanelActions.lockPanel());
  }

  unlock(): void {
    this.store.dispatch(PanelActions.unlockPanel());
  }
}
