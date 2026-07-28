import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { select, Store } from '@ngrx/store';
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateService,
  ComponentStateState,
} from 'ngrx-fsm';
import * as UsersActions from '../../+state/users.actions';
import * as UsersSelectors from '../../+state/users.selectors';
import { filter, map, Observable } from 'rxjs';
import { UserInterface } from '../../types';

@Component({
  imports: [CommonModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent {
  private readonly componentStateService = inject(ComponentStateService);
  private readonly componentStateBuilder = inject(ComponentStateBuilder);
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>
  );

  processing$!: Observable<boolean>;
  users$: Observable<UserInterface[]> = this.store.pipe(
    select(UsersSelectors.selectAllUsers)
  );

  constructor() {
    const componentName = UsersComponent.name;
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
    this.processing$ = this.store.pipe(
      map((state) => state.componentState),
      filter(
        (state: ComponentStateState) =>
          state && state[componentName] !== undefined
      ),
      map((state: ComponentStateState) => state[componentName]),
      map(
        (componentState: ComponentStateEnum) =>
          componentState === ComponentStateEnum.Processing
      )
    );
  }

  init() {
    this.store.dispatch(UsersActions.initUsers());
  }

  reIndex() {
    this.store.dispatch(UsersActions.reIndexUsers());
  }
}
