import { copies } from '@gamedevfox/katana';

import { Bucket } from '../bucket';
import { Agent } from './agent';

const alpha = value => `ALPHA: ${value}`;

const systemMap = {
  ALPHA: alpha, // INPUT
  BETA: value => `BETA: ${value}`, // OUTPUT
};

const buildAgent = () => {
  const agent = Agent();
  agent.onResolve(({ input: systemId, onOutput, onError }) => {
    if(!(systemId in systemMap)) {
      onError({ type: 'systemNotFound', systemId });
      return;
    }

    const system = systemMap[systemId];
    onOutput(system);
  });

  return agent;
};

describe('Agent', () => {
  it('should work', () => {
    const [outB, releaseB] = copies(3, Bucket);

    const agent = buildAgent();
    agent.onRelease(releaseB);

    agent.pull({ input: 'ALPHA', onOutput: outB });
    let output = outB.empty();
    output.should.deep.equal([alpha]);
    output[0](123).should.equal('ALPHA: 123');

    agent.release('ALPHA');
    releaseB.empty().should.deep.equal(['ALPHA']);

    // Can pull again after releasing
    agent.pull({ input: 'ALPHA', onOutput: outB }); // Now it's OK
    output = outB.empty();
    output.should.deep.equal([alpha]);

    agent.release('ALPHA');
    releaseB.empty().should.deep.equal(['ALPHA']);
  });

  it('should error if system is currently pulled', done => {
    const agent = buildAgent();
    agent.pull({ input: 'ALPHA', onOutput: () => {} });

    agent.pull({
      input: 'ALPHA',
      onOutput: () => {
        throw new Error('Should not succeed');
      },
      onError: error => {
        error.should.deep.equal({ type: 'systemCurrentlyPulled', systemId: 'ALPHA' });
        done();
      },
    });
  });

  it('should error on invalid system', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'INVALID',
      onOutput: () => {
        throw new Error('Should not succeed');
      },
      onError: error => {
        error.should.deep.equal({ type: 'systemNotFound', systemId: 'INVALID' });
        done();
      },
    });
  });
});
