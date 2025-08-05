import { EventualReducer } from '../utils';
import { AsyncCollector } from './collector';

export class AsyncFoldCollector<A, B> implements AsyncCollector<A, B> {
  constructor(
    private readonly reducer: EventualReducer<A, B>,
    private acc: B
  ) {}

  async collect(a: A) {
    this.acc = await this.reducer(this.acc, a);
  }

  get result() {
    return this.acc;
  }
}

export function asyncFoldCollector<A, B>(reducer: EventualReducer<A, B>, iniitial: B) {
  return new AsyncFoldCollector<A, B>(reducer, iniitial);
}

export class AsyncReduceCollector<A> implements AsyncCollector<A, A | undefined> {
  private first = true;
  constructor(
    private readonly reducer: EventualReducer<A, A>,
    private acc?: A
  ) {}

  async collect(a: A) {
    if (this.first) {
      this.first = false;
      if (this.acc == null) {
        this.acc = a;
        return;
      }
    }
    this.acc = await this.reducer(this.acc!, a);
  }

  get result() {
    return this.acc;
  }
}

export function asyncReduceCollector<A>(reducer: EventualReducer<A, A>, initial?: A) {
  return new AsyncReduceCollector(reducer, initial);
}
