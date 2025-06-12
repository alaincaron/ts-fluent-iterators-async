import { Collector } from 'ts-fluent-iterators';

/**
 * An `AsyncCollector` is an object that asynchronously collects elements of type `A` and aggregates them into an object of type `B`.
 * @typeParam A the type of elements being collected.
 * @typeParam B the type of the aggregated object.
 */
export interface AsyncCollector<A, B> {
  /**
   * Collects an element.
   * @param a The element being collected.
   */
  collect(a: A): Promise<void>;

  /**
   * Returns the aggregated object.
   * @returns The aggregated object resulting from collecting all objects
   */
  get result(): B;
}

/**
 * A `Collector` or an `AsyncCollector`.
 */
export type EventualCollector<A, B> = Collector<A, B> | AsyncCollector<A, B>;
