import { Pipe } from '@gamedevfox/katana';

import { chain } from '../chain';
import { Collector } from '../collector';
import { ACTIVE } from '../experimental/interface-graph';
import { WatchAndWait } from '../watch-and-wait';

import { DuplexChannels } from './duplex-channels';

export const AGENT_CHANNEL = '8HDvxDQc38MeRy3as5M/tNdffMKI9YQ8q/txD2r+ezs=';

export const DuplexAgent = () => {
  const [fireRelease, onRelease] = Pipe();
  const [error, onError] = Pipe();

  const [watch, waitFor] = WatchAndWait(response => response.systemId);

  const onAgentMessage = message => {
    const { type, systemId } = message;

    if(type === 'RELEASE')
      fireRelease(systemId);
    else if(type === 'PULL_ERROR')
      watch({ type: 'ERROR', systemId, error: message.error });
    else
      error({ type: 'invalidAgentMessageType', message });
  };

  const channels = DuplexChannels();

  // FIXME: Memoize this
  let agentChannel = null;
  const getAgentChannel = onOutput => {
    if(agentChannel)
      onOutput(agentChannel);
    else {
      channels.open({
        input: AGENT_CHANNEL,
        onOutput: channel => {
          agentChannel = channel;

          channel.onMessage(onAgentMessage);
          onOutput(channel);
        },
      });
    }
  };

  const [channelToSystem, onChannelToSystem] = Pipe();

  channels.onOpen(channel => {
    if(channel.id !== AGENT_CHANNEL)
      watch({ type: 'SUCCESS', systemId: channel.id, channel });
  });

  const pull = ({ input: systemId, onOutput, onError }) => {
    waitFor(systemId, response => {
      const { type } = response;

      if(type === 'SUCCESS') {
        const { channel } = response;
        channelToSystem({ systemId, channel, onOutput });
      } else if(type === 'ERROR')
        onError(response.error);
      else
        error({ type: 'invalidPullResponseType', response });
    });

    getAgentChannel(channel => {
      channel.send({ type: 'PULL', systemId });
    });
  };

  const release = systemId => {
    getAgentChannel({ type: 'RELEASE', systemId });
  };

  return {
    send: channels.send, onMessage: channels.onMessage, // Upstream
    pull, release, onRelease, // Downstream
    onError, onChannelToSystem, // Bindings
  };
};

export const DuplexAgentSource = () => {
  const systems = {};

  const channels = DuplexChannels();

  const [pull, onPull] = Pipe();
  const onRelease = () => {};
  const release = () => {};

  const [getActivityType, onGetActivityType] = Pipe();
  const [channelToSystem, onChannelToSystem] = Pipe();

  let agentChannel;
  const onAgentMessage = msg => {
    const sendError = error => agentChannel.send({ type: 'PULL_ERROR', systemId, error });

    const { type, systemId } = msg;

    if(type === 'PULL') {
      const collect = Collector();

      const channelSystemC = collect('channelSystem');
      chain(
        ({ onOutput }) => {
          pull({ input: systemId, onOutput, onError: sendError });
        },
        ({ input: system, onOutput }) => {
          collect('pullSystem')(system);
          getActivityType({ input: systemId, onOutput: collect('activityType'), onError: sendError });

          systems[systemId] = system;
          channels.open({ input: systemId, onOutput: out => {
            onOutput(out);
          } });
        },
        ({ input: channel }) => channelToSystem({ systemId, channel, onOutput: channelSystemC }),
      );

      collect.done(({ activityType, channelSystem, pullSystem }) => {
        const [active, passive] = activityType === ACTIVE ? [pullSystem, channelSystem] : [channelSystem, pullSystem];
        active(passive);
      });
    }
  };

  channels.onOpen(channel => {
    // Ignore non-agent channels
    if(channel.id === AGENT_CHANNEL) {
      agentChannel = channel;
      channel.onMessage(onAgentMessage);
    }
  });

  return {
    onPull, onRelease, release, // Upstream
    send: channels.send, onMessage: channels.onMessage, // Upstream
    onChannelToSystem, onGetActivityType,
  };
};
