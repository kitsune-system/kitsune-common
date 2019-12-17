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
});
