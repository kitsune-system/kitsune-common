import { Pipe } from '@gamedevfox/katana';

import { Bucket } from './bucket';
import { WatchAndWait } from './watch-and-wait';

describe('WatchAndWait', () => {
  it('should work', () => {
    const bob = { name: 'bob', age: 34 };
    const sally = { name: 'sally', age: 24 };
    const xavier = { name: 'xavier', age: 45 };

    const [input, output] = Pipe();
    const [watch, waitFor] = WatchAndWait(x => x.name);

    output(watch);

    const bucket = Bucket();
    waitFor('sally', bucket);
    waitFor('xavier', bucket);

    input(bob);
    bucket.empty().should.deep.equal([]);

    input(sally);
    bucket.empty().should.deep.equal([sally]);

    input(xavier);
    bucket.empty().should.deep.equal([xavier]);

    // No repeats
    input(xavier);
    bucket.empty().should.deep.equal([]);

    input(sally);
    bucket.empty().should.deep.equal([]);
  });
});
