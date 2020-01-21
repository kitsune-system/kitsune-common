import { copies, namedCopies } from '@gamedevfox/katana';
import { fake } from 'sinon';

import { Bucket } from './bucket';
import { Collector } from './collector';

describe('Collector', () => {
  it('should work', () => {
    const collect = Collector();

    const first = collect('first');
    const another = collect('another');
    const last = collect('last');

    first(1);

    const myFake = fake();
    collect.done(myFake);

    myFake.args.should.deep.equal([]);

    last(123);
    myFake.args.should.deep.equal([]);

    another('one');
    myFake.args.should.deep.equal([[{
      another: 'one', first: 1, last: 123,
    }]]);
  });

  it('should work using nameless collectors', () => {
    const collect = Collector();

    const first = collect();
    const another = collect();
    const last = collect();

    first();

    const myFake = fake();
    collect.done(myFake);

    myFake.args.should.deep.equal([]);

    last();
    myFake.args.should.deep.equal([]);

    another();
    myFake.args.should.deep.equal([[{}]]);
  });

  it('should work if all values are already collected', () => {
    const collect = Collector();

    collect('first')(1);
    collect('another')('one');
    collect('last')(123);

    const myFake = fake();
    collect.done(myFake);
    myFake.args.should.deep.equal([[{
      another: 'one', first: 1, last: 123,
    }]]);
  });

  it('example with copies', () => {
    const collector = Collector();
    const collectors = copies(3, collector);

    const check = () => collectors.shift()();

    const bucket = Bucket();
    collector.done(bucket);

    check();
    bucket.empty().should.deep.equal([]);

    check();
    bucket.empty().should.deep.equal([]);

    check();
    bucket.empty().should.deep.equal([{
      0: undefined, 1: undefined, 2: undefined,
    }]);
  });

  it('example use with namedCopies', () => {
    const collector = Collector();
    const collectors = namedCopies(3, collector);

    const bucket = Bucket();
    collector.done(bucket);

    collectors.b();
    bucket.empty().should.deep.equal([]);

    collectors.c();
    bucket.empty().should.deep.equal([]);

    collectors.a();
    bucket.empty().should.deep.equal([{
      a: undefined, b: undefined, c: undefined,
    }]);
  });
});
