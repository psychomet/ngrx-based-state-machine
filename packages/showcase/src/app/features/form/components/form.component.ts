import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateService,
  ComponentStateState,
} from 'ngrx-fsm';
import { map, Observable } from 'rxjs';
import * as FormActions from '../+state/form.actions';
import * as FormSelectors from '../+state/form.selectors';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent implements OnDestroy {
  private readonly store = inject(
    Store<{ componentState: ComponentStateState }>
  );
  private readonly componentStateService = inject(ComponentStateService);
  private readonly componentStateBuilder = inject(ComponentStateBuilder);
  private readonly fb = inject(FormBuilder);

  readonly machineName = FormComponent.name;
  readonly ComponentStateEnum = ComponentStateEnum;

  readonly form = this.fb.nonNullable.group({
    name: ['Ada Lovelace', Validators.required],
    email: ['ada@example.com', [Validators.required, Validators.email]],
    forceFail: [false],
  });

  readonly state$: Observable<ComponentStateEnum> = this.store.pipe(
    map(
      (state) =>
        state.componentState?.[this.machineName] ?? ComponentStateEnum.Idle
    )
  );
  readonly error$ = this.store.select(FormSelectors.selectFormError);
  readonly lastSubmitted$ = this.store.select(
    FormSelectors.selectLastSubmitted
  );

  constructor() {
    const states = this.componentStateBuilder
      .create(this.machineName)
      .disableWhenProcessing()
      .forAction(FormActions.submitForm.type)
      .fromState(ComponentStateEnum.Idle)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .forAction(FormActions.retryForm.type)
      .fromState(ComponentStateEnum.Retry)
      .toState(ComponentStateEnum.Processing)
      .passThrough()
      .forAction(FormActions.submitFormSuccess.type)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Success)
      .passThrough()
      .forAction(FormActions.submitFormFailure.type)
      .fromState(ComponentStateEnum.Processing)
      .toState(ComponentStateEnum.Retry)
      .passThrough()
      .forAction(FormActions.resetForm.type)
      .fromState(ComponentStateEnum.Success)
      .toState(ComponentStateEnum.Idle)
      .passThrough()
      .build();

    this.componentStateService.addComponentStates(states);
  }

  ngOnDestroy(): void {
    this.componentStateService.removeComponentStates(this.machineName);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { name, email, forceFail } = this.form.getRawValue();
    this.store.dispatch(FormActions.submitForm({ name, email, forceFail }));
  }

  retry(): void {
    const { name, email, forceFail } = this.form.getRawValue();
    this.store.dispatch(FormActions.retryForm({ name, email, forceFail }));
  }

  reset(): void {
    this.store.dispatch(FormActions.resetForm());
    this.form.reset({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      forceFail: false,
    });
  }
}
