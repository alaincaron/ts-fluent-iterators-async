import { assert, expect } from 'chai';
import { BinaryMapper, Mapper, Predicate, Provider, Reducer } from 'ts-fluent-iterators';
import { EventualProvider } from '../../src';

export async function shouldThrow(f: EventualProvider<unknown>, expectedError?: any) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    await f();
    assert.fail('Should have thrown.');
  } catch (err) {
    if (expectedError) {
      if (typeof expectedError === 'function') {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(expectedError(err)).to.be.true;
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-expressions
        expect(err).equal(expectedError);
      }
    }
  }
}

export function providerError<T>(err?: unknown): Provider<T> {
  return () => {
    throw err ?? new Error();
  };
}

export function mapperError<A, B>(err?: unknown): Mapper<A, B> {
  return (_: A) => {
    throw err ?? new Error();
  };
}

export function binaryMapperError<A, B, C>(err?: unknown): BinaryMapper<A, B, C> {
  return (_a: A, _b: B) => {
    throw err ?? new Error();
  };
}

export function reducerError<A, B>(err?: unknown): Reducer<A, B> {
  return (_b: B, _a: A) => {
    throw err ?? new Error();
  };
}

export function predicateError<A>(err?: unknown): Predicate<A> {
  return mapperError(err);
}
