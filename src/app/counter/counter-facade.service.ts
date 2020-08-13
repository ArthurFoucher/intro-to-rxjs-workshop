import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, merge, Subject, timer } from 'rxjs';
import { INITIAL_COUNTER_STATE } from '../initial-counter-state';
import { mapTo, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CounterFacadeService {
  counterState$ = new BehaviorSubject(INITIAL_COUNTER_STATE);

  btnStart$ = new Subject();
  btnPause$ = new Subject();
  btnUp$ = new Subject();
  btnDown$ = new Subject();

  start$ = this.btnStart$.pipe(mapTo(true));
  pause$ = this.btnPause$.pipe(mapTo(false));
  tick$ = merge(this.start$, this.pause$).pipe(
    switchMap((starting) =>
      starting ? timer(0, this.counterState$.value.tickSpeed) : EMPTY,
    ),
  );

  countUp$ = this.btnUp$.pipe(mapTo(true));
  countDown$ = this.btnDown$.pipe(mapTo(false));

  countDirection$ = merge(this.countUp$, this.countDown$);

  constructor() {
    this.tick$.subscribe(() => {
      const state = this.counterState$.value;
      const { count, countDiff, countUp } = state;
      this.counterState$.next({
        ...state,
        count: count + (countUp ? 1 : -1) * countDiff,
      });
    });

    this.countDirection$.subscribe((countUp) => {
      const state = this.counterState$.value;
      this.counterState$.next({
        ...state,
        countUp,
      });
    });
  }
}
