import {
  ArrayCollector,
  CollisionHandler,
  Comparator,
  CountCollector,
  GroupByCollector,
  LastCollector,
  MapCollector,
  Mapper,
  MaxCollector,
  MinCollector,
  MinMax,
  MinMaxCollector,
  ObjectCollector,
  SetCollector,
  StringJoiner,
  TallyCollector,
} from 'ts-fluent-iterators';
import * as Iterators from './asyncIterators';
import { EventualCollector } from '../collectors';
import {
  AsyncIteratorGenerator,
  EventualIterable,
  EventualIterator,
  Eventually,
  EventualMapper,
  EventualPredicate,
  EventualReducer,
} from '../utils';

/**
 * AsyncIterator with a Fluent interface.
 * @typeParam A The type of elements being iterated.
 */
export class AsyncFluentIterator<A> implements AsyncIterator<A>, AsyncIterable<A> {
  /**
   * Creates an {@link AsyncFluentIterator} by wrapping an `AsyncIterator`
   * @param iter The `AsyncIterator` being wrapped into a `AsyncFluentIterator`
   */
  constructor(protected readonly iter: AsyncIterator<A>) {}

  /**
   * Creates an empty {@link AsyncFluentIterator}.  The returned iterator will not yield any element.
   * @typeParam A the type of elements of the `AsyncFluentIterator`
   * @returns An empty {@link AsyncFluentIterator}
   */
  static empty<A = never>(): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.empty());
  }

  /**
     Creates a singleton operator.  The returned iterator will yield a single or no element.
     * @typeParam A the type of elements of the `AsyncFluentIterator`.
     * This is useful to use a fluent interface on class that are not fluent.
     @example
     const str = await AsyncFluentIterator.singleton('foobar').map(f).map(g).first();
     *
     * @returns A `AsyncFluentIterator` yielding at most one element.
     */
  static singleton<A>(a: A): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.singleton(a));
  }

  /**
   * Creates a {@link AsyncFluentIterator} from an `AsyncIteratorGenerator`.
   * @typeParam A the type of elements of the `FluentIterator`
   * @param generator Used to generate an `AsyncIterator` that will be wrapped into a `AsyncFluentIterator`
   * @returns A new `AsyncFluentIterator`
   */
  static from<A>(generator: AsyncIteratorGenerator<A>): AsyncFluentIterator<A> {
    if (generator instanceof AsyncFluentIterator) return generator;
    return new AsyncFluentIterator(Iterators.toAsyncIterator(generator));
  }

  /**
   * Collects items from the {@link AsyncFluentIterator} into an {@link EventualCollector}.
   * @typeParam B The result type of the `Collector`.
   * @param collector The `Collector` into which to collect the items
   * @returns A `Promise` of the he result of the `collector`
   * @example
   * const collector = new ArrayCollector<string>;
   * const iter = asyncIterator([1,2,3]);
   * const data = await iter.collectTo(collector);
   * // data is [1,2,3]
   */
  collectTo<B>(collector: EventualCollector<A, B>): Promise<B> {
    return Iterators.collectTo(this.iter, collector);
  }

  /**
   * Collects items into an array.
   * @returns a `Promise` of an `Array` consisting of the elements of this {@link AsyncFluentIterator}
   * @example
   * const iter = asyncIterator([1,2,3]);
   * const data = await iter.collect();
   * // data is [1,2,3]
   */
  collect(): Promise<A[]> {
    return this.collectTo(new ArrayCollector());
  }

  /**
   * Collects items into a `Set`.
   * @returns a `Promise` of a `Set` consisting of the elements of this {@link AsyncFluentIterator}
   * @example
   * const iter = asyncIterator([1,2,3,1,2,3]);
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
   * @returns a `Promise` of a `Map` whose keys are the result of applying the `mapper` to the values of this {@link AsyncFluentIterator} and the values are iterated items.

   * @example
   * const iter = asyncIterator("foo","bar","foobar");
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
   * @returns a `Promise` of a `Map` whose entries are the result of applying the `mapper` to the values of this {@link AsyncFluentIterator}.

   * @example
   * const iter = asyncIterator("foo","bar","foobar")
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
   * @returns a `Promise` of a `Record` whose entries are the result of applying the `mapper` to the values of this {@link AsyncFluentIterator}.

   * @example
   * const iter = asyncIterator("foo","bar","foobar")
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
   * asyncIterator([1,8,2,3,4,6]).filter(x => x % 2 === 1);
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
   * Returns a new {@link AsyncFluentIterator} consisting of applying the {@link Mapper} to all elements of this {@link AsyncFluentIterator}.
   * @typeParam B The type of the elements of the returned {@link AsyncFluentIterator}
   * @param mapper Transformation applied to elements of this {@link AsyncFluentIterator}
   * @returns A new {@link FluentIterator}
   * @example
   * const iter = asyncIterator(['foo','bar',foobar'])
   * iter.map(s => s.length)
   * // asynchronously yields 3, 3, 6
   */
  map<B>(mapper: EventualMapper<A, B>): AsyncFluentIterator<B> {
    return new AsyncFluentIterator(Iterators.map(this.iter, mapper));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of applying the
   * {@link Mapper} to all elements of this {@link AsyncFluentIterator} and
   * filtering those for which the {@link EventualMapper} returned null or
   * undefined
   *
   * @typeParam B The type of the elements of the returned {@link AsyncFluentIterator}
   * @param mapper Transformation applied to elements of this {@link AsyncFluentIterator}
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
   * Returns the first element of this {@link AsyncFluentIterator} or `undefined` if this {@link AsyncFluentIterator} is empty.
   *
   * @returns The first element of this {@link AsyncFluentIterator} or `undefined`.
   */
  first(): Promise<A | undefined> {
    return Iterators.first(this.iter);
  }

  /**
   * Returns a new {@link FluentIterator} that is the result of transforming this {@link FluentIterator}.
   * This method allows to extends the class {@link FluentIterator} using `Iterator` transformation`
   * @example
   * async function *doubleIterator(AsyncIterator<number>: iter) {
   *    for (;;) {
   *       const item = await iter.next();
   *       if (item.done) break;
   *       yield item.value * 2;
   *    }
   * }
   * await asyncIterator([1,2,3]).transform(doubleiterator).collect()
   * // [2, 4, 6]
   */
  transform<B>(mapper: Mapper<AsyncIterator<A>, AsyncIterator<B>>): AsyncFluentIterator<B> {
    return new AsyncFluentIterator(mapper(this.iter));
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
  apply<B = A>(mapper: EventualMapper<AsyncIterator<A>, B>): Eventually<B> {
    return mapper(this.iter);
  }

  /**
   * Returns a {@link AsyncFluentIterator} yielding the first `n` elements of this {@link AsyncFluentIterator}.
   *
   * @param n The number of elements to take
   * @returns a {@link AsyncFluentIterator} yielding the first `n` elements of this {@link AsyncFluentIterator}.
   * @remarks If there are less than `n` elements in this {@link AsyncFluentIterator}, then only the available elements will be yielded.
   */
  take(n: number): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.take(this.iter, n));
  }

  /**
   * Returns a {@link AsyncFluentIterator} skipping the first `n` elements of this {@link AsyncFluentIterator} and then yielding the subsequent ones.
   *
   * @param n The number of elements to skip
   * @returns a {@link AsyncFluentIterator} skpping the first `n` elements of this {@link AsyncFluentIterator}.
   * @remarks If there are less than `n` elements in this {@link AsyncFluentIterator}, then an empty {@link AsyncFluentIterator} is returned.
   */
  skip(n: number): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.skip(this.iter, n));
  }

  /**
   * Returns true if this {@link AsyncFluentIterator} yields an
   * element for which the {@link EventualPredicate | predicate}
   * evaluates to true.
   *
   * @param predicate The predicate to evaluate.

   * @returns true if this {@link AsyncFluentIterator} yields an
   * element for which the {@link EventualPredicate | predicate}
   * evaluates to true, false otherwise.
   */
  contains(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.contains(this.iter, predicate);
  }

  /**
   * Returns true if this {@link AsyncFluentIterator} yields an element equals to `target`
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
   * of this {@link AsyncFluentIterator}, in order, passing in
   * the return value from the calculation on the preceding element. The
   * final result of running the reducer across all elements of the array
   * is a single value.

   * @paramType B the type into which the elements are being folded to
   * @param reducer The reducer to be applied at each iteration.
   * @param initialValue The value of the accumulator to be used in the first call to `reducer`

   * @remarks
   * If the {@link AsyncFluentIterator} is empty, `initialValue` is returned.
   *
   * @example
   * To compute the sum of elements of an array:
   * const sum = await asyncIterator([1,2,3])
   *    .fold((acc, x) => acc + x, 0)
   * // sum = 6
   */
  fold<B>(reducer: EventualReducer<A, B>, initialValue: B): Promise<B> {
    return Iterators.fold(this.iter, reducer, initialValue);
  }

  /**
   * Special case of {@link AsyncFluentIterator.fold} where items being iteraded on and the accumulator are of the same type.

   * @param reducer The reducer to be applied at each iteration.
   * @param initialValue The value of the accumulator to be used in the first call to `reducer`. If omitted, the first element of this {@link AsyncFluentIterator} is used.

   * @remarks
   * If the {@link AsyncFluentIterator} is empty, `initialValue` is returned.
   *
   * @example
   * To compute the sum of elements of an array:
   * const sum = await asyncIterator([1,2,3])
   *    .reduce((acc, x) => acc + x)
   * // sum = 6
   */
  reduce(reducer: EventualReducer<A, A>, initialValue?: A): Promise<A | undefined> {
    return Iterators.reduce(this.iter, reducer, initialValue);
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that yields pairs of elements
   * yielded by each Iterators which are navigated in parallel.
   * The length of the new {@link AsyncFluentIterator} is equal to the length the shorter iterator.
   *
   * @typeParam B The type of elements of the `other` iterator.
   * @param other The iterator that is combined with this one.
   *
   * @example
   * const iter = asyncIterator([1, 2, 3]);
   * const zipped = iter.zip(asyncIterator(['a', 'b']));
   * // zipped will yield [1,"a"], [2,"b"]
   */
  zip<B>(other: AsyncIterator<B> | AsyncIterable<B>): AsyncFluentIterator<[A, B]> {
    return new AsyncFluentIterator(Iterators.zip(this.iter, Iterators.toAsyncIterator(other)));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that yields pairs of elements
   * consisting of the elements yielded by this
   * @{link AsyncFluentIterator} and their index in the iteration.
   *
   * @param start The starting index
   *
   * @example
   * const iter = asyncIterator(['a', 'b', 'c']);
   * const enumerated = iter.enumerate(10);
   * // enumerated will asynchronously yield ["a", 10], ["b", 11], ["c", 12]
   *
   */
  enumerate(start = 0): AsyncFluentIterator<[A, number]> {
    return new AsyncFluentIterator(Iterators.enumerate(this.iter, start));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that
   * yields the same elements as this {@link AsyncFluentIterator}
   * and executes the {@link EventualMapper | mapper} on each element.
   *
   *
   * @param mapper the operation to be invoked on each element.
   *
   * @remarks This can be useful to see intermediate steps of complex {@link AsyncFluentIterator}.  The results of invoking the `mapper` are ignored unless it throwws.
   * @example
   * const iter = asyncIterator([1,2,3])
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
  tap(mapper: EventualMapper<A, any>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.tap(this.iter, mapper));
  }

  /**
   * Applies the {@link EventualMapper | mapper} to each element of this {@link FluentIterator}
   *
   * @param mapper the operation to be invoked on each element.
   * @example
   * await iter.forEach(console.log)
   * @remarks
   * The results of invoking the `mapper` are ignored unless it throws.
   *
   * This is equivalent to
   * ```
   * for (await const v of iter) await mapper(v);
   * ```
   */
  forEach(mapper: EventualMapper<A, any>): Promise<void> {
    return Iterators.forEach(this.iter, mapper);
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that is the result of appending its argument to this {@link AsyncFluentIterator}
   *
   * @param items An `Iterator` or `Iterable` whose items are appended to this {@link AsyncFluentIterator}.
   *
   * @example
   * asyncIterator([1,2,3]).append([4,5,6])
   * // asynchronously yields 1, 2, 3, 4, 5, 6
   */
  append(items: EventualIterator<A> | EventualIterable<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.append(this.iter, Iterators.toEventualIterator(items)));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that is the result of prepending its argument to this {@link AsyncFluentIterator}
   *
   * @param items An `Iterator` or `Iterable` whose items are prepended to this {@link AsyncFluentIterator}.
   *
   * @example
   * asyncIterator([1,2,3]).prepend([4,5,6])
   * // asynchronously yields 4, 5, 6, 1, 2, 3
   */
  prepend(items: EventualIterator<A> | EventualIterable<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.prepend(this.iter, Iterators.toEventualIterator(items)));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that is the result of apepending all its argument to this {@link AsyncFluentIterator}
   *
   * @param iterables An `Array of `Iterator` or `Iterable` whose items are appended to this {@link FluentIterator}.
   *
   * @example
   * asyncIterator([1,2,3]).concat([4,5,6], [7,8,9])
   * // asynchronously yields 1, 2 ,3, 4, 5, 6, 7, 8, 9
   */
  concat(...iterables: Array<EventualIterable<A> | EventualIterator<A>>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.concat(this.iter, ...iterables.map(Iterators.toEventualIterator)));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that yields elements of this {@link FluentIterator} while the {@link EventualPredicate | predicate} evaluates to `true`.
   *
   * @param predicate The predicate being evaluated
   * @example
   * asyncIeterator([1, 2, 3]).takeWhile(x => x < 2); // async yields 1
   * asyncIterator([1, 2, 3]).takeWhile(x => x > 2); // empty async iterator
   */
  takeWhile(predicate: EventualPredicate<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.takeWhile(this.iter, predicate));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} that skips elements of this
   * {@link AsyncFluentIterator} until the {@link EventualPredicate | predicate}
   * evaluates to `true` and yields the subsequent ones.
   *
   * @param predicate The predicate being evaluated
   * @example
   * asyncIterator([1, 2, 3]).skipWhile(x => x < 2); // asynchronously yields 2, 3
   * asyncIterator([1, 2, 3]).skipWhile(x => x > 2); // asynchronously yields 1, 2, 3
   */
  skipWhile(predicate: EventualPredicate<A>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.skipWhile(this.iter, predicate));
  }

  /**
   * Returns a Promise resolving to `true` if the {@link
   * EventualPredicate | predicate} argument evalatues to true for all
   * items of this {@link AsyncFluentIterator}, or resolving to false
   * otherwsie.
   *
   * @param predicate The predicate being evaluated
   * @example
   * await asyncIterator([1, 2]).all(x => x > 0); // true
   * await asyncIterator([1, 2]).all(x => x >= 2); // false
   * await AsyncFluentIterator.empty().all(_ => false); // true;
   */
  all(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.all(this.iter, predicate);
  }

  /**
   * Returns a `Promise` resolving to `true` if the {@link
   * EventualPredicate | predicate} argument evalatues to true for
   * some items of this {@link AsyncFluentIterator}, or resolving to
   * false otherwsie.
   *
   * @param predicate The predicate being evaluated
   * @example
   * await asyncIterator([1, 2]).some(x => x > 1); // true
   * await asyncIterator([1, 2]).some(x => x > 2); // false
   * await AsyncFluentIterator.empty().some(_ => true); // false;
   */
  some(predicate: EventualPredicate<A>): Promise<boolean> {
    return Iterators.some(this.iter, predicate);
  }

  /**
   * Returns the number of items in this {@link AsyncFluentIterator}.
   * @example
   * await asyncIterator([1,2]).count(); // 2
   * await AsuyncFluentIterator.empty().count(); 0
   */
  count(): Promise<number> {
    return this.collectTo(new CountCollector());
  }

  /**
   * Returns the minimum element according to the argument {@link Comparator | comparator}.
   *
   * @param comparator The {link Comparator} used to order the elements.
   * @example
   * await asyncIterator([1,2]).min();
   * // 1
   *
   * await asyncIterator(['foo','foobar']).min(
   *    (s1,s2) => s1.length - s2.length
   * );
   * // 'foo'
   (
   * await asyncFluentIterator.empty().min();
   * // undefined
   */
  min(comparator?: Comparator<A>): Promise<A | undefined> {
    return this.collectTo(new MinCollector(comparator));
  }

  /**
   * Returns the maximum element according to the argument {@link Comparator | comparator}.
   *
   * @example
   * await asyncIterator([1,2]).max();
   * // 2
   *
   * await asyncIterator(['foo','foobar']).max(
   *   (s1,s2) => s1.length - s2.length
   * );
   * // 'foobar'

   * await AsyncFluentIterator.empty().max(); // undefined
   */
  max(comparator?: Comparator<A>): Promise<A | undefined> {
    return this.collectTo(new MaxCollector(comparator));
  }

  /**
   * Returns the minimum and maximum element according to the argument {@link Comparator | comparator}.
   *
   * @example
   * await asyncIterator([1,2]).minmax();
   * // { min: 1, max: 2}
   *
   * await asyncIterator(['foo','foobar']).minmax(
   *    (s1,s2) => s1.length - s2.length
   * );
   * // { min: 'foo', max: 'foobar' }

   * await AsyncFluentIterator.empty().minmax();
   // undefined
   */
  minmax(comparator?: Comparator<A>): Promise<MinMax<A> | undefined> {
    return this.collectTo(new MinMaxCollector(comparator));
  }

  /**
   * Returns a Promise of the last element of this {@link AsyncFluentIterator}
   *
   * @example
   * await asyncIterator([1,2]).last();
   * // 2
   *
   * await AsyncFluentIterator.empty().last()
   * // undefined
   */
  last(): Promise<A | undefined> {
    return this.collectTo(new LastCollector());
  }

  /**
   * Joins items of this {@link AsyncFluentIterator} into a string.
   *
   * @param separator string used to delimite elements
   * @param prefix string used to prefix the resulting string
   * @param prefix string used to suffix the resulting string
   *
   * @example
   *
   * await asyncIterator([1,2,3]).join(',','[',']');
   * // "[1,2,3]"
   *
   * @remarks
   * The items are converted into a string using string-interpolation.
   */
  join(separator?: string, prefix?: string, suffix?: string): Promise<string> {
    return this.collectTo(new StringJoiner(separator, prefix, suffix));
  }

  /**
   * Returns a `Promise` of a `Map` where keys are the result of applying the parameter {@link EventualMapper | mapper} to the elements of the
   * this {@link AsyncFluentIterator} and the values are Arrays of
   * the elements that are mapped to the same key.

   * @param mapper The {@link EventualMapper} used to group items.
   * @example
   * await asyncIterator([1,2,3]).groupBy(x => x % 2 === 0);
   // Map { true => [2], false => [1, 3]}
   */
  groupBy<K>(mapper: EventualMapper<A, K>): Promise<Map<K, A[]>> {
    return this.groupBy2(async a => [await mapper(a), a]);
  }

  /**
   * Returns a `Promise` of a `Map` where entries are the result of applying the parameter {@link EventualMapper | mapper} to the elements of the
   * this {@link AsyncFluentIterator},

   * @param mapper The {@link EventualMapper} used to group items.
   * @example
   * await asyncIterator([1,2,3]).groupBy2(x => [x % 2 === 0, 2 * x];
   // Map { true => [4], false => [2, 6]}
   */
  groupBy2<K, V>(mapper: EventualMapper<A, [K, V]>): Promise<Map<K, V[]>> {
    return this.map(mapper).collectTo(new GroupByCollector());
  }

  /**
   * Returns a `Promise` of a `Map` of the count of the occurences of each items of
   * this {@link AsyncFluentIterator},

   * @example
   * await asyncIterator([foo','bar','foo']).tally();
   // Map { 'foo' => 2, bar => 1 }
   */
  tally(): Promise<Map<A, number>> {
    return this.collectTo(new TallyCollector());
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consiting of
   * partitions (arrays) of at most `size` elements.
   *
   * @param size The size of the partitions.
   *
   * @example
   * asyncIterator([1, 2, 3, 4, 5]).partition(2);
   * // asynchronously yields [1, 2], [3, 4], [5]
   *
   * @remarks The last partition may contain less than `size` elements but is
   * never empty.
   */
  partition(size: number): AsyncFluentIterator<A[]> {
    return new AsyncFluentIterator(Iterators.partition(this.iter, size));
  }

  /**
   * Returns a new {@link AsyncFluentIterator} consisting of distinct elements from this iterator.
   *
   * @param mapper Used to determine distinctness of elements. Default to <code>identity</code>
   *
   * @example
   * await asyncIterator([1,2,2,3,1,4]).distinct().collect();
   * [1,2,3,4]
   *
   * await asyncIterator ([1,2,2,3,1,4], x => x %2).distinct().collect();
   * [1,2]
   */
  distinct<K = A>(mapper?: EventualMapper<A, K>): AsyncFluentIterator<A> {
    return new AsyncFluentIterator(Iterators.distinct(this.iter, mapper));
  }

  /**
   * Used to make this {@link AsyncFluentIterator} being seen as an
   * `AsyncIterable<A>`. This allows them to be used in APIs expecting an
   * `AsyncIterable<A>`
   */
  [Symbol.asyncIterator](): AsyncIterator<A> {
    return this.iter;
  }

  /**
   * Used to make this {@link AsyncFluentIterator} being seen as an
   * `AsyncIterator<A>`.  This allows {@link AsyncFluentIterator} objects to be
   * used in APIs expecting an `AsyncIterator<A>`
   */
  next(): Promise<IteratorResult<A>> {
    return this.iter.next();
  }
}

/**
 * Alias for {@link AsyncFluentIterator.empty}
 */
export function asyncEmptyIterator<A = never>(): AsyncFluentIterator<A> {
  return AsyncFluentIterator.empty();
}

/**
 * Alias for {@link AsyncFluentIterator.from}
 */
export function asyncIterator<A>(generator: AsyncIteratorGenerator<A>): AsyncFluentIterator<A> {
  return AsyncFluentIterator.from(generator);
}

/**
 * Alias for {@link AsyncFluentiterator.singleton}
 */
export function asyncSingletonIterator<A>(a: A): AsyncFluentIterator<A> {
  return AsyncFluentIterator.singleton(a);
}
