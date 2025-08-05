import { AsyncCollector, EventualCollector } from './collector';

export class AsyncForkingCollector<T, R> implements AsyncCollector<T, R[]> {
  private readonly collectors: EventualCollector<T, R>[];

  constructor(...collectors: EventualCollector<T, R>[]) {
    this.collectors = collectors;
  }

  async collect(t: T) {
    await Promise.all(this.collectors.map(c => c.collect(t)));
  }

  get result() {
    return this.collectors.map(c => c.result);
  }
}

export function asyncForkingCollector<T, R>(...collectors: EventualCollector<T, R>[]) {
  return new AsyncForkingCollector(...collectors);
}
