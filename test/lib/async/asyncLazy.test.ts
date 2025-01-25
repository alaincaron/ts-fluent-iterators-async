import { expect } from 'chai';
import { Either, Failure, Maybe, None, Try } from 'ts-fluent-iterators';
import { asyncLazy } from '../../../src';
import { providerError, shouldThrow } from '../helpers';

describe('AsyncLazy', () => {
  it('it should invoke the provider only once', async () => {
    let count = 0;
    const provider = () => ++count;
    const v = asyncLazy(provider);
    expect(v.evaluated()).to.be.false;
    expect(await v.value()).equal(1);
    expect(v.evaluated()).to.be.true;
    expect(await v.value()).equal(1);
    expect(count).equal(1);
  });

  it('it should apply the mapping', async () => {
    const v = asyncLazy(() => 2);
    const v2 = v.map(x => x + 1);
    expect(v2.evaluated()).to.be.false;
    expect(await v2.value()).equal(3);
  });

  it('should handle flatMap', async () => {
    const v = asyncLazy(() => 2);
    const v2 = v.flatMap(x => asyncLazy(() => x + 5));
    expect(v.evaluated()).to.be.false;
    expect(v2.evaluated()).to.be.false;
    expect(await v2.value()).equal(7);
  });

  it('should handle errors correctly', async () => {
    const e = new Error();
    const v = asyncLazy<number>(providerError(e));
    expect(v.evaluated()).to.be.false;
    await shouldThrow(() => v.value(), e);
    await shouldThrow(() => v.map(x => x + 2).value(), e);
    await shouldThrow(() => v.flatMap(x => asyncLazy(() => x + 2)).value(), e);
    expect(await v.toTry()).to.deep.equal(new Failure(e));
    expect(await v.toEither()).to.deep.equal(Either.left(e));
    expect(await v.toMaybe()).equal(None);
  });

  it('should convert to Monads correctly', async () => {
    const v = asyncLazy(() => 2);
    expect(await v.toTry()).to.deep.equal(Try.create(() => 2));
    expect(await v.toEither()).to.deep.equal(Either.right(2));
    expect(await v.toMaybe()).to.deep.equal(Maybe.of(2));
  });

  it('should handle simultaneous calls', async () => {
    const v = asyncLazy(() => 2);
    const promises = Array.from({ length: 10 }, () => v.value());
    expect(await Promise.all(promises)).to.deep.equal(Array.from({ length: 10 }, () => 2));
  });
});
