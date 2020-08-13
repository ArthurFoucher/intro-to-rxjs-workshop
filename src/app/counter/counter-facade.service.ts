import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Subject, timer } from 'rxjs';
import { INITIAL_COUNTER_STATE } from '../initial-counter-state';
import { mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class CounterFacadeService {
  counterState$ = new BehaviorSubject(INITIAL_COUNTER_STATE);

  btnStart$ = new Subject();
  btnPause$ = new Subject();
  btnUp$ = new Subject();
  btnDown$ = new Subject();
  btnReset$ = new Subject();

  start$ = this.btnStart$.pipe(mapTo(true));
  pause$ = this.btnPause$.pipe(mapTo(false));
  tick$ = timer(0, this.counterState$.value.tickSpeed);

  countUp$ = this.btnUp$.pipe(mapTo(true));
  countDown$ = this.btnDown$.pipe(mapTo(false));

  countDirection$ = merge(this.countUp$, this.countDown$);

  constructor() {
    this.tick$.subscribe(() => {
      const state = this.counterState$.value;
      const { count, countDiff, countUp, isTicking } = state;
      this.counterState$.next({
        ...state,
        count: isTicking ? count + (countUp ? 1 : -1) * countDiff : count,
      });
    });

    this.countDirection$.subscribe((countUp) => {
      const state = this.counterState$.value;
      this.counterState$.next({
        ...state,
        countUp,
      });
    });

    this.btnReset$.subscribe(() => {
      this.counterState$.next(INITIAL_COUNTER_STATE);
    });

    merge(this.start$, this.pause$).subscribe((isTicking) => {
      const state = this.counterState$.value;
      this.counterState$.next({
        ...state,
        isTicking,
      });
    });
  }
}
