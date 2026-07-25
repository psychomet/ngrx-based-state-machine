import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { catchError, map, of, switchMap } from 'rxjs';
import * as PanelActions from './panel.actions';

interface DummyJsonQuote {
  id: number;
  quote: string;
  author: string;
}

@Injectable()
export class PanelEffects {
  private readonly actions$ = inject(Actions);
  private readonly http = inject(HttpClient);

  refresh$ = createEffect(() =>
    this.actions$.pipe(
      ofType(PanelActions.refreshPanel),
      switchMap(() =>
        this.http
          .get<{ quotes: DummyJsonQuote[] }>(
            'https://dummyjson.com/quotes?limit=30'
          )
          .pipe(
            map((response) => {
              const quote =
                response.quotes[
                  Math.floor(Math.random() * response.quotes.length)
                ];
              return PanelActions.refreshPanelSuccess({
                quote: `"${quote.quote}" — ${quote.author}`,
              });
            }),
            catchError(() =>
              of(
                PanelActions.refreshPanelSuccess({
                  quote: 'Could not load quote. Try again.',
                })
              )
            )
          )
      )
    )
  );
}
