import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  imports: [RouterModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  readonly links = [
    {
      path: '/users',
      label: 'List lifecycle',
      hint: 'Idle → Processing → Completed',
    },
    {
      path: '/cards',
      label: 'Multi-instance cards',
      hint: 'Parallel machines with withId',
    },
    {
      path: '/form',
      label: 'Form submit',
      hint: 'Retry + disable while processing',
    },
    {
      path: '/panel',
      label: 'Expandable panel',
      hint: 'Maximised / Minimised + terminate',
    },
  ];
}
