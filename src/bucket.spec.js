import { Bucket } from './bucket';

describe('Bucket', () => {
  it('should work', () => {
    const bucket = Bucket();
    bucket.empty().should.deep.equal([]);

    bucket('one');
    bucket(2);

    bucket.empty().should.deep.equal(['one', 2]);
    bucket.empty().should.deep.equal([]);

    bucket({ another: 'one' });
    bucket(['final', 'countdown']);
    bucket('last one');

    bucket.empty().should.deep.equal([{ another: 'one' }, ['final', 'countdown'], 'last one']);
    bucket.empty().should.deep.equal([]);
  });

  it('should save undefined when passed no params', () => {
    const bucket = Bucket();

    bucket(1);
    bucket();
    bucket(3);

    bucket.empty().should.deep.equal([1, undefined, 3]);

    bucket(1);
    bucket();
    bucket(3);

    bucket.wideEmpty().should.deep.equal([[1], [], [3]]);
  });

  it('should save undefined for literal undefined', () => {
    const bucket = Bucket();

    bucket(1);
    bucket(undefined);
    bucket(3);

    bucket.empty().should.deep.equal([1, undefined, 3]);

    bucket(1);
    bucket(undefined);
    bucket(3);

    bucket.wideEmpty().should.deep.equal([[1], [undefined], [3]]);
  });

  it('should save first param when passed multiple params', () => {
    const bucket = Bucket();

    bucket(1);
    bucket(2, 3);
    bucket(4, 5, 6);

    bucket.empty().should.deep.equal([1, 2, 4]);

    bucket(1);
    bucket(2, 3);
    bucket(4, 5, 6);

    bucket.wideEmpty().should.deep.equal([[1], [2, 3], [4, 5, 6]]);
  });
});
