import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, timer } from 'rxjs';
import { INITIAL_COUNTER_STATE } from '../initial-counter-state';

@Injectable({
  providedIn: 'root',
})
export class CounterFacadeService {
  counterState$ = new BehaviorSubject(INITIAL_COUNTER_STATE);

  btnStart$ = new Subject();

  constructor() {
    this.btnStart$.subscribe(() => {
      console.log('start');
    });
  }
}
