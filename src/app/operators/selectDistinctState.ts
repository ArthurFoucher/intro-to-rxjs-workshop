import { pipe } from 'rxjs';
import { distinctUntilChanged, pluck } from 'rxjs/operators';
import { CounterState } from '../counter-state.interface';

export function selectDistinctState<K extends keyof CounterState>(key: K) {
  return pipe(pluck<CounterState, K>(key), distinctUntilChanged());
}
