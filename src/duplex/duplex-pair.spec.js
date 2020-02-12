import { Bucket } from '../bucket';

import { DuplexPair } from './duplex-pair';

describe('DuplexPair', () => {
  it('should work', () => {
    const [duplexA, duplexB] = DuplexPair();

    const bucketA = Bucket();
    duplexA.onMessage(bucketA);

    const bucketB = Bucket();
    duplexB.onMessage(bucketB);

    [1, 2, 3].forEach(value => duplexA.send(value));
    [4, 5, 6, 7].forEach(value => duplexB.send(value));

    bucketA.empty().should.deep.equal([4, 5, 6, 7]);
    bucketB.empty().should.deep.equal([1, 2, 3]);
  });
});
