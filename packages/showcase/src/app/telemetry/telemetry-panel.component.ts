import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DatePipe, NgClass } from '@angular/common';
import { TelemetryService } from './telemetry.service';
import { TelemetryMode } from './telemetry.types';

@Component({
  selector: 'app-telemetry-panel',
  standalone: true,
  imports: [DatePipe, NgClass],
  templateUrl: './telemetry-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TelemetryPanelComponent {
  readonly telemetry = inject(TelemetryService);

  modeClass(mode: TelemetryMode): string {
    switch (mode) {
      case 'passthrough':
        return 'badge-info';
      case 'terminate':
        return 'badge-secondary';
      case 'transform':
        return 'badge-accent';
      case 'ignored':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  }

  shortAction(type: string): string {
    const parts = type.split('] ');
    return parts.length > 1 ? parts[1] : type;
  }
}
