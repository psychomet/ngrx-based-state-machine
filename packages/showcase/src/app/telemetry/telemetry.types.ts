export type TelemetryMode =
  | 'passthrough'
  | 'terminate'
  | 'transform'
  | 'ignored'
  | 'unknown';

export interface TelemetryEvent {
  id: string;
  at: number;
  useCase: string;
  componentName: string;
  triggeredBy: string;
  from: string;
  to: string;
  mode: TelemetryMode;
  componentStateId?: string | number;
}

export function resolveUseCase(componentName: string): string {
  if (componentName === 'UsersComponent') {
    return 'List lifecycle';
  }
  if (componentName.startsWith('UserCard-')) {
    return 'Multi-instance cards';
  }
  if (componentName === 'FormComponent') {
    return 'Form submit';
  }
  if (componentName === 'PanelComponent') {
    return 'Expandable panel';
  }
  return componentName;
}
