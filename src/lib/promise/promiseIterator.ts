import {
  ArrayCollector,
  CollisionHandler,
  Comparator,
  CountCollector,
  FluentIterator,
  GroupByCollector,
  IteratorGenerator,
  JoinCollector,
  LastCollector,
  MapCollector,
  Mapper,
  MaxCollector,
  MinCollector,
  ObjectCollector,
  SetCollector,
  Iterators as SyncIterators,
  TallyCollector,
} from 'ts-fluent-iterators';
import * as Iterators from './promiseIterators';
import { AsyncFluentIterator } from '../async/asyncFluentIterator';

import { EventualCollector } from '../collectors';
import { Eventually, EventualMapper, EventualPredicate, EventualReducer } from '../utils';

/**
 * Iterator yielding `Promise` objects with a Fluent interface.
 * @typeParam A The type of elements being iterated.
 */
export class PromiseIterator<A> implements Iterator<Promise<A>>, Iterable<Promise<A>> {
  /**
   * Creates an {@link PromiseIterator} by wrapping an `Iterator<Promise<A>>`
   * @param iter The `Iterator` being wrapped into a `PromiseIterator`
   */
  constructor(protected readonly iter: Iterator<Promise<A>>) {}

  /**
   * Creates an empty {@link PromiseIterator}.  The returned iterator will not yield any element.
   * @typeParam A the type of elements of the `PromiseIterator`
   * @returns An empty {@link PromiseIterator}
   */
  static empty<A = never>(): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.empty());
  }

  /**
     Creates a singleton operator.  The returned iterator will yield a single or no element.
     * @typeParam A the type of elements of the `PromiseIterator`.
     * This is useful to use a fluent interface on class that are not fluent.
     @example
     const str = await PromiseIterator.singleton('foobar').map(f).map(g).first();
     *
     * @returns A `PromiseIterator` yielding at most one element.
     */
  static singleton<A>(a: Eventually<A>): PromiseIterator<A> {
    return new PromiseIterator(a == null ? SyncIterators.empty() : SyncIterators.singleton(Promise.resolve(a)));
  }

  /**
   * Creates a {@link PromiseIterator} from an `IteratorGenerator<Promise<A>>`.
   * @typeParam A the type of elements
   * @param generator Used to generate an `AsyncIterator` that will be wrapped into a `PromiseIterator`
   * @returns A new `PromiseIterator`
   */
  static from<A>(generator: IteratorGenerator<Promise<A>>): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.toIterator(generator));
  }

  /**
   * Collects items from the {@link PromiseIterator} into an {@link EventualCollector}.
   * @typeParam B The result type of the `EventualCollector`.
   * @param collector The `EventualCollector` into which to collect the items
   * @returns A `Promise` of the he result of the `collector`
   * @example
   * const collector = new ArrayCollector<string>;
   * const iter = toPromiseIterator([1,2,3]);
   * const data = await iter.collectTo(collector);
   * // data is [1,2,3]
   */
  collectTo<B>(collector: EventualCollector<A, B>): Promise<B> {
    return Iterators.collectTo(this.iter, collector);
  }

  /**
   * Collects items into an array.
   * @returns a `Promise` of an `Array` consisting of the elements of this {@link PromiseIterator}
   * @example
   * const iter = toPromiseIterator([1,2,3]);
   * const data = await iter.collect();
   * // data is [1,2,3]
   * @remarks
   * This is equivalent to `Promise.all`
   */
  collect(): Promise<A[]> {
    return this.collectTo(new ArrayCollector());
  }

  /**
   * Collects items into a `Set`.
   * @returns a `Promise` of a `Set` consisting of the elements of this {@link PromiseIterator}
   * @example
   * const iter = toPromiseIterator([1,2,3,1,2,3]);
   * const data = await iter.collectToSet();
   * // data is Set { 1,2,3 }
   */
  collectToSet(): Promise<Set<A>> {
    return this.collectTo(new SetCollector());
  }

  /**
   * Collects items into a `Map` by mapping values into keys.
   * @typeParam K The type of the keys of the `Map`
   *
   * @param mapper Maps the values into keys
   * @param collisionHandler  Specifies how to handle the collision. Default is to ignore collision.
   * @returns a `Promise` of a `Map` whose keys are the result of applying the `mapper` to the values of this {@link PromiseIterator} and the values are iterated items.

   * @example
   * const iter = toPromiseIterator("foo","bar","foobar");
   * const data = await iter.collectToMap(s => s.length);
   * // data is Map {3 => "foo", 6 => "foobar"}
   */
  collectToMap<K>(mapper: EventualMapper<A, K>, collisionHandler?: CollisionHandler<K, A>): Promise<Map<K, A>> {
    return this.collectToMap2(async a => [await mapper(a), a], collisionHandler);
  }

  /**
   * Collects items into a `Map` by mapping values into keys and new value
   * @typeParam K The type of the keys of the `Map`
   * @typeParam V The type of the values of the `Map`
   *
   * @param mapper Maps the values into [key, values] pairs
   * @param collisionHandler  Specifies how to handle the collision. Default is to ignore collision.
   * @returns a `Promise` of a `Map` whose entries are the result of applying the `mapper` to the values of this {@link PromiseIterator}.

   * @example
   * const iter = toPromiseIterator(["foo","bar","foobar"])
   * const data = await iter.collectToMap2(s => [s, s.length]);
   * // data is Map { "foo" => 3, "bar" => 3, "foobar" => 6 }
   */
  collectToMap2<K, V>(
    mapper: EventualMapper<A, [K, V]>,
    collisionHandler?: CollisionHandler<K, V>
  ): Promise<Map<K, V>> {
    return this.map(mapper).collectTo(new MapCollector(collisionHandler));
  }

  /**
   * Collects items into a `Record` by mapping values into keys.
   *
   * @param mapper Maps the values into keys
   * @param collisionHandler  Specifies how to handle the collision. Default is to ignore collision.
   * @returns a `Record` whose keys are the result of applying the `mapper` to the values of this {@link FluentIterator} and the values are iterated items.

   * @example
   * const iter = iterator("foo","bar","foobar")
   * const data = iter.collectToObject(s => s.toUpperCase());
   * // data is { FOO: "foo", BAR: "bar", FOOBAR: "foobar" }
   */
  collectToObject(
    mapper: EventualMapper<A, string>,
    collisionHander?: CollisionHandler<string, A>
  ): Promise<Record<string, A>> {
    return this.collectToObject2(async a => [await mapper(a), a], collisionHander);
  }

  /**
   * Collects items into a `Record` by mapping values into keys and new value
   * @typeParam V The type of the values of the `Map`
   *
   * @param mapper Maps the values into [key, values] pairs
   * @param collisionHandler  Specifies how to handle the collision. Default is to ignore collision.
   * @returns a `Promise` of a `Record` whose entries are the result of applying the `mapper` to the values of this {@link PromiseIterator}.

   * @example
   * const iter = toPromiseIterator(["foo","bar","foobar"])
   * const data = await iter.collectToObject2(s => [s, s.length]);
   * // data is { foo: 3, bar: 3, foobar: 6 }
   */
  collectToObject2<V>(
    mapper: EventualMapper<A, [string, V]>,
    collisionHandler?: CollisionHandler<string, V>
  ): Promise<Record<string, V>> {
    return this.map(mapper).collectTo(new ObjectCollector(collisionHandler));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of elements for which the `predicate` evaluates to true.
   *
   * @param predicate the predicate on which the evaluate the items.
   * @returns a new {@link AsyncFluentIterator} consisting of elements of this {@link AsyncFluentIterator} for which the `predicate` evaluates to true.
   * @example
   * toPromiseiterator([1,8,2,3,4,6]).filter(x => x % 2 === 1);
   * // asynchronously yields 1, 2
   */
  filter(predicate: EventualPredicate<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.filter(this.iter, predicate));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of elements of this {@link AsyncFluentIterator} that are not `null` nor `undefined`
   *
   * @returns a new {@link AsyncFluentIterator} where all the `null` or `undefined` elements are removed.
   */
  removeNull(): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.removeNull(this.iter));
  }

  /**
   * Returns a new {@link PromiseIterator} consisting of applying the {@link Mapper} to all elements of this {@link PromiseIterator}.
   * @typeParam B The type of the elements of the returned {@link PromiseIterator}
   * @param mapper Transformation applied to elements of this {@link PromiseIterator}
   * @returns A new {@link AsyncFluentIterator}
   * @example
   * const iter = toPromiseIterator(['foo','bar',foobar'])
   * iter.map(s => s.length)
   * // asynchronously yields 3, 3, 6
   */
  map<B>(mapper: EventualMapper<A, B>): PromiseIterator<B> {
    return new PromiseIterator(Iterators.map(this.iter, mapper));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of applying the
   * {@link Mapper} to all elements of this {@link PromiseIterator} and
   * filtering those for which the {@link EventualMapper} returned null or
   * undefined
   *
   * @typeParam B The type of the elements of the returned {@link AsyncFluentIterator}
   * @param mapper Transformation applied to elements of this {@link PromiseIterator}
   * @returns A new {@link AsyncFluentIterator}
   * @remarks
   * ```ts
   * iter.filterMap(mapper)
   * ```
   * is equivalent to
   * ```ts
   * iter.map(mapper).removeNull()
   * ```
   */
  filterMap<B>(mapper: EventualMapper<A, B | null | undefined>): AsyncFluentIterator<B> {
    return new AsyncFluentIterator(Iterators.filterMap(this.iter, mapper));
  }

  /**
   * Fluent version of `Promise.allSettled`
   */
  allSettled(): Promise<PromiseSettledResult<A>[]> {
    return Iterators.allSettled(this.iter);
  }

  /**
   * Fluent version of `Promise.race`
   */
  race(): Promise<A | undefined> {
    return Iterators.race(this.iter);
  }

  /**
   * Fluent version of `Promise.any`
   */
  any(): Promise<A | undefined> {
    return Iterators.any(this.iter);
  }

  /**
   * Returns a new {@link PromiseIterator} that
   * yields the same elements as this {@link PromiseIterator}
   * and executes the {@link EventualMapper | mapper} on each element.
   *
   *
   * @param mapper the operation to be invoked on each element.
   *
   * @remarks This can be useful to see intermediate steps of complex {@link PromiseIterator}.  The results of invoking the `mapper` are ignored unless it throwws.
   * @example
   * const iter = toPromise([1,2,3])
   * iter.tap(x => console.log(`before filter ${x}`))
   *      .filter(x => x % 2 === 0)
   *      .tap(x => console.log(`after filter: ${x}`))
   *      .collect();
   * // ouputs:
   * // before filter 1
   * // before filter 2
   * // after filter: 2
   * // before filter 3
   * // result : [ 2 ]
   */
  tap(mapper: EventualMapper<A, any>): PromiseIterator<A> {
    return new PromiseIterator(Iterators.tap(this.iter, mapper));
  }

  /**
   * Applies the {@link EventualMapper | mapper} to each element of this {@link PromiseIterator}
   *
   * @param mapper the operation to be invoked on each element.
   * @example
   * await iter.forEach(console.log)
   * @remarks
   * The results of invoking the `mapper` are ignored unless it throws.
   *
   * This is equivalent to
   * ```
   * for (const v of iter) await mapper(await v);
   * ```
   */
  forEach(mapper: EventualMapper<A, any>): Promise<void> {
    return Iterators.forEach(this.iter, mapper);
  }

  /**
   * Returns a new {@link PromiseIterator} for {@link EventualMapper} that accept a `Promise` rather than an `Awaited` value.
   * @param mapper {@link EventualMapper} accepting a `Promise<A>`
   *
   * @example
   * const iter = toPromiseIterator([1,2]);
   * await iter.flatmap(async x => 2 * (await x))
   * yields: Promise(2), Promise(4)
   */
  flatmap<B>(mapper: EventualMapper<Promise<A>, B>): PromiseIterator<B> {
    return new PromiseIterator(Iterators.flatmap(this.iter, mapper));
  }

  /**
   * Returns a new {@link PromiseIterator} that is the result of appending its argument to this {@link PromiseIterator}
   *
   * @param items An `Iterator` or `Iterable` whose items are appended to this {@link PromiseIterator}.
   *
   * @example
   * toPromiseIterator([1,2,3]).append([4,5,6])
   * // yields Promise(1), ..., Promise(6)
   */
  append(items: Iterator<Promise<A>> | Iterable<Promise<A>>): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.append(this.iter, SyncIterators.toIterator(items)));
  }

  /**
   * Returns a new {@link PromiseIterator} that is the result of prepending its argument to this {@link PromiseIterator}
   *
   * @param items An `Iterator` or `Iterable` whose items are prepended to this {@link PromiseIterator}.
   *
   * @example
   * toPromiseIterator([1,2]).prepend([5,6])
   * // yields Promise(5), Promise(6), Promise(1), Promise(2)
   */
  prepend(items: Iterator<Promise<A>> | Iterable<Promise<A>>): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.prepend(this.iter, SyncIterators.toIterator(items)));
  }

  /**
   * Returns a new {@link PromiseIterator} that is the result of apepending all its argument to this {@link PromiseIterator}
   *
   * @param iterables An `Array of `Iterator` or `Iterable` whose items are appended to this {@link FluentIterator}.
   *
   * @example
   * toPromiseIterator([1,2,3]).concat([4,5,6], [7,8,9])
   * // yields Promise(1), ... Promise(4),, ... , Promise(7), ...
   */
  concat(...iterables: Array<Iterator<Promise<A>> | Iterable<Promise<A>>>): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.concat(this.iter, ...iterables.map(SyncIterators.toIterator)));
  }

  /**
   * Returns a new {@link FluentIterator} that is the result of transforming this {@link FluentIterator}.
   * This method allows to extends the class {@link FluentIterator} using `Iterator` transformation`
   * @example
   * function doublePromiseIterator(Iterator<Promise<number>>: iter) {
   *    for (;;) {
   *       const item = iter.next();
   *       if (item.done) break;
   *       yield item.value.then(v => 2 * v)
   *    }
   * }
   * await iterator([1,2,3]).toPromise().transform(doublePromiseIterator).collect()
   * // [2, 4, 6]
   */
  transform<B>(mapper: Mapper<Iterator<Promise<A>>, Iterator<Promise<B>>>): PromiseIterator<B> {
    return new PromiseIterator(mapper(this.iter));
  }

  /** Returns the resulf of applying the {@link Mapper} to the wrapped iterator.
   * This method allows to use an Iterator function in a fluent way.
   * @example
   * function sumOfIterator(Iterator<number>: iter) {
   *    let sum = 0;
   *    for (;;) {
   *       const item = iter.next();
   *       if (item.done) return sum;
   *       sum += item.value;
   *    }
   * }
   *
   * iterator([1,2,3]).apply(sumOfiterator);
   * // returns 6
   */
  apply<B = A>(mapper: Mapper<Iterator<Promise<A>>, Eventually<B>>): Eventually<B> {
    return mapper(this.iter);
  }

  /**
   * Returns the first element of this {@link PromiseIterator} or `undefined` if this {@link PromiseIterator} is empty.
   *
   * @returns The first element of this {@link PromiseIterator} or `undefined`.
   */
  first(): Promise<A | undefined> {
    return Iterators.first(this.iter);
  }

  /**
   * Returns a {@link PromiseIterator} yielding the first `n` elements of this {@link PromiseIterator}.
   *
   * @param n The number of elements to take
   * @returns a {@link PromiseIterator} yielding the first `n` elements of this {@link PromiseIterator}.
   * @remarks If there are less than `n` elements in this {@link PromiseIterator}, then only the available elements will be yielded.
   */
  take(n: number): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.take(this.iter, n));
  }

  /**
   * Returns a {@link PromiseIterator} skipping the first `n` elements of this {@link PromiseIterator} and then yielding the subsequent ones.
   *
   * @param n The number of elements to skip
   * @returns a {@link PromiseIterator} skpping the first `n` elements of this {@link PromiseIterator}.
   * @remarks If there are less than `n` elements in this {@link PromiseIterator}, then an empty {@link PromiseIterator} is returned.
   */
  skip(n: number): PromiseIterator<A> {
    return new PromiseIterator(SyncIterators.skip(this.iter, n));
  }

  /**
   * Returns true if this {@link PromiseIterator} yields an
   * element for which the {@link EventualPredicate | predicate}
   * evaluates to true.
   *
   * @param predicate The predicate to evaluate.

   * @returns true if this {@link PromiseIterator} yields an
   * element for which the {@link EventualPredicate | predicate}
   * evaluates to true, false otherwise.
   */
  contains(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.contains(this.iter, predicate);
  }

  /**
   * Returns true if this {@link PromiseIterator} yields an element equals to `target`
   *
   * @param target value to look for
   * @returns A boolean promise resolving to true if this {@link AsyncFluentIterator} yields an element equals to `target`, or resolving to false otherwise.
   * @ @remarks
   * ```ts
   * iter.includes(target)
   * ```
   * is equivalent to
   * ```ts
   * iter.contains(x => x === target)
   * ```
   */
  includes(target: Eventually<A>): Promise<boolean> {
    return Iterators.includes(this.iter, target);
  }

  /**
   * Executes the {@link EventualReducer | reducer} function on each element
   * of this {@link PromiseIterator}, in order, passing in
   * the return value from the calculation on the preceding element. The
   * final result of running the reducer across all elements of the array
   * is a single value.

   * @typeParam B the type into which the elements are being folded to
   * @param reducer The reducer to be applied at each iteration.
   * @param initialValue The value of the accumulator to be used in the first call to `reducer`

   * @remarks
   * If the {@link PromiseIterator} is empty, `initialValue` is returned.
   *
   * @example
   * To compute the sum of elements:
   * const sum = await toPromiseIterator([1,2,3])
   *    .fold((acc, x) => acc + x, 0)
   * // sum = 6
   */
  fold<B>(reducer: EventualReducer<A, B>, initialValue: B): Promise<B> {
    return Iterators.fold(this.iter, reducer, initialValue);
  }

  /**
   * Special case of {@link PromiseIterator.fold} where items being iteraded on and the accumulator are of the same type.

   * @param reducer The reducer to be applied at each iteration.
   * @param initialValue The value of the accumulator to be used in the first call to `reducer`. If omitted, the first element of this {@link PromiseIterator} is used.

   * @remarks
   * If the {@link PromiseIterator} is empty, `initialValue` is returned.
   *
   * @example
   * To compute the sum of elements:
   * const sum = await toPromiseIterator([1,2,3])
   *    .reduce((acc, x) => acc + x)
   * // sum = 6
   */
  reduce(reducer: EventualReducer<A, A>, initialValue?: A): Promise<A | undefined> {
    return Iterators.reduce(this.iter, reducer, initialValue);
  }

  /**
   * Applies a reducer function over this {@link AsyncFluentIterator}, returning a {@link FluentIterator} yielding each intermediate reduce result.
   *
   * Similar to `fold`, but instead of returning only the final result,
   * `scan()` emits the accumulated value at each step. This is useful for calculating running
   * totals, prefix sums, rolling aggregates, and more.
   *
   * If this {@link FluentIterator} is empty, no values are emitted unless `emitInitial` is `true`.

   * @template B  The type of the accumulated result.
   *
   * @param reducer The reducer function to be applied at each iteration
   *
   *
   * @param initialValue The initial value of the accumulator.
   *
   * @param emitInitial

   * @returns {AsyncFluentIterator<B>}
   *   A new {@link AsyncFluentIterator} that emits the accumulator at each step.
   *
   * @example
   * toPromiseIterator([1, 2, 3, 4]).scan((acc, x) => acc + x, 0) // yields 1, 3, 6, 10
   *
   */
  scan<B>(reducer: EventualReducer<A, B>, initialValue: B, emitInitial = false): AsyncFluentIterator<B> {
    return new AsyncFluentIterator(Iterators.scan(this.iter, reducer, initialValue, emitInitial));
  }

  /**
   * Returns a new {@link PromiseIterator} that yields pairs of elements
   * yielded by each Iterators which are navigated in parallel.
   * The length of the new {@link PromiseIterator} is equal to the length the shorter iterator.
   *
   * @typeParam B The type of elements of the `other` iterator.
   * @param other The iterator that is combined with this one.
   *
   * @example
   * const iter = toPromiseIterator([1, 2, 3]);
   * const zipped = iter.zip(asyncIterator(['a', 'b']));
   * // zipped will yield Promise([1,"a"]), Promise([2,"b"])
   */
  zip<B>(other: Iterator<Promise<B>> | Iterable<Promise<B>>): PromiseIterator<[A, B]> {
    return new PromiseIterator(Iterators.zip(this.iter, SyncIterators.toIterator(other)));
  }

  /**
   * Returns a new {@link PromiseIterator} that yields pairs of elements
   * consisting of the elements yielded by this
   * @{link PromiseIterator} and their index in the iteration.
   *
   * @param start The starting index
   *
   * @example
   * const iter = toPromiseiterator(['a', 'b', 'c']);
   * const enumerated = iter.enumerate(10);
   * // enumerated will yield Promise(["a", 10]), Promise(["b", 11]), Promise(["c", 12])
   *
   */
  enumerate(start = 0): PromiseIterator<[A, number]> {
    return new PromiseIterator(Iterators.enumerate(this.iter, start));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that yields elements of this {@link PromiseIterator} while the {@link EventualPredicate | predicate} evaluates to `true`.
   *
   * @param predicate The predicate being evaluated
   * @example
   * toPromiseIterator([1, 2, 3]).takeWhile(x => x < 2); // async yields 1
   * toPromiseIterator([1, 2, 3]).takeWhile(x => x > 2); // empty async iterator
   */
  takeWhile(predicate: EventualPredicate<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.takeWhile(this.iter, predicate));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that skips elements of this
   * {@link PromiseIterator} until the {@link EventualPredicate | predicate}
   * evaluates to `true` and yields the subsequent ones.
   *
   * @param predicate The predicate being evaluated
   * @example
   * toPromiseIterator([1, 2, 3]).skipWhile(x => x < 2); // asynchronously yields 2, 3
   * toPromiseiterator([1, 2, 3]).skipWhile(x => x > 2); // asynchronously yields 1, 2, 3
   */
  skipWhile(predicate: EventualPredicate<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.skipWhile(this.iter, predicate));
  }

  /**
   * Returns a Promise resolving to `true` if the {@link
   * EventualPredicate | predicate} argument evalatues to true for all
   * items of this {@link PromiseIterator}, or resolving to false
   * otherwsie.
   *
   * @param predicate The predicate being evaluated
   * @example
   * await toPromiseIterator([1, 2]).all(x => x > 0); // true
   * await toPromiseIterator([1, 2]).all(x => x >= 2); // false
   * await PromiseIterator.empty().all(_ => false); // true;
   */
  all(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.all(this.iter, predicate);
  }

  /**
   * Returns a `Promise` resolving to `true` if the {@link
   * EventualPredicate | predicate} argument evalatues to true for
   * some items of this {@link PromiseIterator}, or resolving to
   * false otherwsie.
   *
   * @param predicate The predicate being evaluated
   * @example
   * await toPromiseIterator([1, 2]).some(x => x > 1); // true
   * await toPromiseIterator([1, 2]).some(x => x > 2); // false
   * await PromiseIterator.empty().some(_ => true); // false;
   */
  some(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.some(this.iter, predicate);
  }

  /**
   * Returns the number of items in this {@link PromiseIterator}.
   * @example
   * await toPromiseIterator([1,2]).count(); // 2
   * await PromiseIterator.empty().count(); 0
   */
  count(): Promise<number> {
    return this.collectTo(new CountCollector());
  }

  /**
   * Returns the minimum element according to the argument {@link Comparator | comparator}.
   *
   * @param comparator The {link Comparator} used to order the elements.
   * @example
   * await toPromiseIterator([1,2]).min();
   * // 1
   *
   * await toPromiseIterator(['foo','foobar']).min(
   *    (s1,s2) => s1.length - s2.length
   * );
   * // 'foo'
   (
   * await PrommiseIterator.empty().min();
   * // undefined
   */
  min(comparator?: Comparator<A>): Promise<A | undefined> {
    return this.collectTo(new MinCollector(comparator));
  }

  /**
   * Returns the maximum element according to the argument {@link Comparator | comparator}.
   *
   * @example
   * await toPromiseIterator([1,2]).max();
   * // 2
   *
   * await toPromiseIterator(['foo','foobar']).max(
   *   (s1,s2) => s1.length - s2.length
   * );
   * // 'foobar'

   * await PromiseIterator.empty().max(); // undefined
   */
  max(comparator?: Comparator<A>): Promise<A | undefined> {
    return this.collectTo(new MaxCollector(comparator));
  }

  /**
   * Returns a Promise of the last element of this {@link PromiseIterator}
   *
   * @example
   * await toPromiseIterator([1,2]).last();
   * // 2
   *
   * await PromiseIterator.empty().last()
   * // undefined
   */
  last(): Promise<A | undefined> {
    return this.collectTo(new LastCollector());
  }

  /**
   * Joins items of this {@link PromiseIterator} into a string.
   *
   * @param separator string used to delimite elements
   * @param prefix string used to prefix the resulting string
   * @param prefix string used to suffix the resulting string
   *
   * @example
   *
   * await toPromiseIterator([1,2,3]).join(',','[',']');
   * // "[1,2,3]"
   *
   * @remarks
   * The items are converted into a string using string-interpolation.
   */
  join(separator?: string, prefix?: string, suffix?: string): Promise<string> {
    return this.collectTo(new JoinCollector(separator, prefix, suffix));
  }

  /**
   * Returns a `Promise` of a `Map` where keys are the result of applying the parameter {@link EventualMapper | mapper} to the elements of the
   * this {@link PromiseIterator} and the values are Arrays of
   * the elements that are mapped to the same key.

   * @param mapper The {@link EventualMapper} used to group items.
   * @example
   * await toPromiseIterator([1,2,3]).groupBy(x => x % 2 === 0);
   // Map { true => [2], false => [1, 3]}
   */
  groupBy<K>(mapper: EventualMapper<A, K>): Promise<Map<K, A[]>> {
    return this.groupBy2(async a => [await mapper(a), a]);
  }

  /**
   * Returns a `Promise` of a `Map` where entries are the result of applying the parameter {@link EventualMapper | mapper} to the elements of the
   * this {@link PromiseIterator},

   * @param mapper The {@link EventualMapper} used to group items.
   * @example
   * await toPromiseIterator([1,2,3]).groupBy2(x => [x % 2 === 0, 2 * x];
   // Map { true => [4], false => [2, 6]}
   */
  groupBy2<K, V>(mapper: EventualMapper<A, [K, V]>): Promise<Map<K, V[]>> {
    return this.map(mapper).collectTo(new GroupByCollector());
  }

  /**
   * Returns a `Promise` of a `Map` of the count of the occurences of each items of
   * this {@link PromiseIterator},

   * @example
   * await toPromiseIterator([foo','bar','foo']).tally();
   // Map { 'foo' => 2, bar => 1 }
   */
  tally(): Promise<Map<A, number>> {
    return this.collectTo(new TallyCollector());
  }

  /**
   * Returns a new {@link PromiseIterator} consiting of
   * partitions (arrays) of at most `size` elements.
   *
   * @param size The size of the partitions.
   *
   * @example
   * toPromiseIterator([1, 2, 3, 4, 5]).partition(2);
   * // yields Promise([1, 2](, Promise([3, 4](, Promise([5])
   *
   * @remarks The last partition may contain less than `size` elements but is
   * never empty.
   */
  partition(size: number): FluentIterator<Promise<A>[]> {
    return new FluentIterator(SyncIterators.partition(this.iter, size));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of distinct elements from this iterator.
   *
   * @param mapper Used to determine distinctness of elements. Default to <code>identity</code>
   *
   * @example
   * await promiseIterator(toPromise[1,2,2,3,1,4])).distinct().collect();
   * [1,2,3,4]
   *
   * await promiseIterator (toPromise[1,2,2,3,1,4]), x => x %2).distinct().collect();
   * [1,2]
   */
  distinct<K = A>(mapper?: EventualMapper<A, K>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.distinct(this.iter, mapper));
  }

  /**
   * Used to make this {@link PromiseIterator} being seen as an
   * `Iterable<Promise<A>>`. This allows them to be used in APIs expecting an
   * `Iterable<Promise<A>>`
   */
  [Symbol.iterator](): Iterator<Promise<A>> {
    return this.iter;
  }

  /**
   * Used to make this {@link PromiseIterator} being seen as an
   * `Iterator<Promise<A?>`.  This allows {@link PromiseIterator} objects to be
   * used in APIs expecting an `Iterator<Promise<A>>`
   */
  next(): IteratorResult<Promise<A>> {
    return this.iter.next();
  }
}

/**
 * Alias for {@link PromiseIterator.empty}
 */
export function promiseEmptyIterator<A = never>(): PromiseIterator<A> {
  return PromiseIterator.empty();
}

/**
 * Alias for {@link PromiseIterator.from}
 */
export function promiseIterator<A>(generator: IteratorGenerator<Promise<A>>): PromiseIterator<A> {
  return PromiseIterator.from(generator);
}

/**
 * Helper function to create a {@link PromiseIterator} from synchronous {@link IteratorGenerator}.
 */
export function toPromiseIterator<A>(generator: IteratorGenerator<A>): PromiseIterator<A> {
  return promiseIterator(Iterators.toPromise(generator));
}

/**
 * Alias for {@link PromiseIterator.singleton}
 */
export function promiseSingletonIterator<A>(a: Eventually<A>): PromiseIterator<A> {
  return PromiseIterator.singleton(a);
}
