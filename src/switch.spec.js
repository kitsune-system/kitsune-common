import { copies } from '@gamedevfox/katana';

import { Bucket } from './bucket';
import { Collector } from './collector';
import { Switch } from './switch';

describe('Switch', () => {
  it('should work', () => {
    const sw = Switch();

    const collect = Collector();
    sw.path(value => value !== null && value % 2 === 0, collect('outEven'));
    sw.path(value => value < 0, collect('outNegative'));
    sw.path(value => value > 0 && value < 10, collect('outSmall'));
    sw.path(value => value >= 10, collect('outLarge'));
    sw.path(value => value > 0, collect('outPositive'));

    collect.done(({ outEven, outNegative, outSmall, outLarge, outPositive }) => {
      const [evenBucket, negativeBucket, smallBucket, largeBucket, positiveBucket, defaultBucket] = copies(6, () => Bucket());

      outEven(evenBucket);
      outNegative(negativeBucket);
      outSmall(smallBucket);
      outLarge(largeBucket);
      outPositive(positiveBucket);
      sw.onDefault(defaultBucket);

      sw.input('missing');

      for(let i = -5; i < 15; i++) {
        sw.value(i);
        sw.input(i);
      }

      sw.value('invalid');
      sw.input('another one');

      evenBucket.empty().should.deep.equal([-4, -2, 0, 2, 4, 6, 8, 10, 12, 14]);
      negativeBucket.empty().should.deep.equal([-5, -4, -3, -2, -1]);
      smallBucket.empty().should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      largeBucket.empty().should.deep.equal([10, 11, 12, 13, 14]);
      positiveBucket.empty().should.deep.equal([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]);
      defaultBucket.empty().should.deep.equal(['missing', 'another one']);
    });
  });
});
