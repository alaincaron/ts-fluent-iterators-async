import { EventualMapper } from '../utils';

export function compose<T, R, V>(f: EventualMapper<T, R>, g: EventualMapper<R, V>): EventualMapper<T, V> {
  return t => {
    const r = f(t);
    return r instanceof Promise ? r.then(g) : g(r);
  };
}
