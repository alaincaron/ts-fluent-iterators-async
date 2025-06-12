import { ArrayCollector, IteratorGenerator, Iterators as SyncIterators } from 'ts-fluent-iterators';
import * as AsyncIterators from '../async/asyncIterators';
import { EventualCollector } from '../collectors';
import { Eventually, EventualMapper, EventualPredicate, EventualReducer } from '../utils';

export function* map<A, B>(iter: Iterator<Promise<A>>, mapper: EventualMapper<A, B>): IterableIterator<Promise<B>> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    yield item.value.then(a => mapper(a));
  }
}

export function* flatmap<A, B>(
  iter: Iterator<Promise<A>>,
  mapper: EventualMapper<Promise<A>, B>
): IterableIterator<Promise<B>> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    yield item.value.then(a => mapper(Promise.resolve(a)));
  }
}

export function first<A>(iter: Iterator<Promise<A>>): Promise<A | undefined> {
  for (;;) {
    const item = iter.next();
    if (item.done) return Promise.resolve(undefined);
    return item.value;
  }
}

export async function* filter<A>(
  iter: Iterator<Promise<A>>,
  predicate: EventualPredicate<A>
): AsyncIterableIterator<A> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const value = await item.value;
    if (await predicate(value)) yield value;
  }
}

export function removeNull<A>(iter: Iterator<Promise<A>>): AsyncIterableIterator<A> {
  return filter(iter, a => a != null);
}

export async function* filterMap<A, B>(
  iter: Iterator<Promise<A>>,
  mapper: EventualMapper<A, B | null | undefined>
): AsyncIterableIterator<B> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const b = await mapper(await item.value);
    if (b != null) yield b;
  }
}

export function* tap<A>(iter: Iterator<Promise<A>>, mapper: EventualMapper<A, any>): IterableIterator<Promise<A>> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    yield item.value.then(a => mapper(a)).then((_: any) => item.value);
  }
}

export function* zip<A, B>(
  iter1: Iterator<Promise<A>>,
  iter2: Iterator<Promise<B>>
): IterableIterator<Promise<[A, B]>> {
  for (;;) {
    const item1 = iter1.next();
    const item2 = iter2.next();
    if (item1.done || item2.done) break;
    yield Promise.all([item1.value, item2.value]);
  }
}

export function* enumerate<A>(iter: Iterator<Promise<A>>, start = 0): IterableIterator<Promise<[A, number]>> {
  let i = start;
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    yield Promise.all([item.value, i++]);
  }
}

export async function contains<A>(iter: Iterator<Promise<A>>, predicate: EventualPredicate<A>): Promise<boolean> {
  return (await AsyncIterators.first(filter(iter, predicate))) !== undefined;
}

export async function includes<A>(iter: Iterator<Promise<A>>, target: Eventually<A>): Promise<boolean> {
  return contains(iter, async a => a === (await target));
}

export async function fold<A, B>(
  iter: Iterator<Promise<A>>,
  reducer: EventualReducer<A, B>,
  initialValue: Eventually<B>
): Promise<B> {
  let acc = await initialValue;
  for (;;) {
    const item = iter.next();
    if (item.done) return acc;
    acc = await reducer(acc, await item.value);
  }
}

export async function reduce<A>(
  iter: Iterator<Promise<A>>,
  reducer: EventualReducer<A, A>,
  initialValue?: Eventually<A>
): Promise<A | undefined> {
  let acc = initialValue;
  if (acc === undefined) {
    const item = iter.next();
    if (item.done) return undefined;
    acc = await item.value;
  }
  return fold(iter, reducer, acc);
}

export async function forEach<A>(iter: Iterator<Promise<A>>, mapper: EventualMapper<A, any>): Promise<void> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    await mapper(await item.value);
  }
}

export async function* takeWhile<A>(
  iter: Iterator<Promise<A>>,
  predicate: EventualPredicate<A>
): AsyncIterableIterator<A> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const value = await item.value;
    if (!(await predicate(value))) break;
    yield value;
  }
}

export async function* skipWhile<A>(
  iter: Iterator<Promise<A>>,
  predicate: EventualPredicate<A>
): AsyncIterableIterator<A> {
  let skip = true;
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const value = await item.value;
    if (skip) {
      skip = await predicate(value);
      if (skip) continue;
    }
    yield value;
  }
}

export async function all<A>(iter: Iterator<Promise<A>>, predicate: EventualPredicate<A>): Promise<boolean> {
  for (;;) {
    const item = iter.next();
    if (item.done) return true;
    if (!(await predicate(await item.value))) return false;
  }
}

export async function some<A>(iter: Iterator<Promise<A>>, predicate: EventualPredicate<A>): Promise<boolean> {
  for (;;) {
    const item = iter.next();
    if (item.done) return false;
    if (await predicate(await item.value)) return true;
  }
}

export async function collectTo<A, B>(
  iter: Iterator<Promise<A>>,
  collector: EventualCollector<A, Eventually<B>>
): Promise<B> {
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    await collector.collect(await item.value);
  }
  return collector.result;
}

export async function* distinct<A, K = A>(
  iter: Iterator<Promise<A>>,
  mapper: EventualMapper<A, K> = (a: A) => a as unknown as K
): AsyncIterableIterator<A> {
  const seen = new Set<K>();
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const value = await item.value;
    const key = await mapper(value);
    if (!seen.has(key)) {
      seen.add(key);
      yield value;
    }
  }
}

export function allSettled<A>(iter: Iterator<Promise<A>>): Promise<PromiseSettledResult<A>[]> {
  const promises = SyncIterators.collectTo(iter, new ArrayCollector());
  return Promise.allSettled(promises);
}

export function race<A>(iter: Iterator<Promise<A>>): Promise<A | undefined> {
  const promises = SyncIterators.collectTo(iter, new ArrayCollector());
  if (!promises.length) return Promise.resolve(undefined);
  return Promise.race(promises);
}

export function any<A>(iter: Iterator<Promise<A>>): Promise<A | undefined> {
  const promises = SyncIterators.collectTo(iter, new ArrayCollector());
  if (!promises.length) return Promise.resolve(undefined);
  return Promise.any(promises);
}

export function* toPromise<A>(generator: IteratorGenerator<A>): IterableIterator<Promise<Awaited<A>>> {
  const iter = SyncIterators.toIterator(generator);
  for (;;) {
    const item = iter.next();
    if (item.done) break;
    const value = item.value;
    yield Promise.resolve(value);
  }
}
