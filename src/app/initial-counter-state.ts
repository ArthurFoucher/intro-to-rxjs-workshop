import { CounterState } from './counter-state.interface';

export const INITIAL_COUNTER_STATE: CounterState = {
  isTicking: false,
  count: 0,
  countUp: true,
  tickSpeed: 200,
  countDiff: 1,
};
