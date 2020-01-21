import { Pipe, noOp } from '@gamedevfox/katana';

import { early } from '../early-io';
import { WatchAndWait } from '../watch-and-wait';

import { activeInterfaceMap } from './active-interface-map';
import { Broker } from './broker';
import { duplexSystemMap } from './duplex-systems';

const BROKER_CHANNEL = 'BROKER_CHANNEL';

export const inverseInterfaceMap = {
  INPUT: 'OUTPUT',
  OUTPUT: 'INPUT',
  OUTER_MAP: 'INNER_MAP',
  INNER_MAP: 'OUTER_MAP',
};

const inverseDuplexSystemMap = {};
Object.entries(duplexSystemMap).forEach(([key, value]) => {
  const inverseType = inverseInterfaceMap[key];
  inverseDuplexSystemMap[inverseType] = value;
});

// FIX: This definatly needs to be refactored
export const DuplexBroker = ({ channels }) => {
  const [getInterface, bindGetInterface] = Pipe();
  const buildMapProxy = inverse => {
    const map = inverse ? inverseDuplexSystemMap : duplexSystemMap;

    return systemId => {
      const face = getInterface(systemId);
      return map[face];
    };
  };

  const mapProxy = buildMapProxy(false);
  const mapInverseProxy = buildMapProxy(true);

  const [watch, waitFor] = WatchAndWait(channel => channel.id);

  let [pull, bindPull] = Pipe();
  bindPull = early(bindPull);

  const [brokerPull, bindBrokerPull] = Pipe();
  bindBrokerPull(noOp);

  const onPull = systemId => {
    brokerPull(systemId, localSystem => {
      // If success, open up a channel
      channels.open(systemId, channel => {
        const channelToSystem = mapInverseProxy(systemId);
        const remoteSystem = channelToSystem(channel);

        const face = getInterface(localSystem.id);
        const isActive = activeInterfaceMap[face];

        const [activeSystem, passiveSystem] = isActive ?
          [localSystem, remoteSystem] : [remoteSystem, localSystem];

        activeSystem(passiveSystem);
      });

      // FIXME: Otherwise, trigger some error TODO
    });
  };

  // FIXME: BROKER_CHANNEL gets open twice in this configuration...
  channels.open(BROKER_CHANNEL, brokerChannel => {
    bindPull((systemId, cb = noOp) => {
      brokerChannel.send(systemId);

      waitFor(systemId, channel => {
        const channelToSystem = mapProxy(systemId);
        const system = channelToSystem(channel);

        cb(system);
      });
    });
  });

  channels.onOpen(channel => {
    const systemId = channel.id;

    if(systemId === BROKER_CHANNEL)
      channel.onMessage(onPull);
    else
      watch(channel);
  });

  const broker = Broker();
  broker.bindGetSystem(pull);

  return { ...broker, bindBrokerPull, bindGetInterface };
};
