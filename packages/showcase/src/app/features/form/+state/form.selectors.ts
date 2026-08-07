import { createFeatureSelector, createSelector } from '@ngrx/store';
import { FORM_FEATURE_KEY, FormState } from './form.reducer';

export const selectFormState =
  createFeatureSelector<FormState>(FORM_FEATURE_KEY);

export const selectFormError = createSelector(
  selectFormState,
  (state) => state.error,
);

export const selectLastSubmitted = createSelector(
  selectFormState,
  (state) => state.lastSubmitted,
);
