import { Map } from '@gamedevfox/katana';
import { expect } from 'chai';

import { Broker } from './broker';

describe('Broker', () => {
  it('should work', done => {
    const systemMap = Map({
      ALPHA: () => 'alpha',
      BETA: num => `beta:${num}`,
    });

    const broker = Broker();
    broker.bindGetSystem((systemId, cb) => {
      const system = systemMap(systemId);
      cb(system);
    });

    broker.pullWithId('BETA', ([beta, pullId]) => {
      beta(123).should.equal('beta:123');
      beta(456).should.equal('beta:456');

      broker.release(pullId);

      expect(() => {
        beta(789);
      }).to.throw();

      done();
    });
  });
});
