import { Agent } from '../experimental/agent';

import { INNER_MAP, INPUT, OUTER_MAP, OUTPUT, PASSIVE } from '../experimental/interface-graph';

import { connect, connectAsync } from './duplex';
import { DuplexAgent, DuplexAgentSource } from './duplex-agent';
import { DuplexPair } from './duplex-pair';
import { DuplexRequest, DuplexResponse } from './duplex-request';

const alpha = ({ input: value, onOutput }) => {
  onOutput(`ALPHA: ${value}`);
};

const systemMap = {
  ALPHA: alpha, // INPUT
  BETA: value => `BETA: ${value}`, // OUTPUT
};

const activeMap = {
  ALPHA: PASSIVE,
};

const interfaceMap = {
  ALPHA: INNER_MAP,
};

const inverseInterfaceMap = {
  [OUTPUT]: INPUT, // ACTIVE
  [INPUT]: OUTPUT, // PASSIVE
  [OUTER_MAP]: INNER_MAP, // ACTIVE
  [INNER_MAP]: OUTER_MAP, // PASSIVE
};

const channelInterfaceAdapters = {
  [OUTPUT]: channel => channel.send,
  [INPUT]: channel => channel.onOutput,
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
  it('should work', done => {
    const agent = buildAgent();

    agent.pull({
      input: 'ALPHA',
      onOutput: system => {
        system({ input: 'hello', onOutput: result => {
          result.should.equal('ALPHA: hello');
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
