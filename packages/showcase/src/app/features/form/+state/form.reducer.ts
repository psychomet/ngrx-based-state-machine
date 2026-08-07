import { createReducer, on } from '@ngrx/store';
import * as FormActions from './form.actions';

export const FORM_FEATURE_KEY = 'demoForm';

export interface FormState {
  name: string;
  email: string;
  error: string | null;
  lastSubmitted: { name: string; email: string } | null;
}

export const initialFormState: FormState = {
  name: '',
  email: '',
  error: null,
  lastSubmitted: null,
};

export const formReducer = createReducer(
  initialFormState,
  on(
    FormActions.submitForm,
    FormActions.retryForm,
    (state, { name, email }) => ({
      ...state,
      name,
      email,
      error: null,
    }),
  ),
  on(FormActions.submitFormSuccess, (state, { name, email }) => ({
    ...state,
    error: null,
    lastSubmitted: { name, email },
  })),
  on(FormActions.submitFormFailure, (state, { error }) => ({
    ...state,
    error,
  })),
  on(FormActions.resetForm, () => initialFormState),
);
