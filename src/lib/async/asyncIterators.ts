import { Iterators } from 'ts-fluent-iterators';
import { EventualCollector } from '../collectors';
import {
  AsyncArrayGenerator,
  AsyncIteratorGenerator,
  EventualConsumer,
  EventualIterable,
  EventualIterator,
  Eventually,
  EventualMapper,
  EventualPredicate,
  EventualReducer,
} from '../utils';

function arrayLikeToAsyncIterator<A>(arrayLike: AsyncArrayGenerator<A>): AsyncIterator<A> | null {
  const { seed, length } = arrayLike;
  if (seed == null || length == null) return null;
  if (typeof seed === 'function') return seedToAsyncIterator(length, seed);
  if ('next' in seed && typeof seed.next === 'function') return take(seed, length);
  if (Symbol.iterator in seed && typeof seed[Symbol.iterator] === 'function')
    return take(toAsync(seed[Symbol.iterator]()), length);
  if (Symbol.asyncIterator in seed && typeof seed[Symbol.asyncIterator] === 'function')
    return take(seed[Symbol.asyncIterator](), length);
  return null;
}

export function toAsyncIteratorMaybe<A>(iter: AsyncIteratorGenerator<A>): AsyncIterator<A> | null {
  switch (typeof iter) {
    case 'string':
      return toAsync((iter as string)[Symbol.iterator]() as Iterator<A>);
    case 'object':
      if ('next' in iter && typeof iter.next === 'function') return iter;
      if (Symbol.asyncIterator in iter && typeof iter[Symbol.asyncIterator] === 'function')
        return iter[Symbol.asyncIterator]();
      if (Symbol.iterator in iter && typeof iter[Symbol.iterator] === 'function')
        return toAsync(iter[Symbol.iterator]());
      break;
    case 'function':
      return seedToAsyncIterator(Number.MAX_SAFE_INTEGER, iter);
  }
  return arrayLikeToAsyncIterator(iter as unknown as AsyncArrayGenerator<A>);
}

export function toAsyncIterator<A>(x: AsyncIteratorGenerator<A>): AsyncIterator<A> {
  const iter = toAsyncIteratorMaybe(x);
  if (iter) return iter;
  throw new Error(`Invalid non-iterable object: ${x}`);
}

async function* seedToAsyncIterator<A>(n: number, seed: EventualMapper<number, A>) {
  for (let i = 0; i < n; ++i) {
    yield await seed(i);
  }
}

export function toEventualIterator<A>(iter: EventualIterator<A> | EventualIterable<A>): EventualIterator<A> {
  if ('next' in iter && typeof iter.next === 'function') return iter;
  if (Symbol.iterator in iter && typeof iter[Symbol.iterator] === 'function') return iter[Symbol.iterator]();
  if (Symbol.asyncIterator in iter && typeof iter[Symbol.asyncIterator] === 'function')
    return iter[Symbol.asyncIterator]();
  throw new Error(`Invalid non-iterable object: ${iter}`);
}

export async function* empty<A = never>(): AsyncIterableIterator<A> {}
export async function* singleton<A>(a: A): AsyncIterableIterator<A> {
  if (a !== null) yield a;
}

export async function* map<A, B>(iter: AsyncIterator<A>, mapper: EventualMapper<A, B>): AsyncIterableIterator<B> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    yield await mapper(item.value);
  }
}

export async function first<A>(iter: AsyncIterator<A>): Promise<A | undefined> {
  for (;;) {
    const item = await iter.next();
    if (item.done) return undefined;
    return item.value;
  }
}

export async function* take<A>(iter: AsyncIterator<A>, n: number): AsyncIterableIterator<A> {
  for (let i = 0; i < n; ++i) {
    const item = await iter.next();
    if (item.done) break;
    yield item.value;
  }
}

export async function* tap<A>(iter: AsyncIterator<A>, mapper: EventualConsumer<A>): AsyncIterableIterator<A> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    await mapper(item.value);
    yield item.value;
  }
}

export async function* skip<A>(iter: AsyncIterator<A>, n: number): AsyncIterableIterator<A> {
  for (let i = 0; i < n; ++i) {
    const item = await iter.next();
    if (item.done) break;
  }

  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    yield item.value;
  }
}

export async function* filter<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): AsyncIterableIterator<A> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    if (await predicate(item.value)) yield item.value;
  }
}

export async function* flatMap<A, B>(
  iter: AsyncIterator<A>,
  mapper: EventualMapper<A, EventualIterator<B> | EventualIterable<B>>
): AsyncIterableIterator<B> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    const iter2 = toEventualIterator(await mapper(item.value));
    for (;;) {
      const item2 = await iter2.next();
      if (item2.done) break;
      yield item2.value;
    }
  }
}

export function removeNull<A>(iter: AsyncIterator<A>): AsyncIterableIterator<A> {
  return filter(iter, a => a != null);
}

export async function* filterMap<A, B>(
  iter: AsyncIterator<A>,
  mapper: EventualMapper<A, B | null | undefined>
): AsyncIterableIterator<B> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    const b = await mapper(item.value);
    if (b != null) yield b;
  }
}

