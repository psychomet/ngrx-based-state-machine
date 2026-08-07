import { createAction, props } from '@ngrx/store';

export const expandPanel = createAction('[Panel] Expand');
export const collapsePanel = createAction('[Panel] Collapse');
export const refreshPanel = createAction('[Panel] Refresh');
export const refreshPanelSuccess = createAction(
  '[Panel] Refresh Success',
  props<{ quote: string }>(),
);
export const lockPanel = createAction('[Panel] Lock');
export const unlockPanel = createAction('[Panel] Unlock');
