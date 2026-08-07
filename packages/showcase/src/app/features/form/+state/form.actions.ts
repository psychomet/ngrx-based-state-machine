import { createAction, props } from '@ngrx/store';

export const submitForm = createAction(
  '[Form] Submit',
  props<{ name: string; email: string; forceFail?: boolean }>(),
);

export const submitFormSuccess = createAction(
  '[Form] Submit Success',
  props<{ name: string; email: string }>(),
);

export const submitFormFailure = createAction(
  '[Form] Submit Failure',
  props<{ error: string }>(),
);

export const retryForm = createAction(
  '[Form] Retry',
  props<{ name: string; email: string; forceFail?: boolean }>(),
);

export const resetForm = createAction('[Form] Reset');
