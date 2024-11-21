import * as AsyncFunctions from '../functions';
import { Functor, Functions } from 'ts-fluent-iterators';
import { Eventually, EventualMapper } from '../utils';

export type EventualFunctorLike<T, R> = AsyncFunctor<T, R> | Functor<T, R> | EventualMapper<T, R>;

export abstract class AsyncFunctor<T, R> {
  abstract eval(t: T): Eventually<R>;

  get f(): EventualMapper<T, R> {
    return this.eval.bind(this);
  }

  andThen<V>(after: EventualFunctorLike<R, V>): AsyncFunctor<T, V> {
    return AsyncFunctionalFunctor.from(AsyncFunctions.compose(this.f, AsyncFunctor.getFunction(after)));
  }

  compose<V>(before: EventualFunctorLike<V, T>): AsyncFunctor<V, R> {
    return AsyncFunctionalFunctor.from(AsyncFunctions.compose(AsyncFunctor.getFunction(before), this.f));
  }

  static identity<T>(): AsyncFunctor<T, T> {
    return IDENTITY_OPERATOR as AsyncFunctor<T, T>;
  }

  static from<T, R = T>(f: EventualMapper<T, R>): AsyncFunctor<T, R> {
    return new AsyncFunctionalFunctor(f);
  }

  static getFunction<T, R = T>(mapper: EventualFunctorLike<T, R>): EventualMapper<T, R> {
    if (typeof mapper === 'function') return mapper;
    return mapper.f;
  }
}

class AsyncFunctionalFunctor<T, R = T> extends AsyncFunctor<T, R> {
  private readonly _f: EventualMapper<T, R>;
  constructor(f: EventualMapper<T, R>) {
    super();
    this._f = f;
  }

  eval(t: T): Eventually<R> {
    return this._f(t);
  }

  get f() {
    return this._f;
  }
}

const IDENTITY_OPERATOR = new AsyncFunctionalFunctor(Functions.identity());
