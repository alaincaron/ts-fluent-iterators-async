import { expect } from 'chai';
import { asyncIterator as iterator } from '../../../src/lib/async/asyncFluentIterator';
import { loop, range, repeat } from '../../../src/lib/async/asyncGenerators';

describe('AsyncGenerators', () => {
  describe('range', () => {
    it('should yield all elements in the range', async () => {
      expect(await iterator(range(1, 5)).collect()).deep.equal([1, 2, 3, 4]);
    });

    it('should yield elements according to step', async () => {
      expect(await iterator(range(1, 5, 2)).collect()).deep.equal([1, 3]);
    });

    it('should yield no element if end equals start', async () => {
      expect(await iterator(range(1, 1)).collect()).deep.equal([]);
    });

    it('should yield in decreasing order if negative step', async () => {
      expect(await iterator(range(5, 0)).collect()).deep.equal([5, 4, 3, 2, 1]);
    });
  });

  describe('loop', () => {
    it('should yield the exact number of items', async () => {
      expect(await iterator(loop(i => i + 1, 0, 5, 2)).collect()).deep.equal([1, 3, 5]);
    });
    it('should yield powers of 2', async () => {
      expect(await iterator(loop(x => 2 ** x, 0, 5, 1)).collect()).deep.equal([1, 2, 4, 8, 16]);
    });
  });

  describe('repeat', () => {
    it('should yield the exact number of items', async () => {
      expect(await iterator(repeat(i => i + 1, 5)).collect()).deep.equal([1, 2, 3, 4, 5]);
    });
    it('should yield powers of 2', async () => {
      expect(await iterator(repeat(x => 2 ** x, 5)).collect()).deep.equal([1, 2, 4, 8, 16]);
    });
  });
});
