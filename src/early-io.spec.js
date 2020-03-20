import { Bucket } from './bucket';
import { early } from './early-io';
import { Pipe } from './pipe';

describe('early(output)', () => {
  it('should work', () => {
    let [input, output] = Pipe();
    output = early(output);

    input(1);
    input(2);
    input(3);

    const bucket = Bucket();
    output(bucket);
    bucket.empty().should.deep.equal([1, 2, 3]);

    input(4);
    bucket.empty().should.deep.equal([4]);

    input(5);
    bucket.empty().should.deep.equal([5]);
  });
});
