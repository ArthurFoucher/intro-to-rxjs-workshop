import { Injectable } from '@angular/core';
import { EMPTY, merge, Observable, Subject, timer } from 'rxjs';
import { INITIAL_COUNTER_STATE } from '../initial-counter-state';
import {
  distinctUntilChanged,
  map,
  mapTo,
  pluck,
  scan,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { CounterState } from '../counter-state.interface';

type CounterStateChange = Partial<CounterState>;
type Command = Observable<CounterStateChange>;

@Injectable({
  providedIn: 'root',
})
export class CounterFacadeService {
  btnStart$ = new Subject();
  btnPause$ = new Subject();
  btnUp$ = new Subject();
  btnDown$ = new Subject();
  btnReset$ = new Subject();

  start$: Command = this.btnStart$.pipe(mapTo({ isTicking: true }));
  pause$: Command = this.btnPause$.pipe(mapTo({ isTicking: false }));
  countUp$: Command = this.btnUp$.pipe(mapTo({ countUp: true }));
  countDown$: Command = this.btnDown$.pipe(mapTo({ countUp: false }));
  reset$: Command = this.btnReset$.pipe(mapTo(INITIAL_COUNTER_STATE));
  command$ = new Subject<CounterStateChange>();

  counterState$: Observable<CounterState> = merge(
    this.start$,
    this.pause$,
    this.countUp$,
    this.countDown$,
    this.reset$,
    this.command$,
  ).pipe(
    startWith(INITIAL_COUNTER_STATE),
    scan<CounterStateChange, CounterState>((state, change) => ({
      ...state,
      ...change,
    })),
  );

  isTicking$ = this.counterState$.pipe(
    pluck('isTicking'),
    distinctUntilChanged(),
  );

  tickSpeed$ = this.counterState$.pipe(
    pluck('tickSpeed'),
    distinctUntilChanged(),
  );

  tick$ = this.isTicking$.pipe(
    withLatestFrom(this.tickSpeed$),
    switchMap(([isTicking, tickSpeed]) =>
      isTicking ? timer(0, tickSpeed) : EMPTY,
    ),
    withLatestFrom(this.counterState$, (_, state) => state),
    map(
      ({ count, countDiff, countUp }) => count + (countUp ? 1 : -1) * countDiff,
    ),
  );

  constructor() {
    this.tick$.subscribe((count) => {
      this.command$.next({ count });
    });
  }
}
