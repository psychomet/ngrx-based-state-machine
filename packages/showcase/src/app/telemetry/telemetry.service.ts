import { Injectable, computed, signal } from '@angular/core';
import { TelemetryEvent } from './telemetry.types';

const MAX_EVENTS = 100;

@Injectable({ providedIn: 'root' })
export class TelemetryService {
  private readonly _events = signal<TelemetryEvent[]>([]);
  private readonly _paused = signal(false);

  readonly events = this._events.asReadonly();
  readonly paused = this._paused.asReadonly();
  readonly count = computed(() => this._events().length);

  record(event: Omit<TelemetryEvent, 'id' | 'at'> & { at?: number }): void {
    if (this._paused()) {
      return;
    }

    const next: TelemetryEvent = {
      ...event,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      at: event.at ?? Date.now(),
    };

    this._events.update((events) => [next, ...events].slice(0, MAX_EVENTS));
  }

  clear(): void {
    this._events.set([]);
  }

  togglePaused(): void {
    this._paused.update((paused) => !paused);
  }
}
