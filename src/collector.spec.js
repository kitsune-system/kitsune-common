import { copies, namedCopies } from '@gamedevfox/katana';
import { fake } from 'sinon';

import { Bucket } from './bucket';
import { Collector, ListCollector } from './collector';

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

  it('list example', () => {
    const collect = ListCollector();

    const first = collect();
    const another = collect('names-are-ignored');
    const last = collect();

    first(1);

    const bucket = Bucket();
    collect.done(bucket);

    bucket.empty().should.deep.equal([]);

    last(123);
    bucket.empty().should.deep.equal([]);

    another('one');
    bucket.empty().should.deep.equal([[1, 123, 'one']]);
  });

  it('example with copies', () => {
    const collector = ListCollector();
    const collectors = copies(3, collector);

    const check = () => collectors.shift()();

    const bucket = Bucket();
    collector.done(bucket);

    check();
    bucket.empty().should.deep.equal([]);

    check();
    bucket.empty().should.deep.equal([]);

    check();
    bucket.empty().should.deep.equal([[undefined, undefined, undefined]]);
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

  it('lateName', () => {
    const collect = Collector();

    const first = collect('first');
    const another = collect('earlyName');
    const last = collect();

    first(1);

    const myFake = fake();
    collect.done(myFake);

    myFake.args.should.deep.equal([]);

    last('lateName', 123);
    myFake.args.should.deep.equal([]);

    another('overrideEarlyName', 'one');
    myFake.args.should.deep.equal([[{
      first: 1, lateName: 123, overrideEarlyName: 'one',
    }]]);
  });
});
