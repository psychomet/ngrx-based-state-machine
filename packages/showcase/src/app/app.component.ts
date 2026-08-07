import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TelemetryPanelComponent } from './telemetry/telemetry-panel.component';

interface NavLink {
  path: string;
  label: string;
  hint: string;
}

interface NavSection {
  title: string;
  subtitle: string;
  links: NavLink[];
}

@Component({
  imports: [RouterModule, TelemetryPanelComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly sections: NavSection[] = [
    {
      title: 'Store',
      subtitle: 'ngrx-fsm · ActionsSubject',
      links: [
        {
          path: '/store/users',
          label: 'List lifecycle',
          hint: 'Idle → Processing → Completed',
        },
        {
          path: '/store/cards',
          label: 'Multi-instance cards',
          hint: 'Parallel machines with withId',
        },
        {
          path: '/store/form',
          label: 'Form submit',
          hint: 'Retry + disable while processing',
        },
        {
          path: '/store/panel',
          label: 'Expandable panel',
          hint: 'Maximised / Minimised + terminate',
        },
      ],
    },
    {
      title: 'Signal',
      subtitle: 'ngrx-fsm-signal · SignalStore',
      links: [
        {
          path: '/signal/users',
          label: 'List lifecycle',
          hint: 'dispatch / run with signals',
        },
        {
          path: '/signal/cards',
          label: 'Multi-instance cards',
          hint: 'withId via signal machine',
        },
        {
          path: '/signal/form',
          label: 'Form submit',
          hint: 'Retry + disable while processing',
        },
        {
          path: '/signal/panel',
          label: 'Expandable panel',
          hint: 'Maximised / Minimised + terminate',
        },
      ],
    },
  ];
}
