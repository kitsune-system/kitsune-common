import { fake } from 'sinon';

import { Collector } from './collector';

describe('Collector', () => {
  it('should work', () => {
    const collect = Collector();

    const first = collect('first');
    const another = collect('another');
    const last = collect('last');

    first(1);

    const myFake = fake();
    collect(myFake);

    myFake.args.should.deep.equal([]);

    last(123);
    myFake.args.should.deep.equal([]);

    another('one');
    myFake.args.should.deep.equal([[{
      another: 'one', first: 1, last: 123,
    }]]);
  });

  it('should work if all values are already collected', () => {
    const collect = Collector();

    collect('first')(1);
    collect('another')('one');
    collect('last')(123);

    const myFake = fake();
    collect(myFake);
    myFake.args.should.deep.equal([[{
      another: 'one', first: 1, last: 123,
    }]]);
  });
});
