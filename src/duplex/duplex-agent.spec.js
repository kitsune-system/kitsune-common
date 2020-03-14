import { Pipe } from '@gamedevfox/katana';

import { Agent } from '../agent';
import { ACTIVE, INNER_MAP, INPUT, OUTER_MAP, OUTPUT, PASSIVE } from '../experimental/interface-graph';

import { connect, connectAsync } from './duplex';
import { DuplexAgent, DuplexAgentSource } from './duplex-agent';
import { DuplexPair } from './duplex-pair';
import { DuplexRequest, DuplexResponse } from './duplex-request';

const [callBeta, beta] = Pipe();
const [callDelta, delta] = Pipe();
const [omega, onOmega] = Pipe();

const systemMap = {
  ALPHA: ({ input: value, onOutput }) => onOutput(`ALPHA: ${value}`),
  BETA: beta,
  DELTA: delta,
  OMEGA: omega,
};

const activeMap = {
  ALPHA: PASSIVE,
  BETA: ACTIVE,
  DELTA: ACTIVE,
  OMEGA: PASSIVE,
};

const interfaceMap = {
  ALPHA: INNER_MAP,
  BETA: OUTER_MAP,
  DELTA: OUTPUT,
  OMEGA: INPUT,
};

const inverseInterfaceMap = {
  [OUTPUT]: INPUT,
  [INPUT]: OUTPUT,
  [OUTER_MAP]: INNER_MAP,
  [INNER_MAP]: OUTER_MAP,
};

const channelInterfaceAdapters = {
  [OUTPUT]: channel => channel.onMessage,
  [INPUT]: channel => channel.send,
  [OUTER_MAP]: channel => {
    const response = DuplexResponse();
    connect(channel, response);

    return response;
  },
  [INNER_MAP]: channel => {
    const request = DuplexRequest();
    connect(channel, request);

    return request;
  },
};

const buildAgent = () => {
  const [duplexA, duplexB] = DuplexPair();

  const agent = DuplexAgent();
  const source = DuplexAgentSource();
  const sourceAgent = Agent();

  // FIXME: Can this work synchronously?
  connectAsync(agent, duplexA);
  connectAsync(duplexB, source);

  agent.onChannelToSystem(({ systemId, channel, onOutput }) => {
    const face = interfaceMap[systemId];

    const adapter = channelInterfaceAdapters[face];
    const channelSystem = adapter(channel);
    onOutput(channelSystem);
  });

  source.onChannelToSystem(({ systemId, channel, onOutput }) => {
    const baseFace = interfaceMap[systemId];
    const face = inverseInterfaceMap[baseFace];

    const adapter = channelInterfaceAdapters[face];
    const channelSystem = adapter(channel);
    onOutput(channelSystem);
  });

  source.onGetActivityType(({ input: systemId, onOutput, onError }) => {
    if(!(systemId in activeMap)) {
      onError({ type: 'cantDetermineActivityType', systemId });
      return;
    }

    onOutput(activeMap[systemId]);
  });

  source.onPull(sourceAgent.pull);
  source.onRelease(sourceAgent.release);
  sourceAgent.onRelease(source.release);

  sourceAgent.onResolve(({ input: systemId, onOutput, onError }) => {
    if(!(systemId in systemMap)) {
      onError({ type: 'systemNotFound', systemId });
      return;
    }

    const system = systemMap[systemId];
    onOutput(system);
  });

  return agent;
};

describe('DuplexAgent', () => {
  it('should work with OUTPUT system', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'DELTA',
      onOutput: delta => {
        delta(value => {
          value.should.deep.equal(123);
          done();
        });

        callDelta(123);
      },
      onError: () => {
        throw new Error('Should not fail');
      },
    });
  });

  it('should work with INPUT system', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'OMEGA',
      onOutput: omega => {
        onOmega(value => {
          value.should.equal(456);
          done();
        });

        omega(456);
      },
      onError: error => {
        console.log('E', error);
        throw new Error('Should not fail');
      },
    });
  });

  it('should work with INNER_MAP system', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'ALPHA',
      onOutput: alpha => {
        alpha({ input: 'hello', onOutput: result => {
          result.should.equal('ALPHA: hello');
          done();
        } });
      },
      onError: () => {
        throw new Error('Should not fail');
      },
    });
  });

  it('should work with OUTER_MAP system', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'BETA',
      onOutput: beta => {
        beta(({ input: name, onOutput }) => onOutput(`Call me: ${name}`));
        callBeta({ input: 'Peter', onOutput: result => {
          result.should.equal('Call me: Peter');
          done();
        } });
      },
      onError: () => {
        throw new Error('Should not fail');
      },
    });
  });

  it('should throw same errors as upstream agent', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'MISSING_SYSTEM',
      onOutput: () => {
        throw new Error('Should not succeed');
      },
      onError: error => {
        error.should.deep.equal({ type: 'systemNotFound', systemId: 'MISSING_SYSTEM' });
        done();
      },
    });
  });
});
