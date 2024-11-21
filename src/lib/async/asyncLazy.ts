import { Lazy, Try, Mapper, Failure, Success } from 'ts-fluent-iterators';
import { EventualMapper, EventualProvider } from '../utils';

enum State {
  INITIAL,
  WAITING,
  READY,
}

export abstract class AsyncTry {
  private constructor() {}
  static async create<T>(f: EventualProvider<T | Try<T>>): Promise<Try<T>> {
    try {
      const t = await f();
      return t instanceof Try ? t : new Success(t);
    } catch (e) {
      return new Failure(e) as Try<T>;
    }
  }
}

/**
 * Represents a lazy-evaluated value that is computed only when needed.
 * @class Lazy
 * @template T - The type of the value.
 */
export class AsyncLazy<T> {
  /**
   * State indicating the evaluation of the value
   * @private
   */
  private state = State.INITIAL;

  /**
   * Resolvers for promises waiting to be resolved
   * @private
   */
  private resolvers: Mapper<Try<T>, void>[] = [];
  /**
   * The computed value, stored after evaluation.
   */
  private holder?: Try<T>;

  /**
   * Private constructor to create an instance of `Lazy`.
   * @private
   * @constructor
   * @param {AsyncProver<T>} provider - The function representing the lazy provider.
   */
  private constructor(private readonly provider: EventualProvider<T | Try<T>>) {}

  /**
   * Static method to create an instance of `Lazy`.
   * @template T - The type of the value.
   * @param {AsynProvider<T>} provider - The function representing the lazy provider.
   * @returns {Lazy<T>} An instance of Lazy.
   */
  static create<T>(provider: EventualProvider<T | Try<T>>): AsyncLazy<T> {
    return new AsyncLazy<T>(provider);
  }

  /**
   * Maps the computed value to a new value using the provided function.
   * @paramType R - The type of the result after applying the function.
   * @param {Mapper<T,R>} mapper - The function to apply to the computed value.
   * @returns {Lazy<R>} A new instance of Lazy with the transformed value.
   */
  map<R>(mapper: EventualMapper<T, R>): AsyncLazy<R> {
    return new AsyncLazy<R>(async () => mapper(await this.value()));
  }

  flatMap<R>(mapper: EventualMapper<T, AsyncLazy<R> | Lazy<R>>): AsyncLazy<R> {
    return AsyncLazy.create(async () => {
      const result = await mapper(await this.value());
      if (result instanceof AsyncLazy) {
        return result.toTry();
      } else if (result instanceof Lazy) {
        return result.toTry();
      }
      throw new Error('mapper does not return a Lazy or AsyncLazy');
    });
  }

  /**
   * Evaluates and returns the computed value, calculating it only when necessary.
   * @returns {T} The computed value.
   */
  async value(): Promise<T> {
    const t = await this.toTry();
    return t.getOrThrow();
  }

  evaluated(): boolean {
    return this.state === State.READY;
  }

  async toTry(): Promise<Try<T>> {
    switch (this.state) {
      case State.INITIAL: {
        this.state = State.WAITING;
        this.holder = await AsyncTry.create(this.provider);
        this.state = State.READY;

        for (;;) {
          const resolver = this.resolvers.shift();
          if (!resolver) break;
          resolver(this.holder);
        }
        return this.holder;
      }
      case State.WAITING: {
        const promise = new Promise<Try<T>>((resolver, _) => {
          this.resolvers.push(resolver);
        });
        return promise;
      }
      case State.READY:
        return this.holder!;
      default:
        throw new Error(`Invalid value for state: ${this.state}`);
    }
  }

  async toEither() {
    const t = await this.toTry();
    return t.toEither();
  }

  async toMaybe() {
    const t = await this.toTry();
    return t.toMaybe();
  }
}

export function asyncLazy<T>(provider: EventualProvider<T | Try<T>>): AsyncLazy<T> {
  return AsyncLazy.create(provider);
}
