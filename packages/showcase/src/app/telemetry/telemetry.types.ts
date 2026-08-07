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
  if (componentName === 'UsersComponent' || componentName === 'SignalUsers') {
    return 'List lifecycle';
  }
  if (
    componentName.startsWith('UserCard-') ||
    componentName.startsWith('SignalUserCard-')
  ) {
    return 'Multi-instance cards';
  }
  if (componentName === 'FormComponent' || componentName === 'SignalForm') {
    return 'Form submit';
  }
  if (componentName === 'PanelComponent' || componentName === 'SignalPanel') {
    return 'Expandable panel';
  }
  return componentName;
}
