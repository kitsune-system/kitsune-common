import { copies, noOp } from '@gamedevfox/katana';

import { Collector } from '../collector';
import { connect } from '../duplex/duplex';
import { DuplexChannels } from '../duplex/duplex-channels';
import { DuplexPair } from '../duplex/duplex-pair';

import { activeInterfaceMap } from './active-interface-map';

import { Client } from './client';
import { Server } from './server';

const DuplexBroker = () => {};

export const interfaceMap = {
  // SERVER
  BIND_MAP_FN: 'OUTER_MAP',
  GET_NAME: 'INNER_MAP',
  ON_ALPHA: 'OUTPUT',
  SEND_CHAT: 'INPUT',

  // CLIENT
  BIND_GET_REMOTE_NAME: 'OUTER_MAP',
  LOG_MESSAGE: 'INPUT',
  MAP_VALUE: 'INNER_MAP',
  ON_CHAT: 'OUTPUT',
  GET_CLIENT_NAME: 'INNER_MAP',
  C2C: 'INPUT',
  C2C_ALPHA: 'INPUT',
  C2C_BETA: 'INPUT',
  BIND_C2C: 'OUTPUT',
};

const buildConnectById = (broker, duplexBroker) => {
  return (remoteSystemId, localSystemId, cb = noOp) => {
    const systemC = Collector();

    duplexBroker.pull(remoteSystemId, systemC('remoteSystem'));
    broker.pull(localSystemId, systemC('localSystem'));

    systemC.done(({ remoteSystem, localSystem }) => {
      const face = interfaceMap[remoteSystemId];
      const isActive = activeInterfaceMap[face];

      const [activeSystem, passiveSystem] = isActive ?
        [remoteSystem, localSystem] : [localSystem, remoteSystem];

      activeSystem(passiveSystem);
      cb();
    });
  };
};

const connectDuplexBroker = (duplex, pull) => {
  const channels = DuplexChannels();
  connect({ duplex, channels });

  const duplexBroker = DuplexBroker();
  duplexBroker.onChannelOpen(channels.open);
  channels.onOpen(duplexBroker.openChannel);
  duplexBroker.bindBrokerPull(pull);
  duplexBroker.bindGetInterface(systemId => interfaceMap[systemId]);

  return duplexBroker;
};

describe.skip('WebSocket', () => {
  it('should work', done => {
    const collect = Collector();
    const [alphaClientDone, betaClientADone, betaClientBDone] = copies(3, () => collect());

    // Server
    const server = Server('test');
    const clientA = Client('test', 'alpha');
    const clientB = Client('test', 'beta');

    const connect = (client, cb = noOp) => {
      const [serverDuplex, clientDuplex] = DuplexPair();

      const serverDuplexBroker = connectDuplexBroker(serverDuplex, server.pull);
      const clientDuplexBroker = connectDuplexBroker(clientDuplex, client.pull);

      // Server
      server.addClientBroker(serverDuplexBroker);

      const serverConnectById = buildConnectById(server, serverDuplexBroker);
      serverConnectById('MAP_VALUE', 'BIND_MAP_FN');
      serverConnectById('LOG_MESSAGE', 'ON_ALPHA');

      // Client
      const connectById = buildConnectById(client, clientDuplexBroker);
      cb(client, connectById);
    };

    // Client Alpha
    connect(clientA, (client, connectById) => {
      connectById('SEND_CHAT', 'ON_CHAT');
      connectById('GET_NAME', 'BIND_GET_REMOTE_NAME', () => {
        client.test(1234);

        console.log('Alpha Done');
        alphaClientDone();
      });
    });

    // Client Beta
    connect(clientB, (client, connectById) => {
      connectById('SEND_CHAT', 'ON_CHAT');
      connectById('GET_NAME', 'BIND_GET_REMOTE_NAME', () => {
        client.test(7890);

        console.log('Beta Client A Done');
        betaClientADone();
      });

      setTimeout(() => {
        connectById('C2C_ALPHA', 'BIND_C2C', () => {
          client.c2cOut('Why hello there...');

          console.log('Beta Client B Done');
          betaClientBDone();
        });
      }, 200);
    });

    collect.done(() => {
      console.log('== DONE ==');
      done();
    });
  });
});
