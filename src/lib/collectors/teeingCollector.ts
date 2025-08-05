import { BinaryMapper } from 'ts-fluent-iterators';
import { AsyncCollector, EventualCollector } from './collector';

export class AsyncTeeingCollector<T1, R1, T2, R2, T extends T1 & T2, R> implements AsyncCollector<T, R> {
  constructor(
    private readonly c1: EventualCollector<T1, R1>,
    private readonly c2: EventualCollector<T2, R2>,
    private readonly mapper: BinaryMapper<R1, R2, R>
  ) {}

  async collect(t: T) {
    await Promise.all([this.c1.collect(t), this.c2.collect(t)]);
  }

  get result() {
    return this.mapper(this.c1.result, this.c2.result);
  }
}

export function asyncTeeingCollector<T1, R1, T2, R2, T extends T1 & T2, R>(
  c1: EventualCollector<T1, R1>,
  c2: EventualCollector<T2, R2>,
  mapper: BinaryMapper<R1, R2, R>
): AsyncTeeingCollector<T1, R1, T2, R2, T, R> {
  return new AsyncTeeingCollector(c1, c2, mapper);
}
