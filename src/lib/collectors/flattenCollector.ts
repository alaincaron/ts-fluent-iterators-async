import { AsyncFluentIterator } from '../async';
import { EventualIterable, EventualIterator } from '../utils';
import { AsyncCollector } from './collector';

/**
 * A `Collector` that accepts `Iterable<A>` or `Iterator<A>` and returns a `FluentIterator<A>` that consists of the concatenation of all the collected iterable objects.
 *
 * @typeParam A the type of elements being iterated on.
 * @example
 * const c = new AsyncFlattenCollector<number>();
 * await c.collect([1,2]);
 * await c.collect([3,4]);
 * await c.result.collect() : [1,2,3,4]
 */
export class AsyncFlattenCollector<A>
  implements AsyncCollector<EventualIterable<A> | EventualIterator<A>, AsyncFluentIterator<A>>
{
  private iter: AsyncFluentIterator<A> = AsyncFluentIterator.empty();

  get result(): AsyncFluentIterator<A> {
    return this.iter;
  }

  async collect(a: EventualIterable<A> | EventualIterator<A>) {
    this.iter = this.iter.concat(a);
  }
}

export function asyncFlattenCollector<A>() {
  return new AsyncFlattenCollector<A>();
}
