import { Mapper, IteratorGenerator } from 'ts-fluent-iterators';

/**
 * Represents a value of type `A` or `Promise<A>`.
 */
export type Eventually<A> = A | Promise<A>;

/**
 * A function mapping a value of type `A` to type `Eventually<B>`
 * @typeParam A the source type on which the `EventualMapper` is applied.
 * @typeParam B the target type
 */
export type EventualMapper<A, B> = Mapper<A, Eventually<B>>;

/**
 * A function that provides an eventual value of type `A`
 * @typeParam A the type of elements being provided
 **/
export type EventualProvider<A> = () => Eventually<A>;

/**
 * An eventual BinaryMapper
 * @typeParam A the type of the first operand
 * @typeParam B the type of the second operand
 * @typeParam the type of the result
 */
export type EventualBinaryMapper<A, B, C> = (a: A, b: B) => Eventually<C>;

/**
 * A predicate that can be synchronous or asynchronous.
 */
export type EventualPredicate<A> = Mapper<A, Eventually<boolean>>;

/**
 * An eventual `Reducer`. Used for asynchronous `fold` and `reduce` operations.
 * @typeParam A Type of elements being reduced
 * @typeParam B Type into which the elements are being reduced to.
 * @param acc The current value of the accumulator
 * @param a The current value to reduce
 */
export type EventualReducer<A, B> = EventualBinaryMapper<B, A, B>;

/**
 * An `Iterator` that maybe asynchronous.
 * @typeParam A the type of objects being iterated on.
 */
export type EventualIterator<A> = Iterator<A> | AsyncIterator<A>;

/**
 * An `Iterable` that maybe asynchronous.
 * @typeParam A the type of objects being iterated on.
 */
export type EventualIterable<A> = Iterable<A> | AsyncIterable<A>;

/**
 * An `IterableIterator` that maybe asynchronous.
 * @typeParam A the type of objects being iterated on.
 */
export type EventualIterableIterator<A> = IterableIterator<A> | AsyncIterableIterator<A>;

/**
 * An interface used to asynchronously generate arrays from `length` and `seed`
 * @typeParam E the type of the objects in the generated `Array`
 *
 */
export interface AsyncArrayGenerator<E> {
  /**
   * The number of items to generate.
   */
  length: number;

  /**
   * Generates the entry in the array.
   */
  seed: AsyncIteratorLike<E>;
}

/**
 * An object that behaves like an `AsyncIterator`.
 * @typeParam E the type of the objects that can be iterated on
 */
export type AsyncIteratorLike<E> = EventualMapper<number, E> | AsyncIterator<E> | AsyncIterable<E> | Iterable<E>;

/**
 * An object that can generate an asynchronous iterator.
 * @typeParam E the type of the objects that can be iterated on
 */
export type AsyncIteratorGenerator<E> = AsyncArrayGenerator<E> | AsyncIteratorLike<E>;

/**
 * An object that can generate a synchronous or asynchronous iterator.
 * @typeParam E the type of the objects that can be iterated on
 */
export type EventualIteratorGenerator<E> = IteratorGenerator<E> | AsyncGenerator<E>;
