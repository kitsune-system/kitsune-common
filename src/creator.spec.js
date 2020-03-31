import { CounterIdSource } from './id/counter-id-source';

import { Creator } from './creator';
import { Map } from './map';

const systemBuilders = {
  ALPHA: () => {
    return {
      PORT_A: value => console.log('PORT A:', value),
      PORT_B: ({ input, onOutput }) => onOutput(input * 2),
      PORT_C: ({ onOutput }) => onOutput(Math.random()),
    };
  },
};

const build = () => {
  const system = Creator();

  system.onCreateSystem(({ input: systemId, onOutput }) => {
    let sys;
    if(systemId in systemBuilders)
      sys = systemBuilders[systemId]();
    onOutput(sys);
  });

  const idSource = CounterIdSource();
  system.onCreateId(idSource.get);

  return system;
};

describe('Creator', () => {
  it('should work', done => {
    const system = build();

    const systemMap = Map();
    system.onOutput(({ id, system }) => {
      systemMap.set({ id, value: system });
    });

    system.build({ input: 'ALPHA', onOutput: systemId => {
      systemMap.get({ input: systemId, onOutput: system => {
        system.should.be.an('object');
        Object.keys(system).should.deep.equal(['PORT_A', 'PORT_B', 'PORT_C']);
        done();
      } });
    } });
  });
});
