import { copies } from '@gamedevfox/katana';

import { Async } from './async';
import { ListCollector } from './collector';

describe('Async', () => {
  it('should work', done => {
    const collect = ListCollector();

    const [collectA, collectB] = copies(2, collect);
    collect.done(() => done());

    const system = Async();

    let value = 123;

    system.onOutput(newValue => {
      value = newValue;
      value.should.equal(456);
      collectA();
    });

    system.input(456);

    value.should.equal(123);
    collectB();
  });
});
