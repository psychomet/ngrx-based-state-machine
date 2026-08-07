import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  ComponentStateBuilder,
  ComponentStateEnum,
  ComponentStateFacade,
  ComponentStateMachine,
  ComponentStateService,
} from 'ngrx-fsm-signal';

const EVENTS = {
  submit: 'signal/form/submit',
  retry: 'signal/form/retry',
  success: 'signal/form/success',
  failure: 'signal/form/failure',
  reset: 'signal/form/reset',
} as const;

@Component({
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './signal-form.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignalFormComponent implements OnDestroy {
  private readonly builder = inject(ComponentStateBuilder);
  private readonly service = inject(ComponentStateService);
  private readonly machine = inject(ComponentStateMachine);
  private readonly facade = inject(ComponentStateFacade);
  private readonly fb = inject(FormBuilder);

  readonly machineName = 'SignalForm';
  readonly ComponentStateEnum = ComponentStateEnum;
  readonly state = this.facade.stateOf(this.machineName);
  readonly error = signal<string | null>(null);
  readonly lastSubmitted = signal<{ name: string; email: string } | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['Ada Lovelace', Validators.required],
    email: ['ada@example.com', [Validators.required, Validators.email]],
    forceFail: [false],
  });

  constructor() {
    const states = this.builder
      .create(this.machineName)
      .disableWhenProcessing()
      .forAction(EVENTS.submit)
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
      .forAction(EVENTS.reset)
      .fromState(ComponentStateEnum.Success)
      .toState(ComponentStateEnum.Idle)
      .passThrough()
      .build();

    this.service.addComponentStates(states);
  }

  ngOnDestroy(): void {
    this.service.removeComponentStates(this.machineName);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.machine.run({ type: EVENTS.submit }, () => this.persist());
  }

  retry(): void {
    this.machine.run({ type: EVENTS.retry }, () => this.persist());
  }

  reset(): void {
    this.machine.run({ type: EVENTS.reset }, () => {
      this.error.set(null);
      this.lastSubmitted.set(null);
      this.form.reset({
        name: 'Ada Lovelace',
        email: 'ada@example.com',
        forceFail: false,
      });
    });
  }

  private persist(): void {
    const { name, email, forceFail } = this.form.getRawValue();
    window.setTimeout(() => {
      if (forceFail || email.toLowerCase().includes('fail')) {
        this.error.set('Simulated API failure. Fix the email or retry.');
        this.machine.dispatch({ type: EVENTS.failure });
        return;
      }
      this.error.set(null);
      this.lastSubmitted.set({ name, email });
      this.machine.dispatch({ type: EVENTS.success });
    }, 900);
  }
}