export async function* zip<A, B>(iter1: AsyncIterator<A>, iter2: AsyncIterator<B>): AsyncIterableIterator<[A, B]> {
  for (;;) {
    const item1 = await iter1.next();
    const item2 = await iter2.next();
    if (item1.done || item2.done) break;
    yield [item1.value, item2.value];
  }
}

export async function* enumerate<A>(iter: AsyncIterator<A>, start = 0): AsyncIterableIterator<[A, number]> {
  let i = start;
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    yield [item.value, i++];
  }
}

export async function contains<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): Promise<boolean> {
  return (await first(filter(iter, predicate))) !== undefined;
}

export async function includes<A>(iter: AsyncIterator<A>, target: Eventually<A>): Promise<boolean> {
  return (await first(filter(iter, async a => a === (await target)))) !== undefined;
}

export async function fold<A, B>(iter: AsyncIterator<A>, reducer: EventualReducer<A, B>, initialValue: B): Promise<B> {
  let acc = initialValue;
  for (;;) {
    const item = await iter.next();
    if (item.done) return acc;
    acc = await reducer(acc, item.value);
  }
}

export async function reduce<A>(
  iter: AsyncIterator<A>,
  reducer: EventualReducer<A, A>,
  initialValue?: A
): Promise<A | undefined> {
  let acc = initialValue;
  if (acc === undefined) {
    const item = await iter.next();
    if (item.done) return undefined;
    acc = item.value;
  }
  return fold(iter, reducer, acc);
}

export async function* scan<A, B>(
  iter: AsyncIterator<A>,
  reducer: EventualReducer<A, B>,
  initialValue: B,
  emitInitial = false
): AsyncIterableIterator<B> {
  let acc = initialValue;
  if (emitInitial) yield acc;
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    acc = await reducer(acc, item.value);
    yield acc;
  }
}

export async function forEach<A>(iter: AsyncIterator<A>, mapper: EventualConsumer<A>): Promise<void> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    await mapper(item.value);
  }
}

export async function* append<A>(iter: AsyncIterator<A>, other: EventualIterator<A>): AsyncIterableIterator<A> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    yield item.value;
  }
  for (;;) {
    const item = await other.next();
    if (item.done) break;
    yield item.value;
  }
}

export async function* prepend<A>(iter: AsyncIterator<A>, other: EventualIterator<A>): AsyncIterableIterator<A> {
  for (;;) {
    const item = await other.next();
    if (item.done) break;
    yield item.value;
  }
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    yield item.value;
  }
}

export async function* concat<A>(...iters: EventualIterator<A>[]): AsyncIterator<A> {
  for (const iter of iters) {
    for (;;) {
      const item = await iter.next();
      if (item.done) break;
      yield item.value;
    }
  }
}

export async function* takeWhile<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): AsyncIterableIterator<A> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    if (!(await predicate(item.value))) break;
    yield item.value;
  }
}

export async function* skipWhile<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): AsyncIterableIterator<A> {
  let skip = true;
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    if (skip) {
      skip = await predicate(item.value);
      if (skip) continue;
    }
    yield item.value;
  }
}

export async function all<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): Promise<boolean> {
  for (;;) {
    const item = await iter.next();
    if (item.done) return true;
    if (!(await predicate(item.value))) return false;
  }
}

export async function some<A>(iter: AsyncIterator<A>, predicate: EventualPredicate<A>): Promise<boolean> {
  for (;;) {
    const item = await iter.next();
    if (item.done) return false;
    if (await predicate(item.value)) return true;
  }
}

export async function collectTo<A, B>(
  iter: AsyncIterator<A>,
  collector: EventualCollector<A, Eventually<B>>
): Promise<B> {
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    await collector.collect(await item.value);
  }
  return collector.result;
}

export async function* partition<A>(iter: AsyncIterator<A>, size: number): AsyncIterableIterator<A[]> {
  if (!Number.isSafeInteger(size) || size < 0) throw new Error(`Invalid size integer number: ${size}`);
  let values: A[] = [];
  for (;;) {
    const item = await iter.next();
    if (item.done) {
      if (values.length > 0) yield values;
      break;
    }
    if (values.push(item.value) >= size) {
      yield values;
      values = [];
    }
  }
}

export async function* distinct<A, K = A>(
  iter: AsyncIterator<A>,
  mapper: EventualMapper<A, K> = (a: A) => a as unknown as K
) {
  const seen = new Set<K>();
  for (;;) {
    const item = await iter.next();
    if (item.done) break;
    const value = item.value;
    const key = await mapper(value);
    if (!seen.has(key)) {
      seen.add(key);
      yield value;
    }
  }
}

export async function* toAsync<A>(iter: Iterator<A> | Iterable<A>): AsyncIterableIterator<A> {
  const iterator = Iterators.toIterator(iter);
  for (;;) {
    const item = iterator.next();
    if (item.done) break;
    yield item.value;
  }
}
