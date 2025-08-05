import { Mapper } from 'ts-fluent-iterators';
import { EventualMapper, EventualPredicate } from '../utils';
import { AsyncCollector, EventualCollector } from './collector';

export class AsyncFluentCollector<A, B> implements AsyncCollector<A, B> {
  protected constructor(readonly collector: EventualCollector<A, B>) {}

  async collect(a: A) {
    return await this.collector.collect(a);
  }

  get result() {
    return this.collector.result;
  }

  map<C>(mapper: EventualMapper<C, A>): AsyncFluentCollector<C, B> {
    return new AsyncFluentCollector(asyncMappingCollector(mapper, this.collector));
  }

  filter(predicate: EventualPredicate<A>): AsyncFluentCollector<A, B> {
    return new AsyncFluentCollector(asyncFilteringCollector(predicate, this.collector));
  }

  andThen<C>(mapper: Mapper<B, C>): AsyncFluentCollector<A, C> {
    return new AsyncFluentCollector(andThenCollector(this.collector, mapper));
  }

  static from<A, B>(collector: EventualCollector<A, B>): AsyncFluentCollector<A, B> {
    if (collector instanceof AsyncFluentCollector) return collector;
    return new AsyncFluentCollector(collector);
  }
}

export function asyncFluentCollector<A, B>(collector: EventualCollector<A, B>) {
  return AsyncFluentCollector.from(collector);
}

export class AsyncMappingCollector<A, B, T> implements AsyncCollector<A, T> {
  constructor(
    private readonly mapper: EventualMapper<A, B>,
    private readonly collector: EventualCollector<B, T>
  ) {}

  async collect(a: A) {
    return this.collector.collect(await this.mapper(a));
  }

  get result() {
    return this.collector.result;
  }
}

export function asyncMappingCollector<A, B, T>(mapper: EventualMapper<A, B>, collector: EventualCollector<B, T>) {
  return new AsyncMappingCollector(mapper, collector);
}

export class FilteringCollector<A, B> implements AsyncCollector<A, B> {
  constructor(
    private readonly predicate: EventualPredicate<A>,
    private readonly collector: EventualCollector<A, B>
  ) {}

  async collect(a: A) {
    if (await this.predicate(a)) {
      await this.collector.collect(a);
    }
  }

  get result() {
    return this.collector.result;
  }
}

export function asyncFilteringCollector<A, B>(predicate: EventualPredicate<A>, collector: EventualCollector<A, B>) {
  return new FilteringCollector(predicate, collector);
}

export class AsyncAndThenCollector<A, B, C> implements AsyncCollector<A, C> {
  constructor(
    private readonly collector: EventualCollector<A, B>,
    private readonly mapper: Mapper<B, C>
  ) {}

  async collect(a: A) {
    await this.collector.collect(a);
  }

  get result() {
    return this.mapper(this.collector.result);
  }
}

export function andThenCollector<A, B, C>(collector: EventualCollector<A, B>, mapper: Mapper<B, C>) {
  return new AsyncAndThenCollector(collector, mapper);
}
