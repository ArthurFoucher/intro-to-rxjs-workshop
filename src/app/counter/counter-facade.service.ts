import { Injectable } from '@angular/core';
import { combineLatest, EMPTY, merge, Observable, Subject, timer } from 'rxjs';
import { INITIAL_COUNTER_STATE } from '../initial-counter-state';
import {
  map,
  mapTo,
  scan,
  startWith,
  switchMap,
  withLatestFrom,
} from 'rxjs/operators';
import { CounterState } from '../counter-state.interface';
import { selectDistinctState } from '../operators/selectDistinctState';
import { inputToValue } from '../operators/inputToValue';

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
  btnSetTo$ = new Subject();
  inputSetTo$ = new Subject();
  inputTickSpeed$ = new Subject();
  inputCountDiff$ = new Subject();

  start$: Command = this.btnStart$.pipe(mapTo({ isTicking: true }));
  pause$: Command = this.btnPause$.pipe(mapTo({ isTicking: false }));
  countUp$: Command = this.btnUp$.pipe(mapTo({ countUp: true }));
  countDown$: Command = this.btnDown$.pipe(mapTo({ countUp: false }));
  reset$: Command = this.btnReset$.pipe(mapTo(INITIAL_COUNTER_STATE));
  setTo$: Command = this.btnSetTo$.pipe(
    withLatestFrom(this.inputSetTo$, (_, value) => value),
    inputToValue(INITIAL_COUNTER_STATE.count),
    map((count) => ({ count })),
  );
  tickSpeed$: Command = this.inputTickSpeed$.pipe(
    inputToValue(INITIAL_COUNTER_STATE.tickSpeed),
    map((tickSpeed) => ({ tickSpeed })),
  );
  countDiff$: Command = this.inputCountDiff$.pipe(
    inputToValue(INITIAL_COUNTER_STATE.countDiff),
    map((countDiff) => ({ countDiff })),
  );

  command$ = new Subject<CounterStateChange>();

  counterState$: Observable<CounterState> = merge(
    this.start$,
    this.pause$,
    this.countUp$,
    this.countDown$,
    this.reset$,
    this.setTo$,
    this.tickSpeed$,
    this.countDiff$,
    this.command$,
  ).pipe(
    startWith(INITIAL_COUNTER_STATE),
    scan<CounterStateChange, CounterState>((state, change) => ({
      ...state,
      ...change,
    })),
  );

  isTicking$ = this.counterState$.pipe(selectDistinctState('isTicking'));
  tickSpeedState$ = this.counterState$.pipe(selectDistinctState('tickSpeed'));

  tick$ = combineLatest([this.isTicking$, this.tickSpeedState$]).pipe(
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
